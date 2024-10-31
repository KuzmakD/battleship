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

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export interface IAttack {
  gameId: number | string;
  x: number;
  y: number;
  indexPlayer: number | string;
}

export type Coordinates = {
  x: number;
  y: number;
};
