/**
 * Controller de Playlist para Módulo 3
 * Rotas /playlist/add e /playlist/list
 */

const playlistService = require('./playlistService');

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
 * POST /playlist/criar - Cria uma nova playlist
 */
function criar(req, res) {
  try {
    const { usuarioId, nome, descricao } = req.body;
    
    if (!usuarioId || !nome) {
      return responderErro(res, 'UsuarioId e nome são obrigatórios', 400);
    }
    
    const playlist = playlistService.criar(usuarioId, nome, descricao);
    responderSucesso(res, playlist, 'Playlist criada com sucesso', 201);
  } catch (error) {
    responderErro(res, error.message || 'Erro ao criar playlist', 400, error);
  }
}

/**
 * GET /playlist/usuario/:usuarioId - Lista playlists do usuário
 */
function listarPorUsuario(req, res) {
  try {
    const { usuarioId } = req.params;
    
    if (!usuarioId) {
      return responderErro(res, 'UsuarioId é obrigatório', 400);
    }
    
    const playlists = playlistService.listarPorUsuario(usuarioId);
    responderSucesso(res, playlists, 'Playlists recuperadas com sucesso');
  } catch (error) {
    responderErro(res, error.message || 'Erro ao listar playlists', 400, error);
  }
}

/**
 * GET /playlist/:playlistId - Obtém uma playlist com detalhes das músicas
 */
function obter(req, res) {
  (async () => {
    try {
      const { playlistId } = req.params;
      
      if (!playlistId) {
        return responderErro(res, 'PlaylistId é obrigatório', 400);
      }
      
      const playlist = await playlistService.obterComDetalhes(playlistId);
      
      if (!playlist) {
        return responderErro(res, `Playlist com ID ${playlistId} não encontrada`, 404);
      }
      
      responderSucesso(res, playlist, 'Playlist recuperada com sucesso');
    } catch (error) {
      responderErro(res, error.message || 'Erro ao recuperar playlist', 400, error);
    }
  })();
}

/**
 * POST /playlist/add - Adiciona uma música a uma playlist
 * Diferencial SD: Mantém funcionamento mesmo se Módulo 4 cair
 */
function adicionarMusica(req, res) {
  try {
    const { playlistId, musicaId } = req.body;
    
    if (!playlistId || !musicaId) {
      return responderErro(res, 'PlaylistId e MusicaId são obrigatórios', 400);
    }
    
    const playlist = playlistService.adicionarMusica(playlistId, musicaId);
    responderSucesso(res, playlist, 'Música adicionada à playlist com sucesso');
  } catch (error) {
    responderErro(res, error.message || 'Erro ao adicionar música', 400, error);
  }
}

/**
 * POST /playlist/remover - Remove uma música de uma playlist
 */
function removerMusica(req, res) {
  try {
    const { playlistId, musicaId } = req.body;
    
    if (!playlistId || !musicaId) {
      return responderErro(res, 'PlaylistId e MusicaId são obrigatórios', 400);
    }
    
    const playlist = playlistService.removerMusica(playlistId, musicaId);
    responderSucesso(res, playlist, 'Música removida da playlist com sucesso');
  } catch (error) {
    responderErro(res, error.message || 'Erro ao remover música', 400, error);
  }
}

/**
 * DELETE /playlist/:playlistId - Deleta uma playlist
 */
function deletar(req, res) {
  try {
    const { playlistId } = req.params;
    
    if (!playlistId) {
      return responderErro(res, 'PlaylistId é obrigatório', 400);
    }
    
    playlistService.deletar(playlistId);
    responderSucesso(res, null, 'Playlist deletada com sucesso');
  } catch (error) {
    responderErro(res, error.message || 'Erro ao deletar playlist', 400, error);
  }
}

/**
 * PUT /playlist/:playlistId - Atualiza uma playlist
 */
function atualizar(req, res) {
  try {
    const { playlistId } = req.params;
    const { nome, descricao } = req.body;
    
    if (!playlistId) {
      return responderErro(res, 'PlaylistId é obrigatório', 400);
    }
    
    const playlist = playlistService.atualizar(playlistId, nome, descricao);
    responderSucesso(res, playlist, 'Playlist atualizada com sucesso');
  } catch (error) {
    responderErro(res, error.message || 'Erro ao atualizar playlist', 400, error);
  }
}

module.exports = {
  criar,
  listarPorUsuario,
  obter,
  adicionarMusica,
  removerMusica,
  deletar,
  atualizar
};
