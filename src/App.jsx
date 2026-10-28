import React, { useState, useMemo } from "react"
import { useKanban } from "./hooks/useKanban"
import { Navbar } from "./components/Navbar"
import { Board } from "./components/Board"
import { CardModal } from "./components/CardModal"
import { SettingsModal } from "./components/SettingsModal"
import { ImportModal } from "./components/ImportModal"
import { DriveConfigModal } from "./components/DriveConfigModal"
import { AddModal } from "./components/AddModal"
import { BackupConfirmModal } from "./components/BackupConfirmModal"
import { BOARD_ENVIRONMENT_THEMES } from "./utils/trelloColors"
import { Toaster } from "react-hot-toast"

/**
 * Main application component coordinating Kanban board, modals, and persistence
 * @returns {JSX.Element} The rendered React App
 */
export const App = () => {
  const {
    board,
    columns,
    cards,
    boardLabels,
    boardTheme,
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
    syncDriveNow
  } = useKanban()

  const [selectedCardId, setSelectedCardId] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return cards
    }
    const query = searchQuery.toLowerCase().trim()
    return cards.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(query)) ||
        (c.desc && c.desc.toLowerCase().includes(query)) ||
        (c.labels &&
          c.labels.some((l) => l.name && l.name.toLowerCase().includes(query)))
    )
  }, [cards, searchQuery])

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) || null,
    [cards, selectedCardId]
  )

  // Current active environment theme style
  const currentThemeObj = useMemo(() => {
    return (
      BOARD_ENVIRONMENT_THEMES.find((t) => t.id === boardTheme) ||
      BOARD_ENVIRONMENT_THEMES[0]
    )
  }, [boardTheme])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando quadro Kanban...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden text-slate-100 transition-colors duration-500 ${currentThemeObj.background}`}
    >
      {/* Top Navbar */}
      <Navbar
        board={board}
        status={status}
        statusMessage={statusMessage}
        hasGoogleAuth={Boolean(accessToken)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdd={() => setIsAddModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenBackupConfirm={() => setIsBackupModalOpen(true)}
        onOpenDrive={() => setIsDriveModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Board Area */}
      <main className="flex-1 flex overflow-hidden">
        <Board
          board={board}
          columns={columns}
          cards={filteredCards}
          columnWidth={columnWidth}
          cardDensity={cardDensity}
          onDragEnd={handleDragEnd}
          onAddCard={addCard}
          onUpdateColumn={updateColumn}
          onDeleteColumn={deleteColumn}
          onAddColumn={addColumn}
          onOpenCard={(card) => setSelectedCardId(card.id)}
          onDeleteCard={deleteCard}
          onOpenImport={() => setIsImportModalOpen(true)}
        />
      </main>

      {/* Add Card, Column or Label Modal */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        columns={columns}
        onAddCard={addCard}
        onAddColumn={addColumn}
        onAddLabel={addBoardLabel}
      />

      {/* Backup Confirmation Modal */}
      <BackupConfirmModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onConfirm={exportLocalBackup}
        boardTitle={board?.title || "Meu Kanban"}
        columnsCount={columns.length}
        cardsCount={cards.length}
      />

      {/* Dedicated Google Drive Sync Modal */}
      <DriveConfigModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        googleClientId={googleClientId}
        onSaveClientId={saveGoogleClientId}
        accessToken={accessToken}
        driveFileId={driveFileId}
        onConnectDrive={(clientId) => connectGoogleDrive(clientId)}
        onSyncNow={syncDriveNow}
      />

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          key={selectedCard.id}
          card={selectedCard}
          columns={columns}
          boardLabels={boardLabels}
          onClose={() => setSelectedCardId(null)}
          onSave={updateCard}
          onDelete={(cardId) => {
            deleteCard(cardId)
            setSelectedCardId(null)
          }}
          onAddBoardLabel={addBoardLabel}
        />
      )}

      {/* Settings Modal (Tags, Environment Colors, Column Width, Card Density) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        boardLabels={boardLabels}
        cards={cards}
        onAddLabel={addBoardLabel}
        onUpdateLabel={updateBoardLabel}
        onDeleteLabel={deleteBoardLabel}
        boardTheme={boardTheme}
        onSelectTheme={updateBoardTheme}
        columnWidth={columnWidth}
        onUpdateColumnWidth={updateColumnWidth}
        cardDensity={cardDensity}
        onUpdateCardDensity={updateCardDensity}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportTrello={importTrello}
        onImportBackup={importBackup}
      />

      {/* Global Dark Mode Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #334155",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            padding: "10px 14px"
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#0f172a"
            }
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#0f172a"
            }
          }
        }}
      />
    </div>
  )
}

export default App
