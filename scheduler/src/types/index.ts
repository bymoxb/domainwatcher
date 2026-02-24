export type DwRegistry = {
  id: string;
  domain: string;
  registry_expires_at: Date;
};

export type DwWatcher = {
  id: string;
  mail_address: string;
  dw_registry: DwRegistry;
  notification_enabled: boolean;
  deleted_at: Date | null;
};

export type GroupedResult = {
  dw_registry: DwRegistry;
  watchers: DwWatcher[];
};

export enum AppEvents {
  REGISTRY_TO_EXPIRE = 'registry.to.expire',
}

export interface EventHandles {
  handle(event: GroupedResult[]): Promise<void>;
}
