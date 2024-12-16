import { DbService } from "@/db/db.service";
import { Room } from "@/features/room/room.entity";

export class RoomRepository {
  private dbService: DbService<Room>;

  constructor() {
    this.dbService = new DbService();
  }

  delete(id: string): void {
    this.dbService.delete(id);
  }

  getAll() {
    return this.dbService.findAll();
  }

  getById(id: string): Room {
    const room = this.dbService.findById(id);
    if (!room) throw new Error("room not found");
    return room;
  }

  add(room: Room) {
    this.dbService.create(room);
  }
}

export const roomRepo = new RoomRepository();
