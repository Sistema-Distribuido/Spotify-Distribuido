/**
 * Armazenamento de Playlists e Favoritos em JSON
 * Armazena apenas os IDs das músicas (vêm do Módulo 4)
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PLAYLISTS_FILE = path.join(__dirname, 'data', 'playlists.json');

// Garante que a pasta data existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

/**
 * Lê todas as playlists do arquivo
 */
function readPlaylists() {
  try {
    if (fs.existsSync(PLAYLISTS_FILE)) {
      const data = fs.readFileSync(PLAYLISTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Erro ao ler playlists:', error);
    return [];
  }
}

/**
 * Escreve playlists no arquivo
 */
function writePlaylists(playlists) {
  try {
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
  } catch (error) {
    console.error('Erro ao escrever playlists:', error);
  }
}

/**
 * Encontra uma playlist por ID
 */
function findById(id) {
  const playlists = readPlaylists();
  return playlists.find(p => p.id === id);
}

/**
 * Encontra playlists por usuário ID
 */
function findByUserId(userId) {
  const playlists = readPlaylists();
  return playlists.filter(p => p.userId === userId);
}

/**
 * Cria uma nova playlist
 */
function create(userId, nome, descricao = '') {
  const playlists = readPlaylists();
  const novaPlaylist = {
    id: uuidv4(),
    userId,
    nome,
    descricao,
    musicaIds: [], // Array de IDs de músicas
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };
  playlists.push(novaPlaylist);
  writePlaylists(playlists);
  return novaPlaylist;
}

/**
 * Adiciona uma música a uma playlist (por ID)
 */
function addMusica(playlistId, musicaId) {
  const playlists = readPlaylists();
  const index = playlists.findIndex(p => p.id === playlistId);
  
  if (index === -1) return null;
  
  // Evita duplicatas
  if (!playlists[index].musicaIds.includes(musicaId)) {
    playlists[index].musicaIds.push(musicaId);
    playlists[index].atualizadoEm = new Date().toISOString();
    writePlaylists(playlists);
  }
  
  return playlists[index];
}

/**
 * Remove uma música de uma playlist
 */
function removeMusica(playlistId, musicaId) {
  const playlists = readPlaylists();
  const index = playlists.findIndex(p => p.id === playlistId);
  
  if (index === -1) return null;
  
  const musicaIndex = playlists[index].musicaIds.indexOf(musicaId);
  if (musicaIndex > -1) {
    playlists[index].musicaIds.splice(musicaIndex, 1);
    playlists[index].atualizadoEm = new Date().toISOString();
    writePlaylists(playlists);
  }
  
  return playlists[index];
}

/**
 * Deleta uma playlist
 */
function delete_(id) {
  const playlists = readPlaylists();
  const index = playlists.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  playlists.splice(index, 1);
  writePlaylists(playlists);
  return true;
}

/**
 * Atualiza dados da playlist (nome, descrição)
 */
function update(id, nome, descricao) {
  const playlists = readPlaylists();
  const index = playlists.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  playlists[index].nome = nome || playlists[index].nome;
  playlists[index].descricao = descricao !== undefined ? descricao : playlists[index].descricao;
  playlists[index].atualizadoEm = new Date().toISOString();
  
  writePlaylists(playlists);
  return playlists[index];
}

module.exports = {
  findById,
  findByUserId,
  create,
  addMusica,
  removeMusica,
  delete: delete_,
  update,
  readPlaylists,
  writePlaylists
};
