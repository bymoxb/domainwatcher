package events

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/bymoxb/domainwatcher/internal/domain/events"
	"github.com/bymoxb/domainwatcher/internal/infra/config"
	"github.com/bymoxb/domainwatcher/internal/infra/helpers"
)

type TelegramResponse struct {
	OK     bool `json:"ok"`
	Result struct {
		MessageID int64 `json:"message_id"`
	} `json:"result"`
}

type SubTelegram struct {
	cfg        *config.Config
	httpClient helpers.HttpClient
}

func NewSubTelegram(cfg *config.Config, httpClient helpers.HttpClient) *SubTelegram {
	return &SubTelegram{
		cfg:        cfg,
		httpClient: httpClient,
	}
}

func (ctx *SubTelegram) Run(channel <-chan events.Event) {
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

func (ctx *SubTelegram) send(event events.NotificationData) {

	if len(event.Watchers) == 0 {
		return
	}

	var result TelegramResponse

	meta := helpers.ExtractRegistryNotificaionData(event.Registry)

	message := fmt.Sprintf("🔔 %s %s\nExpiration date: %s\nDays remaining: %d", meta.DomainName, meta.DomainStatus, meta.ExpirationDate, meta.DaysRemaining)

	message = escapeMarkdownV2(message)

	err := ctx.httpClient.Post(
		fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", ctx.cfg.TGRAMBotToken),
		map[string]string{
			"chat_id":    ctx.cfg.TGRAMChatId,
			"text":       message,
			"parse_mode": "MarkdownV2",
		},
		map[string]string{
			"Content-Type": "application/x-www-form-urlencoded",
		},
		&result)

	if err != nil {
		slog.Error("Could not send Telegram notification", "error", err, "domain", event.Registry.Domain.Value())
	}
}

func escapeMarkdownV2(input string) string {
	escaped := input
	escaped = strings.ReplaceAll(escaped, ".", "\\.")
	escaped = strings.ReplaceAll(escaped, "*", "\\*")
	escaped = strings.ReplaceAll(escaped, "_", "\\_")
	escaped = strings.ReplaceAll(escaped, "{", "\\{")
	escaped = strings.ReplaceAll(escaped, "}", "\\}")
	escaped = strings.ReplaceAll(escaped, "[", "\\[")
	escaped = strings.ReplaceAll(escaped, "]", "\\]")
	escaped = strings.ReplaceAll(escaped, "(", "\\(")
	escaped = strings.ReplaceAll(escaped, ")", "\\)")
	escaped = strings.ReplaceAll(escaped, "~", "\\~")
	escaped = strings.ReplaceAll(escaped, "`", "\\`")
	escaped = strings.ReplaceAll(escaped, ">", "\\>")
	escaped = strings.ReplaceAll(escaped, "#", "\\#")
	escaped = strings.ReplaceAll(escaped, "+", "\\+")
	escaped = strings.ReplaceAll(escaped, "-", "\\-")
	escaped = strings.ReplaceAll(escaped, "=", "\\=")
	escaped = strings.ReplaceAll(escaped, "|", "\\|")
	escaped = strings.ReplaceAll(escaped, "{", "\\{")
	escaped = strings.ReplaceAll(escaped, "}", "\\}")
	return escaped
}
