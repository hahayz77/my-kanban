import React, { useState, useRef } from "react"
import { X, Upload, FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { readJsonFile } from "../services/backupService"

/**
 * ImportModal allows importing either a Trello export JSON or an internal Kanban backup JSON
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onImportTrello - Callback when Trello JSON is loaded
 * @param {Function} props.onImportBackup - Callback when Kanban backup is loaded
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const ImportModal = ({
  isOpen,
  onClose,
  onImportTrello,
  onImportBackup
}) => {
  if (!isOpen) {
    return null
  }

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  /**
   * Processes a JSON file object
   * @param {File} file - Uploaded file
   */
  const handleProcessFile = async (file) => {
    if (!file) {
      return
    }

    if (!file.name.endsWith(".json")) {
      setErrorMessage("Por favor, selecione um arquivo no formato .json")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const data = await readJsonFile(file)
      // Check if Trello format
      if (Array.isArray(data.lists) && Array.isArray(data.cards)) {
        await onImportTrello(data)
        onClose()
      } else if (data.columns && data.cards) {
        // Internal backup format
        await onImportBackup(data)
        onClose()
      } else {
        throw new Error(
          "O arquivo JSON não corresponde a um backup do Trello nem do My Kanban."
        )
      }
    } catch (error) {
      setErrorMessage(error.message || "Erro ao processar arquivo")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Loads the pre-bundled Trello backup from the public folder
   */
  const handleLoadBundledBackup = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/default-trello-backup.json")
      if (!response.ok) {
        throw new Error("Arquivo padrão de backup não encontrado no servidor.")
      }
      const trelloData = await response.json()
      await onImportTrello(trelloData)
      onClose()
    } catch (error) {
      setErrorMessage(error.message || "Falha ao carregar backup padrão")
    } finally {
      setIsLoading(false)
    }
  }

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
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Upload className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              Importar Dados
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Quick 1-click button for the existing Trello backup */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Backup Base Local
              </p>
              <p className="text-sm font-medium text-slate-200">
                Backup Trello - Ao Infinito e Além
              </p>
              <p className="text-xs text-slate-400">
                8 listas e 285 cartões com checklists e etiquetas
              </p>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleLoadBundledBackup}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg transition-all hover:scale-[1.02]"
            >
              {isLoading ? "Carregando..." : "Carregar Agora"}
            </button>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs uppercase text-slate-500 font-semibold absolute">
              Ou selecione um arquivo
            </span>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleProcessFile(e.dataTransfer.files[0])
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-slate-700 hover:border-slate-500 bg-slate-800/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleProcessFile(e.target.files[0])
                }
              }}
            />
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200 mb-1">
              Arraste e solte seu arquivo .JSON aqui
            </p>
            <p className="text-xs text-slate-400">
              Compatível com exportações do Trello ou backups deste Kanban
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 px-6 bg-slate-950/50 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
