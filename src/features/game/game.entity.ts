import { generateId } from "@/utils/generate-id";
import { ClientAttackData, ClientShipData } from "@/ws-server/ws-server.type";
import { randomNum } from "@/utils/random-num";
import { ShipsData } from "@/features/game/game.type";
import { Player } from "@/features/player/player.entity";

type Move = {
  attackData: ClientAttackData;
  attackResult: unknown;
};

type PlayerData = {
  player: GameMember;
  ships: ClientShipData[] | null;
  shipsMap: ShipsData | null;
};
export type GameMember = Player;

export class Game {
  public readonly id = generateId();
  public playersData = new Map<string, PlayerData>();
  public moves: Move[] = [];
  public isStarted = false;
  public moverId: string;
  public winnerId: string | null = null;

  constructor(players: GameMember[]) {
    players.forEach((player: GameMember) => {
      this.playersData.set(player.id, {
        player,
        ships: null,
        shipsMap: null
      });
    });

    const playersId = [...this.playersData.keys()];
    const playersCount = playersId.length - 1;
    this.moverId = playersId[randomNum(0, playersCount)];
  }
}
