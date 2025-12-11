/**
 * Cliente HTTP para comunicar com Metadata Service (Módulo 4)
 * Diferencial SD: Tratamento gracioso quando Módulo 4 cai
 */

const axios = require('axios');

const METADATA_SERVICE_URL = process.env.METADATA_SERVICE_URL || 'http://localhost:3004';

/**
 * Busca os detalhes de uma música no Metadata Service
 * Retorna null se o serviço estiver indisponível (fallback gracioso)
 */
async function buscarMusica(musicaId) {
  try {
    const response = await axios.get(`${METADATA_SERVICE_URL}/musicas/${musicaId}`, {
      timeout: 5000 // Timeout de 5 segundos
    });
    
    if (response.data.sucesso) {
      return response.data.dados;
    }
    return null;
  } catch (error) {
    // Metadata Service pode estar down
    console.warn(`[INTEGRAÇÃO] Erro ao buscar música ${musicaId}:`, error.message);
    return null;
  }
}

/**
 * Busca os detalhes de múltiplas músicas
 * Retorna apenas as que conseguir buscar (fallback gracioso)
 */
async function buscarMusicas(musicaIds) {
  const promessas = musicaIds.map(id => buscarMusica(id));
  const resultados = await Promise.allSettled(promessas);
  
  return resultados
    .map((resultado, index) => {
      if (resultado.status === 'fulfilled' && resultado.value) {
        return resultado.value;
      }
      // Se falhar, retorna apenas o ID da música
      return {
        id: musicaIds[index],
        titulo: 'Indisponível',
        artista: 'Indisponível',
        capa: null,
        duracao: 0,
        aviso: 'Detalhes indisponíveis (Metadata Service offline)'
      };
    });
}

/**
 * Verifica se o Metadata Service está disponível
 */
async function verificarSaude() {
  try {
    const response = await axios.get(`${METADATA_SERVICE_URL}/health`, {
      timeout: 3000
    });
    return response.status === 200;
  } catch (error) {
    console.warn('[INTEGRAÇÃO] Metadata Service offline');
    return false;
  }
}

module.exports = {
  buscarMusica,
  buscarMusicas,
  verificarSaude
};
