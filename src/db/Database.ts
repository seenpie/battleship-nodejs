import { IGameManager, IRoomManager, IUserManager } from "@/models/interfaces";

type TState = {
  users: Map<string, IUserManager>;
  games: Map<string, IGameManager>;
  rooms: Map<string, IRoomManager>;
};

class Database {
  private readonly state: TState = {
    users: new Map<string, IUserManager>(),
    games: new Map<string, IGameManager>(),
    rooms: new Map<string, IRoomManager>()
  };

  private _insertItem<K, V>(map: Map<K, V>, key: K, value: V): void {
    map.set(key, value);
  }

  private _getItem<K, V>(map: Map<K, V>, key: K): V | undefined {
    return map.get(key);
  }

  public getState(): TState {
    return this.state;
  }

  public getUsers(): Map<string, IUserManager> {
    return this.state.users;
  }

  public getGames(): Map<string, IGameManager> {
    return this.state.games;
  }

  public getRooms(): Map<string, IRoomManager> {
    return this.state.rooms;
  }

  public getGame(id: string): IGameManager | undefined {
    return this._getItem(this.state.games, id);
  }

  public insertUser(user: IUserManager): void {
    this._insertItem(this.state.users, user.getId(), user);
  }

  public insertGame(game: IGameManager): void {
    this._insertItem(this.state.games, game.getId(), game);
  }

  public insertRoom(room: IRoomManager): void {
    this._insertItem(this.state.rooms, room.getId(), room);
  }

  public deleteRoom(id: string) {
    this.state.rooms.delete(id);
  }
}

export const database = new Database();
