package events

import (
	"github.com/bymoxb/domainwatcher/internal/application/services"
	"github.com/bymoxb/domainwatcher/internal/domain/events"
)

type SubRegistry struct {
	rs services.RegistryService
}

func NewSubRegistry(rs services.RegistryService) *SubRegistry {
	return &SubRegistry{rs: rs}
}

func (ctx *SubRegistry) Subscribe(channel chan events.Event) {
	for event := range channel {
		ctx.rs.RefreshRegistry(&event.Registry)
	}
}
