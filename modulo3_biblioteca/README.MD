# Módulo 3 - Library Service 📚

Serviço responsável por gerenciar **Playlists e Favoritos** com tratamento de integridade distribuída.

## 🎯 Características Principais

- 📝 **Gerenciamento de Playlists**: Criar, listar, atualizar e deletar
- 🎵 **Vinculação de Músicas**: Adicionar/remover músicas por ID
- 🔗 **Integração com Módulo 4**: Busca detalhes das músicas no Metadata Service
- 🛡️ **Tratamento de Falhas**: Continua funcionando mesmo se Módulo 4 estiver offline
- 🎯 **Diferencial SD**: Integridade graceful - lista músicas mesmo sem detalhes completos

## 🚀 Instalação

```bash
cd modulo3_biblioteca
npm install
```

## ▶️ Execução

```bash
npm start
```

O servidor estará disponível em `http://localhost:3003`

## 📡 Rotas Disponíveis

### Playlists

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/playlist/criar` | Cria uma nova playlist |
| GET | `/playlist/usuario/:usuarioId` | Lista playlists de um usuário |
| GET | `/playlist/list/:usuarioId` | Alias para listar playlists |
| GET | `/playlist/:playlistId` | Obtém playlist com detalhes das músicas |
| POST | `/playlist/add` | Adiciona música a uma playlist |
| POST | `/playlist/remover` | Remove música de uma playlist |
| PUT | `/playlist/:playlistId` | Atualiza nome/descrição da playlist |
| DELETE | `/playlist/:playlistId` | Deleta uma playlist |

### Status

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check do serviço |

## 📝 Exemplos de Uso

### Criar uma playlist

```bash
curl -X POST http://localhost:3003/playlist/criar \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user-123",
    "nome": "Minhas Músicas Favoritas",
    "descricao": "Playlist com meus artistas preferidos"
  }'
```

**PowerShell:**
```powershell
$body = ConvertTo-Json @{
  usuarioId = "user-123"
  nome = "Minhas Favoritas"
  descricao = "As melhores músicas"
}
Invoke-WebRequest -Uri "http://localhost:3003/playlist/criar" -Method Post -ContentType "application/json" -Body $body
```

### Adicionar música à playlist

```bash
curl -X POST http://localhost:3003/playlist/add \
  -H "Content-Type: application/json" \
  -d '{
    "playlistId": "playlist-uuid-aqui",
    "musicaId": "musica-uuid-aqui"
  }'
```

**PowerShell:**
```powershell
$body = ConvertTo-Json @{
  playlistId = "playlist-uuid-aqui"
  musicaId = "musica-uuid-aqui"
}
Invoke-WebRequest -Uri "http://localhost:3003/playlist/add" -Method Post -ContentType "application/json" -Body $body
```

### Listar playlists de um usuário

```bash
curl http://localhost:3003/playlist/usuario/user-123
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3003/playlist/usuario/user-123"
```

### Obter playlist com detalhes

```bash
curl http://localhost:3003/playlist/playlist-uuid-aqui
```

**PowerShell:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3003/playlist/playlist-uuid-aqui"
$response.Content | ConvertFrom-Json
```

## 📊 Formato de Resposta

Todas as respostas seguem o formato padronizado:

### Sucesso
```json
{
  "sucesso": true,
  "mensagem": "Playlist criada com sucesso",
  "dados": {
    "id": "901ce5c3-51c9-4a27-aa24-ed221a6813c3",
    "userId": "user-123",
    "nome": "Minhas Favoritas",
    "descricao": "As melhores",
    "musicaIds": [],
    "criadoEm": "2025-12-09T18:00:00.000Z",
    "atualizadoEm": "2025-12-09T18:00:00.000Z"
  },
  "timestamp": "2025-12-09T18:00:00.000Z"
}
```

### Erro
```json
{
  "sucesso": false,
  "mensagem": "Playlist com ID xyz não encontrada",
  "erro": "Detalhes do erro",
  "timestamp": "2025-12-09T18:00:00.000Z"
}
```

## 🛡️ Tratamento de Falhas (Diferencial SD)

Se o **Módulo 4 (Metadata Service)** estiver offline:

- ✅ Playlists continuam funcionando normalmente
- ✅ Músicas podem ser adicionadas/removidas (armazena apenas IDs)
- ✅ Lista de IDs das músicas é sempre retornada
- ⚠️ Detalhes das músicas aparecem como "Indisponível"

### Exemplo de resposta com Módulo 4 offline:

```json
{
  "id": "playlist-123",
  "nome": "Minhas Favoritas",
  "musicaIds": ["musica-1", "musica-2"],
  "musicas": [
    {
      "id": "musica-1",
      "titulo": "Indisponível",
      "artista": "Indisponível",
      "capa": null,
      "duracao": 0,
      "aviso": "Detalhes indisponíveis (Metadata Service offline)"
    }
  ]
}
```

## 🏗️ Arquitetura

```
modulo3_biblioteca/
├── server.js              # Servidor Express principal
├── playlistController.js  # Endpoints REST
├── playlistService.js     # Lógica de negócio
├── playlistStorage.js     # Persistência em JSON
├── metadataClient.js      # Cliente HTTP para Módulo 4
├── package.json           # Dependências
├── .env                   # Configurações
└── data/
    └── playlists.json     # Dados persistidos
```

## 🔧 Configuração (.env)

```env
PORT=3003
METADATA_SERVICE_URL=http://localhost:3004
NODE_ENV=development
```

## 📦 Dependências

- **express**: Framework web
- **cors**: Habilita CORS
- **dotenv**: Gerenciamento de variáveis de ambiente
- **uuid**: Geração de IDs únicos
- **axios**: Cliente HTTP para comunicação com Módulo 4

## 🧪 Testando

### Health Check
```bash
curl http://localhost:3003/health
```

### Fluxo Completo
```bash
# 1. Criar playlist
PLAYLIST=$(curl -s -X POST http://localhost:3003/playlist/criar \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"user-1","nome":"Test"}' | jq -r '.dados.id')

# 2. Adicionar música
curl -X POST http://localhost:3003/playlist/add \
  -H "Content-Type: application/json" \
  -d "{\"playlistId\":\"$PLAYLIST\",\"musicaId\":\"musica-id-aqui\"}"

# 3. Ver playlist com detalhes
curl http://localhost:3003/playlist/$PLAYLIST
```

## 🌐 Integração com Módulo 4

O serviço se comunica com o Metadata Service para obter detalhes das músicas:

- **Timeout**: 5 segundos por requisição
- **Fallback**: Retorna dados parciais se Módulo 4 falhar
- **Resiliência**: Usa `Promise.allSettled` para robustez

## 📌 Notas Importantes

1. **Armazenamento**: Playlists armazenam apenas IDs de músicas, não dados completos
2. **Desacoplamento**: Funciona independentemente do Módulo 4
3. **Graceful Degradation**: Serviço degradado mas funcional em caso de falhas
4. **Persistência**: Dados salvos em JSON no diretório `data/`

---

**Porta**: 3003  
**Status**: ✅ Operacional  
**Versão**: 1.0.0
