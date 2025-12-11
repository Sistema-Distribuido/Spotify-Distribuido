# Módulo 4 - Metadata Service 🎵

Serviço responsável pelo **CRUD de músicas** e **Sistema de Cache** para resposta rápida.

## 🎯 Características Principais

- ✅ **CRUD Completo**: Criar, Ler, Atualizar e Deletar músicas
- 📊 **Campos**: Título, Artista, URL da Capa, Duração (em segundos)
- 💾 **Storage**: Persistência em JSON
- ⚡ **Cache em Memória**: TTL de 5 minutos para respostas rápidas
- 🎯 **Diferencial SD**: Verifica cache antes de acessar storage para resposta imediata

## 🚀 Instalação

```bash
cd modulo4_metadados
npm install
```

## ▶️ Execução

```bash
npm start
```

O servidor estará disponível em `http://localhost:3004`

## 📡 Rotas Disponíveis

### Músicas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/musicas` | Lista todas as músicas |
| GET | `/musicas/:id` | Obtém uma música por ID |
| POST | `/musicas` | Cria uma nova música |
| PUT | `/musicas/:id` | Atualiza uma música |
| DELETE | `/musicas/:id` | Deleta uma música |

### Cache

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/cache/stats` | Estatísticas do cache |
| POST | `/cache/limpar` | Limpa todo o cache |

### Status

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check do serviço |

## 📝 Exemplos de Uso

### Listar todas as músicas

```bash
curl http://localhost:3004/musicas
```

**PowerShell:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3004/musicas"
($response.Content | ConvertFrom-Json).dados
```

### Obter uma música por ID

```bash
curl http://localhost:3004/musicas/musica-uuid-aqui
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3004/musicas/musica-uuid-aqui" | ConvertFrom-Json
```

### Criar uma nova música

```bash
curl -X POST http://localhost:3004/musicas \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Imagine",
    "artista": "John Lennon",
    "capa": "https://example.com/imagine.jpg",
    "duracao": 183
  }'
```

**PowerShell:**
```powershell
$body = ConvertTo-Json @{
  titulo = "Imagine"
  artista = "John Lennon"
  capa = "https://example.com/imagine.jpg"
  duracao = 183
}
Invoke-WebRequest -Uri "http://localhost:3004/musicas" -Method Post -ContentType "application/json" -Body $body
```

### Atualizar uma música

```bash
curl -X PUT http://localhost:3004/musicas/musica-uuid-aqui \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Imagine (Remastered)",
    "duracao": 185
  }'
```

**PowerShell:**
```powershell
$body = ConvertTo-Json @{
  titulo = "Imagine (Remastered)"
  duracao = 185
}
Invoke-WebRequest -Uri "http://localhost:3004/musicas/musica-uuid-aqui" -Method Put -ContentType "application/json" -Body $body
```

### Deletar uma música

```bash
curl -X DELETE http://localhost:3004/musicas/musica-uuid-aqui
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3004/musicas/musica-uuid-aqui" -Method Delete
```

### Ver estatísticas do cache

```bash
curl http://localhost:3004/cache/stats
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3004/cache/stats" | ConvertFrom-Json
```

### Limpar o cache

```bash
curl -X POST http://localhost:3004/cache/limpar
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3004/cache/limpar" -Method Post
```

## 📊 Formato de Resposta

Todas as respostas seguem o formato padronizado:

### Sucesso
```json
{
  "sucesso": true,
  "mensagem": "Música criada com sucesso",
  "dados": {
    "id": "9375bbe4-2a82-49b1-a1e9-82735fa13513",
    "titulo": "Bohemian Rhapsody",
    "artista": "Queen",
    "capa": "https://via.placeholder.com/300?text=Queen",
    "duracao": 354
  },
  "timestamp": "2025-12-09T18:00:00.000Z"
}
```

### Erro
```json
{
  "sucesso": false,
  "mensagem": "Música com ID xyz não encontrada",
  "erro": "Detalhes do erro",
  "timestamp": "2025-12-09T18:00:00.000Z"
}
```

## ⚡ Sistema de Cache (Diferencial SD)

### Funcionamento

