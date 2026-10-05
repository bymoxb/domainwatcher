export const RegistryStatus = {
    MONITORED: "MONITORED",
    WATCHLIST: "WATCHLIST",
    EXPIRED: "EXPIRED",
} as const;

export type RegistryStatus = (typeof RegistryStatus)[keyof typeof RegistryStatus];

export type RegistryResponse = {
    id: string;
    domain: string;
    status: RegistryStatus;
    origin: string;
    registrar?: string | null;
    registryCreatedAt: string,
    registryUpdatedAt?: string | null,
    registryExpiresAt: string,
}
