/**
 * Controller de Música para Módulo 4
 * Retorna JSONs padronizados
 */

const musicaService = require('./musicaService');

/**
 * Resposta padronizada de sucesso
 */
function responderSucesso(res, dados, mensagem = 'Sucesso', statusCode = 200) {
  res.status(statusCode).json({
    sucesso: true,
    mensagem,
    dados,
    timestamp: new Date().toISOString()
  });
}

/**
 * Resposta padronizada de erro
 */
function responderErro(res, mensagem, statusCode = 400, erro = null) {
  res.status(statusCode).json({
    sucesso: false,
    mensagem,
    erro: erro ? erro.message : undefined,
    timestamp: new Date().toISOString()
  });
}

/**
 * GET /musicas - Obtém todas as músicas
 */
function obterTodas(req, res) {
  try {
    const musicas = musicaService.obterTodas();
    responderSucesso(res, musicas, 'Músicas recuperadas com sucesso');
  } catch (error) {
    responderErro(res, 'Erro ao recuperar músicas', 500, error);
  }
}

/**
 * GET /musicas/:id - Obtém uma música por ID
 */
function obterPorId(req, res) {
  try {
    const { id } = req.params;
    const musica = musicaService.obterPorId(id);
    
    if (!musica) {
      return responderErro(res, `Música com ID ${id} não encontrada`, 404);
    }
    
    responderSucesso(res, musica, 'Música recuperada com sucesso');
  } catch (error) {
    responderErro(res, 'Erro ao recuperar música', 500, error);
  }
}

/**
 * POST /musicas - Cria uma nova música
 */
function criar(req, res) {
  try {
    const { titulo, artista, capa, duracao } = req.body;
    
    // Valida entrada
    if (!titulo || !artista || !duracao) {
      return responderErro(
        res,
        'Campos obrigatórios: titulo, artista, duracao',
        400
      );
    }
    
    const musica = musicaService.criar({
      titulo,
      artista,
      capa: capa || 'https://via.placeholder.com/300?text=Sem+Capa',
      duracao
    });
    
    responderSucesso(res, musica, 'Música criada com sucesso', 201);
  } catch (error) {
    responderErro(res, error.message || 'Erro ao criar música', 400, error);
  }
}

/**
 * PUT /musicas/:id - Atualiza uma música
 */
function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { titulo, artista, capa, duracao } = req.body;
    
    const musica = musicaService.atualizar(id, {
      titulo,
      artista,
      capa,
      duracao
    });
    
    if (!musica) {
      return responderErro(res, `Música com ID ${id} não encontrada`, 404);
    }
    
    responderSucesso(res, musica, 'Música atualizada com sucesso');
  } catch (error) {
    responderErro(res, 'Erro ao atualizar música', 500, error);
  }
}

/**
 * DELETE /musicas/:id - Deleta uma música
 */
function deletar(req, res) {
  try {
    const { id } = req.params;
    const sucesso = musicaService.deletar(id);
    
    if (!sucesso) {
      return responderErro(res, `Música com ID ${id} não encontrada`, 404);
    }
    
    responderSucesso(res, null, 'Música deletada com sucesso');
  } catch (error) {
    responderErro(res, 'Erro ao deletar música', 500, error);
  }
}

/**
 * GET /cache/stats - Retorna estatísticas do cache
 */
function obterStatsCache(req, res) {
  try {
    const stats = musicaService.obterStatsCache();
    responderSucesso(res, stats, 'Estatísticas do cache');
  } catch (error) {
    responderErro(res, 'Erro ao obter stats do cache', 500, error);
  }
}

/**
 * POST /cache/limpar - Limpa o cache
 */
function limparCache(req, res) {
  try {
    musicaService.limparCache();
    responderSucesso(res, null, 'Cache limpo com sucesso');
  } catch (error) {
    responderErro(res, 'Erro ao limpar cache', 500, error);
  }
}

module.exports = {
  obterTodas,
  obterPorId,
  criar,
  atualizar,
  deletar,
  obterStatsCache,
  limparCache
};
