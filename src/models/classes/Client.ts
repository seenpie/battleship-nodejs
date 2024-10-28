import { WebSocket } from "ws";
import { IGameManager, IRoomManager } from "@/models/interfaces";

export class Client<T> {
  public id: string;
  public userCard: null | T = null;
  public webSocket: WebSocket;
  public rooms: IRoomManager[];
  public games: IGameManager[];

  constructor(id: string, webSocket: WebSocket) {
    this.webSocket = webSocket;
    this.id = id;
    this.rooms = [];
    this.games = [];
  }
}
