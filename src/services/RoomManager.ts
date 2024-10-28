import { Room } from "@/models/classes/Room";
import { RoomRepository } from "@/repositories/RoomRepository";
import { IClientManager, IRoomManager } from "@/models/interfaces";
import { generateId } from "@/utils";

const MAX_PLAYERS = 2;

export class RoomManager implements IRoomManager {
  private readonly room: Room<IClientManager>;

  constructor(host: IClientManager) {
    this.room = new Room(host, generateId());
    RoomRepository.setRoomInDB(this);
  }

  public getId(): string {
    return this.room.id;
  }

  public getHost() {
    return this.room.host;
  }

  public getHostId(): string {
    return this.room.host.getId();
  }

  public getHostName(): string {
    return this.getHost().getUserCard().getName();
  }

  public isFull(): boolean {
    return this.room.members.length === MAX_PLAYERS;
  }

  public setMember(member: IClientManager) {
    this.room.members.push(member);
  }

  public getMembers(): IClientManager[] {
    return this.room.members;
  }

  public hasMember(member: IClientManager): boolean {
    return !!this.room.members.find(
      (client) => client.getId() === member.getId()
    );
  }
}
