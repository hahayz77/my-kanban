import React from "react"

/**
 * Built-in sticker definitions replicating the complete authentic Trello retro computer sticker pack
 */
export const BUILTIN_STICKERS = [
  // ROW 1
  {
    id: "pc-happy",
    name: "PC Feliz (^ _ ^)",
    category: "retro",
    screenText: "^ _ ^",
    screenBg: "#fbc02d",
    textColor: "#212121"
  },
  {
    id: "pc-love",
    name: "PC Coração (<3)",
    category: "retro",
    screenText: "<3",
    screenBg: "#e53935",
    textColor: "#ffffff"
  },
  {
    id: "pc-broken",
    name: "PC Quebrado (Fumaça)",
    category: "retro"
  },
  {
    id: "pc-alert",
    name: "PC Alerta (!!!)",
    category: "retro",
    screenText: "!!!",
    screenBg: "#f57c00",
    textColor: "#ffffff",
    vibeLines: true
  },

  // ROW 2
  {
    id: "pc-binary",
    name: "PC Código Binário",
    category: "retro"
  },
  {
    id: "pc-hammock",
    name: "PC Férias na Rede",
    category: "retro"
  },
  {
    id: "pc-neutral",
    name: "PC Neutro (0.0)",
    category: "retro",
    screenText: "0.0",
    screenBg: "#f59e0b",
    textColor: "#ffffff"
  },
  {
    id: "pc-box",
    name: "PC na Caixa (:)",
    category: "retro"
  },

  // ROW 3
  {
    id: "pc-apps",
    name: "PC Mosaico de Apps",
    category: "retro"
  },
  {
    id: "pc-check",
    name: "PC Concluído (✓)",
    category: "retro",
    screenText: "✓",
    screenBg: "#16a34a",
    textColor: "#ffffff"
  },
  {
    id: "pc-space",
    name: "PC no Espaço (Órbita)",
    category: "retro"
  },
  {
    id: "pc-sketch",
    name: "PC Desenho / Sketch",
    category: "retro"
  },

  // ROW 4
  {
    id: "pc-ghost",
    name: "PC Fantasma (Boo!)",
    category: "retro"
  },
  {
    id: "pc-award",
    name: "PC Ouro (Laurel Wreath)",
    category: "retro"
  },
  {
    id: "pc-music",
    name: "PC Rock / Música",
    category: "retro"
  }
]

/**
 * RetroComputerSticker renders standard retro computer sticker variations
 * @param {Object} props - Component properties
 * @param {string} [props.screenText="<3"] - Expression on CRT screen
 * @param {string} [props.screenBg="#e53935"] - Hex background color of screen
 * @param {string} [props.textColor="#ffffff"] - Hex text color
 * @param {boolean} [props.vibeLines=false] - Whether to draw sound/vibration alert arcs
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const RetroComputerSticker = ({
  screenText = "<3",
  screenBg = "#e53935",
  textColor = "#ffffff",
  vibeLines = false,
  className = "w-11 h-9.5"
}) => {
  return (
    <svg
      viewBox="0 0 46 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Vibration Alert Arcs */}
      {vibeLines && (
        <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.95">
          <path d="M4 14 C1 16.5 1 21 4 23.5" />
          <path d="M41 14 C44 16.5 44 21 41 23.5" />
          <path d="M7 9 C5 11 5 13 7 15" />
          <path d="M38 9 C40 11 40 13 38 15" />
        </g>
      )}

      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M6 35 L3 17 L12 4 L38 4 L41 35 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Main Computer Beige Body */}
      <path
        d="M7 34 L4 18 L13 6 L37 6 L40 34 Z"
        fill="#eaecef"
        stroke="#cfd4da"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Left Perspective Panel */}
      <path d="M4 18 L13 6 L14 34 L7 34 Z" fill="#dce1e6" />

      {/* Front Bezel */}
      <rect
        x="15"
        y="8"
        width="23"
        height="24"
        rx="2"
        fill="#f8f9fa"
        stroke="#b0b8c1"
        strokeWidth="0.8"
      />

      {/* Inner Screen */}
      <rect
        x="17"
        y="10"
        width="19"
        height="15"
        rx="1.5"
        fill={screenBg}
      />

      {/* Screen Text / Expression */}
      <text
        x="26.5"
        y="21.2"
        fill={textColor}
        fontSize="9"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {screenText}
      </text>

      {/* Power LED Indicator (Green) */}
      <circle cx="19" cy="28.5" r="1.2" fill="#22c55e" />

      {/* Ventilation slots / disk drive */}
      <rect x="23" y="27.5" width="12" height="1" rx="0.5" fill="#8c959f" />
      <rect x="23" y="29.5" width="12" height="1" rx="0.5" fill="#8c959f" />

      {/* Cable cord and mouse */}
      <path
        d="M6 24 C1 24 0 29 3 33"
        stroke="#8c959f"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="1"
        y="32"
        width="3.5"
        height="4.5"
        rx="1"
        fill="#eaecef"
        stroke="#8c959f"
        strokeWidth="0.8"
      />
    </svg>
  )
}

