import Dexie from "dexie"

export const db = new Dexie("MyKanbanDB")

db.version(1).stores({
  boards: "id, title, updatedAt",
  columns: "id, boardId, order",
  cards: "id, columnId, order",
  metadata: "key, value"
})

/**
 * Saves the full Kanban board state to Dexie IndexedDB
 * @param {Object} kanbanState - The Kanban state containing board, columns, and cards
 * @param {Object} kanbanState.board - Board metadata
 * @param {Array<Object>} kanbanState.columns - List of columns
 * @param {Array<Object>} kanbanState.cards - List of cards
 * @returns {Promise<void>} Resolves when the save operation completes
 */
export const saveKanbanState = async (kanbanState) => {
  if (!kanbanState) {
    return
  }

  const { board, columns = [], cards = [] } = kanbanState

  await db.transaction("rw", [db.boards, db.columns, db.cards], async () => {
    if (board && board.id) {
      await db.boards.put({
        ...board,
        updatedAt: board.updatedAt || new Date().toISOString()
      })
    }

    if (columns.length > 0) {
      await db.columns.clear()
      await db.columns.bulkPut(columns)
    }

    if (cards.length > 0) {
      await db.cards.clear()
      await db.cards.bulkPut(cards)
    }
  })
}

/**
 * Loads the full Kanban board state from Dexie IndexedDB
 * @returns {Promise<Object|null>} The loaded board, columns, and cards or null if empty
 */
export const loadKanbanState = async () => {
  const boards = await db.boards.toArray()
  if (boards.length === 0) {
    return null
  }

  const board = boards[0]
  const columns = await db.columns.orderBy("order").toArray()
  const cards = await db.cards.orderBy("order").toArray()

  return {
    board,
    columns,
    cards
  }
}

/**
 * Retrieves a metadata value by key
 * @param {string} key - The metadata entry key
 * @returns {Promise<any>} The stored value or undefined
 */
export const getMetadata = async (key) => {
  const item = await db.metadata.get(key)
  return item ? item.value : undefined
}

/**
 * Sets a metadata key-value pair
 * @param {string} key - The metadata entry key
 * @param {any} value - The value to store
 * @returns {Promise<void>} Resolves when updated
 */
export const setMetadata = async (key, value) => {
  await db.metadata.put({ key, value })
}

/**
 * Clears all Kanban board tables
 * @returns {Promise<void>} Resolves when cleared
 */
export const clearKanbanDb = async () => {
  await db.transaction("rw", [db.boards, db.columns, db.cards], async () => {
    await db.boards.clear()
    await db.columns.clear()
    await db.cards.clear()
  })
}
