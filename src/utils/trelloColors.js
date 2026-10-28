/**
 * Complete Trello color palette with 10 color families and 2 shades each (Light & Dark)
 */
export const TRELLO_COLOR_PALETTE = [
  // 1. Green
  {
    id: "green",
    family: "green",
    shade: "light",
    label: "Verde Claro",
    bg: "#22a06b",
    text: "#ffffff",
    border: "#1f845a"
  },
  {
    id: "green_dark",
    family: "green",
    shade: "dark",
    label: "Verde Escuro",
    bg: "#164b35",
    text: "#ffffff",
    border: "#123d2b"
  },

  // 2. Yellow
  {
    id: "yellow",
    family: "yellow",
    shade: "light",
    label: "Amarelo Claro",
    bg: "#e2b203",
    text: "#172b4d",
    border: "#cf9f02"
  },
  {
    id: "yellow_dark",
    family: "yellow",
    shade: "dark",
    label: "Amarelo Escuro",
    bg: "#946f00",
    text: "#ffffff",
    border: "#7a5b00"
  },

  // 3. Orange
  {
    id: "orange",
    family: "orange",
    shade: "light",
    label: "Laranja Claro",
    bg: "#faa53d",
    text: "#172b4d",
    border: "#e08d24"
  },
  {
    id: "orange_dark",
    family: "orange",
    shade: "dark",
    label: "Laranja Escuro",
    bg: "#a54800",
    text: "#ffffff",
    border: "#853a00"
  },

  // 4. Red
  {
    id: "red",
    family: "red",
    shade: "light",
    label: "Vermelho Claro",
    bg: "#f87168",
    text: "#ffffff",
    border: "#de564b"
  },
  {
    id: "red_dark",
    family: "red",
    shade: "dark",
    label: "Vermelho Escuro",
    bg: "#ae2e24",
    text: "#ffffff",
    border: "#8c221a"
  },

  // 5. Purple
  {
    id: "purple",
    family: "purple",
    shade: "light",
    label: "Roxo Claro",
    bg: "#9f8fef",
    text: "#172b4d",
    border: "#8472df"
  },
  {
    id: "purple_dark",
    family: "purple",
    shade: "dark",
    label: "Roxo Escuro",
    bg: "#5e4db2",
    text: "#ffffff",
    border: "#4b3c94"
  },

  // 6. Blue
  {
    id: "blue",
    family: "blue",
    shade: "light",
    label: "Azul Claro",
    bg: "#579dff",
    text: "#172b4d",
    border: "#388bff"
  },
  {
    id: "blue_dark",
    family: "blue",
    shade: "dark",
    label: "Azul Escuro",
    bg: "#0055cc",
    text: "#ffffff",
    border: "#0043a4"
  },

  // 7. Sky
  {
    id: "sky",
    family: "sky",
    shade: "light",
    label: "Celeste Claro",
    bg: "#6cc3e0",
    text: "#172b4d",
    border: "#4bb0d1"
  },
  {
    id: "sky_dark",
    family: "sky",
    shade: "dark",
    label: "Celeste Escuro",
    bg: "#206a83",
    text: "#ffffff",
    border: "#185368"
  },

  // 8. Lime
  {
    id: "lime",
    family: "lime",
    shade: "light",
    label: "Limão Claro",
    bg: "#94c748",
    text: "#172b4d",
    border: "#7eb332"
  },
  {
    id: "lime_dark",
    family: "lime",
    shade: "dark",
    label: "Limão Escuro",
    bg: "#4c6b1f",
    text: "#ffffff",
    border: "#3b5417"
  },

  // 9. Pink
  {
    id: "pink",
    family: "pink",
    shade: "light",
    label: "Rosa Claro",
    bg: "#e774bb",
    text: "#ffffff",
    border: "#cf59a1"
  },
  {
    id: "pink_dark",
    family: "pink",
    shade: "dark",
    label: "Rosa Escuro",
    bg: "#943d73",
    text: "#ffffff",
    border: "#782d5c"
  },

  // 10. Black / Slate
  {
    id: "black",
    family: "black",
    shade: "light",
    label: "Cinza",
    bg: "#8590a2",
    text: "#172b4d",
    border: "#6b778c"
  },
  {
    id: "black_dark",
    family: "black",
    shade: "dark",
    label: "Grafite Escuro",
    bg: "#2c3e5d",
    text: "#ffffff",
    border: "#1f2d44"
  }
]

