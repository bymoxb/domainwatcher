package adapters

import (
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/vos"
	"domainwatcher/internal/infra/helpers"
	"fmt"
	"log/slog"
	"net/url"
	"time"

	"github.com/google/uuid"
)

type WhoisJsonAdapter struct {
	baseUrl    url.URL
	HttpClient helpers.HttpClient
	ApiKey     string
}

type WhoisJsonResponse struct {
	Created   *string `json:"created"`
	Changed   *string `json:"changed"`
	Expires   *string `json:"expires"`
	Registrar *struct {
		Name *string `json:"name"`
	} `json:"registrar"`
}

const (
	WhoIsJsonTimeLayout = "2006-01-02 15:04:05"
)

func NewWhoisJsonAdapter(httpClient *helpers.HttpClient, apiKey string) *WhoisJsonAdapter {
	urlParsed, _ := url.Parse("https://whoisjson.com/api/v1/whois")

	return &WhoisJsonAdapter{
		HttpClient: *httpClient,
		ApiKey:     apiKey,
		baseUrl:    *urlParsed,
	}
}

func (ctx WhoisJsonAdapter) GetName() string {
	return ctx.baseUrl.Hostname()
}

func (ctx WhoisJsonAdapter) GetData(domain vos.Domain) *registry.Registry {
	urlParsed := ctx.baseUrl
	domainName := domain.Value()
	adapterName := ctx.GetName()

	queryParams := urlParsed.Query()
	queryParams.Add("domain", domainName)
	urlParsed.RawQuery = queryParams.Encode()

	var response WhoisJsonResponse
	err := ctx.HttpClient.Get(urlParsed.String(), map[string]string{
		"Authorization": fmt.Sprintf("TOKEN=%s", ctx.ApiKey),
	}, &response)

	if err != nil {
		slog.Error("Failed to fetch data from provider",
			"adapter", adapterName,
			"domain", domainName,
			"error", err,
		)
		return nil
	}

	// Validation: Check for required fields
	if response.Created == nil || response.Expires == nil {
		slog.Warn("Critical dates not found in response",
			"adapter", adapterName,
			"domain", domainName,
			"has_created", response.Created != nil,
			"has_expires", response.Expires != nil,
		)
		return nil
	}

	// Parsing dates
	registration, err := time.Parse(WhoIsJsonTimeLayout, *response.Created)
	if err != nil {
		slog.Error("Could not parse registration date",
			"adapter", adapterName,
			"domain", domainName,
			"raw_value", *response.Created,
			"error", err,
		)
		return nil
	}

	expiration, err := time.Parse(WhoIsJsonTimeLayout, *response.Expires)
	if err != nil {
		slog.Error("Could not parse expiration date",
			"adapter", adapterName,
			"domain", domainName,
			"raw_value", *response.Expires,
			"error", err,
		)
		return nil
	}

	var changed *time.Time
	if response.Changed != nil {
		if parsedChanged, err := time.Parse(WhoIsJsonTimeLayout, *response.Changed); err != nil {
			slog.Warn("Could not parse updated_at date",
				"adapter", adapterName,
				"domain", domainName,
				"raw_value", *response.Changed,
				"error", err,
			)
		} else {
			changed = &parsedChanged
		}
	}

	var registrar *string
	if response.Registrar != nil && response.Registrar.Name != nil {
		registrar = response.Registrar.Name
	}

	return &registry.Registry{
		ID:                uuid.New(),
		Domain:            domain,
		RegistryCreatedAt: registration,
		RegistryExpiresAt: expiration,
		RegistryUpdatedAt: changed,
		Origin:            urlParsed.Hostname(),
		Registrar:         registrar,
	}
}
