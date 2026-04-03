package postgres

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"time"

	"github.com/google/uuid"
)

// create table dw_registry(
//     id uuid DEFAULT gen_random_uuid() NOT NULL,
//     domain varchar(128) NOT NULL,
//     origin varchar(128) NOT NULL,
//     registry_created_at timestamp NOT NULL,
//     registry_updated_at timestamp NULL,
//     registry_expires_at timestamp NOT NULL,
//     --
//     created_at timestamp DEFAULT now() NOT NULL,
//     updated_at timestamp NULL,
//     deleted_at timestamp NULL,
//     CONSTRAINT registry_pkey PRIMARY KEY (id)
// );

type RegistryModel struct {
	ID                uuid.UUID  `gorm:"type:uuid;primary_key;"`
	Domain            string     `gorm:"type:varchar(128);not null"`
	Origin            string     `gorm:"type:varchar(128);not null"`
	Registrar         *string    `gorm:"type:varchar(128)"`
	RegistryCreatedAt time.Time  `gorm:"not null"`
	RegistryUpdatedAt *time.Time `gorm:"default:NULL"`
	RegistryExpiresAt time.Time  `gorm:"not null"`
	CreatedAt         time.Time
	UpdatedAt         *time.Time
	DeletedAt         *time.Time
	// Watchers          []*WatcherEntity `gorm:"foreignKey:RegistryID"`
}

func (RegistryModel) TableName() string {
	return "dw_registry"
}

func MapRegistryToDomain(entity *RegistryModel) *registry.Registry {

	if entity == nil {
		return nil
	}

	// var watchers []*watcher.Watcher
	_domain, _ := vos.NewDomain(&entity.Domain)

	// if entity.Watchers != nil {
	// 	for _, item := range entity.Watchers {
	// 		watchers = append(watchers, MapWatcherToDomain(item))
	// 	}
	// }

	return &registry.Registry{
		ID:                entity.ID,
		Domain:            *_domain,
		Origin:            entity.Origin,
		Registrar:         entity.Registrar,
		RegistryCreatedAt: entity.RegistryCreatedAt,
		RegistryUpdatedAt: entity.RegistryUpdatedAt,
		RegistryExpiresAt: entity.RegistryExpiresAt,
		CreatedAt:         entity.CreatedAt,
		UpdatedAt:         entity.UpdatedAt,
		// Watcher:           watchers,
	}
}
