/**
 * Returns Tailwind CSS background and text classes for Trello colors
 * @param {string} colorName - Name of the color
 * @returns {string} Tailwind classes
 */
export const getBadgeColorClass = (colorName) => {
  switch (colorName) {
    case "green":
      return "bg-emerald-600 text-white border-emerald-500"
    case "green_dark":
      return "bg-emerald-800 text-emerald-100 border-emerald-700"
    case "green_light":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    case "yellow":
      return "bg-amber-500 text-slate-950 font-medium border-amber-400"
    case "yellow_dark":
      return "bg-amber-700 text-amber-100 border-amber-600"
    case "yellow_light":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40"
    case "orange":
      return "bg-orange-600 text-white border-orange-500"
    case "orange_dark":
      return "bg-orange-800 text-orange-100 border-orange-700"
    case "orange_light":
      return "bg-orange-500/20 text-orange-300 border-orange-500/40"
    case "red":
      return "bg-rose-600 text-white border-rose-500"
    case "red_dark":
      return "bg-rose-800 text-rose-100 border-rose-700"
    case "red_light":
      return "bg-rose-500/20 text-rose-300 border-rose-500/40"
    case "purple":
      return "bg-purple-600 text-white border-purple-500"
    case "purple_dark":
      return "bg-purple-800 text-purple-100 border-purple-700"
    case "purple_light":
      return "bg-purple-500/20 text-purple-300 border-purple-500/40"
    case "blue":
      return "bg-blue-600 text-white border-blue-500"
    case "blue_dark":
      return "bg-blue-800 text-blue-100 border-blue-700"
    case "blue_light":
      return "bg-blue-500/20 text-blue-300 border-blue-500/40"
    case "sky":
      return "bg-sky-600 text-white border-sky-500"
    case "sky_dark":
      return "bg-sky-800 text-sky-100 border-sky-700"
    case "sky_light":
      return "bg-sky-500/20 text-sky-300 border-sky-500/40"
    case "lime":
      return "bg-lime-500 text-slate-950 font-medium border-lime-400"
    case "lime_dark":
      return "bg-lime-800 text-lime-100 border-lime-700"
    case "lime_light":
      return "bg-lime-500/20 text-lime-300 border-lime-500/40"
    case "pink":
      return "bg-pink-600 text-white border-pink-500"
    case "pink_dark":
      return "bg-pink-800 text-pink-100 border-pink-700"
    case "pink_light":
      return "bg-pink-500/20 text-pink-300 border-pink-500/40"
    case "black":
    case "black_dark":
      return "bg-slate-700 text-slate-100 border-slate-600"
    default:
      return "bg-slate-700 text-slate-200 border-slate-600"
  }
}

/**
 * Returns Tailwind cover header background color class
 * @param {string} colorName - Name of the color
 * @returns {string} Tailwind background class
 */
export const getCoverColorClass = (colorName) => {
  switch (colorName) {
    case "green":
      return "bg-emerald-600"
    case "yellow":
      return "bg-amber-500"
    case "orange":
      return "bg-orange-600"
    case "red":
      return "bg-rose-600"
    case "purple":
      return "bg-purple-600"
    case "blue":
      return "bg-blue-600"
    case "sky":
      return "bg-sky-600"
    case "lime":
      return "bg-lime-500"
    case "pink":
      return "bg-pink-600"
    case "black":
      return "bg-slate-800"
    default:
      return "bg-slate-600"
  }
}
