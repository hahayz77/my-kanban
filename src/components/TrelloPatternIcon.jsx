import React from "react"

/**
 * Normalizes any Trello color string into its base color family
 * @param {string} color - The raw color string (e.g. "green_dark", "blue_light")
 * @returns {string} The base family name ("green", "yellow", "orange", etc.)
 */
export const getColorFamily = (color) => {
  if (!color) {
    return "black"
  }
  const normalized = color.toLowerCase().replace(/_light|_dark/g, "")
  const validFamilies = [
    "green",
    "yellow",
    "orange",
    "red",
    "purple",
    "blue",
    "sky",
    "lime",
    "pink",
    "black"
  ]
  return validFamilies.includes(normalized) ? normalized : "black"
}

/**
 * TrelloPatternStrip renders a vertical pattern strip spanning the full height of a card,
 * matching Trello's authentic accessible colorblind patterns running from the top corner to the bottom corner
 * @param {Object} props - Component properties
 * @param {string} [props.color="black"] - Color identifier
 * @param {string} [props.className="w-full h-full"] - Sizing classes
 * @returns {JSX.Element} Full-height repeating SVG pattern strip
 */
export const TrelloPatternStrip = ({
  color,
  className = "w-full h-full block"
}) => {
  const family = getColorFamily(color)
  const safeId = React.useId
    ? React.useId().replace(/[^a-zA-Z0-9]/g, "")
    : Math.random().toString(36).substr(2, 6)
  const patternId = "strip-" + family + "-" + safeId

  // ORANGE: Two parallel solid vertical lines
  if (family === "orange") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="4.5"
              y1="0"
              x2="4.5"
              y2="12"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <line
              x1="9.5"
              y1="0"
              x2="9.5"
              y2="12"
              stroke="currentColor"
              strokeWidth="2.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // BLACK: Vertical dashed stitch line repeating at fixed intervals
  if (family === "black") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="7"
              y1="1"
              x2="7"
              y2="7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // RED: Polka dots alternating in two columns with fixed spacing
  if (family === "red") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4.5" cy="4" r="1.6" fill="currentColor" />
            <circle cx="9.5" cy="12" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // GREEN: Diagonal parallel stripes /// at true 45 degrees
  if (family === "green") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="-4"
              y1="14"
              x2="14"
              y2="-4"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="21"
              x2="21"
              y2="3"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="-11"
              y1="7"
              x2="7"
              y2="-11"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // YELLOW: Rounded arches ∩ repeating with fixed height and curve
  if (family === "yellow") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M3.5 13V6.5a3.5 3.5 0 0 1 7 0V13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // SKY / BLUE: Diagonal stripes ///
  if (family === "sky" || family === "blue") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="-4"
              y1="14"
              x2="14"
              y2="-4"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="21"
              x2="21"
              y2="3"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="-11"
              y1="7"
              x2="7"
              y2="-11"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // PURPLE: Repeating continuous zigzag
  if (family === "purple") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M3.5 0L10.5 6L3.5 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // LIME: Repeating brackets ]
  if (family === "lime") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M9.5 2.5H4.5v4.5h5M9.5 7H4.5v4.5h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // PINK: Double column of dots :::
  if (family === "pink") {
    return (
      <svg
        width="100%"
        height="100%"
        className={`${className} overflow-hidden block`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4.5" cy="3.5" r="1.5" fill="currentColor" />
            <circle cx="9.5" cy="3.5" r="1.5" fill="currentColor" />
            <circle cx="4.5" cy="10.5" r="1.5" fill="currentColor" />
            <circle cx="9.5" cy="10.5" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    )
  }

  // Fallback: vertical dashed line
  return (
    <svg
      width="100%"
      height="100%"
      className={`${className} overflow-hidden block`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          width="14"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="7"
            y1="1"
            x2="7"
            y2="7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

/**
 * TrelloPatternIcon renders the authentic accessible geometric pattern icon for a Trello color family
 * @param {Object} props - Component properties
 * @param {string} props.color - Color string
 * @param {string} [props.className="w-3.5 h-3.5"] - Optional Tailwind CSS class
 * @returns {JSX.Element} Rendered SVG pattern icon
 */
export const TrelloPatternIcon = ({ color, className = "w-3.5 h-3.5" }) => {
  const family = getColorFamily(color)

  switch (family) {
    case "green":
      // Diagonal parallel stripes ///
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M2 14L14 2M0 8L8 0M8 16L16 8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )

    case "yellow":
      // Rounded Greek arch / crenellated meander ∩ ∩
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M3 13V7a3 3 0 0 1 5 0v6M8 13V7a3 3 0 0 1 5 0v6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case "orange":
      // 3 vertical parallel bars |||
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M4 2.5v11M8 2.5v11M12 2.5v11"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )

    case "red":
      // 5 dice dots pattern
      return (
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="12" cy="4" r="1.5" />
          <circle cx="8" cy="8" r="1.6" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      )

    case "purple":
      // Zig-zag / staircase meander
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M3 3h4v5h4v5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case "blue":
      // 3 horizontal parallel bars ≡
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )

    case "sky":
      // 2 slanted raindrops / pill dashes //
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M4 12L7 4M9 12L12 4"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      )

    case "lime":
      // Interlocking brackets / square hook ] [
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M10 3H5v4.5h5M11 8.5H6V13h5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case "pink":
      // Double dotted vertical columns :::
      return (
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="5" cy="4" r="1.4" />
          <circle cx="11" cy="4" r="1.4" />
          <circle cx="5" cy="8" r="1.4" />
          <circle cx="11" cy="8" r="1.4" />
          <circle cx="5" cy="12" r="1.4" />
          <circle cx="11" cy="12" r="1.4" />
        </svg>
      )

    case "black":
    default:
      // Vertical dashed stitch line ┆ ┆
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M6 3v2M6 7v2M6 11v2M10 3v2M10 7v2M10 11v2"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}
