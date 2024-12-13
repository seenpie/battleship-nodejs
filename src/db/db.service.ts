import { IDatabaseService } from "@/db/db.interface";

export class DbService<T> implements IDatabaseService<T> {
  private storage: Map<string, T> = new Map();

  findAll(): T[] {
    return Array.from(this.storage.values());
  }

  findById(id: string): T | undefined {
    return this.storage.get(id);
  }

  create(item: T) {
    const id = (item as { id: string }).id;
    if (!id) throw new Error("not id in entity");
    this.storage.set(id, item);
  }

  update(id: string, item: Partial<T>) {
    const existingItem = this.findById(id);
    if (!existingItem) {
      throw new Error(`Item with id ${id} not found`);
    }
    this.storage.set(id, { ...existingItem, ...item });
  }

  delete(id: string) {
    this.storage.delete(id);
  }
}
