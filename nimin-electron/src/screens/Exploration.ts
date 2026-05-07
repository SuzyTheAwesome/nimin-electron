/**
 * Exploration.ts
 * Ported from Exploration.as
 * World navigation (doExplore) and time-based event selection (eventSelect).
 */

import { gs, bc } from '../core/GameState.ts'
import { viewButtonText, viewButtonOutline, buttonWrite } from '../ui/ButtonManager.ts'
import { regionChange } from '../screens/EventUtilities.ts'
import { chooseFrom } from '../core/GameUtilities.ts'
import { checkItem, checkStash } from '../content/Items.ts'

// Location event imports
import { doForest }    from '../events/Forest.ts'
import { doDairyFarm } from '../events/DairyFarm.ts'
import { doPlains }    from '../events/Plains.ts'
import { doValley }    from '../events/Valley.ts'
import { doSavanna }   from '../events/Savanna.ts'
import { doDesert }    from '../events/Desert.ts'
import { doCave as doOldCave } from '../events/Cave.ts'
import { doLake }      from '../events/Lake.ts'
import { doJungle }    from '../events/Jungle.ts'
import { doBeach }     from '../events/Beach.ts'
import { doDen }       from '../events/Den.ts'
import { doSanctuary } from '../events/Sanctuary.ts'

// Town event imports
import { doSoftlik }   from '../events/Softlik.ts'
import { doFirmshaft } from '../events/Firmshaft.ts'
import { doTieden }    from '../events/Tieden.ts'
import { doSizCalit }  from '../events/SizCalit.ts'
import { doOviasis }   from '../events/Oviasis.ts'

// ── doOldCaveDescent (forward ref — implemented in Dungeon) ────────────────

let _doOldCaveDescent: () => void = () => {}
export function setDoOldCaveDescent(fn: () => void): void { _doOldCaveDescent = fn }
export function triggerOldCaveDescent(): void { _doOldCaveDescent() }

// ── doExplore ─────────────────────────────────────────────────────────────────

