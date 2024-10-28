import { Client } from "@/models/classes/Client";
import { UserManager } from "@/services/UserManager";
import { UserRepository } from "@/repositories/UserRepository";
import { WebSocket } from "ws";
import { RoomRepository } from "@/repositories/RoomRepository";
import {
  IClientManager,
  IGameManager,
  IRoomManager,
  IUserManager
} from "@/models/interfaces";
import { RoomManager } from "@/services/RoomManager";
import { generateId } from "@/utils";
import { GameManager } from "@/services/GameManager";
import { TShipsPositionList } from "@/models/types";

const nameRegex = /^[A-Z][a-zA-Z0-9]*$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;

export class ClientManager implements IClientManager {
  private readonly client: Client<IUserManager>;

  constructor(webSocket: WebSocket) {
    this.client = new Client<IUserManager>(generateId(), webSocket);
  }

  private _clientHasRoom(): boolean {
    return this.client.rooms.length > 0;
  }

  public getWebSocket(): WebSocket {
    return this.client.webSocket;
  }

  public getId() {
    return this.client.id;
  }

  private _isClientInGame(): boolean {
    return !!this.getGame();
  }

  private _authExistedUser(
    userCard: IUserManager,
    password: string
  ): IUserManager {
    if (userCard.isOnline()) {
      throw new Error(`${userCard.getName()} is online`);
    }

    if (userCard.getPassword() === password) {
      this.client.userCard = userCard;
      return userCard;
    }

    throw new Error("password isn't correct");
  }

  private _authNewUser(name: string, password: string): IUserManager {
    if (!nameRegex.test(name)) {
      throw new Error(
        "name should be started in uppercase and not contain spaces and allow only latin"
      );
    }

    if (!passwordRegex.test(password)) {
      throw new Error(
        "password should contain at least one digit and uppercase letter and not contain spaces"
      );
    }

    const userCard = new UserManager(name, password, this.getId());
    this.client.userCard = userCard;
    return userCard;
  }

  public registration(name: string, password: string): IUserManager {
    const userCardDB = UserRepository.getUserByName(name);

    if (userCardDB) {
      return this._authExistedUser(userCardDB, password);
    }

    return this._authNewUser(name, password);
  }

  public deactivateUserCard(): void {
    if (this.client.userCard) {
      this.getUserCard().setOnlineStatus(false);
    }
  }

  public getUserCard(): IUserManager {
    if (!this.client.userCard) {
      throw new Error("Client does not exist");
    }
    return this.client.userCard;
  }

  public getRoom() {
    return this.client.rooms[0];
  }

  public createRoom(): void {
    if (this._clientHasRoom()) throw new Error("Client already has room");
    const room = new RoomManager(this);
    this.client.rooms.push(room);
  }

  public addToRoom(roomId: string): IRoomManager {
    const room = RoomRepository.getRoomById(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.hasMember(this)) {
      throw new Error("Client already in room");
    }

    if (this._clientHasRoom()) {
      RoomRepository.deleteRoomById(this.getRoom().getId());
    }

    room.setMember(this);
    return room;
  }

  public getGame(): IGameManager {
    return this.client.games[0];
  }

  public createGame(gameMembers: IClientManager[]): IGameManager {
    const game = new GameManager(gameMembers);
    gameMembers.forEach((member) => member.addToGame(game));
    return game;
  }

  public addToGame(game: IGameManager): void {
    if (this._isClientInGame()) {
      throw new Error("client already is playing");
    }
    this.client.games.push(game);
  }

  public setGameParams(params: TShipsPositionList) {
    const game = this.getGame();
    game.setPositions(params, this);
    return game;
  }
}
