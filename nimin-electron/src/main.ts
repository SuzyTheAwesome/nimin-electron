/**
 * main.ts — Nimin: Fetish Fantasy renderer entry point
 * Wires all modules together and initialises the game.
 */

import './styles/game.css'

// ── Core ───────────────────────────────────────────────────────────────────
import { gs } from './core/GameState.ts'
import { registerCallbacks } from './core/GameEngine.ts'

// ── UI ─────────────────────────────────────────────────────────────────────
import { textL } from './ui/TextRenderer.ts'
import {
  viewButtonText, viewButtonOutline, buttonWrite,
  initChoiceButtons, initSideTabs, initOptionButtons, hideAmount,
  doNext,
} from './ui/ButtonManager.ts'
import {
  sideHide, showStatBar, applyFontSettings,
  toggleTheme, fontSizeUp, fontSizeDown, fontSizeReset, toggleBold, toggleColor,
  toggleSide, statDisplay,
} from './ui/UIManager.ts'

// ── Game systems ───────────────────────────────────────────────────────────
import { saveGo, loadGo, loadPreferences, setDoReturn } from './systems/SaveLoad.ts'
import { setLustForcedHook } from './systems/StatChanges.ts'
import { doBag, itemMove } from './systems/Inventory.ts'
import { doBattle, setBattleCallbacks } from './systems/Battling.ts'
import { doMasturbate, doLustForcedMasturbate, setMasturbationCallbacks, setMasturbationDefeatHooks } from './systems/Masturbation.ts'
import { dayTime } from './systems/Sleep.ts'
import { doAlchemy } from './systems/Alchemy.ts'
import { doSleep } from './systems/Sleep.ts'
import { doDaycare } from './systems/Daycare.ts'
import { doProstitution as doProstitute } from './systems/Prostitution.ts'
import { doDungeon } from './systems/Dungeon.ts'
import { doPregnancy } from './systems/Pregnancy.ts'
import { setStatusCallbacks } from './systems/Statuses.ts'

// ── Screens ────────────────────────────────────────────────────────────────
import { doGeneral, doShop, setTownCallbacks } from './screens/TownStuff.ts'
import { doExplore } from './screens/Exploration.ts'
import { newGameGo, setDoGeneral, setDayTime } from './screens/Intro.ts'
import { sideEvent } from './screens/EventUtilities.ts'
import { doReturn } from './core/GameEngine.ts'

// ── Appearances ────────────────────────────────────────────────────────────
import { updateSide } from './content/Appearances.ts'

// ── affinityChange (from Transformations) ───────────────────────────────────
import { affinityChange, setTransformationCallbacks, boobChange, udderChange } from './systems/Transformations.ts'
import { setBreastChangeHooks } from './core/Calculations.ts'

// ── Combat / TF callback dependencies ──────────────────────────────────────
import { doProcess, doEnd } from './core/GameEngine.ts'
import { doRape, doGetRaped, specialKOWin, specialRapeWin } from './content/Enemies.ts'
import { changeTop, changeBot } from './content/Clothes.ts'
import { stats } from './systems/StatSetup.ts'

// ══════════════════════════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════════════════════════

