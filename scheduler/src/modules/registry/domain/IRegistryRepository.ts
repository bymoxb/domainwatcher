import { Domain } from "./Domain";
import { Registry } from "./Registry";

export interface IRegistryRepository {
  create(payload: Registry): Promise<void>;
  update(payload: Registry): Promise<void>;
  getById(id: string): Promise<Registry | null>;
  getByDomain(domain: Domain): Promise<Registry | null>;
}
