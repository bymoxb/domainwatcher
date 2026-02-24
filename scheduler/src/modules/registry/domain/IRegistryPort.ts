import { Domain } from "./Domain";
import { Registry } from "./Registry";

export interface IRegistryPort {
  searchByDomain(domain: Domain): Promise<Registry | null>;
}
