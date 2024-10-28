import WebSocket from 'ws';
import dotenv from 'dotenv';
import { webSocketRoutes } from './routes.web-socket';
import { UserController } from '../user/user.controller';
import { RoomController } from '../room/room.controller';
import { ConnectionController } from '../connection/connection.controller';
import { Connection } from '../connection/connection.model';
import { GameController } from '../game/game.controller';

dotenv.config();

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 3002;

export const webSocketServer = async () => {
  const webSockets = new WebSocket.WebSocketServer({port: +WEBSOCKET_PORT});
  const connectionController = new ConnectionController();
  const userController: UserController = new UserController();
  const roomController: RoomController = new RoomController();
  const gameController: GameController = new GameController();

  webSockets.on('connection', async (webSocket: WebSocket) => {
    const connections: Connection[] = connectionController.getConnections();
    const lastConnectionId: number = connectionController.getLastConnectionId(connections);
    const newConnection: Connection = connectionController.saveNewConnection(
      new Connection(lastConnectionId + 1, webSocket)
    );
    const newConnectionId: number = newConnection.id;

    console.log(`Start Websocket Server on the http://localhost:${WEBSOCKET_PORT}`);

    webSocket.on('message', async (data: WebSocket.RawData) => {
      console.log(`Received message: ${data}`);
      await webSocketRoutes(
        data,
        webSocket,
        userController,
        roomController,
        connectionController,
        gameController,
        newConnectionId,
      );
    });

    webSocket.on('error', (err) => {
      console.error(`WebSocket error: ${err.message}`);
    });

    webSocket.on('close', async () => {
      const userId = connectionController.getConnectionById(newConnectionId)?.userId;
      if (userId) {
        const gameId = gameController.getGameIndexByUserId(userId);
        const roomId = roomController.getRoomIndexByUserId(userId);
        if (roomId !== -1) {
          roomController.rooms.splice(roomId, 1);
          connectionController.connections.forEach(({ webSocket }) => {
            webSocket.send(roomController.getAvailableRooms());
          });
        }

        if (gameId !== -1) {
          const game = gameController.getGameById(gameId);
          const winner: any = game?.users.find((user: any) => user.index !== userId);

          if (winner) {
            connectionController.getConnectionByUserId(winner.index)?.webSocket.send(JSON.stringify({
              type: 'finish',
              data: JSON.stringify({
                winPlayer: winner.index
              }),
              id: 0              
            }));
            await userController.updateUser(winner.index);

            connectionController.getConnections().forEach(async (connection) => {
              connection.webSocket.send(await userController.getWinnersInfo());
            });
          }
          gameController.allGames.splice(gameId, 1);
        }
      }
      connectionController.removeConnectionById(newConnectionId);
    })
  });
}
