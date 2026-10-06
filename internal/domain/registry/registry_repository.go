package registry

import (
	"github.com/bymoxb/domainwatcher/internal/domain/vos"

	"github.com/google/uuid"
)

type RegistryRepository interface {
	CreateRegistry(model Registry) *Registry
	SearchRegistry(domain vos.Domain) *Registry
	GetById(id uuid.UUID) *Registry
	UpdateRegistry(registryId uuid.UUID, model Registry) *Registry
	GetAboutExpiredRegistries(days int) []Registry
	GetUnregisteredRegistries() []Registry
	DeleteRegistry(id uuid.UUID) error
}
