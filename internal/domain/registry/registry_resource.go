package registry

import (
	"github.com/bymoxb/domainwatcher/internal/domain/vos"
)

type RegistryResource interface {
	GetName() string
	GetData(domain vos.Domain) *Registry
}
