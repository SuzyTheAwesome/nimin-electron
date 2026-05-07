/**
 * UIManager.ts
 * Central DOM reference manager.
 * Replaces Flash's display list (stage, MovieClip children, text fields).
 */

// ── Element cache ──────────────────────────────────────────────────────────

export const el = {
  // Output
  outputWindow:   () => document.getElementById('output-window')!,
  sideWindow:     () => document.getElementById('side-window')!,

  // Stat bar
  statBar:        () => document.getElementById('stat-bar')!,
  strNum:         () => document.getElementById('str-num')!,
  mentNum:        () => document.getElementById('ment-num')!,
  libNum:         () => document.getElementById('lib-num')!,
  senNum:         () => document.getElementById('sen-num')!,
  hpNum:          () => document.getElementById('hp-num')!,
  lustNum:        () => document.getElementById('lust-num')!,
  hungerNum:      () => document.getElementById('hunger-num')!,
  levelNum:       () => document.getElementById('level-num')!,
  sexpNum:        () => document.getElementById('sexp-num')!,
  coinNum:        () => document.getElementById('coin-num')!,
  dayNum:         () => document.getElementById('day-num')!,
  hourNum:        () => document.getElementById('hour-num')!,
  currentRegion:  () => document.getElementById('current-region')!,

  // Side panel
  sidePanel:      () => document.getElementById('side-panel')!,

  // Toolbar
  btnNewGame:     () => document.getElementById('btn-new-game')!,
  btnSave:        () => document.getElementById('btn-save')!,
  btnLoad:        () => document.getElementById('btn-load')!,
  btnToggleSide:  () => document.getElementById('btn-toggle-side')!,

  // Page indicator & move item
  pageIndicator:  () => document.getElementById('page-indicator')!,
  moveItemArea:   () => document.getElementById('move-item-area')!,
  moveItemLabel:  () => document.getElementById('move-item-label')!,
  moveItemAmount: () => document.getElementById('move-item-amount')!,
}

// ── Visibility helpers ─────────────────────────────────────────────────────

export function show(element: HTMLElement): void {
  element.classList.remove('hidden')
}

export function hide(element: HTMLElement): void {
  element.classList.add('hidden')
}

export function setVisible(element: HTMLElement, visible: boolean): void {
  if (visible) show(element)
  else hide(element)
}

// ── Stat display update ────────────────────────────────────────────────────

import { gs } from '../core/GameState.ts'
import { savePreferences } from '../systems/SaveLoad.ts'

export function statDisplay(): void {
  el.strNum().textContent   = String(gs.str)
  el.mentNum().textContent  = String(gs.ment)
  el.libNum().textContent   = String(gs.lib)
  el.senNum().textContent   = String(gs.sen)
  el.hpNum().textContent    = String(gs.HP)
  el.lustNum().textContent  = String(gs.lust)
  el.hungerNum().textContent = String(gs.hunger)
  el.levelNum().textContent = String(gs.level)
  el.sexpNum().textContent  = String(gs.SexP)
  el.coinNum().textContent  = String(gs.coin)
  el.dayNum().textContent   = String(gs.day)
  el.hourNum().textContent  = String(gs.hour)
}

// ── Region display ─────────────────────────────────────────────────────────

const ZONE_NAMES: Record<number, string> = {
  1: 'Softlik',
  2: 'Firmshaft',
  3: 'Tieden',
  4: "Siz'Calit",
  5: 'Valley',
  6: 'Oviasis',
}

export function regionChange(zone: number): void {
  const name = ZONE_NAMES[zone] ?? 'Unknown'
  el.currentRegion().textContent = name
  gs.currentZone = zone
}

// ── Page indicator ─────────────────────────────────────────────────────────

export function showPage(visible: boolean, which: string): void {
  const ind = el.pageIndicator()
  if (visible) {
    ind.textContent = `${which}: ${gs.choicePage}`
    show(ind)
  } else {
    hide(ind)
  }
}

// ── Move item display ──────────────────────────────────────────────────────

export function showMoveItem(visible: boolean): void {
  setVisible(el.moveItemArea(), visible)
}

// ── Show/hide entire side panel ────────────────────────────────────────────

export function sideHide(): void { hide(el.sidePanel()) }
export function sideShow(): void { show(el.sidePanel()) }

export function toggleSide(): void {
  const panel = el.sidePanel()
  if (panel.classList.contains('hidden')) {
    show(panel)
    gs.showSide = true
  } else {
    hide(panel)
    gs.showSide = false
  }
  savePreferences()
}

// ── Show stat bar (called after new game starts) ───────────────────────────

export function showStatBar(): void {
  show(el.statBar())
  show(el.btnSave())
  show(el.btnLoad())
  show(el.btnToggleSide())
}

// ── Font / theme helpers ───────────────────────────────────────────────────

export function applyFontSettings(): void {
  document.documentElement.style.setProperty('--font-size', `${gs.fontSize}px`)
  if (gs.fontBold) {
    document.getElementById('output-window')!.style.fontWeight = 'bold'
    document.getElementById('side-window')!.style.fontWeight = 'bold'
  } else {
    document.getElementById('output-window')!.style.fontWeight = 'normal'
    document.getElementById('side-window')!.style.fontWeight = 'normal'
  }
  const color = '#' + gs.fontColor
  document.getElementById('output-window')!.style.color = color
  document.getElementById('side-window')!.style.color = color
}

export function toggleTheme(): void {
  gs.theme = gs.theme === 0 ? 1 : 0
  document.body.classList.toggle('light-theme', gs.theme === 1)
  savePreferences()
}

export function fontSizeUp(): void {
  gs.fontSize = Math.min(gs.fontSize + 1, 24)
  applyFontSettings()
  savePreferences()
}

export function fontSizeDown(): void {
  gs.fontSize = Math.max(gs.fontSize - 1, 8)
  applyFontSettings()
  savePreferences()
}

export function fontSizeReset(): void {
  gs.fontSize = 14
  applyFontSettings()
  savePreferences()
}

export function toggleBold(): void {
  gs.fontBold = !gs.fontBold
  applyFontSettings()
  savePreferences()
}

export function toggleColor(): void {
  // Cycle: light grey → white → yellow → green
  const colors = ['cccccc', 'ffffff', 'ffff88', '88ff88']
  const idx = colors.indexOf(gs.fontColor)
  gs.fontColor = colors[(idx + 1) % colors.length]
  applyFontSettings()
  savePreferences()
}
