package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppDomain           string
	DBDriver            string
	DBURL               string
	CronValue           string
	WhoisJsonAPIKey     string
	Timeout             int
	DaysLeftToExpire    int
	TrustedProxies      []string
	NotificationChannel string
	MailPort            int
	MailHost            string
	MailUser            string
	MailPassword        string
	MailFrom            string
	MailTo              string
	TGRAMBotToken       string
	TGRAMChatId         string
}

const (
	DRIVER_SQLITE   = "sqlite"
	DRIVER_POSTGRES = "postgres"
	NC_SMTP         = "smtp"
	NC_TGR          = "telegram"
)

func LoadConfig() (*Config, error) {

	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("Error loading .env file")
		}
	}

	DBDriver := os.Getenv("DB_DRIVER")
	DBURL := os.Getenv("DB_URL")

	if DBDriver == "" {
		return nil, fmt.Errorf("DB driver not set")

	}

	if DBURL == "" {
		return nil, fmt.Errorf("Database URL not set")
	}

	//
	timeout := 10
	timeoutEnv := os.Getenv("DW_HTTP_TIMEOUT")
	if timeoutEnv == "" {
		timeoutEnv = strconv.Itoa(timeout)
	}

	if _timeout, err := strconv.Atoi(timeoutEnv); err != nil {
		log.Printf("Warning: Could not convert DW_HTTP_TIMEOUT=%s. Using default value=%d. Error: %v", timeoutEnv, timeout, err)
	} else {
		timeout = _timeout
	}

	//
	daysLeftToExpire := 15
	daysLeftToExpireEnv := os.Getenv("DW_EXPIRATION_THRESHOLD")

	if daysLeftToExpireEnv == "" {
		daysLeftToExpireEnv = strconv.Itoa(daysLeftToExpire)
	}

	if _daysLeftToExpire, err := strconv.Atoi(daysLeftToExpireEnv); err != nil {
		log.Printf("Warning: Could not convert DW_EXPIRATION_THRESHOLD=%s. Using default value=%d. Error: %v", daysLeftToExpireEnv, daysLeftToExpire, err)
	} else {
		daysLeftToExpire = _daysLeftToExpire
	}

	//
	var trustedProxies []string
	trustedProxiesEnv := os.Getenv("DW_TRUSTED_PROXIES")
	if len(strings.Split(trustedProxiesEnv, ",")) <= 0 {
		trustedProxies = append(trustedProxies, "127.0.0.1")
	}

	//
	mailPort := 25
	mailPortEnv := os.Getenv("MAIL_PORT")

	if mailPortEnv == "" {
		mailPortEnv = strconv.Itoa(mailPort)
	}

	if _daysLeftToExpire, err := strconv.Atoi(mailPortEnv); err != nil {
		log.Printf("Warning: Could not convert MAIL_PORT=%s. Using default value=%d. Error: %v", mailPortEnv, mailPort, err)
	} else {
		mailPort = _daysLeftToExpire
	}

	//
	notificationChannel := NC_SMTP
	notificationChannelEnv := os.Getenv("DW_NOTIFICATION_CHANEL")

	if notificationChannelEnv != "" {
		notificationChannel = notificationChannelEnv
	}

	return &Config{
		AppDomain:           os.Getenv("DW_APP_DOMAIN"),
		DBDriver:            DBDriver,
		DBURL:               os.Getenv("DB_URL"),
		CronValue:           os.Getenv("DW_CRON_VALUE"),
		WhoisJsonAPIKey:     os.Getenv("DW_WHOISJSON_API_KEY"),
		Timeout:             timeout,
		DaysLeftToExpire:    daysLeftToExpire,
		TrustedProxies:      trustedProxies,
		NotificationChannel: notificationChannel,
		MailPort:            mailPort,
		MailHost:            os.Getenv("MAIL_HOST"),
		MailUser:            os.Getenv("MAIL_USER"),
		MailPassword:        os.Getenv("MAIL_PASSWORD"),
		MailFrom:            os.Getenv("MAIL_FROM"),
		MailTo:              os.Getenv("MAIL_TO"),
		TGRAMBotToken:       os.Getenv("TGRAM_BOT_TOKEN"),
		TGRAMChatId:         os.Getenv("TGRAM_CHAT_ID"),
	}, nil
}
