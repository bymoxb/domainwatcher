package controllers

import (
	"domainwatcher/internal/application/services"
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/infra/http/dtos"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RegistryController struct {
	service services.RegistryService
}

func NewRegistryController(usecase services.RegistryService) *RegistryController {
	return &RegistryController{service: usecase}
}

func (rc *RegistryController) SearchRegistry(c *gin.Context) {
	_domain := c.Query("domain")

	domain, err := vos.NewDomain(&_domain)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	registry := rc.service.SearchRegistry(*domain)

	if registry == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"ok":      false,
			"message": "Domain not found",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": MapRegistryToDTO(registry),
	})
}

func MapRegistryToDTO(registry *registry.Registry) dtos.Registry {

	var registryUpdatedAt string
	// var registrar *string

	if registry.RegistryUpdatedAt != nil {
		registryUpdatedAt = registry.RegistryUpdatedAt.String()
	}

	// if registry.Registrar != nil {
	// 	registrar = registry.Registrar
	// }

	return dtos.Registry{
		ID:                registry.ID.String(),
		Domain:            registry.Domain.Value(),
		Origin:            registry.Origin,
		Registrar:         registry.Registrar,
		RegistryCreatedAt: registry.RegistryCreatedAt.String(),
		RegistryUpdatedAt: &registryUpdatedAt,
		RegistryExpiresAt: registry.RegistryExpiresAt.String(),
	}
}
