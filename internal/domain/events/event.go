package events

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/watcher"
)

type Broker interface {
	Subscribe() chan Event
	Publish(event Event)
}

type Event struct {
	Registry registry.Registry
	Watchers []watcher.Watcher
}

type Subscriber interface {
	Subscribe(channel chan Event)
}
