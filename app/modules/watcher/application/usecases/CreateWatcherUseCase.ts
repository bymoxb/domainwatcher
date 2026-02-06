import { IRegistryRepository } from "@/modules/registry/domain/IRegistryRepository";
import { IWatcherRepository } from "../../domain/IWatcherRepository";
import { Watcher } from "../../domain/Watcher";

export class CreateWatcherUseCase {
  constructor(
    private readonly watcherRepository: IWatcherRepository,
    private readonly registryRepository: IRegistryRepository,
  ) { }

  public async execute(request: { registryId: string; email: string }) {
    const registry = await this.registryRepository.getById(request.registryId);

    if (!registry) {
      throw new Error('No encontrado');
    }

    const alreadyWatching = await this.watcherRepository.getByIdAndEmail(
      request.registryId,
      request.email,
    );

    if (alreadyWatching) {
      return;
    }

    const watcher = new Watcher({
      registryId: registry.getId,
      email: request.email,
    });

    await this.watcherRepository.create(watcher);

    return watcher;
  }
}
