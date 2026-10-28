import { useState, useEffect, useCallback, useRef } from "react"
import {
  saveKanbanState,
  loadKanbanState,
  getMetadata,
  setMetadata,
  clearKanbanDb
} from "../db/indexDb"
import { parseTrelloExport } from "../services/trelloParser"
import { downloadLocalBackup } from "../services/backupService"
import { syncToGoogleDrive, createGoogleTokenClient } from "../services/googleDriveService"
import { useDebouncedCallback } from "./useDebouncedCallback"

/**
 * Custom hook to manage the Kanban board state, Dexie persistence, labels, layout settings, theme, and Google Drive syncing
 * @returns {Object} Kanban state and action handlers
 */
export const useKanban = () => {
  const [board, setBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [cards, setCards] = useState([])
  const [boardLabels, setBoardLabels] = useState([])
  const [boardTheme, setBoardTheme] = useState("galaxy")
  const [boardFont, setBoardFont] = useState("inter")
  const [columnWidth, setColumnWidth] = useState(220)
  const [cardDensity, setCardDensity] = useState("compact") // "ultra-compact" | "compact" | "normal" | "comfortable"
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState("idle") // idle, saving, saved, syncing, synced, error
  const [statusMessage, setStatusMessage] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [driveFileId, setDriveFileId] = useState(null)
  const [googleClientId, setGoogleClientId] = useState("")

  // Ref to hold current state for debounced async operations
  const stateRef = useRef({
    board,
    columns,
    cards,
    boardLabels,
    boardTheme,
    columnWidth,
    cardDensity,
    driveFileId,
    accessToken
  })

  useEffect(() => {
    stateRef.current = {
      board,
      columns,
      cards,
      boardLabels,
      boardTheme,
      columnWidth,
      cardDensity,
      driveFileId,
      accessToken
    }
  }, [
    board,
    columns,
    cards,
    boardLabels,
    boardTheme,
    columnWidth,
    cardDensity,
    driveFileId,
    accessToken
  ])

  /**
   * Updates status with current local timestamp
   * @param {string} prefix - Message prefix (e.g. "Salvo às")
   */
  const updateTimestampStatus = useCallback((prefix = "Atualizado às") => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    setStatusMessage(`${prefix} ${hours}:${minutes}`)
  }, [])

  /**
   * Debounced sync to Google Drive (3 seconds delay)
   */
  const debouncedDriveSync = useDebouncedCallback(async () => {
    const current = stateRef.current
    if (!current.accessToken || !current.board) {
      return
    }

    try {
      setStatus("syncing")
      setStatusMessage("Sincronizando com o Google Drive...")

      const newFileId = await syncToGoogleDrive(
        current.accessToken,
        current.driveFileId,
        {
          board: current.board,
          columns: current.columns,
          cards: current.cards,
          labels: current.boardLabels,
          settings: {
            theme: current.boardTheme,
            columnWidth: current.columnWidth,
            cardDensity: current.cardDensity
          }
        }
      )

      if (newFileId && newFileId !== current.driveFileId) {
        setDriveFileId(newFileId)
        await setMetadata("driveFileId", newFileId)
      }

      setStatus("synced")
      updateTimestampStatus("Sincronizado no Drive às")
    } catch (error) {
      console.error("Erro na sincronização com o Drive:", error)
      setStatus("error")
      setStatusMessage("Erro ao sincronizar com Google Drive")
    }
  }, 3000)

  /**
   * Persists the given Kanban state locally to Dexie and triggers debounced cloud sync
   * @param {Object} nextState - New board, columns, cards, and optional labels
   */
  const commitState = useCallback(
    async (nextState) => {
      const now = new Date().toISOString()
      const updatedBoard = nextState.board
        ? { ...nextState.board, updatedAt: now }
        : { id: "board-1", title: "Meu Kanban", updatedAt: now }

      const fullState = {
        board: updatedBoard,
        columns: nextState.columns || [],
        cards: nextState.cards || []
      }

      setBoard(fullState.board)
      setColumns(fullState.columns)
      setCards(fullState.cards)

      if (nextState.labels) {
        setBoardLabels(nextState.labels)
        await setMetadata("boardLabels", nextState.labels)
      }

      setStatus("saving")
      setStatusMessage("Salvando...")

      try {
        await saveKanbanState(fullState)
        // Ensure user visibly perceives the spinning indicator and "Salvando..." text
        await new Promise((resolve) => setTimeout(resolve, 500))
        setStatus("saved")
        updateTimestampStatus("Atualizado às")
        debouncedDriveSync()
      } catch (error) {
        console.error("Falha ao salvar no IndexedDB:", error)
        setStatus("error")
        setStatusMessage("Erro ao salvar dados localmente")
      }
    },
    [debouncedDriveSync, updateTimestampStatus]
  )

  /**
   * Loads initial board data, labels, theme, layout settings, and configuration from Dexie
   */
  const loadInitialData = useCallback(async () => {
    try {
      const savedState = await loadKanbanState()
      const savedDriveFileId = await getMetadata("driveFileId")
      const savedClientId = await getMetadata("googleClientId")
      const savedToken = await getMetadata("accessToken")
      const savedLabels = await getMetadata("boardLabels")
      const savedTheme = await getMetadata("boardTheme")
      const savedFont = await getMetadata("boardFont")
      const savedWidth = await getMetadata("columnWidth")
      const savedDensity = await getMetadata("cardDensity")

      if (savedDriveFileId) {
        setDriveFileId(savedDriveFileId)
      }
      if (savedClientId) {
        setGoogleClientId(savedClientId)
      }
      if (savedToken) {
        setAccessToken(savedToken)
      }
      if (savedTheme) {
        setBoardTheme(savedTheme)
      }
      if (savedFont) {
        setBoardFont(savedFont)
      }
      if (savedWidth) {
        setColumnWidth(Number(savedWidth))
      }
      if (savedDensity) {
        setCardDensity(savedDensity)
      }

      if (savedLabels && Array.isArray(savedLabels)) {
        setBoardLabels(savedLabels)
      }

      if (savedState && savedState.board) {
        setBoard(savedState.board)
        setColumns(savedState.columns || [])
        setCards(savedState.cards || [])

        // If no boardLabels stored yet, extract unique labels from cards
        if (!savedLabels || savedLabels.length === 0) {
          const extractedMap = {}
          savedState.cards.forEach((card) => {
            ;(card.labels || []).forEach((l) => {
              const key = l.id || l.name
              if (key && !extractedMap[key]) {
                extractedMap[key] = {
                  id: l.id || "lbl-" + Math.random().toString(36).substr(2, 6),
                  name: l.name || "",
                  color: l.color || "black_dark"
                }
              }
            })
          })
          const extracted = Object.values(extractedMap)
          if (extracted.length > 0) {
            setBoardLabels(extracted)
            await setMetadata("boardLabels", extracted)
          }
        }

        setStatus("saved")
        updateTimestampStatus("Carregado às")
      } else {
        // Initial empty state: try to automatically load bundled default trello backup if available
        let autoLoaded = false
        try {
          const res = await fetch("/default-trello-backup.json")
          if (res.ok) {
            const rawJson = await res.json()
            const parsed = parseTrelloExport(rawJson)
            await commitState(parsed)
            setStatus("saved")
            updateTimestampStatus("Backup padrão carregado às")
            autoLoaded = true
          }
        } catch {
          // Fallback if fetch is unavailable
        }

        if (!autoLoaded) {
          const initialBoard = {
            id: "default-board",
            title: "Ao Infinito e Além!",
            updatedAt: new Date().toISOString()
          }
          setBoard(initialBoard)
          setColumns([])
          setCards([])
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do Dexie:", error)
      setStatus("error")
      setStatusMessage("Erro ao carregar do banco de dados local")
    } finally {
      setIsLoaded(true)
    }
  }, [commitState, updateTimestampStatus])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  /**
   * Imports a raw Trello JSON object into the Kanban
   * @param {Object} rawTrelloData - Parsed JSON object from Trello
   */
  const importTrello = useCallback(
    async (rawTrelloData) => {
      try {
        setStatus("saving")
        setStatusMessage("Importando dados do Trello...")
        const parsed = parseTrelloExport(rawTrelloData)
        await commitState(parsed)
      } catch (error) {
        console.error("Erro ao importar do Trello:", error)
        setStatus("error")
        setStatusMessage("Falha ao importar JSON do Trello")
        throw error
      }
    },
    [commitState]
  )

  /**
   * Imports a previously exported local backup
   * @param {Object} backupData - Parsed JSON backup
   */
  const importBackup = useCallback(
    async (backupData) => {
      try {
        if (!backupData || !backupData.columns || !backupData.cards) {
          throw new Error("Formato de backup inválido")
        }
        setStatus("saving")
        setStatusMessage("Restaurando backup...")

        // Restore settings if present
        if (backupData.settings) {
          if (backupData.settings.theme) {
            setBoardTheme(backupData.settings.theme)
            await setMetadata("boardTheme", backupData.settings.theme)
          }
          if (backupData.settings.font) {
            setBoardFont(backupData.settings.font)
            await setMetadata("boardFont", backupData.settings.font)
          }
          if (backupData.settings.columnWidth) {
            setColumnWidth(Number(backupData.settings.columnWidth))
            await setMetadata("columnWidth", Number(backupData.settings.columnWidth))
          }
          if (backupData.settings.cardDensity) {
            setCardDensity(backupData.settings.cardDensity)
            await setMetadata("cardDensity", backupData.settings.cardDensity)
          }
        } else if (backupData.theme) {
          setBoardTheme(backupData.theme)
          await setMetadata("boardTheme", backupData.theme)
        }

        await commitState(backupData)
      } catch (error) {
        console.error("Erro ao restaurar backup:", error)
        setStatus("error")
        setStatusMessage("Falha ao restaurar backup")
        throw error
      }
    },
    [commitState]
  )

  /**
   * Exports the current board state and all environment settings as a local JSON file download
   */
  const exportLocalBackup = useCallback(() => {
    if (!board) {
      return
    }
    downloadLocalBackup({
      board,
      columns,
      cards,
      labels: boardLabels,
      settings: {
        theme: boardTheme,
        font: boardFont,
        columnWidth,
        cardDensity
      }
    })
  }, [board, columns, cards, boardLabels, boardTheme, boardFont, columnWidth, cardDensity])

  /**
   * Updates workspace font family and persists to metadata
   * @param {string} fontId - Font identifier
   */
  const updateBoardFont = useCallback(
    async (fontId) => {
      setBoardFont(fontId)
      await setMetadata("boardFont", fontId)
      debouncedDriveSync()
    },
    [debouncedDriveSync]
  )

  /**
   * Updates workspace theme and persists to metadata
   * @param {string} themeId - Theme ID
   */
  const updateBoardTheme = useCallback(
    async (themeId) => {
      setBoardTheme(themeId)
      await setMetadata("boardTheme", themeId)
      debouncedDriveSync()
    },
    [debouncedDriveSync]
  )

  /**
   * Updates column width in pixels and persists to metadata
   * @param {number} width - Column width in pixels
   */
  const updateColumnWidth = useCallback(
    async (width) => {
      const sanitizedWidth = Math.max(180, Math.min(420, Number(width)))
      setColumnWidth(sanitizedWidth)
      await setMetadata("columnWidth", sanitizedWidth)
      debouncedDriveSync()
    },
    [debouncedDriveSync]
  )

  /**
   * Updates card height density and persists to metadata
   * @param {string} density - "compact" | "normal" | "comfortable"
   */
  const updateCardDensity = useCallback(
    async (density) => {
      setCardDensity(density)
      await setMetadata("cardDensity", density)
      debouncedDriveSync()
    },
    [debouncedDriveSync]
  )

  /**
   * Adds a new label to the board label collection
   * @param {Object} labelData - New label object { name, color }
   */
  const addBoardLabel = useCallback(
    async (labelData) => {
      const newLabel = {
        id: "lbl-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        name: labelData.name || "",
        color: labelData.color || "green_dark"
      }
      const updated = [...boardLabels, newLabel]
      setBoardLabels(updated)
      await setMetadata("boardLabels", updated)
      debouncedDriveSync()
    },
    [boardLabels, debouncedDriveSync]
  )

  /**
   * Updates an existing board label and propagates changes to all matching cards
   * @param {string} labelId - Label ID to update
   * @param {Object} updates - Fields to update { name, color }
   */
  const updateBoardLabel = useCallback(
    async (labelId, updates) => {
      const updatedLabels = boardLabels.map((l) =>
        l.id === labelId ? { ...l, ...updates } : l
      )
      setBoardLabels(updatedLabels)
      await setMetadata("boardLabels", updatedLabels)

      // Propagate update to all cards that carry this label
      const updatedCards = cards.map((card) => {
        const hasLabel = (card.labels || []).some(
          (l) => l.id === labelId || l.name === updates.oldName
        )
        if (!hasLabel) {
          return card
        }
        return {
          ...card,
          labels: (card.labels || []).map((l) =>
            l.id === labelId || l.name === updates.oldName
              ? { ...l, ...updates }
              : l
          )
        }
      })

      commitState({
        board,
        columns,
        cards: updatedCards,
        labels: updatedLabels
      })
    },
    [boardLabels, cards, board, columns, commitState]
  )

  /**
   * Deletes a board label and removes it from all cards
   * @param {string} labelId - Label ID to delete
   */
  const deleteBoardLabel = useCallback(
    async (labelId) => {
      const targetLabel = boardLabels.find((l) => l.id === labelId)
      const updatedLabels = boardLabels.filter((l) => l.id !== labelId)
      setBoardLabels(updatedLabels)
      await setMetadata("boardLabels", updatedLabels)

      // Remove from all cards
      const updatedCards = cards.map((card) => ({
        ...card,
        labels: (card.labels || []).filter(
          (l) => l.id !== labelId && l.name !== targetLabel?.name
        )
      }))

      commitState({
        board,
        columns,
        cards: updatedCards,
        labels: updatedLabels
      })
    },
    [boardLabels, cards, board, columns, commitState]
  )

  /**
   * Handles drag and drop reordering of cards and columns
   * @param {Object} result - Result payload from @hello-pangea/dnd
   */
  const handleDragEnd = useCallback(
    (result) => {
      const { destination, source, type } = result

      if (!destination) {
        return
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      // Reordering columns
      if (type === "COLUMN") {
        const reorderedColumns = Array.from(columns)
        const [movedColumn] = reorderedColumns.splice(source.index, 1)
        reorderedColumns.splice(destination.index, 0, movedColumn)

        const updatedColumns = reorderedColumns.map((col, idx) => ({
          ...col,
          order: idx
        }))

        commitState({
          board,
          columns: updatedColumns,
          cards
        })
        return
      }

      // Reordering cards
      const sourceColId = source.droppableId
      const destColId = destination.droppableId

      // Same column reorder
      if (sourceColId === destColId) {
        const columnCards = cards
          .filter((c) => c.columnId === sourceColId)
          .sort((a, b) => a.order - b.order)

        const [movedCard] = columnCards.splice(source.index, 1)
        columnCards.splice(destination.index, 0, movedCard)

        const updatedColumnCards = columnCards.map((card, idx) => ({
          ...card,
          order: idx
        }))

        const otherCards = cards.filter((c) => c.columnId !== sourceColId)
        const updatedAllCards = [...otherCards, ...updatedColumnCards]

        commitState({
          board,
          columns,
          cards: updatedAllCards
        })
        return
      }

      // Moving to a different column
      const sourceCards = cards
        .filter((c) => c.columnId === sourceColId)
        .sort((a, b) => a.order - b.order)

      const destCards = cards
        .filter((c) => c.columnId === destColId)
        .sort((a, b) => a.order - b.order)

      const [movedCard] = sourceCards.splice(source.index, 1)
      const updatedMovedCard = {
        ...movedCard,
        columnId: destColId
      }

      destCards.splice(destination.index, 0, updatedMovedCard)

      const updatedSourceCards = sourceCards.map((card, idx) => ({
        ...card,
        order: idx
      }))

      const updatedDestCards = destCards.map((card, idx) => ({
        ...card,
        order: idx
      }))

      const otherCards = cards.filter(
        (c) => c.columnId !== sourceColId && c.columnId !== destColId
      )

      const updatedAllCards = [
        ...otherCards,
        ...updatedSourceCards,
        ...updatedDestCards
      ]

      commitState({
        board,
        columns,
        cards: updatedAllCards
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Adds a new card to a specific column at either top or bottom
   * @param {string} columnId - ID of the target column
   * @param {Object} cardData - Initial card properties
   * @param {"top"|"bottom"} [position="top"] - Insertion position (defaults to "top")
   */
  const addCard = useCallback(
    (columnId, cardData, position = "top") => {
      const colCards = cards
        .filter((c) => c.columnId === columnId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      const otherCards = cards.filter((c) => c.columnId !== columnId)
      const newCardId = "card-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5)

      let updatedColCards
      if (position === "top") {
        const newCard = {
          id: newCardId,
          columnId,
          title: cardData.title || "Novo Card",
          desc: cardData.desc || "",
          order: 0,
          labels: cardData.labels || [],
          due: cardData.due || null,
          dueComplete: false,
          cover: cardData.cover || null,
          checklists: cardData.checklists || [],
          linkSizes: cardData.linkSizes || {}
        }
        const shiftedColCards = colCards.map((c, idx) => ({
          ...c,
          order: idx + 1
        }))
        updatedColCards = [newCard, ...shiftedColCards]
      } else {
        const newCard = {
          id: newCardId,
          columnId,
          title: cardData.title || "Novo Card",
          desc: cardData.desc || "",
          order: colCards.length,
          labels: cardData.labels || [],
          due: cardData.due || null,
          dueComplete: false,
          cover: cardData.cover || null,
          checklists: cardData.checklists || [],
          linkSizes: cardData.linkSizes || {}
        }
        updatedColCards = [...colCards, newCard]
      }

      commitState({
        board,
        columns,
        cards: [...otherCards, ...updatedColCards]
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Updates an existing card
   * @param {string} cardId - ID of the card to update
   * @param {Object} updates - Fields to update
   */
  const updateCard = useCallback(
    (cardId, updates) => {
      const updatedCards = cards.map((c) =>
        c.id === cardId ? { ...c, ...updates } : c
      )
      commitState({
        board,
        columns,
        cards: updatedCards
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Deletes a card from the board
   * @param {string} cardId - ID of the card to delete
   */
  const deleteCard = useCallback(
    (cardId) => {
      const targetCard = cards.find((c) => c.id === cardId)
      if (!targetCard) {
        return
      }

      const filteredCards = cards.filter((c) => c.id !== cardId)
      const updatedCards = filteredCards.map((c) => {
        if (c.columnId === targetCard.columnId && c.order > targetCard.order) {
          return { ...c, order: c.order - 1 }
        }
        return c
      })

      commitState({
        board,
        columns,
        cards: updatedCards
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Adds a new column to the board
   * @param {string} title - Column title
   */
  const addColumn = useCallback(
    (title) => {
      const newColumn = {
        id: "col-" + Date.now(),
        boardId: board ? board.id : "default-board",
        title: title || "Nova Coluna",
        order: columns.length
      }

      commitState({
        board,
        columns: [...columns, newColumn],
        cards
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Updates a column's properties (e.g. title)
   * @param {string} columnId - Column ID
   * @param {Object} updates - Updated properties
   */
  const updateColumn = useCallback(
    (columnId, updates) => {
      const updatedColumns = columns.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      )
      commitState({
        board,
        columns: updatedColumns,
        cards
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Deletes a column and all cards inside it
   * @param {string} columnId - Column ID to delete
   */
  const deleteColumn = useCallback(
    (columnId) => {
      const updatedColumns = columns
        .filter((col) => col.id !== columnId)
        .map((col, idx) => ({ ...col, order: idx }))

      const remainingCards = cards.filter((card) => card.columnId !== columnId)

      commitState({
        board,
        columns: updatedColumns,
        cards: remainingCards
      })
    },
    [board, columns, cards, commitState]
  )

  /**
   * Configures Google OAuth Client ID and saves to metadata
   * @param {string} clientId - The Google OAuth client ID
   */
  const saveGoogleClientId = useCallback(async (clientId) => {
    setGoogleClientId(clientId)
    await setMetadata("googleClientId", clientId)
  }, [])

  /**
   * Triggers Google Sign-In and saves the access token
   * @param {string} [overrideClientId] - Optional Client ID to use
   */
  const connectGoogleDrive = useCallback(
    (overrideClientId) => {
      const activeClientId = overrideClientId || googleClientId
      if (!activeClientId) {
        alert("Por favor, informe seu Google Client ID nas configurações.")
        return
      }

      const client = createGoogleTokenClient({
        clientId: activeClientId,
        callback: async (response) => {
          if (response.error) {
            console.error("Erro na autenticação do Google:", response)
            setStatus("error")
            setStatusMessage("Erro de autenticação Google")
            return
          }

          if (response.access_token) {
            setAccessToken(response.access_token)
            await setMetadata("accessToken", response.access_token)
            setStatus("synced")
            setStatusMessage("Conectado ao Google Drive com sucesso!")

            try {
              setStatus("syncing")
              const fileId = await syncToGoogleDrive(
                response.access_token,
                driveFileId,
                {
                  board,
                  columns,
                  cards,
                  labels: boardLabels,
                  settings: {
                    theme: boardTheme,
                    columnWidth,
                    cardDensity
                  }
                }
              )
              if (fileId) {
                setDriveFileId(fileId)
                await setMetadata("driveFileId", fileId)
              }
              setStatus("synced")
              updateTimestampStatus("Sincronizado no Drive às")
            } catch (err) {
              console.error("Falha no primeiro sync:", err)
              setStatus("error")
              setStatusMessage("Falha ao sincronizar com Drive")
            }
          }
        }
      })

      if (client) {
        client.requestAccessToken({ prompt: "consent" })
      } else {
        alert("Biblioteca Google Identity Services não carregou. Verifique sua conexão.")
      }
    },
    [
      googleClientId,
      driveFileId,
      board,
      columns,
      cards,
      boardLabels,
      boardTheme,
      columnWidth,
      cardDensity,
      updateTimestampStatus
    ]
  )

  /**
   * Manually triggers immediate Google Drive sync
   */
  const syncDriveNow = useCallback(async () => {
    if (!accessToken) {
      connectGoogleDrive()
      return
    }

    try {
      setStatus("syncing")
      setStatusMessage("Sincronizando com Google Drive...")
      const newFileId = await syncToGoogleDrive(accessToken, driveFileId, {
        board,
        columns,
        cards,
        labels: boardLabels,
        settings: {
          theme: boardTheme,
          columnWidth,
          cardDensity
        }
      })
      if (newFileId && newFileId !== driveFileId) {
        setDriveFileId(newFileId)
        await setMetadata("driveFileId", newFileId)
      }
      setStatus("synced")
      updateTimestampStatus("Sincronizado no Drive às")
    } catch (error) {
      console.error("Erro na sincronização manual com o Drive:", error)
      setStatus("error")
      setStatusMessage("Erro ao sincronizar com Google Drive")
    }
  }, [
    accessToken,
    driveFileId,
    board,
    columns,
    cards,
    boardLabels,
    boardTheme,
    columnWidth,
    cardDensity,
    connectGoogleDrive,
    updateTimestampStatus
  ])

  /**
   * Resets local database
   */
  const resetBoard = useCallback(async () => {
    await clearKanbanDb()
    setBoard({
      id: "board-" + Date.now(),
      title: "Meu Kanban",
      updatedAt: new Date().toISOString()
    })
    setColumns([])
    setCards([])
    setBoardLabels([])
    setColumnWidth(220)
    setCardDensity("compact")
    setStatus("idle")
    setStatusMessage("Quadro reiniciado")
  }, [])

  return {
    board,
    columns,
    cards,
    boardLabels,
    boardTheme,
    boardFont,
    columnWidth,
    cardDensity,
    isLoaded,
    status,
    statusMessage,
    accessToken,
    driveFileId,
    googleClientId,
    saveGoogleClientId,
    updateBoardTheme,
    updateBoardFont,
    updateColumnWidth,
    updateCardDensity,
    addBoardLabel,
    updateBoardLabel,
    deleteBoardLabel,
    importTrello,
    importBackup,
    exportLocalBackup,
    handleDragEnd,
    addCard,
    updateCard,
    deleteCard,
    addColumn,
    updateColumn,
    deleteColumn,
    connectGoogleDrive,
    syncDriveNow,
    resetBoard
  }
}
