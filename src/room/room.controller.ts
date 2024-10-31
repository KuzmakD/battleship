import { Room } from './room.model';
import { User } from '../user/user.model'

export class RoomController {
  rooms: Room[] = [];

  getAvailableRooms(): string {
    const data = this.rooms.map((room) => {
      return {
        roomId: room.id,
        roomUsers: room.users.map(({name, id}) => ({ name, index: id })),
      }
    });
    
    return JSON.stringify({
      type: "update_room",
      data: JSON.stringify(data),
      id: 0
    });
  }

  createNewRoom(user: User): string {
    const room: Room = new Room();
    
    room.id = this.getLastRoomId(this.rooms) + 1;
    room.users.push(user);
    this.rooms.push(room);

    const data = this.rooms.map(({id, users}) => {
      return {
        roomId: id,
        roomUsers: users.map(({name, id}) => ({ name, index: id })),
      }
    });
    
    return JSON.stringify({
      type: "update_room",
      data: JSON.stringify(data),
      id: 0
    });
  }

  addUserToRoom(user: User, message: string) {
    const data = JSON.parse(message);
    const room = this.rooms.find((room) => room.id === data.indexRoom);
    
    if (room) {
      if (room.users[0].id === user.id || room.users.length === 2) return;
      
      const roomIndex = this.getRoomIndexByUserId(user.id);
      if (roomIndex >= 0) {
        this.rooms.splice(roomIndex, 1);
      }
      room.users.push(user);
    }

    return this.rooms.map((room) => {
      return {
        roomId: room.id,
        roomUsers: room.users.map(({ name, id }) => {
          return { name, index: id }
        })
      }
    });
  }

  getRoomIndexByUserId(userId: number): number {
    return this.rooms.findIndex((room) => 
      room.users.find(({ id }) => id === userId));
  };

  getRoomById(id: number): Room | undefined {
    return this.rooms.find((room) => room.id === id);
  };

  getLastRoomId(allRooms: Array<Room>): number {
    return Math.max(-1, ...allRooms.map(({ id }) => +id));
  };
}
