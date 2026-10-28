import React, { useEffect, useRef } from "react"
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Code,
  Code2,
  Quote,
  Minus,
  Link2,
  ImageIcon
} from "lucide-react"

const ICON_MAP = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Code,
  Code2,
  Quote,
  Minus,
  Link2,
  ImageIcon
}

/**
 * MarkdownSlashMenu renders the floating slash command popup menu
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.commands - List of filtered commands
 * @param {number} props.selectedIndex - Currently highlighted index
 * @param {Function} props.onSelect - Callback on selection
 * @returns {JSX.Element|null} Rendered slash command popup
 */
export const MarkdownSlashMenu = ({
  commands = [],
  selectedIndex = 0,
  onSelect
}) => {
  const listRef = useRef(null)

  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) {
      return
    }
    const activeItem = listEl.querySelector(`[data-index="${selectedIndex}"]`)
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  if (!commands || commands.length === 0) {
    return (
      <div className="absolute top-10 left-3 z-50 w-72 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-3 text-center text-xs text-slate-400 backdrop-blur-md">
        Nenhum comando correspondente encontrado
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="absolute top-10 left-3 z-50 w-80 max-h-72 overflow-y-auto rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1.5 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
        Blocos Básicos & Formatação
      </div>
      <div className="space-y-0.5">
        {commands.map((cmd, idx) => {
          const IconComp = ICON_MAP[cmd.icon] || Type
          const isSelected = idx === selectedIndex

          return (
            <div
              key={cmd.id}
              data-index={idx}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(cmd)
              }}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                isSelected
                  ? "bg-indigo-600/30 text-white border-l-2 border-indigo-400 pl-2"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? "bg-indigo-600/40 border-indigo-400/50 text-indigo-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-200 leading-tight truncate">
                  {cmd.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight">
                  {cmd.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
