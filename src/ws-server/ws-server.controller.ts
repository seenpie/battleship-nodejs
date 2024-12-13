import { WsServerService } from "@/ws-server/ws-server.service";
import { RawData } from "ws";
import { ClientService } from "@/features/client/client.service";
import { ClientRequestType } from "@/ws-server/ws-server.enum";
import { ClientRequest } from "@/ws-server/ws-server.type";
import { logError } from "@/ws-server/helpers/log-error";

export class WsServerController {
  private wsServerService: WsServerService;

  constructor() {
    this.wsServerService = new WsServerService();
  }

  handleMessage(clientData: RawData, clientService: ClientService) {
    const parsedClientData = JSON.parse(clientData.toString()) as ClientRequest;
    console.log(parsedClientData, "data");
    const { type, data } = parsedClientData;

    try {
      switch (type) {
        case ClientRequestType.REGISTRATION:
          console.log("registration process");
          this.wsServerService.reg(clientService, data);
          break;
        case ClientRequestType.CREATE_ROOM:
          console.log("create room process");
          this.wsServerService.createRoom(clientService);
          break;
        case ClientRequestType.ADD_USER_TO_ROOM:
          console.log("add user to room process");
          this.wsServerService.addUserToRoom(clientService, data);
          break;
        case ClientRequestType.ADD_SHIPS:
          console.log("add ships process");
          this.wsServerService.addShips(clientService, data);
          break;
        case ClientRequestType.ATTACK:
          console.log("attack process");
          this.wsServerService.attack(clientService, data);
          break;
        case ClientRequestType.RANDOM_ATTACK:
          console.log("random attack process");
          this.wsServerService.attack(clientService, data);
          break;
      }
    } catch (error) {
      logError(error);
    }
  }
}
