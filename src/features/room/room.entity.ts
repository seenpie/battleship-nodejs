import { generateId } from "@/utils/generate-id";
import { Player } from "@/features/player/player.entity";

export type RoomMember = Player;

export class Room {
  public readonly id = generateId();
  public host: RoomMember;
  public members: RoomMember[] = [];

  constructor(member: RoomMember) {
    this.host = member;
    this.members.push(member);
  }
}
