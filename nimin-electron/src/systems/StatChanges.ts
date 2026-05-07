/**
 * StatChanges.ts
 * Ported from StatChanges.as
 * Core stat modification functions: HP, lust, coin, affinity, pass-out.
 */

import { gs } from '../core/GameState.ts'
import { statDisplay as uiStatDisplay } from '../ui/UIManager.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import { percent } from '../core/GameUtilities.ts'
import { doEnd } from '../core/GameEngine.ts'
import { plural, cockDesc, legDesc, vulvaDesc, skinDesc, clitDesc, nipDesc, boobDesc, legWhere } from '../content/Descriptions.ts'
import { cumAmount, moistCalc } from '../core/Calculations.ts'
import { clothesTop, clothesBottom } from '../content/Clothes.ts'
import { specialKOLose } from '../content/Enemies.ts'
import { doStatus } from './Statuses.ts'
// Body-change calls used by post-orgasm side effects (cockSnakeVenom, milkCPoison)
import { cockChange, vagChange, boobChange } from './Transformations.ts'
import { pregCheck } from './Pregnancy.ts'

// Late-binding hook for lust>=100 forced-masturbate trigger. Set by main.ts
// so we don't pull Masturbation.ts → StatChanges.ts → Masturbation.ts at module load.
let _doLustForcedHook: () => void = () => {}
export function setLustForcedHook(fn: () => void): void { _doLustForcedHook = fn }

// ── statDisplay ─────────────────────────────────────────────────────────────

/**
 * Recompute derived stats (str = strength + strMod etc.) then refresh UI.
 * Called whenever base stats or mods change.
 */
export function statDisplay(): void {
  gs.str  = gs.strength  + gs.strMod
  gs.ment = gs.mentality + gs.mentMod
  gs.lib  = gs.libido    + gs.libMod
  gs.sen  = gs.sensitivity + gs.senMod
  uiStatDisplay()
}

// ── doHP ────────────────────────────────────────────────────────────────────

export function doHP(changes: number): void {
  // MasoPot: pain → lust conversion
  if (gs.masoPot > 0 && gs.sMasoPot <= 0 && changes < 0) {
    doLust(Math.floor(-changes / 2), 0)
    changes -= Math.ceil(changes / 2)
  }
  if (gs.sMasoPot > 0 && gs.lust < 100 && changes < 0) {
    doLust(-changes, 0)
    changes = 0
  }
  if (gs.sMasoPot > 0 && gs.lust >= 100 && changes < 0) {
    textLP('\r\rIt seems that no matter how much fun you had getting beaten like that, there\'s just some things your body wasn\'t meant to withstand.')
  }

  const maxHP = 30 + Math.floor(gs.str / 2) + gs.HPMod
  if ((gs.HP + changes) <= 0) {
    gs.HP = 1
    changes = 0
    doPassOut()
    return
  }
  if ((gs.HP + changes) > maxHP) gs.HP = maxHP
  else gs.HP += changes
  statDisplay()
}

// ── doSexP ──────────────────────────────────────────────────────────────────

export function doSexP(changes: number): void {
  if ((gs.SexP + changes * gs.SexPMod) >= 100) {
    changes -= Math.ceil((100 - gs.SexP) / gs.SexPMod)
    gs.SexP = 0
    gs.level++
    gs.levelUP++
    doSexP(changes)
  } else {
    gs.SexP += changes * gs.SexPMod
  }
  uiStatDisplay()
}

// ── doCoin ──────────────────────────────────────────────────────────────────

export function doCoin(changes: number): void {
  if ((gs.coin + changes) < 0) {
    gs.coin = 0
  } else {
    if (changes > 0) changes += gs.coinMod
    gs.coin += changes
  }
  doSexP(0)
}

// ── dayTime ─────────────────────────────────────────────────────────────────

export function dayTime(time: number): void {
  let addTime = time
  while (gs.hour + addTime >= 24) {
    addTime = addTime - (24 - gs.hour)
    gs.hour = 0
    gs.day++
  }
  gs.hour = gs.hour + addTime
  gs.hrs = 0
  doStatus(time)
  uiStatDisplay()
}

// ── doLust ──────────────────────────────────────────────────────────────────

