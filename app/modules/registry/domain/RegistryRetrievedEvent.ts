import { Registry } from './Registry';

export class RegistryRetrievedEvent {
  private registry: Registry;

  constructor(registry: Registry) {
    this.registry = registry;
  }

  public get getRegistry() {
    return this.registry;
  }
}
