export type RegistryResponse = {
    id: string;
    domain: string;
    origin: string;
    registrar?: string | null;
    registryCreatedAt: string,
    registryUpdatedAt?: string | null,
    registryExpiresAt: string,
}
