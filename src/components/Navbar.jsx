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
 * @param {Function} props.onOpenImport - Trigger to open Import modal
 * @param {Function} props.onExportBackup - Trigger to download local JSON backup
 * @param {Function} props.onSyncDrive - Trigger to sync with Google Drive
 * @param {Function} props.onOpenSettings - Trigger to open Settings modal
 * @param {Function} props.onAddColumn - Callback to add a new column
 * @returns {JSX.Element} Rendered navbar component
 */
export const Navbar = ({
  board,
  status,
  statusMessage,
  hasGoogleAuth,
  searchQuery,
  onSearchChange,
  onOpenImport,
  onExportBackup,
  onSyncDrive,
  onOpenSettings,
  onAddColumn
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
        return <Cloud className="w-3.5 h-3.5 text-sky-400" />
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-500" />
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
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            {renderStatusIcon()}
            <span className="font-medium text-[10px]">
              {statusMessage || "Pronto"}
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
        {/* Add Column */}
        <button
          type="button"
          onClick={() => {
            const title = prompt("Nome da nova coluna:")
            if (title && title.trim()) {
              onAddColumn(title.trim())
            }
          }}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 transition-colors"
        >
          <Plus className="w-3 h-3 text-indigo-400" />
          <span>Nova Coluna</span>
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

        {/* Export Local Backup */}
        <button
          type="button"
          onClick={onExportBackup}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 transition-colors"
          title="Baixar cópia local dos dados (JSON)"
        >
          <Download className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">Backup</span>
        </button>

        {/* Google Drive Sync */}
        <button
          type="button"
          onClick={onSyncDrive}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow transition-colors ${
            hasGoogleAuth
              ? "bg-sky-600 hover:bg-sky-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30"
          }`}
          title="Sincronizar com Google Drive"
        >
          <Cloud className="w-3 h-3" />
          <span className="hidden sm:inline">Sincronizar Drive</span>
        </button>

        {/* Comprehensive Settings Modal */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
          title="Configurações (Etiquetas, Cores do Ambiente e Drive)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
