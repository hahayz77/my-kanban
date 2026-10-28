import React, { useState } from "react"
import { X, Cloud, CheckCircle, RefreshCw, Key, ExternalLink } from "lucide-react"
import { notifySuccess } from "../utils/toastUtils"

/**
 * DriveConfigModal lets users configure their Google Client ID and manage Drive connection
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close modal callback
 * @param {string} props.googleClientId - Current Google Client ID
 * @param {Function} props.onSaveClientId - Save Google Client ID callback
 * @param {string} props.accessToken - Active OAuth token
 * @param {string} props.driveFileId - Google Drive file ID
 * @param {Function} props.onConnectDrive - Trigger Google OAuth connection
 * @param {Function} props.onSyncNow - Immediate sync callback
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const DriveConfigModal = ({
  isOpen,
  onClose,
  googleClientId,
  onSaveClientId,
  accessToken,
  driveFileId,
  onConnectDrive,
  onSyncNow
}) => {
  if (!isOpen) {
    return null
  }

  const [clientIdInput, setClientIdInput] = useState(googleClientId || "")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    onSaveClientId(clientIdInput.trim())
    setIsSaved(true)
    notifySuccess("Client ID do Google salvo com sucesso!")
    setTimeout(() => setIsSaved(false), 2000)
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
            <Cloud className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              Sincronização Google Drive
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
        <div className="p-6 space-y-5">
          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Status da Conexão
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    accessToken ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span className="text-sm font-medium text-slate-200">
                  {accessToken ? "Conectado ao Google Drive" : "Desconectado"}
                </span>
              </div>
              {driveFileId && (
                <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                  Arquivo ID: <span className="font-mono text-indigo-300">{driveFileId}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onConnectDrive(clientIdInput.trim())}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
              >
                {accessToken ? "Reconectar" : "Conectar Conta"}
              </button>
              {accessToken && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncNow()
                    notifySuccess("Sincronização com o Drive iniciada!")
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sincronizar Já</span>
                </button>
              )}
            </div>
          </div>

          {/* Client ID Configuration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              Google OAuth 2.0 Client ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="Ex: 123456789-abcdefg.apps.googleusercontent.com"
                className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
              >
                {isSaved ? "Salvo!" : "Salvar"}
              </button>
            </div>
          </div>

          {/* Instructions Guide */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300 flex items-center gap-1">
              Como obter seu Client ID:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>
                Acesse o{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Crie um projeto e ative a <strong>Google Drive API</strong>.</li>
              <li>
                Em <em>Credenciais</em>, crie um <strong>ID do cliente OAuth</strong> do tipo <strong>Aplicativo da Web</strong>.
              </li>
              <li>
                Adicione em <em>Origens JavaScript autorizadas</em>:
                <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                  http://localhost:5173
                </code>
              </li>
              <li>Cole o Client ID no campo acima e clique em <em>Conectar Conta</em>.</li>
            </ol>
            <p className="text-[11px] text-slate-500 pt-1">
              * O My Kanban sincroniza o arquivo <code className="text-slate-400">kanban_latest.json</code> com debounce automático de 3 segundos a cada alteração.
            </p>
          </div>
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
