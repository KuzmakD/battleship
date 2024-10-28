export enum MessageType {
  Reg = 'reg',
  UpdateWinners = 'update_winners',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Attack = 'attack',
  RandomAttack = 'random_attack',
  Turn = 'turn',
  Finish = 'finish',
}

export enum ShipTypes {
  'small' = 1,
  'medium' = 2,
  'large' = 3,
  'huge' = 4,
}

export enum Attacks {
  'miss',
  'shot',
  'killed',
  'wrongAttack',
}
