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

type WhoisJsonAdapter struct {
	HttpClient helpers.HttpClient
	ApiKey     string
}

type WhoisJsonResponse struct {
	server      string
	name        string
	idnName     string
	status      []string
	nameserver  []string
	ips         string
	Created     *string `json:"created"`
	Changed     *string `json:"changed"`
	Expires     *string `json:"expires"`
	LastUpdated *string `json:"lastUpdated"`
	registered  bool
	dnssec      string
	whoisserver *string
	// contacts Record<string, any>
	// registrar Record<string, any>
	parsedContacts bool
	source         string
	Registrar      *struct {
		Name *string `json:"name"`
	} `json:"registrar"`
}

const (
	WhoIsJsonTimeLayout = "2006-01-02 15:04:05"
)

func NewWhoisJsonAdapter(httpClient *helpers.HttpClient, apiKey string) *WhoisJsonAdapter {
	return &WhoisJsonAdapter{
		HttpClient: *httpClient,
		ApiKey:     apiKey,
	}
}

func (ctx WhoisJsonAdapter) GetData(domain vos.Domain) *registry.Registry {
	urlParsed, _ := url.Parse("https://whoisjson.com/api/v1/whois")

	queryParams := urlParsed.Query()
	queryParams.Add("domain", domain.Value())
	urlParsed.RawQuery = queryParams.Encode()

	var response WhoisJsonResponse
	var err error

	err = ctx.HttpClient.Get(urlParsed.String(), map[string]string{
		"Authorization": fmt.Sprintf("TOKEN=%s", ctx.ApiKey),
	}, &response)

	if err != nil {
		fmt.Printf("Error al procesar la respuesta: %s\n", err)
		return nil
	}

	var registrar *string
	var registration, expiration, changed *time.Time

	if response.Created == nil {
		fmt.Printf("Fechas críticas 'RegistryCreatedAt' no encontradas en la respuesta WhoIsJson: %s\n", err)
		return nil
	}

	if response.Expires == nil {
		fmt.Printf("Fechas críticas 'RegistryExpiresAt' no encontradas en la respuesta WhoIsJson: %s\n", err)
		return nil
	}

	if created, err := time.Parse(WhoIsJsonTimeLayout, *response.Created); err != nil {
		fmt.Printf("Fechas críticas 'RegistryCreatedAt' no pueden ser mapeadas en adapter WhoIsJson: %s\n", err)
		return nil
	} else {
		registration = &created
	}

	if expires, err := time.Parse(WhoIsJsonTimeLayout, *response.Expires); err != nil {
		fmt.Printf("Fechas críticas 'RegistryExpiresAt' no pueden ser mapeadas en adapter WhoIsJson: %s\n", err)
		return nil
	} else {
		expiration = &expires
	}

	if changedDate, err := time.Parse(WhoIsJsonTimeLayout, *response.Changed); response.Changed != nil && err != nil {
		fmt.Println("Fechas críticas no pueden ser mapeadas en adapter WhoIsJson")
		return nil
	} else {
		changed = &changedDate
	}

	// fmt.Printf("response.Changed: %s\n", response.Changed)
	// fmt.Printf("response.LastUpdated: %s\n", response.LastUpdated)
	// fmt.Printf("changed: %s\n", changed)

	// if response.LastUpdated != nil {
	// 	if lastUpdatedDate, err := time.Parse(WhoIsJsonTimeLayout, *response.LastUpdated); err == nil {
	// 		changed = &lastUpdatedDate
	// 	}
	// }

	if response.Registrar != nil && response.Registrar.Name != nil {
		registrar = response.Registrar.Name
	}

	return &registry.Registry{
		ID:                uuid.New(),
		Domain:            domain,
		RegistryCreatedAt: *registration,
		RegistryExpiresAt: *expiration,
		RegistryUpdatedAt: changed,
		Origin:            urlParsed.Hostname(),
		Registrar:         registrar,
	}
}
