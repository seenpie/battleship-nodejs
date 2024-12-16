import { DbService } from "@/db/db.service";
import { Player } from "@/features/player/player.entity";

export class PlayerRepository {
  private dbService: DbService<Player>;

  constructor() {
    this.dbService = new DbService();
  }

  getAll() {
    return this.dbService.findAll();
  }

  add(player: Player) {
    this.dbService.create(player);
  }

  delete(player: Player) {
    this.dbService.delete(player.id);
  }
}

export const playerRepository = new PlayerRepository();
