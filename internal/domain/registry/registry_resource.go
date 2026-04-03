package registry

import (
	"domainwatcher/internal/domain/vos"
)

type RegistryResource interface {
	GetName() string
	GetData(domain vos.Domain) *Registry
}
