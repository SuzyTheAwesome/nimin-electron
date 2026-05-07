/**
 * GameUtilities.ts
 * Ported from GameUtilities.as
 * Core utility functions: checkZero, checkDecimal, percent, chooseFrom,
 * choiceList helpers, and UI state helpers.
 */

import { gs } from './GameState.ts'
import { textLP } from '../ui/TextRenderer.ts'
import { viewButtonText, viewButtonOutline, buttonWrite, hideAmount, viewAmount, amountWrite, choiceListButtons as _clb, choiceListSelect as _cls } from '../ui/ButtonManager.ts'

// Re-exports from ButtonManager for consumers of GameUtilities
export { hideAmount, viewAmount, amountWrite, choiceListButtons, choiceListSelect } from '../ui/ButtonManager.ts'

// ── checkZero ─────────────────────────────────────────────────────────────

export function checkZero(): void {
  if (gs.cockSize < 0)     gs.cockSize = 0
  if (gs.cockTotal < 0)    gs.cockTotal = 0
  if (gs.balls < 0)        gs.balls = 0
  if (gs.balls === 0 && gs.blueBalls > 0) gs.blueBalls = 0
  if (gs.ballSize < 1)     gs.ballSize = 1
  if (gs.cockMoist < 0)    gs.cockMoist = 0
  if (gs.cockMoist > 12)   gs.cockMoist = 12
  if (gs.breastSize < 0)   gs.breastSize = 0
  if (gs.boobTotal < 0)    gs.boobTotal = 0
  if (gs.nippleSize < 1)   gs.nippleSize = 1
  if (gs.udderSize < 1)    gs.udderSize = 1
  if (gs.teatSize < 2)     gs.teatSize = 2
  if (gs.clitSize < 1)     gs.clitSize = 1
  if (gs.vagSize < 0)      gs.vagSize = 0
  if (gs.vagTotal < 0)     gs.vagTotal = 0
  if (gs.vagMoist < 0)     gs.vagMoist = 0
  if (gs.vagMoist > 12)    gs.vagMoist = 12
  if (gs.vulvaSize < 0)    gs.vulvaSize = 0
  if (gs.exhaustion < 0)       gs.exhaustion = 0
  if (gs.exhaustionPenalty < 0) gs.exhaustionPenalty = 0
  if (gs.hips < 1)         gs.hips = 1
  if (gs.butt < 1)         gs.butt = 1
  if (gs.body < 5)         gs.body = 5
  if (gs.tallness < 3)     gs.tallness = 3
  if (gs.cockSizeMod < 0.1) gs.cockSizeMod = 0.1
  if (gs.vagSizeMod < 0.1) gs.vagSizeMod = 0.1
  if (gs.vagBellyMod < 0)  gs.vagBellyMod = 0
  if (gs.pregChanceMod < -100) gs.pregChanceMod = -100
  if (gs.lactation < 0)    gs.lactation = 0
  if (gs.milkMod < 0)      gs.milkMod = 0
  if (gs.milkCap < 0)      gs.milkCap = 0
  if (gs.coin < 0)         gs.coin = 0
  if (gs.hipMod < 1)       gs.hipMod = 1
  if (gs.buttMod < 1)      gs.buttMod = 1
  if (gs.bellyMod < 0)     gs.bellyMod = 0
  if (gs.breastSizeMod < 0.1) gs.breastSizeMod = 0.1
  if (gs.nippleSizeMod < 0.1) gs.nippleSizeMod = 0.1
  if (gs.nipNarrowMod < 0.1)  gs.nipNarrowMod = 0.1
  if (gs.cockNarrowMod < 0.1) gs.cockNarrowMod = 0.1
  if (gs.clitNarrowMod < 0.1) gs.clitNarrowMod = 0.1
  if (gs.ballSizeMod < 0.1)   gs.ballSizeMod = 0.1

  // Ensure pregArray has enough slots
  while (gs.pregArray.length < gs.vagTotal * 5) {
    gs.pregArray.push(false, 0, 0, 0, 0)
  }
}

// ── checkDecimal ──────────────────────────────────────────────────────────

export function checkDecimal(): void {
  const r1  = (n: number) => Math.round(n * 10) / 10
  const r2  = (n: number) => Math.round(n * 100) / 100

  gs.cumMod         = r1(gs.cumMod)
  gs.cockSizeMod    = r2(gs.cockSizeMod)
  gs.vagSizeMod     = r2(gs.vagSizeMod)
  gs.breastSizeMod  = r2(gs.breastSizeMod)
  gs.nippleSizeMod  = r2(gs.nippleSizeMod)
  gs.nipNarrowMod   = r2(gs.nipNarrowMod)
  gs.cockNarrowMod  = r2(gs.cockNarrowMod)
  gs.clitNarrowMod  = r2(gs.clitNarrowMod)
  gs.ballSizeMod    = r2(gs.ballSizeMod)
  gs.vagElastic     = r1(gs.vagElastic)
  gs.changeMod      = r1(gs.changeMod)
  gs.SexPMod        = r1(gs.SexPMod)
  gs.pregRate       = r2(gs.pregRate)

  gs.maleFetish         = r1(gs.maleFetish)
  gs.femaleFetish       = r1(gs.femaleFetish)
  gs.hermFetish         = r1(gs.hermFetish)
  gs.narcissistFetish   = r1(gs.narcissistFetish)
  gs.dependentFetish    = r1(gs.dependentFetish)
  gs.dominantFetish     = r1(gs.dominantFetish)
  gs.submissiveFetish   = r1(gs.submissiveFetish)
  gs.lboobFetish        = r1(gs.lboobFetish)
  gs.sboobFetish        = r1(gs.sboobFetish)
  gs.furryFetish        = r1(gs.furryFetish)
  gs.scalyFetish        = r1(gs.scalyFetish)
  gs.smoothyFetish      = r1(gs.smoothyFetish)
  gs.pregnancyFetish    = r1(gs.pregnancyFetish)
  gs.bestialityFetish   = r1(gs.bestialityFetish)
  gs.milkFetish         = r1(gs.milkFetish)
  gs.sizeFetish         = r1(gs.sizeFetish)
  gs.unbirthingFetish   = r1(gs.unbirthingFetish)
  gs.ovipositionFetish  = r1(gs.ovipositionFetish)
  gs.toyFetish          = r1(gs.toyFetish)
  gs.hyperFetish        = r1(gs.hyperFetish)
}

// ── Random helpers ─────────────────────────────────────────────────────────

/** Returns random int 1–100 */
export function percent(): number {
  return Math.floor(Math.random() * 100) + 1
}

/** Pick a random value from gs.rndArray and clear it */
export function chooseFrom(): number {
  gs.rndResult = 0
  if (gs.rndArray.length < 1) {
    textLP('\r\rAn ERROR has occurred in the choice array. Please report this bug.')
    gs.rndArray = []
  } else {
    const idx = Math.round(Math.random() * (gs.rndArray.length - 1))
    gs.rndResult = gs.rndArray[idx]
    gs.rndArray = []
  }
  return gs.rndResult
}

// ── Item check helpers (re-exported from Items for convenience) ────────────
export { checkItem, checkMagicItem, checkStash, countItem } from '../content/Items.ts'
