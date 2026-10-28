/**
 * Converts Markdown string into styled HTML suitable for contentEditable visual editing
 * @param {string} md - Markdown text
 * @returns {string} Styled HTML string
 */
export const markdownToHtml = (md = "") => {
  if (!md || !md.trim()) {
    return ""
  }

  let html = md

  // 1. Code blocks: ```lang\ncode\n```
  html = html.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .trim()
    return `<pre class="bg-slate-950 border border-slate-800 rounded-xl p-3 my-2 text-xs font-mono text-slate-200"><code>${escaped}</code></pre>`
  })

  // 2. Headings (H1 to H4)
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-semibold text-slate-200 mt-2 mb-1 leading-snug">$1</h4>')
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-indigo-300 mt-3 mb-1.5 leading-snug">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-800/40 leading-snug">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-white mt-2 mb-3 pb-1 border-b border-slate-700/60 leading-tight">$1</h1>')

  // 3. Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-indigo-500 pl-3 my-2 text-xs italic text-slate-400 bg-indigo-500/5 py-1 rounded-r">$1</blockquote>')

  // 4. Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="border-slate-700/60 my-3" />')

  // 5. Checklist items
  html = html.replace(/^- \[([ xX])\] (.*$)/gim, (match, checked, text) => {
    const isChecked = checked.toLowerCase() === "x"
    return `<div class="flex items-center gap-2 my-1"><input type="checkbox" ${isChecked ? "checked" : ""} class="rounded border-slate-700 text-indigo-600 pointer-events-none" /> <span class="${isChecked ? "line-through text-slate-500" : "text-slate-300"}">${text}</span></div>`
  })

  // 6. Bullet lists
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>')

  // 7. Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-300 my-0.5">$1</li>')

  // 8. Inline formatting: bold, italic, strike, inline code
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-slate-400">$1</del>')
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    return `<code class="px-1.5 py-0.5 text-[11px] font-mono text-indigo-300 bg-slate-950/90 border border-slate-800 rounded-md font-medium">${escaped}</code>`
  })

  // 9. Links: [title](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')

  // 10. Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-h-60 rounded-lg my-2 border border-slate-700/60" />')

  // 11. Wrap consecutive <li> into <ul> or <ol>
  html = html.replace(/(<li class="[^"]*list-disc[^"]*"[^>]*>.*?<\/li>\s*)+/g, '<ul class="space-y-0.5 my-1.5 pl-1">$&</ul>')
  html = html.replace(/(<li class="[^"]*list-decimal[^"]*"[^>]*>.*?<\/li>\s*)+/g, '<ol class="space-y-0.5 my-1.5 pl-1">$&</ol>')

  // 12. Paragraphs
  const blocks = html.split(/\n{2,}/).map((block) => {
    const trimmed = block.trim()
    if (!trimmed) {
      return ""
    }
    if (/^<(h[1-6]|pre|blockquote|div|ul|ol|hr|img)/i.test(trimmed)) {
      return trimmed
    }
    return `<p class="mb-2 leading-relaxed text-slate-300">${trimmed.replace(/\n/g, "<br />")}</p>`
  }).filter(Boolean)

  return blocks.join("\n")
}

/**
 * Converts a DOM node from contentEditable back to clean Markdown
 * @param {Node} node - DOM node
 * @returns {string} Markdown text
 */
export const domToMarkdown = (node) => {
  if (!node) {
    return ""
  }

  // Text Node
  if (node.nodeType === 3) {
    return node.textContent
  }

  // Not an element node
  if (node.nodeType !== 1) {
    return ""
  }

  const tag = node.tagName.toLowerCase()
  let inner = ""
  for (const child of node.childNodes) {
    inner += domToMarkdown(child)
  }

  switch (tag) {
    case "h1":
      return `\n# ${inner.trim()}\n\n`
    case "h2":
      return `\n## ${inner.trim()}\n\n`
    case "h3":
      return `\n### ${inner.trim()}\n\n`
    case "h4":
      return `\n#### ${inner.trim()}\n\n`
    case "h5":
      return `\n##### ${inner.trim()}\n\n`
    case "h6":
      return `\n###### ${inner.trim()}\n\n`
    case "strong":
    case "b":
      return inner.trim() ? `**${inner.trim()}**` : ""
    case "em":
    case "i":
      return inner.trim() ? `*${inner.trim()}*` : ""
    case "del":
    case "s":
    case "strike":
      return inner.trim() ? `~~${inner.trim()}~~` : ""
    case "code": {
      if (node.parentNode && node.parentNode.tagName.toLowerCase() === "pre") {
        return inner
      }
      return inner.trim() ? `\`${inner.trim()}\`` : ""
    }
    case "pre":
      return `\n\`\`\`bash\n${inner.trim()}\n\`\`\`\n\n`
    case "blockquote":
      return `\n> ${inner.trim()}\n\n`
    case "hr":
      return `\n---\n\n`
    case "li":
      return `- ${inner.trim()}\n`
    case "ul":
    case "ol":
      return `\n${inner}\n`
    case "p":
      return inner.trim() ? `${inner.trim()}\n\n` : "\n"
    case "br":
      return "\n"
    case "a": {
      const href = node.getAttribute("href") || ""
      return `[${inner.trim() || href}](${href})`
    }
    case "img": {
      const src = node.getAttribute("src") || ""
      const alt = node.getAttribute("alt") || ""
      return `![${alt}](${src})`
    }
    case "div":
      return inner.trim() ? `${inner.trim()}\n` : "\n"
    default:
      return inner
  }
}

