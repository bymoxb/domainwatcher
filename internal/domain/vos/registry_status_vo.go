package vos

// RegistryStatus represents the current monitoring status of a domain in the registry.
//
// A domain can be in one of the following states:
//   - MONITORED: The domain exists and its expiration is being monitored.
//   - WATCHLIST: The domain does not exist and is being monitored for potential purchase.
//   - EXPIRED: The domain has expired and is pending release.
type RegistryStatus string

const (
	// StatusMonitored indicates that the domain exists and its expiration is being monitored.
	StatusMonitored RegistryStatus = "MONITORED"

	// StatusWatchlist indicates that the domain does not exist and is being monitored for potential purchase.
	StatusWatchlist RegistryStatus = "WATCHLIST"

	// StatusExpired indicates that the domain has expired and is pending release.
	StatusExpired RegistryStatus = "EXPIRED"
)

// IsValid reports whether the registry status is one of the supported values.
func (s RegistryStatus) IsValid() bool {
	switch s {
	case StatusMonitored, StatusWatchlist, StatusExpired:
		return true
	}
	return false
}
