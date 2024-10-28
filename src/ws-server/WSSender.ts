import { WsServerData } from "@/ws-server/types";
import { WsServerType } from "@/models/enums/WsMessageType";
import { IClientManager } from "@/models/interfaces";

export class WSSender {
  private commonEventSubscribers: IClientManager[] = [];

  private readonly commandsList: Record<
    WsServerType,
    (data: WsServerData, client: IClientManager) => void
  > = {
    [WsServerType.UPDATE_ROOM]: (data) => this._sendAllClients(data),
    [WsServerType.UPDATE_WINNERS]: (data) => this._sendAllClients(data),
    [WsServerType.REGISTRATION]: (data, client) =>
      this._sendToOneClient(data, client),
    [WsServerType.CREATE_GAME]: (data, client) =>
      this._sendToOneClientById(data, client),
    [WsServerType.START_GAME]: (data, client) =>
      this._sendToOneClientById(data, client),
    [WsServerType.TURN]: (data, client) =>
      this._sendToOneClientById(data, client),
    [WsServerType.ATTACK]: (data, client) =>
      this._sendToOneClientById(data, client),
    [WsServerType.STUB]: (data, client) => this._sendToOneClient(data, client),
    [WsServerType.ERROR]: (data, client) => this._sendToOneClient(data, client),
    [WsServerType.FINISH]: (data, client) =>
      this._sendToOneClientById(data, client),
    [WsServerType.DISCONNECT]: (data, client) =>
      this._sendToOneClient(data, client)
  };

  private _sendToOneClientById(data: WsServerData, client: IClientManager) {
    const recipient =
      client.getId() === data.extraData
        ? client
        : this.commonEventSubscribers.find(
            (client) => client.getId() === data?.extraData
          );

    if (!recipient) throw new Error("Client does not exist");

    this._sendToOneClient(data, recipient);
  }

  private _sendToOneClient(data: WsServerData, client: IClientManager) {
    client.getWebSocket().send(JSON.stringify(data));
  }

  private _sendAllClients(data: WsServerData): void {
    this.commonEventSubscribers.forEach((client) => {
      client.getWebSocket().send(JSON.stringify(data));
    });
  }

  public subscribeOnCommonEvents(client: IClientManager) {
    this.commonEventSubscribers.push(client);
  }

  public send(sendData: WsServerData[], client: IClientManager): void {
    try {
      sendData.forEach((data) => {
        const { type } = data;
        this.commandsList[type](data, client);
      });
    } catch (_error) {
      const wsData = {
        type: WsServerType.ERROR,
        data: "server error",
        id: 0
      };

      this.commandsList[WsServerType.ERROR](wsData, client);
    }
  }
}
