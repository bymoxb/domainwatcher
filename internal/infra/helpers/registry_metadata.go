package helpers

import (
	"domainwatcher/internal/domain/registry"
	"time"
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
	expirationDate := item.RegistryExpiresAt.Format("2006-01-02")
	daysRemaining := calcDaysLeft(item.RegistryExpiresAt)

	isExpired := daysRemaining <= 0

	domainStatus := "expiring soon"
	if isExpired {
		domainStatus = "has expired"
	}

	return RegistryNotificaionData{
		DomainName:     domainName,
		ExpirationDate: expirationDate,
		DaysRemaining:  daysRemaining,
		IsExpired:      isExpired,
		Subject:        "DomainWatcher: " + domainStatus + " " + domainStatus,
		DomainStatus:   domainStatus,
	}
}

func calcDaysLeft(expiration time.Time) int {
	return int(time.Until(expiration).Hours() / 24)
}
