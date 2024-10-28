import { User } from "@/models/classes/User";
import { IUserManager } from "@/models/interfaces";
import { UserRepository } from "@/repositories/UserRepository";

export class UserManager implements IUserManager {
  private user: User;

  constructor(name: string, password: string, id: string) {
    this.user = new User(name, password, id);
    UserRepository.setUserInDB(this);
  }

  public setOnlineStatus(status: boolean): void {
    this.user.online = status;
  }

  public isOnline(): boolean {
    return this.user.online;
  }

  public getName(): string {
    return this.user.name;
  }

  public getId(): string {
    return this.user.id;
  }

  public getPassword(): string {
    return this.user.password;
  }

  public getWins(): number {
    return this.user.wins;
  }
}
