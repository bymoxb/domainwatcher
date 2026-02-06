import { IWatcherRepository } from '../../domain/IWatcherRepository';

export class GetWatcherByIdUseCase {
  constructor(
    private readonly watcherRepository: IWatcherRepository,
  ) { };

  public async execute(id: string) {
    const watcher = await this.watcherRepository.getById(id);

    if (!watcher) {
      throw new Error('Registro no encontrado');
    }

    return watcher;
  }
}
