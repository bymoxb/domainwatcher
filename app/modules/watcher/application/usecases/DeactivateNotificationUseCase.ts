import { IWatcherRepository } from '../../domain/IWatcherRepository';

export class DeactivateNotificationUseCase {
  constructor(private readonly watcherRepository: IWatcherRepository) { }

  public async execute(watcherId: string) {
    return await this.watcherRepository.deactivateNotification(watcherId);
  }
}
