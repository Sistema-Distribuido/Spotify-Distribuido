/**
 * Service de Música com Cache
 * Implementa CRUD com cache em memória
 */

const cache = require('./cache');
const storage = require('./storage');

class MusicaService {
  /**
   * Obtém uma música por ID
   * Diferencial SD: Verifica cache antes de acessar storage
   */
  obterPorId(id) {
    // Tenta obter do cache primeiro
    const cacheKey = `musica:${id}`;
    let musica = cache.get(cacheKey);
    
    if (musica) {
      console.log(`[CACHE HIT] Música ${id} obtida do cache`);
      return musica;
    }
    
    // Se não está no cache, busca no storage
    console.log(`[CACHE MISS] Buscando música ${id} no storage`);
    musica = storage.findById(id);
    
    if (musica) {
      // Armazena no cache (5 minutos de TTL)
      cache.set(cacheKey, musica, 5 * 60 * 1000);
    }
    
    return musica;
  }

  /**
   * Obtém todas as músicas
   * Usa cache com chave única
   */
  obterTodas() {
    const cacheKey = 'musicas:all';
    let musicas = cache.get(cacheKey);
    
    if (musicas) {
      console.log(`[CACHE HIT] Todas as músicas obtidas do cache`);
      return musicas;
    }
    
    console.log(`[CACHE MISS] Buscando todas as músicas no storage`);
    musicas = storage.getAll();
    cache.set(cacheKey, musicas, 5 * 60 * 1000);
    
    return musicas;
  }

  /**
   * Cria uma nova música
   * Invalida cache após criar
   */
  criar(dados) {
    // Valida dados
    if (!dados.titulo || !dados.artista || !dados.duracao) {
      throw new Error('Título, artista e duração são obrigatórios');
    }
    
    const musica = storage.create(dados);
    
    // Invalida cache de todas as músicas
    cache.delete('musicas:all');
    
    console.log(`[CACHE INVALIDATED] Nova música criada: ${musica.id}`);
    return musica;
  }

  /**
   * Atualiza uma música
   * Invalida cache da música e da lista
   */
  atualizar(id, dados) {
    const musicaAtualizada = storage.update(id, dados);
    
    if (!musicaAtualizada) {
      return null;
    }
    
    // Invalida caches relacionados
    cache.delete(`musica:${id}`);
    cache.delete('musicas:all');
    
    console.log(`[CACHE INVALIDATED] Música ${id} atualizada`);
    return musicaAtualizada;
  }

  /**
   * Deleta uma música
   * Invalida cache da música e da lista
   */
  deletar(id) {
    const sucesso = storage.delete(id);
    
    if (sucesso) {
      cache.delete(`musica:${id}`);
      cache.delete('musicas:all');
      console.log(`[CACHE INVALIDATED] Música ${id} deletada`);
    }
    
    return sucesso;
  }

  /**
   * Retorna estatísticas do cache
   */
  obterStatsCache() {
    return cache.stats();
  }

  /**
   * Limpa todo o cache
   */
  limparCache() {
    cache.clear();
    console.log(`[CACHE CLEARED] Cache foi limpo completamente`);
  }
}

module.exports = new MusicaService();
