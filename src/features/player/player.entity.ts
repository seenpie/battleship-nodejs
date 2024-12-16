import { WebSocket } from "ws";
import { generateId } from "@/utils/generate-id";

export class Player {
  public readonly id = generateId();
  public winsCount = 0;
  public constructor(
    public name: string,
    private password: string,
    public webSocket: WebSocket
  ) {}
}
