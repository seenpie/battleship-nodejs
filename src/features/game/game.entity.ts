import { generateId } from "@/utils/generate-id";
import { Client } from "@/features/client/client.entity";
import { ClientAttackData, ClientShipData } from "@/ws-server/ws-server.type";
import { randomNum } from "@/utils/random-num";
import { ShipsData } from "@/features/game/game.type";

type Move = {
  attackData: ClientAttackData;
  attackResult: unknown;
};

type PlayerData = {
  player: Player;
  ships: ClientShipData[] | null;
  shipsMap: ShipsData | null;
};
export type Player = Client;

export class Game {
  public readonly id = generateId();
  public playersData = new Map<string, PlayerData>();
  public moves: Move[] = [];
  public isStarted = false;
  public moverId: string;
  public winnerId: string | null = null;

  constructor(players: Player[]) {
    players.forEach((player: Player) => {
      this.playersData.set(player.id, {
        player,
        ships: null,
        shipsMap: null
      });
    });

    this.moverId = [...this.playersData.keys()][randomNum(0, 1)];
  }
}