/**
 * BrokenComputerSticker renders a damaged PC with cracked screen and smoke puff
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const BrokenComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Smoke Cloud puff rising from top */}
      <g fill="#e2e8f0" stroke="#ffffff" strokeWidth="1.5">
        <circle cx="21" cy="4" r="3.5" />
        <circle cx="25" cy="5.5" r="3" />
        <circle cx="21" cy="8" r="2.5" />
      </g>

      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M6 37 L3 19 L12 8 L38 8 L41 37 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Main Body (darker damaged grey) */}
      <path
        d="M7 36 L4 20 L13 10 L37 10 L40 36 Z"
        fill="#d1d5db"
        stroke="#9ca3af"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M4 20 L13 10 L14 36 L7 36 Z" fill="#9ca3af" />

      {/* Front Bezel */}
      <rect
        x="15"
        y="12"
        width="23"
        height="22"
        rx="2"
        fill="#e5e7eb"
        stroke="#9ca3af"
        strokeWidth="0.8"
      />

      {/* Cracked Screen */}
      <rect x="17" y="14" width="19" height="14" rx="1.5" fill="#4b5563" />

      {/* Cracks in screen glass */}
      <path
        d="M26 14 L24 20 L28 23 M24 20 L19 23 M24 20 L29 17"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Dislodged loose component / shard */}
      <polygon points="27,24 31,21 33,26 29,27" fill="#374151" stroke="#9ca3af" strokeWidth="0.5" />

      {/* Ventilation slots and crack */}
      <rect x="23" y="30" width="12" height="1" rx="0.5" fill="#6b7280" />
      <circle cx="19" cy="30" r="1.2" fill="#ef4444" />
    </svg>
  )
}

/**
 * BinaryComputerSticker renders dual mini computers with floating binary matrix
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const BinaryComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 48 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <rect x="2" y="2" width="44" height="38" rx="8" fill="#ffffff" />

      {/* Floating Binary Code Matrix */}
      <text x="24" y="9" fill="#94a3b8" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        101010110
      </text>
      <text x="24" y="17" fill="#64748b" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        0100110
      </text>
      <text x="24" y="35" fill="#94a3b8" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        0110010011
      </text>

      {/* Left Mini PC */}
      <g transform="translate(6, 12)">
        <rect x="0" y="0" width="15" height="16" rx="2" fill="#eaecef" stroke="#cfd4da" strokeWidth="0.8" />
        <rect x="2" y="2" width="11" height="9" rx="1" fill="#0284c7" />
        <text x="7.5" y="8.5" fill="#ffffff" fontSize="4.2" fontWeight="bold" textAnchor="middle">
          1001
        </text>
      </g>

      {/* Right Mini PC */}
      <g transform="translate(27, 12)">
        <rect x="0" y="0" width="15" height="16" rx="2" fill="#eaecef" stroke="#cfd4da" strokeWidth="0.8" />
        <rect x="2" y="2" width="11" height="9" rx="1" fill="#0284c7" />
        <text x="7.5" y="8.5" fill="#ffffff" fontSize="4.2" fontWeight="bold" textAnchor="middle">
          1010
        </text>
      </g>
    </svg>
  )
}

