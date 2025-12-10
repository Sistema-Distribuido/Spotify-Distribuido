/**
 * Server principal do Módulo 4 - Metadata Service
 * Porta 3004
 * Retorna JSONs padronizados com suporte a cache
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const musicaController = require('./musicaController');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ ROTAS DE MÚSICA ============

// GET /musicas - Obtém todas as músicas
app.get('/musicas', musicaController.obterTodas);

// GET /musicas/:id - Obtém uma música por ID
app.get('/musicas/:id', musicaController.obterPorId);

// POST /musicas - Cria uma nova música
app.post('/musicas', musicaController.criar);

// PUT /musicas/:id - Atualiza uma música
app.put('/musicas/:id', musicaController.atualizar);

// DELETE /musicas/:id - Deleta uma música
app.delete('/musicas/:id', musicaController.deletar);

// ============ ROTAS DE CACHE ============

// GET /cache/stats - Estatísticas do cache
app.get('/cache/stats', musicaController.obterStatsCache);

// POST /cache/limpar - Limpa o cache
app.post('/cache/limpar', musicaController.limparCache);

// ============ HEALTH CHECK ============

// GET /health - Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    servico: 'Metadata Service',
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
║   METADATA SERVICE - MÓDULO 4         ║
║         Porta: ${PORT}                ║
║     Streaming de Metadados + Cache    ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
