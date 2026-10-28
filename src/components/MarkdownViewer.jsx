import React, { useState, useRef, useEffect, useMemo } from "react"
import { AlignLeft, FileText, Check, Undo2, Pencil } from "lucide-react"
import { notifySuccess, notifyError } from "../utils/toastUtils"
import { MarkdownUploadModal } from "./MarkdownUploadModal"
import { LinkPreviewCard, normalizeLinkKey } from "./LinkPreviewCard"
import { MarkdownToolbar } from "./MarkdownToolbar"
import { MarkdownSlashMenu } from "./MarkdownSlashMenu"
import { MarkdownHelpModal } from "./MarkdownHelpModal"
import {
  markdownToHtml,
  domToMarkdown,
  cleanMarkdownOutput,
  applyMarkdownFormat,
  detectSlashCommand,
  SLASH_COMMANDS,
  extractLinksFromMarkdown
} from "../utils/markdownEditorUtils"

/**
 * MarkdownViewer provides an interactive WYSIWYG visual editor and markdown viewer
 * Features:
 * - Live visual editing: user types and always sees the formatted result live
 * - Rich formatting toolbar (Tt, B, I, Lists, Code, Quote, Links, Images, etc.)
 * - Slash command "/" menu with autocomplete and keyboard navigation
 * - Live interactive link preview cards with p, m, g sizes
 * - Raw markdown code mode toggleable via M↓
 * @param {Object} props - Component properties
 * @param {string} props.value - Raw markdown string
 * @param {Function} props.onChange - Change handler callback
 * @param {Function} [props.onSave] - Save on blur/exit callback
 * @param {Object} [props.linkSizes={}] - Saved link preview sizes from card metadata
 * @param {Function} [props.onUpdateLinkSize] - Callback when a link size preference is changed
 * @param {string} [props.placeholder="Torne sua descrição ainda melhor. Digite \"/\" para inserir conteúdo, formatação e muito mais."] - Empty state placeholder
 * @param {boolean} [props.allowUpload=true] - Whether to allow loading .md files from disk
 * @returns {JSX.Element} Rendered visual editor and markdown previewer
 */
