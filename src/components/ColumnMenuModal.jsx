import React, { useState, useEffect, useRef } from "react"
import { X, MoreVertical, Edit2, Trash2, Check, Layers } from "lucide-react"
import { confirmDeleteToast, notifySuccess } from "../utils/toastUtils"

/**
 * ColumnMenuModal provides options to rename or delete a Kanban column
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.column - Column object being managed
 * @param {number} props.cardsCount - Number of cards currently in this column
 * @param {Function} props.onUpdateColumn - Callback to update column properties
 * @param {Function} props.onDeleteColumn - Callback to delete this column
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const ColumnMenuModal = ({
  isOpen,
  onClose,
  column,
  cardsCount = 0,
  onUpdateColumn,
  onDeleteColumn
}) => {
  if (!isOpen || !column) {
    return null
  }

  const [titleInput, setTitleInput] = useState(column.title || "")
  const inputRef = useRef(null)

  useEffect(() => {
    setTitleInput(column.title || "")
  }, [column])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  /**
   * Handles saving the updated column title
   * @param {React.FormEvent} [e] - Form submit event
   */
  const handleSaveTitle = (e) => {
    if (e) {
      e.preventDefault()
    }
    const trimmed = titleInput.trim()
    if (!trimmed) {
      return
    }

    if (trimmed !== column.title) {
      onUpdateColumn(column.id, { title: trimmed })
      notifySuccess("Lista renomeada com sucesso!")
    }
    onClose()
  }

  /**
   * Handles deleting the column with interactive confirmation toast
   */
  const handleDelete = () => {
    onClose()
    confirmDeleteToast({
      message: `Excluir a lista "${column.title}" e todos os ${cardsCount} cartões nela?`,
      title: "Excluir Coluna",
      onConfirm: () => onDeleteColumn(column.id),
      successMessage: "Coluna excluída com sucesso!"
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Ações da Lista
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {column.title} • {cardsCount} {cardsCount === 1 ? "cartão" : "cartões"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Rename Section */}
          <form onSubmit={handleSaveTitle} className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Renomear lista</span>
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Título da lista..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!titleInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white shadow transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-3">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-400">
                Ações irreversíveis
              </p>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors group text-left"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Excluir esta lista</span>
                </div>
                <span className="text-[10px] text-rose-400/80">
                  {cardsCount} {cardsCount === 1 ? "cartão" : "cartões"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
