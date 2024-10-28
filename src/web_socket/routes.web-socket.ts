import WebSocket from 'ws';
import { UserController } from '../user/user.controller';
import { RoomController } from '../room/room.controller';
import { ConnectionController } from '../connection/connection.controller';
import { GameController } from '../game/game.controller';

export const webSocketRoutes = async (
  data: WebSocket.RawData,
  webSocket: WebSocket,
  userController: UserController,
  roomController: RoomController,
  connectionController: ConnectionController,
  gameController: GameController,
  connectionId: number,
) => {
  console.log(`Received message: ${data}`);
  let message = JSON.parse(data.toString());

  switch (message.type) {
    case 'reg':
      console.log('reg', message);
      break;
    case 'update_winners':
      console.log('update_winners', message);
      break;
    case 'create_room':
      console.log('create_room', message);
      break;
    case 'add_user_to_room':
      console.log('add_user_to_room', message);
      break;
    case 'create_game':
      console.log('create_game', message);
      break;
    case 'update_room':
      console.log('update_room', message);
      break;
    case 'add_ships':
      console.log('add_ships', message);
      break;
    case 'start_game':
      console.log('start_game', message);
      break;
    case 'attack':
      console.log('attack', message);
      break;
    case 'random_attack':
      console.log('random_attack', message);
      break;
    case 'finish':
      console.log('finish', message);
      break;
  }
}