function boot(): void {
  // 1. Load saved preferences (font size, theme, etc.)
  loadPreferences()
  applyFontSettings()

  // 2. Register circular-dep callbacks in GameEngine
  registerCallbacks({
    doBattle,
    doMasturbate,
    doGeneral,
    doDungeon,
    doBag,
    doShop,
    doLustForced: doLustForcedMasturbate,
    affinityChange,
    dayTime,
  })

  // 3. Wire TownStuff callbacks (town navigation functions)
  setTownCallbacks({
    doBag,
    doMasturbate,
    doSleep,
    doDaycare,
    doAlchemy,
    doProstitute,
    doExplore,
  })

  // 4. Wire SaveLoad's doReturn reference
  setDoReturn(doReturn)

  // 4b. Wire StatChanges' lust=100 trigger to point at doLustForcedMasturbate
  setLustForcedHook(doLustForcedMasturbate)

  // 5. Wire Intro's doGeneral reference
  setDoGeneral(doGeneral)

  // 6. Wire Intro's dayTime reference
  setDayTime(dayTime)

  // 6b. Wire pregnancy callbacks into Statuses
  doPregnancy(setStatusCallbacks)

  // 6c. Wire Masturbation system back-buttons (Bag / Return)
  setMasturbationCallbacks({ doGeneral, doBag })

  // 6c-bis. Wire in-combat lust=100 defeat hooks (rape submission or KO)
  setMasturbationDefeatHooks({ doNext, doGetRaped })

  // 6d. Wire Battling callbacks (rape branches, special wins, post-battle flow)
  setBattleCallbacks({
    doBag, doNext, doEnd, doReturn,
    doGetRaped, doRape, specialKOWin, specialRapeWin, doProcess,
  })

  // 6e. Wire Transformations callbacks (stat changes + clothing swaps on TF)
  setTransformationCallbacks({ doProcess, doEnd, changeTop, changeBot, stats })

  // 6f. Wire Calculations.milkAmount → Transformations.boobChange/udderChange
  // (milkAmount has to shrink storage tissue after milking; cycle-safe via late binding)
  setBreastChangeHooks({ boobChange, udderChange })

  // 7. Hide stat bar / side panel initially
  sideHide()

  // 7. Wire the 12 choice buttons
  initChoiceButtons((n: number, shiftHeld: boolean) => {
    if (shiftHeld && gs.inBag && n !== 4 && n !== 8 && n !== 12) {
      // Shift+click in bag = pick up / swap / stack item
      itemMove(n)
    } else {
      gs.buttonChoice = n
      gs.doListen()
    }
  })

  // 8. Wire side tabs
  initSideTabs((n: number) => {
    gs.sideFocus = n
    updateSide()
  })

  // 9. Wire option buttons
  initOptionButtons({
    1: toggleTheme,
    2: fontSizeDown,
    3: fontSizeReset,
    4: fontSizeUp,
    5: toggleBold,
    6: toggleColor,
  })

  // 10. Wire toolbar buttons
  const btnNewGame = document.getElementById('btn-new-game')
  const btnSave    = document.getElementById('btn-save')
  const btnLoad    = document.getElementById('btn-load')
  const btnToggle  = document.getElementById('btn-toggle-side')

  if (btnNewGame) btnNewGame.addEventListener('click', newGameGo)
  if (btnSave)    btnSave.addEventListener('click', saveGo)
  if (btnLoad)    btnLoad.addEventListener('click', loadGo)
  if (btnToggle)  btnToggle.addEventListener('click', toggleSide)

  // 11. Wire keyboard shortcuts
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', (e) => {
    if (!e.shiftKey) gs.shiftHeld = false
  })

  // 12. Show the intro/main menu text
  hideAmount()
  viewButtonText(0,0,0,0,0,0,0,0,0,0,0,0)
  viewButtonOutline(0,0,0,0,0,0,0,0,0,0,0,0)
  textL(`Nimin: Fetish Fantasy\r\tv${gs.versionNumber}\r\rClick 'New Game' to begin a new game.\r\rCreated by:    --Xadera\r     www.furaffinity.net/user/xadera/\r\rOriginal concept by:     --Fenoxo\r     fenoxo.com\r\r\rFor tutorial/guide, questions, or bug reports, visit Xadera's page at the link above.`)
}

// ── Keyboard shortcuts ──────────────────────────────────────────────────────

function onKeyDown(e: KeyboardEvent): void {
  if (e.shiftKey) gs.shiftHeld = true

  if (!gs.shiftHeld) {
    const keyMap: Record<number, number> = {
      103: 1, 81: 1,   // numpad7 / Q → btn 1
      104: 2, 87: 2,   // numpad8 / W → btn 2
      105: 3, 69: 3,   // numpad9 / E → btn 3
      109: 4, 82: 4,   // numpad- / R → btn 4
      100: 5, 65: 5,   // numpad4 / A → btn 5
      101: 6, 83: 6,   // numpad5 / S → btn 6
      102: 7, 68: 7,   // numpad6 / D → btn 7
      107: 8, 70: 8,   // numpad+ / F → btn 8
      97:  9, 90: 9,   // numpad1 / Z → btn 9
      98: 10, 88: 10,  // numpad2 / X → btn 10
      99: 11, 67: 11,  // numpad3 / C → btn 11
      13: 12, 86: 12,  // Enter / V  → btn 12
    }
    const btnNum = keyMap[e.keyCode]
    if (btnNum !== undefined) {
      const btn = document.getElementById(`btn-${btnNum}`)
      if (btn && !btn.classList.contains('hidden')) {
        gs.buttonChoice = btnNum
        gs.doListen()
      }
    }
  }

  // Side panel shortcuts
  if (e.keyCode === 85 && gs.showSide) updateSide()
  if (e.keyCode === 73 && gs.showSide) { gs.sideFocus = 2; updateSide() }
  if (e.keyCode === 79 && gs.showSide) { gs.sideFocus = 3; updateSide() }
  if (e.keyCode === 80 && gs.showSide) { gs.sideFocus = 4; updateSide() }
  if (e.keyCode === 72 && gs.showSide) { gs.sideFocus = 5; updateSide() }
  if (e.keyCode === 74 && gs.showSide) { gs.sideFocus = 6; updateSide() }
  if (e.keyCode === 75 && gs.showSide) { gs.sideFocus = 7; updateSide() }
  if (e.keyCode === 76 && gs.showSide) { gs.sideFocus = 8; updateSide() }

  // Display shortcuts
  if (e.keyCode === 37) toggleTheme()
  if (e.keyCode === 38) fontSizeUp()
  if (e.keyCode === 39) toggleColor()
  if (e.keyCode === 40) fontSizeDown()
  if (e.keyCode === 17) fontSizeReset()
  if (e.keyCode === 191) toggleBold()
  if (e.keyCode === 190) toggleSide()

  // Save / Load
  if (e.keyCode === 113) saveGo()
  if (e.keyCode === 115) loadGo()
  if (e.keyCode === 8) newGameGo()
}

// ── Start ──────────────────────────────────────────────────────────────────
boot()
