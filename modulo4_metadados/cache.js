/**
 * Cache em memória simples para Módulo 4 - Metadata Service
 * Diferencial SD: Cache antes de buscar no banco/arquivo
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live em ms
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Armazena um valor no cache
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    if (ttl > 0) {
      const expiresAt = Date.now() + ttl;
      this.ttl.set(key, expiresAt);
      
      // Limpa cache automaticamente após TTL
      setTimeout(() => {
        this.cache.delete(key);
        this.ttl.delete(key);
      }, ttl);
    }
    return value;
  }

  /**
   * Recupera valor do cache se existir e não expirou
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const expiresAt = this.ttl.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Verifica se chave existe no cache
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Remove uma chave do cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = new MemoryCache();
