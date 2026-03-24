import { Watcher } from './Watcher';

export interface IWatcherRepository {
  create(payload: Watcher): Promise<void>;
  getById(id: string): Promise<Watcher | null>;
  getByEmail(
    email: string,
    order?: string,
    direction?: string
  ): Promise<Array<Watcher>>;
  getByIdAndEmail(id: string, email: string): Promise<Watcher | null>;
  activateNotification(watcherId: string): Promise<Watcher | null>;
  deactivateNotification(watcherId: string): Promise<Watcher | null>;
  activateById(watcherId: string): Promise<Watcher>;
  deleteById(watcherId: string): Promise<void>;
}
