package main

import (
	"domainwatcher/internal/infra/app"
	"log/slog"
	"os"
)

func main() {

	handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	logger := slog.New(handler)

	slog.SetDefault(logger)

	app, err := app.NewApp()

	if err != nil {
		slog.Error("Failed to initialize app", "error", err)
		os.Exit(1)
	}

	app.Run()
}
