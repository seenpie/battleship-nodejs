import { database } from "@/db/Database";
import { IUserManager } from "@/models/interfaces";

type TLeaderboardList = {
  name: string;
  wins: number;
};

export class UserRepository {
  public static getUsersList(): IUserManager[] {
    const users = database.getUsers();
    return Array.from(users.values());
  }

  public static getUserByName(name: string) {
    const userList = this.getUsersList();
    return userList.find((user) => user.getName() === name);
  }

  public static getLeaderboard(): TLeaderboardList[] {
    const userList = this.getUsersList();
    return userList
      .reduce<TLeaderboardList[]>((list, user) => {
        const wins = user.getWins();
        if (wins > 0) {
          list.push({ name: user.getName(), wins });
        }
        return list;
      }, [])
      .sort((a, b) => a.wins - b.wins);
  }

  public static setUserInDB(user: IUserManager) {
    database.insertUser(user);
  }
}
