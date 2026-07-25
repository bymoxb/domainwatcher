package watcher

import (
	"time"

	"github.com/bymoxb/domainwatcher/internal/domain/registry"
	"github.com/bymoxb/domainwatcher/internal/domain/vos"

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
