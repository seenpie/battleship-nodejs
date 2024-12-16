import { WebSocket } from "ws";
import { generateId } from "@/utils/generate-id";
import { Player } from "@/features/player/player.entity";
import { Game } from "@/features/game/game.entity";
import { Room } from "@/features/room/room.entity";

export class Client {
  public readonly id: string = generateId();
  public readonly webSocket: WebSocket;
  public room: Room | null = null;
  public game: Game | null = null;
  public player: Player | null = null;

  constructor(webSocket: WebSocket) {
    this.webSocket = webSocket;
  }
}
