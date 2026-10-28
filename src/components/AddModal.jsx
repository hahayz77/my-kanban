import React, { useState, useEffect, useRef } from "react"
import {
  X,
  Plus,
  Layers,
  CreditCard,
  Tag,
  ArrowUp,
  ArrowDown,
  Check
} from "lucide-react"
import {
  TRELLO_COLOR_PALETTE,
  getTrelloColor
} from "../utils/trelloColors"
import { TrelloPatternIcon } from "./TrelloPatternIcon"

/**
 * AddModal lets users add new cards (specifying column and position, defaulting to top),
 * append a new column to the end of the board, or create a new board label/tag
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close modal callback
 * @param {Array<Object>} props.columns - Board columns
 * @param {Function} props.onAddCard - Add card callback (columnId, cardData, position)
 * @param {Function} props.onAddColumn - Add column callback (title)
 * @param {Function} props.onAddLabel - Add label callback ({ name, color })
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const AddModal = ({
  isOpen,
  onClose,
  columns = [],
  onAddCard,
  onAddColumn,
  onAddLabel
}) => {
  if (!isOpen) {
    return null
  }

  const [activeTab, setActiveTab] = useState("card") // "card" | "column" | "label"
  const [cardTitle, setCardTitle] = useState("")
  const [selectedColumnId, setSelectedColumnId] = useState(
    columns[0]?.id || ""
  )
  const [cardPosition, setCardPosition] = useState("top") // "top" by default
  const [columnTitle, setColumnTitle] = useState("")

  // Label form state
  const [labelName, setLabelName] = useState("")
  const [labelColor, setLabelColor] = useState("green_dark")

  const cardInputRef = useRef(null)
  const columnInputRef = useRef(null)
  const labelInputRef = useRef(null)

  // Auto focus input when modal opens or tab changes
  useEffect(() => {
    if (activeTab === "card") {
      cardInputRef.current?.focus()
    } else if (activeTab === "column") {
      columnInputRef.current?.focus()
    } else if (activeTab === "label") {
      labelInputRef.current?.focus()
    }
  }, [activeTab])

  // Ensure selectedColumnId defaults to an existing column
  useEffect(() => {
    if (!selectedColumnId && columns.length > 0) {
      setSelectedColumnId(columns[0].id)
    }
  }, [columns, selectedColumnId])

  /**
   * Handles creating a new card
   * @param {React.FormEvent} e - Form event
   */
  const handleCreateCard = (e) => {
    e.preventDefault()
    if (!cardTitle.trim() || !selectedColumnId) {
      return
    }

    onAddCard(
      selectedColumnId,
      {
        title: cardTitle.trim()
      },
      cardPosition
    )

    setCardTitle("")
    onClose()
  }

  /**
   * Handles creating a new column
   * @param {React.FormEvent} e - Form event
   */
  const handleCreateColumn = (e) => {
    e.preventDefault()
    if (!columnTitle.trim()) {
      return
    }

    onAddColumn(columnTitle.trim())
    setColumnTitle("")
    onClose()
  }

  /**
   * Handles creating a new label
   * @param {React.FormEvent} e - Form event
   */
  const handleCreateLabel = (e) => {
    e.preventDefault()
    const trimmed = labelName.trim()
    if (!trimmed && !labelColor) {
      return
    }

    if (onAddLabel) {
      onAddLabel({
        name: trimmed,
        color: labelColor
      })
    }

    setLabelName("")
    onClose()
  }

  const previewColorObj = getTrelloColor(labelColor)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Adicionar ao Quadro
              </h3>
              <p className="text-[11px] text-slate-400">
                Crie um novo cartão, coluna ou etiqueta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tab Selection: Card, Column, Label */}
        <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "card"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Novo Cartão</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("column")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "column"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Nova Coluna</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("label")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "label"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Nova Etiqueta</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: NEW CARD */}
          {activeTab === "card" && (
            <form onSubmit={handleCreateCard} className="space-y-4">
              {/* Card Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Título do Cartão <span className="text-rose-400">*</span>
                </label>
                <input
                  ref={cardInputRef}
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="Ex: Atualizar documentação do projeto..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Column Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Coluna de Destino <span className="text-rose-400">*</span>
                </label>
                {columns.length > 0 ? (
                  <select
                    value={selectedColumnId}
                    onChange={(e) => setSelectedColumnId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400">
                    Crie uma coluna primeiro antes de adicionar cartões.
                  </p>
                )}
              </div>

              {/* Card Position (Top by default vs Bottom) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Posição na Coluna
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option: Top (Default) */}
                  <button
                    type="button"
                    onClick={() => setCardPosition("top")}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      cardPosition === "top"
                        ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30 text-white"
                        : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        cardPosition === "top"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold leading-tight">
                        Topo
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Início (Padrão)
                      </span>
                    </div>
                  </button>

                  {/* Option: Bottom */}
                  <button
                    type="button"
                    onClick={() => setCardPosition("bottom")}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      cardPosition === "bottom"
                        ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30 text-white"
                        : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        cardPosition === "bottom"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold leading-tight">
                        Fim
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Final da coluna
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!cardTitle.trim() || !selectedColumnId}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Cartão
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: NEW COLUMN */}
          {activeTab === "column" && (
            <form onSubmit={handleCreateColumn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Nome da Nova Coluna <span className="text-rose-400">*</span>
                </label>
                <input
                  ref={columnInputRef}
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  placeholder="Ex: Em Progresso, Validação, etc."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Information Notice */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  A nova coluna será adicionada como a{" "}
                  <strong className="text-white">última coluna</strong> do quadro.
                  Você pode arrastar e reordenar as colunas a qualquer momento.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!columnTitle.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar Coluna
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: NEW LABEL / TAG */}
          {activeTab === "label" && (
            <form onSubmit={handleCreateLabel} className="space-y-4">
              {/* Label Name & Live Preview */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Nome da Etiqueta <span className="text-rose-400">*</span>
                  </label>
                  <input
                    ref={labelInputRef}
                    type="text"
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    placeholder="Ex: Urgente, Frontend, Design, Bug..."
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Pré-visualização:
                  </label>
                  <div
                    style={{
                      backgroundColor: previewColorObj.bg,
                      color: previewColorObj.text
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm w-fit"
                  >
                    <TrelloPatternIcon
                      color={labelColor}
                      className="w-3.5 h-3.5 opacity-80 flex-shrink-0"
                    />
                    <span className="truncate">
                      {labelName.trim() || "Título da Etiqueta"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 20-Color Trello Palette with Pattern Icons */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Cor e Padrão da Etiqueta (10 famílias, 2 tons acessíveis):
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {TRELLO_COLOR_PALETTE.map((c) => {
                    const isSelected = labelColor === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setLabelColor(c.id)}
                        style={{ backgroundColor: c.bg }}
                        title={`${c.label} (${c.family})`}
                        className={`h-8 rounded-lg relative flex items-center justify-between px-1.5 transition-transform hover:scale-105 shadow-sm border ${
                          isSelected
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 border-white"
                            : "border-transparent opacity-90 hover:opacity-100"
                        }`}
                      >
                        <TrelloPatternIcon
                          color={c.id}
                          className="w-3 h-3 text-white/80"
                        />
                        {isSelected && (
                          <Check className="w-3 h-3 text-white ml-auto" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!labelName.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Etiqueta
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
