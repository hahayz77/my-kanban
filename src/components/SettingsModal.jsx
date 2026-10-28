import React, { useState } from "react"
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
  Rows
} from "lucide-react"
import {
  TRELLO_COLOR_PALETTE,
  BOARD_ENVIRONMENT_THEMES,
  getTrelloColor
} from "../utils/trelloColors"
import { TrelloPatternIcon } from "./TrelloPatternIcon"
import { confirmDeleteToast, notifySuccess } from "../utils/toastUtils"

/**
 * SettingsModal provides a wide, centralized settings center for Tags and Layout (Column Width, Card Height, Themes)
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close modal callback
 * @param {Array<Object>} props.boardLabels - Board label list
 * @param {Array<Object>} props.cards - Board cards (for label usage counts)
 * @param {Function} props.onAddLabel - Add board label callback
 * @param {Function} props.onUpdateLabel - Update board label callback
 * @param {Function} props.onDeleteLabel - Delete board label callback
 * @param {string} props.boardTheme - Current environment theme ID
 * @param {Function} props.onSelectTheme - Update theme callback
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
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  boardTheme = "galaxy",
  onSelectTheme,
  columnWidth = 220,
  onUpdateColumnWidth,
  cardDensity = "compact",
  onUpdateCardDensity
}) => {
  if (!isOpen) {
    return null
  }

  const [activeTab, setActiveTab] = useState("labels") // "labels" | "layout"
  const [searchLabel, setSearchLabel] = useState("")

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
                Gerencie etiquetas, dimensões de colunas e cartões, tema e nuvem
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
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setActiveTab("labels")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === "labels"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Etiquetas & Cores ({boardLabels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === "layout"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Aparência, Colunas e Linhas</span>
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
