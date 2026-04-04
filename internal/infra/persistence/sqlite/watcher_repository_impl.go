package sqlite

import (
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/domain/watcher"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type WatcherRepositoryImpl struct {
	DB *gorm.DB
}

func NewWatcherRepository(DB *gorm.DB) *WatcherRepositoryImpl {
	return &WatcherRepositoryImpl{DB: DB}
}

func (wr *WatcherRepositoryImpl) SearchWatcher(email vos.Email, order string, sort string) []*watcher.Watcher {
	query := wr.DB.
		Where(&WatcherModel{MailAddress: email.Value()}).
		Where("dw_watcher.deleted_at IS NULL").
		Joins("Registry")

	desc := sort == "desc"

	switch order {
	case "notification_status":
		query.Order(clause.OrderByColumn{Column: clause.Column{Name: "notification_enabled"}, Desc: desc})
	case "domain":
		query.Order(clause.OrderByColumn{Column: clause.Column{Name: "Registry.domain"}, Desc: desc})
	case "created":
		query.Order(clause.OrderByColumn{Column: clause.Column{Name: "created_at"}, Desc: desc})
	default:
		query.Order(clause.OrderByColumn{Column: clause.Column{Name: "Registry.registry_expires_at"}, Desc: desc})
	}

	var hits []*WatcherModel

	query.Find(&hits)

	return MapWatcherToDomainList(hits)
}

func (wr *WatcherRepositoryImpl) GetById(watcherId uuid.UUID) (*watcher.Watcher, error) {
	var entity WatcherModel
	result := wr.DB.Where(&WatcherModel{ID: watcherId}).First(&entity)

	if result.Error != nil {
		return nil, fmt.Errorf("Record not found with id %s", watcherId.String())
	}

	return MapWatcherToDomain(&entity), nil
}

func (wr *WatcherRepositoryImpl) GetByRegistryIdAndEmail(email vos.Email, registryId uuid.UUID) (*watcher.Watcher, error) {
	var entity *WatcherModel

	result := wr.DB.Where(&WatcherModel{RegistryID: registryId, MailAddress: email.Value()}).First(&entity)

	if result.Error != nil {
		return nil, fmt.Errorf("Record not found with id %s and email %s", registryId.String(), email.Value())
	}

	return MapWatcherToDomain(entity), nil
}

func (wr *WatcherRepositoryImpl) CreateWatcher(model watcher.Watcher) (*uuid.UUID, error) {

	entity := WatcherModel{ID: model.ID, MailAddress: model.MailAddress.Value(), RegistryID: model.RegistryID, NotificationEnabled: true}

	result := wr.DB.Create(&entity)

	if result.Error != nil {
		return &uuid.Nil, errors.New(result.Error.Error())
	}

	return &entity.ID, nil
}

func (wr *WatcherRepositoryImpl) DeleteWatcher(watcherId uuid.UUID) {
	now := time.Now()
	wr.DB.Model(&WatcherModel{ID: watcherId}).Updates(WatcherModel{DeletedAt: &now})
}

func (wr *WatcherRepositoryImpl) UnDeleteWatcher(watcherId uuid.UUID) {
	wr.DB.Model(&WatcherModel{ID: watcherId}).Updates(WatcherModel{DeletedAt: nil})
}

func (wr *WatcherRepositoryImpl) TurnOnNotification(watcherId uuid.UUID) {
	now := time.Now()
	wr.DB.
		Where(&WatcherModel{ID: watcherId}).
		Select("notification_enabled", "updated_at").
		UpdateColumns(&WatcherModel{NotificationEnabled: true, UpdatedAt: &now})
}

func (wr *WatcherRepositoryImpl) TurnOffNotification(watcherId uuid.UUID) {
	now := time.Now()
	wr.DB.
		Where(&WatcherModel{ID: watcherId}).
		Select("notification_enabled", "updated_at").
		UpdateColumns(&WatcherModel{NotificationEnabled: false, UpdatedAt: &now})
}

func (wr *WatcherRepositoryImpl) GetWatchersToNotify(registryId uuid.UUID) []watcher.Watcher {

	query := wr.DB.
		Where(&WatcherModel{RegistryID: registryId, NotificationEnabled: true}).
		Where("dw_watcher.deleted_at IS NULL").
		Joins("Registry")

	var hits []WatcherModel = []WatcherModel{}

	query.Find(&hits)

	var result []watcher.Watcher = []watcher.Watcher{}

	for _, w := range hits {
		wm := MapWatcherToDomain(&w)
		if wm != nil {
			result = append(result, *wm)
		}
	}

	return result
}