/**
 * HammockComputerSticker renders a retro PC relaxing in a hammock between pine trees with sun
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const HammockComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 48 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M4 38 L4 18 L14 4 L34 4 L44 18 L44 38 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Bright Yellow Sun */}
      <circle cx="36" cy="12" r="6" fill="#facc15" />

      {/* Left Tree Trunk & Needles */}
      <rect x="10" y="22" width="3" height="14" fill="#a16207" rx="0.5" />
      <polygon points="11.5,8 5,20 18,20" fill="#15803d" />
      <polygon points="11.5,14 4,25 19,25" fill="#16a34a" />

      {/* Right Tree Trunk & Needles */}
      <rect x="35" y="22" width="3" height="14" fill="#a16207" rx="0.5" />
      <polygon points="36.5,8 30,20 43,20" fill="#15803d" />
      <polygon points="36.5,14 29,25 44,25" fill="#16a34a" />

      {/* White Hammock Rope Sag */}
      <path
        d="M12 24 Q 24 35 36 24"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Relaxing Mini PC in hammock */}
      <g transform="translate(19, 18) rotate(10)">
        <rect x="0" y="0" width="12" height="12" rx="1.5" fill="#eaecef" stroke="#cfd4da" strokeWidth="0.8" />
        <rect x="1.5" y="1.5" width="9" height="7" rx="1" fill="#8b5cf6" />
        <text x="6" y="6.8" fill="#ffffff" fontSize="4.2" fontWeight="bold" textAnchor="middle">
          zZz
        </text>
      </g>
    </svg>
  )
}

/**
 * BoxComputerSticker renders a delivery box with a happy PC popping out
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const BoxComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M6 38 L3 16 L12 4 L34 4 L43 16 L40 38 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* PC inside box */}
      <g transform="translate(12, 6)">
        <rect x="0" y="0" width="22" height="20" rx="2" fill="#eaecef" stroke="#cfd4da" strokeWidth="1" />
        <rect x="2.5" y="2.5" width="17" height="12" rx="1.5" fill="#0284c7" />
        <text x="11" y="11.5" fill="#ffffff" fontSize="7.5" fontWeight="900" textAnchor="middle">
          :)
        </text>
      </g>

      {/* Cardboard Delivery Box */}
      <path
        d="M5 38 L7 18 L39 18 L41 38 Z"
        fill="#b45309"
        stroke="#92400e"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Left and Right open flaps */}
      <polygon points="7,18 2,13 14,18" fill="#d97706" />
      <polygon points="39,18 44,13 32,18" fill="#d97706" />

      {/* Box Print details */}
      <text x="23" y="32" fill="#fde68a" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
        ▲▲▲
      </text>
    </svg>
  )
}

/**
 * AppsComputerSticker renders a retro PC covered by a colorful mosaic cluster of sticky notes / app icons
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const AppsComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M6 35 L3 17 L12 4 L38 4 L41 35 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Main Body */}
      <path
        d="M7 34 L4 18 L13 6 L37 6 L40 34 Z"
        fill="#eaecef"
        stroke="#cfd4da"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M4 18 L13 6 L14 34 L7 34 Z" fill="#dce1e6" />

      {/* Front Bezel */}
      <rect x="15" y="8" width="23" height="24" rx="2" fill="#f8f9fa" stroke="#b0b8c1" strokeWidth="0.8" />

      {/* Screen background */}
      <rect x="17" y="10" width="19" height="15" rx="1.5" fill="#1e293b" />

      {/* Mosaic App Tiles Cluster */}
      <rect x="18" y="11" width="3.8" height="3" rx="0.6" fill="#ec4899" />
      <rect x="22.6" y="11" width="3.8" height="3" rx="0.6" fill="#3b82f6" />
      <rect x="27.2" y="11" width="3.8" height="3" rx="0.6" fill="#eab308" />
      <rect x="31.8" y="11" width="3" height="3" rx="0.6" fill="#10b981" />

      <rect x="18" y="15" width="3.8" height="3" rx="0.6" fill="#f97316" />
      <rect x="22.6" y="15" width="3.8" height="3" rx="0.6" fill="#06b6d4" />
      <rect x="27.2" y="15" width="3.8" height="3" rx="0.6" fill="#8b5cf6" />
      <rect x="31.8" y="15" width="3" height="3" rx="0.6" fill="#ef4444" />

      <rect x="18" y="19" width="3.8" height="3.2" rx="0.6" fill="#84cc16" />
      <rect x="22.6" y="19" width="3.8" height="3.2" rx="0.6" fill="#f43f5e" />
      <rect x="27.2" y="19" width="3.8" height="3.2" rx="0.6" fill="#14b8a6" />
      <rect x="31.8" y="19" width="3" height="3.2" rx="0.6" fill="#6366f1" />

      {/* Sticky notes overflowing outside screen */}
      <rect x="9" y="14" width="5" height="4" rx="0.8" fill="#ec4899" transform="rotate(-6 9 14)" />
      <rect x="8" y="21" width="5.5" height="4" rx="0.8" fill="#eab308" transform="rotate(4 8 21)" />
      <rect x="33" y="12" width="5" height="4" rx="0.8" fill="#3b82f6" transform="rotate(8 33 12)" />
      <rect x="32" y="19" width="5" height="4" rx="0.8" fill="#10b981" transform="rotate(-5 32 19)" />

      {/* Power LED and vents */}
      <circle cx="19" cy="28.5" r="1.2" fill="#22c55e" />
      <rect x="23" y="27.5" width="12" height="1" rx="0.5" fill="#8c959f" />
    </svg>
  )
}

