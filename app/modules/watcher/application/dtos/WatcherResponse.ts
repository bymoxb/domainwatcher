import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";

export interface WatcherResponse {
  id: string;
  registryId: string;
  email: string;
  notificationEnabled: boolean;
  registry: RegistryResponse;
  //
  type: "watcher";
}

export type SearchDomainsForm = {
  email?: string;
  order?: string;
  direction?: string;
  domain?: string;
};

