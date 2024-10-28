import { Field } from '../field/field.model';
import { type IUser } from '../utils/types';

export class GameModel {
  id: number;
  users: Array<IUser>;
  fields: Array<Field> = [];
  turn: number = -1;
  
  constructor(id: number, users: IUser[]) {
    this.id = id;
    this.users = users;
  }
}