package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Estruturas de Estado da Sala
// salva informações para usuários que entram na sala depois

type RoomState struct {
	IsPlaying    bool
	StartTime    time.Time
	PausedAt     float64
	CurrentMusic string
	VotedUsers   map[*websocket.Conn]bool
}

type RoomManager struct {
	clients map[string][]*websocket.Conn
	states  map[string]*RoomState
	lock    sync.Mutex
}

var manager = RoomManager{
	clients: make(map[string][]*websocket.Conn),
	states:  make(map[string]*RoomState),
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Message struct {
	Action    string  `json:"action"`
	RoomID    string  `json:"room_id"`
	Timestamp float64 `json:"timestamp"`
	Content   string  `json:"content,omitempty"`
	UserName  string  `json:"username,omitempty"`
	TrackID   string  `json:"track_id,omitempty"`
}

// Handler Principal (WebSocket)

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	var currentRoom string

	// Garante limpeza de recursos ao desconectar
	defer func() {
		conn.Close()
		if currentRoom != "" {
			handleDisconnect(currentRoom, conn)
		}
	}()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			break // Cliente desconectado
		}

		switch msg.Action {
		case "join":
			currentRoom = msg.RoomID
			handleJoin(currentRoom, conn)

		case "play":
			handlePlay(msg)

		case "pause":
			handlePause(msg)

		case "chat":
			handleChat(msg)

		case "vote":
			handleVote(msg, conn)
		}
	}
}

// Regras de Negócio
// Funções para cada ação do cliente

func handleJoin(roomID string, conn *websocket.Conn) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	manager.clients[roomID] = append(manager.clients[roomID], conn)

	// Inicializa sala se necessário
	if _, exists := manager.states[roomID]; !exists {
		manager.states[roomID] = &RoomState{
			IsPlaying:  false,
			PausedAt:   0.0,
			VotedUsers: make(map[*websocket.Conn]bool),
		}
		log.Printf("[ROOM] Created: %s", roomID)
	}

	// Lógica de sincronização ao entrar
	state := manager.states[roomID]
	var currentPos float64

	if state.IsPlaying {
		elapsed := time.Since(state.StartTime).Seconds()
		currentPos = state.PausedAt + elapsed
		conn.WriteJSON(Message{Action: "sync", RoomID: roomID, Timestamp: currentPos, TrackID: state.CurrentMusic})
	} else {
		conn.WriteJSON(Message{Action: "pause", RoomID: roomID, Timestamp: state.PausedAt, TrackID: state.CurrentMusic})
	}
}

func handleDisconnect(roomID string, conn *websocket.Conn) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	// Remove cliente da lista ativa
	clients := manager.clients[roomID]
	for i, client := range clients {
		if client == conn {
			manager.clients[roomID] = append(clients[:i], clients[i+1:]...)
			break
		}
	}

	// Limpa votos e verifica estado da sala
	state := manager.states[roomID]
	if state != nil {
		if state.VotedUsers[conn] {
			delete(state.VotedUsers, conn)
		}

		totalUsers := len(manager.clients[roomID])
		votesCount := len(state.VotedUsers)

		log.Printf("[DISCONNECT] Room: %s | Active Users: %d", roomID, totalUsers)

		if totalUsers == 0 {
			delete(manager.states, roomID)
			log.Printf("[CLEANUP] Room %s deleted (empty)", roomID)
			return
		}

		// Atualiza a contagem de votos para os usuários restantes
		broadcastToRoom(Message{
			Action:  "vote_update",
			RoomID:  roomID,
			Content: fmt.Sprintf("Votos: %d/%d", votesCount, totalUsers),
		}, nil)
	}
}

func handlePlay(msg Message) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	state := manager.states[msg.RoomID]
	if state == nil {
		return
	}

	state.IsPlaying = true
	state.StartTime = time.Now().Add(-time.Duration(msg.Timestamp) * time.Second)
	state.PausedAt = msg.Timestamp
	if msg.TrackID != "" {
		state.CurrentMusic = msg.TrackID
	}

	log.Printf("[PLAY] Room: %s | Time: %.2fs", msg.RoomID, msg.Timestamp)
	broadcastToRoom(msg, nil)
}

func handlePause(msg Message) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	state := manager.states[msg.RoomID]
	if state == nil {
		return
	}

	state.IsPlaying = false
	state.PausedAt = msg.Timestamp
	if msg.TrackID != "" {
		state.CurrentMusic = msg.TrackID
	}

	log.Printf("[PAUSE] Room: %s | Time: %.2fs", msg.RoomID, msg.Timestamp)
	broadcastToRoom(msg, nil)
}

func handleChat(msg Message) {
	// Chat não precisa de lock de estado, apenas de I/O
	log.Printf("[CHAT] Room: %s | User: %s", msg.RoomID, msg.UserName)
	broadcastToRoom(msg, nil)
}

func handleVote(msg Message, conn *websocket.Conn) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	state := manager.states[msg.RoomID]
	if state == nil || state.VotedUsers[conn] {
		return
	}

	// Computa voto
	state.VotedUsers[conn] = true
	votesCount := len(state.VotedUsers)
	totalUsers := len(manager.clients[msg.RoomID])

	log.Printf("[VOTE] Room: %s | Count: %d/%d", msg.RoomID, votesCount, totalUsers)

	// Verifica Consenso (> 50%)
	if votesCount > totalUsers/2 {
		log.Printf("[SKIP] Consensus reached in %s", msg.RoomID)

		// Reseta votos e estado de reprodução
		state.VotedUsers = make(map[*websocket.Conn]bool)
		state.IsPlaying = true
		state.StartTime = time.Now()
		state.PausedAt = 0

		broadcastToRoom(Message{Action: "skip_approved", RoomID: msg.RoomID}, nil)
	} else {
		broadcastToRoom(Message{
			Action:  "vote_update",
			RoomID:  msg.RoomID,
			Content: fmt.Sprintf("Votos: %d/%d", votesCount, totalUsers),
		}, nil)
	}
}

func broadcastToRoom(msg Message, sender *websocket.Conn) {
	// Assume que o manager.lock já está ativo no caller
	// para evitar Race Conditions na leitura do map clients
	for _, client := range manager.clients[msg.RoomID] {
		if client != sender {
			client.WriteJSON(msg)
		}
	}
}

func main() {
	port := ":3005"
	http.HandleFunc("/ws", wsHandler)
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
