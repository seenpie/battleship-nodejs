export enum ClientRequestType {
  REGISTRATION = "reg",
  CREATE_ROOM = "create_room",
  ADD_USER_TO_ROOM = "add_user_to_room",
  ADD_SHIPS = "add_ships",
  ATTACK = "attack",
  RANDOM_ATTACK = "randomAttack",
  SINGLE_PLAY = "single_play"
}

export enum ServerResponseType {
  REGISTRATION = "reg",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
  CREATE_GAME = "create_game",
  START_GAME = "start_game",
  TURN = "turn",
  ATTACK = "attack",
  FINISH = "finish"
}
