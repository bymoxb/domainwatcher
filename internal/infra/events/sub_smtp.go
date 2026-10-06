package events

import (
	"bytes"
	"log"
	"log/slog"
	"text/template"
	"time"

	"github.com/bymoxb/domainwatcher/internal/domain/events"
	"github.com/bymoxb/domainwatcher/internal/infra/config"
	"github.com/bymoxb/domainwatcher/internal/infra/helpers"

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

func (ctx *SubSMTP) Run(channel <-chan events.Event) {

	for event := range channel {
		data, ok := event.Content.(events.NotificationData)

		if !ok {
			slog.Error(
				"invalid event data",
				"topic", event.Topic,
				"expected", "NotificationData",
			)
			continue
		}

		ctx.send(data)

	}
}

func (ctx *SubSMTP) send(event events.NotificationData) {
	if len(event.Watchers) == 0 {
		return
	}

	appDomain := ctx.cfg.AppDomain

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
		return
	}

	msg := gomail.NewMessage()
	msg.SetHeader("From", ctx.cfg.MailFrom)
	msg.SetHeader("To", ctx.cfg.MailTo)
	msg.SetHeader("Bcc", emails...)
	msg.SetHeader("Subject", meta.Subject)
	msg.SetBody("text/html", body)

	if err := ctx.Dialer.DialAndSend(msg); err != nil {
		slog.Error("Could not send email notification", "error", err, "domain", event.Registry.Domain.Value())
		return
	}

	time.Sleep(500 * time.Millisecond)
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
