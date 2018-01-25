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
	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:9090", "http service address")

var upgrader = websocket.Upgrader{} // use default options

func chat(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(*http.Request) bool { return true }
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer c.Close()

	go func(c *websocket.Conn) {
		for {
			select {
			case line := <-msg:
				err := c.WriteMessage(websocket.TextMessage, []byte(line))
				if err != nil {
					log.Println("write:", err)
				}
			}
		}
	}(c)
	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
	}
}

func listenToInput() {
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		msg <- scanner.Text()
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

	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.HandleFunc("/", chat)
	log.Fatal(http.ListenAndServe(*addr, r))
}
