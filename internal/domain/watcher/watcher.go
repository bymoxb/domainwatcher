package watcher

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"time"

	"github.com/google/uuid"
)

type Watcher struct {
	ID                  uuid.UUID
	MailAddress         vos.Email
	NotificationEnabled bool
	RegistryID          uuid.UUID
	CreatedAt           time.Time
	UpdatedAt           *time.Time
	DeletedAt           *time.Time
	Registry            *registry.Registry
}
