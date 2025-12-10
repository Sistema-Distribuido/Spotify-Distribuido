/**
 * Server principal do Módulo 3 - Library Service
 * Porta 3003
 * Gerencia playlists e favoritos
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const playlistController = require('./playlistController');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ ROTAS DE PLAYLIST ============

// POST /playlist/criar - Cria uma nova playlist
app.post('/playlist/criar', playlistController.criar);

// GET /playlist/usuario/:usuarioId - Lista playlists do usuário
app.get('/playlist/usuario/:usuarioId', playlistController.listarPorUsuario);

// GET /playlist/:playlistId - Obtém uma playlist com detalhes
app.get('/playlist/:playlistId', playlistController.obter);

// POST /playlist/add - Adiciona música a uma playlist
app.post('/playlist/add', playlistController.adicionarMusica);

// POST /playlist/remover - Remove música de uma playlist
app.post('/playlist/remover', playlistController.removerMusica);

// PUT /playlist/:playlistId - Atualiza uma playlist
app.put('/playlist/:playlistId', playlistController.atualizar);

// DELETE /playlist/:playlistId - Deleta uma playlist
app.delete('/playlist/:playlistId', playlistController.deletar);

// ============ ALIASES ALTERNATIVAS ============

// GET /playlist/list (alias para /playlist/usuario/:usuarioId)
app.get('/playlist/list/:usuarioId', playlistController.listarPorUsuario);

// ============ HEALTH CHECK ============

// GET /health - Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    servico: 'Library Service',
    porta: PORT,
    timestamp: new Date().toISOString()
  });
});

// ============ ERROR HANDLING ============

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota ${req.path} não encontrada`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: err.message,
    timestamp: new Date().toISOString()
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    LIBRARY SERVICE - MÓDULO 3         ║
║         Porta: ${PORT}                ║
║  Gerencia Playlists e Favoritos       ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
