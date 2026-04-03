package dtos

type WatcherDTO struct {
	ID                  string   `json:"id"`
	MailAddress         string   `json:"email"`
	NotificationEnabled bool     `json:"notificationEnabled"`
	RegistryID          string   `json:"registryId"`
	Registry            Registry `json:"registry"`
}