export function doLust(changes: number, source: number, ...triggers: number[]): void {
  // Source 1 = offensive lust (mentality reduces)
  if (source === 1 && changes > 0) {
    changes -= Math.floor(changes * gs.ment / 125)
    if (changes < 0) changes = 0
  }
  // Source 2 = XP-gaining lust (loss reduced by mentality)
  if (source === 2 && changes <= 0) {
    changes += Math.floor(changes * gs.ment / 125)
  }

  // Orgasm triggers (source 2, negative changes = orgasm happened)
  if (changes <= 0 && source === 2) {
    changes -= 6

    if (gs.fertilityStatueCurse > 0) {
      textLP('\r\rWith your orgasm, you feel strange as wispy fumes escape from your crotch, just like those that descended from the statue you encountered...')
      // AS3 inherited bug fix: TS port had `// vagChange(0, 1) — imported
      // lazily to avoid circular dep` left as a TODO. Transformations.ts has
      // no dependency on StatChanges.ts, so the cycle worry was unfounded —
      // wire the actual call.
      vagChange(0, 1)
    }

    if (gs.cockSnakeVenom > 0 && triggers.indexOf(1) !== -1 && gs.cockTotal > 0) {
      textLP('\r\rHowever, after you have finished, you realize there\'s a bit more meat to your meat... The venom from the cock-snake fed off of your orgasm, causing your appendage' + plural(1) + ' to flop a bit lower down your ' + legDesc(3) + ' as ' + plural(11) + ' shrink' + plural(3) + ' back down...')
      // AS3 inherited bug fix: TS port had `// cockChange(2, 0)` left as a
      // TODO. The cock-snake venom payoff text says "your appendage flops
      // lower" but without cockChange the actual cock size never grows.
      cockChange(2, 0)
    }
    if (gs.cockSnakeVenom > 0 && triggers.indexOf(2) !== -1 && gs.vagTotal > 0) {
      textLP('\r\rHowever, after you have finished, you realize your clit' + plural(2) + ' ' + plural(14) + ' a bit more prominent...')
      gs.clitSize += 3
    }

    if (gs.milkCPoisonNip > 0 && triggers.indexOf(3) !== -1) {
      textLP("\r\rHowever, now that you've calmed down, you notice a bit more weight at your chest... The warmth from the milk creeper poison in your bosom intensified with your pleasure, causing your flesh to grow larger while you were distracted by the climax. A hefty reminder.")
      boobChange(1)
      gs.nipplePlay += 15
    }

    if (gs.milkCPoisonUdd > 0 && triggers.indexOf(4) !== -1) {
      textLP("\r\rHowever, now that you've calmed down, you notice a bit more weight at your belly... The warmth from the milk creeper poison in your udder intensified with your pleasure, causing your flesh to grow larger while you were distracted by the climax. A hefty reminder.")
      boobChange(1)
      gs.nipplePlay += 15
    }
  }

  // ── Lust threshold body-arousal flavor (AS3 inherited bug fix: TS port omitted)
  // At each lust threshold (75/50/25) the body produces visible signs:
  // cocks engorging + leaking pre, vaginas swelling + dripping honey, nipples
  // standing erect. Without this the player crosses arousal levels silently.
  if ((gs.lust + changes) >= 75 && gs.lust < 75) {
    if (gs.cockTotal > 0) {
      textLP('\r\rYour ' + cockDesc() + ' cock' + plural(1) + ' squirm' + plural(3) + ' in your ' + clothesBottom() + ', throbbing and wanting desperately to come.')
      const m1 = moistCalc(1)
      if (m1 > 0 && m1 <= 3)  textLP(' A small amount of pre leaks out, making a moist blotch on your ' + clothesBottom() + '.')
      if (m1 > 3 && m1 <= 7)  textLP(' Steady drops of pre leak out, blotching your ' + clothesBottom() + ' with small patches of slime.')
      if (m1 > 7 && m1 <= 11) textLP(' You feel your cock' + plural(1) + ' slimed from tip to belly with ' + plural(5) + ' own pre, a steady dribble down your thigh and your ' + clothesBottom() + ' looking more like you peed yourself.')
      if (m1 > 11)            textLP(' You feel your cock' + plural(1) + ' swimming in ' + plural(5) + ' own pre, as long strands of slime seep through your ' + clothesBottom() + ' and stretch down to the ground. With each step, you fling the stuff around you like a whip, smacking across whatever is nearby')
    }
    if (gs.vagTotal > 0) {
      textLP('\r\rYour ' + vulvaDesc() + ' lips feel swollen and hot in your ' + clothesBottom() + ', making your ' + legDesc(2) + ' feel weak. Your ' + clitDesc() + ' clit' + plural(2) + ' seem' + plural(4) + ' on the verge of exploding without any attention soon, stiffly rubbing against your ' + clothesBottom() + ' with each move.')
      const m2 = moistCalc(2)
      if (m2 > 0 && m2 <= 3)  textLP(' Your pussy lips slip over each other with each step, slightly lubricated with your arousal.')
      if (m2 > 3 && m2 <= 7)  textLP(' You can feel webs of slime smear across the inside of your ' + clothesBottom() + ', your honey dribbling lightly within.')
      if (m2 > 7 && m2 <= 11) textLP(' You swear you can hear yourself squish with each step as your ' + clothesBottom() + ' is completely soaked through with your honey. Your thighs feel like they\'ve been completely oiled down by the warm, sensuous fluid.')
      if (m2 > 11)            textLP(' There must be a waterfall in your ' + clothesBottom() + ' as a steady flow of clear honey drools from ' + legWhere(1) + ' your ' + legDesc(2) + '. You have to be extra careful of slipping in your own slime...')
    }
    textLP('\r\rYour ' + nipDesc() + 'nipples threaten to pierce through your ' + clothesTop() + '. They feel as hard as diamonds with all your arousal, making you shiver whenever something brushes them.')
  } else if ((gs.lust + changes) >= 50 && gs.lust < 50) {
    if (gs.cockTotal > 0) {
      textLP('\r\rYour ' + cockDesc() + ' cock' + plural(1) + ' feel' + plural(3) + ' stiff and engorged with blood. Oh how nice it would be to take care of that problem... ')
      const m1 = moistCalc(1)
      if (m1 > 0 && m1 <= 3) textLP(' A small amount of pre leaks out, making a moist blotch on your ' + clothesBottom() + '.')
      if (m1 > 3 && m1 <= 7) textLP(' Steady drops of pre leak out, blotching your ' + clothesBottom() + ' with small patches of slime.')
      if (m1 > 7)            textLP(' You feel your cock' + plural(1) + ' slimed from tip to belly with its own pre, a steady dribble down your thigh and your ' + clothesBottom() + ' looking more like you peed yourself.')
    }
    if (gs.vagTotal > 0) {
      textLP('\r\rYour ' + vulvaDesc() + ' vulva feels puffy with engorgement, making you walk a little awkwardly so as to not squeeze them so much. Your ' + clitDesc() + ' clit' + plural(2) + ' stir' + plural(4) + ' in your ' + clothesBottom() + ', throbbing gently in anticipation.')
      const m2 = moistCalc(2)
      if (m2 > 0 && m2 <= 3) textLP(' Your pussy lips slip over each other with each step, slightly lubricated with your arousal.')
      if (m2 > 3 && m2 <= 7) textLP(' You can feel webs of slime smear across the inside of your ' + clothesBottom() + ', your honey dribbling lightly within.')
      if (m2 > 7)            textLP(' You swear you can hear yourself squish with each step as your ' + clothesBottom() + ' is completely soaked through with your honey. Your thighs feel like they\'ve been completely oiled down by the warm, sensuous fluid.')
    }
    if (gs.nipType === 2) textLP('\r\rYour sunken nipples rise out of your ' + boobDesc() + ' mounds, standing to attention in your ' + clothesTop() + '. They tingle slightly with your arousal.')
    else textLP('\r\rYour ' + nipDesc() + 'nipples stand at attention in your ' + clothesTop() + '. They tingle slightly with your arousal.')
  } else if ((gs.lust + changes) >= 25 && gs.lust < 25) {
    if (gs.cockTotal > 0) {
      textLP('\r\rYour ' + cockDesc() + ' cock' + plural(1) + ' wiggle' + plural(3) + ' in your ' + clothesBottom() + ', stirring awake and growing erect. Bulging against the fabric, you silently wonder if anybody else will notice...')
      const m1 = moistCalc(1)
      if (m1 > 0 && m1 <= 3) textLP(' A small amount of pre leaks out, making a moist blotch on your ' + clothesBottom() + '.')
      if (m1 > 3)            textLP(' Steady drops of pre leak out, blotching your ' + clothesBottom() + ' with small patches of slime.')
    }
    if (gs.vagTotal > 0) {
      textLP('\r\rYour ' + vulvaDesc() + ' slit tingles and sparks. You feel a little giggly and warm with the sensation, delighting in the pleasantness of it all. Your ' + clitDesc() + ' clit' + plural(2) + ' tug' + plural(4) + ' at the hood' + plural(4) + ', pulsing awake in your ' + clothesBottom() + '.')
      const m2 = moistCalc(2)
      if (m2 > 0 && m2 <= 3) textLP(' Your pussy lips slip over each other with each step, slightly lubricated with your arousal.')
      if (m2 > 3)            textLP(' You can feel webs of slime smear across the inside of your ' + clothesBottom() + ', your honey dribbling lightly within.')
    }
  }

  // ── Lust threshold stat penalties (AS3 inherited bug fix: TS port omitted these)
  // The original lowered Mentality at 30, Strength at 60, raised Sensitivity at 90.
  // Player's body progressively betrays them as arousal builds.
  if ((gs.lust + changes) >= 30 && gs.lustPenalty === 0) {
    textLP('\r\rThe distraction weighs on your mind constantly, making it hard to focus on normal tasks.')
    statsMod(0, -4, 0, 0)
    gs.lustPenalty = 1
  }
  if ((gs.lust + changes) >= 60 && gs.lustPenalty === 1) {
    textLP('\r\rYour muscles are twitchy and feeling weak from the strong tingle of arousal.')
    statsMod(-5, 0, 0, 0)
    gs.lustPenalty = 2
  }
  if ((gs.lust + changes) >= 90 && gs.lustPenalty === 2) {
    textLP('\r\rThe intense lust has overwhelmed your body, leaving your ' + skinDesc() + ' hypersensitive.')
    statsMod(0, 0, 0, +10)
    gs.lustPenalty = 3
  }

  // ── Lust=100 forced-masturbate trigger (AS3 inherited bug fix: TS port omitted)
  // When lust hits cap, AS3 immediately fired doLustForcedMasturbate(), which
  // either forced a town-side masturbation OR (in combat) ended the fight as
  // a defeat (KO if enemy uninterested, or rape submission). The TS port just
  // clamped lust to 100 and kept going — combat could never end on lust.
  let triggerForced = false
  if ((gs.lust + changes) >= 100) {
    gs.lust = 100
    changes = 0
    if (gs.inBag === false) triggerForced = true
  }

  // ── Heat-driven lust minimum (AS3 inherited bug fix: TS port omitted)
  // Heat keeps player at minLust+20 unless they're already pregnant.
  if ((gs.lust + changes) < gs.minLust + 20 && gs.heat > 0 && gs.heatTime < 0 && !pregCheck(0)) {
    gs.lust = gs.minLust + 20
    changes = 0
  } else if ((gs.lust + changes) < gs.minLust) {
    gs.lust = gs.minLust
    changes = 0
  }

  gs.lust += changes
  if (gs.lust > 100) gs.lust = 100
  if (gs.lust < 0)   gs.lust = 0
  statDisplay()

  if (triggerForced) _doLustForcedHook()
}

