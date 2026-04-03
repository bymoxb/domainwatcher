package registry

import (
	"domainwatcher/internal/domain/vos"
	"time"

	"github.com/google/uuid"
)

type Registry struct {
	ID                uuid.UUID
	Domain            vos.Domain
	Origin            string
	Registrar         *string
	RegistryCreatedAt time.Time
	RegistryUpdatedAt *time.Time
	RegistryExpiresAt time.Time
	CreatedAt         time.Time
	UpdatedAt         *time.Time
	DeletedAt         *time.Time
	// Watcher           []*watcher.Watcher
}
