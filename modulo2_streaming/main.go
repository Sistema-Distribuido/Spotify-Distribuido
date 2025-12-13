package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func resolveRemoteURL(id string) string {
	raw := os.Getenv("STREAM_MAP")
	if raw != "" {
		m := map[string]string{}
		if json.Unmarshal([]byte(raw), &m) == nil {
			if u := m[id]; u != "" {
				return u
			}
		}
	}
	base := os.Getenv("STREAM_BASE_URL")
	if base != "" && id != "" {
		if strings.HasSuffix(base, "/") {
			return base + id + ".mp3"
		}
		return base + "/" + id + ".mp3"
	}
	return ""
}

func proxyRemote(w http.ResponseWriter, r *http.Request, url string) {
	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequest(r.Method, url, nil)
	if h := r.Header.Get("Range"); h != "" {
		req.Header.Set("Range", h)
	}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Falha ao obter remoto", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	for k, v := range resp.Header {
		w.Header()[k] = v
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Range, Content-Type")
	if w.Header().Get("Content-Type") == "" {
		w.Header().Set("Content-Type", "audio/mpeg")
	}
	w.WriteHeader(resp.StatusCode)
	if r.Method != http.MethodHead && resp.Body != nil {
		io.Copy(w, resp.Body)
	}
}

func streamHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Range, Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	
	var filePath string
	id := strings.TrimPrefix(r.URL.Path, "/stream/")
	if id != "" && id != "stream" {
		candidate := "/app/audio/" + id + ".mp3"
		if _, err := os.Stat(candidate); err == nil {
			filePath = candidate
		}
		if filePath == "" {
			if remote := resolveRemoteURL(id); remote != "" {
				proxyRemote(w, r, remote)
				return
			}
		}
	}
	if filePath == "" {
		env := os.Getenv("MUSIC_FILE")
		if env != "" {
			filePath = env
		} else if _, err := os.Stat("/app/audio/musica.mp3"); err == nil {
			filePath = "/app/audio/musica.mp3"
		} else {
			filePath = "./musica.mp3"
		}
	}

	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "Música não encontrada", http.StatusNotFound)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Type", "audio/mpeg")

	fileStat, err := file.Stat()
	if err != nil {
		http.Error(w, "Erro ao ler arquivo", http.StatusInternalServerError)
		return
	}

	size := fileStat.Size()
	w.Header().Set("Accept-Ranges", "bytes")
	rangeHeader := r.Header.Get("Range")
	if rangeHeader != "" && strings.HasPrefix(rangeHeader, "bytes=") {
		parts := strings.Split(strings.TrimPrefix(rangeHeader, "bytes="), "-")
		start, _ := strconv.ParseInt(parts[0], 10, 64)
		var end int64
		if len(parts) > 1 && parts[1] != "" {
			end, _ = strconv.ParseInt(parts[1], 10, 64)
			if end >= size {
				end = size - 1
			}
		} else {
			end = size - 1
		}
		if start < 0 || start >= size {
			w.Header().Set("Content-Range", fmt.Sprintf("bytes */%d", size))
			http.Error(w, "", http.StatusRequestedRangeNotSatisfiable)
			return
		}
		chunkSize := end - start + 1
		w.Header().Set("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, size))
		w.Header().Set("Content-Length", fmt.Sprintf("%d", chunkSize))
		w.WriteHeader(http.StatusPartialContent)
		file.Seek(start, io.SeekStart)
		io.CopyN(w, file, chunkSize)
	} else {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", size))
		http.ServeContent(w, r, "musica.mp3", fileStat.ModTime(), file)
	}
}

func main() {
	http.HandleFunc("/stream", streamHandler)
	http.HandleFunc("/stream/", streamHandler)

	port := ":3002"
	fmt.Printf("Serviço de Streaming rodando em http://localhost%s\n", port)

	server := &http.Server{
		Addr:         port,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Fatal(server.ListenAndServe())
}