export const MarkdownViewer = ({
  value = "",
  savedValue = "",
  hasPendingChanges = false,
  onChange,
  onSave,
  onCancel,
  linkSizes = {},
  onUpdateLinkSize,
  placeholder = 'Torne sua descrição ainda melhor. Digite "/" para inserir conteúdo, formatação e muito mais.',
  allowUpload = true
}) => {
  // Mode: "visual" (WYSIWYG live editing - default) vs "code" (raw markdown textarea)
  const [viewMode, setViewMode] = useState("visual")
  // Edit mode in visual preview: false = view-only (selectable & clickable links); true = editing
  const [isEditing, setIsEditing] = useState(false)
  const [slashState, setSlashState] = useState({
    isOpen: false,
    query: "",
    slashStart: 0
  })
  const [slashIndex, setSlashIndex] = useState(0)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [pendingText, setPendingText] = useState("")

  const editableRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const editorContainerRef = useRef(null)
  const isInternalChangeRef = useRef(false)
  const lastHtmlRef = useRef("")

  // Backup baseline: prefer savedValue from card, fallback to initial value
  const initialBaseline = savedValue !== undefined && savedValue !== null ? savedValue : value
  const [backupValue, setBackupValue] = useState(initialBaseline)
  const backupValueRef = useRef(initialBaseline)

  // Sync backup baseline when savedValue changes from outside
  useEffect(() => {
    if (savedValue !== undefined && savedValue !== null) {
      backupValueRef.current = savedValue
      setBackupValue(savedValue)
    }
  }, [savedValue])

  const effectiveBaseline = savedValue !== undefined && savedValue !== null ? savedValue : backupValue
  const hasUnsavedChanges = hasPendingChanges || value !== effectiveBaseline

  /**
   * Toggles edit mode in visual preview
   */
  const handleToggleEdit = () => {
    setIsEditing((prev) => {
      const next = !prev
      if (next) {
        setTimeout(() => {
          editableRef.current?.focus()
        }, 50)
      }
      return next
    })
  }

  /**
   * Handles opening links when clicked in view-only preview mode
   * @param {React.MouseEvent<HTMLDivElement>} e - Click event
   */
  const handleContentClick = (e) => {
    if (!isEditing) {
      const link = e.target.closest("a")
      if (link && link.href) {
        e.preventDefault()
        window.open(link.href, "_blank", "noopener,noreferrer")
      }
    }
  }

  /**
   * Saves changes to card and updates backup baseline with confirmation toast
   */
  const handleSave = () => {
    if (!hasUnsavedChanges) {
      return
    }
    backupValueRef.current = value
    setBackupValue(value)
    onSave?.(value)
    setIsEditing(false)
    notifySuccess("Alterações salvas com sucesso!")
  }

  /**
   * Reverts all changes back to backup baseline with confirmation toast
   */
  const handleCancel = () => {
    if (!hasUnsavedChanges) {
      notifySuccess("Nenhuma alteração para desfazer.")
      setIsEditing(false)
      return
    }

    const previous = effectiveBaseline
    onChange(previous)
    if (onCancel) {
      onCancel()
    } else {
      onSave?.(previous)
    }

    // Synchronize visual contentEditable DOM
    if (editableRef.current) {
      isInternalChangeRef.current = false
      const html = markdownToHtml(previous)
      editableRef.current.innerHTML = html
      lastHtmlRef.current = html
    }

    setIsEditing(false)
    notifySuccess("Alterações canceladas. Versão anterior restaurada!")
  }

  /**
   * Synchronize value from outside (markdown) into contentEditable HTML
   */
  useEffect(() => {
    if (viewMode !== "visual") {
      return
    }
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false
      return
    }
    const html = markdownToHtml(value)
    if (editableRef.current && editableRef.current.innerHTML !== html) {
      editableRef.current.innerHTML = html
      lastHtmlRef.current = html
    }
  }, [value, viewMode])

  /**
   * Filtered commands for the slash command popup menu
   */
  const filteredSlashCommands = useMemo(() => {
    if (!slashState.isOpen || !slashState.query) {
      return SLASH_COMMANDS
    }
    const q = slashState.query.toLowerCase()
    return SLASH_COMMANDS.filter((cmd) => {
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
      )
    })
  }, [slashState.isOpen, slashState.query])

  /**
   * Extracts links present in the content to render interactive preview cards
   */
  const extractedLinks = useMemo(() => {
    return extractLinksFromMarkdown(value)
  }, [value])

  /**
   * Closes slash menu when clicking outside
   */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(e.target)
      ) {
        if (slashState.isOpen) {
          setSlashState({ isOpen: false, query: "", slashStart: 0 })
        }
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [slashState.isOpen])

  /**
   * Persists link preview size directly into the card data
   * @param {string} targetUrl - URL to update
   * @param {string} newSize - "p" | "m" | "g"
   */
  const handleUpdateLinkSize = (targetUrl, newSize) => {
    if (onUpdateLinkSize) {
      onUpdateLinkSize(targetUrl, newSize)
    }
  }

  /**
   * Extracts markdown from visual contentEditable on input
   */
  const handleVisualInput = () => {
    if (!editableRef.current) {
      return
    }
    isInternalChangeRef.current = true
    const md = cleanMarkdownOutput(domToMarkdown(editableRef.current))
    onChange(md)
  }

  /**
   * Syncs content on blur from visual contentEditable without overwriting backup
   */
  const handleVisualBlur = () => {
    if (!editableRef.current) {
      return
    }
    const md = cleanMarkdownOutput(domToMarkdown(editableRef.current))
    onChange(md)
  }

  /**
   * Applies formatting from toolbar buttons
   * @param {string} action - Action identifier
   * @param {Object} [payload={}] - Additional payload
   */
  const handleFormat = (action, payload = {}) => {
    if (viewMode === "code") {
      const textarea = textareaRef.current
      const selStart = textarea ? textarea.selectionStart : value.length
      const selEnd = textarea ? textarea.selectionEnd : value.length
      const result = applyMarkdownFormat(value, selStart, selEnd, action, payload)
      onChange(result.text)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(
            result.newCursorStart,
            result.newCursorEnd
          )
        }
      }, 10)
      return
    }

    // In visual (WYSIWYG) mode:
    if (editableRef.current) {
      editableRef.current.focus()
    }

    switch (action) {
      case "bold":
        document.execCommand("bold", false, null)
        break
      case "italic":
        document.execCommand("italic", false, null)
        break
      case "strike":
        document.execCommand("strikeThrough", false, null)
        break
      case "code_inline": {
        const sel = window.getSelection()
        const text = sel ? sel.toString() : "código"
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
        document.execCommand(
          "insertHTML",
          false,
          `<code class="px-1.5 py-0.5 text-[11px] font-mono text-indigo-300 bg-slate-950/90 border border-slate-800 rounded-md font-medium">${escaped}</code>`
        )
        break
      }
      case "code_block": {
        const sel = window.getSelection()
        const text =
          sel && sel.toString().trim() ? sel.toString() : "npm install"
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
        document.execCommand(
          "insertHTML",
          false,
          `<pre class="bg-slate-950 border border-slate-800 rounded-xl p-3 my-2 text-xs font-mono text-slate-200"><code>${escaped}</code></pre><p><br></p>`
        )
        break
      }
      case "heading": {
        const level = payload.level || 1
        document.execCommand("formatBlock", false, `<h${level}>`)
        break
      }
      case "normal_text": {
        document.execCommand("formatBlock", false, "<p>")
        break
      }
      case "list_bullet": {
        document.execCommand("insertUnorderedList", false, null)
        break
      }
      case "list_ordered": {
        document.execCommand("insertOrderedList", false, null)
        break
      }
      case "list_todo": {
        document.execCommand(
          "insertHTML",
          false,
          `<div class="flex items-center gap-2 my-1"><input type="checkbox" class="rounded border-slate-700 text-indigo-600 pointer-events-none" /> <span class="text-slate-300">Nova tarefa</span></div><p><br></p>`
        )
        break
      }
      case "quote": {
        document.execCommand("formatBlock", false, "<blockquote>")
        break
      }
      case "divider": {
        document.execCommand("insertHorizontalRule", false, null)
        break
      }
      case "table": {
        document.execCommand(
          "insertHTML",
          false,
          `<table class="w-full text-xs text-slate-300 border border-slate-700 border-collapse my-2"><thead><tr><th class="border border-slate-700 bg-slate-800/90 px-2 py-1 text-left font-semibold">Coluna 1</th><th class="border border-slate-700 bg-slate-800/90 px-2 py-1 text-left font-semibold">Coluna 2</th></tr></thead><tbody><tr><td class="border border-slate-800 px-2 py-1">Item 1</td><td class="border border-slate-800 px-2 py-1">Item 2</td></tr></tbody></table><p><br></p>`
        )
        break
      }
      case "link": {
        const url = prompt("Digite ou cole a URL do link:", "https://")
        if (url && url.trim()) {
          document.execCommand("createLink", false, url.trim())
        }
        break
      }
      case "image": {
        const url = prompt("Digite ou cole a URL da imagem:", "https://")
        if (url && url.trim()) {
          document.execCommand("insertImage", false, url.trim())
        }
        break
      }
      default:
        break
    }

    handleVisualInput()
  }

  /**
   * Applies selected command from slash menu in visual or code mode
   * @param {Object} cmd - Command object
   */
  const handleSelectSlashCommand = (cmd) => {
    if (viewMode === "code") {
      const textarea = textareaRef.current
      const cursor = textarea ? textarea.selectionStart : value.length
      const start = slashState.slashStart
      const beforeSlash = value.slice(0, start)
      const afterCursor = value.slice(cursor)
      const baseContent = beforeSlash + afterCursor

      setSlashState({ isOpen: false, query: "", slashStart: 0 })
      const result = applyMarkdownFormat(
        baseContent,
        start,
        start,
        cmd.action,
        cmd.payload
      )
      onChange(result.text)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(
            result.newCursorStart,
            result.newCursorEnd
          )
        }
      }, 10)
      return
    }

    // In visual (WYSIWYG) mode:
    const selection = window.getSelection()
    if (selection && selection.focusNode) {
      const textNode = selection.focusNode
      const offset = selection.focusOffset
      const text = textNode.textContent || ""
      const start = slashState.slashStart
      const beforeSlash = text.slice(0, start)
      const afterCursor = text.slice(offset)
      textNode.textContent = beforeSlash + afterCursor
    }

    setSlashState({ isOpen: false, query: "", slashStart: 0 })
    handleFormat(cmd.action, cmd.payload)
  }

  /**
   * Detects slash command trigger on key up in visual contentEditable
   * @param {React.KeyboardEvent<HTMLDivElement>} e - Keyup event
   */
  const handleVisualKeyUp = (e) => {
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === "Escape"
    ) {
      return
    }

    const selection = window.getSelection()
    if (!selection || !selection.focusNode) {
      return
    }

    const text = selection.focusNode.textContent || ""
    const offset = selection.focusOffset
    const textBefore = text.slice(0, offset)

    const match = textBefore.match(/(?:^|\n|\s)\/([a-zA-Z0-9_\u00C0-\u00FF]*)$/)
    if (match) {
      setSlashState({
        isOpen: true,
        query: match[1].toLowerCase(),
        slashStart:
          offset - match[0].length + (match[0].startsWith("/") ? 0 : 1)
      })
      setSlashIndex(0)
    } else if (slashState.isOpen) {
      setSlashState({ isOpen: false, query: "", slashStart: 0 })
    }
  }

  /**
   * Handles special key events in visual contentEditable (slash menu and shortcuts)
   * @param {React.KeyboardEvent<HTMLDivElement>} e - Keydown event
   */
  const handleVisualKeyDown = (e) => {
    // Slash menu navigation
    if (slashState.isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSlashIndex((prev) =>
          filteredSlashCommands.length
            ? (prev + 1) % filteredSlashCommands.length
            : 0
        )
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSlashIndex((prev) =>
          filteredSlashCommands.length
            ? (prev - 1 + filteredSlashCommands.length) %
              filteredSlashCommands.length
            : 0
        )
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        if (filteredSlashCommands[slashIndex]) {
          handleSelectSlashCommand(filteredSlashCommands[slashIndex])
        }
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setSlashState({ isOpen: false, query: "", slashStart: 0 })
        return
      }
    }

    // Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link)
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault()
        handleFormat("bold")
        return
      }
      if (e.key === "i" || e.key === "I") {
        e.preventDefault()
        handleFormat("italic")
        return
      }
      if (e.key === "k" || e.key === "K") {
        e.preventDefault()
        handleFormat("link")
        return
      }
    }
  }

  /**
   * Handles text changes and detects slash command in raw code mode
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Textarea event
   */
  const handleCodeChange = (e) => {
    const newVal = e.target.value
    const cursor = e.target.selectionStart
    onChange(newVal)

    const slash = detectSlashCommand(newVal, cursor)
    if (slash) {
      setSlashState({
        isOpen: true,
        query: slash.query,
        slashStart: slash.slashStart
      })
      setSlashIndex(0)
    } else if (slashState.isOpen) {
      setSlashState({ isOpen: false, query: "", slashStart: 0 })
    }
  }

  /**
   * Handles key down in raw code mode
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - Keydown event
   */
  const handleCodeKeyDown = (e) => {
    if (slashState.isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSlashIndex((prev) =>
          filteredSlashCommands.length
            ? (prev + 1) % filteredSlashCommands.length
            : 0
        )
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSlashIndex((prev) =>
          filteredSlashCommands.length
            ? (prev - 1 + filteredSlashCommands.length) %
              filteredSlashCommands.length
            : 0
        )
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        if (filteredSlashCommands[slashIndex]) {
          handleSelectSlashCommand(filteredSlashCommands[slashIndex])
        }
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setSlashState({ isOpen: false, query: "", slashStart: 0 })
        return
      }
    }
  }

  /**
   * Toggles between visual WYSIWYG mode and raw markdown code mode
   */
  const handleToggleMode = () => {
    if (viewMode === "visual") {
      setViewMode("code")
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
    } else {
      setViewMode("visual")
      onSave?.(value)
      setTimeout(() => {
        editableRef.current?.focus()
      }, 50)
    }
  }

  /**
   * Handles local .md or .txt file upload from user's computer
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input event
   */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") {
        setPendingFile(file)
        setPendingText(text)
        setIsUploadModalOpen(true)
      }
    }
    reader.onerror = () => {
      notifyError("Erro ao ler o arquivo selecionado")
    }
    reader.readAsText(file)

    e.target.value = ""
  }

  /**
   * Appends uploaded file to the bottom
   */
  const handleConfirmAppend = () => {
    if (!pendingFile || typeof pendingText !== "string") {
      return
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
    const timeStr = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
    const headerTitle = `### 📄 ${pendingFile.name} — ${dateStr} às ${timeStr}`
    const separator = "---"

    let updatedText = ""
    if (value && value.trim()) {
      updatedText = `${value.trim()}\n\n${separator}\n${headerTitle}\n\n${pendingText.trim()}`
    } else {
      updatedText = `${separator}\n${headerTitle}\n\n${pendingText.trim()}`
    }

    onChange(updatedText)
    onSave?.(updatedText)
    setIsUploadModalOpen(false)
    setPendingFile(null)
    setPendingText("")
    notifySuccess(`Arquivo "${pendingFile.name}" adicionado ao final!`)
  }

  /**
   * Replaces existing content with the uploaded file
   */
  const handleConfirmReplace = () => {
    if (!pendingFile || typeof pendingText !== "string") {
      return
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
    const timeStr = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
    const headerTitle = `### 📄 ${pendingFile.name} — ${dateStr} às ${timeStr}`
    const updatedText = `${headerTitle}\n\n${pendingText.trim()}`

    onChange(updatedText)
    onSave?.(updatedText)
    setIsUploadModalOpen(false)
    setPendingFile(null)
    setPendingText("")
    notifySuccess(`Conteúdo substituído pelo arquivo "${pendingFile.name}"!`)
  }

  const isValueEmpty = !value || !value.trim()

  return (
    <div className="space-y-1.5 select-text">
      {/* Section Header: ☰ Descrição */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <AlignLeft className="w-4 h-4 text-slate-300" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Descrição
          </h3>
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-xs animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Alterações pendentes</span>
            </span>
          )}
        </div>

        {/* View Mode Indicator */}
        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
          {viewMode === "visual" ? "Preview" : "Markdown"}
        </span>
      </div>

      {/* Hidden File Input for .md upload */}
      {allowUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      )}

      {/* Main Container with Trello Editor Toolbar */}
      <div
        ref={editorContainerRef}
        className="rounded-xl border border-slate-700/80 bg-slate-900/80 overflow-hidden shadow-inner focus-within:border-indigo-500/80 transition-colors"
      >
        {/* Top Formatting Toolbar */}
        <MarkdownToolbar
          onFormat={handleFormat}
          onUploadClick={
            allowUpload ? () => fileInputRef.current?.click() : undefined
          }
          onToggleView={handleToggleMode}
          viewMode={viewMode}
          onHelpClick={() => setIsHelpModalOpen(true)}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
        />

        {/* Editor Body */}
        {viewMode === "visual" ? (
          <div className="relative">
            {/* Slash Command Popup Menu (only available during active editing) */}
            {isEditing && slashState.isOpen && (
              <MarkdownSlashMenu
                commands={filteredSlashCommands}
                selectedIndex={slashIndex}
                onSelect={handleSelectSlashCommand}
              />
            )}

            {/* Empty state prompt when not in edit mode */}
            {isValueEmpty && !isEditing && (
              <div
                onClick={handleToggleEdit}
                className="p-4 text-xs text-slate-500 hover:text-slate-400 transition-colors italic cursor-pointer select-none bg-slate-950/20 rounded-lg border border-dashed border-slate-800 hover:border-slate-700 m-3 flex items-center justify-between group"
              >
                <span>{placeholder}</span>
                <span className="text-[11px] font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 shrink-0 ml-2">
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </span>
              </div>
            )}

            {/* Empty state placeholder overlay while editing */}
            {isValueEmpty && isEditing && (
              <div
                onClick={() => editableRef.current?.focus()}
                className="absolute top-3 left-3 right-3 text-xs text-slate-500 pointer-events-none select-none italic"
              >
                {placeholder}
              </div>
            )}

            {/* Visual content area (editable when isEditing === true; select-text & clickable links when not) */}
            {(!isValueEmpty || isEditing) && (
              <div
                ref={editableRef}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onInput={isEditing ? handleVisualInput : undefined}
                onBlur={isEditing ? handleVisualBlur : undefined}
                onKeyDown={isEditing ? handleVisualKeyDown : undefined}
                onKeyUp={isEditing ? handleVisualKeyUp : undefined}
                onClick={handleContentClick}
                className={`min-h-[100px] max-h-[480px] overflow-y-auto p-3 text-xs leading-relaxed focus:outline-none selection:bg-indigo-500/30 text-slate-200 select-text ${
                  isEditing ? "cursor-text" : "cursor-default"
                }`}
              />
            )}

            {/* Interactive Link Previews Section (when links exist in content) */}
            {extractedLinks.length > 0 && (
              <div className="border-t border-slate-800/80 bg-slate-950/40 p-2.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Previews de Links no Cartão ({extractedLinks.length})</span>
                </div>
                <div className="space-y-1.5">
                  {extractedLinks.map((link) => {
                    const linkKey = normalizeLinkKey(link.url)
                    const currentSize =
                      linkSizes?.[linkKey] || linkSizes?.[link.url] || null
                    return (
                      <LinkPreviewCard
                        key={link.url}
                        href={link.url}
                        cardSize={currentSize}
                        onUpdateSize={handleUpdateLinkSize}
                      >
                        {link.label}
                      </LinkPreviewCard>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Visual Editor Bottom Actions Bar (displayed during editing OR when there are pending changes) */}
            {(isEditing || hasUnsavedChanges) && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 select-none">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Digite{" "}
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-1 py-0.5 rounded border border-indigo-500/30">
                        /
                      </span>{" "}
                      para comandos rápidos
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Modo de visualização
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Fechar edição sem descartar as alterações pendentes"
                    >
                      Fechar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={!hasUnsavedChanges}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      hasUnsavedChanges
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-xs cursor-pointer"
                        : "bg-slate-900/60 text-slate-600 border border-slate-800/60 cursor-not-allowed"
                    }`}
                    title={
                      hasUnsavedChanges
                        ? "Desfazer alterações e voltar à versão anterior"
                        : "Nenhuma alteração para desfazer"
                    }
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      hasUnsavedChanges
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                        : "bg-slate-900/60 text-slate-600 border border-slate-800/60 cursor-not-allowed"
                    }`}
                    title={
                      hasUnsavedChanges
                        ? "Salvar alterações no cartão"
                        : "Nenhuma alteração para salvar"
                    }
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Raw Markdown Code Mode */
          <div className="relative">
            {/* Slash Command Popup Menu */}
            {slashState.isOpen && (
              <MarkdownSlashMenu
                commands={filteredSlashCommands}
                selectedIndex={slashIndex}
                onSelect={handleSelectSlashCommand}
              />
            )}

            <textarea
              ref={textareaRef}
              rows={8}
              value={value}
              onChange={handleCodeChange}
              onKeyDown={handleCodeKeyDown}
              onBlur={() => onSave?.(value)}
              placeholder={placeholder}
              className="w-full p-3 text-xs font-mono bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Markdown
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!hasUnsavedChanges}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    hasUnsavedChanges
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-xs cursor-pointer"
                      : "bg-slate-900/60 text-slate-600 border border-slate-800/60 cursor-not-allowed"
                  }`}
                  title="Desfazer alterações e voltar à versão anterior"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    hasUnsavedChanges
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                      : "bg-slate-900/60 text-slate-600 border border-slate-800/60 cursor-not-allowed"
                  }`}
                  title={
                    hasUnsavedChanges
                      ? "Salvar alterações no cartão"
                      : "Nenhuma alteração para salvar"
                  }
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("visual")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors ml-1"
                >
                  Voltar ao Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Markdown Upload Modal */}
      <MarkdownUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          setPendingFile(null)
          setPendingText("")
        }}
        file={pendingFile}
        hasExistingContent={Boolean(value && value.trim())}
        onAppend={handleConfirmAppend}
        onReplace={handleConfirmReplace}
      />

      {/* Markdown Help & Shortcuts Modal */}
      <MarkdownHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
