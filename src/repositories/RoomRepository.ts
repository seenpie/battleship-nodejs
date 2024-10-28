import { database } from "@/db/Database";
import { IRoomManager } from "@/models/interfaces";

export class RoomRepository {
  public static getRoomsList(): IRoomManager[] {
    return Array.from(database.getRooms().values());
  }

  public static getAvailableRoomsList(): IRoomManager[] {
    const rooms = this.getRoomsList();
    return rooms.reduce<IRoomManager[]>((list, room) => {
      if (room.isFull()) return list;
      list.push(room);
      return list;
    }, []);
  }

  public static setRoomInDB(room: IRoomManager) {
    database.insertRoom(room);
  }

  public static getRoomById(id: string): IRoomManager | undefined {
    return this.getRoomsList().find((room) => room.getId() === id);
  }

  public static deleteRoomById(id: string): void {
    database.deleteRoom(id);
  }
}
