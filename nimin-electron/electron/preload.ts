// Preload script — exposes a minimal API surface to the renderer.
// Renderer is sandboxed (contextIsolation: true, nodeIntegration: false),
// so all storage/file ops go through this bridge.
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})

contextBridge.exposeInMainWorld('saveAPI', {
  // Sync reads — used by save-slot menu to populate day/hour previews
  getSync: (key: string): unknown => ipcRenderer.sendSync('save:getSync', key),
  hasSync: (key: string): boolean => ipcRenderer.sendSync('save:hasSync', key),
  keysSync: (): string[] => ipcRenderer.sendSync('save:keysSync'),

  // Async writes
  set: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke('save:set', key, value),
  delete: (key: string): Promise<void> =>
    ipcRenderer.invoke('save:delete', key),

  // Native file dialogs
  exportFile: (data: unknown): Promise<boolean> =>
    ipcRenderer.invoke('save:exportFile', data),
  importFile: (): Promise<unknown | null> =>
    ipcRenderer.invoke('save:importFile'),
})
