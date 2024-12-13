import { generateId } from "@/utils/generate-id";
import { Client } from "@/features/client/client.entity";

export type RoomMember = Client;
const ROOM_LIMIT = 2;

export class Room {
  public readonly id = generateId();
  public host: RoomMember;
  public members: RoomMember[] = [];

  constructor(member: RoomMember) {
    this.host = member;
    this.members.push(member);
  }

  isFull() {
    return this.members.length >= ROOM_LIMIT;
  }
}
