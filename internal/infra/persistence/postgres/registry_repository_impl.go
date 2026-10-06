package postgres

import (
	"time"

	"github.com/bymoxb/domainwatcher/internal/domain/registry"
	"github.com/bymoxb/domainwatcher/internal/domain/vos"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RegistryRepositoryImpl struct {
	DB *gorm.DB
}

func NewRegistryRepository(DB *gorm.DB) *RegistryRepositoryImpl {
	return &RegistryRepositoryImpl{DB: DB}
}

func (rr *RegistryRepositoryImpl) CreateRegistry(model registry.Registry) *registry.Registry {

	entity := &RegistryModel{
		ID:                model.ID,
		Domain:            model.Domain.Value(),
		Status:            string(model.Status),
		Origin:            model.Origin,
		Registrar:         model.Registrar,
		RegistryCreatedAt: model.RegistryCreatedAt,
		RegistryUpdatedAt: model.RegistryUpdatedAt,
		RegistryExpiresAt: model.RegistryExpiresAt,
		CreatedAt:         time.Now(),
	}

	rr.DB.Create(entity)

	return MapRegistryToDomain(entity)
}

func (rr *RegistryRepositoryImpl) SearchRegistry(domain vos.Domain) *registry.Registry {

	var registry *RegistryModel

	result := rr.DB.Where(&RegistryModel{Domain: domain.Value()}).First(&registry)

	if result.Error != nil {
		return nil
	}

	return MapRegistryToDomain(registry)
}

func (rr *RegistryRepositoryImpl) GetById(id uuid.UUID) *registry.Registry {

	var registry *RegistryModel

	result := rr.DB.Where(&RegistryModel{ID: id}).Find(&registry)

	if result.Error != nil {
		return nil
	}

	return MapRegistryToDomain(registry)
}

func (rr *RegistryRepositoryImpl) UpdateRegistry(registryId uuid.UUID, model registry.Registry) *registry.Registry {
	now := time.Now()

	rr.DB.
		Model(&RegistryModel{ID: registryId}).
		Updates(RegistryModel{
			Origin:            model.Origin,
			Status:            string(model.Status),
			Registrar:         model.Registrar,
			RegistryCreatedAt: model.RegistryCreatedAt,
			RegistryUpdatedAt: model.RegistryUpdatedAt,
			RegistryExpiresAt: model.RegistryExpiresAt,
			UpdatedAt:         &now,
		})

	return rr.GetById(registryId)
}

func (rr *RegistryRepositoryImpl) GetAboutExpiredRegistries(days int) []registry.Registry {

	var registries []registry.Registry = []registry.Registry{}

	now := time.Now()
	final := now.AddDate(0, 0, days)

	var origins []RegistryModel
	result := rr.DB.
		Where("status = ?", vos.StatusMonitored).
		Where("registry_expires_at IS NOT NULL").
		Where("registry_expires_at < ?", final).
		Find(&origins)

	if result.Error != nil {
		return []registry.Registry{}
	}

	for _, r := range origins {
		registries = append(registries, *MapRegistryToDomain(&r))
	}

	return registries
}

func (rr *RegistryRepositoryImpl) GetUnregisteredRegistries() []registry.Registry {

	var registries []registry.Registry = []registry.Registry{}

	var origins []RegistryModel
	result := rr.DB.
		Where("status = ?", vos.StatusWatchlist).
		Find(&origins)

	if result.Error != nil {
		return []registry.Registry{}
	}

	for _, r := range origins {
		registries = append(registries, *MapRegistryToDomain(&r))
	}

	return registries
}

func (rr *RegistryRepositoryImpl) DeleteRegistry(id uuid.UUID) error {
	return rr.DB.Delete(&RegistryModel{ID: id}).Error
}
