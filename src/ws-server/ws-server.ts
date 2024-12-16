import { RawData, WebSocketServer } from "ws";
import { ClientService } from "@/features/client/client.service";
import {
  ClientAddShipsData,
  ClientAttackData,
  ClientRequest
} from "@/ws-server/ws-server.type";
import { ClientRequestType } from "@/ws-server/ws-server.enum";
import { logError } from "@/ws-server/helpers/log-error";
import { RegistrationData } from "@/features/client/client.type";
import { RoomService } from "@/features/room/room.service";
import { GameService } from "@/features/game/game.service";
import { PlayerService } from "@/features/player/player.service";

export class WsServer {
  private readonly server: WebSocketServer;

  constructor(port: number) {
    this.server = new WebSocketServer({ port });
  }

  private connection(): void {
    this.server.on("connection", (ws) => {
      const clientService = new ClientService(
        ws,
        new RoomService(),
        new GameService(),
        new PlayerService()
      );
      ws.on("error", console.error);
      ws.on("message", (data) => this.onMessage(data, clientService));
      ws.on("close", () => this.onClose(clientService));
    });
  }

  private onClose(clientService: ClientService): void {
    clientService.disconnect();
  }

  private onMessage(clientData: RawData, clientService: ClientService): void {
    const parsedClientData = JSON.parse(clientData.toString()) as ClientRequest;
    const { type, data } = parsedClientData;

    try {
      switch (type) {
        case ClientRequestType.REGISTRATION:
          console.log("registration process");
          clientService.reg(JSON.parse(data) as RegistrationData);
          break;
        case ClientRequestType.CREATE_ROOM:
          console.log("create room process");
          clientService.createRoom();
          break;
        case ClientRequestType.ADD_USER_TO_ROOM:
          console.log("add user to room process");
          clientService.addUserToRoom(
            JSON.parse(data) as { indexRoom: string }
          );
          break;
        case ClientRequestType.ADD_SHIPS:
          console.log("add ships process");
          clientService.addShips(
            JSON.parse(data.toString()) as ClientAddShipsData
          );
          break;
        case ClientRequestType.ATTACK:
          console.log("attack process");
          clientService.attack(JSON.parse(data) as ClientAttackData);
          break;
        case ClientRequestType.RANDOM_ATTACK:
          console.log("random attack process");
          clientService.attack(JSON.parse(data) as ClientAttackData);
          break;
        case ClientRequestType.SINGLE_PLAY:
          console.log("single process");
          clientService.singlePlay();
      }
    } catch (error) {
      logError(error);
    }
  }

  public start(): void {
    this.connection();
  }
}
