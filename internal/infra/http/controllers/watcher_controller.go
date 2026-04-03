package controllers

import (
	"domainwatcher/internal/application/services"
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/domain/watcher"
	"domainwatcher/internal/infra/http/dtos"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WatcherController struct {
	service services.WatcherService
}

func NewWatcherController(usecase services.WatcherService) *WatcherController {
	return &WatcherController{service: usecase}
}

func (wc *WatcherController) SearchWatcher(c *gin.Context) {
	order := c.Query("order")
	sort := c.Query("sort")

	_email := c.Query("email")
	email, err := vos.NewEmail(&_email)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	var items []dtos.WatcherDTO = []dtos.WatcherDTO{}

	for _, item := range wc.service.SearchWatcher(*email, order, sort) {
		items = append(items, MapWatcherToDTO(item))
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":    true,
		"count": len(items),
		"data":  items,
	})
}

func (wc *WatcherController) CreateWatcher(c *gin.Context) {

	registryId, err := uuid.Parse(c.PostForm("registry_id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": "Invalid registry id",
		})
		return
	}

	_email := c.PostForm("email")
	email, err := vos.NewEmail(&_email)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	watcher, err := wc.service.CreateWatcher(*email, registryId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"ok":   true,
		"data": watcher.String()})
}

func (wc *WatcherController) DeleteWatcher(c *gin.Context) {

	watcherId, err := uuid.Parse(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": "Invalid ID",
		})
		return
	}

	wc.service.DeleteWatcher(watcherId)

	c.JSON(http.StatusOK, gin.H{
		"ok": true,
	})
}

func (wc *WatcherController) ToogleNotificationWatcher(c *gin.Context) {

	watcherId, err := uuid.Parse(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": "Invalid ID",
		})
		return
	}

	wc.service.ToogleNotificationWatcher(watcherId)

	c.JSON(http.StatusOK, gin.H{
		"ok": true,
	})
}

func MapWatcherToDTO(watcher *watcher.Watcher) dtos.WatcherDTO {
	return dtos.WatcherDTO{
		ID:                  watcher.ID.String(),
		MailAddress:         watcher.MailAddress.Value(),
		NotificationEnabled: watcher.NotificationEnabled,
		RegistryID:          watcher.RegistryID.String(),
		Registry:            MapRegistryToDTO(watcher.Registry),
	}
}
