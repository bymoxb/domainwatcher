package controllers

import (
	"net/http"
	"time"

	"github.com/bymoxb/domainwatcher/internal/application/services"
	"github.com/bymoxb/domainwatcher/internal/domain/registry"
	"github.com/bymoxb/domainwatcher/internal/domain/vos"
	"github.com/bymoxb/domainwatcher/internal/infra/http/dtos"

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
	return dtos.Registry{
		ID:                registry.ID.String(),
		Domain:            registry.Domain.Value(),
		Status:            string(registry.Status),
		Origin:            registry.Origin,
		Registrar:         registry.Registrar,
		RegistryCreatedAt: timeToString(registry.RegistryCreatedAt),
		RegistryUpdatedAt: timeToString(registry.RegistryUpdatedAt),
		RegistryExpiresAt: timeToString(registry.RegistryExpiresAt),
	}
}

func timeToString(t *time.Time) *string {
	if t == nil {
		return nil
	}

	s := t.String()
	return &s
}
