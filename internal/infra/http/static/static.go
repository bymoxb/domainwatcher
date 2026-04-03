package static

import (
	"embed"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	ginstatic "github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var distEmbed embed.FS

func SetupStaticRoutes(r *gin.Engine) error {
	distFS, err := getFileSystem("dist")
	if err != nil {
		return err
	}
	r.Use(ginstatic.Serve("/", distFS))

	r.NoRoute(func(c *gin.Context) {
		// Only serve index.html for non-API routes
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			index, err := distFS.Open("index.html")
			if err != nil {
				slog.Error("failed to open index.html", "error", err)
				return
			}
			defer index.Close()
			stat, _ := index.Stat()
			http.ServeContent(c.Writer, c.Request, "index.html", stat.ModTime(), index)
		}
	})

	return nil
}

func getFileSystem(path string) (ginstatic.ServeFileSystem, error) {
	fs, err := ginstatic.EmbedFolder(distEmbed, path)
	if err != nil {
		return nil, fmt.Errorf("failed to embed folder", "path", path, "error", err)
	}

	return fs, nil
}
