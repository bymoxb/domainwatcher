package watcher

import (
	"domainwatcher/internal/domain/vos"

	"github.com/google/uuid"
)

type WatcherRepository interface {
	SearchWatcher(email vos.Email, order string, sort string) []*Watcher
	GetById(watcherId uuid.UUID) (*Watcher, error)
	GetByRegistryIdAndEmail(email vos.Email, registryId uuid.UUID) (*Watcher, error)
	CreateWatcher(model Watcher) (*uuid.UUID, error)
	DeleteWatcher(watcherId uuid.UUID)
	UnDeleteWatcher(watcherId uuid.UUID)
	TurnOnNotification(watcherId uuid.UUID)
	TurnOffNotification(watcherId uuid.UUID)
	GetWatchersToNotify(registryId uuid.UUID) []Watcher
}
