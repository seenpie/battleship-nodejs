import { IGameManager } from "@/models/interfaces";
import { database } from "@/db/Database";

export class GameRepository {
  public static setGameInDB(game: IGameManager) {
    database.insertGame(game);
  }

  public static getGamesList(): IGameManager[] {
    return Array.from(database.getGames().values());
  }
}
