package events

import (
	"bytes"
	"domainwatcher/internal/domain/events"
	"domainwatcher/internal/infra/config"
	"domainwatcher/internal/infra/helpers"
	"log"
	"text/template"
	"time"

	"gopkg.in/gomail.v2"
)

type SubSMTP struct {
	Dialer *gomail.Dialer
	cfg    *config.Config
}

func NewSubSMTP(cfg *config.Config) *SubSMTP {
	return &SubSMTP{
		Dialer: gomail.NewDialer(cfg.MailHost, cfg.MailPort, cfg.MailUser, cfg.MailPassword),
		cfg:    cfg,
	}
}

func (ctx *SubSMTP) Subscribe(channel chan events.Event) {
	appDomain := ctx.cfg.AppDomain

	for event := range channel {

		if len(event.Watchers) == 0 {
			continue
		}

		// fmt.Printf("Received an event and send via smtp=%s\n", event.Registry.Domain.Value())

		var emails []string
		for _, w := range event.Watchers {
			emails = append(emails, w.MailAddress.Value())
		}

		meta := helpers.ExtractRegistryNotificaionData(event.Registry)

		body, err := renderTemplate(map[string]interface{}{
			"domain_name":     meta.DomainName,
			"expiration_date": meta.ExpirationDate,
			"days_remaining":  meta.DaysRemaining,
			"is_expired":      meta.IsExpired,
			"app_domain":      appDomain,
		})

		if err != nil {
			log.Println("template error:", err)
			continue
		}

		msg := gomail.NewMessage()
		msg.SetHeader("From", ctx.cfg.MailFrom)
		msg.SetHeader("To", ctx.cfg.MailTo)
		msg.SetHeader("Bcc", emails...)
		msg.SetHeader("Subject", meta.Subject)
		msg.SetBody("text/html", body)

		if err := ctx.Dialer.DialAndSend(msg); err != nil {
			log.Println("send error:", err)
			continue
		}

		time.Sleep(500 * time.Millisecond)
	}
}

func renderTemplate(data map[string]interface{}) (string, error) {
	tmpl, err := template.ParseFiles("internal/infra/events/templates/notification.html")
	if err != nil {
		return "", err
	}

	var body bytes.Buffer
	err = tmpl.Execute(&body, data)
	if err != nil {
		return "", err
	}

	return body.String(), nil
}
