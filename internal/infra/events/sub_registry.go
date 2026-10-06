package events

import (
	"log/slog"

	"github.com/bymoxb/domainwatcher/internal/application/services"
	"github.com/bymoxb/domainwatcher/internal/domain/events"
)

type SubRegistry struct {
	rs services.RegistryService
}

func NewSubRegistry(rs services.RegistryService) *SubRegistry {
	return &SubRegistry{rs: rs}
}

func (ctx *SubRegistry) Run(channel <-chan events.Event) {
	for event := range channel {
		data, ok := event.Content.(events.RegistryChangedData)

		if !ok {
			slog.Error(
				"invalid event data",
				"topic", event.Topic,
				"expected", "RegistryChangedData",
			)
			continue
		}

		ctx.rs.RefreshRegistry(&data.Registry)
	}
}
