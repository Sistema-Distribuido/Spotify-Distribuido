/**
 * Armazenamento de dados em JSON para Módulo 4
 * Simula um banco de dados persistente
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data', 'musicas.json');

// Garante que a pasta data existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Dados iniciais de exemplo
const initialData = [
  {
    id: uuidv4(),
    titulo: 'Bohemian Rhapsody',
    artista: 'Queen',
    capa: 'https://via.placeholder.com/300?text=Queen',
    duracao: 354 // segundos
  },
  {
    id: uuidv4(),
    titulo: 'Imagine',
    artista: 'John Lennon',
    capa: 'https://via.placeholder.com/300?text=Lennon',
    duracao: 183
  },
  {
    id: uuidv4(),
    titulo: 'Hotel California',
    artista: 'Eagles',
    capa: 'https://via.placeholder.com/300?text=Eagles',
    duracao: 391
  }
];

/**
 * Lê todas as músicas do arquivo
 */
function readMusicas() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
    // Se arquivo não existe, cria com dados iniciais
    writeMusicas(initialData);
    return initialData;
  } catch (error) {
    console.error('Erro ao ler músicas:', error);
    return [];
  }
}

/**
 * Escreve músicas no arquivo
 */
function writeMusicas(musicas) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(musicas, null, 2));
  } catch (error) {
    console.error('Erro ao escrever músicas:', error);
  }
}

/**
 * Encontra uma música por ID
 */
function findById(id) {
  const musicas = readMusicas();
  return musicas.find(m => m.id === id);
}

/**
 * Cria uma nova música
 */
function create(dados) {
  const musicas = readMusicas();
  const novaMusica = {
    id: uuidv4(),
    titulo: dados.titulo,
    artista: dados.artista,
    capa: dados.capa,
    duracao: parseInt(dados.duracao)
  };
  musicas.push(novaMusica);
  writeMusicas(musicas);
  return novaMusica;
}

/**
 * Atualiza uma música
 */
function update(id, dados) {
  const musicas = readMusicas();
  const index = musicas.findIndex(m => m.id === id);
  
  if (index === -1) return null;
  
  musicas[index] = {
    ...musicas[index],
    titulo: dados.titulo || musicas[index].titulo,
    artista: dados.artista || musicas[index].artista,
    capa: dados.capa || musicas[index].capa,
    duracao: dados.duracao ? parseInt(dados.duracao) : musicas[index].duracao
  };
  
  writeMusicas(musicas);
  return musicas[index];
}

/**
 * Deleta uma música
 */
function delete_(id) {
  const musicas = readMusicas();
  const index = musicas.findIndex(m => m.id === id);
  
  if (index === -1) return false;
  
  musicas.splice(index, 1);
  writeMusicas(musicas);
  return true;
}

/**
 * Retorna todas as músicas
 */
function getAll() {
  return readMusicas();
}

module.exports = {
  findById,
  create,
  update,
  delete: delete_,
  getAll,
  readMusicas,
  writeMusicas
};
