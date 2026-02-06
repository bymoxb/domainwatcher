import { Registry } from './Registry';

export interface IRegistryPort {
  searchByDomain(domain: string): Promise<Registry | null>;
}