1. **Cache Miss**: Primeira requisição busca no storage e armazena no cache
2. **Cache Hit**: Requisições subsequentes retornam dados do cache (muito mais rápido)
3. **TTL**: Cache expira após 5 minutos automaticamente
4. **Invalidação**: Cache é limpo ao criar, atualizar ou deletar músicas

### Logs de Cache

```
[CACHE MISS] Buscando música abc-123 no storage
[CACHE HIT] Música abc-123 obtida do cache
[CACHE INVALIDATED] Música abc-123 atualizada
[CACHE CLEARED] Cache foi limpo completamente
```

### Estatísticas do Cache

```bash
curl http://localhost:3004/cache/stats
```

Resposta:
```json
{
  "sucesso": true,
  "dados": {
    "size": 3,
    "keys": [
      "musicas:all",
      "musica:abc-123",
      "musica:def-456"
    ]
  }
}
```

## 🏗️ Arquitetura

```
modulo4_metadados/
├── server.js           # Servidor Express principal
├── musicaController.js # Endpoints REST
├── musicaService.js    # Lógica de negócio + cache
├── cache.js            # Sistema de cache em memória
├── storage.js          # Persistência em JSON
├── package.json        # Dependências
├── .env               # Configurações
└── data/
    └── musicas.json   # Dados persistidos
```

## 🔧 Configuração (.env)

```env
PORT=3004
NODE_ENV=development
```

## 📦 Dependências

- **express**: Framework web
- **cors**: Habilita CORS
- **dotenv**: Gerenciamento de variáveis de ambiente
- **uuid**: Geração de IDs únicos

## 🧪 Testando

### Health Check
```bash
curl http://localhost:3004/health
```

### Fluxo Completo com Cache
```bash
# 1. Criar música (invalida cache de listagem)
MUSICA=$(curl -s -X POST http://localhost:3004/musicas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Test","artista":"Artist","duracao":180}' | jq -r '.dados.id')

# 2. Buscar música (cache miss)
curl http://localhost:3004/musicas/$MUSICA

# 3. Buscar novamente (cache hit - mais rápido!)
curl http://localhost:3004/musicas/$MUSICA

# 4. Ver estatísticas
curl http://localhost:3004/cache/stats

# 5. Atualizar música (invalida cache)
curl -X PUT http://localhost:3004/musicas/$MUSICA \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Test Updated"}'

# 6. Deletar música (invalida cache)
curl -X DELETE http://localhost:3004/musicas/$MUSICA
```

## 💾 Dados Iniciais

O serviço vem com 3 músicas pré-cadastradas:

1. **Bohemian Rhapsody** - Queen (354s)
2. **Imagine** - John Lennon (183s)
3. **Hotel California** - Eagles (391s)

## 🔍 Performance

### Sem Cache
- Primeira requisição: ~5-10ms (acesso ao arquivo JSON)

### Com Cache
- Requisições subsequentes: ~0.5-1ms (acesso à memória)
- **Ganho**: ~10x mais rápido

### TTL (Time To Live)
- Padrão: **5 minutos**
- Configurável no arquivo `cache.js`

## 🌐 Integração com Módulo 3

O Módulo 3 (Library Service) consome este serviço para obter detalhes das músicas:

```javascript
// Exemplo de integração
GET http://localhost:3004/musicas/{musicaId}
```

## 📌 Notas Importantes

1. **Cache**: Reduz latência e carga no storage
2. **Persistência**: Dados salvos em JSON no diretório `data/`
3. **Validação**: Campos obrigatórios: `titulo`, `artista`, `duracao`
4. **IDs**: Gerados automaticamente com UUID v4
5. **Duração**: Armazenada em segundos (inteiro)

## 🎨 Campos da Música

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | String (UUID) | Auto | Identificador único |
| `titulo` | String | ✅ | Nome da música |
| `artista` | String | ✅ | Nome do artista/banda |
| `capa` | String (URL) | ❌ | URL da imagem de capa |
| `duracao` | Integer | ✅ | Duração em segundos |

---

**Porta**: 3004  
**Status**: ✅ Operacional  
**Versão**: 1.0.0
