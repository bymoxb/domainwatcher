package config

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDatabase(cfg *Config) (*gorm.DB, error) {

	config := &gorm.Config{}
	var db *gorm.DB
	var err error

	switch cfg.DBDriver {
	case DRIVER_SQLITE:
		db, err = gorm.Open(sqlite.Open(cfg.DBURL), config)
	case DRIVER_POSTGRES:
		db, err = gorm.Open(postgres.Open(cfg.DBURL), config)
	default:
		return nil, fmt.Errorf("invalid database driver specified")
	}

	return db, err
}
