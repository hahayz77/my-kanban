import React, { useState, useEffect, useRef } from "react"
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Code2,
  List,
  ListOrdered,
  ListTodo,
  Link2,
  ImageIcon,
  Plus,
  Quote,
  Minus,
  Table,
  Paperclip,
  HelpCircle,
  ChevronDown,
  Pencil
} from "lucide-react"

/**
 * MarkdownToolbar replicates the Trello rich-markdown formatting toolbar
 * @param {Object} props - Component properties
 * @param {Function} props.onFormat - Format callback (action, payload)
 * @param {Function} props.onUploadClick - Trigger file upload
 * @param {Function} props.onToggleView - Toggle preview vs editor
 * @param {string} props.viewMode - "preview" | "editor"
 * @param {Function} props.onHelpClick - Open markdown help modal
 * @returns {JSX.Element} Rendered toolbar
 */
export const MarkdownToolbar = ({
  onFormat,
  onUploadClick,
  onToggleView,
  viewMode = "visual",
  onHelpClick,
  isEditing = false,
  onToggleEdit
}) => {
  const [openDropdown, setOpenDropdown] = useState(null) // "type" | "italic" | "list" | "insert" | null
  const toolbarRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  const handleAction = (action, payload = {}) => {
    setOpenDropdown(null)
    onFormat(action, payload)
  }

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  return (
    <div
      ref={toolbarRef}
      className="relative flex flex-wrap items-center justify-between gap-1 px-2.5 py-1.5 bg-slate-800/90 border-b border-slate-700/80 select-none text-slate-300"
    >
      {/* Left Group: "Editar" button when not editing in visual mode; full formatting tools when editing */}
      {viewMode === "visual" && !isEditing ? (
        <div className="flex items-center gap-1.5 py-0.5">
          <button
            type="button"
            onClick={onToggleEdit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            title="Editar descrição (abre ferramentas de formatação)"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
        {/* 1. Text Type Dropdown (Tt ˅) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("type")}
            className={`flex items-center gap-0.5 px-1.5 py-1 rounded-md text-xs font-semibold hover:bg-slate-700/80 transition-colors ${
              openDropdown === "type" ? "bg-slate-700 text-white" : "text-slate-300"
            }`}
            title="Tipo de texto (Normal, Título 1, 2, 3)"
          >
            <span>Tt</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {openDropdown === "type" && (
            <div className="absolute top-full left-0 mt-1 z-50 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAction("normal_text")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-slate-400" />
                <span>Texto normal</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("heading", { level: 1 })}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors font-bold"
              >
                <Heading1 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Título 1</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("heading", { level: 2 })}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors font-semibold"
              >
                <Heading2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Título 2</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("heading", { level: 3 })}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors font-medium"
              >
                <Heading3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Título 3</span>
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

        {/* 2. Bold (B) */}
        <button
          type="button"
          onClick={() => handleAction("bold")}
          className="w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs hover:bg-slate-700/80 text-slate-200 hover:text-white transition-colors"
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* 3. Italic Dropdown (I ˅) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("italic")}
            className={`flex items-center gap-0.5 px-1 py-1 rounded-md text-xs hover:bg-slate-700/80 transition-colors ${
              openDropdown === "italic" ? "bg-slate-700 text-white" : "text-slate-300"
            }`}
            title="Formatação inline (Itálico, Código inline, Tachado)"
          >
            <Italic className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {openDropdown === "italic" && (
            <div className="absolute top-full left-0 mt-1 z-50 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAction("italic")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors italic"
              >
                <Italic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Itálico</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("code_inline")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-mono"
              >
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Código em linha</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("strike")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors line-through"
              >
                <Strikethrough className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tachado</span>
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

        {/* 4. Lists Dropdown (:≡ ˅) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("list")}
            className={`flex items-center gap-0.5 px-1 py-1 rounded-md text-xs hover:bg-slate-700/80 transition-colors ${
              openDropdown === "list" ? "bg-slate-700 text-white" : "text-slate-300"
            }`}
            title="Listas (Marcadores, Numerada, Tarefas)"
          >
            <List className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {openDropdown === "list" && (
            <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAction("list_bullet")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <List className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lista com marcadores</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("list_ordered")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lista numerada</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("list_todo")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lista de tarefas</span>
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

        {/* 5. Link (🔗) */}
        <button
          type="button"
          onClick={() => handleAction("link")}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
          title="Inserir Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        {/* 6. Image (🖼) */}
        <button
          type="button"
          onClick={() => handleAction("image")}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
          title="Inserir Imagem"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        {/* 7. Insert Block (+ ˅) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("insert")}
            className={`flex items-center gap-0.5 px-1 py-1 rounded-md text-xs hover:bg-slate-700/80 transition-colors ${
              openDropdown === "insert" ? "bg-slate-700 text-white" : "text-slate-300"
            }`}
            title="Mais blocos (Código, Citação, Divisória, Tabela)"
          >
            <Plus className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {openDropdown === "insert" && (
            <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAction("code_block")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-mono"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bloco de código</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("quote")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Quote className="w-3.5 h-3.5 text-indigo-400" />
                <span>Citar</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("divider")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Linha divisória</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("table")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Table className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tabela Markdown</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )}

      {/* Right Side Utility Tools Group */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Attachment / Upload .md (📎) */}
        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
            title="Anexar ou carregar arquivo Markdown (.md)"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Markdown Toggle Mode (M↓) */}
        <button
          type="button"
          onClick={onToggleView}
          className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-tight transition-colors ${
            viewMode === "visual"
              ? "bg-slate-700/80 text-indigo-300 hover:text-white hover:bg-slate-700"
              : "bg-indigo-600 text-white shadow-xs"
          }`}
          title={
            viewMode === "visual"
              ? "Ver Markdown (M↓)"
              : "Ver Preview (M↓)"
          }
        >
          <span>M↓</span>
        </button>

        {/* Help Cheatsheet (?) */}
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
            title="Atalhos e Ajuda de Markdown"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
