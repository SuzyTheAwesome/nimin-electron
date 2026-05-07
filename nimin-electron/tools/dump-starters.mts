/**
 * dump-starters.mts
 * Generates a text file containing the appearance() output for every possible
 * starter character combination (race × gender × body type × chance branch).
 *
 * Usage:
 *   node --experimental-strip-types tools/dump-starters.mts
 *
 * Produces: tools/all-starters.txt
 */

// ── Minimal DOM stub ───────────────────────────────────────────────────────
// We're running in pure Node, but the source modules touch document/window
// at call time (not import time, since `el` in UIManager uses lazy arrows).
// Provide just enough to keep getElementById / classList / textContent etc.
// from throwing.

function makeFakeElement(): any {
  const el: any = {
    innerHTML: '',
    textContent: '',
    scrollTop: 0,
    style: {},
    children: [],
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {},
    },
    setAttribute: () => {},
    removeAttribute: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    appendChild: (c: any) => c,
    removeChild: (c: any) => c,
    querySelector: () => null,
    querySelectorAll: () => [],
    focus: () => {},
    click: () => {},
  }
  return el
}

const fakeDoc: any = {
  getElementById: () => makeFakeElement(),
  createElement: () => makeFakeElement(),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: makeFakeElement(),
  documentElement: makeFakeElement(),
  addEventListener: () => {},
}

;(globalThis as any).document = fakeDoc
;(globalThis as any).window = {
  saveAPI: undefined,            // SaveLoad checks `if (window.saveAPI)`
  addEventListener: () => {},
  document: fakeDoc,
}
;(globalThis as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
}

// ── Now safe to import the game modules ────────────────────────────────────

import { gs } from '../src/core/GameState.ts'
import { startStats } from '../src/systems/StatSetup.ts'
import { appearanceGo } from '../src/content/Appearances.ts'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Pin Math.random so percent() is deterministic per run ──────────────────

let pinnedRandom = 0.25
const realRandom = Math.random
Math.random = () => pinnedRandom

// ── Combo definitions (mirrors Intro.ts logic exactly) ─────────────────────

interface Race {
  name: string
  bc: number
  init: () => void
}

interface Gender {
  name: string
  bc: number
  init: () => void
}

interface BodyType {
  name: string
  bc: number
  init: () => void
}

const races: Race[] = [
  {
    name: 'Human', bc: 6,
    init: () => {
      gs.boobTotal = 2
      gs.race = 1; gs.changeMod += 0.5; gs.currentZone = 1; gs.foundSoftlik = true
      gs.humanAffinity = 50; gs.dominant = 1; gs.ears = 1; gs.skinType = 1; gs.faceType = 10
      gs.strength = 15; gs.mentality = 17; gs.libido = 15; gs.sensitivity = 17
    },
  },
  {
    name: 'Equan', bc: 1,
    init: () => {
      gs.boobTotal = 2
      gs.race = 2; gs.foundFirmshaft = true; gs.currentZone = 2; gs.horseAffinity = 50
      gs.cockSizeMod += 1; gs.cockNarrowMod += 0.5; gs.vagSizeMod += 1
      gs.dominant = 2; gs.tail = 2; gs.ears = 2; gs.skinType = 2; gs.faceType = 20
      gs.strength = 17; gs.mentality = 15; gs.libido = 17; gs.sensitivity = 15; gs.tallness = 4
    },
  },
  {
    name: 'Lupan', bc: 3,
    init: () => {
      gs.boobTotal = 2
      gs.race = 3; gs.foundTieden = true; gs.currentZone = 3; gs.wolfAffinity = 50
      gs.knot = true; gs.boobTotal = 6; gs.dominant = 3; gs.tail = 3; gs.ears = 3
      gs.skinType = 2; gs.faceType = 30; gs.strength = 17; gs.mentality = 17
      gs.libido = 15; gs.sensitivity = 15; gs.tallness = -2
      gs.legType = 1
    },
  },
  {
    name: 'Felin', bc: 9,
    init: () => {
      gs.boobTotal = 2
      gs.race = 4; gs.foundSizCalit = true; gs.currentZone = 4; gs.catAffinity = 50
      gs.dominant = 4; gs.heat++; gs.heatMaxTime = 96; gs.heatTime = 96; gs.boobTotal = 6
      gs.tail = 4; gs.ears = 4; gs.skinType = 2; gs.faceType = 40
      gs.strength = 15; gs.mentality = 15; gs.libido = 17; gs.sensitivity = 17; gs.tallness = -3
      gs.legType = 1
    },
  },
  {
    name: 'Lizan', bc: 11,
    init: () => {
      gs.boobTotal = 2
      gs.race = 6; gs.foundOviasis = true; gs.currentZone = 6; gs.lizardAffinity = 50
      gs.dominant = 6; gs.eggLaying = 1; gs.eggTime = 36; gs.eggMaxTime = 36
      gs.tail = 6; gs.ears = 6; gs.skinType = 3; gs.faceType = 60
      gs.strength = 17; gs.mentality = 16; gs.libido = 15; gs.sensitivity = 16; gs.tallness = 2
    },
  },
]

