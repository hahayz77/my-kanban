import React from "react"
import toast from "react-hot-toast"
import { Trash2 } from "lucide-react"

/**
 * Prompts the user with an interactive confirmation toast in dark mode before executing a deletion
 * @param {Object} options - Configuration options
 * @param {string} options.message - The confirmation message prompt
 * @param {string} [options.title="Confirmar exclusão"] - Title for the confirmation prompt
 * @param {Function} options.onConfirm - Callback to execute if the user confirms deletion
 * @param {string} [options.successMessage="Item excluído com sucesso!"] - Success toast message shown after confirmation
 * @param {number} [options.duration=8000] - Duration in milliseconds before toast auto-dismisses
 * @returns {string} Toast ID
 */
export const confirmDeleteToast = ({
  message = "Deseja realmente excluir este item?",
  title = "Confirmar exclusão",
  onConfirm,
  successMessage = "Item excluído com sucesso!",
  duration = 8000
}) => {
  return toast(
    (t) => (
      <div className="flex flex-col gap-2.5 py-0.5 min-w-[240px] max-w-xs select-none">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold text-slate-100 leading-tight">
              {title}
            </h5>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id)
              try {
                onConfirm?.()
                if (successMessage) {
                  toast.success(successMessage)
                }
              } catch (error) {
                toast.error("Erro ao excluir item")
              }
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    ),
    {
      duration,
      position: "top-right",
      style: {
        background: "#0f172a",
        border: "1px solid #334155",
        color: "#f8fafc",
        padding: "12px 14px",
        borderRadius: "14px",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)"
      }
    }
  )
}

/**
 * Standard global toast notification helper
 */
export const notifySuccess = (message) => toast.success(message)
export const notifyError = (message) => toast.error(message)
