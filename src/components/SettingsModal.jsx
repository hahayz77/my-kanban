import React, { useState, useMemo } from "react"
import {
  X,
  Tag,
  Palette,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  Sliders,
  Rows,
  Type,
  User,
  Clock,
  Archive,
  FileText,
  ExternalLink
} from "lucide-react"
import {
  TRELLO_COLOR_PALETTE,
  BOARD_ENVIRONMENT_THEMES,
  BOARD_FONT_OPTIONS,
  getTrelloColor
} from "../utils/trelloColors"
import { TrelloPatternIcon } from "./TrelloPatternIcon"
import { confirmDeleteToast, notifySuccess } from "../utils/toastUtils"

/**
 * SettingsModal provides a wide, centralized settings center for Tags, Layout, Typography and User Pending/Archived items
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close modal callback
 * @param {Array<Object>} props.boardLabels - Board label list
 * @param {Array<Object>} props.cards - Board cards (for label usage counts and pending items)
 * @param {Array<Object>} props.columns - Board columns (for pending items column display)
 * @param {Function} props.onOpenCard - Open card callback
 * @param {Function} props.onUpdateCard - Update card callback
 * @param {Function} props.onAddLabel - Add board label callback
 * @param {Function} props.onUpdateLabel - Update board label callback
 * @param {Function} props.onDeleteLabel - Delete board label callback
 * @param {string} props.boardTheme - Current environment theme ID
 * @param {Function} props.onSelectTheme - Update theme callback
 * @param {string} props.boardFont - Current board font ID
 * @param {Function} props.onSelectFont - Update font callback
 * @param {number} props.columnWidth - Current column width in pixels
 * @param {Function} props.onUpdateColumnWidth - Update column width callback
 * @param {string} props.cardDensity - Current card height density ("compact"|"normal"|"comfortable")
 * @param {Function} props.onUpdateCardDensity - Update card density callback
 * @returns {JSX.Element|null} Rendered settings modal
 */
