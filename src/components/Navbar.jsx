import React from "react"
import {
  Kanban,
  Download,
  Upload,
  Cloud,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Settings,
  Search,
  Plus
} from "lucide-react"

/**
 * Navbar component with board header controls, status indicators, and backup/sync triggers
 * @param {Object} props - Component properties
 * @param {Object} props.board - Board metadata
 * @param {string} props.status - Current persistence/sync status ("saving"|"saved"|"syncing"|"synced"|"error"|"idle")
 * @param {string} props.statusMessage - Detailed status message (e.g. "Atualizado às 14:02")
 * @param {boolean} props.hasGoogleAuth - Whether Google Drive OAuth token is active
 * @param {string} props.searchQuery - Current card search query
 * @param {Function} props.onSearchChange - Callback when search input changes
 * @param {Function} props.onOpenAdd - Trigger to open Add Card/Column modal
 * @param {Function} props.onOpenImport - Trigger to open Import modal
 * @param {Function} props.onOpenBackupConfirm - Trigger to open Backup Confirmation modal
 * @param {Function} props.onOpenDrive - Trigger to open Drive Configuration modal
 * @param {Function} props.onOpenSettings - Trigger to open Settings modal
 * @returns {JSX.Element} Rendered navbar component
 */
export const Navbar = ({
  board,
  status,
  statusMessage,
  hasGoogleAuth,
  searchQuery,
  onSearchChange,
  onOpenAdd,
  onOpenImport,
  onOpenBackupConfirm,
  onOpenDrive,
  onOpenSettings
}) => {
  /**
   * Renders the status icon according to current state
   * @returns {JSX.Element} Status icon
   */
  const renderStatusIcon = () => {
    switch (status) {
      case "saving":
        return <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
      case "syncing":
        return <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
      case "saved":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      case "synced":
        return <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Left: Brand & Board Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Kanban className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>{board?.title || "My Kanban"}</span>
          </h1>
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {renderStatusIcon()}
            <span
              className={`font-medium text-[10px] ${
                status === "saving"
                  ? "text-indigo-300"
                  : status === "error"
                  ? "text-rose-400"
                  : "text-slate-300"
              }`}
            >
              {status === "saving" ? "Salvando..." : statusMessage || "Pronto"}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Compact Search Box */}
      <div className="flex-1 max-w-xs relative hidden sm:block">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar cartões..."
          className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Add Button (+ only) */}
        <button
          type="button"
          onClick={onOpenAdd}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          title="Adicionar novo cartão, coluna ou etiqueta"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Import Trello / Backup */}
        <button
          type="button"
          onClick={onOpenImport}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 transition-colors"
          title="Importar exportação do Trello ou backup JSON"
        >
          <Upload className="w-3 h-3 text-indigo-400" />
          <span className="hidden sm:inline">Importar</span>
        </button>

        {/* Export Local Backup (Confirmation Modal) */}
        <button
          type="button"
          onClick={onOpenBackupConfirm}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 transition-colors"
          title="Exportar cópia de segurança dos dados (JSON)"
        >
          <Download className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">Backup</span>
        </button>

        {/* Google Drive Sync Modal */}
        <button
          type="button"
          onClick={onOpenDrive}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow transition-colors ${
            hasGoogleAuth
              ? "bg-sky-600 hover:bg-sky-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30"
          }`}
          title="Configurar sincronização com Google Drive"
        >
          <Cloud className="w-3 h-3" />
          <span className="hidden sm:inline">Sincronizar Drive</span>
        </button>

        {/* Environment & Labels Settings Modal */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
          title="Configurações (Etiquetas e Cores do Ambiente)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
