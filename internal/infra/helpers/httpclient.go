package helpers

import (
	"context"
	"domainwatcher/internal/infra/config"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	neturl "net/url"
	"strings"
	"time"
)

type HttpClient struct {
	Client *http.Client
}

func NewHttpClient(cfg *config.Config) *HttpClient {
	client := &http.Client{
		Timeout: time.Duration(cfg.Timeout) * time.Second,
	}

	return &HttpClient{Client: client}
}

// Método POST
func (h *HttpClient) Post(url string, data interface{}, headers map[string]string, result interface{}) error {

	ctx, cancel := context.WithTimeout(context.Background(), h.Client.Timeout)
	defer cancel()

	var req *http.Request
	var err error
	var bodyReader *strings.Reader

	switch headers["Content-Type"] {
	case "application/json":
		bodyData, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("error al serializar los datos a JSON: %w", err)
		}
		bodyReader = strings.NewReader(string(bodyData))
	case "application/x-www-form-urlencoded":
		formData := neturl.Values{}

		if formDataMap, ok := data.(map[string]string); ok {
			for key, value := range formDataMap {
				formData.Add(key, value)
			}
		} else {
			return fmt.Errorf("datos no válidos para application/x-www-form-urlencoded")
		}

		bodyReader = strings.NewReader(formData.Encode())
	default:
		return fmt.Errorf("Content-Type=%s no implementado", headers["Content-Type"])
	}

	req, err = http.NewRequestWithContext(ctx, "POST", url, bodyReader)
	if err != nil {
		return fmt.Errorf("error al crear la solicitud: %w", err)
	}

	for key, value := range headers {
		req.Header.Add(key, value)
	}

	// Hacer la solicitud
	resp, err := h.Client.Do(req)
	if err != nil {
		return fmt.Errorf("error al hacer la solicitud POST: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("la respuesta no fue exitosa: %s", resp.Status)
	}

	// Leer el cuerpo de la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error al leer el cuerpo de la respuesta: %w", err)
	}

	// Deserializar la respuesta JSON en el parámetro `result`
	err = json.Unmarshal(body, result)
	if err != nil {
		return fmt.Errorf("error al deserializar el JSON: %w", err)
	}

	return nil
}

// Método GET
func (h *HttpClient) Get(url string, headers map[string]string, result interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), h.Client.Timeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("error al crear la solicitud: %w", err)
	}

	for key, value := range headers {
		req.Header.Add(key, value)
	}

	resp, err := h.Client.Do(req)
	if err != nil {
		return fmt.Errorf("error al hacer la solicitud GET: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("la respuesta no fue exitosa: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error al leer el cuerpo de la respuesta: %w", err)
	}

	err = json.Unmarshal(body, result)
	if err != nil {
		return fmt.Errorf("error al deserializar el JSON: %w", err)
	}

	return nil
}
