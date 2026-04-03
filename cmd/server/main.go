package main

import (
	"domainwatcher/internal/infra/app"
	"log"
)

func main() {
	app, err := app.NewApp()

	if err != nil {
		log.Fatalf("Failed to start app: %s\n", err.Error())
	}

	app.Run()
}
