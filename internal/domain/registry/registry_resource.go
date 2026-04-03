package registry

import (
	"domainwatcher/internal/domain/vos"
)

type RegistryResource interface {
	GetData(domain vos.Domain) *Registry
}
