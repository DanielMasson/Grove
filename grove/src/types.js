// CONTRATO DE DADOS DO GROVE. Fonte única de verdade: mudou aqui, avise o grupo.
// Sem TypeScript: o contrato fica documentado em JSDoc (@typedef) e vale como referência.

/**
 * @typedef {'planicie' | 'montanha' | 'floresta' | 'savana'} BiomeId
 */

/**
 * @typedef {'baixa' | 'media' | 'alta'} Priority
 */

/**
 * @typedef {Object} Notebook
 * @property {string} id
 * @property {string} name A "matéria"
 * @property {BiomeId} biome
 * @property {string} createdAt ISO
 * @property {Source[]} sources
 */

/**
 * @typedef {Object} Source
 * @property {string} id
 * @property {'link' | 'youtube' | 'note'} type
 * @property {string} title
 * @property {string} [url]
 * @property {string} [text]
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Column
 * @property {string} id
 * @property {string} name
 * @property {number} order
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [dueDate] YYYY-MM-DD
 * @property {Priority} priority
 * @property {string} columnId
 * @property {string} [notebookId]
 * @property {number} order
 */

/**
 * Árvore plantada. stages = 1..4 (GROWTH_STAGES); no estágio 4 não evolui mais.
 *
 * @typedef {Object} Tree
 * @property {string} id
 * @property {BiomeId} biome
 * @property {string} species id da espécie (ver biomes/config.js)
 * @property {number} stages 1..4
 * @property {string} plantedAt ISO
 * @property {string} [notebookId]
 */

/**
 * Só sessões CONCLUÍDAS são salvas. Desistir ou fechar a aba descarta tudo.
 *
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} completedAt ISO
 * @property {number} minutes
 * @property {string} [taskId]
 * @property {string} [notebookId]
 * @property {BiomeId} biome
 * @property {string} species id da espécie de árvore (ver biomes/config.js)
 * @property {string} [treeId]
 * @property {number} [stagesGained] estágios que a árvore ganhou nesta sessão
 */

/**
 * @typedef {Object} AppData
 * @property {1} schemaVersion
 * @property {Notebook[]} notebooks
 * @property {Column[]} columns
 * @property {Task[]} tasks
 * @property {Session[]} sessions
 * @property {Tree[]} trees
 */

export {}
