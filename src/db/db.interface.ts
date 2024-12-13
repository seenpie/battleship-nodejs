export interface IDatabaseService<T> {
  findAll(): T[];
  findById(id: string): T | undefined;
  create(item: T): void;
  update(id: string, item: Partial<T>): void;
  delete(id: string): void;
}
