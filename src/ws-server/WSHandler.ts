import { RawData } from "ws";
import { WsClientData, WsServerData } from "@/ws-server/types";
import { TClientShipsData, TUser } from "@/models/types";
import {
  WsClientType,
  WsMessageType,
  WsServerType
} from "@/models/enums/WsMessageType";
import { RoomRepository } from "@/repositories/RoomRepository";
import { UserRepository } from "@/repositories/UserRepository";
import {
  IClientManager,
  IGameManager,
  IRoomManager
} from "@/models/interfaces";

const stubMessage = "not implemented";

export class WSHandler {
  private commandsType: Record<
    WsClientType,
    (data: WsClientData, client: IClientManager) => WsServerData[]
  > = {
    [WsMessageType.REGISTRATION]: (data, client) =>
      this._handleReg(data, client),
    [WsMessageType.CREATE_ROOM]: (_, client) => this._handleCreateRoom(client),
    [WsMessageType.ADD_SHIPS]: (data, client) =>
      this._handleAddShips(data, client),
    [WsMessageType.ATTACK]: () => this._handleUnknown(stubMessage),
    [WsClientType.ADD_USER_TO_ROOM]: (data, client) =>
      this._handleAddUserToRoom(data, client),
    [WsClientType.RANDOM_ATTACK]: () => this._handleUnknown(stubMessage),
    [WsClientType.SINGLE_PLAY]: () => this._handleUnknown(stubMessage)
  };

  private _createErrorPayload(
    type: WsServerType,
    name: string,
    error: Error
  ): WsServerData {
    const errorPayload = {
      name,
      index: 0,
      error: true,
      errorText: error.message
    };

    return this._createResponsePayload(type, JSON.stringify(errorPayload));
  }

  private _createResponsePayload(
    type: WsServerType,
    data: string,
    extraData?: string
  ): WsServerData {
    return {
      type,
      data,
      id: 0,
      extraData: extraData ?? ""
    };
  }

  private _createGame(
    room: IRoomManager,
    client: IClientManager
  ): WsServerData[] {
    const gameMembers = room.getMembers();
    const game = client.createGame(gameMembers);

    const payloads = gameMembers.map((client) => ({
      idGame: game.getId(),
      idPlayer: client.getId()
    }));

    return payloads.map((payload) =>
      this._createResponsePayload(
        WsServerType.CREATE_GAME,
        JSON.stringify(payload),
        payload.idPlayer
      )
    );
  }

  private _updateRoom(): WsServerData {
    const availableRooms = RoomRepository.getAvailableRoomsList();

    const payload = availableRooms.map((room) => {
      return {
        roomId: room.getId(),
        roomUsers: [
          {
            name: room.getHostName(),
            index: room.getHostId()
          }
        ]
      };
    });

    return this._createResponsePayload(
      WsServerType.UPDATE_ROOM,
      JSON.stringify(payload)
    );
  }

  private _turn(clients: IClientManager[]): WsServerData[] {
    return clients.map((client) => {
      const payload = {
        currentPlayer: client.getId()
      };

      return this._createResponsePayload(
        WsServerType.TURN,
        JSON.stringify(payload),
        client.getId()
      );
    });
  }

  private _startGame(game: IGameManager): WsServerData[] {
    const items = game.getItems();
    const payloads = items.map((item) => ({
      ships: item.shipsData,
      currentPlayerIndex: item.player.getId()
    }));

    return payloads.map((payload) =>
      this._createResponsePayload(
        WsServerType.START_GAME,
        JSON.stringify(payload),
        payload.currentPlayerIndex
      )
    );
  }

  private _handleUnknown(message: string): WsServerData[] {
    const wsData = this._createResponsePayload(WsServerType.STUB, message);
    return [wsData];
  }

  private _handleAddUserToRoom(
    data: WsClientData,
    client: IClientManager
  ): WsServerData[] {
    const { indexRoom } = JSON.parse(data.data) as { indexRoom: string };
    const room = client.addToRoom(indexRoom);

    const upRoomWsData = this._updateRoom();
    const crGameWsData = this._createGame(room, client);

    return [upRoomWsData, ...crGameWsData];
  }

  private _handleAddShips(
    data: WsClientData,
    client: IClientManager
  ): WsServerData[] {
    const parsedData = JSON.parse(data.data) as TClientShipsData;
    const { ships } = parsedData;

    const game = client.setGameParams(ships);

    if (game.isReady()) {
      const startGameWsData = this._startGame(game);
      const turnWsData = this._turn(game.getPlayers());
      return [...startGameWsData, ...turnWsData];
    }

    return [];
  }

  private _handleCreateRoom(client: IClientManager): WsServerData[] {
    client.createRoom();
    const wsData = this._updateRoom();

    return [wsData];
  }

  private _updateWinners() {
    const leaderboard = UserRepository.getLeaderboard();
    return this._createResponsePayload(
      WsServerType.UPDATE_WINNERS,
      JSON.stringify(leaderboard)
    );
  }

  private _handleReg(
    data: WsClientData,
    client: IClientManager
  ): WsServerData[] {
    try {
      const { name, password } = JSON.parse(data.data) as TUser;
      const userCard = client.registration(name, password);

      const payload = {
        name: userCard.getName(),
        index: userCard.getId(),
        error: false,
        errorText: ""
      };

      const regWsData = this._createResponsePayload(
        WsServerType.REGISTRATION,
        JSON.stringify(payload)
      );

      const upRoomWsData = this._updateRoom();
      const upWinnersWsData = this._updateWinners();

      return [regWsData, upRoomWsData, upWinnersWsData];
    } catch (error) {
      const err = error instanceof Error ? error : new Error("unknown error");

      const payload = {
        name: "",
        index: client.getId(),
        error: true,
        errorText: err.message
      };

      const wsData = this._createResponsePayload(
        WsServerType.REGISTRATION,
        JSON.stringify(payload)
      );

      return [wsData];
    }
  }

  public handle(data: RawData, client: IClientManager): WsServerData[] {
    try {
      const parsedData = JSON.parse(data.toString()) as WsClientData;
      const { type } = parsedData;
      const command = this.commandsType[type];

      return command(parsedData, client);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("unknown error");

      const wsData = this._createErrorPayload(WsServerType.ERROR, "error", err);
      return [wsData];
    }
  }
}
