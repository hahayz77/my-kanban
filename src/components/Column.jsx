import React, { useState } from "react"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { Plus, Trash2, Edit2, X, Check } from "lucide-react"
import { CardItem } from "./CardItem"

/**
 * Column component representing a Kanban column with configurable width and card density
 * @param {Object} props - Component properties
 * @param {Object} props.column - Column data
 * @param {number} props.index - Column index for draggable ordering
 * @param {Array<Object>} props.cards - List of cards belonging to this column
 * @param {number} [props.columnWidth=272] - Column width in pixels
 * @param {string} [props.cardDensity="normal"] - Card height density preset
 * @param {Function} props.onAddCard - Callback to add a new card to this column
 * @param {Function} props.onUpdateColumn - Callback to update column properties
 * @param {Function} props.onDeleteColumn - Callback to delete this column
 * @param {Function} props.onOpenCard - Callback to open card details modal
 * @param {Function} props.onDeleteCard - Callback to delete a card
 * @returns {JSX.Element} Rendered column component
 */
export const Column = ({
  column,
  index,
  cards,
  columnWidth = 272,
  cardDensity = "normal",
  onAddCard,
  onUpdateColumn,
  onDeleteColumn,
  onOpenCard,
  onDeleteCard
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [columnTitle, setColumnTitle] = useState(column.title)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")

  /**
   * Handles saving updated column title
   */
  const handleSaveTitle = () => {
    const trimmed = columnTitle.trim()
    if (trimmed && trimmed !== column.title) {
      onUpdateColumn(column.id, { title: trimmed })
    } else {
      setColumnTitle(column.title)
    }
    setIsEditingTitle(false)
  }

  /**
   * Handles keydown on title input (Enter saves, Esc cancels)
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveTitle()
    } else if (e.key === "Escape") {
      setColumnTitle(column.title)
      setIsEditingTitle(false)
    }
  }

  /**
   * Submits new quick card
   * @param {React.FormEvent} e - Form event
   */
  const handleCreateCard = (e) => {
    e.preventDefault()
    const trimmed = newCardTitle.trim()
    if (!trimmed) {
      return
    }

    onAddCard(column.id, { title: trimmed })
    setNewCardTitle("")
    setIsAddingCard(false)
  }

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            width: `${columnWidth}px`,
            minWidth: `${columnWidth}px`
          }}
          className={`flex flex-col max-h-full rounded-xl bg-slate-900/90 border transition-all ${
            snapshot.isDragging
              ? "border-indigo-500 shadow-2xl ring-2 ring-indigo-500/50 rotate-1 z-40"
              : "border-slate-800/90 shadow-md"
          }`}
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 cursor-grab active:cursor-grabbing"
          >
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1 mr-1">
                <input
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="w-full px-1.5 py-0.5 text-xs font-semibold rounded bg-slate-800 text-white border border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 flex-1 min-w-0 mr-1"
                onDoubleClick={() => setIsEditingTitle(true)}
              >
                <h3 className="text-xs font-semibold text-slate-200 truncate tracking-tight">
                  {column.title}
                </h3>
                <span className="px-1.5 py-0.2 text-[10px] font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                  {cards.length}
                </span>
              </div>
            )}

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setIsEditingTitle(!isEditingTitle)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Renomear lista"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `Excluir a lista "${column.title}" e todos os ${cards.length} cartões nela?`
                    )
                  ) {
                    onDeleteColumn(column.id)
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                title="Excluir lista"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cards Droppable Container */}
          <Droppable droppableId={column.id} type="CARD">
            {(dropProvided, dropSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className={`flex-1 p-2 overflow-y-auto min-h-[100px] transition-colors rounded-b-xl ${
                  dropSnapshot.isDraggingOver
                    ? "bg-slate-800/40 ring-1 ring-inset ring-indigo-500/20"
                    : ""
                }`}
              >
                {cards.map((card, cardIndex) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    cardDensity={cardDensity}
                    onOpen={onOpenCard}
                    onDelete={onDeleteCard}
                  />
                ))}
                {dropProvided.placeholder}

                {/* Inline Quick Add Card Form */}
                {isAddingCard ? (
                  <form
                    onSubmit={handleCreateCard}
                    className="mt-1.5 p-2 bg-slate-800 rounded-lg border border-slate-700 shadow-md"
                  >
                    <textarea
                      placeholder="Insira o título para este cartão..."
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleCreateCard(e)
                        } else if (e.key === "Escape") {
                          setIsAddingCard(false)
                        }
                      }}
                      autoFocus
                      rows={2}
                      className="w-full p-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCard(false)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(true)}
                    className="flex items-center gap-1.5 w-full mt-1 p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar cartão</span>
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  )
}
