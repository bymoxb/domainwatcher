import type { RegistryResponse } from "./registry.type"

export type WatcherResponse = {
  id: string,
  email: string,
  notificationEnabled: boolean,
  registryId: string,
  registry: RegistryResponse,
}
