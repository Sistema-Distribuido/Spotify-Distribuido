/**
 * Service de Playlist
 * Gerencia playlists e integração com Metadata Service
 */

const playlistStorage = require('./playlistStorage');
const metadataClient = require('./metadataClient');

class PlaylistService {
  /**
   * Cria uma nova playlist
   */
  criar(userId, nome, descricao = '') {
    if (!nome) {
      throw new Error('Nome da playlist é obrigatório');
    }
    
    return playlistStorage.create(userId, nome, descricao);
  }

  /**
   * Lista playlists de um usuário
   */
  listarPorUsuario(userId) {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }
    
    return playlistStorage.findByUserId(userId);
  }

  /**
   * Obtém uma playlist com detalhes das músicas
   * Diferencial SD: Trata erro graciosamente se Módulo 4 cair
   */
  async obterComDetalhes(playlistId) {
    const playlist = playlistStorage.findById(playlistId);
    
    if (!playlist) {
      return null;
    }
    
    // Tenta buscar detalhes das músicas
    let musicas = [];
    if (playlist.musicaIds.length > 0) {
      musicas = await metadataClient.buscarMusicas(playlist.musicaIds);
    }
    
    return {
      ...playlist,
      musicas
    };
  }

  /**
   * Adiciona uma música a uma playlist
   */
  adicionarMusica(playlistId, musicaId) {
    if (!playlistId || !musicaId) {
      throw new Error('PlaylistId e MusicaId são obrigatórios');
    }
    
    const playlist = playlistStorage.addMusica(playlistId, musicaId);
    
    if (!playlist) {
      throw new Error(`Playlist com ID ${playlistId} não encontrada`);
    }
    
    return playlist;
  }

  /**
   * Remove uma música de uma playlist
   */
  removerMusica(playlistId, musicaId) {
    if (!playlistId || !musicaId) {
      throw new Error('PlaylistId e MusicaId são obrigatórios');
    }
    
    const playlist = playlistStorage.removeMusica(playlistId, musicaId);
    
    if (!playlist) {
      throw new Error(`Playlist com ID ${playlistId} não encontrada`);
    }
    
    return playlist;
  }

  /**
   * Deleta uma playlist
   */
  deletar(playlistId) {
    const sucesso = playlistStorage.delete(playlistId);
    
    if (!sucesso) {
      throw new Error(`Playlist com ID ${playlistId} não encontrada`);
    }
    
    return sucesso;
  }

  /**
   * Atualiza nome e descrição da playlist
   */
  atualizar(playlistId, nome, descricao) {
    const playlist = playlistStorage.update(playlistId, nome, descricao);
    
    if (!playlist) {
      throw new Error(`Playlist com ID ${playlistId} não encontrada`);
    }
    
    return playlist;
  }
}

module.exports = new PlaylistService();
