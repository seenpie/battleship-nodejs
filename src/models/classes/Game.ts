export class Game<T, V> {
  readonly id: string;
  public items: V[];
  public players: T[];

  constructor(id: string, players: T[]) {
    this.id = id;
    this.players = players;
    this.items = [];
  }
}
