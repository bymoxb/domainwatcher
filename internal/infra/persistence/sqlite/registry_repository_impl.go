package sqlite

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"fmt"
	"time"

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
		Origin:            model.Origin,
		Registrar:         model.Registrar,
		RegistryCreatedAt: model.RegistryCreatedAt,
		RegistryUpdatedAt: model.RegistryUpdatedAt,
		RegistryExpiresAt: model.RegistryExpiresAt,
		CreatedAt:         time.Now(),
	}

	fmt.Printf("%+v\n", entity)

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
	fmt.Printf("GetById-Searching=%s\n", id.String())

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
		Where("registry_expires_at < ?", final).
		Find(&origins)

	if result.Error != nil {
		fmt.Printf("Ocurrio un error al buscar los dominios que esta apunto de expirar: %v\n ", result.Error.Error())
		return []registry.Registry{}
	}

	for _, r := range origins {
		registries = append(registries, *MapRegistryToDomain(&r))
	}

	return registries
}
