import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";

export interface WatcherResponse {
  id: string;
  registryId: string;
  email: string;
  notificationEnabled: boolean;
  registry: RegistryResponse | null;
  //
  type: "watcher",
}