export function doExplore(): void {
  bc()

  if (gs.currentZone === 1) {
    viewButtonOutline(1,0,0,0,0,1,1,0,0,1,0,0)
    viewButtonText(1,0,0,0,0,1,1,0,0,1,0,0)
    buttonWrite(6, 'Softlik')
    buttonWrite(1, 'Forest')
    buttonWrite(7, 'Dairy Farm')
    buttonWrite(10, 'Plains')
    if (gs.foundValley) {
      viewButtonOutline(1,0,0,0,0,1,1,0,1,1,0,0)
      viewButtonText(1,0,0,0,0,1,1,0,1,1,0,0)
      buttonWrite(9, 'Valley')
    }
    gs.doListen = () => {
      if (gs.buttonChoice === 6)  doSoftlik()
      if (gs.buttonChoice === 1)  doForest()
      if (gs.buttonChoice === 7)  doDairyFarm()
      if (gs.buttonChoice === 10) doPlains()
      if (gs.buttonChoice === 9)  doValley()
    }
  }

  if (gs.currentZone === 2) {
    viewButtonOutline(0,0,1,0,1,1,0,0,1,0,1,0)
    viewButtonText(0,0,1,0,1,1,0,0,1,0,1,0)
    buttonWrite(6, 'Firmshaft')
    buttonWrite(3, 'Plains')
    buttonWrite(5, 'Savanna')
    buttonWrite(9, 'Desert')
    buttonWrite(11, 'Old Cave')
    if (gs.foundValley) {
      viewButtonOutline(1,0,1,0,1,1,0,0,1,0,1,0)
      viewButtonText(1,0,1,0,1,1,0,0,1,0,1,0)
      buttonWrite(1, 'Valley')
    }
    gs.doListen = () => {
      if (gs.buttonChoice === 6)  doFirmshaft()
      if (gs.buttonChoice === 3)  doPlains()
      if (gs.buttonChoice === 5)  doSavanna()
      if (gs.buttonChoice === 9)  doDesert()
      if (gs.buttonChoice === 11) doOldCave()
      if (gs.buttonChoice === 1)  doValley()
    }
  }

  if (gs.currentZone === 3) {
    viewButtonOutline(0,0,0,0,1,1,1,0,0,1,0,0)
    viewButtonText(0,0,0,0,1,1,1,0,0,1,0,0)
    buttonWrite(6, 'Tieden')
    buttonWrite(5, 'Lake')
    buttonWrite(7, 'Forest')
    buttonWrite(10, 'Jungle')
    if (gs.foundValley) {
      viewButtonOutline(0,0,0,0,1,1,1,0,0,1,0,1)
      viewButtonText(0,0,0,0,1,1,1,0,0,1,0,1)
      buttonWrite(11, 'Valley')
    }
    gs.doListen = () => {
      if (gs.buttonChoice === 6)  doTieden()
      if (gs.buttonChoice === 5)  doLake()
      if (gs.buttonChoice === 7)  doForest()
      if (gs.buttonChoice === 10) doJungle()
      if (gs.buttonChoice === 11) doValley()
    }
  }

  if (gs.currentZone === 4) {
    viewButtonOutline(0,1,0,0,0,1,1,0,1,0,1,0)
    viewButtonText(0,1,0,0,0,1,1,0,1,0,1,0)
    buttonWrite(6, "Siz'Calit")
    buttonWrite(2, 'Jungle')
    buttonWrite(7, 'Savanna')
    buttonWrite(9, 'Beach')
    buttonWrite(11, 'Desert')
    if (gs.foundValley) {
      viewButtonOutline(0,1,1,0,0,1,1,0,1,0,1,0)
      viewButtonText(0,1,1,0,0,1,1,0,1,0,1,0)
      buttonWrite(3, 'Valley')
    }
    gs.doListen = () => {
      if (gs.buttonChoice === 6)  doSizCalit()
      if (gs.buttonChoice === 2)  doJungle()
      if (gs.buttonChoice === 7)  doSavanna()
      if (gs.buttonChoice === 9)  doBeach()
      if (gs.buttonChoice === 11) doDesert()
      if (gs.buttonChoice === 3)  doValley()
    }
  }

  if (gs.currentZone === 6) {
    viewButtonOutline(0,1,0,0,0,1,0,0,0,0,0,0)
    viewButtonText(0,1,0,0,0,1,0,0,0,0,0,0)
    buttonWrite(6, 'Oviasis')
    buttonWrite(2, 'Desert')
    if (gs.silRep > 0) {
      viewButtonOutline(0,1,1,0,0,1,0,0,0,0,0,0)
      viewButtonText(0,1,1,0,0,1,0,0,0,0,0,0)
      buttonWrite(3, 'Den')
    }
    gs.doListen = () => {
      if (gs.buttonChoice === 6) doOviasis()
      if (gs.buttonChoice === 2) doDesert()
      if (gs.buttonChoice === 3) doDen()
    }
  }

  if (gs.currentZone === 12) {
    viewButtonOutline(0,0,0,0,1,1,0,0,0,0,0,0)
    viewButtonText(0,0,0,0,1,1,0,0,0,0,0,0)
    buttonWrite(6, 'Sanctuary')
    buttonWrite(5, 'Cave Descent')
    gs.doListen = () => {
      if (gs.buttonChoice === 6) doSanctuary()
      if (gs.buttonChoice === 5) {
        gs.inDungeon = true
        regionChange(1007)
        _doOldCaveDescent()
      }
    }
  }
}

// ── eventSelect ───────────────────────────────────────────────────────────────

/** Select a random event from the available set for the given location.
 *  Returns an event number (used by event handlers) or 0 if none available.
 *  AS3 used sparse arrays (x = non-null, missing = null) keyed by gs.hour (0-23).
 *  We replicate by listing which hours are active for each event. */
