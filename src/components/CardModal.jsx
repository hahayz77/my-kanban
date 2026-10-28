import React, { useState, useRef, useEffect } from "react"
import {
  X,
  AlignLeft,
  CheckSquare,
  Square,
  Calendar,
  Tag,
  Trash2,
  Plus,
  Palette,
  Check,
  Search,
  Smile,
  Upload,
  Image as ImageIcon
} from "lucide-react"
import { TRELLO_COLOR_PALETTE, getTrelloColor } from "../utils/trelloColors"
import { TrelloPatternIcon, TrelloPatternStrip } from "./TrelloPatternIcon"
import {
  BUILTIN_STICKERS,
  renderCardSticker
} from "../utils/trelloStickers"
import { confirmDeleteToast, notifySuccess } from "../utils/toastUtils"
import { MarkdownViewer } from "./MarkdownViewer"
import { normalizeLinkKey } from "./LinkPreviewCard"

/**
 * CardModal provides full viewing and editing capabilities for a Kanban card with 3 Trello cover modes and stickers
 * @param {Object} props - Component properties
 * @param {Object} props.card - The card being viewed/edited
 * @param {Array<Object>} props.columns - Board columns for reference
 * @param {Array<Object>} props.boardLabels - Complete collection of board labels
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onSave - Callback to save updated card data
 * @param {Function} props.onDelete - Callback to delete card
 * @param {Function} props.onAddBoardLabel - Callback to add new board label
 * @returns {JSX.Element|null} Rendered modal dialog
 */
