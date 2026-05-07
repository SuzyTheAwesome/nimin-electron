/**
 * TextRenderer.ts
 * Replaces Flash TextField htmlText rendering.
 *
 * Flash used a limited HTML subset: <b>, <i>, <u>, <font color="#RRGGBB">,
 * <br>, \r (carriage return as line break), \t (tab).
 * All of these are valid HTML and render correctly in a browser div.
 *
 * The only transformation needed: \r → <br> and \t → &nbsp;&nbsp;
 */

import { gs } from '../core/GameState.ts'
import { el } from './UIManager.ts'

/** Convert AS3 text format to browser HTML */
function asTextToHtml(text: string): string {
  return text
    .replace(/\r\n/g, '<br>')
    .replace(/\r/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    // Convert <font color="#RRGGBB"> → <span style="color:#RRGGBB">
    .replace(/<font\s+color\s*=\s*['"]?(#?[0-9a-fA-F]{6})['"]?\s*>/gi, '<span style="color:$1">')
    .replace(/<\/font>/gi, '</span>')
    // Convert <font size='N'> → <span style="font-size:Npx">
    .replace(/<font\s+size\s*=\s*['"]?(\d+)['"]?\s*>/gi, '<span style="font-size:$1px">')
}

/** textL — set the main output text (replaces outputWindow.htmlText = ...) */
export function textL(text: string): void {
  gs.currentText = text
  gs.textCheckArray = []
  renderOutput()
}

/** textLP — append to the main output text with optional dedup key */
export function textLP(text: string, ...checkKeys: any[]): void {
  if (checkKeys.length === 0 || gs.textCheckArray.indexOf(checkKeys[0]) === -1) {
    gs.currentText = gs.currentText + text
    if (checkKeys.length > 0) {
      gs.textCheckArray = gs.textCheckArray.concat(checkKeys)
    }
  }
  renderOutput()
}

/** Render gs.currentText to the output window */
function renderOutput(): void {
  const out = el.outputWindow()
  out.innerHTML = asTextToHtml(gs.currentText)
  out.scrollTop = 0
}

/** outputSideText — set or append side panel text */
export function outputSideText(text: string, reset: boolean): void {
  if (reset) gs.sideText = text
  else gs.sideText = gs.sideText + text

  const side = el.sideWindow()
  side.innerHTML = asTextToHtml(gs.sideText)
  side.scrollTop = 0
}

/** decGet — format a Number to N decimal places (from GameUtilities) */
export function decGet(number: number, places: number): string {
  const str = String(number)
  const dotIdx = str.indexOf('.')
  if (dotIdx > 0) return str.substring(0, dotIdx + places + 1)
  return str
}