/**
 * SpaceComputerSticker renders a PC floating in orbit above planet Earth
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const SpaceComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <circle cx="23" cy="21" r="19" fill="#ffffff" />

      {/* Deep Space Dark Circle */}
      <circle cx="23" cy="21" r="17" fill="#1e1e2f" />

      {/* Distant Stars */}
      <circle cx="10" cy="11" r="0.8" fill="#ffffff" />
      <circle cx="38" cy="10" r="0.8" fill="#ffffff" />
      <circle cx="15" cy="18" r="0.6" fill="#ffffff" />
      <circle cx="39" cy="28" r="0.6" fill="#ffffff" />

      {/* Curved Planet Earth at bottom */}
      <circle cx="16" cy="38" r="16" fill="#3b82f6" />
      <path d="M7 28 C 12 26, 17 32, 22 28 C 24 35, 12 37, 7 35 Z" fill="#22c55e" />
      <path d="M22 36 C 25 32, 30 35, 29 40 Z" fill="#22c55e" />

      {/* Floating Retro PC in orbit with purple screen and cursor B| */}
      <g transform="translate(18, 9) rotate(14)">
        <rect x="0" y="0" width="16" height="15" rx="2" fill="#eaecef" stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x="2" y="2" width="12" height="8.5" rx="1.2" fill="#6366f1" />
        <text x="8" y="8" fill="#ffffff" fontSize="5.5" fontWeight="900" textAnchor="middle">
          B|
        </text>
        <circle cx="4" cy="12.5" r="0.8" fill="#22c55e" />
        <rect x="7" y="12" width="6" height="0.8" rx="0.4" fill="#94a3b8" />
      </g>
    </svg>
  )
}

/**
 * SketchComputerSticker renders a blueprint notebook sketch of the retro PC
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const SketchComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <rect x="3" y="3" width="40" height="38" rx="4" fill="#ffffff" stroke="#ffffff" strokeWidth="2" />

      {/* Lined binder notepad page */}
      <rect x="5" y="5" width="36" height="34" rx="2" fill="#fefce8" stroke="#fef08a" strokeWidth="0.5" />

      {/* Binder holes on the left */}
      <circle cx="9" cy="10" r="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      <circle cx="9" cy="22" r="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      <circle cx="9" cy="34" r="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

      {/* Horizontal notebook lines */}
      <line x1="13" y1="12" x2="38" y2="12" stroke="#e2e8f0" strokeWidth="0.8" />
      <line x1="13" y1="18" x2="38" y2="18" stroke="#e2e8f0" strokeWidth="0.8" />
      <line x1="13" y1="24" x2="38" y2="24" stroke="#e2e8f0" strokeWidth="0.8" />
      <line x1="13" y1="30" x2="38" y2="30" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* Blueprint hand-drawn pencil PC sketch */}
      <g stroke="#475569" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M16 28 L14 18 L20 12 L34 12 L36 28 Z" />
        <path d="M14 18 L20 12 L21 28 L16 28 Z" />
        <rect x="22" y="14" width="12" height="11" rx="1" />
        <rect x="24" y="16" width="8" height="6" rx="0.5" />
        <circle cx="24" cy="23.5" r="0.8" fill="#475569" />
        <line x1="27" y1="23.5" x2="32" y2="23.5" />
        {/* cord */}
        <path d="M14 24 C10 24 10 30 13 32" />
      </g>
    </svg>
  )
}

