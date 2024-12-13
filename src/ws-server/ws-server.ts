import { RawData, WebSocketServer } from "ws";
import { ClientService } from "@/features/client/client.service";
import { WsServerController } from "@/ws-server/ws-server.controller";

export class WsServer {
  private readonly server: WebSocketServer;
  private wsServerController: WsServerController;

  constructor(port: number) {
    this.server = new WebSocketServer({ port });
    this.wsServerController = new WsServerController();
  }

  private _connection(): void {
    this.server.on("connection", (ws) => {
      const clientService = new ClientService(ws);
      ws.on("error", console.error);
      ws.on("message", (data) => this.onMessage(data, clientService));
      ws.on("close", () => this.onClose(clientService));
    });
  }

  private onClose(clientService: ClientService): void {
    clientService.exit();
  }

  private onMessage(data: RawData, clientService: ClientService): void {
    this.wsServerController.handleMessage(data, clientService);
  }

  public start(): void {
    this._connection();
  }
}
