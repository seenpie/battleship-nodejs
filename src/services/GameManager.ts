import { Game } from "@/models/classes/Game";
import { TItem, TShipsPositionList } from "@/models/types";
import { generateId } from "@/utils";
import { IClientManager, IGameManager } from "@/models/interfaces";
import { GameRepository } from "@/repositories/GameRepository";

export class GameManager implements IGameManager {
  private game: Game<IClientManager, TItem<TShipsPositionList, IClientManager>>;

  constructor(gameMembers: IClientManager[]) {
    this.game = new Game(generateId(), gameMembers);
    GameRepository.setGameInDB(this);
  }

  public getId() {
    return this.game.id;
  }

  public setPositions(shipsData: TShipsPositionList, player: IClientManager) {
    const item = { shipsData, player, playerMoves: [] };
    this.game.items.push(item);
  }

  public isReady(): boolean {
    return this.game.items.length === 2;
  }

  public getItems(): TItem<TShipsPositionList, IClientManager>[] {
    return this.game.items;
  }

  public getPlayers(): IClientManager[] {
    return this.game.players;
  }
}
