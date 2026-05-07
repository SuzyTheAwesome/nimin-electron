/**
 * Calculations.ts
 * Ported from Calculations.as
 * Pure math functions — no Flash APIs.
 */

import { gs } from './GameState.ts'

export function trueCockSize(): number {
  return gs.cockSize * gs.cockSizeMod
}

export function trueVagSize(): number {
  if (gs.lust > 30) return gs.vagSize * gs.vagSizeMod
  return (gs.vagSize * gs.vagSizeMod) / 2
}

export function vagLimit(): number {
  return gs.vagSize * (gs.vagSizeMod + gs.vagElastic) + gs.vagSize * gs.vagSizeMod * moistCalc(2) / 10
}

export function eVagLimit(limit: number): number {
  return limit + limit * moistCalc(1) / 10
}

export function relativeBellySize(): number {
  return ((gs.pregnancyTime / 10 + gs.vagBellyMod / 3 + gs.bellyMod / 5) * 60) / gs.tallness
}

export function moistCalc(which: number): number {
  let tempNum = 0
  if (which === 1) tempNum = gs.cockMoist + gs.cockMoistMod
  if (which === 2) tempNum = gs.vagMoist + gs.vagMoistMod
  if (tempNum < 0) tempNum = 0

  if (gs.lust >= 75)      tempNum = Math.ceil(tempNum * 1.5)
  else if (gs.lust >= 50) tempNum = Math.ceil(tempNum * 1)
  else if (gs.lust >= 25) tempNum = Math.ceil(tempNum * 0.75)
  else                    tempNum = Math.ceil(tempNum * 0.25)

  return tempNum
}

export function penisDimension(): number {
  const baseWeight = 0.05
  const totalCS = gs.cockSize * gs.cockSizeMod
  const r = Math.pow((totalCS * baseWeight * 27.77) / (2 * Math.PI * gs.cockNarrowMod), 1 / 3)
  return Math.floor(10 * (2 * Math.PI * r * gs.cockNarrowMod)) / 10.0
}

export function totalBallSize(): number {
  return Math.floor(10 * (gs.blueBalls + gs.ballSize * gs.ballSizeMod)) / 10.0
}

export function ballDimension(): number {
  const baseWeight = 0.005
  return Math.floor(10 * Math.pow(totalBallSize() * baseWeight * 6, 1 / 3)) / 10.0
}

// AS3 inherited bug fix. Original `(ballDimension() * 120) / tallness` blows up
// the ratio so a starting character (ballSize=4, tallness=64) gets ratio ~0.75,
// landing in the "massive"/"hippity-hop" descriptor band — nonsensical for a
// brand-new male character. The ballDesc() threshold table (puny<0.009,
// small<0.016, sizeable<0.033, big<0.066, …) expects sub-unit ratios for
// reasonable balls. Drop the *120 multiplier so starter ballSize=4 yields
// ratio ≈ 0.006 → "puny"/"hard-to-find" — matching expected Flash-equivalent
// output of small descriptors for small testicles.
export function ballRatio(): number {
  return ballDimension() / gs.tallness
}

export function cumAmount(): number {
  const tempNum = Math.floor(totalBallSize() * gs.balls * gs.cumMod)
  gs.blueBalls = 0
  return tempNum
}

export function blueBallsCap(): number {
  return (gs.ballSize * gs.ballSizeMod) / 2
}

/** AS3 1:1 port of milkAmount — was previously a simplified placeholder.
 *  Computes how much milk is extracted from breasts (source=1) or udder (=2),
 *  scales by engorgement level, then calls boobChange/udderChange to shrink
 *  the storage tissue back down. Importing those lazily to avoid circular
 *  dep with Transformations.ts. */
export function milkAmount(source: number): number {
  let tempNum = 0;

  if (source === 1) {
    const breastCap = (gs.breastSize * (gs.breastSize + 1) + gs.tallness / 4 + gs.milkCap) * 2;
    if (gs.milkEngorgement > breastCap) gs.milkEngorgement = breastCap;

    // Per-engorgement-level / per-boobTotal multiplier table (1:1 from AS3)
    const total = gs.boobTotal;
    const lvl = gs.milkEngorgementLevel;
    const e = gs.milkEngorgement;
    let boobMult = 1;
    if      (total === 2)  boobMult = 2;
    else if (total === 4)  boobMult = 4;
    else if (total === 6)  boobMult = 3.5;
    else if (total === 8)  boobMult = 6;
    else if (total === 10) boobMult = 8;

    let lvlMult = 0.5;
    if (lvl === 1) lvlMult = 1;
    if (lvl === 2) lvlMult = 1.2;
    if (lvl >= 3)  lvlMult = 1.5;

    tempNum = e * lvlMult * boobMult;

    // AS3 shrinks breasts after milking out high engorgement
    if (lvl === 1)      { gs.milkEngorgementLevel = 0; _boobChange(-1); }
    else if (lvl === 2) { gs.milkEngorgementLevel = 0; _boobChange(-2); }
    else if (lvl > 2)   { gs.milkEngorgementLevel = 0; _boobChange(-3); }
    gs.milkEngorgement = 0;
  }

  if (source === 2) {
    const udderCap = (gs.udderSize * (gs.udderSize + 1) + gs.tallness / 4 + gs.milkCap) * 2;
    if (gs.udderEngorgement > udderCap) gs.udderEngorgement = udderCap;

    const lvl = gs.udderEngorgementLevel;
    const e = gs.udderEngorgement;
    let lvlMult = 1;
    if (lvl === 1) lvlMult = 2.1;
    if (lvl === 2) lvlMult = 2.7;
    if (lvl >= 3)  lvlMult = 3.5;

    tempNum = e * lvlMult;

    if (lvl === 1)      { gs.udderEngorgementLevel = 0; _udderChange(-2); }
    else if (lvl === 2) { gs.udderEngorgementLevel = 0; _udderChange(-5); }
    else if (lvl > 2)   { gs.udderEngorgementLevel = 0; _udderChange(-8); }
    gs.udderEngorgement = 0;
  }

  return Math.floor(tempNum);
}

/** nipMilkLimit — capacity per hour per nipple (AS3 1:1 port). */
export function nipMilkLimit(): number {
  // AS3: totalNipSize() * nipNarrowMod * 100; 100mL per hour per nip size
  return Math.floor(10 * gs.nippleSize * gs.nippleSizeMod) / 10 * gs.nipNarrowMod * 100;
}

// Lazy-resolved boobChange / udderChange to avoid circular import w/ Transformations.ts.
// Wired up by main.ts on boot via setBreastChangeHooks below.
let _boobChange:  (n: number) => void = () => {}
let _udderChange: (n: number) => void = () => {}
export function setBreastChangeHooks(cb: { boobChange: (n: number) => void; udderChange: (n: number) => void }): void {
  _boobChange  = cb.boobChange
  _udderChange = cb.udderChange
}
