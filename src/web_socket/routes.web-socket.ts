import WebSocket from 'ws';
import { ConnectionController } from '../connection/connection.controller';
import { Field } from '../field/field.model';
import { GameController } from '../game/game.controller';
import { Game } from '../game/game.model';
import { RoomController } from '../room/room.controller';
import { UserController } from '../user/user.controller';
import { User } from '../user/user.model';
import { createJsonMsg, createJsonMsgData } from '../utils/create-json-message';
import { randomBotAttack } from '../utils/random-bot-attack';
import { Ship } from '../utils/types';

export const webSocketRoutes = async (
  data: WebSocket.RawData,
  ws: WebSocket,
  uc: UserController,
  rc: RoomController,
  cc: ConnectionController,
  gc: GameController,
  connectionId: number,
) => {
  const message = JSON.parse(data.toString());
  let messageData: any;
  const connectionIndex = cc.getConnectionIndexById(connectionId);
  let userId: number;
  userId = cc.connections[connectionIndex].userId;
  let user: User | undefined;
  user = await uc.getUserById(userId);

  let gameId: number;
  let game: Game | undefined;

  let enemyField: Field | undefined;
  let attackResult: string | undefined;

  switch (message.type) {
    case 'reg':
      console.log('reg', message);
      ws.send(await uc.login(new User(message.data), cc, connectionId));
      ws.send(rc.getAvailableRooms());
      cc.getConnections().forEach(async (connection) => {
        connection.webSocket.send(await uc.getWinnersInfo());
      });
      break;

    case 'create_room':
      console.log('create_room', message);
      let newRoom: string = '';

      if (user) {
        newRoom = rc.createNewRoom(user);
        cc.getConnections().forEach(async (connection) => {
          connection.webSocket.send(newRoom);
        });
      }
      break;

    case 'add_user_to_room':
      console.log('add_user_to_room', message);
      messageData = JSON.parse(message.data);
      let roomData: any;

      if (user) {
        roomData = rc.addUserToRoom(user, message.data);
        if (!roomData) return;
      }

      cc.connections.forEach((connection) => {
        connection.webSocket.send(createJsonMsg('update_room', roomData));

        const roomUsers: any = roomData.find(
          (room: any) => room.roomId === messageData.indexRoom,
        ).roomUsers;

        roomUsers.forEach((user: any) => {
          if (connection.userId === user.index) {
            const newGameMessage = gc.createNewGame(user, gameId);
            gameId = JSON.parse(newGameMessage.data).idGame;
            connection.webSocket.send(JSON.stringify(newGameMessage));
          }
        });
      });
      break;

    case 'add_ships':
      console.log('add_ships', message);
      messageData = JSON.parse(message.data);
      gameId = messageData.gameId;
      const field = new Field(
        messageData.indexPlayer,
        messageData.ships as Ship[],
      );
      game = gc.addField(field, gameId);

      if (game && game?.users.length === 2 && game.fields.length === 2) {
        game.turn = game?.fields[0].userId;

        game.fields.forEach((item) => {
          cc.getConnectionByUserId(item.userId)?.webSocket.send(
            createJsonMsg('start_game', {
              ships: item.initData,
              currentPlayerIndex: item.userId,
            }),
          );
        });

        game.fields.forEach((item) => {
          cc
            .getConnectionByUserId(item.userId)
            ?.webSocket.send(
              createJsonMsg('turn', { currentPlayer: game?.fields[0].userId }),
            );
        });
      }

      if (game && game.users.length === 1 && game.fields.length === 1) {
        const botField = new Field(-1, undefined);
        game.fields.push(botField);
        game.turn = game?.fields[0].userId;

        game.fields.forEach((item) => {
          if (item.userId >= 0) {
            cc.getConnectionByUserId(item.userId)?.webSocket.send(
              createJsonMsg('start_game', {
                ships: item.initData,
                currentPlayerIndex: item.userId,
              }),
            );

            cc.getConnectionByUserId(item.userId)?.webSocket.send(
              createJsonMsg('turn', {
                currentPlayer: game?.fields[0].userId,
              }),
            );
          }
        });
      }
      break;

    case 'attack':
      console.log('attack', message);
      messageData = JSON.parse(message.data);
      gameId = messageData.gameId;
      game = gc.getGameById(gameId);

      if (game?.turn !== messageData.indexPlayer) return;

      enemyField = game?.fields.find(
        (item) => item.userId !== messageData.indexPlayer,
      );
      attackResult = enemyField?.checkShot(messageData.x, messageData.y);
      const isAlive = enemyField?.isAlive();

      if (game) {
        switch (attackResult) {
          case 'miss':
            if (enemyField) {
              game.turn = enemyField?.userId;
            }
            game.fields.forEach((item) => {
              cc.getConnectionByUserId(item.userId)?.webSocket.send(
                createJsonMsg('attack', {
                  position: {
                    x: messageData.x,
                    y: messageData.y,
                  },
                  currentPlayer: messageData.indexPlayer,
                  status: attackResult,
                }),
              );

              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(
                  createJsonMsg('turn', { currentPlayer: enemyField?.userId }),
                );
            });
            await sleep(1500);

            if (enemyField?.userId === -1) {
              await randomBotAttack(cc, gc, enemyField, game, messageData);
            }
            break;

          case 'wrongAttack':
            return;

          case 'killed':
            messageData = JSON.parse(message.data);
            game.turn = messageData.indexPlayer;
            game.fields.forEach(async (item) => {
              cc.getConnectionByUserId(item.userId)?.webSocket.send(
                createJsonMsg('attack', {
                  position: {
                    x: messageData.x,
                    y: messageData.y,
                  },
                  currentPlayer: messageData.indexPlayer,
                  status: attackResult,
                }),
              );

              enemyField?.needUpdateKilled?.forEach((cell) => {
                cc.getConnectionByUserId(item.userId)?.webSocket.send(
                  createJsonMsg('attack', {
                    position: {
                      x: cell.y,
                      y: cell.x,
                    },
                    currentPlayer: messageData.indexPlayer,
                    status: cell.status,
                  }),
                );
              });

              if (isAlive) {
                cc
                  .getConnectionByUserId(item.userId)
                  ?.webSocket.send(createJsonMsgData('turn', messageData));
              } else {
                cc
                  .getConnectionByUserId(item.userId)
                  ?.webSocket.send(createJsonMsgData('finish', messageData));

                await uc.updateUser(messageData.indexPlayer);

                let gameId = gc.getGameIndexByUserId(messageData.indexPlayer);
                let roomId = rc.getRoomIndexByUserId(messageData.indexPlayer);
                if (roomId !== -1) {
                  rc.rooms.splice(roomId, 1);
                  cc.connections.forEach((item) => {
                    item.webSocket.send(rc.getAvailableRooms());
                  });
                }

                if (gameId !== -1) {
                  gc.games.splice(gameId, 1);
                }

                cc.getConnections().forEach(async (item) => {
                  item.webSocket.send(await uc.getWinnersInfo());
                });
              }
            });
            break;

          default:
            messageData = JSON.parse(message.data);
            game.turn = messageData.indexPlayer;
            game.fields.forEach((item) => {
              cc.getConnectionByUserId(item.userId)?.webSocket.send(
                createJsonMsg('attack', {
                  position: {
                    x: messageData.x,
                    y: messageData.y,
                  },
                  currentPlayer: messageData.indexPlayer,
                  status: attackResult,
                }),
              );

              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(createJsonMsgData('turn', messageData));
            });
            break;
        }
      }
      break;

    case 'randomAttack':
      console.log('randomAttack', message);
      messageData = JSON.parse(message.data);
      if (game?.turn != messageData.indexPlayer) return;

      enemyField = game?.fields.find(
        (item) => item.userId !== messageData.indexPlayer,
      );
      const randomAttackResult = enemyField?.randomAttack();

      if (game) {
        switch (randomAttackResult?.status) {
          case 'miss':
            if (enemyField) {
              game.turn = enemyField?.userId;
            }

            game.fields.forEach((item) => {
              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(
                  createJsonMsgData('attack', messageData, randomAttackResult),
                );

              cc.getConnectionByUserId(item.userId)?.webSocket.send(
                createJsonMsg('turn', {
                  currentPlayer: enemyField?.userId,
                }),
              );
            });

            await sleep(1500);
            await randomBotAttack(cc, gc, enemyField, game, messageData);
            break;

          case 'killed':
            game.turn = messageData.indexPlayer;

            game.fields.forEach((item) => {
              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(
                  createJsonMsgData('attack', messageData, randomAttackResult),
                );

              enemyField?.needUpdateKilled?.forEach((cell) => {
                cc.getConnectionByUserId(item.userId)?.webSocket.send(
                  createJsonMsg('attack', {
                    position: {
                      x: cell.y,
                      y: cell.x,
                    },
                    currentPlayer: messageData.indexPlayer,
                    status: cell.status,
                  }),
                );
              });

              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(createJsonMsgData('turn', messageData));
            });
            break;

          default:
            game.turn = messageData.indexPlayer;

            game.fields.forEach((item) => {
              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(
                  createJsonMsgData('attack', messageData, randomAttackResult),
                );

              cc
                .getConnectionByUserId(item.userId)
                ?.webSocket.send(createJsonMsgData('turn', messageData));
            });
            break;
        }
      }
      break;

    case 'single_play':
      userId = cc.connections[cc.getConnectionIndexById(connectionId)].userId;

      if (userId >= 0) {
        const user = await uc.getUserById(userId);
        if (user) {
          const createGameMessage = gc.createNewGameRandom(user);
          cc.connections[connectionIndex].webSocket.send(
            JSON.stringify(createGameMessage),
          );
        }
      }
      break;
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
