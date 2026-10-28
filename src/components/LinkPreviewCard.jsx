import React, { useState, useEffect } from "react"
import { ExternalLink, Globe } from "lucide-react"

/**
 * Known domains with rich preview metadata presets
 */
const KNOWN_PREVIEWS = {
  "excalidraw.com": {
    title: "Excalidraw — Whiteboard Virtual",
    desc: "Criação de diagramas, arquiteturas e esquemas com estilo desenhado à mão.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
  },
  "codesandbox.io": {
    title: "CodeSandbox — Plataforma de Desenvolvimento em Nuvem",
    desc: "Ambiente completo de prototipagem, testes rápidos e desenvolvimento instantâneo.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
  },
  "github.com": {
    title: "GitHub — Onde o mundo desenvolve software",
    desc: "Repositórios Git, controle de versão, colaboração e código aberto.",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80"
  },
  "figma.com": {
    title: "Figma — Design de Interface e Prototipagem",
    desc: "A principal ferramenta colaborativa de UI/UX e design de interfaces na nuvem.",
    image: "https://images.unsplash.com/photo-1581291518655-95238447306f?auto=format&fit=crop&w=600&q=80"
  },
  "trello.com": {
    title: "Trello — Gestão de Projetos e Quadros",
    desc: "Quadros visuais para organizar tarefas, fluxos de trabalho e produtividade.",
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=600&q=80"
  },
  "react.dev": {
    title: "React — A biblioteca para interfaces web e nativas",
    desc: "Documentação oficial com guias, exemplos e melhores práticas do ecossistema React.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80"
  },
  "tailwindcss.com": {
    title: "Tailwind CSS — Framework CSS Utility-First",
    desc: "Construa interfaces modernas rapidamente sem sair do seu HTML.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
  }
}

/**
 * Extracts YouTube video ID from URL
 * @param {string} url - URL to check
 * @returns {string|null} Video ID or null
 */
const extractYouTubeId = (url) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v")
    }
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1)
    }
    return null
  } catch {
    return null
  }
}

/**
 * Resolves preview metadata for any arbitrary URL
 * @param {string} url - The URL string
 * @param {string} [linkText=""] - Text enclosed in link
 * @returns {Object} Resolved metadata
 */
const resolveUrlMetadata = (url, linkText = "") => {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, "")
    const domain = hostname.toLowerCase()

    // Check YouTube
    const ytId = extractYouTubeId(url)
    if (ytId) {
      return {
        hostname,
        title: linkText && linkText !== url ? linkText : `Vídeo do YouTube (${ytId})`,
        desc: "Assista a este vídeo diretamente no YouTube",
        image: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        favicon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64"
      }
    }

    // Check Known Previews
    if (KNOWN_PREVIEWS[domain]) {
      const known = KNOWN_PREVIEWS[domain]
      return {
        hostname,
        title: linkText && linkText !== url ? linkText : known.title,
        desc: known.desc,
        image: known.image,
        favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
      }
    }

    // Clean display title
    let displayTitle = linkText && linkText !== url ? linkText : ""
    if (!displayTitle) {
      const pathClean = parsed.pathname.replace(/^\/|\/$/g, "").replace(/[-_]/g, " ")
      if (pathClean) {
        displayTitle = `${hostname} — ${pathClean.charAt(0).toUpperCase() + pathClean.slice(1)}`
      } else {
        displayTitle = hostname.charAt(0).toUpperCase() + hostname.slice(1)
      }
    }

    return {
      hostname,
      title: displayTitle,
      desc: parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : `Acessar conteúdo em ${hostname}`,
      image: null,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    }
  } catch {
    return {
      hostname: url,
      title: linkText || url,
      desc: "",
      image: null,
      favicon: null
    }
  }
}

/**
 * Normalizes a URL to serve as a consistent dictionary key for card.linkSizes
 * @param {string} url - URL string to normalize
 * @returns {string} Normalized URL key
 */
