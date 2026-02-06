import { IRegistryRepository } from "../../domain/IRegistryRepository";
import { Registry } from "../../domain/Registry";


export class UpdateRegistryUseCase {
  constructor(
    public registryRepository: IRegistryRepository,
  ) { };

  public async execute(registry: Registry) {
    await this.registryRepository.update(registry);
  }
}
