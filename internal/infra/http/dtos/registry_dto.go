package dtos

type Registry struct {
	ID                string  `json:"id"`
	Domain            string  `json:"domain"`
	Origin            string  `json:"origin"`
	Registrar         *string `json:"registrar"`
	RegistryCreatedAt string  `json:"registryCreatedAt"`
	RegistryUpdatedAt *string `json:"registryUpdatedAt"`
	RegistryExpiresAt string  `json:"registryExpiresAt"`
	// CreatedAt         string
	// UpdatedAt         *string
	// DeletedAt         *string
}
