import { Game, Player } from "@/features/game/game.entity";
import {
  ClientAddShipsData,
  ClientAttackData
} from "@/ws-server/ws-server.type";
import { gameRepository } from "@/features/game/game.repository";
import { createShipsMap } from "@/features/game/helpers/create-ships-map";
import { Coords, ShipsData } from "@/features/game/game.type";
import { createCoordKey } from "@/features/game/helpers/create-coord-key";
import { randomNum } from "@/utils/random-num";
import {
  createResponse,
  getFinishTemplate
} from "@/ws-server/helpers/response-templates";
import { ServerResponseType } from "@/ws-server/ws-server.enum";

export class GameService {
  private game: Game | null = null;
  private repo = gameRepository;

  getGameResult() {
    if (!this.game) {
      throw new Error("Game didn't initialize");
    }
    if (!this.game.winnerId) {
      throw new Error("Game did not ended");
    }

    const players = this.getPlayersDataEntries().map(
      ([_, { player }]) => player
    );

    return {
      players,
      winnerId: this.game.winnerId
    };
  }

  unlink(playerId?: string) {
    if (this.game && !this.game.winnerId && playerId) {
      const [enemyId, { player }] = this.getEnemyData(playerId);
      this.closeGame(enemyId);
      const finishTemplate = getFinishTemplate();
      finishTemplate.winPlayer = enemyId;
      const response = createResponse(
        ServerResponseType.FINISH,
        JSON.stringify(finishTemplate)
      );
      player.webSocket.send(JSON.stringify(response));
    }
    this.game = null;
  }

  createGame(players: Player[]) {
    this.game = new Game(players);
    this.repo.add(this.game);

    const parsedPlayersData = this.game.playersData
      .entries()
      .map(([idPlayer, { player }]) => ({ idPlayer, player }));

    return {
      idGame: this.game.id,
      players: parsedPlayersData
    };
  }

  joinGame(gameId: string) {
    this.game = this.repo.getById(gameId);
  }

  addShips({ indexPlayer, ships, gameId }: ClientAddShipsData) {
    this.joinGame(gameId.toString());

    const playerGameData = this.game!.playersData.get(indexPlayer.toString());
    if (!playerGameData) {
      throw new Error("this player isn't in game");
    }

    playerGameData.ships = ships;
    playerGameData.shipsMap = createShipsMap(ships);
  }

  turn() {
    if (!this.game?.isStarted) {
      throw new Error("Game didn't started");
    }

    return {
      players: this.game.playersData
        .values()
        .map((playerData) => playerData.player),
      playerMoveId: this.game.moverId
    };
  }

  startGame() {
    if (this.readyForStart()) {
      this.game!.isStarted = true;
      return [...this.game!.playersData.entries()];
    }

    return null;
  }

  readyForStart() {
    return (
      this.game?.playersData.values().every(({ ships }) => ships !== null) ||
      false
    );
  }

  private checkTurn(playerId: string) {
    if (!(this.game!.moverId === playerId)) {
      throw new Error(`${playerId} not allow to move`);
    }
  }

  private getPlayersDataEntries() {
    if (!this.game) {
      throw new Error("Game didn't initialize");
    }

    return [...this.game.playersData.entries()];
  }

  private getEnemyData(playerId: string) {
    const playersData = this.getPlayersDataEntries();

    return playersData.filter(([id]) => id !== playerId)[0];
  }

  private getPlayerData(playerId: string) {
    const playersData = this.getPlayersDataEntries();

    return playersData.filter(([id]) => id === playerId)[0];
  }

  private getAttackStatus(
    ships: ShipsData,
    { x, y }: Coords
  ): { status: string; aroundCoords: Coords[] } {
    for (const coords of ships.values()) {
      for (const coord of coords) {
        const { isKilled, aroundCoords, shipCoords } = coord;

        const key = createCoordKey({ x, y });
        const isShot = shipCoords.get(key);
        // console.log(shipCoords);
        // console.log(key);
        // console.log(isShot);

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

  private getRandomCoord(): Coords {
    const x = randomNum(0, 9);
    const y = randomNum(0, 9);
    const coord = createCoordKey({ x, y });
    const checkNewCoord = this.game!.moves.every((move) => {
      const moveCoord = createCoordKey({
        x: move.attackData.x,
        y: move.attackData.y
      });
      return coord !== moveCoord;
    });
    if (!checkNewCoord) {
      return this.getRandomCoord();
    }
    return { x, y };
  }

  private checkGameOver(ships: ShipsData) {
    const coordsMaps = [...ships.values()].flat();
    return coordsMaps.every((coord) => {
      return coord.isKilled;
    });
  }

  closeGame(winnerId: string) {
    if (!this.game) {
      throw new Error("Game didn't initialize");
    }

    const { player } = this.game.playersData.get(winnerId)!;
    player.winsCount += 1;
    this.game.winnerId = winnerId;

    console.log(this.game.id, "game is closed");
  }

  attack(data: ClientAttackData) {
    if (!this.game) {
      throw new Error("game didn't initialize");
    }

    const { indexPlayer } = data;
    this.checkTurn(indexPlayer.toString());

    let { x, y } = data;
    if (x === undefined && y === undefined) {
      const { x: newXcoord, y: newYcoord } = this.getRandomCoord();
      x = newXcoord;
      y = newYcoord;
    }

    const [idPlayer, { player }] = this.getPlayerData(indexPlayer.toString());
    const [indexEnemyPlayer, { player: enemy, shipsMap: enemyShips }] =
      this.getEnemyData(indexPlayer.toString());

    const attackStatus = this.getAttackStatus(enemyShips!, {
      x,
      y
    });
    const isGameOver =
      attackStatus.status === "killed" && this.checkGameOver(enemyShips!);

    if (isGameOver) {
      this.closeGame(idPlayer);
    }

    const attackResult = {
      attackStatus,
      players: [player, enemy],
      attackCoords: { x, y },
      isGameOver
    };

    this.game!.moves.push({ attackData: { ...data, x, y }, attackResult });

    if (attackStatus.status === "miss") {
      this.game!.moverId = indexEnemyPlayer;
    } else {
      this.game!.moverId = idPlayer;
    }

    return attackResult;
  }
}
