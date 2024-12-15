import { Client } from "@/features/client/client.entity";
import { WebSocket } from "ws";
import { RegistrationData } from "@/features/client/client.type";
import { RoomService } from "@/features/room/room.service";
import {
  ClientAddShipsData,
  ClientAttackData
} from "@/ws-server/ws-server.type";
import { GameService } from "@/features/game/game.service";
import {
  createResponse,
  getAttackTemplate,
  getCreateGameDataTemplate,
  getFinishTemplate,
  getRegDataTemplate,
  getStartGameDataTemplate,
  getTurnTemplate,
  getUpdateRoomDataTemplate,
  getUpdateWinnersDataTemplate
} from "@/utils/response-templates";
import { ServerResponseType } from "@/ws-server/ws-server.enum";
import { PlayerService } from "@/features/player/player.service";
import { Room } from "@/features/room/room.entity";
import { Game } from "@/features/game/game.entity";
import { Player } from "@/features/player/player.entity";
import { Bot } from "@/features/game/bot.service";

export class ClientService {
  private readonly client: Client;
  private readonly roomService = new RoomService();
  private readonly gameService = new GameService();
  private readonly playerService = new PlayerService();

  constructor(webSocket: WebSocket) {
    this.client = new Client(webSocket);
  }

  disconnect() {
    const { player, game, room } = this.client;

    if (!player) {
      return console.log("unauthorized client has been disconnect");
    }

    this.playerService.deletePlayer(player);

    if (game) {
      this.gameService.forceCloseGame(game, player.id);
      this.finish(game);
    }

    if (room) {
      this.roomService.destroy(room);
      this.updateRoom();
    }

    console.log(`client ${this.client.player?.name} has been deactivated`);
  }

  reg({ name, password }: RegistrationData): void {
    const regData = getRegDataTemplate();
    try {
      const player = this.playerService.createPlayer(
        name,
        password,
        this.client.webSocket
      );
      this.client.player = player;
      regData.name = player.name;
    } catch (error) {
      regData.error = true;
      if (error instanceof Error) {
        regData.errorText = error.message;
      } else {
        console.error(error);
        regData.errorText = "unknown error";
      }
    }
    const response = createResponse(
      ServerResponseType.REGISTRATION,
      JSON.stringify(regData)
    );

    this.client.webSocket.send(JSON.stringify(response));
    this.updateRoom();
    this.updateWinners();
  }

  private updateRoom() {
    const availableRooms = this.roomService.getAllAvailable();

    const updateDataList = availableRooms.map(
      ({ id, host: { name, id: hostId } }) => {
        const updateRoomData = getUpdateRoomDataTemplate();
        updateRoomData.roomId = id;
        updateRoomData.roomUsers[0].index = hostId;
        updateRoomData.roomUsers[0].name = name;
        return updateRoomData;
      }
    );

    const response = createResponse(
      ServerResponseType.UPDATE_ROOM,
      JSON.stringify(updateDataList)
    );

    this.playerService.getAllPlayers().forEach(({ webSocket }) => {
      webSocket.send(JSON.stringify(response));
    });
  }

  private updateWinners() {
    const allWinners = this.playerService.getAllWinners();

    const winnersDataList = allWinners.map(({ winsCount, name }) => {
      const updateWinnersData = getUpdateWinnersDataTemplate();
      updateWinnersData.name = name;
      updateWinnersData.wins = winsCount;
      return updateWinnersData;
    });

    const response = createResponse(
      ServerResponseType.UPDATE_WINNERS,
      JSON.stringify(winnersDataList)
    );

    this.playerService
      .getAllPlayers()
      .forEach(({ webSocket }) => webSocket.send(JSON.stringify(response)));
  }

  createRoom() {
    if (this.client.room) {
      this.roomService.destroy(this.client.room);
    }

    if (!this.client.player) {
      throw new Error("client didn't auth");
    }

    this.client.room = this.roomService.createRoom(this.client.player);

    this.updateRoom();
  }

