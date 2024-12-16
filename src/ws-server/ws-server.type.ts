import { ClientRequestType } from "@/ws-server/ws-server.enum";

export type ClientRequest = {
  type: ClientRequestType;
  data: string;
  id: 0;
};

export type ClientShipData = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

export type ClientAddShipsData = {
  gameId: number | string;
  ships: ClientShipData[];
  indexPlayer: number | string;
};

export type ClientAttackData = {
  gameId: number | string;
  x: number | undefined;
  y: number | undefined;
  indexPlayer: number | string;
};