/**
 * GhostComputerSticker renders a Halloween ghost sheet PC with Boo! text
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const GhostComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Friendly "Boo!" Text in bubble letters */}
      <text
        x="23"
        y="10"
        fill="#94a3b8"
        fontSize="8"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        stroke="#ffffff"
        strokeWidth="1.5"
        paintOrder="stroke fill"
      >
        Boo!
      </text>

      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M9 39 L7 18 L16 11 L30 11 L39 18 L37 39 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* White Ghost Sheet Body */}
      <path
        d="M10 38 C9 22 13 13 23 13 C33 13 37 22 36 38 C34 35 32 38 29 36 C26 38 24 35 21 37 C18 35 15 38 13 36 C11 38 10 37 10 38 Z"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Eyeholes */}
      <circle cx="19" cy="24" r="2.5" fill="#1e293b" />
      <circle cx="27" cy="24" r="2.5" fill="#1e293b" />
      <circle cx="19.8" cy="23.2" r="0.8" fill="#ffffff" />
      <circle cx="27.8" cy="23.2" r="0.8" fill="#ffffff" />

      {/* Peeking mouse cord */}
      <path d="M8 29 C4 29 4 35 7 37" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <rect x="5" y="36" width="3" height="4" rx="0.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />
    </svg>
  )
}

/**
 * AwardComputerSticker renders a golden PC flanked by golden laurel wreath branches
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const AwardComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 48 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M4 22 C4 8 44 8 44 22 C44 38 4 38 4 22 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Golden Laurel Wreath Left Branch */}
      <g fill="#f59e0b" stroke="#d97706" strokeWidth="0.4">
        <path d="M7 12 C10 11 12 14 10 16 C8 15 6 13 7 12 Z" />
        <path d="M5 18 C8 17 11 20 9 22 C7 21 5 19 5 18 Z" />
        <path d="M6 25 C9 24 11 27 9 29 C7 28 5 26 6 25 Z" />
        <path d="M9 31 C12 30 14 33 12 35 C10 34 8 32 9 31 Z" />
        <path d="M14 36 C17 35 18 38 16 39 C14 38 13 37 14 36 Z" />
      </g>

      {/* Golden Laurel Wreath Right Branch */}
      <g fill="#f59e0b" stroke="#d97706" strokeWidth="0.4">
        <path d="M41 12 C38 11 36 14 38 16 C40 15 42 13 41 12 Z" />
        <path d="M43 18 C40 17 37 20 39 22 C41 21 43 19 43 18 Z" />
        <path d="M42 25 C39 24 37 27 39 29 C41 28 43 26 42 25 Z" />
        <path d="M39 31 C36 30 34 33 36 35 C38 34 40 32 39 31 Z" />
        <path d="M34 36 C31 35 30 38 32 39 C34 38 35 37 34 36 Z" />
      </g>

      {/* Central Golden PC */}
      <g transform="translate(15, 8)">
        <rect x="0" y="0" width="18" height="20" rx="2" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
        <rect x="2" y="2" width="14" height="11" rx="1.2" fill="#f59e0b" />
        <circle cx="5" cy="16" r="1" fill="#22c55e" />
        <rect x="8" y="15.5" width="7" height="1" rx="0.5" fill="#d97706" />
      </g>
    </svg>
  )
}

/**
 * MusicComputerSticker renders a rock-out music PC with notes and cyan screen
 * @param {Object} props - Component properties
 * @param {string} [props.className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element} Rendered SVG sticker
 */
