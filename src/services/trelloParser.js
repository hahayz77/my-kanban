/**
 * Groups checklists by their associated card ID
 * @param {Array<Object>} [checklists=[]] - The list of raw Trello checklists
 * @returns {Record<string, Array<Object>>} Map of cardId to list of checklists
 */
const groupChecklistsByCard = (checklists = []) => {
  return checklists.reduce((acc, checklist) => {
    const cardId = checklist.idCard
    if (!cardId) {
      return acc
    }

    if (!acc[cardId]) {
      acc[cardId] = []
    }

    acc[cardId].push({
      id: checklist.id,
      name: checklist.name,
      pos: checklist.pos,
      checkItems: (checklist.checkItems || []).map((item) => ({
        id: item.id,
        name: item.name,
        state: item.state,
        pos: item.pos
      }))
    })

    return acc
  }, {})
}

/**
 * Parses a raw Trello JSON export into the local Kanban structure
 * @param {Object} trelloData - The parsed JSON object from Trello
 * @returns {Object} Structured data containing board, columns, and cards
 */
export const parseTrelloExport = (trelloData) => {
  if (!trelloData || typeof trelloData !== "object") {
    throw new Error("Invalid Trello JSON data provided")
  }

  const boardId = trelloData.id || "default-board"
  const board = {
    id: boardId,
    title: trelloData.name || "Ao Infinito e Além!",
    updatedAt: new Date().toISOString()
  }

  // Filter open lists and sort by position
  const rawLists = Array.isArray(trelloData.lists) ? trelloData.lists : []
  const openLists = rawLists
    .filter((list) => !list.closed)
    .sort((a, b) => (a.pos || 0) - (b.pos || 0))

  const validColumnIds = new Set(openLists.map((list) => list.id))

  const columns = openLists.map((list, index) => ({
    id: list.id,
    boardId,
    title: list.name,
    order: index
  }))

  const rawChecklists = Array.isArray(trelloData.checklists) ? trelloData.checklists : []
  const checklistsByCard = groupChecklistsByCard(rawChecklists)

  // Filter open cards belonging to active columns and sort by position
  const rawCards = Array.isArray(trelloData.cards) ? trelloData.cards : []
  const openCards = rawCards
    .filter((card) => !card.closed && validColumnIds.has(card.idList))
    .sort((a, b) => (a.pos || 0) - (b.pos || 0))

  // Assign incremental order per column
  const cardCounters = {}

  const cards = openCards.map((card) => {
    const colId = card.idList
    const currentOrder = cardCounters[colId] || 0
    cardCounters[colId] = currentOrder + 1

    // Stickers: preserve if already set, or assign to PRÓXIMOS OBJETIVOS
    let sticker = card.sticker || null
    if (!sticker && card.name) {
      const upperName = card.name.trim().toUpperCase()
      if (upperName === "PRÓXIMOS OBJETIVOS") {
        sticker = { type: "builtin", id: "pc-alert" }
      }
    }

    return {
      id: card.id,
      columnId: colId,
      title: card.name,
      desc: card.desc || "",
      order: currentOrder,
      labels: Array.isArray(card.labels)
        ? card.labels.map((l) => ({
            id: l.id,
            name: l.name,
            color: l.color
          }))
        : [],
      due: card.due || null,
      dueComplete: Boolean(card.dueComplete),
      cover:
        card.cover && card.cover.color
          ? {
              color: card.cover.color,
              size: card.cover.size === "full" ? "full" : "normal",
              brightness: card.cover.brightness || "dark"
            }
          : null,
      sticker,
      checklists: checklistsByCard[card.id] || []
    }
  })

  // Extract board-level labels from Trello
  const rawLabels = Array.isArray(trelloData.labels) ? trelloData.labels : []
  const boardLabels = rawLabels
    .filter((l) => l.name || l.color)
    .map((l) => ({
      id: l.id || "lbl-" + Math.random().toString(36).substr(2, 6),
      name: l.name || "",
      color: l.color || "black_dark"
    }))

  return {
    board,
    columns,
    cards,
    labels: boardLabels
  }
}
