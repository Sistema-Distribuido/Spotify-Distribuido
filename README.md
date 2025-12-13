# Para rodar com Docker

- Pré-requisitos
  - Instale o Docker Desktop (Windows) e habilite o WSL2.
  - Abra um terminal na raiz do projeto `Spotify-Distribuido`.

- Subir todos os serviços
  - `docker compose up -d --build`
  - Aguarde o build inicial e verifique o status com `docker compose ps`.

- Rebuild após alterações de código
  - `docker compose up -d --build`

- Portas padrão
  - `modulo1_auth`: `http://localhost:3001`
  - `modulo2_streaming`: `http://localhost:3002`
  - `modulo3_biblioteca`: `http://localhost:3003`
  - `modulo4_metadados`: `http://localhost:3004`
  - `modulo5_sala`: `ws://localhost:3005` (WebSocket) ou `http://localhost:3005` se expor HTTP
  - `modulo6_assinatura`: `http://localhost:3006`

- Streaming online
  - O serviço `modulo2_streaming` suporta tocar músicas via URL remota usando o `STREAM_MAP` no `docker-compose.yml`.
  - Exemplo de `STREAM_MAP`: `{"catalogId1":"https://url/arquivo1.mp3","catalogId2":"https://url/arquivo2.mp3"}`
  - Para adicionar/remover mapeamentos, edite o valor de `STREAM_MAP` e suba novamente com `docker compose up -d --build`.


