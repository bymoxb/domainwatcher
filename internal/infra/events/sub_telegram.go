package events

import (
	"domainwatcher/internal/domain/events"
	"domainwatcher/internal/infra/config"
	"domainwatcher/internal/infra/helpers"
	"fmt"
	"strings"
)

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

func (ctx *SubTelegram) Subscribe(channel chan events.Event) {
	for event := range channel {
		fmt.Printf("Enviando notificaion por telegram para: %s\n", event.Registry.Domain.Value())

		var result interface{}

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
			result)

		if err != nil {
			fmt.Printf("Error: %s\n", err.Error())
		}

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
