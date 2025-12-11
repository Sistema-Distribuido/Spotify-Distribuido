package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Configuração do WebSocket (permite conexões de qualquer origem/CORS)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Estrutura para gerenciar as salas e conexões
type RoomManager struct {
	// Mapa: ID da Sala -> Lista de Conexões (Clientes)
	rooms map[string][]*websocket.Conn
	// Mutex: Protege o mapa para evitar conflito de acesso concorrente
	lock sync.Mutex
}

var manager = RoomManager{
	rooms: make(map[string][]*websocket.Conn),
}

// Estrutura da mensagem JSON
type Message struct {
	Action    string  `json:"action"` // "join", "play", "pause"
	RoomID    string  `json:"room_id"`
	Timestamp float64 `json:"timestamp"` // Onde a música está (segundos)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Atualiza a conexão HTTP para WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erro no upgrade:", err)
		return
	}
	defer conn.Close()

	var currentRoom string

	for {
		// 1. Lê a mensagem do cliente (JSON)
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Cliente desconectado ou erro: %v", err)
			break // Sai do loop e fecha conexão
		}

		// 2. Processa as ações
		switch msg.Action {
		case "join":
			currentRoom = msg.RoomID
			manager.lock.Lock() // Trava a memória
			manager.rooms[currentRoom] = append(manager.rooms[currentRoom], conn)
			manager.lock.Unlock() // Destrava
			fmt.Printf("Cliente entrou na sala %s\n", currentRoom)

		case "play", "pause":
			fmt.Printf("Ação %s na sala %s (Tempo: %f)\n", msg.Action, msg.RoomID, msg.Timestamp)
			broadcastToRoom(msg, conn)
		}
	}
}

// Envia a mensagem para todos na sala, EXCETO quem enviou
func broadcastToRoom(msg Message, sender *websocket.Conn) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	clients := manager.rooms[msg.RoomID]
	for _, client := range clients {
		if client != sender { // Não manda de volta pro Admin que clicou
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Erro ao enviar msg: %v", err)
				client.Close() // Se der erro, fecha (opcional: remover da lista)
			}
		}
	}
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	port := ":3005"
	fmt.Printf("Sala Virtual rodando em http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
