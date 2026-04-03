package events

import (
	"domainwatcher/internal/application/services"
	"domainwatcher/internal/domain/events"
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
