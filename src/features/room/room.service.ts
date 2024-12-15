import { Room, RoomMember } from "@/features/room/room.entity";
import { roomRepo } from "@/features/room/room.repository";

export class RoomService {
  private readonly repo = roomRepo;

  createRoom(member: RoomMember): Room {
    const newRoom = new Room(member);
    this.repo.add(newRoom);
    return newRoom;
  }

  getAllAvailable(): Room[] {
    return this.repo.getAll().reduce<Room[]>((acc, room) => {
      if (room.members.length === 1) {
        acc.push(room);
      }
      return acc;
    }, []);
  }

  addMemberInRoom(roomId: string, member: RoomMember): Room {
    const room = this.repo.getById(roomId);
    if (!room) {
      throw new Error("room didn't exist");
    }
    room.members.push(member);
    return room;
  }

  destroy(room: Room) {
    this.repo.delete(room.id);
  }
}
