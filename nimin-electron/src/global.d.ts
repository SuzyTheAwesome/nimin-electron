// Type declarations for APIs exposed by electron/preload.ts via contextBridge.

interface ElectronAPI {
  platform: string
}

interface SaveAPI {
  getSync(key: string): unknown
  hasSync(key: string): boolean
  keysSync(): string[]
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
  exportFile(data: unknown): Promise<boolean>
  importFile(): Promise<unknown | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    saveAPI: SaveAPI
  }
}

export {}
