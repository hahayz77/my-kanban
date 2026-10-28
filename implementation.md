# Plano de Implementação: Kanban Pessoal com Sincronização Drive

## 1. Visão Geral e Regras do Projeto
Este é um aplicativo Kanban offline-first com sincronização no Google Drive. 

**Regras Estritas de Código (Para o Agente CLI):**
- **Sintaxe:** Usar exclusivamente *arrow functions*.
- **Pontuação:** NÃO utilizar ponto e vírgula (semicólon) no final das linhas.
- **Nomenclatura:** Nomes de variáveis, funções e componentes devem estar em **Inglês**.
- **Documentação:** Uso **obrigatório** de JSDocs detalhados em todas as funções criadas, explicando parâmetros e retornos.

**Stack Tecnológico:**
- **Core:** Vite + React (JavaScript, sem TypeScript).
- **Estilização:** Tailwind CSS.
- **Banco Local:** IndexedDB (via `dexie`).
- **Drag & Drop:** `@hello-pangea/dnd`.
- **Nuvem:** Google Drive API v3 (OAuth2 via Google Identity Services).

---

## 2. Fases de Execução

### Fase 1: Setup do Ambiente e Dependências
Instruções para inicializar o projeto no terminal:

1. Criar o scaffolding Vite:
   ```bash
   npm create vite@latest personal-kanban -- --template react
   cd personal-kanban
   ```
2. Instalar dependências core:
   ```bash
   npm install dexie @hello-pangea/dnd lucide-react
   ```
3. Instalar e configurar Tailwind CSS:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
4. Estrutura de diretórios recomendada:
   - `/src/components` (Navbar, Board, Column, Card, Modal)
   - `/src/db` (Configuração do IndexedDB)
   - `/src/services` (Drive API, parser do Trello, backups)
   - `/src/hooks` (Regras de negócio e debounces)

---

### Fase 2: Banco de Dados Local (IndexedDB)
Criação do arquivo `src/db/indexDb.js` usando Dexie.js para armazenamento offline.

**Esquema de Tabelas:**
- `boards`: `id, title, updatedAt`
- `columns`: `id, boardId, order`
- `cards`: `id, columnId, order`
- `metadata`: `key, value` (Para salvar o `driveFileId` e o token de acesso).

*Nota de implementação:* Desenvolver as funções `saveKanbanState` e `loadKanbanState` com JSDocs.

---

### Fase 3: Parser de Importação do Trello
Criação do arquivo `src/services/trelloParser.js`. 
Como o backup do Trello será carregado, este script deve ler o JSON e mapeá-lo para o banco local.

**Mapeamento Esperado:**
- Trello `lists` -> Nossas `columns` (filtrando `closed: true`).
- Trello `cards` -> Nossos `cards` (vinculando pelo `idList` ao `columnId`).

```javascript
/**
 * Parses a raw Trello JSON export into the local Kanban structure
 * @param {Object} trelloData - The parsed JSON object from Trello
 * @returns {Object} Structured data containing board, columns, and cards
 */
export const parseTrelloExport = (trelloData) => {
  // Lógica de conversão sem usar ponto e vírgula
}
```

---

### Fase 4: Serviço de Backup Local e Remoto
Criação dos serviços de exportação em `src/services/backupService.js` e `googleDriveService.js`.

1. **Backup Local:**
   - Função `downloadLocalBackup(kanbanState)`.
   - Deve formatar a data (`YYYY-MM-DD_HH-mm-ss`).
   - Gera um `Blob` JSON e força o download no navegador.

2. **Backup Remoto (Google Drive):**
   - Função `syncToGoogleDrive(accessToken, fileId, kanbanState)`.
   - Se houver `fileId` salvo no Dexie, fazer requisição `PATCH` para sobrescrever `kanban_latest.json`.
   - O disparo dessa função deve ser envelopado em um **Debounce de 3 segundos** (acionado sempre que houver drag & drop ou edição de texto).

---

### Fase 5: Interface do Usuário (UI/UX)
1. **Navbar:** 
   - Botão para "Importar Trello (JSON)".
   - Botões "Baixar Backup" e "Sincronizar Drive".
   - Status visual (Ex: "Salvando...", "Atualizado às 14:02").
2. **Board (Drag & Drop):** 
   - Utilizar `<DragDropContext>`, `<Droppable>` e `<Draggable>` da biblioteca `@hello-pangea/dnd`.
   - Ao soltar um card (`onDragEnd`), atualizar o estado do React, salvar no Dexie.js (imediato) e disparar o timer do Drive (debounce).