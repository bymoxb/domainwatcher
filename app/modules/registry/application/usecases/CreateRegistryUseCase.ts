import { IRegistryRepository } from "../../domain/IRegistryRepository";
import { Registry } from "../../domain/Registry";

export class CreateRegistryUseCase {
  constructor(private readonly registryRepository: IRegistryRepository) { }

  public async execute(registry: Registry) {
    const alreadyExist = await this.registryRepository.getByDomain(
      registry.getDomain,
    );

    if (alreadyExist) {
      this.registryRepository.update(registry);
    }

    this.registryRepository.create(registry);
  }
}
