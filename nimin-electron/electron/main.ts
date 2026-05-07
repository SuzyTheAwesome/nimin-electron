import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

// ── Save persistence ────────────────────────────────────────────────────────
const store = new Store({ name: 'nimin-saves' })

// Sync reads (used to populate save slot menu — small & infrequent, safe to block)
ipcMain.on('save:getSync', (e, key: string) => {
  e.returnValue = store.get(key) ?? null
})
ipcMain.on('save:hasSync', (e, key: string) => {
  e.returnValue = store.has(key)
})
ipcMain.on('save:keysSync', (e) => {
  e.returnValue = Object.keys(store.store)
})

// Async writes / deletes
ipcMain.handle('save:set', (_e, key: string, value: unknown) => {
  store.set(key, value)
})
ipcMain.handle('save:delete', (_e, key: string) => {
  store.delete(key)
})

// Native file dialogs for "Save as" / "Load from file"
ipcMain.handle('save:exportFile', async (_e, data: unknown) => {
  const win = BrowserWindow.getFocusedWindow()
  const result = await dialog.showSaveDialog(win!, {
    title: 'Export Nimin Save',
    defaultPath: 'Nimin_Save.nim',
    filters: [{ name: 'Nimin Save', extensions: ['nim', 'json'] }],
  })
  if (result.canceled || !result.filePath) return false
  fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
  return true
})

ipcMain.handle('save:importFile', async () => {
  const win = BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(win!, {
    title: 'Import Nimin Save',
    properties: ['openFile'],
    filters: [{ name: 'Nimin Save', extensions: ['nim', 'json'] }],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    title: 'Nimin: Fetish Fantasy',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