// ── statsMod ─────────────────────────────────────────────────────────────────

/** Modify stat modifiers (not base stats). Called by Sleep, exhaustion penalties, etc. */
export function statsMod(stre: number, menta: number, libi: number, sens: number): void {
  gs.strMod  += stre
  gs.mentMod += menta
  gs.libMod  += libi
  gs.senMod  += sens
  statDisplay()
}

// ── doPassOut ────────────────────────────────────────────────────────────────

export function doPassOut(): void {
  const tempNum = Math.floor((percent() / 10) * gs.level + gs.level * percent() / 10)
  const coinLoss = Math.min(tempNum, gs.coin)
  gs.coin -= coinLoss

  textLP('\r\rYou run out of stamina.')
  if (gs.lust >= 30) {
    textLP(' You twitch with a pitiful and premature orgasm, your body too tired to withstand your arousal.')
    if (gs.cockTotal > 0) {
      const getCum = cumAmount()
      if (getCum <= 24)    textLP(' Spunk drools slowly from your softening erection' + plural(1) + '.')
      else if (getCum <= 72)   textLP(' A few small wads of cum ooze down from your softening erection' + plural(1) + '.')
      else if (getCum <= 1000) textLP(' Gobs of cum collect and fall feebly from the tips of your softening erection' + plural(1) + '.')
      else if (getCum <= 2200) textLP(' A stream of squandered spunk flows from your softening erection' + plural(1) + ', like a casual piss.')
      else if (getCum <= 4500) textLP(' Your softening erection' + plural(1) + ' buck slightly as a heavy flow of spunk washes out weakly.')
      else if (getCum <= 20000) textLP(' Cum continually spills from your softening erection' + plural(1) + ', making them buck simply from volume, without any force and pooling beneath you.')
      else textLP(' Your ' + legDesc(2) + ' become drenched in your own white spunk as your softening erection' + plural(1) + ' weakly spew up the contents of your balls, spilling into a puddle around you.')
    }
    if (gs.vagTotal > 0) {
      textLP(' Your ' + vulvaDesc() + ' lips quiver and clench against the air, frustratedly grabbing nothing.')
    }
    textLP(' The climax is completely unsatisfactory and wasted pathetically.')
  }
  textLP(' You collapse to the ground, exhausted.')
  specialKOLose()
  textLP('\r\rYou wake back up some time later, feeling totally drained. Stumbling back to town, you take a moment to reflect and sigh.')
  if (gs.currentState === 2) gs.currentState = 1
  if (gs.inDungeon) gs.inDungeon = false
  doLust(-gs.lust, 3)
  gs.exhaustion -= Math.floor(percent() / 20)
  gs.skipExhaustion = true
  gs.hrs = 2 + Math.floor(percent() / 20)
  doEnd()
}
