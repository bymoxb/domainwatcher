package postgres

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/domain/watcher"
	"time"

	"github.com/google/uuid"
)

// create table dw_watcher(
//     id uuid DEFAULT gen_random_uuid() NOT NULL,
//     registry_id uuid NOT NULL,
//     mail_address varchar(128) NOT NULL,
//     notification_enabled boolean NOT NULL DEFAULT TRUE,
//     --
//     created_at timestamp DEFAULT now() NOT NULL,
//     updated_at timestamp NULL,
//     deleted_at timestamp NULL,
//     CONSTRAINT watcher_ukey UNIQUE (mail_address, registry_id),
//     CONSTRAINT registry_id_fkey FOREIGN KEY (registry_id) REFERENCES dw_registry(id),
//     CONSTRAINT watcher_pkey PRIMARY KEY (id)
// );

type WatcherModel struct {
	ID                  uuid.UUID `gorm:"type:uuid;primary_key;"`
	MailAddress         string    `gorm:"type:varchar(128);not null"`
	NotificationEnabled bool      `gorm:"default:true"`
	RegistryID          uuid.UUID `gorm:"type:uuid;not null;index"`
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
	}
}

func MapWatcherToDomainList(entities []*WatcherModel) []*watcher.Watcher {
	var items []*watcher.Watcher

	for _, entity := range entities {
		items = append(items, MapWatcherToDomain(entity))
	}

	return items
}