const genders: Gender[] = [
  {
    name: 'Male', bc: 5,
    init: () => {
      gs.gender = 1
      gs.cockSize = 12; gs.ballSize = 4; gs.balls = 2; gs.cockTotal = 1; gs.cockMoist = 1
      gs.strength++
      if (gs.dominant === 1) gs.humanCocks = 1
      if (gs.dominant === 2) gs.horseCocks = 1
      if (gs.dominant === 3) gs.wolfCocks = 1
      if (gs.dominant === 4) gs.catCocks = 1
      if (gs.dominant === 6) { gs.lizardCocks = 2; gs.cockTotal++ }
    },
  },
  {
    name: 'Female', bc: 6,
    init: () => {
      gs.gender = 2
      gs.vagSize = 12; gs.vulvaSize = 5; gs.pregArray = [false, 0, 0, 0, 0]
      gs.vagTotal = 1; gs.vagMoist = 1; gs.clitSize = 2; gs.mentality++
    },
  },
  {
    name: 'Herm', bc: 7,
    init: () => {
      gs.gender = 3
      gs.cockSize = 8; gs.ballSize = 2; gs.balls = 2; gs.cockTotal = 1; gs.cockMoist = 1
      gs.pregArray = [false, 0, 0, 0, 0]; gs.vagTotal = 1; gs.vagMoist = 1
      gs.vagSize = 8; gs.vulvaSize = 3
      if (gs.dominant === 1) gs.humanCocks = 1
      if (gs.dominant === 2) gs.horseCocks = 1
      if (gs.dominant === 3) gs.wolfCocks = 1
      if (gs.dominant === 4) gs.catCocks = 1
      if (gs.dominant === 6) { gs.lizardCocks = 2; gs.cockTotal++ }
      gs.libido++
    },
  },
]

function percent(): number { return Math.floor(Math.random() * 100) + 1 }

const maleBodies: BodyType[] = [
  {
    name: 'Bodybuilder', bc: 1,
    init: () => {
      gs.body = 29; gs.hips = 4; gs.butt = 4
      gs.tallness = 70 + Math.floor(percent() / 10); gs.strength += 1
    },
  },
  {
    name: 'Average', bc: 3,
    init: () => {
      gs.body = 20; gs.hips = 3; gs.butt = 3
      // Same fix applied as in Intro.ts: 6'0" to 6'5" range
      gs.tallness = 72 + Math.floor(percent() / 20); gs.libido += 1
    },
  },
  {
    name: 'Cunt-Boy', bc: 5,
    init: () => {
      gs.body = 20; gs.hips = 3; gs.butt = 3
      gs.tallness = 68 + Math.floor(percent() / 10); gs.libido += 1
      gs.cockSize = 0; gs.ballSize = 0; gs.balls = 0; gs.cockTotal = 0; gs.cockMoist = 0
      gs.humanCocks = 0; gs.horseCocks = 0; gs.wolfCocks = 0; gs.catCocks = 0; gs.lizardCocks = 0
      gs.vagSize = 8; gs.vulvaSize = 3; gs.pregArray = [false, 0, 0, 0, 0]; gs.gender = 2
      gs.vagTotal = 1; gs.vagMoist = 1; gs.clitSize = 2
    },
  },
  {
    name: 'Femme-Boy', bc: 7,
    init: () => {
      gs.body = 15; gs.hips = 7; gs.butt = 6; gs.breastSize = 2; gs.nippleSize = 2
      gs.tallness = 60 + Math.floor(percent() / 10); gs.sensitivity += 1
    },
  },
  {
    name: 'Childlike', bc: 10,
    init: () => {
      gs.body = 7; gs.hips = 1; gs.butt = 2
      gs.tallness = 42 + Math.floor(percent() / 10)
      gs.sensitivity += 2; gs.mentality -= 2; gs.strength -= 4; gs.libido += 2
      gs.cockSize = 6; gs.cockMoist = 1; gs.ballSize = 2
    },
  },
]

const femaleBodies: BodyType[] = [
  {
    name: 'Bodybuilder', bc: 2,
    init: () => {
      gs.body = 29; gs.hips = 5; gs.butt = 4
      gs.tallness = 68 + Math.floor(percent() / 10)
      gs.breastSize = 4; gs.nippleSize = 4; gs.strength += 1
    },
  },
  {
    name: 'Voluptuous', bc: 3,
    init: () => {
      gs.body = 16; gs.hips = 9; gs.butt = 6
      gs.tallness = 60 + Math.floor(percent() / 10)
      gs.breastSize = 10; gs.nippleSize = 10; gs.libido += 2
    },
  },
  {
    name: 'Average', bc: 5,
    init: () => {
      gs.body = 13; gs.hips = 6; gs.butt = 5
      gs.tallness = 60 + Math.floor(percent() / 10)
      gs.breastSize = 6; gs.nippleSize = 6; gs.mentality += 1
    },
  },
  {
    name: 'Childlike', bc: 10,
    init: () => {
      gs.body = 7; gs.hips = 2; gs.butt = 2
      gs.tallness = 41 + Math.floor(percent() / 10)
      gs.sensitivity += 2; gs.mentality -= 2; gs.strength -= 4; gs.libido += 2
      gs.vagSize = 6; gs.breastSize = 2; gs.nippleSize = 2; gs.vulvaSize = 2; gs.clitSize = 1; gs.vagMoist = 1
    },
  },
]