  addUserToRoom({ indexRoom }: { indexRoom: string }) {
    if (!this.client.player) {
      throw new Error("client didn't auth");
    }

    if (this.client.room) {
      this.roomService.destroy(this.client.room);
    }

    const room = this.roomService.addMemberInRoom(
      indexRoom,
      this.client.player
    );

    this.client.room = room;

    this.updateRoom();
    this.createGame(room);
  }

  private createGame(room: Room) {
    const { members } = room;
    if (members.length !== 2) {
      throw new Error("room isn't full");
    }

    const game = this.gameService.createGame(members);
    this.client.game = game;
    members.forEach((member) => {
      const createGameDataTemplate = getCreateGameDataTemplate();
      createGameDataTemplate.idGame = game.id;
      createGameDataTemplate.idPlayer = member.id;

      const response = createResponse(
        ServerResponseType.CREATE_GAME,
        JSON.stringify(createGameDataTemplate)
      );

      member.webSocket.send(JSON.stringify(response));
    });
  }

  addShips(shipsData: ClientAddShipsData) {
    const game = this.gameService.addShips(shipsData);
    this.client.game = game;
    this.startGame(game);
  }

  private startGame(game: Game) {
    const gameMembersData = this.gameService.startGame(game);
    if (!gameMembersData) {
      return;
    }
    const startGameDataTemplate = getStartGameDataTemplate();

    gameMembersData.forEach(({ ships, player, playerId }) => {
      startGameDataTemplate.ships = ships!;
      startGameDataTemplate.currentPlayerIndex = playerId;

      const response = createResponse(
        ServerResponseType.START_GAME,
        JSON.stringify(startGameDataTemplate)
      );

      player.webSocket.send(JSON.stringify(response));
    });

    this.turn(game);
  }

  private turn(game: Game) {
    const players = game.playersData
      .values()
      .map((playerData) => playerData.player);

    const turnDataTemplate = getTurnTemplate();
    turnDataTemplate.currentPlayer = game.moverId;

    const response = createResponse(
      ServerResponseType.TURN,
      JSON.stringify(turnDataTemplate)
    );

    players.forEach((player) => {
      player.webSocket.send(JSON.stringify(response));
    });
  }

  attack(data: ClientAttackData) {
    const {
      attackStatus,
      players,
      attackCoords: { x, y },
      isGameOver,
      game
    } = this.gameService.attack(data);

    const attackTemplate = getAttackTemplate();
    attackTemplate.position.x = x;
    attackTemplate.position.y = y;
    attackTemplate.status = attackStatus.status;
    attackTemplate.currentPlayer = data.indexPlayer.toString();

    const response = createResponse(
      ServerResponseType.ATTACK,
      JSON.stringify(attackTemplate)
    );

    players.forEach(({ webSocket }) => {
      webSocket.send(JSON.stringify(response));
    });

    attackStatus.aroundCoords.forEach(({ x, y }) => {
      const attackTemplate = getAttackTemplate();
      attackTemplate.position.x = x;
      attackTemplate.position.y = y;
      attackTemplate.status = "miss";
      attackTemplate.currentPlayer = data.indexPlayer.toString();

      const response = createResponse(
        ServerResponseType.ATTACK,
        JSON.stringify(attackTemplate)
      );

      players.forEach(({ webSocket }) => {
        webSocket.send(JSON.stringify(response));
      });
    });

    if (isGameOver) {
      this.finish(game);
    } else {
      this.turn(game);
    }
  }

  private finish(game: Game) {
    const { players, winnerId } = this.gameService.getGameResult(game);

    const finishTemplate = getFinishTemplate();
    finishTemplate.winPlayer = winnerId;

    const response = createResponse(
      ServerResponseType.FINISH,
      JSON.stringify(finishTemplate)
    );

    players.forEach(({ webSocket }) => {
      webSocket.send(JSON.stringify(response));
    });

    this.updateWinners();
  }
}
