import { type IUser } from '../utils/types';

export class User implements IUser {
  id: number;
  name: string;
  password: string;
  wins: number;

  constructor(data: string) {
    const { id, name, password, wins } = JSON.parse(data);
    this.id = id;
    this.name = name;
    this.password = password;
    this.wins = wins;
  }
}