export const SettingsModal = ({
  isOpen,
  onClose,
  boardLabels = [],
  cards = [],
  columns = [],
  onOpenCard,
  onUpdateCard,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  boardTheme = "galaxy",
  onSelectTheme,
  boardFont = "inter",
  onSelectFont,
  columnWidth = 220,
  onUpdateColumnWidth,
  cardDensity = "compact",
  onUpdateCardDensity
}) => {
  if (!isOpen) {
    return null
  }

  const [activeTab, setActiveTab] = useState("labels") // "labels" | "layout" | "typography" | "user"
  const [userSubTab, setUserSubTab] = useState("pending") // "pending" | "archived"
  const [searchLabel, setSearchLabel] = useState("")

  // Pending approval cards
  const pendingCards = useMemo(() => {
    return cards.filter(
      (c) =>
        Boolean(c.hasPendingChanges) ||
        (c.pendingDesc !== undefined && c.pendingDesc !== null && c.pendingDesc !== c.desc)
    )
  }, [cards])

  /**
   * Approves pending draft changes for a specific card
   * @param {Object} card - Card with pending changes
   */
  const handleApprovePending = (card) => {
    const finalDesc =
      card.pendingDesc !== null && card.pendingDesc !== undefined
        ? card.pendingDesc
        : card.desc
    onUpdateCard?.(card.id, {
      desc: finalDesc,
      pendingDesc: null,
      hasPendingChanges: false
    })
    notifySuccess(`Alterações de "${card.title || "Cartão"}" aprovadas com sucesso!`)
  }

  /**
   * Discards pending draft changes for a specific card, reverting to saved baseline
   * @param {Object} card - Card with pending changes
   */
  const handleDiscardPending = (card) => {
    confirmDeleteToast(
      `Descartar as alterações pendentes de "${card.title || "Cartão"}"?`,
      () => {
        onUpdateCard?.(card.id, {
          pendingDesc: null,
          hasPendingChanges: false
        })
        notifySuccess("Alterações pendentes descartadas.")
      }
    )
  }

  // Label form state (for creating or editing)
  const [editingLabelId, setEditingLabelId] = useState(null)
  const [labelFormName, setLabelFormName] = useState("")
  const [labelFormColor, setLabelFormColor] = useState("green_dark")
  const [isFormOpen, setIsFormOpen] = useState(false)

  /**
   * Calculates how many cards use a given label
   * @param {string} labelKey - Label id or name
   * @returns {number} Usage count
   */
  const getLabelUsageCount = (labelKey) => {
    return cards.filter((c) =>
      (c.labels || []).some((l) => (l.id || l.name) === labelKey)
    ).length
  }

  /**
   * Opens the label form to create a new label
   */
  const handleOpenCreateForm = () => {
    setEditingLabelId(null)
    setLabelFormName("")
    setLabelFormColor("green_dark")
    setIsFormOpen(true)
  }

  /**
   * Opens the label form to edit an existing label
   * @param {Object} label - Label to edit
   */
  const handleOpenEditForm = (label) => {
    setEditingLabelId(label.id)
    setLabelFormName(label.name || "")
    setLabelFormColor(label.color || "green_dark")
    setIsFormOpen(true)
  }

  /**
   * Submits the label form (create or edit)
   */
  const handleSaveLabelForm = () => {
    const trimmed = labelFormName.trim()
    if (!trimmed && !labelFormColor) {
      return
    }

    if (editingLabelId) {
      const oldLabel = boardLabels.find((l) => l.id === editingLabelId)
      onUpdateLabel(editingLabelId, {
        name: trimmed,
        color: labelFormColor,
        oldName: oldLabel?.name
      })
      notifySuccess("Etiqueta atualizada com sucesso!")
    } else {
      onAddLabel({
        name: trimmed,
        color: labelFormColor
      })
      notifySuccess("Etiqueta criada com sucesso!")
    }

    setIsFormOpen(false)
    setEditingLabelId(null)
    setLabelFormName("")
  }

  const filteredLabels = boardLabels.filter((l) =>
    (l.name || "").toLowerCase().includes(searchLabel.toLowerCase())
  )

  const previewColorObj = getTrelloColor(labelFormColor)

  const widthPresets = [
    { label: "Mínima", width: 180 },
    { label: "Compacta (Padrão)", width: 220 },
    { label: "Média", width: 260 },
    { label: "Larga", width: 300 }
  ]

  const densityOptions = [
    {
      id: "ultra-compact",
      title: "Ultra Compacto",
      desc: "Menor altura possível, cartões ultra densos e espaçamento mínimo. Perfeito para muitos itens."
    },
    {
      id: "compact",
      title: "Compacto (Padrão)",
      desc: "Cartões compactos, menor altura e leitura limpa. Padrão recomendado do quadro."
    },
    {
      id: "normal",
      title: "Médio",
      desc: "Altura intermediária com espaçamento moderado."
    },
    {
      id: "comfortable",
      title: "Confortável",
      desc: "Cartões mais altos, maior espaçamento interno e fontes destacadas."
    }
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Configurações do Ambiente
              </h2>
              <p className="text-[11px] text-slate-400">
                Gerencie etiquetas, tema, tipografia e usuário
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("labels")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              activeTab === "labels"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Etiquetas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              activeTab === "layout"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              activeTab === "typography"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Tipografia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("user")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              activeTab === "user"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Usuário</span>
            {pendingCards.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingCards.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ETIQUETAS (TAGS) */}
          {activeTab === "labels" && (
            <div className="space-y-5">
              {/* Header with Search and Create Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar etiquetas..."
                    value={searchLabel}
                    onChange={(e) => setSearchLabel(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateForm}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Nova Etiqueta</span>
                </button>
              </div>

              {/* Tag Creation / Edit Panel */}
              {isFormOpen && (
                <div className="p-4 rounded-xl bg-slate-800/90 border border-indigo-500/40 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      {editingLabelId ? "Editar Etiqueta" : "Nova Etiqueta"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name and Live Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Título da etiqueta:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Urgente, Backend, Ideia..."
                        value={labelFormName}
                        onChange={(e) => setLabelFormName(e.target.value)}
                        autoFocus
                        className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
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
                          color={labelFormColor}
                          className="w-4 h-4 opacity-80"
                        />
                        <span>{labelFormName || "Título da Etiqueta"}</span>
                      </div>
                    </div>
                  </div>

                  {/* 10 Colors x 2 Shades (20 Options) Palette with Pattern on the Left */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Selecione a cor (10 famílias, 2 tons com desenho acessível):
                    </label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {TRELLO_COLOR_PALETTE.map((c) => {
                        const isSelected = labelFormColor === c.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setLabelFormColor(c.id)}
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
                              className="w-3.5 h-3.5 text-white/80"
                            />
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white ml-auto" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLabelForm}
                      className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md transition-colors"
                    >
                      {editingLabelId ? "Salvar Alterações" : "Criar Etiqueta"}
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Board Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredLabels.map((lbl) => {
                  const colorObj = getTrelloColor(lbl.color)
                  const usageCount = getLabelUsageCount(lbl.id || lbl.name)

                  return (
                    <div
                      key={lbl.id || lbl.name}
                      className="group flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm"
                    >
                      {/* Label Pill */}
                      <div
                        style={{
                          backgroundColor: colorObj.bg,
                          color: colorObj.text
                        }}
                        className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm truncate mr-2"
                      >
                        <TrelloPatternIcon
                          color={lbl.color}
                          className="w-3.5 h-3.5 opacity-80 flex-shrink-0"
                        />
                        <span className="truncate">{lbl.name || "•"}</span>
                      </div>

                      {/* Usage counter & Actions */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {usageCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(lbl)}
                          className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-700 rounded transition-colors"
                          title="Editar etiqueta"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            confirmDeleteToast({
                              message: `Excluir a etiqueta "${lbl.name || "sem nome"}"? Ela será removida de ${usageCount} cartões.`,
                              title: "Excluir Etiqueta",
                              onConfirm: () => onDeleteLabel(lbl.id),
                              successMessage: "Etiqueta excluída com sucesso!"
                            })
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
                          title="Excluir etiqueta"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredLabels.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Nenhuma etiqueta encontrada.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APARÊNCIA, COLUNAS E LINHAS (LAYOUT & THEME) */}
          {activeTab === "layout" && (
            <div className="space-y-7">
              {/* SECTION A: TAMANHO DAS COLUNAS (LARGURA) */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Largura das Colunas
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Ajuste o tamanho horizontal de todas as listas do quadro
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                    {columnWidth}px
                  </span>
                </div>

                {/* Range Slider */}
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-slate-400">180px</span>
                  <input
                    type="range"
                    min="180"
                    max="400"
                    step="8"
                    value={columnWidth}
                    onChange={(e) => onUpdateColumnWidth(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400">400px</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {widthPresets.map((preset) => (
                    <button
                      key={preset.width}
                      type="button"
                      onClick={() => onUpdateColumnWidth(preset.width)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                        columnWidth === preset.width
                          ? "bg-indigo-600 text-white border-indigo-500 shadow"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      }`}
                    >
                      {preset.label} ({preset.width}px)
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION B: ALTURA DOS CARTÕES (DENSIDADE DE LINHAS) */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Rows className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Altura dos Cartões (Densidade de Linhas)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Controle o espaçamento interno, altura e densidade visual dos cartões
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {densityOptions.map((opt) => {
                    const isSelected = cardDensity === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateCardDensity(opt.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-800 shadow-md"
                            : "border-slate-700/80 hover:border-slate-600 bg-slate-900/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-xs font-bold text-white">
                              {opt.title}
                            </h4>
                            {isSelected && (
                              <Check className="w-4 h-4 text-indigo-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION C: CORES DO AMBIENTE (TEMA DO WORKSPACE) */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Tema de Fundo do Quadro
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Personalize a cor ou gradiente do plano de fundo do seu espaço de trabalho
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  {BOARD_ENVIRONMENT_THEMES.map((theme) => {
                    const isSelected = boardTheme === theme.id
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => onSelectTheme(theme.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg bg-slate-800/90"
                            : "border-slate-800 hover:border-slate-700 bg-slate-900/60"
                        }`}
                      >
                        {/* Color Preview Block */}
                        <div
                          className={`h-12 w-full rounded-lg mb-2 border border-white/10 ${theme.background} flex items-center justify-center shadow-inner`}
                        >
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white mb-0.5 truncate">
                            {theme.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {theme.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIPOGRAFIA & FONTES */}
          {activeTab === "typography" && (
            <div className="space-y-7">
              {/* SECTION A: FONTE DO QUADRO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Família Tipográfica Principal
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    5 fontes profissionais para interface
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Escolha a tipografia geral do seu Kanban. A fonte selecionada será aplicada em todo o quadro, títulos e cartões.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {BOARD_FONT_OPTIONS.map((f) => {
                    const isSelected = boardFont === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          onSelectFont?.(f.id)
                          notifySuccess(`Fonte alterada para ${f.name}!`)
                        }}
                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30"
                            : "border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800"
                        }`}
                        style={{ fontFamily: f.fontFamily }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {f.name}
                            </span>
                            <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-700/60">
                              {f.category}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-normal leading-relaxed mb-2">
                          Aa Bb Cc 123 • O rápido javali salta sobre o cão preguiçoso
                        </p>

                        <p className="text-[11px] font-sans text-slate-400 leading-snug">
                          {f.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION B: FONTE MONOESPAÇADA PARA CÓDIGO */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Fonte de Código: JetBrains Mono
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Ativa no sistema
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Para trechos de código em linha (<code className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800 font-mono text-[11px]">`código`</code>) e blocos com múltiplas linhas, o sistema utiliza automaticamente a premiada fonte de desenvolvedor <strong>JetBrains Mono</strong> para máxima legibilidade e proporções clássicas de terminais.
                </p>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 font-mono text-xs text-indigo-300 overflow-x-auto shadow-inner">
                  <span className="text-slate-500"># Exemplo de bloco de código no Kanban</span>
                  <br />
                  <span className="text-emerald-400">$</span> npm install -D tailwindcss postcss autoprefixer
                  <br />
                  <span className="text-emerald-400">$</span> npx tailwindcss init -p
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USUÁRIO (ITENS PENDENTES DE APROVAÇÃO & ARQUIVADOS) */}
          {activeTab === "user" && (
            <div className="space-y-6">
              {/* Header with Sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Gerenciamento do Usuário
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhe alterações pendentes de confirmação e itens arquivados
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setUserSubTab("pending")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      userSubTab === "pending"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Itens pendentes de aprovação</span>
                    {pendingCards.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {pendingCards.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserSubTab("archived")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      userSubTab === "archived"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Itens arquivados</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Itens pendentes de aprovação */}
              {userSubTab === "pending" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Total pendente:{" "}
                      <strong className="text-slate-200">{pendingCards.length}</strong>{" "}
                      {pendingCards.length === 1 ? "cartão" : "cartões"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Alterações salvas como rascunho aguardando aprovação
                    </span>
                  </div>

                  {pendingCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        Nenhum item pendente de aprovação
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                        Ao editar a descrição de um cartão e sair da tela sem clicar em salvar, o rascunho é preservado com segurança e listado aqui até que você confirme ou descarte.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingCards.map((card) => {
                        const col = columns.find((c) => c.id === card.columnId)
                        const previewSnippet = (card.pendingDesc || card.desc || "").trim()

                        return (
                          <div
                            key={card.id}
                            className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                          >
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                                  {card.title || "Cartão sem título"}
                                </span>
                                {col && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    {col.title}
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-medium">
                                  <Clock className="w-2.5 h-2.5" />
                                  Pendente de confirmação
                                </span>
                              </div>

                              {previewSnippet ? (
                                <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed">
                                  {previewSnippet}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500 italic">
                                  (Descrição vazia na alteração pendente)
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose()
                                  onOpenCard?.(card)
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                                title="Abrir modal do cartão para editar ou ver detalhes"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Abrir Cartão</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApprovePending(card)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                                title="Aprovar e salvar permanentemente as alterações deste cartão"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDiscardPending(card)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/30 rounded-lg transition-colors"
                                title="Descartar rascunho e manter a versão anterior salva"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Descartar</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Itens arquivados */}
              {userSubTab === "archived" && (
                <div className="flex flex-col items-center justify-center p-14 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center border border-slate-700/60 shadow-inner">
                    <Archive className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    Itens arquivados
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Aqui você poderá consultar, restaurar ou excluir definitivamente cartões e colunas que foram arquivados.
                  </p>
                  <div className="pt-2">
                    <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900 text-indigo-400 border border-indigo-500/30 font-medium">
                      (vou implementar depois)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex justify-end p-3.5 px-6 bg-slate-950/50 border-t border-slate-800">
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
