interface IRegistryConstructor {
  id?: string;
  domain: string;
  origin: string;
  registryCreatedAt: Date,
  registryUpdatedAt?: Date | null,
  registryExpiresAt: Date,
  // audit
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class Registry {
  private id: string;
  private domain: string;
  private origin: string;
  private registryCreatedAt: Date;
  private registryUpdatedAt?: Date | null;
  private registryExpiresAt: Date;
  // audit
  private createdAt: Date;
  private updatedAt: Date | null;

  constructor(args: IRegistryConstructor) {
    this.id = args?.id ? args.id : crypto.randomUUID();
    this.domain = args.domain.toLowerCase();
    this.origin = args.origin.toLowerCase();
    this.registryCreatedAt = args?.registryCreatedAt;
    this.registryUpdatedAt = args?.registryUpdatedAt;
    this.registryExpiresAt = args?.registryExpiresAt;
    // audit
    this.createdAt = args?.createdAt ? args?.createdAt : new Date();
    this.updatedAt = args?.updatedAt ? args?.updatedAt : null;
  }

  public get getId(): string {
    return this.id;
  }

  public get getDomain(): string {
    return this.domain;
  }

  public get getOrigin(): string {
    return this.origin;
  }

  public get getCreatedAt(): Date {
    return this.createdAt;
  }

  public get getUpdatedAt(): Date | null {
    return this.updatedAt;
  }

  public get getRegistryCreatedAt() {
    return this.registryCreatedAt;
  }
  public get getRegistryUpdatedAt() {
    return this.registryUpdatedAt;
  }
  public get getRegistryExpiresAt() {
    return this.registryExpiresAt;
  }
}
