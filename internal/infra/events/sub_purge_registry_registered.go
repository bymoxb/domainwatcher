package events

import (
	"log/slog"

	"github.com/bymoxb/domainwatcher/internal/application/services"
	"github.com/bymoxb/domainwatcher/internal/domain/events"
)

type SubPurgeRegistryUnregistered struct {
	rs services.RegistryService
}

func NewSubPurgeRegistryUnregistered(rs services.RegistryService) *SubPurgeRegistryUnregistered {
	return &SubPurgeRegistryUnregistered{rs: rs}
}

func (s *SubPurgeRegistryUnregistered) Run(channel <-chan events.Event) {

	for event := range channel {
		data, ok := event.Content.(events.RegistryUnregisteredAndNotWatchedData)
		if !ok {
			slog.Error(
				"invalid event data",
				"topic", event.Topic,
				"expected", "RegistryUnregisteredAndNotWatchedData",
			)
			continue
		}

		slog.Debug("SubPurgeRegistryUnregistered running", "domain", data.Registry.Domain.Value())

		s.rs.DeleteRegistry(data.Registry)
	}
}
