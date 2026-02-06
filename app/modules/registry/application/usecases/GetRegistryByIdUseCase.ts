import { IRegistryRepository } from "../../domain/IRegistryRepository";

export class GetRegistryByIdUseCase {
  constructor(
    private readonly registryRepository: IRegistryRepository,
  ) { }

  public async execute(id: string) {
    const registry = await this.registryRepository.getById(id);

    if (!registry) {
      throw new Error('Dominio no encontrado');
    }

    return registry;
  }
}
