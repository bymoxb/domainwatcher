package events

import (
	"github.com/bymoxb/domainwatcher/internal/domain/registry"
	"github.com/bymoxb/domainwatcher/internal/domain/watcher"
)

type RegistryChangedData struct {
	Registry registry.Registry
}

type NotificationData struct {
	Registry registry.Registry
	Watchers []watcher.Watcher
}
