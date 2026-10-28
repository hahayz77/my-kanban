/**
 * Formats a date into YYYY-MM-DD_HH-mm-ss string
 * @param {Date} [date=new Date()] - The date to format
 * @returns {string} Formatted timestamp string
 */
export const formatBackupTimestamp = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0")
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

/**
 * Downloads a local JSON backup of the current Kanban state
 * @param {Object} kanbanState - The Kanban state containing board, columns, and cards
 * @returns {void}
 */
export const downloadLocalBackup = (kanbanState) => {
  if (!kanbanState) {
    return
  }

  const timestamp = formatBackupTimestamp(new Date())
  const filename = `kanban_backup_${timestamp}.json`
  const jsonString = JSON.stringify(kanbanState, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const downloadLink = document.createElement("a")
  downloadLink.href = url
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(url)
}

/**
 * Reads and parses an uploaded JSON file
 * @param {File} file - The file object from an input element
 * @returns {Promise<Object>} The parsed JSON data
 */
export const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        resolve(parsed)
      } catch (error) {
        reject(new Error("Falha ao analisar arquivo JSON: " + error.message))
      }
    }
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo selecionado"))
    reader.readAsText(file)
  })
}
