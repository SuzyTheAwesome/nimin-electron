// Breast calculation functions - ported from Breasts.as
import { gs } from '../core/GameState.ts';

export function chestSize(): number {
  const bodyMultiplier = Math.min(gs.body / 200, 0.4);
  return Math.floor(10 * (gs.tallness * (0.46 + bodyMultiplier))) / 10.0;
}

export function breastDimension(): number {
  const base_weight = 0.0625;
  const r = Math.pow(base_weight * gs.breastSize * 6.6, 1 / 3);
  let d = 2 * Math.PI * r;
  d = d - 0.15 * chestSize();
  if (d < 0) d = 0;
  return Math.floor(10 * (chestSize() + d)) / 10.0;
}

export function bustSize(): number {
  let bustMultiplier = 1.0;
  if (gs.boobTotal === 8)  bustMultiplier = 0.8;
  if (gs.boobTotal === 10) bustMultiplier = 0.7;
  return Math.floor(10 * breastDimension() * bustMultiplier) / 10.0;
}

export function totalBust(): number {
  return chestSize() + bustSize();
}

// AS3 inherited bug fix. Original `totalBust() / chestSize()` always returns
// ≥ 2.0 because bustSize() (via breastDimension) already includes chestSize.
// That made every starting character show "impressive" or "belly-covering"
// breasts regardless of actual breastSize. The boobDesc() threshold table
// (1.03=flat, 1.07=tiny, 1.125=palmable, … 2.4=impressive) clearly expects a
// ratio that starts at ~1.0 for tiny breasts and grows from there, so we use
// bustSize/chestSize directly. Verified against expected Flash output for
// human/male/femme-boy starter (breastSize=4, body=15, tallness≈64): yields
// ratio ≈ 1.06 → "tiny"/"nearly flat" descriptor.
export function bustRatio(): number {
  return bustSize() / chestSize();
}

export function totalNipSize(): number {
  return Math.floor(10 * (gs.nippleSize * gs.nippleSizeMod)) / 10.0;
}

export function nipDimension(): number {
  const baseWeight = 0.005;
  const r = Math.pow(totalNipSize() * baseWeight * 27.77 / (2 * Math.PI * gs.nipNarrowMod), 1 / 3);
  return Math.floor(10 * (2 * Math.PI * r * gs.nipNarrowMod)) / 10.0;
}

export function nipTallRatio(): number {
  return nipDimension() / gs.tallness;
}

export function nipBreastRatio(): number {
  const bs = bustSize();
  if (bs > 0) return nipDimension() / bs;
  return 0.0;
}
