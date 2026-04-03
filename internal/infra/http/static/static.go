package static

import (
	"embed"
	"log"
	"net/http"
	"strings"

	ginstatic "github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var distEmbed embed.FS

func SetupStaticRoutes(r *gin.Engine) {
	distFS := getFileSystem("dist")
	r.Use(ginstatic.Serve("/", distFS))

	r.NoRoute(func(c *gin.Context) {
		// Only serve index.html for non-API routes
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			index, err := distFS.Open("index.html")
			if err != nil {
				log.Fatal(err)
			}
			defer index.Close()
			stat, _ := index.Stat()
			http.ServeContent(c.Writer, c.Request, "index.html", stat.ModTime(), index)
		}
	})

}

func getFileSystem(path string) ginstatic.ServeFileSystem {
	fs, err := ginstatic.EmbedFolder(distEmbed, path)
	if err != nil {
		log.Fatal(err)
	}
	return fs
}
