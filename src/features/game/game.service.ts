import { Game, GameMember, Move } from "@/features/game/game.entity";
import {
  ClientAddShipsData,
  ClientAttackData
} from "@/ws-server/ws-server.type";
import { gameRepository } from "@/features/game/game.repository";
import { createShipsMap } from "@/features/game/helpers/create-ships-map";
import { Coords, ShipsData } from "@/features/game/game.type";
import {
  createCoord,
  getRandomCoord
} from "@/features/game/helpers/create-coord";
import { Player } from "@/features/player/player.entity";

export class GameService {
  private repo = gameRepository;

  getGameResult(game: Game) {
    if (!game.winnerId) {
      throw new Error("Game did not ended");
    }

    const players = [...game.playersData.entries()].map(
      ([_, { player }]) => player
    );

    return {
      players,
      winnerId: game.winnerId
    };
  }

  createGame(players: GameMember[], isSoloGame = false): Game {
    const newGame = new Game(players, isSoloGame);
    this.repo.add(newGame);
    return newGame;
  }

  addShips({ indexPlayer, ships, gameId }: ClientAddShipsData): Game {
    const game = this.repo.getById(gameId.toString());
    if (!game) {
      throw new Error("game not found");
    }

    const playerGameData = game.playersData.get(indexPlayer.toString());
    if (!playerGameData) {
      throw new Error("this player isn't in game");
    }

    playerGameData.ships = ships;
    playerGameData.shipsMap = createShipsMap(ships);
    return game;
  }

  startGame(game: Game) {
    const { playersData } = game;
    if (playersData.size < 2) {
      throw new Error("Game isn't full");
    }

    const isGameReady = playersData.values().every(({ ships }) => {
      return ships !== null;
    });

    if (!isGameReady) {
      return null;
    }

    game.isStarted = true;

    return [...game.playersData.entries()].map(
      ([playerId, { player, ships }]) => ({
        player,
        ships,
        playerId
      })
    );
  }

  private checkTurn(game: Game, playerId: string) {
    if (!(game.moverId === playerId)) {
      throw new Error(`${playerId} not allow to move`);
    }
  }

  private getEnemyData(game: Game, playerId: string) {
    const playersData = [...game.playersData.entries()];

    return playersData.filter(([id]) => id !== playerId)[0];
  }

  private getPlayerData(game: Game, playerId: string) {
    const playersData = [...game.playersData.entries()];

    return playersData.filter(([id]) => id === playerId)[0];
  }

  private getAttackStatus(
    ships: ShipsData,
    { x, y }: Coords
  ): { status: string; aroundCoords: Coords[] } {
    for (const coords of ships.values()) {
      for (const coord of coords) {
        const { isKilled, aroundCoords, shipCoords } = coord;

        const key = createCoord({ x, y });
        const isShot = shipCoords.get(key);

        if (isShot) {
          if (isKilled) {
            return { status: "miss", aroundCoords: [] };
          }

          if (shipCoords.size === 1) {
            coord.isKilled = true;
            shipCoords.delete(key);
            return {
              status: "killed",
              aroundCoords: [...aroundCoords.values()]
            };
          }

          shipCoords.delete(key);
          return { status: "shot", aroundCoords: [] };
        }
      }
    }
    return { status: "miss", aroundCoords: [] };
  }

  private checkGameOver(ships: ShipsData) {
    const coordsMaps = [...ships.values()].flat();
    return coordsMaps.every((coord) => {
      return coord.isKilled;
    });
  }

  finishGame(game: Game, winnerId: string) {
    const { player } = game.playersData.get(winnerId)!;
    if (!game.isSoloGame) {
      if (player instanceof Player) {
        player.winsCount += 1;
      }
    }
    game.winnerId = winnerId;
  }

  forceCloseGame(game: Game, leaverId: string) {
    const [winnerId] = this.getEnemyData(game, leaverId);
    this.finishGame(game, winnerId);
  }

  private getAttackCoords(
    moves: Move[],
    x: number | undefined,
    y: number | undefined
  ): { x: number; y: number } {
    let attackXcoord: number;
    let attackYcoord: number;

    if (x === undefined && y === undefined) {
      const { x: newXcoord, y: newYcoord } = getRandomCoord(moves);
      attackXcoord = newXcoord;
      attackYcoord = newYcoord;
    } else {
      attackXcoord = x!;
      attackYcoord = y!;
    }

    return { x: attackXcoord, y: attackYcoord };
  }

  attack(data: ClientAttackData) {
    const { indexPlayer, gameId, x, y } = data;
    const game = this.repo.getById(gameId.toString());
    this.checkTurn(game, indexPlayer.toString());

    const [idPlayer, { player, moves }] = this.getPlayerData(
      game,
      indexPlayer.toString()
    );
    const [indexEnemyPlayer, { player: enemy, shipsMap: enemyShips }] =
      this.getEnemyData(game, indexPlayer.toString());

    const attackCoords = this.getAttackCoords(moves, x, y);

    const attackStatus = this.getAttackStatus(enemyShips!, attackCoords);
    const isGameOver =
      attackStatus.status === "killed" && this.checkGameOver(enemyShips!);

    if (isGameOver) {
      this.finishGame(game, idPlayer);
    }

    const attackResult = {
      attackStatus,
      players: [player, enemy],
      attackCoords,
      game,
      isGameOver
    };

    moves.push({ attackData: { ...data, ...attackCoords }, attackResult });

    if (attackStatus.status === "miss") {
      game.moverId = indexEnemyPlayer;
    } else {
      game.moverId = idPlayer;
    }

    return attackResult;
  }
}