const hermBodies: BodyType[] = [
  {
    name: 'Bodybuilder', bc: 2,
    init: () => {
      gs.body = 29; gs.hips = 4; gs.butt = 4
      gs.tallness = 68 + Math.floor(percent() / 10)
      gs.breastSize = 5; gs.nippleSize = 6; gs.strength += 1
    },
  },
  {
    name: 'Masculine', bc: 5,
    init: () => {
      gs.body = 19; gs.hips = 3; gs.butt = 3
      gs.tallness = 62 + Math.floor(percent() / 10)
      gs.breastSize = 2; gs.nippleSize = 2; gs.libido += 1
    },
  },
  {
    name: 'Feminine', bc: 6,
    init: () => {
      gs.body = 14; gs.hips = 5; gs.butt = 4
      gs.tallness = 58 + Math.floor(percent() / 10)
      gs.breastSize = 6; gs.nippleSize = 6; gs.mentality += 1
    },
  },
  {
    name: 'Childlike', bc: 10,
    init: () => {
      gs.body = 7; gs.hips = 2; gs.butt = 2
      gs.tallness = 42 + Math.floor(percent() / 10)
      gs.sensitivity += 2; gs.mentality -= 2; gs.strength -= 4; gs.libido += 2
      gs.cockSize = 4; gs.cockMoist = 1; gs.ballSize = 1
      gs.vagSize = 4; gs.clitSize = 1; gs.vagMoist = 1; gs.vulvaSize = 1
      gs.breastSize = 1; gs.nippleSize = 1
    },
  },
]

const bodiesByGender: Record<number, BodyType[]> = {
  1: maleBodies,
  2: femaleBodies,
  3: hermBodies,
}

// ── Main: iterate and dump ─────────────────────────────────────────────────

function buildCombo(race: Race, gender: Gender, body: BodyType): string {
  startStats()
  race.init()
  gender.init()
  body.init()
  // Ensure side panel path is NOT taken so textL captures into gs.currentText
  gs.showSide = false
  appearanceGo()
  return gs.currentText || '(no text generated)'
}

const lines: string[] = []
lines.push('═══════════════════════════════════════════════════════════════════════')
lines.push('  NIMIN — STARTER CHARACTER APPEARANCE DUMP')
lines.push('  Generated: ' + new Date().toISOString())
lines.push('  All possible (Race × Gender × Body) combos with both percent() branches.')
lines.push('  "chance ≤ 50" branch uses Math.random=0.25 (percent=26)')
lines.push('  "chance > 50" branch uses Math.random=0.75 (percent=76)')
lines.push('═══════════════════════════════════════════════════════════════════════')
lines.push('')

let comboCount = 0

for (const race of races) {
  for (const gender of genders) {
    const bodies = bodiesByGender[gender.bc === 5 ? 1 : gender.bc === 6 ? 2 : 3]
    for (const body of bodies) {
      // Cunt-Boy in male path forcibly switches gender to 2 mid-init.
      // Skip duplicates in female path that would have same outcome? No — Cunt-Boy is unique to male path.

      lines.push('───────────────────────────────────────────────────────────────────────')
      lines.push(`▼ ${race.name} • ${gender.name} • ${body.name}`)
      lines.push('───────────────────────────────────────────────────────────────────────')

      // Branch 1: chance ≤ 50
      pinnedRandom = 0.25
      const text1 = buildCombo(race, gender, body)
      lines.push('')
      lines.push('[chance ≤ 50 branch]')
      lines.push(text1.replace(/\r\n|\r/g, '\n'))

      // Branch 2: chance > 50
      pinnedRandom = 0.75
      const text2 = buildCombo(race, gender, body)
      lines.push('')
      lines.push('[chance > 50 branch]')
      lines.push(text2.replace(/\r\n|\r/g, '\n'))

      lines.push('')
      comboCount++
    }
  }
}

lines.push('═══════════════════════════════════════════════════════════════════════')
lines.push(`  Total combos dumped: ${comboCount}  (× 2 chance branches = ${comboCount * 2} entries)`)
lines.push('═══════════════════════════════════════════════════════════════════════')

const outPath = join(__dirname, 'all-starters.txt')
writeFileSync(outPath, lines.join('\n'), 'utf8')

// Restore real Math.random (not strictly necessary, script ends here)
Math.random = realRandom

console.log(`✓ Wrote ${comboCount * 2} entries (${comboCount} combos × 2 branches) to:`)
console.log(`  ${outPath}`)
