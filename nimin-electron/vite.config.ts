import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'

// Externals that must NOT be bundled — Electron / Node built-ins are loaded
// from the host process at runtime, not from the bundle.
const electronExternals = [
  'electron',
  'electron-store',
  'path', 'fs', 'os', 'url', 'crypto', 'stream', 'buffer', 'events',
  'node:path', 'node:fs', 'node:os', 'node:url', 'node:crypto',
  'node:stream', 'node:buffer', 'node:events',
]

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process: ESM (matches package.json "type": "module")
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
            emptyOutDir: false,
            lib: {
              entry: 'electron/main.ts',
              formats: ['es'],
              fileName: () => 'main.mjs',
            },
            rollupOptions: {
              external: electronExternals,
            },
          },
        },
      },
      {
        // Preload script: CJS (.cjs extension bypasses package.json "type": "module").
        // Electron's sandboxed preload context requires CommonJS.
        entry: 'electron/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
            emptyOutDir: false,
            lib: {
              entry: 'electron/preload.ts',
              formats: ['cjs'],
              fileName: () => 'preload.cjs',
            },
            rollupOptions: {
              external: electronExternals,
            },
          },
        },
      },
    ]),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
