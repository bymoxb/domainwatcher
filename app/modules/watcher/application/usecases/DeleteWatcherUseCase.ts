import { IWatcherRepository } from "../../domain/IWatcherRepository";

export class DeleteWatcherUseCase {
  constructor(private readonly watcherRepository: IWatcherRepository) {}

  public async execute(watcherId: string) {
    await this.watcherRepository.deleteById(watcherId);
  }
}
