import { WebSocket } from "ws";
import { TItem, TShipsPositionList } from "@/models/types";

interface IManager {
  getId(): string;
}

export interface IUserManager extends IManager {
  setOnlineStatus(status: boolean): void;

  isOnline(): boolean;

  getName(): string;

  getPassword(): string;

  getWins(): number;
}

export interface IRoomManager extends IManager {
  getHost(): IClientManager;

  getHostId(): string;

  getHostName(): string;

  isFull(): boolean;

  setMember(member: IClientManager): void;

  getMembers(): IClientManager[];

  hasMember(member: IClientManager): boolean;
}

export interface IGameManager extends IManager {
  setPositions(shipsData: TShipsPositionList, player: IClientManager): void;

  isReady(): boolean;

  getItems(): TItem<TShipsPositionList, IClientManager>[];

  getPlayers(): IClientManager[];
}

export interface IClientManager extends IManager {
  getWebSocket(): WebSocket;

  registration(name: string, password: string): IUserManager;

  getUserCard(): IUserManager;

  deactivateUserCard(): void;

  addToRoom(roomId: string): IRoomManager;

  createRoom(): void;

  createGame(gameMembers: IClientManager[]): IGameManager;

  addToGame(game: IGameManager): void;

  getGame(): IGameManager;

  setGameParams(params: TShipsPositionList): IGameManager;
}
