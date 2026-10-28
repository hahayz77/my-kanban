const DRIVE_FILE_NAME = "kanban_latest.json"
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files"

/**
 * Initializes Google OAuth2 Token Client using Google Identity Services (GIS)
 * @param {Object} options - Client configuration options
 * @param {string} options.clientId - Google OAuth Client ID
 * @param {Function} options.callback - Callback triggered upon receiving the token
 * @returns {Object|null} The token client instance or null if GIS is unavailable
 */
export const createGoogleTokenClient = ({ clientId, callback }) => {
  if (typeof window === "undefined" || !window.google || !window.google.accounts) {
    return null
  }

  return window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback
  })
}

/**
 * Searches Google Drive for an existing kanban_latest.json file
 * @param {string} accessToken - OAuth2 Bearer token
 * @returns {Promise<string|null>} The fileId if found, otherwise null
 */
export const findExistingDriveFile = async (accessToken) => {
  const query = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`)
  const url = `${DRIVE_API_URL}?q=${query}&fields=files(id,name)`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar arquivo no Google Drive: ${response.statusText}`)
  }

  const data = await response.json()
  if (data.files && data.files.length > 0) {
    return data.files[0].id
  }

  return null
}

/**
 * Creates a new kanban_latest.json file on Google Drive
 * @param {string} accessToken - OAuth2 Bearer token
 * @param {Object} kanbanState - The Kanban board state
 * @returns {Promise<string>} The created file ID
 */
export const createDriveFile = async (accessToken, kanbanState) => {
  const metadata = {
    name: DRIVE_FILE_NAME,
    mimeType: "application/json"
  }

  const boundary = "-------314159265358979323846"
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(kanbanState, null, 2) +
    closeDelimiter

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Falha ao criar arquivo no Drive: ${errorText}`)
  }

  const createdFile = await response.json()
  return createdFile.id
}

/**
 * Updates an existing file content on Google Drive via PATCH
 * @param {string} accessToken - OAuth2 Bearer token
 * @param {string} fileId - The Google Drive file ID to update
 * @param {Object} kanbanState - The Kanban board state
 * @returns {Promise<string>} The updated file ID
 */
export const updateDriveFile = async (accessToken, fileId, kanbanState) => {
  const response = await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(kanbanState, null, 2)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Falha ao atualizar arquivo no Drive: ${errorText}`)
  }

  const result = await response.json()
  return result.id
}

/**
 * Synchronizes the Kanban state with Google Drive, creating or updating kanban_latest.json
 * @param {string} accessToken - OAuth2 Bearer access token
 * @param {string|null} fileId - Existing Drive file ID if known
 * @param {Object} kanbanState - The Kanban board state
 * @returns {Promise<string>} The synced file ID
 */
export const syncToGoogleDrive = async (accessToken, fileId, kanbanState) => {
  if (!accessToken) {
    throw new Error("Token de acesso do Google não fornecido")
  }

  let targetFileId = fileId

  if (!targetFileId) {
    targetFileId = await findExistingDriveFile(accessToken)
  }

  if (targetFileId) {
    try {
      await updateDriveFile(accessToken, targetFileId, kanbanState)
      return targetFileId
    } catch {
      // If file was deleted remotely, re-create it
      const newId = await createDriveFile(accessToken, kanbanState)
      return newId
    }
  }

  const newId = await createDriveFile(accessToken, kanbanState)
  return newId
}

/**
 * Fetches the latest Kanban data from Google Drive
 * @param {string} accessToken - OAuth2 Bearer token
 * @param {string} fileId - Drive file ID
 * @returns {Promise<Object>} Parsed Kanban state from Drive
 */
export const fetchFromGoogleDrive = async (accessToken, fileId) => {
  const response = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Falha ao baixar dados do Drive: ${response.statusText}`)
  }

  return response.json()
}
