import { DbService } from "@/db/db.service";
import { Client } from "@/features/client/client.entity";

export class ClientRepository {
  private dbService: DbService<Client>;

  constructor() {
    this.dbService = new DbService();
  }

  delete(client: Client): void {
    this.dbService.delete(client.id);
  }

  getAll() {
    return this.dbService.findAll();
  }

  getAllWinners() {
    const allClients = this.getAll();
    return allClients.reduce<Client[]>((acc, client) => {
      if (client.winsCount > 0) {
        acc.push(client);
      }
      return acc;
    }, []);
  }

  add(client: Client) {
    this.dbService.create(client);
  }
}

export const clientRepo = new ClientRepository();
