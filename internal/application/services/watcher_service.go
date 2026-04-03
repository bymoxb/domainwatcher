package services

import (
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/domain/watcher"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

type WatcherService struct {
	Repository watcher.WatcherRepository
}

func NewWatcherService(wr watcher.WatcherRepository) *WatcherService {
	return &WatcherService{Repository: wr}
}

func (ws *WatcherService) SearchWatcher(email vos.Email, order string, sort string) []*watcher.Watcher {
	return ws.Repository.SearchWatcher(email, order, sort)
}

func (ws *WatcherService) CreateWatcher(email vos.Email, registryId uuid.UUID) (*uuid.UUID, error) {

	modelExists, err := ws.Repository.GetByRegistryIdAndEmail(email, registryId)

	if err == nil {
		fmt.Println("b")
		if modelExists.DeletedAt != nil {
			ws.Repository.UnDeleteWatcher(modelExists.ID)
		}

		if !modelExists.NotificationEnabled {
			ws.Repository.TurnOnNotification(modelExists.ID)
		}

		return &modelExists.ID, nil
	}

	modelToCreate := watcher.Watcher{ID: uuid.New(), MailAddress: email, RegistryID: registryId, NotificationEnabled: true}

	_, err = ws.Repository.CreateWatcher(modelToCreate)

	if err != nil {
		return nil, errors.New(err.Error())
	}

	return &modelToCreate.ID, nil
}

func (ws *WatcherService) DeleteWatcher(watcherId uuid.UUID) {
	ws.Repository.DeleteWatcher(watcherId)
}

func (ws *WatcherService) ToogleNotificationWatcher(watcherId uuid.UUID) {
	modelExists, err := ws.Repository.GetById(watcherId)

	if err != nil {
		return
	}

	if modelExists.NotificationEnabled {
		ws.Repository.TurnOffNotification(modelExists.ID)
	} else {
		ws.Repository.TurnOnNotification(modelExists.ID)
	}
}
