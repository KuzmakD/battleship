import WebSocket from 'ws';
import dotenv from 'dotenv';
import { webSocketRoutes } from './routes.web-socket';
import { UserController } from '../user/user.controller';
import { RoomController } from '../room/room.controller';
import { ConnectionController } from '../connection/connection.controller';
import { Connection } from '../connection/connection.model';
import { GameController } from '../game/game.controller';

dotenv.config();

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 3000;

export const webSocketServer = async () => {
  const webSockets = new WebSocket.WebSocketServer({port: +WEBSOCKET_PORT});
  const cc = new ConnectionController();
  const uc: UserController = new UserController();
  const rc: RoomController = new RoomController();
  const gc: GameController = new GameController();

  webSockets.on('connection', async (ws: WebSocket) => {
    const connections: Connection[] = cc.getConnections();
    const lastConnectionId: number = cc.getLastConnectionId(connections);
    const newConnection: Connection = cc.createConnection(
      new Connection(lastConnectionId + 1, ws)
    );
    const newConnectionId: number = newConnection.id;

    console.log(`Start Websocket Server on the http://localhost:${WEBSOCKET_PORT}`);

    ws.on('message', async (data: WebSocket.RawData) => {
      console.log(`Received message on server: ${data}`);
      await webSocketRoutes(data, ws, uc, rc, cc, gc, newConnectionId);
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error: ${err.message}`);
    });

    ws.on('close', async () => {
      const userId = cc.getConnectionById(newConnectionId)?.userId;
      if (userId) {
        const gameId = gc.getGameIndexByUserId(userId);
        const roomId = rc.getRoomIndexByUserId(userId);
        
        if (roomId !== -1) {
          rc.rooms.splice(roomId, 1);
          cc.connections.forEach(({ webSocket }) => {
            webSocket.send(rc.getAvailableRooms());
          });
        }

        if (gameId !== -1) {
          const game = gc.getGameById(gameId);
          const winner: any = game?.users.find((user: any) => user.index !== userId);

          if (winner) {
            cc.getConnectionByUserId(winner.index)?.webSocket.send(JSON.stringify({
              type: 'finish',
              data: JSON.stringify({ winPlayer: winner.index }),
              id: 0              
            }));
            await uc.updateUser(winner.index);

            cc.getConnections().forEach(async (connection) => {
              connection.webSocket.send(await uc.getWinnersInfo());
            });
          }
          gc.games.splice(gameId, 1);
        }
      }
      cc.removeConnectionById(newConnectionId);
    })
  });
}
