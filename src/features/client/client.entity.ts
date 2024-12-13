import { WebSocket } from "ws";
import { generateId } from "@/utils/generate-id";

export class Client {
  public readonly id: string = generateId();
  public readonly webSocket: WebSocket;
  public isAuth: boolean = false;
  public name: string = "";
  public password: string | null = null;
  public winsCount = 0;

  constructor(webSocket: WebSocket) {
    this.webSocket = webSocket;
  }
}
