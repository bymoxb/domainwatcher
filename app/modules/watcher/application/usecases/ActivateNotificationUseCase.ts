import { IWatcherRepository } from '../../domain/IWatcherRepository';

export class ActivateNotificationUseCase {
  constructor(private readonly watcherRepository: IWatcherRepository) { }

  public async execute(watcherId: string) {
    const watcher = await this.watcherRepository.getById(watcherId);
    if (!watcher) {
      throw new Error('Registro no encontrado');
    }
    await this.watcherRepository.activateNotification(watcher.getId);
  }
}
