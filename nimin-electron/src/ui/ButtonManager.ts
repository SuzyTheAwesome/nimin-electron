/**
 * ButtonManager.ts
 * Replaces Flash SimpleButton instances (Choice1–12, Side1–8, Option1–8).
 * Maps button numbers 1-12 to HTML button elements.
 */

import { gs } from '../core/GameState.ts'
import { el, setVisible } from './UIManager.ts'

// ── Button element cache ────────────────────────────────────────────────────

function getChoiceBtn(n: number): HTMLButtonElement {
  return document.getElementById(`btn-${n}`) as HTMLButtonElement
}

function getAmtBadge(n: number): HTMLElement | null {
  return document.getElementById(`amt-${n}`)
}

// ── buttonWrite ─────────────────────────────────────────────────────────────

/** Set the HTML label of a choice button (replaces Choice1.htmlText = ...).
 * Preserves the amount-badge child so stack counts aren't wiped on each relabel. */
export function buttonWrite(buttonNumber: number, buttonText: string): void {
  const btn = getChoiceBtn(buttonNumber)
  if (!btn) return
  const badge = btn.querySelector('.amount-badge') as HTMLElement | null
  btn.innerHTML = buttonText
    .replace(/\r/g, '<br>')
    .replace(/&#60;/g, '<')
    .replace(/&#62;/g, '>')
  if (badge) btn.appendChild(badge)
}

// ── viewButtonText ──────────────────────────────────────────────────────────

/** Show or hide choice button text (visible/clickable) */
export function viewButtonText(
  b1: number, b2: number, b3: number, b4: number,
  b5: number, b6: number, b7: number, b8: number,
  b9: number, b10: number, b11: number, b12: number
): void {
  const vals = [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12]
  vals.forEach((v, i) => {
    const btn = getChoiceBtn(i + 1)
    if (btn) setVisible(btn, v === 1)
  })
}

/** Alias: viewButtonOutline — in Flash this controlled the border; here same as text */
export const viewButtonOutline = viewButtonText

/** Show or hide a single choice button (replaces Choice{N}.visible = true/false in AS3) */
export function setButtonVisible(n: number, visible: boolean): void {
  const btn = getChoiceBtn(n)
  if (btn) setVisible(btn, visible)
}

// ── amountWrite / viewAmount / hideAmount ───────────────────────────────────

export function amountWrite(buttonNum: number, text: string): void {
  const badge = getAmtBadge(buttonNum)
  if (badge) badge.textContent = text
}

export function viewAmount(buttonNum: number, visible: boolean): void {
  const badge = getAmtBadge(buttonNum)
  if (badge) setVisible(badge, visible)
}

export function hideAmount(): void {
  for (let i = 1; i <= 12; i++) viewAmount(i, false)
}

// ── choiceListButtons ───────────────────────────────────────────────────────

import { itemName } from '../content/Items.ts'

export function choiceListButtons(which: string): void {
  viewButtonOutline(0,0,0,0,0,0,0,0,0,0,0,1)
  viewButtonText(0,0,0,0,0,0,0,0,0,0,0,1)
  buttonWrite(4, '&#60;&#60;')
  buttonWrite(8, '>>')
  buttonWrite(12, 'Return')

  const tempArray: string[] = []

  if (which === 'Bag') {
    for (let i = 0; i < gs.bagArray.length; i++) {
      tempArray[i] = gs.bagArray[i] === 0 ? ' ' : itemName(gs.bagArray[i])
    }
    if (gs.inBag) gs.choicePage = gs.bagPage
  } else if (which === 'Stash') {
    for (let i = 0; i < gs.stashArray.length; i++) {
      tempArray[i] = gs.stashArray[i] === 0 ? ' ' : itemName(gs.stashArray[i])
    }
  } else {
    for (let i = 0; i < gs.choiceListArray.length; i++) {
      tempArray[i] = gs.choiceListArray[i]
    }
  }

  if (tempArray.length > 9) {
    setVisible(getChoiceBtn(4), true)
    setVisible(getChoiceBtn(8), true)
    showPageIndicator(true, which)
  }

  // Show amount badges
  const slotMap = [1,2,3,5,6,7,9,10,11]
  for (let s = 0; s < 9; s++) {
    const slot = slotMap[s]
    const idx = s + (gs.choicePage * 9 - 9)
    if (tempArray[idx]) {
      if (which === 'Bag' && gs.bagStackArray[idx] > 1) {
        viewAmount(slot, true)
        amountWrite(slot, String(gs.bagStackArray[idx]))
      }
      if (which === 'Stash' && gs.stashStackArray[idx] > 1) {
        viewAmount(slot, true)
        amountWrite(slot, String(gs.stashStackArray[idx]))
      }
    }
  }

  // Show item buttons
  const btnSlots = [1,2,3,5,6,7,9,10,11]
  for (let s = 0; s < 9; s++) {
    const slot = btnSlots[s]
    const idx = s + (gs.choicePage * 9 - 9)
    if (tempArray[idx] !== undefined) {
      buttonWrite(slot, tempArray[idx])
      setVisible(getChoiceBtn(slot), tempArray[idx] !== ' ')
    }
  }
}

/** choiceListBlanks — make empty-slot buttons clickable for item placement */
export function choiceListBlanks(): void {
  // In the Flash version, this made outline-visible buttons also text-visible
  // so empty slots could be clicked. In DOM, outline visibility suffices.
}

export function choiceListSelect(which: string): void {
  const tempArray: any[] = []
  hideAmount()

  if (which === 'Bag') {
    for (let i = 0; i < gs.bagArray.length; i++) tempArray[i] = gs.bagArray[i]
  } else if (which === 'Stash') {
    for (let i = 0; i < gs.stashArray.length; i++) tempArray[i] = gs.stashArray[i]
  } else {
    for (let i = 0; i < gs.choiceListArray.length; i++) tempArray[i] = gs.choiceListArray[i]
  }

  let tempInt: number
  const bc = gs.buttonChoice
  if (bc < 4)       tempInt = bc - 1
  else if (bc < 8)  tempInt = bc - 2
  else if (bc < 12) tempInt = bc - 3
  else              tempInt = -1

  if (bc !== 4 && bc !== 8 && bc !== 12) {
    gs.choiceListResult[0] = tempArray[tempInt + (gs.choicePage * 9 - 9)]
    gs.choiceListResult[1] = tempInt + (gs.choicePage * 9 - 9)
  } else {
    gs.choiceListResult[0] = ''
    gs.choiceListResult[1] = -1
  }

  if (bc === 4) {
    if (gs.choicePage > 1) gs.choicePage--
    else gs.choicePage = Math.ceil(tempArray.length / 9)
  }
  if (bc === 8) {
    if (gs.choicePage < Math.ceil(tempArray.length / 9)) gs.choicePage++
    else gs.choicePage = 1
  }
  if (gs.inBag) gs.bagPage = gs.choicePage
  if (bc !== 4 && bc !== 8) {
    showPageIndicator(false, '')
    gs.choicePage = 1
  }
}

export function choiceListCheck(...which: any[]): boolean {
  const idx = gs.choiceListArray.indexOf(which[0])
  return idx >= gs.choicePage * 9 - 9 && idx < gs.choicePage * 9
}

export function showPage(visible: boolean, which: string): void { showPageIndicator(visible, which); }

function showPageIndicator(visible: boolean, which: string): void {
  const ind = document.getElementById('page-indicator')!
  if (visible) {
    ind.textContent = `${which}: ${gs.choicePage}`
    ind.classList.remove('hidden')
  } else {
    ind.classList.add('hidden')
  }
}

// ── Common button patterns ──────────────────────────────────────────────────

export function buttonConfirm(): void {
  gs.buttonChoice = 0
  viewButtonText(0,0,0,0,0,1,1,0,0,0,0,0)
  viewButtonOutline(0,0,0,0,0,1,1,0,0,0,0,0)
  buttonWrite(6, 'Yes')
  buttonWrite(7, 'No')
}

export function doNext(): void {
  gs.buttonChoice = 0
  viewButtonOutline(0,0,0,0,0,1,0,0,0,0,0,0)
  viewButtonText(0,0,0,0,0,1,0,0,0,0,0,0)
  buttonWrite(6, 'Next')
}

// ── Side tab buttons ────────────────────────────────────────────────────────

export function initSideTabs(handler: (n: number) => void): void {
  for (let i = 1; i <= 8; i++) {
    const btn = document.getElementById(`side-${i}`)
    if (btn) btn.addEventListener('click', () => handler(i))
  }
}

// ── Option buttons ──────────────────────────────────────────────────────────

export function initOptionButtons(handlers: Record<number, () => void>): void {
  for (const [num, fn] of Object.entries(handlers)) {
    const btn = document.getElementById(`opt-${num}`)
    if (btn) btn.addEventListener('click', fn)
  }
}

// ── Wire all 12 choice buttons ──────────────────────────────────────────────

export function initChoiceButtons(
  onButtonClick: (n: number, shiftHeld: boolean) => void
): void {
  for (let i = 1; i <= 12; i++) {
    const btn = getChoiceBtn(i)
    if (btn) {
      const num = i
      btn.addEventListener('click', () => onButtonClick(num, gs.shiftHeld))
    }
  }
}