export const CardModal = ({
  card,
  columns,
  boardLabels = [],
  onClose,
  onSave,
  onDelete,
  onAddBoardLabel
}) => {
  if (!card) {
    return null
  }

  const savedBaseline = card.desc || ""
  const initialHasDraft = Boolean(
    card.hasPendingChanges &&
    card.pendingDesc !== null &&
    card.pendingDesc !== undefined &&
    card.pendingDesc !== savedBaseline
  )
  const initialDesc = initialHasDraft ? card.pendingDesc : savedBaseline

  const [title, setTitle] = useState(card.title || "")
  const [desc, setDesc] = useState(initialDesc)
  const [confirmedDesc, setConfirmedDesc] = useState(savedBaseline)
  const [hasPendingChanges, setHasPendingChanges] = useState(initialHasDraft)
  const [labels, setLabels] = useState(card.labels || [])
  const [checklists, setChecklists] = useState(card.checklists || [])
  const [due, setDue] = useState(card.due ? card.due.slice(0, 10) : "")
  const [dueComplete, setDueComplete] = useState(Boolean(card.dueComplete))
  const [coverColor, setCoverColor] = useState(card.cover?.color || null)
  const [coverSize, setCoverSize] = useState(
    card.cover?.size === "full" ? "full" : "normal"
  )
  const [sticker, setSticker] = useState(card.sticker || null)
  const [linkSizes, setLinkSizes] = useState(card.linkSizes || {})

  // Synchronize state when card identity changes
  useEffect(() => {
    const baseline = card.desc || ""
    const hasDraft = Boolean(
      card.hasPendingChanges &&
      card.pendingDesc !== null &&
      card.pendingDesc !== undefined &&
      card.pendingDesc !== baseline
    )
    const activeText = hasDraft ? card.pendingDesc : baseline
    setDesc(activeText)
    setConfirmedDesc(baseline)
    setHasPendingChanges(hasDraft)
    setTitle(card.title || "")
    setLabels(card.labels || [])
    setChecklists(card.checklists || [])
    setDue(card.due ? card.due.slice(0, 10) : "")
    setDueComplete(Boolean(card.dueComplete))
    setCoverColor(card.cover?.color || null)
    setCoverSize(card.cover?.size === "full" ? "full" : "normal")
    setSticker(card.sticker || null)
    setLinkSizes(card.linkSizes || {})
  }, [card.id])

  const [activeTab, setActiveTab] = useState(null) // "cover" | "labels" | "sticker" | null
  const [labelSearch, setLabelSearch] = useState("")
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const [newLabelTitle, setNewLabelTitle] = useState("")
  const [newLabelColorId, setNewLabelColorId] = useState("green_dark")

  const [newChecklistTitle, setNewChecklistTitle] = useState("")
  const [isAddingChecklist, setIsAddingChecklist] = useState(false)
  const [newCheckItemText, setNewCheckItemText] = useState({})

  const fileInputRef = useRef(null)

  const currentColumn = columns.find((c) => c.id === card.columnId)
  const activeCoverObj = coverColor ? getTrelloColor(coverColor) : null

  /**
   * Persists card modifications
   * @param {Object} updatedFields - Fields to update
   */
  const handleAutoSave = (updatedFields) => {
    const nextColor =
      "coverColor" in updatedFields ? updatedFields.coverColor : coverColor
    const nextSize =
      "coverSize" in updatedFields ? updatedFields.coverSize : coverSize
    const nextSticker =
      "sticker" in updatedFields ? updatedFields.sticker : sticker
    const nextLinkSizes =
      "linkSizes" in updatedFields ? updatedFields.linkSizes : linkSizes
    const nextConfirmedDesc =
      "desc" in updatedFields ? updatedFields.desc : confirmedDesc
    const nextPendingDesc =
      "pendingDesc" in updatedFields
        ? updatedFields.pendingDesc
        : (hasPendingChanges ? desc : null)
    const nextHasPendingChanges =
      "hasPendingChanges" in updatedFields
        ? updatedFields.hasPendingChanges
        : hasPendingChanges

    const updatedCard = {
      ...card,
      title,
      desc: nextConfirmedDesc,
      pendingDesc: nextPendingDesc,
      hasPendingChanges: nextHasPendingChanges,
      labels,
      checklists,
      due: due ? new Date(due).toISOString() : null,
      dueComplete,
      cover: nextColor ? { color: nextColor, size: nextSize } : null,
      sticker: nextSticker,
      linkSizes: nextLinkSizes,
      ...updatedFields
    }
    delete updatedCard.coverColor
    delete updatedCard.coverSize
    onSave(card.id, updatedCard)
  }

  /**
   * Handles draft description text changes while editing
   * Immediately persists draft to card so closing modal/clicking outside preserves it
   * @param {string} newVal - New description text
   */
  const handleDescChange = (newVal) => {
    setDesc(newVal)
    const isPending = newVal !== confirmedDesc
    setHasPendingChanges(isPending)
    handleAutoSave({
      pendingDesc: isPending ? newVal : null,
      hasPendingChanges: isPending
    })
  }

  /**
   * Confirms and officially saves description, clearing pending draft state
   * @param {string} confirmedText - Confirmed description text
   */
  const handleConfirmSaveDesc = (confirmedText) => {
    setDesc(confirmedText)
    setConfirmedDesc(confirmedText)
    setHasPendingChanges(false)
    handleAutoSave({
      desc: confirmedText,
      pendingDesc: null,
      hasPendingChanges: false
    })
  }

  /**
   * Cancels and reverts pending description back to confirmed baseline
   */
  const handleCancelDesc = () => {
    const restoredText = confirmedDesc
    setDesc(restoredText)
    setHasPendingChanges(false)
    handleAutoSave({
      desc: restoredText,
      pendingDesc: null,
      hasPendingChanges: false
    })
  }

  /**
   * Updates link preview size preference for this specific card
   * @param {string} url - Target URL
   * @param {string} newSize - "p" | "m" | "g"
   */
  const handleUpdateLinkSize = (url, newSize) => {
    const key = normalizeLinkKey(url)
    const updated = {
      ...linkSizes,
      [key]: newSize
    }
    setLinkSizes(updated)
    handleAutoSave({ linkSizes: updated })
  }

  /**
   * Toggles completion state of a checklist item
   * @param {string} checklistId - ID of checklist
   * @param {string} itemId - ID of check item
   */
  const handleToggleCheckItem = (checklistId, itemId) => {
    const updated = checklists.map((cl) => {
      if (cl.id !== checklistId) {
        return cl
      }
      return {
        ...cl,
        checkItems: (cl.checkItems || []).map((item) => {
          if (item.id !== itemId) {
            return item
          }
          const nextState =
            item.state === "complete" ? "incomplete" : "complete"
          return { ...item, state: nextState }
        })
      }
    })

    setChecklists(updated)
    handleAutoSave({ checklists: updated })
  }

  /**
   * Adds a check item to a checklist
   * @param {string} checklistId - ID of checklist
   */
  const handleAddCheckItem = (checklistId) => {
    const text = (newCheckItemText[checklistId] || "").trim()
    if (!text) {
      return
    }

    const newItem = {
      id: "item-" + Date.now(),
      name: text,
      state: "incomplete",
      pos: Date.now()
    }

    const updated = checklists.map((cl) => {
      if (cl.id !== checklistId) {
        return cl
      }
      return {
        ...cl,
        checkItems: [...(cl.checkItems || []), newItem]
      }
    })

    setChecklists(updated)
    setNewCheckItemText((prev) => ({ ...prev, [checklistId]: "" }))
    handleAutoSave({ checklists: updated })
  }

  /**
   * Removes a check item from a checklist with toast confirmation
   * @param {string} checklistId - ID of checklist
   * @param {string} itemId - ID of item
   */
  const handleDeleteCheckItem = (checklistId, itemId) => {
    confirmDeleteToast({
      message: "Excluir este item da checklist?",
      title: "Excluir Item",
      onConfirm: () => {
        const updated = checklists.map((cl) => {
          if (cl.id !== checklistId) {
            return cl
          }
          return {
            ...cl,
            checkItems: (cl.checkItems || []).filter((item) => item.id !== itemId)
          }
        })
        setChecklists(updated)
        handleAutoSave({ checklists: updated })
      },
      successMessage: "Item da checklist removido!"
    })
  }

  /**
   * Adds a new checklist to the card
   */
  const handleCreateChecklist = () => {
    const trimmed = newChecklistTitle.trim()
    if (!trimmed) {
      return
    }

    const newCl = {
      id: "checklist-" + Date.now(),
      name: trimmed,
      pos: checklists.length * 1000,
      checkItems: []
    }

    const updated = [...checklists, newCl]
    setChecklists(updated)
    setNewChecklistTitle("")
    setIsAddingChecklist(false)
    handleAutoSave({ checklists: updated })
    notifySuccess("Checklist adicionada com sucesso!")
  }

  /**
   * Deletes a checklist with toast confirmation
   * @param {string} checklistId - ID of checklist
   */
  const handleDeleteChecklist = (checklistId) => {
    const target = checklists.find((cl) => cl.id === checklistId)
    confirmDeleteToast({
      message: `Excluir a checklist "${target?.name || target?.title || "Checklist"}" e todos os seus itens?`,
      title: "Excluir Checklist",
      onConfirm: () => {
        const updated = checklists.filter((cl) => cl.id !== checklistId)
        setChecklists(updated)
        handleAutoSave({ checklists: updated })
      },
      successMessage: "Checklist excluída com sucesso!"
    })
  }

  /**
   * Toggles a label on/off for this card
   * @param {Object} label - Label object
   */
  const handleToggleCardLabel = (label) => {
    const labelKey = label.id || label.name
    const exists = labels.some((l) => (l.id || l.name) === labelKey)

    let updated
    if (exists) {
      updated = labels.filter((l) => (l.id || l.name) !== labelKey)
    } else {
      updated = [...labels, label]
    }

    setLabels(updated)
    handleAutoSave({ labels: updated })
  }

  /**
   * Creates a new board label and attaches it to this card
   */
  const handleCreateLabelSubmit = () => {
    const trimmed = newLabelTitle.trim()
    if (!trimmed && !newLabelColorId) {
      return
    }

    const newLabel = {
      id: "lbl-" + Date.now(),
      name: trimmed,
      color: newLabelColorId
    }

    if (onAddBoardLabel) {
      onAddBoardLabel(newLabel)
    }

    const updated = [...labels, newLabel]
    setLabels(updated)
    setNewLabelTitle("")
    setIsCreatingLabel(false)
    handleAutoSave({ labels: updated })
  }

  /**
   * Picks or toggles a cover color
   * @param {string} colorId - Color identifier
   */
  const handleSelectCoverColor = (colorId) => {
    setCoverColor(colorId)
    const currentSize = coverSize || "normal"
    setCoverSize(currentSize)
    handleAutoSave({
      coverColor: colorId,
      coverSize: currentSize,
      cover: { color: colorId, size: currentSize }
    })
  }

  /**
   * Updates cover display mode (none | normal/faixa colorida | full)
   * @param {"none"|"normal"|"full"} mode - Cover display mode
   */
  const handleSetCoverMode = (mode) => {
    if (mode === "none") {
      setCoverColor(null)
      handleAutoSave({ coverColor: null, cover: null })
      return
    }

    const targetColor = coverColor || "green_dark"
    setCoverColor(targetColor)
    setCoverSize(mode)
    handleAutoSave({
      coverColor: targetColor,
      coverSize: mode,
      cover: { color: targetColor, size: mode }
    })
  }

  /**
   * Selects a built-in sticker
   * @param {string} stickerId - Sticker identifier
   */
  const handleSelectBuiltinSticker = (stickerId) => {
    const newSticker = {
      type: "builtin",
      id: stickerId
    }
    setSticker(newSticker)
    handleAutoSave({ sticker: newSticker })
    notifySuccess("Sticker aplicado ao cartão!")
  }

  /**
   * Removes current sticker with toast confirmation
   */
  const handleRemoveSticker = () => {
    confirmDeleteToast({
      message: "Remover o sticker deste cartão?",
      title: "Remover Sticker",
      onConfirm: () => {
        setSticker(null)
        handleAutoSave({ sticker: null })
      },
      successMessage: "Sticker removido do cartão!"
    })
  }

  /**
   * Handles local PNG file upload from user's computer
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleUploadCustomSticker = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      const newSticker = {
        type: "custom",
        dataUrl,
        name: file.name
      }
      setSticker(newSticker)
      handleAutoSave({ sticker: newSticker })
      notifySuccess("Sticker personalizado carregado!")
    }
    reader.readAsDataURL(file)
  }

  /**
   * Filters labels according to search query
   */
  const filteredBoardLabels = boardLabels.filter((lbl) =>
    (lbl.name || "").toLowerCase().includes(labelSearch.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trello-Style Card Cover Top Banner */}
        {activeCoverObj && (
          <div
            className={`w-full flex items-center justify-between px-4 transition-colors relative ${
              coverSize === "full" ? "h-14" : "h-9"
            }`}
            style={{ backgroundColor: activeCoverObj.bg }}
          >
            <div className="text-white/90 flex items-center gap-2">
              <TrelloPatternIcon
                color={coverColor}
                className="w-5 h-5 opacity-90"
              />
              {coverSize === "full" && (
                <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                  Capa em Todo o Cartão
                </span>
              )}
            </div>

            {/* Sticker Preview in Banner if active */}
            {sticker && (
              <div className="flex items-center">
                {renderCardSticker(sticker, "w-8 h-7 transform -rotate-6")}
              </div>
            )}
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 px-6 border-b border-slate-800">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleAutoSave({ title })}
              className="w-full text-base font-semibold bg-transparent text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Título do cartão..."
            />
            {currentColumn && (
              <p className="mt-0.5 text-xs text-slate-400">
                na lista{" "}
                <span className="font-semibold text-slate-300">
                  {currentColumn.title}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Actions Row */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === "labels" ? null : "labels")
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeTab === "labels"
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Etiquetas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "cover" ? null : "cover")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeTab === "cover"
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>
                Capa{" "}
                {coverColor
                  ? coverSize === "full"
                    ? "(Total)"
                    : "(Faixa colorida)"
                  : "(Sem cor)"}
              </span>
            </button>

            {/* Sticker / Small PNG Image Action Button */}
            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === "sticker" ? null : "sticker")
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeTab === "sticker"
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Sticker / PNG {sticker ? "(Ativo)" : ""}
              </span>
            </button>
          </div>

          {/* STICKER / SMALL PNG SELECTOR PANEL */}
          {activeTab === "sticker" && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                    Sticker / Imagem Pequena (PNG)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Imagens são limitadas a escala compacta (máx. 28px) para não deformar o tamanho do cartão
                  </p>
                </div>
                {sticker && (
                  <button
                    type="button"
                    onClick={handleRemoveSticker}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Remover sticker
                  </button>
                )}
              </div>

              {/* Active Sticker Preview */}
              {sticker && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-10 rounded-lg bg-slate-800 flex items-center justify-center p-1 border border-slate-700">
                      {renderCardSticker(sticker, "w-9 h-8 transform -rotate-6")}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Sticker Selecionado
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {sticker.type === "custom"
                          ? sticker.name || "Imagem personalizada"
                          : "Sticker Retrô do Trello"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveSticker}
                    className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}

              {/* Option A: Upload PNG from computer */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Carregar PNG do seu Computador
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      Selecione um arquivo .png, .jpg ou .webp com ícone ou ilustração
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleUploadCustomSticker}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
                >
                  Selecionar Arquivo
                </button>
              </div>

              {/* Option B: Built-in Retro Computers & Icons */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Ou escolha um Sticker Retrô do Trello:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {BUILTIN_STICKERS.map((s) => {
                    const isSelected =
                      sticker?.type === "builtin" && sticker?.id === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectBuiltinSticker(s.id)}
                        title={s.name}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-900 shadow-md"
                            : "border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900"
                        }`}
                      >
                        <div className="h-10 flex items-center justify-center mb-1">
                          {renderCardSticker({ type: "builtin", id: s.id }, "w-9 h-8")}
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center">
                          {s.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* COVER SELECTOR PANEL (All 3 Trello display modes: Full, Faixa Colorida, None) */}
          {activeTab === "cover" && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Configuração de Capa
                </span>
                {coverColor && (
                  <button
                    type="button"
                    onClick={() => handleSetCoverMode("none")}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Remover capa
                  </button>
                )}
              </div>

              {/* 3 COVER DISPLAY MODES */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                  Formato de Visualização da Capa:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Mode 1: Sem Capa */}
                  <button
                    type="button"
                    onClick={() => handleSetCoverMode("none")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                      !coverColor
                        ? "border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-900 shadow-md"
                        : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="w-14 h-9 rounded-lg border border-slate-700 bg-slate-800/80 flex items-center justify-center mb-1.5 shadow-inner">
                      <span className="text-[10px] text-slate-500 italic">
                        Sem cor
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      1. Sem Cor
                    </span>
                    <span className="text-[10px] text-slate-400 text-center">
                      Cartão padrão escuro
                    </span>
                  </button>

                  {/* Mode 2: Faixa Colorida no Topo */}
                  <button
                    type="button"
                    onClick={() => handleSetCoverMode("normal")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                      coverColor && coverSize === "normal"
                        ? "border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-900 shadow-md"
                        : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="w-14 h-9 rounded-lg border border-slate-700 bg-slate-800 overflow-hidden flex flex-col mb-1.5 shadow-inner">
                      <div
                        className="relative h-2.5 w-full overflow-hidden"
                        style={{
                          backgroundColor: activeCoverObj
                            ? activeCoverObj.bg
                            : "#22a06b"
                        }}
                      >
                        <div className="absolute inset-y-0 left-0 w-2 border-r border-black/15 bg-black/15 text-white/85 overflow-hidden pointer-events-none">
                          <TrelloPatternStrip
                            color={coverColor || "green"}
                            className="w-full h-full block"
                          />
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-800 p-1 flex items-center">
                        <div className="w-7 h-1 bg-slate-600 rounded-sm" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      2. Faixa Colorida
                    </span>
                    <span className="text-[10px] text-slate-400 text-center">
                      Faixa colorida no topo
                    </span>
                  </button>

                  {/* Mode 3: Cor em Todo o Cartão (100% Full) */}
                  <button
                    type="button"
                    onClick={() => handleSetCoverMode("full")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                      coverColor && coverSize === "full"
                        ? "border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-900 shadow-md"
                        : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
                    }`}
                  >
                    <div
                      className="w-14 h-9 rounded-lg border border-slate-700 overflow-hidden flex items-stretch mb-1.5 shadow-inner"
                      style={{
                        backgroundColor: activeCoverObj
                          ? activeCoverObj.bg
                          : "#22a06b"
                      }}
                    >
                      <div className="w-3 bg-black/20 border-r border-black/15 overflow-hidden pointer-events-none">
                        <TrelloPatternStrip
                          color={coverColor || "green"}
                          className="w-full h-full block"
                        />
                      </div>
                      <div className="flex-1 p-1 flex items-center">
                        <div className="w-7 h-1 bg-white/70 rounded-sm" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      3. Cor Total
                    </span>
                    <span className="text-[10px] text-slate-400 text-center">
                      Cor em todo o cartão
                    </span>
                  </button>
                </div>
              </div>

              {/* 20-COLOR PALETTE */}
              <div className="space-y-2 pt-1 border-t border-slate-700/80">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Escolha a Cor (10 famílias, 2 tons com desenho acessível):
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {TRELLO_COLOR_PALETTE.map((colorObj) => {
                    const isSelected = coverColor === colorObj.id
                    return (
                      <button
                        key={colorObj.id}
                        type="button"
                        onClick={() => handleSelectCoverColor(colorObj.id)}
                        title={`${colorObj.label} (${colorObj.family})`}
                        style={{ backgroundColor: colorObj.bg }}
                        className={`h-8 rounded-lg relative flex items-center justify-between px-1.5 transition-transform hover:scale-105 shadow-sm border ${
                          isSelected
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 border-white"
                            : "border-transparent opacity-90 hover:opacity-100"
                        }`}
                      >
                        <TrelloPatternIcon
                          color={colorObj.id}
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
            </div>
          )}

          {/* LABELS SELECTOR PANEL (Trello Exact Model with Checkboxes & Patterns) */}
          {activeTab === "labels" && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Etiquetas do Quadro
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingLabel(!isCreatingLabel)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {isCreatingLabel ? "Cancelar" : "+ Nova Etiqueta"}
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar etiquetas..."
                  value={labelSearch}
                  onChange={(e) => setLabelSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Form to create new board label */}
              {isCreatingLabel && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2.5">
                  <input
                    type="text"
                    placeholder="Título da etiqueta..."
                    value={newLabelTitle}
                    onChange={(e) => setNewLabelTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {TRELLO_COLOR_PALETTE.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewLabelColorId(c.id)}
                        style={{ backgroundColor: c.bg }}
                        className={`h-6 rounded flex items-center justify-center ${
                          newLabelColorId === c.id
                            ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900"
                            : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        <TrelloPatternIcon
                          color={c.id}
                          className="w-3 h-3 text-white/80"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingLabel(false)}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateLabelSubmit}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded font-medium hover:bg-indigo-500"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* List of labels with checkboxes and patterns */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredBoardLabels.map((lbl) => {
                  const labelKey = lbl.id || lbl.name
                  const isChecked = labels.some(
                    (l) => (l.id || l.name) === labelKey
                  )
                  const colorObj = getTrelloColor(lbl.color)

                  return (
                    <div
                      key={lbl.id || lbl.name}
                      onClick={() => handleToggleCardLabel(lbl)}
                      className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-700/40 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />

                      <div
                        style={{
                          backgroundColor: colorObj.bg,
                          color: colorObj.text
                        }}
                        className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-transform active:scale-[0.99]"
                      >
                        <TrelloPatternIcon
                          color={lbl.color}
                          className="w-4 h-4 opacity-80 flex-shrink-0"
                        />
                        <span className="truncate">{lbl.name || "•"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Labels Display on Card */}
          {labels.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Etiquetas Ativas
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {labels.map((lbl) => {
                  const colorObj = getTrelloColor(lbl.color)
                  return (
                    <span
                      key={lbl.id || lbl.name}
                      style={{
                        backgroundColor: colorObj.bg,
                        color: colorObj.text
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm"
                    >
                      <TrelloPatternIcon
                        color={lbl.color}
                        className="w-3.5 h-3.5 opacity-80"
                      />
                      <span>{lbl.name || "•"}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCardLabel(lbl)}
                        className="hover:opacity-75 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Due Date Row */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data de Entrega
            </span>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={due}
                onChange={(e) => {
                  setDue(e.target.value)
                  handleAutoSave({
                    due: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null
                  })
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
              {due && (
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dueComplete}
                    onChange={(e) => {
                      setDueComplete(e.target.checked)
                      handleAutoSave({ dueComplete: e.target.checked })
                    }}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Concluído</span>
                </label>
              )}
            </div>
          </div>

          {/* Description Section with Markdown Preview / Code Toggle */}
          <div>
            <MarkdownViewer
              value={desc}
              savedValue={confirmedDesc}
              hasPendingChanges={hasPendingChanges}
              onChange={handleDescChange}
              onSave={handleConfirmSaveDesc}
              onCancel={handleCancelDesc}
              linkSizes={linkSizes}
              onUpdateLinkSize={handleUpdateLinkSize}
              placeholder='Torne sua descrição ainda melhor. Digite "/" para inserir conteúdo, formatação e muito mais.'
              allowUpload={true}
            />
          </div>

          {/* Checklists Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-semibold text-slate-200">
                  Checklists ({checklists.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingChecklist(!isAddingChecklist)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Checklist</span>
              </button>
            </div>

            {/* New Checklist Form */}
            {isAddingChecklist && (
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                <input
                  type="text"
                  placeholder="Nome do checklist..."
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingChecklist(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateChecklist}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium"
                  >
                    Criar
                  </button>
                </div>
              </div>
            )}

            {/* Checklists List */}
            {checklists.map((cl) => {
              const items = cl.checkItems || []
              const completedCount = items.filter(
                (item) => item.state === "complete"
              ).length
              const progressPct =
                items.length > 0
                  ? Math.round((completedCount / items.length) * 100)
                  : 0

              return (
                <div
                  key={cl.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      {cl.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(cl.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-700/50"
                      title="Excluir checklist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-semibold text-slate-400 w-7">
                      {progressPct}%
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          progressPct === 100
                            ? "bg-emerald-500"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Check Items */}
                  <div className="space-y-1 pt-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-start gap-2 p-1 rounded-lg hover:bg-slate-700/40 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleCheckItem(cl.id, item.id)
                          }
                          className="mt-0.5 text-slate-400 hover:text-indigo-400"
                        >
                          {item.state === "complete" ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-xs leading-tight ${
                            item.state === "complete"
                              ? "line-through text-slate-500"
                              : "text-slate-200"
                          }`}
                        >
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCheckItem(cl.id, item.id)
                          }
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Check Item Input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Adicionar item..."
                      value={newCheckItemText[cl.id] || ""}
                      onChange={(e) =>
                        setNewCheckItemText((prev) => ({
                          ...prev,
                          [cl.id]: e.target.value
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCheckItem(cl.id)
                        }
                      }}
                      className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCheckItem(cl.id)}
                      className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-3.5 px-6 bg-slate-950/60 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              confirmDeleteToast({
                message: `Excluir definitivamente o cartão "${card.title}"?`,
                title: "Excluir Cartão",
                onConfirm: () => {
                  onDelete(card.id)
                  onClose()
                },
                successMessage: "Cartão excluído com sucesso!"
              })
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1 px-2.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Cartão</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  )
}
