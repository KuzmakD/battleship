import { type IUser, type IRoom } from '../utils/types';

export class Room implements IRoom {
  id: number = 0;
  users: Array<IUser> = [];
}
