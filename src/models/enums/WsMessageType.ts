export enum WsMessageType {
  REGISTRATION = "reg",
  CREATE_ROOM = "create_room",
  CREATE_GAME = "create_game",
  START_GAME = "start_game",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
  ADD_SHIPS = "add_ships",
  TURN = "turn",
  ATTACK = "attack",
  FINISH = "finish",
  DISCONNECT = "disconnect"
}

export enum WsServerType {
  REGISTRATION = "reg",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
  CREATE_GAME = "create_game",
  START_GAME = "start_game",
  TURN = "turn",
  ATTACK = "attack",
  FINISH = "finish",
  DISCONNECT = "disconnect",
  STUB = "stub",
  ERROR = "error"
}

export enum WsClientType {
  REGISTRATION = "reg",
  CREATE_ROOM = "create_room",
  ADD_USER_TO_ROOM = "add_user_to_room",
  ADD_SHIPS = "add_ships",
  ATTACK = "attack",
  RANDOM_ATTACK = "random_attack",
  SINGLE_PLAY = "single_play"
}
