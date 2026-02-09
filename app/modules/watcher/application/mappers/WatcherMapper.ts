import { RegistryMapper } from "@/modules/registry/application/mappers/RegistryMapper";
import { Watcher } from "../../domain/Watcher";
import { WatcherResponse } from "../dtos/WatcherResponse";

export class WatcherMapper {
  public static toDTO(domain: Watcher): WatcherResponse {
    return {
      id: domain.getId,
      email: domain.getEmail,
      registryId: domain.getRegistryId,
      notificationEnabled: domain.getNotificationEnabled,
      registry: domain.getRegistry ? RegistryMapper.toDTO(domain.getRegistry) : null,
      type: "watcher",
    }
  }
}
