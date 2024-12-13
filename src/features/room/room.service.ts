import { Room, RoomMember } from "@/features/room/room.entity";
import { roomRepo } from "@/features/room/room.repository";

export class RoomService {
  private room: Room | null = null;
  private readonly repo = roomRepo;

  isReadyForGame() {
    return (this.room && this.room.isFull()) || false;
  }

  createRoom(member: RoomMember): Room {
    if (this.room) {
      this.destroy();
    }
    this.room = new Room(member);
    this.repo.add(this.room);
    return this.room;
  }

  joinRoom(roomId: string, member: RoomMember): Room {
    if (this.room) {
      this.destroy();
    }

    this.room = this.repo.getById(roomId);
    this.addMember(member);
    return this.room;
  }

  getAllAvailable(): Room[] {
    return this.repo.getAllAvailable();
  }

  getRoom() {
    return this.room;
  }

  private addMember(member: RoomMember) {
    if (this.isReadyForGame()) {
      throw new Error("Room is full and ready for game");
    }
    this.room?.members.push(member);
  }

  destroy() {
    if (this.room) {
      this.repo.delete(this.room.id);
      console.log(`room ${this.room.id} has destroyed`);
      this.room = null;
    }
  }
}
