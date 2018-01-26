package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
)

var addr = flag.String("addr", "localhost:9090", "http service address")

func withHub(hub *Hub) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	}
	return http.HandlerFunc(fn)
}

func listenToInput() {
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		line := scanner.Text()
		msg <- line
	}
	if err := scanner.Err(); err != nil {
		fmt.Println(err)
	}
}

var msg chan string

func main() {
	msg = make(chan string)
	flag.Parse()
	log.SetFlags(0)
	go listenToInput()

	hub := newHub()
	go hub.run()
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Origin", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})
	r := chi.NewRouter()
	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware.Handler)
	h := withHub(hub)
	r.Handle("/", h)

	log.Fatal(http.ListenAndServe(*addr, r))
}
