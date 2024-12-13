import { ClientService } from "@/features/client/client.service";
import { RegistrationData } from "@/features/client/client.type";
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
} from "@/ws-server/helpers/response-templates";
import { ServerResponseType } from "@/ws-server/ws-server.enum";
import { WebSocket } from "ws";
import { logError } from "@/ws-server/helpers/log-error";
import {
  ClientAddShipsData,
  ClientAttackData
} from "@/ws-server/ws-server.type";

export class WsServerService {
  private sendToOne(webSocket: WebSocket, data: string) {
    webSocket.send(data);
  }

  reg(clientService: ClientService, data: string) {
    const regData = getRegDataTemplate();
    regData.index = clientService.getId();

    try {
      clientService.authorization(JSON.parse(data) as RegistrationData);
      regData.name = clientService.getName();
    } catch (error) {
      regData.error = true;
      if (error instanceof Error) {
        regData.errorText = error.message;
      } else {
        console.error(error);
        regData.errorText = "unknown error";
      }
    }

    const webSocket = clientService.getWs();
    const response = createResponse(
      ServerResponseType.REGISTRATION,
      JSON.stringify(regData)
    );

    this.sendToOne(webSocket, JSON.stringify(response));
    this.updateRoom(clientService);
    this.updateWinners(clientService);
  }

  updateRoom(clientService: ClientService) {
    const availableRooms = clientService.getAllAvailableRooms();

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

    console.log(response);

    clientService.getAllClients().forEach(({ webSocket }) => {
      this.sendToOne(webSocket, JSON.stringify(response));
    });
  }

  updateWinners(clientService: ClientService) {
    const allWinners = clientService.getAllWinners();

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

    clientService
      .getAllClients()
      .forEach(({ webSocket }) =>
        this.sendToOne(webSocket, JSON.stringify(response))
      );
  }

  createRoom(clientService: ClientService) {
    try {
      clientService.createRoom();
      this.updateRoom(clientService);
    } catch (error) {
      logError(error);
    }
  }

  addUserToRoom(clientService: ClientService, data: string) {
    const { indexRoom } = JSON.parse(data) as { indexRoom: string };
    try {
      clientService.enterToRoom(indexRoom);
      this.updateRoom(clientService);
      this.createGame(clientService);
    } catch (error) {
      logError(error);
    }
  }

  createGame(clientService: ClientService) {
    try {
      const { idGame, players } = clientService.createGame();

      const createGameDataResponses = players.map(({ idPlayer, player }) => {
        const createGameDataTemplate = getCreateGameDataTemplate();
        createGameDataTemplate.idGame = idGame;
        createGameDataTemplate.idPlayer = idPlayer;

        const response = createResponse(
          ServerResponseType.CREATE_GAME,
          JSON.stringify(createGameDataTemplate)
        );

        return { response, recipient: player };
      });

      console.log(createGameDataResponses);
      createGameDataResponses.forEach(({ response, recipient }) => {
        this.sendToOne(recipient.webSocket, JSON.stringify(response));
      });
    } catch (error) {
      logError(error);
    }
  }

  addShips(clientService: ClientService, data: string) {
    const parsedData = JSON.parse(data.toString()) as ClientAddShipsData;
    try {
      clientService.addShips(parsedData);
      this.startGame(clientService);
    } catch (error) {
      logError(error);
    }
  }

  startGame(clientService: ClientService) {
    try {
      const startGameData = clientService.startGame();
      if (!startGameData) return;

      const startGameDataTemplate = getStartGameDataTemplate();
      startGameDataTemplate.currentPlayerIndex = "";

      const startGameDataResponses = startGameData.map(
        ([idPlayer, { ships, player }]) => {
          startGameDataTemplate.ships = ships!;
          startGameDataTemplate.currentPlayerIndex = idPlayer;

          const response = createResponse(
            ServerResponseType.START_GAME,
            JSON.stringify(startGameDataTemplate)
          );

          return { response, recipient: player };
        }
      );

      startGameDataResponses.forEach(
        ({ response, recipient: { webSocket } }) => {
          this.sendToOne(webSocket, JSON.stringify(response));
        }
      );

      this.turn(clientService);
    } catch (error) {
      logError(error);
    }
  }

  turn(clientService: ClientService) {
    const { players, playerMoveId } = clientService.turn();

    const turnDataTemplate = getTurnTemplate();
    turnDataTemplate.currentPlayer = playerMoveId;

    const response = createResponse(
      ServerResponseType.TURN,
      JSON.stringify(turnDataTemplate)
    );

    players.forEach(({ webSocket }) => {
      this.sendToOne(webSocket, JSON.stringify(response));
    });
  }

  attack(clientService: ClientService, data: string) {
    const parsedData = JSON.parse(data) as ClientAttackData;
    const {
      attackStatus,
      players,
      attackCoords: { x, y },
      isGameOver
    } = clientService.handleAttack(parsedData);

    const attackTemplate = getAttackTemplate();
    attackTemplate.position.x = x;
    attackTemplate.position.y = y;
    attackTemplate.status = attackStatus.status;
    attackTemplate.currentPlayer = parsedData.indexPlayer.toString();

    const response = createResponse(
      ServerResponseType.ATTACK,
      JSON.stringify(attackTemplate)
    );

    attackStatus.aroundCoords.forEach(({ x, y }) => {
      const attackTemplate = getAttackTemplate();
      attackTemplate.position.x = x;
      attackTemplate.position.y = y;
      attackTemplate.status = "miss";
      attackTemplate.currentPlayer = parsedData.indexPlayer.toString();

      const response = createResponse(
        ServerResponseType.ATTACK,
        JSON.stringify(attackTemplate)
      );

      players.forEach(({ webSocket }) => {
        this.sendToOne(webSocket, JSON.stringify(response));
      });
    });

    players.forEach(({ webSocket }) => {
      this.sendToOne(webSocket, JSON.stringify(response));
    });

    if (isGameOver) {
      this.finish(clientService);
    } else {
      this.turn(clientService);
    }
  }

  finish(clientService: ClientService) {
    const { winnerId, players } = clientService.finish();

    const finishTemplate = getFinishTemplate();
    finishTemplate.winPlayer = winnerId;

    const response = createResponse(
      ServerResponseType.FINISH,
      JSON.stringify(finishTemplate)
    );

    players.forEach(({ webSocket }) => {
      this.sendToOne(webSocket, JSON.stringify(response));
    });

    this.updateWinners(clientService);
  }
}
