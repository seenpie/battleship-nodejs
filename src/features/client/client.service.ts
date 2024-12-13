import { Client } from "@/features/client/client.entity";
import { WebSocket } from "ws";
import {
  IClientService,
  RegistrationData
} from "@/features/client/client.type";
import { RoomService } from "@/features/room/room.service";
import { validateNameAvailability } from "@/utils/validate-auth-data";
import { clientRepo } from "@/features/client/client.repository";
import {
  ClientAddShipsData,
  ClientAttackData
} from "@/ws-server/ws-server.type";
import { GameService } from "@/features/game/game.service";
import {
  createResponse,
  getUpdateRoomDataTemplate,
  getUpdateWinnersDataTemplate
} from "@/ws-server/helpers/response-templates";
import { ServerResponseType } from "@/ws-server/ws-server.enum";

// client service => room service => game service

export class ClientService implements IClientService {
  private readonly client: Client;
  private readonly repo = clientRepo;
  private readonly roomService = new RoomService();
  private readonly gameService = new GameService();

  constructor(webSocket: WebSocket) {
    this.client = new Client(webSocket);
  }

  getAllClients(): Client[] {
    return this.repo.getAll();
  }

  getAllWinners(): Client[] {
    return this.repo.getAllWinners();
  }

  getAllAvailableRooms() {
    return this.roomService.getAllAvailable();
  }

  finish() {
    const gameResult = this.gameService.getGameResult();
    this.gameService.unlink();
    this.roomService.destroy();
    return gameResult;
  }

  exit() {
    this.roomService.destroy();
    this.repo.delete(this.client);
    this.gameService.unlink(this.client.id);
    const allWinners = this.getAllWinners();

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

    this.getAllClients().forEach(({ webSocket }) =>
      webSocket.send(JSON.stringify(response))
    );

    const availableRooms = this.getAllAvailableRooms();

    const updateDataList = availableRooms.map(
      ({ id, host: { name, id: hostId } }) => {
        const updateRoomData = getUpdateRoomDataTemplate();
        updateRoomData.roomId = id;
        updateRoomData.roomUsers[0].index = hostId;
        updateRoomData.roomUsers[0].name = name;
        return updateRoomData;
      }
    );

    const response2 = createResponse(
      ServerResponseType.UPDATE_ROOM,
      JSON.stringify(updateDataList)
    );

    this.getAllClients().forEach(({ webSocket }) => {
      webSocket.send(JSON.stringify(response2));
    });
    console.log(`client ${this.client.name} has been deactivated`);
  }

  turn() {
    return this.gameService.turn();
  }

  authorization({ name, password }: RegistrationData): void {
    // validateNameSpelling(name);
    validateNameAvailability(name, this.getAllClients());
    // validatePasswordSpelling(password);

    this.client.name = name;
    this.client.password = password;
    this.client.isAuth = true;
    this.repo.add(this.client);
  }

  createRoom() {
    return this.roomService.createRoom(this.client);
  }

  enterToRoom(roomId: string) {
    if (this.roomService.getRoom()?.id === roomId) {
      throw new Error(`client ${this.client.name} already in this room`);
    }

    this.roomService.joinRoom(roomId, this.client);
  }

  createGame() {
    const room = this.roomService.getRoom();
    if (!room) throw new Error("this client isn't in room");
    return this.gameService.createGame(room.members);
  }

  addShips(shipsData: ClientAddShipsData) {
    this.gameService.addShips(shipsData);
  }

  startGame() {
    return this.gameService.startGame();
  }

  handleAttack(data: ClientAttackData) {
    return this.gameService.attack(data);
  }

  getWs(): WebSocket {
    return this.client.webSocket;
  }

  getName(): string {
    return this.client.name;
  }

  getId(): string {
    return this.client.id;
  }
}
