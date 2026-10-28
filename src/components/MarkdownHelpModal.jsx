import React from "react"
import { X, HelpCircle, Command } from "lucide-react"

/**
 * MarkdownHelpModal shows markdown shortcuts and formatting cheat sheet
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close callback
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const MarkdownHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Ajuda & Atalhos de Markdown</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Slash command tip */}
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex items-start gap-2">
            <Command className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Menu Rápido de Comandos:</span>
              <p className="text-[11px] text-indigo-200/90 mt-0.5 leading-relaxed">
                Digite <span className="font-mono px-1 py-0.5 bg-indigo-900/60 rounded text-indigo-300 font-bold">/</span> no início ou após um espaço para abrir o menu suspenso com opções de títulos, listas, código e citações.
              </p>
            </div>
          </div>

          {/* Shortcuts Table */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Formatação de Texto
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Negrito:</span>{" "}
                <code className="text-indigo-300 font-mono">**texto**</code> ou <kbd className="px-1 py-0.5 rounded bg-slate-900 text-slate-300">Ctrl+B</kbd>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Itálico:</span>{" "}
                <code className="text-indigo-300 font-mono">*texto*</code> ou <kbd className="px-1 py-0.5 rounded bg-slate-900 text-slate-300">Ctrl+I</kbd>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Títulos:</span>{" "}
                <code className="text-indigo-300 font-mono"># H1, ## H2, ### H3</code>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Código em linha:</span>{" "}
                <code className="text-indigo-300 font-mono">`código`</code>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Lista marcadores:</span>{" "}
                <code className="text-indigo-300 font-mono">- item</code>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Lista numerada:</span>{" "}
                <code className="text-indigo-300 font-mono">1. item</code>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Lista de tarefas:</span>{" "}
                <code className="text-indigo-300 font-mono">- [ ] tarefa</code>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400">Citação:</span>{" "}
                <code className="text-indigo-300 font-mono">&gt; citação</code>
              </div>
            </div>
          </div>

          {/* Links tip */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Previews de Links
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ao adicionar um link no texto, o modo visualização exibe um preview com botões <span className="font-mono text-indigo-300 font-bold">p</span>, <span className="font-mono text-indigo-300 font-bold">m</span> e <span className="font-mono text-indigo-300 font-bold">g</span> para alternar o tamanho.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-2.5 bg-slate-800/60 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
