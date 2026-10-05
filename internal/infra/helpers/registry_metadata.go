package helpers

import (
	"time"

	"github.com/bymoxb/domainwatcher/internal/domain/registry"
)

type RegistryNotificaionData struct {
	DomainName     string
	ExpirationDate string
	DaysRemaining  int
	IsExpired      bool
	Subject        string
	DomainStatus   string
}

func ExtractRegistryNotificaionData(item registry.Registry) RegistryNotificaionData {
	domainName := item.Domain.Value()

	var expirationDate string
	if item.RegistryExpiresAt != nil {
		expirationDate = item.RegistryExpiresAt.Format("2006-01-02")
	}

	daysRemaining := calcDaysLeft(item.RegistryExpiresAt)

	isExpired := item.RegistryExpiresAt != nil &&
		time.Now().After(*item.RegistryExpiresAt)

	domainStatus := "expiring soon"
	if isExpired {
		domainStatus = "has expired"
	}

	return RegistryNotificaionData{
		DomainName:     domainName,
		ExpirationDate: expirationDate,
		DaysRemaining:  daysRemaining,
		IsExpired:      isExpired,
		Subject:        "DomainWatcher: " + domainName + " " + domainStatus,
		DomainStatus:   domainStatus,
	}
}

func calcDaysLeft(expiration *time.Time) int {
	if expiration == nil {
		return 0
	}

	duration := time.Until(*expiration)
	if duration <= 0 {
		return 0
	}

	return int(duration.Hours() / 24)
}
