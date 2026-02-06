import { Registry } from "../../domain/Registry";
import { RegistryResponse } from "../dtos/RegistryResponse";

export class RegistryMapper {
  public static toDTO(domain: Registry): RegistryResponse {
    return {
      id: domain.getId,
      domain: domain.getDomain,
      origin: domain.getOrigin,
      registryExpiresAt: domain.getRegistryExpiresAt.toString(),
      registryCreatedAt: domain.getRegistryCreatedAt.toString(),
      registryUpdatedAt: domain.getRegistryUpdatedAt ? domain.getRegistryUpdatedAt.toString() : null,
    }
  }
}