/**
 * Sanitizes markdown string from contentEditable extraction
 * @param {string} text - Raw markdown
 * @returns {string} Clean markdown
 */
export const cleanMarkdownOutput = (text = "") => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Applies a markdown formatting action to the text at the current cursor or selection (for raw textarea fallback)
 * @param {string} content - Full markdown content
 * @param {number} selectionStart - Selection start index
 * @param {number} selectionEnd - Selection end index
 * @param {string} action - Action identifier
 * @param {Object} [payload={}] - Additional action payload
 * @returns {{ text: string, newCursorStart: number, newCursorEnd: number }}
 */
export const applyMarkdownFormat = (
  content = "",
  selectionStart = 0,
  selectionEnd = 0,
  action = "",
  payload = {}
) => {
  const selectedText = content.slice(selectionStart, selectionEnd)
  const beforeText = content.slice(0, selectionStart)
  const afterText = content.slice(selectionEnd)

  switch (action) {
    case "bold": {
      if (selectedText.startsWith("**") && selectedText.endsWith("**") && selectedText.length >= 4) {
        const unwrapped = selectedText.slice(2, -2)
        return {
          text: beforeText + unwrapped + afterText,
          newCursorStart: selectionStart,
          newCursorEnd: selectionStart + unwrapped.length
        }
      }
      const wrapped = `**${selectedText || "texto em negrito"}**`
      return {
        text: beforeText + wrapped + afterText,
        newCursorStart: selectionStart,
        newCursorEnd: selectionStart + wrapped.length
      }
    }

    case "italic": {
      if (selectedText.startsWith("*") && selectedText.endsWith("*") && selectedText.length >= 2) {
        const unwrapped = selectedText.slice(1, -1)
        return {
          text: beforeText + unwrapped + afterText,
          newCursorStart: selectionStart,
          newCursorEnd: selectionStart + unwrapped.length
        }
      }
      const wrapped = `*${selectedText || "texto em itálico"}*`
      return {
        text: beforeText + wrapped + afterText,
        newCursorStart: selectionStart,
        newCursorEnd: selectionStart + wrapped.length
      }
    }

    case "strike": {
      if (selectedText.startsWith("~~") && selectedText.endsWith("~~") && selectedText.length >= 4) {
        const unwrapped = selectedText.slice(2, -2)
        return {
          text: beforeText + unwrapped + afterText,
          newCursorStart: selectionStart,
          newCursorEnd: selectionStart + unwrapped.length
        }
      }
      const wrapped = `~~${selectedText || "texto tachado"}~~`
      return {
        text: beforeText + wrapped + afterText,
        newCursorStart: selectionStart,
        newCursorEnd: selectionStart + wrapped.length
      }
    }

    case "code_inline": {
      if (selectedText.startsWith("`") && selectedText.endsWith("`") && selectedText.length >= 2) {
        const unwrapped = selectedText.slice(1, -1)
        return {
          text: beforeText + unwrapped + afterText,
          newCursorStart: selectionStart,
          newCursorEnd: selectionStart + unwrapped.length
        }
      }
      const wrapped = `\`${selectedText || "código"}\``
      return {
        text: beforeText + wrapped + afterText,
        newCursorStart: selectionStart,
        newCursorEnd: selectionStart + wrapped.length
      }
    }

    case "code_block": {
      const code = selectedText || "npm install"
      const block = `\`\`\`bash\n${code}\n\`\`\`\n`
      const prefix = beforeText.endsWith("\n") || !beforeText ? "" : "\n"
      const newText = beforeText + prefix + block + afterText
      const pos = (beforeText + prefix + block).length
      return {
        text: newText,
        newCursorStart: pos,
        newCursorEnd: pos
      }
    }

    case "heading": {
      const level = payload.level || 1
      const prefix = `${"#".repeat(level)} `
      const lastNewline = beforeText.lastIndexOf("\n")
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const nextNewline = afterText.indexOf("\n")
      const lineEnd = nextNewline === -1 ? content.length : selectionEnd + nextNewline
      const fullLine = content.slice(lineStart, lineEnd)

      const cleanLine = fullLine.replace(/^#{1,6}\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^-\s*\[[ xX]\]\s+/, "")
      const newLine = `${prefix}${cleanLine}`

      const updated = content.slice(0, lineStart) + newLine + content.slice(lineEnd)
      const newPos = lineStart + newLine.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "normal_text": {
      const lastNewline = beforeText.lastIndexOf("\n")
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const nextNewline = afterText.indexOf("\n")
      const lineEnd = nextNewline === -1 ? content.length : selectionEnd + nextNewline
      const fullLine = content.slice(lineStart, lineEnd)

      const cleanLine = fullLine.replace(/^#{1,6}\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^-\s*\[[ xX]\]\s+/, "")
      const updated = content.slice(0, lineStart) + cleanLine + content.slice(lineEnd)
      const newPos = lineStart + cleanLine.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "list_bullet": {
      const lastNewline = beforeText.lastIndexOf("\n")
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const nextNewline = afterText.indexOf("\n")
      const lineEnd = nextNewline === -1 ? content.length : selectionEnd + nextNewline
      const fullLine = content.slice(lineStart, lineEnd)

      const cleanLine = fullLine.replace(/^#{1,6}\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^-\s*\[[ xX]\]\s+/, "")
      const newLine = `- ${cleanLine}`

      const updated = content.slice(0, lineStart) + newLine + content.slice(lineEnd)
      const newPos = lineStart + newLine.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "list_ordered": {
      const lastNewline = beforeText.lastIndexOf("\n")
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const nextNewline = afterText.indexOf("\n")
      const lineEnd = nextNewline === -1 ? content.length : selectionEnd + nextNewline
      const fullLine = content.slice(lineStart, lineEnd)

      const cleanLine = fullLine.replace(/^#{1,6}\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^-\s*\[[ xX]\]\s+/, "")
      const newLine = `1. ${cleanLine}`

      const updated = content.slice(0, lineStart) + newLine + content.slice(lineEnd)
      const newPos = lineStart + newLine.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "list_todo": {
      const lastNewline = beforeText.lastIndexOf("\n")
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const nextNewline = afterText.indexOf("\n")
      const lineEnd = nextNewline === -1 ? content.length : selectionEnd + nextNewline
      const fullLine = content.slice(lineStart, lineEnd)

      const cleanLine = fullLine.replace(/^#{1,6}\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^-\s*\[[ xX]\]\s+/, "")
      const newLine = `- [ ] ${cleanLine}`

      const updated = content.slice(0, lineStart) + newLine + content.slice(lineEnd)
      const newPos = lineStart + newLine.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "quote": {
      const lastNewline = beforeText.lastIndexOf("\n")
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const nextNewline = afterText.indexOf("\n")
      const lineEnd = nextNewline === -1 ? content.length : selectionEnd + nextNewline
      const fullLine = content.slice(lineStart, lineEnd)

      const cleanLine = fullLine.replace(/^#{1,6}\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^-\s*\[[ xX]\]\s+/, "")
      const newLine = `> ${cleanLine}`

      const updated = content.slice(0, lineStart) + newLine + content.slice(lineEnd)
      const newPos = lineStart + newLine.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "divider": {
      const div = "\n---\n"
      const updated = beforeText + div + afterText
      const newPos = selectionStart + div.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "table": {
      const table = "\n| Coluna 1 | Coluna 2 |\n| --- | --- |\n| Item 1 | Item 2 |\n"
      const updated = beforeText + table + afterText
      const newPos = selectionStart + table.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "link": {
      const label = selectedText || "link"
      const url = payload.url || "https://exemplo.com"
      const linkMd = `[${label}](${url})`
      const updated = beforeText + linkMd + afterText
      const newPos = selectionStart + linkMd.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    case "image": {
      const alt = selectedText || "imagem"
      const url = payload.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
      const imgMd = `![${alt}](${url})`
      const updated = beforeText + imgMd + afterText
      const newPos = selectionStart + imgMd.length
      return {
        text: updated,
        newCursorStart: newPos,
        newCursorEnd: newPos
      }
    }

    default:
      return {
        text: content,
        newCursorStart: selectionStart,
        newCursorEnd: selectionEnd
      }
  }
}

/**
 * Detects if a slash command trigger is currently typed before cursor
 * @param {string} text - Full text content
 * @param {number} cursor - Current cursor index
 * @returns {{ slashStart: number, cursor: number, query: string } | null}
 */
export const detectSlashCommand = (text = "", cursor = 0) => {
  const beforeCursor = text.slice(0, cursor)
  const slashMatch = beforeCursor.match(/(?:^|\n|\s)\/([a-zA-Z0-9_\u00C0-\u00FF]*)$/)
  if (!slashMatch) {
    return null
  }

  const matchStr = slashMatch[0]
  const slashStart = cursor - matchStr.length + (matchStr.startsWith("/") ? 0 : 1)
  const query = slashMatch[1].toLowerCase()
  return {
    slashStart,
    cursor,
    query
  }
}

/**
 * List of available slash commands for the interactive popup menu
 */
export const SLASH_COMMANDS = [
  {
    id: "normal",
    label: "Texto Normal",
    desc: "Parágrafo padrão sem formatação especial",
    icon: "Type",
    action: "normal_text",
    keywords: ["texto", "normal", "paragrafo", "p", "plain"]
  },
  {
    id: "h1",
    label: "Título 1",
    desc: "Título principal grande (# H1)",
    icon: "Heading1",
    action: "heading",
    payload: { level: 1 },
    keywords: ["h1", "titulo 1", "grande", "header"]
  },
  {
    id: "h2",
    label: "Título 2",
    desc: "Subtítulo médio (## H2)",
    icon: "Heading2",
    action: "heading",
    payload: { level: 2 },
    keywords: ["h2", "titulo 2", "medio", "subtitulo"]
  },
  {
    id: "h3",
    label: "Título 3",
    desc: "Seção pequena (### H3)",
    icon: "Heading3",
    action: "heading",
    payload: { level: 3 },
    keywords: ["h3", "titulo 3", "pequeno", "secao"]
  },
  {
    id: "bullet",
    label: "Lista com Marcadores",
    desc: "Itens com pontos (- item)",
    icon: "List",
    action: "list_bullet",
    keywords: ["lista", "marcadores", "bullet", "pontos", "-"]
  },
  {
    id: "ordered",
    label: "Lista Numerada",
    desc: "Itens em sequência (1. item)",
    icon: "ListOrdered",
    action: "list_ordered",
    keywords: ["lista", "numerada", "numeros", "1.", "ordem"]
  },
  {
    id: "todo",
    label: "Lista de Tarefas",
    desc: "Caixa de seleção interativa (- [ ] tarefa)",
    icon: "ListTodo",
    action: "list_todo",
    keywords: ["tarefas", "checklist", "todo", "check", "caixa"]
  },
  {
    id: "code_inline",
    label: "Código em Linha",
    desc: "Trecho de código inline (`código`)",
    icon: "Code",
    action: "code_inline",
    keywords: ["codigo", "inline", "linha", "code"]
  },
  {
    id: "code_block",
    label: "Bloco de Código",
    desc: "Bloco com sintaxe realçada (```bash)",
    icon: "Code2",
    action: "code_block",
    keywords: ["codigo", "bloco", "bash", "js", "programacao", "block"]
  },
  {
    id: "quote",
    label: "Citação",
    desc: "Bloco de citação de destaque (> citação)",
    icon: "Quote",
    action: "quote",
    keywords: ["citacao", "citar", "quote", "destaque", ">"]
  },
  {
    id: "divider",
    label: "Linha Divisória",
    desc: "Separador visual horizontal (---)",
    icon: "Minus",
    action: "divider",
    keywords: ["linha", "divisoria", "separador", "divider", "hr", "---"]
  },
  {
    id: "link",
    label: "Inserir Link",
    desc: "Link clicável com preview ([título](url))",
    icon: "Link2",
    action: "link",
    keywords: ["link", "url", "site", "web", "externo"]
  },
  {
    id: "image",
    label: "Inserir Imagem",
    desc: "Imagem remota ou link web (![alt](url))",
    icon: "ImageIcon",
    action: "image",
    keywords: ["imagem", "foto", "figura", "image", "img"]
  }
]

/**
 * Extracts unique links from markdown text to render rich preview cards
 * @param {string} text - Markdown content
 * @returns {Array<{ url: string, label: string }>}
 */
export const extractLinksFromMarkdown = (text = "") => {
  if (!text) {
    return []
  }
  const links = []
  const seen = new Set()

  const mdRegex = /\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/g
  let match
  while ((match = mdRegex.exec(text)) !== null) {
    const url = match[2]
    if (!seen.has(url)) {
      seen.add(url)
      links.push({ url, label: match[1] || url })
    }
  }

  const bareRegex = /(?:^|\s)(https?:\/\/[^\s\)\<]+)/g
  while ((match = bareRegex.exec(text)) !== null) {
    const url = match[1]
    if (!seen.has(url)) {
      seen.add(url)
      links.push({ url, label: url })
    }
  }

  return links
}
