import React, { useEffect } from "react"
import { X, FileText, CornerDownRight, RefreshCw, Clock } from "lucide-react"

/**
 * MarkdownUploadModal prompts the user to choose between replacing current content or appending to the bottom
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close modal callback
 * @param {File} props.file - Selected file object
 * @param {boolean} props.hasExistingContent - Whether the card already has markdown text
 * @param {Function} props.onAppend - Callback to append content at the bottom with divider and timestamp header
 * @param {Function} props.onReplace - Callback to replace existing content
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const MarkdownUploadModal = ({
  isOpen,
  onClose,
  file,
  hasExistingContent = false,
  onAppend,
  onReplace
}) => {
  if (!isOpen || !file) {
    return null
  }

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

  const formattedSize = file.size
    ? `${(file.size / 1024).toFixed(1)} KB`
    : "Tamanho desconhecido"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Inserir Arquivo Markdown
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {file.name} • {formattedSize}
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

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            {hasExistingContent
              ? "Este cartão já possui conteúdo. Como você deseja carregar este novo arquivo?"
              : "Como você deseja inserir o conteúdo deste arquivo no cartão?"}
          </p>

          <div className="space-y-2.5">
            {/* Option A: Append to bottom (with sequence: ---, Title with timestamp, content) */}
            <button
              type="button"
              onClick={onAppend}
              className="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition-all group flex items-start gap-3 hover:border-indigo-400"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <CornerDownRight className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-200">
                    Adicionar ao Final (Anexar)
                  </h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Insere uma linha divisória <code className="px-1 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">---</code>,
                  cabeçalho com nome e data/hora, e anexa o conteúdo na parte inferior.
                </p>
              </div>
            </button>

            {/* Option B: Replace existing content */}
            <button
              type="button"
              onClick={onReplace}
              className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 text-left transition-all group flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/60 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white group-hover:text-slate-100">
                  Substituir Conteúdo
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Substitui todo o texto existente pelo conteúdo deste novo arquivo.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-3.5 px-5 bg-slate-950/60 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
