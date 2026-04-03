package vos

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

const (
	MAX_LENGTH          = 128
	ErrDomainLength     = "The domain name cannot be longer than %d characters"
	ErrDomainNull       = "Domain could not be null"
	ErrInvalidDomain    = "Invalid domain format"
	ErrInvalidDomainMsg = "Domain (%s) must have exactly one part before the TLD and only contain letters, numbers, or hyphens."
)

type Domain struct {
	value string
}

func NewDomain(value *string) (*Domain, error) {
	if value == nil {
		return nil, errors.New(ErrDomainNull)
	}

	if len(*value) > MAX_LENGTH {
		return nil, fmt.Errorf(ErrDomainLength, MAX_LENGTH)
	}

	regex := `^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`
	r := regexp.MustCompile(regex)

	if !r.MatchString(*value) {
		return nil, fmt.Errorf(ErrInvalidDomainMsg, *value)
	}

	return &Domain{value: strings.ToLower(*value)}, nil
}

func (d *Domain) Value() string {
	return d.value
}
