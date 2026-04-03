package app

import (
	"domainwatcher/internal/application/services"
	eventsdomain "domainwatcher/internal/domain/events"
	"domainwatcher/internal/domain/registry"
	"domainwatcher/internal/domain/watcher"
	"domainwatcher/internal/infra/adapters"
	"domainwatcher/internal/infra/config"
	eventsinfra "domainwatcher/internal/infra/events"
	"domainwatcher/internal/infra/helpers"
	"domainwatcher/internal/infra/http/controllers"
	"domainwatcher/internal/infra/persistence/postgres"
	"domainwatcher/internal/infra/persistence/sqlite"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

type App struct {
	cron   *cron.Cron
	router *gin.Engine
}

func NewApp() (*App, error) {

	var err error
	var cfg *config.Config
	var db *gorm.DB

	if cfg, err = config.LoadConfig(); err != nil {
		return nil, fmt.Errorf("Error loading configuration: %w", err)
	}

	if db, err = config.InitDatabase(cfg); err != nil {
		return nil, fmt.Errorf("Error loading configuration: %w", err)
	}

	//
	if err = ExecuteMigrations(cfg, db); err != nil {
		return nil, fmt.Errorf("Migration failed with error: %w", err)
	}

	//
	c := cron.New()
	router := gin.Default()
	httpClient := helpers.NewHttpClient(cfg)

	//
	var dispatcher eventsdomain.Broker = eventsinfra.NewEventDispatcher()

	//
	if err = router.SetTrustedProxies(cfg.TrustedProxies); err != nil {
		return nil, fmt.Errorf("Error loading trusted proxies: %w", err)
	}

	//
	ws, rs, err := RegisterServices(db, cfg, dispatcher, httpClient)

	if err != nil {
		return nil, err
	}

	wc, rc := RegisterControllers(ws, rs)

	//
	if err = RegisterListener(cfg, dispatcher, rs, httpClient); err != nil {
		return nil, err
	}

	//
	if err = RegisterCrons(c, cfg, dispatcher, rs); err != nil {
		return nil, err
	}

	// WEB

	// APIS
	group := router.Group("/api")

	group.GET("/registry", rc.SearchRegistry)
	group.GET("/watcher", wc.SearchWatcher)
	group.POST("/watcher", wc.CreateWatcher)
	group.PATCH("/watcher/:id", wc.ToogleNotificationWatcher)
	group.DELETE("/watcher/:id", wc.DeleteWatcher)

	//

	return &App{
		router: router,
		cron:   c,
	}, nil
}

func (ctx *App) Run() {
	ctx.cron.Start()
	ctx.router.Run(":9876")
}

func RegisterListener(cfg *config.Config, dispatcher eventsdomain.Broker, rs *services.RegistryService, httpClient *helpers.HttpClient) error {
	var subRegistry eventsdomain.Subscriber = eventsinfra.NewSubRegistry(*rs)
	go subRegistry.Subscribe(dispatcher.Subscribe())

	switch cfg.NotificationChannel {
	case config.NC_SMTP:
		var subSMTP eventsdomain.Subscriber = eventsinfra.NewSubSMTP(cfg)
		go subSMTP.Subscribe(dispatcher.Subscribe())
		return nil
	case config.NC_TGR:
		var subtgram eventsdomain.Subscriber = eventsinfra.NewSubTelegram(cfg, *httpClient)
		go subtgram.Subscribe(dispatcher.Subscribe())
		return nil
	default:
		return fmt.Errorf("Unsupported notification type: %s", cfg.DBDriver)
	}
}

func ExecuteMigrations(cfg *config.Config, db *gorm.DB) error {
	switch cfg.DBDriver {
	case config.DRIVER_POSTGRES:
		if err := postgres.Migrate(db); err != nil {
			return err
		}
		return nil
	case config.DRIVER_SQLITE:
		if err := sqlite.Migrate(db); err != nil {
			return err
		}
		return nil
	default:
		return fmt.Errorf("Unsupported database driver: %s", cfg.DBDriver)
	}
}

func BuildAdapters(cfg *config.Config, httpClient *helpers.HttpClient) []registry.RegistryResource {
	var adapterList []registry.RegistryResource

	adapterList = append(adapterList, adapters.NewRdapAdapter(httpClient))

	if len(cfg.WhoisJsonAPIKey) > 0 {
		adapterList = append(adapterList, adapters.NewWhoisJsonAdapter(httpClient, cfg.WhoisJsonAPIKey))
	}

	return adapterList
}

func BuildRepositories(cfg *config.Config, db *gorm.DB) (wr watcher.WatcherRepository, rr registry.RegistryRepository, err error) {

	switch cfg.DBDriver {
	case config.DRIVER_POSTGRES:
		return postgres.NewWatcherRepository(db), postgres.NewRegistryRepository(db), nil
	case config.DRIVER_SQLITE:
		return sqlite.NewWatcherRepository(db), sqlite.NewRegistryRepository(db), nil
	default:
		return nil, nil, fmt.Errorf("Unsupported database driver: %s", cfg.DBDriver)
	}

}

func RegisterServices(db *gorm.DB, cfg *config.Config, dispatcher eventsdomain.Broker, httpClient *helpers.HttpClient) (ws *services.WatcherService, rs *services.RegistryService, err error) {
	wr, rr, err := BuildRepositories(cfg, db)

	if err != nil {
		return nil, nil, err
	}

	//
	ws = services.NewWatcherService(wr)
	rs = services.NewRegistryService(rr, wr, BuildAdapters(cfg, httpClient), dispatcher, cfg.DaysLeftToExpire)

	return ws, rs, nil
}

func RegisterControllers(ws *services.WatcherService, rs *services.RegistryService) (wc *controllers.WatcherController, rc *controllers.RegistryController) {
	wc = controllers.NewWatcherController(*ws)
	rc = controllers.NewRegistryController(*rs)

	return wc, rc
}

func RegisterCrons(cron *cron.Cron, cfg *config.Config, dispatcher eventsdomain.Broker, rs *services.RegistryService) error {

	_, err := cron.AddFunc(cfg.CronValue, rs.CheckRegistryStatus)

	if err != nil {
		return fmt.Errorf("Error adding job to the scheduler : %w", err)
	}

	return nil
}
