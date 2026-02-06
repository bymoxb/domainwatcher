import { Watcher } from './Watcher';

export interface IWatcherRepository {
  create(payload: Watcher): Promise<void>;
  getById(id: string): Promise<Watcher | null>;
  getByEmail(email: string): Promise<Array<Watcher>>;
  getByIdAndEmail(id: string, email: string): Promise<Watcher | null>;
  activateNotification(watcherId: string): Promise<void>;
  deactivateNotification(watcherId: string): Promise<void>;
}
