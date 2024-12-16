import { Player } from "@/features/player/player.entity";
import { WebSocket } from "ws";
import {
  validateNameAvailability,
  validateNameSpelling,
  validatePasswordSpelling
} from "@/features/player/helpers/validate-player-data";
import { playerRepository } from "@/features/player/player.repository";

export class PlayerService {
  private readonly repo = playerRepository;

  private validatePlayerData(name: string, password: string) {
    validateNameSpelling(name);
    validatePasswordSpelling(password);
    validateNameAvailability(name, this.getAllPlayers());
  }

  getAllPlayers(): Player[] {
    return [...this.repo.getAll().values()];
  }

  getAllWinners(): Player[] {
    return this.getAllPlayers().reduce<Player[]>((acc, player) => {
      if (player.winsCount > 0) {
        acc.push(player);
      }
      return acc;
    }, []);
  }

  createPlayer(name: string, password: string, ws: WebSocket): Player {
    // this.validatePlayerData(name, password);

    const newPlayer = new Player(name, password, ws);
    this.repo.add(newPlayer);
    return newPlayer;
  }

  deletePlayer(player: Player) {
    this.repo.delete(player);
  }
}
