export interface IUser {
  id: string;
  name: string;
  password: string;
  wins: number;
}

export interface IGame {
  id: number;
  firstPlayer: IUser;
  secondPlayer: IUser;
}

export interface IRoom {
  id: number;
  users: IUser[];
}

export interface IShip {
  position: {
    x: number;
    y: number;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
  }
}

export interface IAttack {
  gameId: number | string;
  x: number;
  y: number;
  indexPlayer: number | string;
}
