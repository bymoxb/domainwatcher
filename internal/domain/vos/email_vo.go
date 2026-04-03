package vos

import (
	"errors"
	"os"
	"regexp"
	"strings"
)

const (
	ErrEmailNull          = "Email could not be null"
	ErrEmailEmpty         = "Email could not be empty"
	ErrInvalidEmail       = "Invalid email format"
	ErrForbiddenEmail     = "Forbidden email. Allowed email domains: "
	ErrInvalidEmailDomain = "Failed to extract domain from email"
)

type Email struct {
	value string
}

func NewEmail(value *string) (*Email, error) {
	if value == nil {
		return nil, errors.New(ErrEmailNull)
	}

	if len(*value) == 0 {
		return nil, errors.New(ErrEmailNull)
	}

	regex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	r := regexp.MustCompile(regex)

	if !r.MatchString(*value) {
		return nil, errors.New(ErrInvalidEmail)
	}

	allowedDomains := strings.Split(os.Getenv("DW_ALLOWED_EMAIL_DOMAINS"), ",")

	if len(allowedDomains) > 0 {
		parts := strings.Split(*value, "@")
		if len(parts) != 2 {
			return nil, errors.New(ErrInvalidEmailDomain)
		}

		domain := strings.ToLower(parts[1])

		allowedDomainsMap := make(map[string]bool)
		for _, item := range allowedDomains {
			allowedDomainsMap[item] = true
		}

		if !allowedDomainsMap[domain] {
			return nil, errors.New(ErrForbiddenEmail + strings.Join(allowedDomains, ", "))
		}
	}

	return &Email{value: *value}, nil
}

func (e *Email) Value() string {
	return e.value
}
