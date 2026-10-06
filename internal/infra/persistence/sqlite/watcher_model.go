package sqlite

import (
	"time"

	"github.com/bymoxb/domainwatcher/internal/domain/registry"
	"github.com/bymoxb/domainwatcher/internal/domain/vos"
	"github.com/bymoxb/domainwatcher/internal/domain/watcher"

	"github.com/google/uuid"
)

type WatcherModel struct {
	ID                  uuid.UUID `gorm:"type:TEXT;primary_key;"`
	MailAddress         string    `gorm:"type:varchar(128);not null"`
	NotificationEnabled bool      `gorm:"default:true"`
	RegistryID          uuid.UUID `gorm:"type:TEXT;not null;index"`
	CreatedAt           time.Time
	UpdatedAt           *time.Time
	DeletedAt           *time.Time
	Registry            *RegistryModel `gorm:"foreignKey:RegistryID;association_foreignkey:ID"`
}

func (WatcherModel) TableName() string {
	return "dw_watcher"
}

func MapWatcherToDomain(entity *WatcherModel) *watcher.Watcher {
	email, _ := vos.NewEmail(&entity.MailAddress)
	var registry *registry.Registry

	if entity.Registry != nil {
		registry = MapRegistryToDomain(entity.Registry)
	}

	return &watcher.Watcher{
		ID:                  entity.ID,
		MailAddress:         *email,
		NotificationEnabled: entity.NotificationEnabled,
		RegistryID:          entity.RegistryID,
		Registry:            registry,
		CreatedAt:           entity.CreatedAt,
		UpdatedAt:           entity.UpdatedAt,
		DeletedAt:           entity.DeletedAt,
	}
}

func MapWatcherToDomainList(entities []*WatcherModel) []*watcher.Watcher {
	var items []*watcher.Watcher

	for _, entity := range entities {
		items = append(items, MapWatcherToDomain(entity))
	}

	return items
}
