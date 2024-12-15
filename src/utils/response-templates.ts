import { ServerResponseType } from "@/ws-server/ws-server.enum";
import { ClientShipData } from "@/ws-server/ws-server.type";

export function createResponse(type: ServerResponseType, data: string) {
  return {
    type,
    data,
    id: 0
  };
}

export function getRegDataTemplate() {
  return {
    index: "",
    name: "",
    error: false,
    errorText: ""
  };
}

export function getUpdateRoomDataTemplate() {
  return {
    roomId: "",
    roomUsers: [
      {
        name: "",
        index: ""
      }
    ]
  };
}

export function getUpdateWinnersDataTemplate() {
  return {
    name: "",
    wins: 0
  };
}

export function getCreateGameDataTemplate() {
  return {
    idGame: "",
    idPlayer: ""
  };
}

export function getStartGameDataTemplate() {
  const ships: ClientShipData[] = [];
  return {
    ships,
    currentPlayerIndex: ""
  };
}

export function getTurnTemplate() {
  return {
    currentPlayer: ""
  };
}

export function getAttackTemplate() {
  return {
    position: {
      x: 0,
      y: 0
    },
    currentPlayer: "",
    status: ""
  };
}

export function getFinishTemplate() {
  return {
    winPlayer: ""
  };
}
