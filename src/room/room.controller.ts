import { Room } from './room.model';
import { User } from '../user/user.model'

export class RoomController {
  rooms: Room[] = [];

  getAvailableRooms() {
    const data = this.rooms.map((room) => {
      return {
        roomId: room .id,
        roomUsers: room.users.map((user) => {
          return { name: user.name, index: user.id }
        })
      }
    });
    
    return JSON.stringify({
      type: "update_room",
      data: JSON.stringify(data),
      id: 0
    });
  }

  createNewRoom(user: User) {
    const room: Room = new Room();
    
    room.id = this.getLastRoomId(this.rooms) + 1;
    room.users.push(user);
    this.rooms.push(room);

    let data = this.rooms.map((room) => {
      return {
        roomId: room.id,
        roomUsers: room.users.map((user) => {
          return { name: user.name, index: user.id }
        })
      }
    });
    
    return JSON.stringify({
      type: "update_room",
      data: JSON.stringify(data),
      id: 0
    });
  }

  getRoomIndexByUserId(userId: number) {
    return this.rooms.findIndex((room) => 
      room.users.find(({ id }) => id === userId));
  };

  getRoomById(id: number) {
    return this.rooms.find((room) =>  room.id === id);
  };

  getLastRoomId(allRooms: Array<Room>) {
    let max = -1;
    max = Math.max(...allRooms.map(({ id }) => id));
    return max;
  };
}
