export class Room<T> {
  public readonly members: T[];
  public readonly id: string;
  public readonly host: T;

  constructor(user: T, id: string) {
    this.host = user;
    this.members = [user];
    this.id = id;
  }
}
