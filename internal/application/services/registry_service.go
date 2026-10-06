package services

import (
	"log/slog"
	"time"

	"github.com/bymoxb/domainwatcher/internal/domain/events"
	"github.com/bymoxb/domainwatcher/internal/domain/registry"
	"github.com/bymoxb/domainwatcher/internal/domain/vos"
	"github.com/bymoxb/domainwatcher/internal/domain/watcher"
)

type RegistryService struct {
	rr               registry.RegistryRepository
	wr               watcher.WatcherRepository
	adapters         []registry.RegistryResource
	broker           events.Broker
	daysLeftToExpire int
}

func NewRegistryService(rr registry.RegistryRepository, wr watcher.WatcherRepository,
	adapters []registry.RegistryResource,
	dispatcher events.Broker,
	daysLeftToExpire int) *RegistryService {
	return &RegistryService{rr: rr, adapters: adapters, daysLeftToExpire: daysLeftToExpire, broker: dispatcher, wr: wr}
}

func (rs *RegistryService) CheckRegistryStatus() {
	result := rs.rr.GetAboutExpiredRegistries(rs.daysLeftToExpire)

	for _, r := range result {

		watchers := rs.wr.GetWatchersToNotify(r.ID)

		rs.broker.Publish(events.Event{
			Topic: events.TopicNotification,
			Content: events.NotificationData{
				Registry: r,
				Watchers: watchers,
			},
		})

		rs.broker.Publish(events.Event{
			Topic: events.TopicRegistryChanged,
			Content: events.RegistryChangedData{
				Registry: r,
			},
		})
	}
}

func (rs *RegistryService) SearchInAdapters(domain vos.Domain) *registry.Registry {
	for _, adapter := range rs.adapters {
		slog.Info("Search in adapter", "adapter", adapter.GetName(), "domain", domain.Value())
		registry := adapter.GetData(domain)
		if registry != nil {
			return registry
		}
	}

	slog.Warn("Domain not found in any adapter", "domain", domain.Value())
	return nil
}

func (rs *RegistryService) SearchRegistry(domain vos.Domain) *registry.Registry {
	reg := rs.rr.SearchRegistry(domain)

	if reg != nil {

		var lastDate = reg.CreatedAt
		if reg.UpdatedAt != nil {
			lastDate = *reg.UpdatedAt
		}

		if isMoreThan(lastDate, rs.daysLeftToExpire) {
			reg = rs.RefreshRegistry(reg)
		}

		return reg
	}

	if reg = rs.SearchInAdapters(domain); reg != nil {
		return rs.rr.CreateRegistry(*reg)
	}

	return rs.rr.CreateRegistry(registry.NewRegistry(domain, vos.StatusWatchlist))
}

func (rs *RegistryService) RefreshRegistry(registry *registry.Registry) *registry.Registry {
	if registry == nil {
		return registry
	}

	if tempRegistry := rs.SearchInAdapters(registry.Domain); tempRegistry != nil {
		return rs.rr.UpdateRegistry(registry.ID, *tempRegistry)
	}

	return registry

}

func isMoreThan(fecha time.Time, days int) bool {
	now := time.Now()

	diff := now.Sub(fecha)

	daysInRange := time.Duration(days) * 24 * time.Hour

	if diff >= daysInRange {
		return true
	}
	return false
}