export function eventSelect(which: string): number {
  gs.rndArray = []
  const h = gs.hour  // current hour (0-23)

  function hrs(...active: number[]): boolean {
    return active.indexOf(h) !== -1
  }

  // ── Towns ──────────────────────────────────────────────────────────────────
  if (which === 'Softlik') {
    if (hrs(6,8,10,12,14,16,18,20,22))               gs.rndArray.push(1)  // Squeaky Cheese
    if (hrs(0,1,2,3,4,5,7,9,16,18,20,22))            gs.rndArray.push(2)  // Male Enhance
    if (hrs(9,11,13,15))                              gs.rndArray.push(3)  // Too Human
    gs.rndArray.push(4)                                                     // Gen (always)
  } else if (which === 'Firmshaft') {
    if (hrs(9,11,13,15,17,19,21,23))                  gs.rndArray.push(1)  // Jamie
    if (hrs(0,1,2,3,4,5,6,7,8,10,12,14,16,18,20,22)) gs.rndArray.push(2)  // Harem
    gs.rndArray.push(3)                                                     // Gen
  } else if (which === 'Tieden') {
    if (hrs(0,1,2,3,4,5,6,7,8,21,22,23))             gs.rndArray.push(1)  // Knothole
    if (hrs(9,10,11,12,13,14,15,16,17,18,19,20) && gs.pregnancyTime >= 180 && gs.vagTotal > 0) gs.rndArray.push(2) // Preggo Lover
    if (hrs(9,10,11,12,13,14,15,16,17,18,19,20))     gs.rndArray.push(3)  // Gen
  } else if (which === "Siz'Calit") {
    if (hrs(13,14,15,16,17,18))                       gs.rndArray.push(1)  // Lila
    if (hrs(10,11,12,13,18,19,20) && gs.lilaRep > 3) gs.rndArray.push(1)  // Lila+
    if (hrs(0,1,2,3,4,21,22,23))                      gs.rndArray.push(2)  // Cat Attack
    if (hrs(5,6,7,8,9,10,11,12))                      gs.rndArray.push(3)  // Hyper Mistress
    gs.rndArray.push(4)                                                     // Gen
  } else if (which === 'Oviasis') {
    if (hrs(15,16,17,18,19) && gs.silRep < 6)        gs.rndArray.push(1)  // Silandrias
    if (hrs(9,10,11,12,13,14,15,16,17,18))           gs.rndArray.push(2)  // Sunbathing
    if (hrs(0,1,2,3,4,5,21,22,23))                   gs.rndArray.push(3)  // Night Sex
    if (hrs(6,7,8,9,10,11,12,13,14,19,20,21))        gs.rndArray.push(4)  // Water Eggs
    if (hrs(0,1,2,3,4,5,7,8,20,22,23))               gs.rndArray.push(5)  // Gen
  } else if (which === 'Sanctuary') {
    gs.rndArray.push(3)                                                     // Gen (always)
  }

  // ── Shared areas ───────────────────────────────────────────────────────────
  if (which === 'Forest') {
    if (hrs(1,3,5,19,20,22,23))                       gs.rndArray.push(1)  // Wolf
    if (hrs(0,2,4,6,21,23))                           gs.rndArray.push(2)  // Gay Wolf
    if (hrs(13,14,15,16,17,18))                       gs.rndArray.push(3)  // Cock-Snake
    if (hrs(0,7,8,17,18,23))                          gs.rndArray.push(4)  // Sneeze Flower
    if (hrs(7,8,9,10,11,12))                          gs.rndArray.push(5)  // Milk Creeper
    if (hrs(9,10,11,12,13,14,15,16))                  gs.rndArray.push(6)  // Path
  }
  if (which === 'Jungle') {
    if (hrs(10,11,12,13,14,15) && !gs.foundValley && gs.firstExplore) gs.rndArray.push(1) // Find Valley
    if (hrs(4,5,6,7,8,9))                             gs.rndArray.push(2)  // Milk Creeper
    if (hrs(1,3,5,19,21,23))                          gs.rndArray.push(3)  // Wolf
    if (hrs(0,2,4,18,20,22))                          gs.rndArray.push(4)  // Gay Wolf
    if (hrs(16,17,18,19,20))                          gs.rndArray.push(5)  // Pussy Fruit
    if (hrs(10,11,12,13,14,15))                       gs.rndArray.push(6)  // Shiny Rock
    if (hrs(9,10,11,12,13,14,15,16))                  gs.rndArray.push(7)  // Path
  }
  if (which === 'Plains') {
    if (hrs(0,2,20,22) && checkOpenSlot244())         gs.rndArray.push(1)  // Snuggle Ball
    if (hrs(11,12,13,14,15,16,17,18))                 gs.rndArray.push(2)  // Cock Snake
    if (hrs(1,3,4,19,21,23))                          gs.rndArray.push(3)  // Drunken Equan
    if (hrs(5,6,7,8,9,10,11,12))                      gs.rndArray.push(4)  // Grain
    if (hrs(0,1,2,3,10,13,17,20,21,22,23))            gs.rndArray.push(5)  // Path
  }
  if (which === 'Savanna') {
    if (hrs(4,5,6,7,8,9,10,11))                       gs.rndArray.push(1)  // Horny Felin
    if (hrs(0,1,2,3,19,20,21,22,23))                  gs.rndArray.push(2)  // Drunken Equan
    if (hrs(8,9,10,11,18,19,20,21))                   gs.rndArray.push(3)  // Warmth
    if (hrs(13,14,15,16,17))                          gs.rndArray.push(4)  // Facial Mud
    if (hrs(12,13,14,15,16,17,18,19))                 gs.rndArray.push(5)  // Path
  }
  if (which === 'Desert') {
    if (hrs(21,22))                                   gs.rndArray.push(1)  // Sandwich
    if (hrs(4,5,6,7) && gs.currentZone === 6 && gs.silRep === 0) gs.rndArray.push(2) // Silandrias
    if (hrs(6,7,8,9,17,18,19,20))                     gs.rndArray.push(3)  // Dust Devil
    if (hrs(10,11,12,13,14,15,16))                    gs.rndArray.push(4)  // Hot Sun
    if (hrs(0,1,2,3,4,5,21,22,23))                   gs.rndArray.push(5)  // Path
  }

  // ── Area events ────────────────────────────────────────────────────────────
  if (which === 'Beach') {
    if (hrs(6,9,12,15))                               gs.rndArray.push(1)  // Octo Girl
    if (hrs(7,8,10,11,13,14,16,17))                   gs.rndArray.push(2)  // Pregnant Lizan
    if (hrs(2,6,11,12,14,18,19,23))                   gs.rndArray.push(3)  // Trinket
    if (hrs(0,5,10,20,22))                            gs.rndArray.push(4)  // Cock Carv
    if (hrs(1,3,5,9,13,15,17,21))                     gs.rndArray.push(5)  // Urchin
    if (hrs(1,3,4,7,9,10,13,16,17,19,21))             gs.rndArray.push(6)  // Relax
  }
  if (which === 'Lake') {
    if (hrs(0,1,2,3,12,13,14,15,16,17,18,19,20,21,22,23)) gs.rndArray.push(1) // Wet Cloth
    if (hrs(4,5,6,7,8,9,10,11) && !gs.knowPheromone)  gs.rndArray.push(2)  // Fisherman
    gs.rndArray.push(3)                                                      // Song (always)
  }
  if (which === 'Dairy Farm') {
    if (hrs(4,5,6,16,17))                             gs.rndArray.push(1)  // Free Pill
    if (hrs(0,1,2,21,22,23) && gs.udders && gs.udderLactation > 0 && gs.udderEngorgementLevel > 0) gs.rndArray.push(2) // Experimental Milk Machine
    if (hrs(7,8,9,10,11,12,21,22,23))                 gs.rndArray.push(3)  // Buy Pill
    if (hrs(10,11,12,13,14,15))                       gs.rndArray.push(4)  // Malon
    if (hrs(8,9,16,17) && gs.malonRep > 0)            gs.rndArray.push(4)  // Malon+
    if (hrs(0,1,2,3,18,19,20))                        gs.rndArray.push(5)  // Steal Milk
  }
  if (which === 'Old Cave') {
    if (hrs(2,3,6,7,10,11,14,15,18,19,22,23))        gs.rndArray.push(1)  // Red Mush
    if (hrs(0,1,4,5,8,9,12,13,16,17,20,21))          gs.rndArray.push(2)  // Cake or Cup
    if (hrs(0,3,6,9,12,15,18,21))                     gs.rndArray.push(3)  // Wander
  }
  if (which === 'Den') {
    if (hrs(5,6,7,8,15,16,17) && !gs.silTied && !checkItem(229) && !checkStash(229)) gs.rndArray.push(1) // Strap
    gs.rndArray.push(2)                                                      // Sil (always)
  }
  if (which === 'Valley') {
    if (hrs(1,2,5,6,9,10,17,18,21,22))               gs.rndArray.push(1)  // Fertility Statue
    if (hrs(0,2,8,10,16,18))                          gs.rndArray.push(2)  // Fragrant Flower
    if (hrs(1,3,5,7,9,11,13,15,17,19,21,23))         gs.rndArray.push(3)  // Plump Quats
    if (hrs(0,4,8,12,16,20))                          gs.rndArray.push(4)  // Treant Seed
    if (hrs(3,4,6,7,11,12,13,14,15,19,20,22,23))     gs.rndArray.push(5)  // Slumber
  }

  return chooseFrom()
}

// helper: check if bag has an open slot that accepts item 244
function checkOpenSlot244(): boolean {
  return gs.bagArray.indexOf(0) !== -1
}