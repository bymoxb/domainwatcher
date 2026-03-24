import { IWatcherRepository } from '../../domain/IWatcherRepository';

export class GetWatcherByEmailUseCase {
  constructor(private readonly watcherRepository: IWatcherRepository) {}

  public async execute(email: string, order?: string, direction?: string) {
    if (!email.trim().length) {
      return [];
    }

    return await this.watcherRepository.getByEmail(email, order, direction);
  }
}