/**
 * Returns color details for any color key, with fallback
 * @param {string} colorId - The color ID (e.g., "green", "green_dark", "orange_light")
 * @returns {Object} Color object containing bg, text, border, family, shade
 */
export const getTrelloColor = (colorId) => {
  if (!colorId) {
    return TRELLO_COLOR_PALETTE[19] // black_dark
  }

  // Handle _light suffix by mapping to the base light shade
  const normalizedId = colorId.endsWith("_light")
    ? colorId.replace("_light", "")
    : colorId

  const match = TRELLO_COLOR_PALETTE.find((c) => c.id === normalizedId)
  if (match) {
    return match
  }

  // Fallback to family base
  const familyMatch = TRELLO_COLOR_PALETTE.find(
    (c) => c.family === normalizedId || c.family === colorId
  )
  if (familyMatch) {
    return familyMatch
  }

  return TRELLO_COLOR_PALETTE[19] // black_dark
}

/**
 * Available environment background themes
 */
export const BOARD_ENVIRONMENT_THEMES = [
  {
    id: "galaxy",
    name: "Galáxia Estelar",
    desc: "Ao Infinito e Além (Estilo Trello)",
    background: "bg-gradient-to-br from-[#0b0f19] via-[#161b33] to-[#080b12]"
  },
  {
    id: "slate",
    name: "Ardósia Escura",
    desc: "Tema escuro limpo e neutro",
    background: "bg-slate-950"
  },
  {
    id: "navy",
    name: "Azul Marinho Trello",
    desc: "Azul profundo clássico",
    background: "bg-gradient-to-br from-[#071b30] via-[#0b2848] to-[#051424]"
  },
  {
    id: "forest",
    name: "Floresta Esmeralda",
    desc: "Verde escuro relaxante",
    background: "bg-gradient-to-br from-[#061e16] via-[#0d3326] to-[#04140f]"
  },
  {
    id: "purple",
    name: "Crepúsculo Roxo",
    desc: "Tons místicos de violeta",
    background: "bg-gradient-to-br from-[#1b0d2e] via-[#2a1347] to-[#12081f]"
  },
  {
    id: "charcoal",
    name: "Carvão Grafite",
    desc: "Cinza industrial sóbrio",
    background: "bg-gradient-to-br from-[#121316] via-[#1c1d22] to-[#0d0e10]"
  },
  {
    id: "oled",
    name: "Preto Puro (OLED)",
    desc: "Máximo contraste e economia de energia",
    background: "bg-black"
  }
]

/**
 * 5 curated high-quality UI fonts plus developer monospace for code
 */
export const BOARD_FONT_OPTIONS = [
  {
    id: "inter",
    name: "Inter",
    category: "Padrão UI",
    desc: "Fonte contemporânea de alta legibilidade, limpa e balanceada.",
    className: "font-inter",
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  {
    id: "opensans",
    name: "Open Sans",
    category: "Clássica e Confortável",
    desc: "Tipografia neutra e confortável para longas leituras e notas.",
    className: "font-opensans",
    fontFamily: "'Open Sans', system-ui, sans-serif"
  },
  {
    id: "roboto",
    name: "Roboto",
    category: "Google Material",
    desc: "Visual geométrico e natural, padrão do ecossistema Google e Android.",
    className: "font-roboto",
    fontFamily: "'Roboto', system-ui, sans-serif"
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "Geométrica Marcante",
    desc: "Curvas modernas, visual expressivo e títulos bem definidos.",
    className: "font-poppins",
    fontFamily: "'Poppins', system-ui, sans-serif"
  },
  {
    id: "jakarta",
    name: "Plus Jakarta Sans",
    category: "Tecnologia e Design",
    desc: "Tipografia refinada e moderna utilizada nas principais plataformas tech.",
    className: "font-jakarta",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
  }
]

/**
 * Finds font definition object by ID with fallback to Inter
 * @param {string} fontId - Font identifier
 * @returns {Object} Font option object
 */
export const getBoardFont = (fontId = "inter") => {
  return BOARD_FONT_OPTIONS.find((f) => f.id === fontId) || BOARD_FONT_OPTIONS[0]
}
