import { WsClientType, WsServerType } from "@/models/enums/WsMessageType";

type WsData<T> = {
  type: T;
  data: string;
  id: number;
  extraData?: string;
};

export type WsClientData = WsData<WsClientType>;
export type WsServerData = WsData<WsServerType>;