export const MusicComputerSticker = ({ className = "w-11 h-9.5" }) => {
  return (
    <svg
      viewBox="0 0 46 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none block`}
    >
      {/* Musical Eighth Notes floating */}
      <g fill="#1e293b" stroke="#ffffff" strokeWidth="0.8">
        {/* Left note */}
        <circle cx="5" cy="18" r="2.2" />
        <path d="M7 18 L7 10 L11 8 L11 11" stroke="#1e293b" strokeWidth="1.2" fill="none" />
        {/* Right note */}
        <circle cx="39" cy="16" r="2.2" />
        <path d="M41 16 L41 8 L45 6 L45 9" stroke="#1e293b" strokeWidth="1.2" fill="none" />
      </g>

      {/* Sound waves around body */}
      <path d="M5 25 C3 27 3 31 5 33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="M41 25 C43 27 43 31 41 33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

      {/* Outer Die-cut White Sticker Border */}
      <path
        d="M7 38 L4 18 L13 6 L35 6 L38 38 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Main Body */}
      <path
        d="M8 37 L5 19 L14 8 L34 8 L37 37 Z"
        fill="#eaecef"
        stroke="#cfd4da"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Top Antenna */}
      <line x1="21" y1="8" x2="18" y2="2" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="2" r="1.5" fill="#ef4444" />

      {/* Front Bezel */}
      <rect x="13" y="10" width="22" height="23" rx="2" fill="#f8f9fa" stroke="#b0b8c1" strokeWidth="0.8" />

      {/* Cyan Screen with Play Button */}
      <rect x="15" y="12" width="18" height="13" rx="1.5" fill="#06b6d4" />
      <polygon points="22,15 28,18.5 22,22" fill="#ffffff" />

      {/* Power LED and vents */}
      <circle cx="18" cy="28" r="1.2" fill="#22c55e" />
      <rect x="22" y="27" width="10" height="1" rx="0.5" fill="#8c959f" />
      <rect x="22" y="29" width="10" height="1" rx="0.5" fill="#8c959f" />
    </svg>
  )
}

/**
 * Renders any sticker object (custom uploaded dataUrl or any of the 15 built-in retro stickers)
 * @param {Object} sticker - The sticker configuration
 * @param {string} [className="w-11 h-9.5"] - Dimension styling
 * @returns {JSX.Element|null} Rendered sticker element
 */
export const renderCardSticker = (sticker, className = "w-11 h-9.5") => {
  if (!sticker) {
    return null
  }

  // Custom user uploaded PNG / image
  if (sticker.type === "custom" && sticker.dataUrl) {
    return (
      <img
        src={sticker.dataUrl}
        alt={sticker.name || "Sticker"}
        className={`${className} max-w-[46px] max-h-[40px] object-contain filter drop-shadow-md select-none rounded`}
      />
    )
  }

  // Specialized built-in stickers
  if (sticker.id === "pc-broken") {
    return <BrokenComputerSticker className={className} />
  }
  if (sticker.id === "pc-binary") {
    return <BinaryComputerSticker className={className} />
  }
  if (sticker.id === "pc-hammock") {
    return <HammockComputerSticker className={className} />
  }
  if (sticker.id === "pc-box") {
    return <BoxComputerSticker className={className} />
  }
  if (sticker.id === "pc-apps") {
    return <AppsComputerSticker className={className} />
  }
  if (sticker.id === "pc-space") {
    return <SpaceComputerSticker className={className} />
  }
  if (sticker.id === "pc-sketch") {
    return <SketchComputerSticker className={className} />
  }
  if (sticker.id === "pc-ghost") {
    return <GhostComputerSticker className={className} />
  }
  if (sticker.id === "pc-award") {
    return <AwardComputerSticker className={className} />
  }
  if (sticker.id === "pc-music") {
    return <MusicComputerSticker className={className} />
  }

  // Standard chassis stickers (happy, love, neutral, check, alert, etc.)
  const match = BUILTIN_STICKERS.find((s) => s.id === sticker.id)
  if (match && match.screenText) {
    return (
      <RetroComputerSticker
        screenText={match.screenText}
        screenBg={match.screenBg}
        textColor={match.textColor}
        vibeLines={match.vibeLines}
        className={className}
      />
    )
  }

  // Custom retro definition
  if (sticker.type === "retro" || (sticker.screenText && sticker.screenBg)) {
    return (
      <RetroComputerSticker
        screenText={sticker.screenText}
        screenBg={sticker.screenBg}
        textColor={sticker.textColor || "#ffffff"}
        vibeLines={Boolean(sticker.vibeLines)}
        className={className}
      />
    )
  }

  return null
}
