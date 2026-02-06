import { Registry } from "@/modules/registry/domain/Registry";

interface IWatcherConstructor {
  id?: string;
  registryId: string;
  email: string;
  notificationEnabled?: boolean;
  registry?: Registry;
}

export class Watcher {
  private id: string;
  private registryId: string;
  private email: string;
  private notificationEnabled: boolean;
  private registry?: Registry | null;

  constructor(args: IWatcherConstructor) {
    this.id = args.id ? args.id : crypto.randomUUID();
    this.registryId = args?.registryId;
    this.email = args?.email;
    this.notificationEnabled = args?.notificationEnabled ?? true;
    this.registry = args?.registry;
  }

  public get getId() {
    return this.id;
  }

  public get getRegistryId() {
    return this.registryId;
  }

  public get getNotificationEnabled() {
    return this.notificationEnabled;
  }

  public get getEmail() {
    return this.email;
  }

  public get getRegistry() {
    return this.registry;
  }
}