export const normalizeLinkKey = (url = "") => {
  if (!url) {
    return ""
  }
  try {
    const parsed = new URL(url)
    const cleanHash = parsed.hash
      .replace(/[#&](?:size|preview)=[pmg](?:&|$)/gi, (m) => m.startsWith("#") ? "#" : "")
      .replace(/#$/, "")
    const cleanPath = parsed.pathname.replace(/\/$/, "")
    return `${parsed.origin}${cleanPath}${parsed.search}${cleanHash}`.toLowerCase()
  } catch {
    return url.trim().replace(/\/$/, "").toLowerCase()
  }
}

/**
 * Extracts size tag from href or title attribute as legacy fallback
 * @param {string} [href=""] - Link URL
 * @param {string} [title=""] - Link title attribute
 * @returns {string|null} "p" | "m" | "g" | null
 */
const extractLinkSize = (href = "", title = "") => {
  if (title) {
    const t = String(title).toLowerCase().trim()
    if (t === "size:p" || t === "p") return "p"
    if (t === "size:m" || t === "m") return "m"
    if (t === "size:g" || t === "g") return "g"
  }
  if (href) {
    const match = href.match(/[#&](?:size|preview)=([pmg])(?:&|$)/i)
    if (match) {
      return match[1].toLowerCase()
    }
  }
  return null
}

/**
 * Strips internal size tracking hash or parameter so target site opens cleanly
 * @param {string} href - URL to sanitize
 * @returns {string} Clean URL for browser navigation
 */
const getCleanNavUrl = (href = "") => {
  if (!href) return ""
  return href
    .replace(/[#&](?:size|preview)=[pmg](?:&|$)/gi, (match) => match.startsWith("#") ? "#" : "")
    .replace(/#$/, "")
}

/**
 * LinkPreviewCard renders external links as rich interactive preview cards with 3 sizes:
 * - Pequeno (inline / 1 linha com ícone do site, h-[36px])
 * - Médio (dobro da altura do pequeno h-[72px], card compacto que não toma a linha toda)
 * - Grande (quase do tamanho do médio, uns 20% menor em altura h-[58px], e toma a linha toda w-full)
 * @param {Object} props - Component properties
 * @param {string} props.href - Destination URL
 * @param {string} [props.title=""] - Link title attribute
 * @param {React.ReactNode} [props.children] - Link child text
 * @param {string|null} [props.cardSize=null] - Saved size from card metadata ("p" | "m" | "g")
 * @param {Function} [props.onUpdateSize] - Callback when preview size changes to persist in card
 * @returns {JSX.Element} Rendered link preview card
 */
export const LinkPreviewCard = ({
  href = "",
  title = "",
  children,
  cardSize = null,
  onUpdateSize
}) => {
  const linkText = typeof children === "string" ? children : ""
  const meta = resolveUrlMetadata(href, linkText)

  // Priority: 1. Size stored on card, 2. Legacy tag, 3. localStorage, 4. default "p"
  const explicitSize = cardSize || extractLinkSize(href, title)
  const storageKey = `kanban_link_size_${normalizeLinkKey(href)}`
  const [size, setSize] = useState(() => {
    if (explicitSize) {
      return explicitSize
    }
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved === "p" || saved === "small") {
        return "p"
      }
      if (saved === "m" || saved === "medium") {
        return "m"
      }
      if (saved === "g" || saved === "large") {
        return "g"
      }
      return "p"
    } catch {
      return "p"
    }
  })

  // Synchronize state when cardSize changes
  React.useEffect(() => {
    if (cardSize && cardSize !== size) {
      setSize(cardSize)
    }
  }, [cardSize])

  const [imageError, setImageError] = useState(false)

  const handleSelectSize = (e, newSize) => {
    e.preventDefault()
    e.stopPropagation()
    setSize(newSize)

    // Save fallback to localStorage
    try {
      localStorage.setItem(storageKey, newSize)
    } catch {
      // Ignore storage errors
    }

    // Persist directly into the card object
    if (onUpdateSize) {
      onUpdateSize(href, newSize)
    }
  }

  const handleOpenLink = () => {
    if (!href) {
      return
    }
    const cleanUrl = getCleanNavUrl(href)
    window.open(cleanUrl, "_blank", "noopener,noreferrer")
  }

  // Segmented control button group for selecting preview size: p, m, g
  const renderSizeControl = () => (
    <span
      className="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-slate-950/90 border border-slate-700/80 backdrop-blur-sm select-none shadow-xs shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => handleSelectSize(e, "p")}
        className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${
          size === "p"
            ? "bg-indigo-600 text-white shadow-xs"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        }`}
        title="Tamanho p (inline junto ao texto, estilo código)"
      >
        p
      </button>
      <button
        type="button"
        onClick={(e) => handleSelectSize(e, "m")}
        className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${
          size === "m"
            ? "bg-indigo-600 text-white shadow-xs"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        }`}
        title="Tamanho m (card médio com imagem)"
      >
        m
      </button>
      <button
        type="button"
        onClick={(e) => handleSelectSize(e, "g")}
        className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${
          size === "g"
            ? "bg-indigo-600 text-white shadow-xs"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        }`}
        title="Tamanho g (bloco em toda a linha)"
      >
        g
      </button>
    </span>
  )

  // ==========================================
  // CASE 1: PREVIEW P (INLINE JUNTO AO TEXTO, ESTILO CÓDIGO)
  // ==========================================
  if (size === "p") {
    return (
      <span
        onClick={handleOpenLink}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 my-0.5 rounded-md bg-slate-950/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-200 transition-all cursor-pointer select-none align-baseline text-[11px] group/link shadow-xs font-mono"
        title={`Abrir ${href}`}
      >
        {meta.favicon ? (
          <img
            src={meta.favicon}
            alt=""
            className="w-3.5 h-3.5 rounded object-contain shrink-0"
            onError={(e) => {
              e.target.style.display = "none"
            }}
          />
        ) : (
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        )}
        <span className="font-semibold text-slate-200 group-hover/link:text-indigo-300 transition-colors truncate max-w-[200px]">
          {meta.title}
        </span>
        <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover/link:text-indigo-400 shrink-0 opacity-70 group-hover/link:opacity-100 transition-opacity" />
        <span className="ml-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {renderSizeControl()}
        </span>
      </span>
    )
  }

  // =========================================================================
  // CASE 2: PREVIEW M (DOBRO DA ALTURA DO PEQUENO, h-[72px], NÃO OCUPA LINHA TODA)
  // =========================================================================
  if (size === "m") {
    return (
      <div
        onClick={handleOpenLink}
        className="my-2 h-[72px] w-80 max-w-sm rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/50 overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group/card flex select-none"
        title={`Abrir ${href}`}
      >
        {/* Left Thumbnail (72px x 72px) */}
        <div className="w-[72px] h-[72px] bg-slate-950 shrink-0 relative overflow-hidden border-r border-slate-700/60">
          {meta.image && !imageError ? (
            <img
              src={meta.image}
              alt=""
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-950">
              {meta.favicon ? (
                <img src={meta.favicon} alt="" className="w-6 h-6 rounded" />
              ) : (
                <Globe className="w-6 h-6 text-indigo-400" />
              )}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 p-2 px-2.5 flex flex-col justify-between min-w-0 bg-slate-800/60">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate leading-tight group-hover/card:text-indigo-300 transition-colors">
              {meta.title}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {meta.hostname}
            </p>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-700/50">
            <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-0.5">
              <span>Visitar</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
            {renderSizeControl()}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // CASE 3: PREVIEW GRANDE (~20% MENOR QUE MÉDIO EM ALTURA, h-[58px], TOMA A LINHA TODA)
  // =========================================================================
  return (
    <div
      onClick={handleOpenLink}
      className="my-2 h-[58px] w-full rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/50 overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group/card flex items-center select-none"
      title={`Abrir ${href}`}
    >
      {/* Left Thumbnail Banner (w-20 h-[58px]) */}
      <div className="w-20 h-[58px] bg-slate-950 shrink-0 relative overflow-hidden border-r border-slate-700/60">
        {meta.image && !imageError ? (
          <img
            src={meta.image}
            alt=""
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
            {meta.favicon ? (
              <img src={meta.favicon} alt="" className="w-5 h-5 rounded" />
            ) : (
              <Globe className="w-5 h-5 text-indigo-400" />
            )}
          </div>
        )}
      </div>

      {/* Middle Text Info */}
      <div className="flex-1 px-3 min-w-0 flex flex-col justify-center">
        <h4 className="text-xs font-bold text-white truncate leading-tight group-hover/card:text-indigo-300 transition-colors">
          {meta.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono font-medium text-slate-300 truncate">
            {meta.hostname}
          </span>
          {meta.desc && (
            <span className="text-[10px] text-slate-400 truncate hidden md:inline">
              • {meta.desc}
            </span>
          )}
        </div>
      </div>

      {/* Right Controls and Action */}
      <div className="pr-3 shrink-0 flex items-center gap-2">
        {renderSizeControl()}
        <button
          type="button"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-xs transition-colors"
        >
          <span>Acessar</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  )
}
