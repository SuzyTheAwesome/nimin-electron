/**
 * GameEngine.ts
 * Core game loop: doEnd, doProcess, doReturn.
 * Separated here to avoid circular imports.
 */

import { gs } from './GameState.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import { buttonConfirm, doNext, hideAmount } from '../ui/ButtonManager.ts'
import { statDisplay, showPage, showMoveItem } from '../ui/UIManager.ts'
import { updateSide } from '../content/Appearances.ts'
import { itemName, gainItem, passiveItemRemove, itemAdd } from '../content/Items.ts'
import { checkZero, checkDecimal } from './GameUtilities.ts'

// ── Forward declarations (registered by main.ts) ───────────────────────────

let _doBattle:       () => void = () => {}
let _doMasturbate:   () => void = () => {}
let _doGeneral:      () => void = () => {}
let _doDungeon:      () => void = () => {}
let _doBag:          () => void = () => {}
let _doShop:         () => void = () => {}
let _doLustForced:   () => void = () => {}
let _affinityChange: () => void = () => {}
let _dayTime:        (n: number) => void = () => {}

export function registerCallbacks(cb: {
  doBattle:       () => void
  doMasturbate:   () => void
  doGeneral:      () => void
  doDungeon:      () => void
  doBag:          () => void
  doShop:         () => void
  doLustForced:   () => void
  affinityChange: () => void
  dayTime:        (n: number) => void
}): void {
  _doBattle       = cb.doBattle
  _doMasturbate   = cb.doMasturbate
  _doGeneral      = cb.doGeneral
  _doDungeon      = cb.doDungeon
  _doBag          = cb.doBag
  _doShop         = cb.doShop
  _doLustForced   = cb.doLustForced
  _affinityChange = cb.affinityChange
  _dayTime        = cb.dayTime
}

// ── doEnd ──────────────────────────────────────────────────────────────────

export function doEnd(): void {
  gs.choicePage = 1
  showPage(false, '')
  statDisplay()

  if (gs.inBag && gs.lust > 99 && gs.currentState === 2) {
    gs.inBag = false
    hideAmount()
    _doLustForced()
  } else {
    doNext()
    gs.doListen = () => {
      if (gs.buttonChoice === 6) doProcess()
    }
  }
}

// ── doProcess ─────────────────────────────────────────────────────────────

export function doProcess(): void {
  gs.choicePage = 1

  if (!gs.inBag && gs.moveItemID !== 0) {
    textL(`You seem to have not placed your ${itemName(gs.moveItemID)}`)
    if (gs.moveItemStack > 1) textLP(` x${gs.moveItemStack}`)
    textLP(` in your bag. Do you want to discard the item?`)
    buttonConfirm()
    gs.doListen = () => {
      if (gs.buttonChoice === 6) {
        passiveItemRemove(gs.moveItemID)
      } else {
        for (let i = 1; i <= gs.moveItemStack; i++) itemAdd(gs.moveItemID)
      }
      gs.moveItemID = 0
      gs.moveItemStack = 0
      showMoveItem(false)
    }
    return
  }

  if (gs.itemGainArray.length !== 0) {
    gs.itemGainArray.sort()
    gainItem(gs.itemGainArray.pop()!)
  } else if (gs.human !== 0 || gs.horse !== 0 || gs.wolf !== 0 || gs.cat !== 0 || gs.cow !== 0) {
    _affinityChange()
  } else if (gs.hrs !== 0) {
    _dayTime(gs.hrs)
    // If doStatus produced no follow-up text (no pregnancy/eggs/lust/status effects),
    // the screen would just show "Afterwards..." with a Next prompt. Skip that
    // dead beat and return to the previous menu directly. The Day/Hour stat update
    // already conveys that time passed.
    if (gs.currentText.trim() === 'Afterwards...') {
      doReturn()
    }
  } else {
    doReturn()
  }
}

// ── doReturn ──────────────────────────────────────────────────────────────

export function doReturn(): void {
  gs.choicePage = 1
  checkZero()
  checkDecimal()
  if (gs.showSide) updateSide()
  if (!gs.inBag) {
    showPage(false, '')
    hideAmount()
  }

  if      (gs.inBag)              _doBag()
  else if (gs.inShop)             _doShop()
  else if (gs.currentState === 2) _doBattle()
  else if (gs.currentState === 3) _doMasturbate()
  else if (gs.inDungeon)          _doDungeon()
  else if (gs.currentState === 1) _doGeneral()
}
