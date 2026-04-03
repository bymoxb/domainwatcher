package services

import (
	"domainwatcher/internal/domain/events"
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/domain/watcher"
	"fmt"
	"time"
)

type RegistryService struct {
	rr               registry.RegistryRepository
	wr               watcher.WatcherRepository
	adapters         []registry.RegistryResource
	dispatcher       events.Broker
	daysLeftToExpire int
}

func NewRegistryService(rr registry.RegistryRepository, wr watcher.WatcherRepository,
	adapters []registry.RegistryResource,
	dispatcher events.Broker,
	daysLeftToExpire int) *RegistryService {
	return &RegistryService{rr: rr, adapters: adapters, daysLeftToExpire: daysLeftToExpire, dispatcher: dispatcher, wr: wr}
}

func (rs *RegistryService) CheckRegistryStatus() {
	result := rs.rr.GetAboutExpiredRegistries(rs.daysLeftToExpire)

	for _, r := range result {

		watchers := rs.wr.GetWatchersToNotify(r.ID)

		fmt.Printf("domain=%s\twatchers=%d\n", r.Domain.Value(), len(watchers))

		rs.dispatcher.Publish(events.Event{Registry: r, Watchers: watchers})
	}
}

func (rs *RegistryService) SearchInAdapters(domain vos.Domain) *registry.Registry {
	fmt.Printf("Search in adapter: %s\n", domain.Value())
	for _, adapter := range rs.adapters {
		registry := adapter.GetData(domain)
		if registry != nil {
			return registry
		}
	}

	fmt.Printf("NOT FOUND Search in adapter: %s\n", domain.Value())
	return nil
}

func (rs *RegistryService) SearchRegistry(domain vos.Domain) *registry.Registry {
	registry := rs.rr.SearchRegistry(domain)

	if registry != nil {

		var lastDate = registry.CreatedAt
		if registry.UpdatedAt != nil {
			lastDate = *registry.UpdatedAt
		}

		if isMoreThan(lastDate, 1) {
			registry = rs.RefreshRegistry(registry)
		}

		return registry
	}

	if registry = rs.SearchInAdapters(domain); registry != nil {
		return rs.rr.CreateRegistry(*registry)
	}

	return nil
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
