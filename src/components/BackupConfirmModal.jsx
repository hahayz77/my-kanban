import React from "react"
import { X, Download, ShieldCheck, Database, Layers, CreditCard } from "lucide-react"

/**
 * BackupConfirmModal prompts the user before downloading the complete JSON backup file
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onConfirm - Confirm download callback
 * @param {string} props.boardTitle - Board title
 * @param {number} props.columnsCount - Total columns
 * @param {number} props.cardsCount - Total cards
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const BackupConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  boardTitle = "Meu Kanban",
  columnsCount = 0,
  cardsCount = 0
}) => {
  if (!isOpen) {
    return null
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Exportar Backup do Quadro
              </h3>
              <p className="text-[11px] text-slate-400">
                Baixar cópia local em formato JSON
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

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Deseja baixar um arquivo de backup com todos os dados atuais do seu quadro?
          </p>

          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Quadro:
              </span>
              <span className="font-semibold text-white truncate max-w-[200px]">
                {boardTitle}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Total de Colunas:
              </span>
              <span className="font-semibold text-slate-200">
                {columnsCount} {columnsCount === 1 ? "coluna" : "colunas"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                Total de Cartões:
              </span>
              <span className="font-semibold text-slate-200">
                {cardsCount} {cardsCount === 1 ? "cartão" : "cartões"}
              </span>
            </div>
          </div>

          {/* Security & Scope note */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              O arquivo incluirá todas as capas, stickers, checklists, etiquetas e
              configurações de ambiente. Você poderá restaurá-lo a qualquer momento.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Backup (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
