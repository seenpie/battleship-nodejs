import { DbService } from "@/db/db.service";
import { Game } from "@/features/game/game.entity";

export class GameRepository {
  private dbService: DbService<Game>;

  constructor() {
    this.dbService = new DbService();
  }

  getById(id: string): Game {
    const game = this.dbService.findById(id);
    if (!game) throw new Error("room not found");
    return game;
  }

  add(game: Game) {
    this.dbService.create(game);
  }
}

export const gameRepository = new GameRepository();
