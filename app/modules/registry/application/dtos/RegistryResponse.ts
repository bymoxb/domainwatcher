export interface RegistryResponse {
  id: string;
  domain: string;
  origin: string;
  registryCreatedAt: string,
  registryUpdatedAt?: string | null,
  registryExpiresAt: string,
}