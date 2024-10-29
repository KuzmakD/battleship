import { GameController } from '../game/game.controller';
import { ConnectionController } from '../connection/connection.controller';
import { Field } from '../field/field.model';
import { Game } from '../game/game.model';

export async function randomBotAttack (
  cc: ConnectionController,
  gc: GameController,
  enemyField: Field | undefined,
  game: Game,
  data: any,
) {
    const userField: Field | undefined = game?.fields.find(item => item.userId === data.indexPlayer);
    const randomAttackResult = userField?.randomAttack();
    const isAlive = userField?.isAlive();

    if (randomAttackResult?.status === 'miss') {
        game.turn = data.indexPlayer;
        game.fields.forEach(item => {
            cc.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                type: "attack",
                data: JSON.stringify({
                    position: {
                        x: randomAttackResult?.x,
                        y: randomAttackResult?.y
                    },
                    currentPlayer: -1,
                    status: randomAttackResult?.status
                }),
                id: 0
            }));

            cc.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                type: "turn",
                data: JSON.stringify({
                    currentPlayer: data.indexPlayer
                }),
                id: 0
            }));
        });
    } else if (randomAttackResult?.status === 'killed') {
        game.turn = -1;
        cc.getConnectionByUserId(game.fields[0].userId)?.webSocket.send(JSON.stringify({
            type: "attack",
            data: JSON.stringify({
                position: {
                    x: randomAttackResult?.x,
                    y: randomAttackResult?.y
                },
                currentPlayer: -1,
                status: randomAttackResult?.status
            }),
            id: 0
        }));

        userField?.needUpdateKilled?.forEach(cell => {
            cc.getConnectionByUserId(game.fields[0].userId)?.webSocket.send(JSON.stringify({
                type: "attack",
                data: JSON.stringify({
                    position: {
                        x: cell.y,
                        y: cell.x
                    },
                    currentPlayer: -1,
                    status: cell.status
                }),
                id: 0
            }));
        });

        if (isAlive) {
            await sleep(1500);
            await randomBotAttack(cc, gc, enemyField, game, data);
        } else {
            cc.getConnectionByUserId( game.fields[0].userId)?.webSocket.send(JSON.stringify({
                type: "finish",
                data: JSON.stringify({
                    winPlayer: -1
                }),
                id: 0
            }));

            let gameId = gc.getGameIndexByUserId(data.indexPlayer);
            if (gameId !== -1) {
                gc.games.splice(gameId, 1);
            }
        }           
    } else {
        game.fields.forEach(item => {
            cc.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                type: "attack",
                data: JSON.stringify({
                    position: {
                        x: randomAttackResult?.x,
                        y: randomAttackResult?.y
                    },
                    currentPlayer: -1,
                    status: randomAttackResult?.status
                }),
                id: 0
            }));
        });
        
        await sleep(1500);
        await randomBotAttack(cc, gc, enemyField, game, data);           
    }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
