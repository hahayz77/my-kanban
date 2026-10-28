import React from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Plus, FolderPlus, Upload } from "lucide-react"
import { Column } from "./Column"

/**
 * Board component displaying the horizontal list of columns and drag-and-drop context
 * @param {Object} props - Component properties
 * @param {Object} props.board - Board metadata
 * @param {Array<Object>} props.columns - Board columns
 * @param {Array<Object>} props.cards - Board cards
 * @param {number} [props.columnWidth=272] - Column width in pixels
 * @param {string} [props.cardDensity="normal"] - Card height density preset
 * @param {Function} props.onDragEnd - Drag & drop end handler
 * @param {Function} props.onAddCard - Add card handler
 * @param {Function} props.onUpdateColumn - Update column handler
 * @param {Function} props.onDeleteColumn - Delete column handler
 * @param {Function} props.onAddColumn - Add column handler
 * @param {Function} props.onOpenCard - Open card modal handler
 * @param {Function} props.onDeleteCard - Delete card handler
 * @param {Function} props.onOpenImport - Open import modal handler
 * @returns {JSX.Element} Rendered board container
 */
export const Board = ({
  board,
  columns,
  cards,
  columnWidth = 272,
  cardDensity = "normal",
  onDragEnd,
  onAddCard,
  onUpdateColumn,
  onDeleteColumn,
  onAddColumn,
  onOpenCard,
  onDeleteCard,
  onOpenImport
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 flex gap-3.5 px-4 py-4 overflow-x-auto overflow-y-hidden items-start select-none"
          >
            {columns.length === 0 ? (
              <div className="flex flex-col items-center justify-center m-auto p-8 max-w-md text-center rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-sm">
                <div className="w-14 h-14 mb-3.5 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <FolderPlus className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  Seu Kanban está pronto!
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Importe seu backup completo do Trello com todas as listas,
                  cartões, etiquetas com padrões e checklists ou comece uma coluna.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={onOpenImport}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar Backup do Trello</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const title = prompt("Digite o nome da primeira coluna:")
                      if (title && title.trim()) {
                        onAddColumn(title.trim())
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-all border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Coluna</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {columns.map((column, colIndex) => {
                  const columnCards = cards
                    .filter((card) => card.columnId === column.id)
                    .sort((a, b) => a.order - b.order)

                  return (
                    <Column
                      key={column.id}
                      column={column}
                      index={colIndex}
                      cards={columnCards}
                      columnWidth={columnWidth}
                      cardDensity={cardDensity}
                      onAddCard={onAddCard}
                      onUpdateColumn={onUpdateColumn}
                      onDeleteColumn={onDeleteColumn}
                      onOpenCard={onOpenCard}
                      onDeleteCard={onDeleteCard}
                    />
                  )
                })}
                {provided.placeholder}

                {/* Add New Column Quick Button with dynamic width */}
                <div
                  style={{
                    width: `${columnWidth}px`,
                    minWidth: `${columnWidth}px`
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const title = prompt("Nome da nova coluna:")
                      if (title && title.trim()) {
                        onAddColumn(title.trim())
                      }
                    }}
                    className="flex items-center gap-1.5 w-full p-2.5 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/60 text-slate-400 hover:text-indigo-300 font-medium text-xs transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar outra lista</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
