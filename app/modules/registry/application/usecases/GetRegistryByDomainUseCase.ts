import { IRegistryPort } from "../../domain/IRegistryPort";
import { IRegistryRepository } from "../../domain/IRegistryRepository";
import { Registry } from "../../domain/Registry";


export class GetRegistryByDomainUseCase {
  constructor(
    private readonly registryRepository: IRegistryRepository,
    private readonly registries: IRegistryPort[],
  ) { }

  public async execute(domain: string) {
    let registry: Registry | null = null;

    registry = await this.registryRepository.getByDomain(domain);

    if (registry) {
      return registry;
    }

    for (const reg of this.registries) {
      registry = await reg.searchByDomain(domain);

      if (registry) {
        break;
      }
    }

    if (registry) {
      await this.registryRepository.create(registry);
    }

    return registry;

  }
}
