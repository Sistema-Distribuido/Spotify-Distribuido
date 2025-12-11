package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func streamHandler(w http.ResponseWriter, r *http.Request) {
	//Caminho do arquivo (coloque um arquivo 'musica.mp3' na mesma pasta)
	filePath := "./musica.mp3"

	//Abre o arquivo
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "Música não encontrada", http.StatusNotFound)
		return
	}
	defer file.Close()

	//Pega informações do arquivo (para saber o tamanho e data)
	fileStat, err := file.Stat()
	if err != nil {
		http.Error(w, "Erro ao ler arquivo", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Tocando stream para: %s\n", r.RemoteAddr)

	// Essa função detecta automaticamente o header "Range" enviado pelo navegador.
	// Se o browser pedir "bytes=0-1024", o Go entrega só isso.
	// Se pedir tudo, entrega tudo. Ele lida com status 206 (Partial Content) sozinho.
	http.ServeContent(w, r, "musica.mp3", fileStat.ModTime(), file)
}

func main() {
	http.HandleFunc("/stream", streamHandler)

	port := ":3002"
	fmt.Printf("Serviço de Streaming rodando em http://localhost%s\n", port)

	// Configura timeouts para evitar que conexões "zumbis" travem o server
	server := &http.Server{
		Addr:         port,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Fatal(server.ListenAndServe())
}
