/**
 * SaveLoad.ts
 * Ported from SaveLoad.as (1,130 lines)
 * Persists via electron-store through window.saveAPI bridge (see electron/preload.ts).
 * Save slots: 1, 2, 3, 5, 6, 7, 9, 10, 11 (mirrors original)
 */

import { gs } from '../core/GameState.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import { viewButtonText, viewButtonOutline, buttonWrite, buttonConfirm } from '../ui/ButtonManager.ts'
import { statDisplay } from '../ui/UIManager.ts'
import { regionChange } from '../screens/EventUtilities.ts'

const SAVE_SLOTS = [1, 2, 3, 5, 6, 7, 9, 10, 11]

// ── Internal helpers ───────────────────────────────────────────────────────

function saveKey(slot: number): string {
  return `Nimin_Save${slot}`
}

/** Read save data via electron-store (sync IPC), with localStorage fallback for browser dev. */
function readSlot(slot: number): any | null {
  try {
    if (typeof window !== 'undefined' && window.saveAPI) {
      return window.saveAPI.getSync(saveKey(slot)) ?? null
    }
    const raw = localStorage.getItem(saveKey(slot))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/** Write save data via electron-store (async), with localStorage fallback. */
function writeSlot(slot: number, data: any): void {
  try {
    if (typeof window !== 'undefined' && window.saveAPI) {
      void window.saveAPI.set(saveKey(slot), data)
    } else {
      localStorage.setItem(saveKey(slot), JSON.stringify(data))
    }
  } catch { /* ignore quota / IPC errors */ }
}

function getSaveInfo(slot: number): { day: number; hour: number } | null {
  const data = readSlot(slot)
  return data && data.track ? { day: data.track[2], hour: data.track[3] } : null
}

/** Capture all gs properties into a plain object for JSON serialization.
 * Skips function values (gs.doListen, etc.) — Electron IPC structured clone throws on functions,
 * and JSON.stringify drops them anyway. Skips undefined for the same reason. */
function captureState(): any {
  const state: any = {}
  for (const key of Object.keys(gs)) {
    const v = (gs as any)[key]
    if (typeof v === 'function' || typeof v === 'undefined') continue
    state[key] = v
  }
  // track[2] = day, track[3] = hour (mirrors AS3 format)
  state.track = [gs.versionNumber, 0, gs.day, gs.hour]
  return state
}

/** Restore gs from a saved state object, then re-render the stat bar / region
 *  label so the player sees the loaded state immediately. AS3 doLoad ended with:
 *      regionChange(currentZone); stats(0,0,0,0); dayTime(0); doSexP(0);
 *      toggleSide(); toggleSide();
 *  …which combined refresh the top stat row and side panel. The TS port
 *  previously skipped all of this — gs values were correct after restore but
 *  the stat bar at the top of the window kept showing pre-load HP/Lust/Coin/
 *  Day/Hour/Region until something else (sleep, walk, item use) called
 *  statDisplay(). The user reported "the game does not immediately load save
 *  files - it requires sleeping in order for it to kick in" because of this. */
function restoreState(state: any): void {
  for (const key of Object.keys(gs)) {
    if (key in state) {
      (gs as any)[key] = state[key]
    }
  }
  // Refresh the top stat bar (HP, Lust, Coin, Day, Hour, etc.) and region
  // label. doReturn() (called after doLoad in the listener) handles the main
  // text area + side panel via _doGeneral/updateSide, so no need to do those
  // here.
  statDisplay()
  regionChange(gs.currentZone)
}

// ── doSave ─────────────────────────────────────────────────────────────────

function doSave(slot: number): void {
  const state = captureState()
  if (slot === 4) {
    // "Save as" — native file dialog when running under Electron, blob download otherwise
    if (typeof window !== 'undefined' && window.saveAPI) {
      void window.saveAPI.exportFile(state).then(ok => {
        if (ok) textL('Save exported to file.')
      })
    } else {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Nimin_Save.nim`
      a.click()
      URL.revokeObjectURL(url)
    }
    return
  }
  writeSlot(slot, state)
  textL(`Game saved to slot ${slot}.`)
}

// ── doLoad ─────────────────────────────────────────────────────────────────

function doLoad(slot: number): void {
  // Slot 4 = "Load from file" via native dialog (Electron only)
  if (slot === 4) {
    if (typeof window !== 'undefined' && window.saveAPI) {
      void window.saveAPI.importFile().then(state => {
        if (!state) { textL('Load cancelled or file invalid.'); return }
        try {
          restoreState(state)
          textL('Game loaded from file.\r\rWelcome back to Nimin!')
        } catch {
          textL('Error loading file. Save data may be corrupted.')
        }
      })
    } else {
      textL('File loading is only available in the desktop app.')
    }
    return
  }
  const data = readSlot(slot)
  if (!data) {
    textL(`Slot ${slot} is empty.`)
    return
  }
  try {
    restoreState(data)
    textL(`Game loaded from slot ${slot}.\r\rWelcome back to Nimin!`)
  } catch {
    textL(`Error loading slot ${slot}. Save data may be corrupted.`)
  }
}

// ── saveGo ─────────────────────────────────────────────────────────────────

export function saveGo(): void {
  viewButtonOutline(1,1,1,1,1,1,1,0,1,1,1,1)
  viewButtonText(1,1,1,1,1,1,1,0,1,1,1,1)

  for (const slot of SAVE_SLOTS) {
    const info = getSaveInfo(slot)
    buttonWrite(slot <= 3 ? slot : slot <= 7 ? slot : slot,
      info ? `D:${info.day} H:${info.hour}` : 'Empty')
  }
  if (typeof window !== 'undefined' && window.saveAPI) {
    buttonWrite(4, 'Export to file')
  } else {
    buttonWrite(4, 'Save as')
  }
  buttonWrite(12, 'Return')

  textL('Click on a save slot to save your current game.')
  textLP('\r\r"Export to file" saves a .nim file to a location of your choice.')
  textLP('\r\rOtherwise, click Return to go back.')

  gs.doListen = function() {
    const slot = gs.buttonChoice
    if (slot === 12) { doReturn(); return }
    if (slot === 4) { doSave(4); doReturn(); return }
    if (!SAVE_SLOTS.includes(slot)) return

    const info = getSaveInfo(slot)
    if (info) textL(`Day: ${info.day}, Hour: ${info.hour}:00`)
    else textL(`Slot ${slot} is empty.`)
    textLP(`\r\rAre you sure you want to save to slot ${slot}? Existing data will be overwritten.`)

    buttonConfirm()
    gs.doListen = function() {
      if (gs.buttonChoice === 6) { doSave(slot); doReturn() }
      else saveGo()
    }
  }
}

// ── loadGo ─────────────────────────────────────────────────────────────────

export function loadGo(): void {
  viewButtonOutline(1,1,1,1,1,1,1,0,1,1,1,1)
  viewButtonText(0,0,0,0,0,0,0,0,0,0,0,1)

  for (const slot of SAVE_SLOTS) {
    const info = getSaveInfo(slot)
    if (info) {
      buttonWrite(slot, `D:${info.day} H:${info.hour}`)
      const btn = document.getElementById(`btn-${slot}`)
      if (btn) btn.classList.remove('hidden')
    }
  }
  // Slot 4 = "Load from file" (Electron only)
  if (typeof window !== 'undefined' && window.saveAPI) {
    buttonWrite(4, 'Load from file')
    const btn = document.getElementById('btn-4')
    if (btn) btn.classList.remove('hidden')
  }
  buttonWrite(12, 'Return')

  textL('Click on a save slot to load. Click Return to cancel.')

  gs.doListen = function() {
    const slot = gs.buttonChoice
    if (slot === 12) { doReturn(); return }
    if (slot === 4) { doLoad(4); doReturn(); return }
    if (!SAVE_SLOTS.includes(slot)) return

    const info = getSaveInfo(slot)
    if (!info) { textL(`Slot ${slot} is empty.`); return }

    textL(`Load Day: ${info.day}, Hour: ${info.hour}:00?`)
    textLP(`\r\rThis will replace your current unsaved progress.`)
    buttonConfirm()
    gs.doListen = function() {
      if (gs.buttonChoice === 6) { doLoad(slot); doReturn() }
      else loadGo()
    }
  }
}

// ── Import avoidance for circular ref — doReturn is imported in main.ts ──

// doReturn must be imported by the caller (main.ts wires this up)
let doReturn: () => void = () => {}
export function setDoReturn(fn: () => void): void { doReturn = fn }

// ── loadPreferences ────────────────────────────────────────────────────────

const PREFS_KEY = 'Nimin_Preferences'

export function loadPreferences(): void {
  try {
    let prefs: any = null
    if (typeof window !== 'undefined' && window.saveAPI) {
      prefs = window.saveAPI.getSync(PREFS_KEY)
    } else {
      const raw = localStorage.getItem(PREFS_KEY)
      if (raw) prefs = JSON.parse(raw)
    }
    if (!prefs) return
    if (prefs.theme !== undefined)     gs.theme     = prefs.theme
    if (prefs.fontSize !== undefined)  gs.fontSize  = prefs.fontSize
    if (prefs.fontBold !== undefined)  gs.fontBold  = prefs.fontBold
    if (prefs.fontColor !== undefined) gs.fontColor = prefs.fontColor
    if (prefs.showSide !== undefined)  gs.showSide  = prefs.showSide
  } catch { /* ignore */ }
}

export function savePreferences(): void {
  const prefs = {
    theme: gs.theme,
    fontSize: gs.fontSize,
    fontBold: gs.fontBold,
    fontColor: gs.fontColor,
    showSide: gs.showSide,
  }
  if (typeof window !== 'undefined' && window.saveAPI) {
    void window.saveAPI.set(PREFS_KEY, prefs)
  } else {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }
}
