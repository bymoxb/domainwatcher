package adapters

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/infra/helpers"
	"fmt"
	"net/url"
	"time"

	"github.com/google/uuid"
)

type RdapAdapter struct {
	HttpClient helpers.HttpClient
}

type RDAPResponse struct {
	Events   []Event  `json:"events"`
	Entities []Entity `json:"entities"`
}

type Event struct {
	EventAction string `json:"eventAction"`
	EventDate   string `json:"eventDate"`
}

type Entity struct {
	Roles      []string      `json:"roles"`
	VCardArray []interface{} `json:"vcardArray"`
}

func NewRdapAdapter(httpClient *helpers.HttpClient) *RdapAdapter {
	return &RdapAdapter{
		HttpClient: *httpClient,
	}
}

func (ctx RdapAdapter) GetData(domain vos.Domain) *registry.Registry {

	urlParsed, err := url.Parse(fmt.Sprintf("https://rdap.org/domain/%s", domain.Value()))

	var response RDAPResponse

	err = ctx.HttpClient.Get(urlParsed.String(), nil, &response)

	if err != nil {
		fmt.Printf("Error al procesar la respuesta: %s\n", err)
		return nil
	}

	var registration, expiration, changed *time.Time
	for _, event := range response.Events {
		eventDate, err := time.Parse(time.RFC3339, event.EventDate)

		if err != nil {
			fmt.Printf("Error al parsear la fecha: %s\n", err)
			continue
		}

		switch event.EventAction {
		case "registration":
			registration = &eventDate
		case "expiration":
			expiration = &eventDate
		case "last changed":
			changed = &eventDate
		}
	}

	if registration == nil || expiration == nil {
		fmt.Println("Fechas críticas no encontradas en la respuesta RDAP")
		return nil
	}

	registrar := extractRegistrar(response.Entities)

	return &registry.Registry{
		ID:                uuid.New(),
		Domain:            domain,
		Registrar:         registrar,
		RegistryCreatedAt: *registration,
		RegistryExpiresAt: *expiration,
		RegistryUpdatedAt: changed,
		Origin:            urlParsed.Hostname(),
	}
}

// TODO: Change this
func extractRegistrar(entities []Entity) *string {
	for _, entity := range entities {
		if entity.Roles[0] == "registrar" {
			for _, vcard := range entity.VCardArray {
				if isList(vcard) {
					for _, item := range vcard.([]interface{}) {
						if isList(item) {
							if len(item.([]interface{})) >= 4 {
								if item.([]interface{})[0] == "fn" {
									raw := item.([]interface{})[3]
									rawString := raw.(string)
									return &rawString
								}
							}
						}
					}
				}
			}
		}
	}

	return nil
}

func isList(v interface{}) bool {
	switch v.(type) {
	case []interface{}:
		return true
	default:
		return false
	}
}
