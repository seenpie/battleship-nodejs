import { RawData, WebSocketServer } from "ws";
import { WSHandler } from "@/ws-server/WSHandler";
import { WSSender } from "@/ws-server/WSSender";
import { ClientManager } from "@/services/ClientManager";

const DEFAULT_PORT = 3000;

export class WSServer {
  private readonly server: WebSocketServer;
  private clientList: Map<string, ClientManager> = new Map();
  private handler: WSHandler;
  private sender: WSSender;

  constructor() {
    this.server = this._init(DEFAULT_PORT);
    this.handler = this._initHandler();
    this.sender = this._initSender();
  }

  private _init(port: number): WebSocketServer {
    return new WebSocketServer({ port });
  }

  private _connection(): void {
    this.server.on("connection", (ws) => {
      const client = new ClientManager(ws);
      this.sender.subscribeOnCommonEvents(client);
      this.clientList.set(client.getId(), client);
      ws.on("error", console.error);
      ws.on("message", (data) => this._onMessage(data, client));
      ws.on("close", () => this._onClose(client));
    });
  }

  private _onClose(client: ClientManager): void {
    this.clientList.delete(client.getId());
    client.deactivateUserCard();
  }

  private _initHandler(): WSHandler {
    return new WSHandler();
  }

  private _initSender(): WSSender {
    return new WSSender();
  }

  private _onMessage(data: RawData, client: ClientManager): void {
    const handlerResponse = this.handler.handle(data, client);
    this.sender.send(handlerResponse, client);
  }

  public start(): void {
    this._connection();
  }
}
