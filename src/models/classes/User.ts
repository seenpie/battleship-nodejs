export class User {
  readonly name: string;
  readonly password: string;
  readonly id: string;
  online: boolean = true;
  wins: number;

  constructor(name: string, password: string, id: string) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.wins = 0;
  }
}
