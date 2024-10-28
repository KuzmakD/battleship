import { ShipTypes } from '../utils/constants';

export interface IUser {
  id: number;
  name: string;
  password: string;
  wins: number;
}

export interface IGame {
  id: number;
  users: IUser[];
  fields: [];
  turn: number;
}

export interface IRoom {
  id: number;
  users: IUser[];
}

export interface IShip {
  position: {
    x: number;
    y: number;
  }
  direction: boolean;
  length: number;
  type: ShipTypes;
}

export interface IAttack {
  gameId: number | string;
  x: number;
  y: number;
  indexPlayer: number | string;
}

export type Coordinates = {
  x: number;
  y: number;
}
