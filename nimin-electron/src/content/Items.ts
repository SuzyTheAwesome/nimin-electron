/**
 * Items.ts
 * Ported from Items.as (3,410 lines)
 * Item name lookup, descriptions, values, and inventory helpers.
 */

import { gs, bc } from '../core/GameState.ts'
import {
  skinDesc, legDesc, plural, oneYour, cockDesc, nipDesc,
  teatDesc, boobDesc, udderDesc, hipDesc, vulvaDesc,
  buttDesc, clitDesc, legWhere, bellyDesc, ballDesc, regionName, legVerb, skinC,
} from '../content/Descriptions.ts'
import {
  statsMod, doLust, doHP, doSexP, doCoin, dayTime,
} from '../systems/StatChanges.ts'
import { stats } from '../systems/StatSetup.ts'
import { textL, textLP, decGet } from '../ui/TextRenderer.ts'
import {
  buttonWrite, viewButtonText, viewButtonOutline,
  doNext, buttonConfirm, setButtonVisible,
  choiceListButtons, choiceListSelect,
} from '../ui/ButtonManager.ts'
import { clothesTop, clothesBottom, pullUD, currentClothes } from '../content/Clothes.ts'
import { bustRatio } from '../content/Breasts.ts'
import { hairC, hairDesc } from '../content/Hair.ts'
import { doEnd, doProcess } from '../core/GameEngine.ts'
import { percent, chooseFrom } from '../core/GameUtilities.ts'
import { moistCalc, cumAmount, milkAmount } from '../core/Calculations.ts'
import { aff, cockChange, vagChange, lactChange, boobChange, legChange, vagBellyChange } from '../systems/Transformations.ts'
import { enemyName, doeHP, doBattle } from '../systems/Battling.ts'
import { pregCheck } from '../systems/Pregnancy.ts'
import { doWeight } from '../content/Weight.ts'
import { regionChange } from '../screens/EventUtilities.ts'

// ── Item name lookup ───────────────────────────────────────────────────────

const ITEM_NAMES: Record<number, string> = {
  0:   ' ',
  1:   'Test',
  // Equipment - passive
  101: 'Anc Claws',
  102: 'Imb Shoes',
  103: 'Dry Sand',
  104: 'Milker',
  105: "Cat's Meow",
  106: 'Penis Pump',
  108: 'Blood Gge',
  109: 'Edu Egg',
  110: 'Reduction',
  111: 'Skin Balm',
  112: 'Bol Juice',
  113: 'Taint Leaf',
  114: 'Sweet Sap',
  115: 'Poultice',
  // Weapons
  116: 'Dagger',
  117: 'Hammer',
  118: 'Saber',
  119: 'Whip',
  // Consumable equipment / scrolls
  120: 'Neuter',
  121: 'TS Soft',
  122: 'TS Firm',
  123: 'TS Tied',
  124: 'TS Siz',
  125: 'TS Ovi',
  126: 'Oas Water',
  127: 'Tail Spike',
  128: 'TS Sanct',
  // Misc / monster drops
  200: "Lila's Gift",
  201: 'Milk C Pois',
  202: 'Co-Snak Ven',
  203: 'Wolf Fur',
  204: 'Sm Pouch',
  205: 'Sm Pouch',
  206: 'Trinket',
  207: 'Cock Carv',
  208: 'Blo Berry',
  209: 'Grain',
  210: 'Puss Fruit',
  211: 'DairE Pill',
  212: 'Red Mush',
  213: 'Wet Cloth',
  214: 'Lon Milk',
  215: 'Lon Pendant',
  216: 'Pink Ink',
  217: 'Egg Jelly',
  218: 'Bul Berry',
  219: 'Fresh Egg',
  220: 'Blondie',
  221: 'Puss Juice',
  222: 'Kinky Carr',
  223: 'Eq Snack',
  224: "Lila's Milk",
  225: 'Body Wash',
  226: 'Felin Tea',
  227: 'Oral Wash',
  228: 'Body Oil',
  229: 'Leath Strap',
  230: 'Eggcelerator',
  231: 'Desi Sand',
  232: 'Flying Carp',
  233: 'A-Grav Rock',
  234: 'Rein Charm',
  235: 'Fell Rod',
  236: 'Recept Bell',
  237: 'Dewy Gift',
  238: 'Squ Cheese',
  239: 'Shiny Rock',
  240: 'Auburn Dye',
  241: 'Brown Dye',
  242: 'Grey Dye',
  243: 'White Dye',
  244: 'Snuggle Ball',
  245: 'Facial Mud',
  246: 'Fertile Gel',
  247: 'Supp Harness',
  248: 'Breeder Pot',
  249: "Treant's Tear",
  250: 'Foomp Bomb',
  251: 'Plump Quat',
  252: 'Milky Pend',
  253: 'Bug Egg',
  254: 'Lantern',
  255: 'Frag Flower',
  256: 'Nectar Candy',
  257: 'Too Human',
  258: 'Tainted Pot',
  259: 'Sweet&Sour',
  260: 'Succ Draft',
  // Milk / cum / crafted
  500: 'Milk Bottle',
  501: 'Milk Jug',
  502: 'Milk Barrel',
  503: 'Lust Draft',
  504: 'Rejuv Pot',
  505: 'Bad Exper',
  506: 'Exp Preg',
  507: 'Ball Sweller',
  508: 'S Lust Draft',
  509: 'S Rejuv Pot',
  510: 'S Bad Exper',
  511: 'S Exp Preg',
  512: 'S Ball Sweller',
  513: 'Gen Swap',
  514: 'Maso Pot',
  515: 'Black Dye',
  516: 'Baby Free',
  517: 'Pot Pot',
  518: 'S Gen Swap',
  519: 'S Maso Pot',
  520: 'Red Dye',
  521: 'S Baby Free',
  522: 'S Pot Pot',
  523: 'Cum Vial',
  524: 'Cum Bottle',
  525: 'Cum Jug',
  526: 'Cum Barrel',
  527: 'Good Egg',
  528: 'Bad Egg',
  529: 'Strange Egg',
  530: 'Charmed Egg',
  531: 'Divine Egg',
  532: 'Pheromone',
  533: 'Reduc Reduc',
  534: 'Male Enhance',
  535: 'Milk Suppress',
  536: 'Bazoomba!',
  537: 'Queen Egg',
  538: 'Soldier Egg',
  539: 'Drone Egg',
  540: 'Worker Egg',
}

export function itemName(id: number): string {
  return ITEM_NAMES[id] ?? `Item #${id}`
}

// ── Bag slot management ────────────────────────────────────────────────────
// (Moved here from Inventory to avoid circular imports with ButtonManager)

export function bagSlotAdd(n: number): void {
  for (let i = 0; i < n; i++) {
    gs.bagArray.push(0)
    gs.bagStackArray.push(0)
  }
}

export function stashSlotAdd(n: number): void {
  for (let i = 0; i < n; i++) {
    gs.stashArray.push(0)
    gs.stashStackArray.push(0)
  }
}

// ── Item add / remove ──────────────────────────────────────────────────────

/** Add an item to bag. Returns true if added, false if bag full. */
export function itemAdd(id: number, stack: number = 1): boolean {
  const existIdx = gs.bagArray.indexOf(id)
  if (existIdx !== -1) {
    gs.bagStackArray[existIdx] += stack
    return true
  }
  const emptyIdx = gs.bagArray.indexOf(0)
  if (emptyIdx !== -1) {
    gs.bagArray[emptyIdx] = id
    gs.bagStackArray[emptyIdx] = stack
    return true
  }
  return false
}

/** Remove one stack of an item from bag */
export function itemRemove(id: number): void {
  const idx = gs.bagArray.indexOf(id)
  if (idx !== -1) {
    gs.bagStackArray[idx] -= 1
    if (gs.bagStackArray[idx] <= 0) {
      gs.bagArray[idx] = 0
      gs.bagStackArray[idx] = 0
    }
  }
}

/** passiveItemAdd — apply passive effects when an item enters the bag */
export function passiveItemAdd(id: number): void {
  if (id === 101) { gs.rapeMod += 10 }
  if (id === 102) { gs.runMod += 20 }
  // Lila's Gift
  if (id === 200) {
    gs.vagMoistMod += 4
    gs.cockMoistMod += 4
    statsMod(0, 0, 0, 10)
  }
  // Malon's Pendant
  if (id === 215) {
    gs.rapeMod += 5
    gs.runMod += 5
    gs.milkHPMod += 5
  }
  // Anti-Gravity Rock
  if (id === 233) { gs.carryMod += 75 }
  // Reindeer Charm
  if (id === 234) {
    gs.pregRate += 0.5
    gs.minLust += 10
    gs.hips += 10
    doLust(0, 0)
  }
  // Reception Bell
  if (id === 236) {
    gs.SexPMod += 0.5
    gs.changeMod += 0.3
  }
  // Lila's Dewy Gift
  if (id === 237) {
    gs.vagMoistMod += 8
    gs.cockMoistMod += 8
    statsMod(0, 0, 0, 10)
    if (gs.heat < 1) {
      gs.heatMaxTime = 96
      gs.heatTime = 96
      gs.heat++
    }
    else if (gs.heat >= 1) {
      gs.heatMaxTime -= 12
      gs.heat++
    }
  }
  // Malon's Milky Pendant
  if (id === 252) {
    gs.rapeMod += 5
    gs.runMod += 5
    gs.milkHPMod += 5
    gs.carryMod += 10
    gs.milkCap += 3000
  }
}

/** doItemUse — trigger item-specific use effects */
export function doItemUse(ID: number): void {
  // Skin Balm
  if (ID === 111) {
    textL("Smearing the balm around your body, you feel slightly more sensitive and your curiousity is slightly piquied.")
    stats(0, 1, 0, 1)
    aff(1, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Bolstering Juice
  if (ID === 112) {
    textL("Downing the 'juice', you realize it's a lot thicker and stickier than you expected, and quite heady. Your heart beats a bit stronger and you shudder a bit.")
    stats(1, 0, 1, 0)
    aff(2, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Tainted Leaf
  if (ID === 113) {
    textL("Biting into the leaf, it feels oddly sour. However, afterward your mind feels a bit clearer and your body more prepared for whatever may come.")
    stats(1, 1, 0, 0)
    aff(3, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Sweet Sap
  if (ID === 114) {
    textL("Drinking the slick, slimey, slightly sweet sap, you realize it probably isn't sap... The thought makes you tingle with arousal, your whole body slightly more sensitive.")
    stats(0, 0, 1, 1)
    aff(4, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Poultice
  if (ID === 115) {
    textL("You rub the soothing poultice all over your body, feeling reinvigorated. Rubbing yourself down with the wet rag, you rub a little too much in some areas and become slightly more aroused.")
    doHP(20)
    doLust(5, 0)
    doEnd()
  }
  // Dagger
  if (ID === 116) {
    textL("You have equipped the dagger.")
    gs.weapon = 116
    doEnd()
  }
  // Warhammer
  if (ID === 117) {
    textL("You have equipped the warhammer.")
    gs.weapon = 117
    doEnd()
  }
  // Saber
  if (ID === 118) {
    textL("You have equipped the saber.")
    gs.weapon = 118
    doEnd()
  }
  // Whip
  if (ID === 119) {
    textL("You have equipped the whip.")
    gs.weapon = 119
    doEnd()
  }
  // Teleport Scroll: Softlik
  if (ID === 121) {
    textL("You read the scroll and soft, sparkling lights between to shine and fly around you, faster and faster until you can't see beyond them.\r\rWith a whoosh, they quickly disappear and you find yourself back in the human city of Softlik!")
    gs.currentState = 1
    gs.inBag = false
    gs.inDungeon = false
    regionChange(1)
    doEnd()
  }
  // Teleport Scroll: Firmshaft
  if (ID === 122) {
    textL("You read the scroll and soft, sparkling lights between to shine and fly around you, faster and faster until you can't see beyond them.\r\rWith a whistle, they quickly disappear and you find yourself back in the equan city of Firmshaft!")
    gs.currentState = 1
    gs.inBag = false
    gs.inDungeon = false
    regionChange(2)
    doEnd()
  }
  // Teleport Scroll: Tieden
  if (ID === 123) {
    textL("You read the scroll and soft, sparkling lights between to shine and fly around you, faster and faster until you can't see beyond them.\r\rWith a howl, they quickly disappear and you find yourself back in the lupan city of Tieden!")
    gs.currentState = 1
    gs.inBag = false
    gs.inDungeon = false
    regionChange(3)
    doEnd()
  }
  // Teleport Scroll: Siz'Calit
  if (ID === 124) {
    textL("You read the scroll and soft, sparkling lights between to shine and fly around you, faster and faster until you can't see beyond them.\r\rWith a swish, they quickly disappear and you find yourself back in the felin city of Siz'Calit!")
    gs.currentState = 1
    gs.inBag = false
    gs.inDungeon = false
    regionChange(4)
    doEnd()
  }
  // Teleport Scroll: Oviasis
  if (ID === 125) {
    textL("You read the scroll and soft, sparkling lights between to shine and fly around you, faster and faster until you can't see beyond them.\r\rWith a splash, they quickly disappear and you find yourself back in the lizan city of Oviasis!")
    gs.currentState = 1
    gs.inBag = false
    gs.inDungeon = false
    regionChange(6)
    doEnd()
  }
  // Oasis Water
  if (ID === 126) {
    textL("Sipping the refreshing water, you notice a slight aftertaste of something funny, like people have been bathing and doing... things in the water. It's kinda kinky when you think about it, but also feels nice inside of you.")
    if (percent() <= 50) { stats(1, 0, 1, 0) }
    else { stats(0, 0, 1, 1) }
    aff(6, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Tail Spike
  if (ID === 127) {
    if (gs.tail === 4 || gs.tail === 5 || gs.tail === 6 || gs.tail === 8) {
      textL("You strap the tail spike to your tail, equipping it as your weapon.")
      gs.weapon = 127
    } else {
      textL("You do not have an appropriate tail to strap this onto and thus cannot equip it.")
    }
    doEnd()
  }
  // Teleport Scroll: Sanctuary
  if (ID === 128) {
    textL("You read the scroll and soft, sparkling lights between to shine and fly around you, faster and faster until you can't see beyond them.\r\rWith a thump, they quickly disappear and you find yourself back in the city of Sanctuary!")
    gs.currentState = 1
    gs.inBag = false
    gs.inDungeon = false
    regionChange(12)
    doEnd()
  }
  // Dry Sand
  if (ID === 103) {
    bc()
    viewButtonText(0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1)
    viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1)
    buttonWrite(5, 'Penis')
    if (gs.cockTotal < 1) { setButtonVisible(5, false) }
    buttonWrite(7, 'Pussy')
    if (gs.vagTotal < 1) { setButtonVisible(7, false) }
    buttonWrite(9, 'Breasts')
    buttonWrite(11, 'Udder')
    buttonWrite(12, 'Cancel')
    if (gs.udders === true) { setButtonVisible(11, true) }
    textL('Which genitalia would you like to make a bit dryer?')
    gs.doListen = (): void => {
      if (gs.buttonChoice === 5) {
        textL(`You dab the sand onto your cock-head${plural(1)}. It feels odd at first, but as you rub yourself to arousal a bit, you notice a decrease in pre.`)
        gs.cockMoist -= 4
        doEnd()
      }
      if (gs.buttonChoice === 7) {
        textL(`You dab the sand onto your cunt${plural(2)}. It feels odd at first, but as you rub yourself to arousal a bit, you notice a decrease in lubrications.`)
        gs.vagMoist -= 4
        doEnd()
      }
      if (gs.buttonChoice === 9) {
        textL('You dab the sand onto your nipples. It feels odd at first, but as you rub them until they are stiff, you notice a decrease in lactation.')
        if (gs.lactation - 75 < 0) { gs.milkMod += (gs.lactation - 75) }
        lactChange(1, -75)
        doEnd()
      }
      if (gs.buttonChoice === 11) {
        textL('You dab the sand onto your teats. It feels odd at first, but as you rub them until they are stiff, you notice a decrease in lactation.')
        lactChange(2, -75)
        doEnd()
      }
      if (gs.buttonChoice === 12) {
        itemAdd(103)
        doProcess()
      }
    }
  }
  // Cat's Meow
  if (ID === 105) {
    textL(`Bringing the vial filled with white liquid to your lips, you soon taste the sweet, milky stuff within. Downing it, your ${boobDesc()} breasts feel warm. Small blotches of milk form through your ${clothesTop()}, around your nipples. The tingling heat then permeates your body, making you feel slightly more aroused as well.`)
    stats(0, 0, 1, 0)
    doLust(5, 0)
    if (gs.udders === true) {
      textLP(' Even your udder begins to dribble a little, feeling slightly fuller.')
      lactChange(2, 20)
    }
    lactChange(1, 15)
    doEnd()
  }
  // Neuterizer
  if (ID === 120) {
    bc()
    viewButtonText(0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1)
    viewButtonOutline(0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1)
    buttonWrite(2, 'None')
    buttonWrite(5, 'Cock')
    if (gs.cockTotal < 1) {
      setButtonVisible(5, false)
      setButtonVisible(10, false)
    }
    buttonWrite(7, 'Cunt')
    if (gs.vagTotal < 1) { setButtonVisible(7, false) }
    buttonWrite(10, 'Balls')
    buttonWrite(12, 'Cancel')
    if (gs.showBalls === true && gs.balls > 0) { setButtonVisible(10, true) }
    textL('What would you like to remove?\r\rNote that removing balls removes one at a time. If try to remove them when you only have two left, neuterizer simply hides them, as it would severely damage your plumbing without them.')
    gs.doListen = (): void => {
      if (gs.buttonChoice === 2) {
        textL("You decide you'd rather keep what you got, for the moment, and put the neuterizer back in your bag.")
        itemAdd(120)
        doEnd()
      }
      if (gs.buttonChoice === 5) {
        textL(`You rub the neuterizer into ${oneYour(1)} ${cockDesc()} cock${plural(1)}...`)
        cockChange(0, -1)
        doEnd()
      }
      if (gs.buttonChoice === 7) {
        textL(`You rub the neuterizer into ${oneYour(2)} ${vulvaDesc()} cunt${plural(1)}...`)
        vagChange(0, -1)
        doEnd()
      }
      if (gs.buttonChoice === 10) {
        if (gs.balls > 2) {
          textL('You rub the neuterizer into your scrotum. You squirm a bit as one of your testicles wrenches a bit, shrinking down. Once it disappears into nothing, you feel perfectly fine again.')
          gs.balls--
          doEnd()
        } else {
          textL('Unfortunately, the neuterizer cannot simply make your testicles disappear while you still have any cocks. It would be... too dangerous. But, rubbing it onto your scrotum, your balls disappear up into your body, hidden from view.')
          gs.showBalls = false
          doEnd()
        }
      }
      if (gs.buttonChoice === 12) {
        itemAdd(120)
        doProcess()
      }
    }
  }
  // Milk Creeper Poison
  if (ID === 201) {
    bc()
    viewButtonText(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1)
    viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1)
    buttonWrite(5, 'Breasts')
    if (gs.udders === true) {
      buttonWrite(7, 'Udder')
      setButtonVisible(7, true)
    }
    buttonWrite(12, 'Cancel')
    textL('What would you like to rub the Milk Creeper Poison into?')
    gs.doListen = (): void => {
      if (gs.buttonChoice === 5) {
        textL(`You pour out the vial of poison and rub the pearlescant fluid all over your ${boobDesc()} breasts. You shiver a little as they tingle, a subtle warmth permeating your bosom as the poison sets in and remains.`)
        gs.milkCPoisonNip += 5
        doLust(percent() / 10, 0)
        doEnd()
      }
      if (gs.buttonChoice === 7) {
        textL(`You pour out the vial of poison and rub the pearlescant fluid all over your ${udderDesc()} udder. Your hips twitch a little as the fleshy bag tingles, a subtle warmth permeating your udder as the poison sets in and remains.`)
        gs.milkCPoisonUdd += 5
        doLust(percent() / 10, 0)
        doEnd()
      }
      if (gs.buttonChoice === 12) {
        itemAdd(201)
        doProcess()
      }
    }
  }
  // Cock-Snake Venom
  if (ID === 202) {
    if (gs.cockTotal > 0) {
      textL(`You pull your ${clothesBottom()} ${pullUD(2)} and rub the venom into your cock${plural(1)}. Within seconds, you begin to shudder erotically as warmth fills your cock${plural(1)}, becoming erect. After waiting a few moments, the erection settles somewhat, but the warmth of the venom within persists, as though lying in wait...`)
      doLust(4 * gs.cockTotal, 0)
      gs.cockSnakeVenom += 5
      doEnd()
    } else if (gs.cockTotal < 1 && gs.vagTotal > 0) {
      textL(`You pull your ${clothesBottom()} ${pullUD(2)} and rub the venom into your groin. Within seconds, you begin to shudder...`)
      if (gs.clitSize > 20 && percent() <= 5) {
        textLP(` You feel ${oneYour(2)} ${clitDesc()} clit${plural(2)} swell and shift within your ${clothesBottom()}, your lips starting to grow quite oddly as well...`)
        vagChange(0, -1)
        cockChange(Math.ceil(gs.clitSize * 5 / 2), 1)
        doLust(4, 0)
      } else {
        textLP(` You feel your ${clitDesc()} clit${plural(2)} grow warm. Within seconds, you begin to shudder erotically as you clit${plural(2)} grow hot and erect. After waiting a few moments, the initial intensity passes, but the warmth of the venom within persists, as though lying in wait...`)
        gs.cockSnakeVenom += 5
        doLust(4 * gs.vagTotal, 0)
      }
      doEnd()
    } else {
      textL(`You pull your ${clothesBottom()} ${pullUD(2)} and rub the venom into your groin. You wait for several seconds and... nothing seems to happen. What a waste.`)
      doEnd()
    }
  }
  // Wolf Fur
  if (ID === 203) {
    textL(`You rub the tuft of coarse wolf fur into your ${skinDesc()}. The roughness desensitizes you a bit.`)
    stats(0, 0, 0, -3)
    doEnd()
  }
  // Small Pouch for felins
  if (ID === 204) {
    const chance = percent()
    if (chance <= 30) {
      textL('You find some coins inside!')
      doCoin(Math.floor(percent() / 5))
    } else if (chance <= 40) { itemAdd(246) }
    else if (chance > 40 && chance <= 55) { itemAdd(105) }
    else if (chance > 55 && chance <= 75) { itemAdd(103) }
    else if (chance > 75 && chance <= 90) { itemAdd(114) }
    else { textL('Daww, turns out the pouch was empty...') }
    doEnd()
  }
  // Small Pouch for equans
  if (ID === 205) {
    const chance = percent()
    if (chance <= 50) {
      textL('You find some coins inside!')
      doCoin(Math.floor(percent() / 5 + 5))
    } else if (chance > 50 && chance <= 65) { itemAdd(112) }
    else if (chance > 65 && chance <= 85) { itemAdd(115) }
    else if (chance > 85) { textL('Daww, turns out the pouch was empty...') }
    doEnd()
  }
  // Wooden Cock Carving
  if (ID === 207) {
    const chance = percent()
    textL('You crack open the wooden cock. ')
    if (chance <= 15) {
      textLP(` Sparkling lights erupt from the crack, swirling around in the air until they come together to form the outline of a disembodied glowing cock, looking much like the carving. Before you react, it flips around and dives down, before driving back up ${legWhere(1)} your ${legDesc(2)} and disappearing into the crotch of your ${clothesBottom()}.`)
      vagChange(0, 1)
      doLust(percent() / 5, 0)
    } else if (chance <= 30) {
      textLP(` Sparkling lights erupt from the crack, swirling around in the air until they come together to form the outline of a disembodied glowing cock, looking much like the carving. Before you react, it flips around and charges at your groin, ramming right above your crotch and disappearing into the front of your ${clothesBottom()}.`)
      cockChange(0, 1)
      doLust(percent() / 5, 0)
    } else {
      textLP(" There's nothing inside... Either this thing was just some kinky woman's play-toy, or it was a dud.")
    }
    doEnd()
  }
  // Bloated Berry
  if (ID === 208) {
    textL('You pop the berry into your mouth. As it pops and gushes with juice within your mouth, your face cringes at how un-sweet it is. Tasting more salty with a thick texture, you swallow it as fast as possible.')
    if (gs.balls > 0 && gs.ballSize > 0 && gs.showBalls === true && gs.hunger >= 60) {
      textLP(' Moments later, you feel a warmth in your groin as the food digests. You squirm as you feel your testicles swell within their scrotum, growing hot with seed... Seems as though this berry has increased the size of your balls, somehow, and now you feel a little hungry again.')
      gs.ballSize += Math.floor(percent() / 33)
      gs.hunger -= 20
    } else if (gs.balls > 0 && gs.ballSize > 0 && gs.showBalls === false && gs.hunger >= 60) {
      textLP(' Moments later, you feel a warmth in your groin as the food digests. You squirm as you feel your cum churning within your body, something swelling within... Seems as though this berry has increased the size of your non-visible balls, somehow, and now you feel a little hungry again.')
      gs.ballSize += Math.floor(percent() / 33)
      doLust(percent() / 10, 0)
      gs.hunger -= 20
    } else {
      textLP(" Moments later, you feel a bit of warmth in your groin, but it quickly passes. Now all you're left with is the aftertaste...")
    }
    doEnd()
  }
  // Grain
  if (ID === 209) {
    textL("You pop the handful into your mouth and munch on them. Doesn't taste too bad. Although, the thought of mixing them in a bowl with some milk for breakfast does cross your mind, but passes shortly as you feel like you can get through the day better anyways.")
    gs.exhaustion -= 4
    if (gs.hunger >= 80) {
      textLP(`\r\rUnfortunately, it seems the food you have been eating has gone straight to your ${buttDesc()} ass, making your ${clothesBottom()} feel slightly tight around it as it swells.`)
      gs.butt += Math.floor(percent() / 33)
      gs.hunger -= 20
    }
    doEnd()
  }
  // Pussy Fruit
  if (ID === 210) {
    const chance = percent()
    textL('You bite into the fold-like cleft of the pussy fruit, sweet juices spilling out around your face and drooling from your chin in long, slimy strands. You devour it shortly and feel great!')
    doHP(15)
    if (gs.hunger >= 70 && gs.vagTotal > 0 && chance <= 50) {
      textLP(`\r\rHowever, it feels as though the food energy has run straight to your crotch as a warmth spreads around your cunt${plural(2)}. You squeeze your ${vulvaDesc()} groin through your ${clothesBottom()}, feeling it swell larger...\r\rYou walk a bit awkwardly afterward, getting used to your now extra-swollen lips and feeling slightly hungry again...`)
      gs.vulvaSize += Math.floor(percent() / 20)
      doLust(percent() / 10, 0)
      gs.hunger -= 20
    } else if (gs.hunger >= 70 && gs.vagTotal > 0) {
      textLP(`\r\rHowever, it feels as though the juices have run straight to your crotch as a warmth spreads around your cunt${plural(2)}. You double over as your stomach cramps a little. It feels like your insides are being compressed, your cunt${plural(2)} feeling larger within...\r\rThe cramping shortly passes, but the increased size is real and you feel slightly hungry again...`)
      vagChange(Math.floor(percent() / 20), 0)
      doLust(percent() / 10, 0)
      gs.hunger -= 20
    } else if (gs.hunger >= 90 && gs.vagTotal > 0) {
      textLP(`\r\rHowever, it feels as though the juices have run straight to your crotch as a warmth spreads around your cunt${plural(2)}. You double over as your stomach cramps a little. It feels like your insides are being compressed, your cunt${plural(2)} feeling larger within. You squeeze your ${vulvaDesc()} groin through your ${clothesBottom()}, feeling it swell larger...\r\rThe cramping shortly passes, but you walk awkwardly afterward, getting used to your now extra-swollen lips and feeling slightly hungry again...`)
      gs.vulvaSize += Math.floor(percent() / 20)
      vagChange(Math.floor(percent() / 20), 0)
      doLust(percent() / 5, 0)
      gs.hunger -= 30
    }
    doLust(percent() / 10, 0)
    doEnd()
  }
  // DairE Pill
  if (ID === 211) {
    textL(`Considering you don't have any cows to give it to, you pop the pill into your mouth and gulp it down. Within some moments your ${boobDesc()} chest feels rather warm...`)
    if (gs.udders === true) {
      textLP(' And so does your udder.')
      if (gs.udderPlay >= 60) { lactChange(2, 35) }
      else { gs.udderPlay += 20 }
    }
    if (gs.nipplePlay >= 60) { lactChange(1, 25) }
    else { gs.nipplePlay += 20 }
    doLust(percent() / 10, 0)
    aff(5, Math.floor((percent() / 20) + 2), -1)
    doEnd()
  }
  // Red Mushroom
  if (ID === 212) {
    textL("You munch on the red mushroom. It doesn't taste terribly good or bad, but a blush quickly heats up your face as your chest turns intensely warm.")
    if (gs.hunger >= 80) {
      textLP(` Your ${clothesTop()} feels unexpectedly tight, thanks to all the food you've been eating.\r\rAs you look down, you let out a gasp as your ${boobDesc()} chest swells beneath your ${clothesTop()}, your ${nipDesc()}nipples pushing against the fabric. You grab the mounds and feel them grow larger, heavier, and more wobbly...\r\rThe warmth soon passes, leaving you bent over slightly as you adjust to the increased weight. You don't feel quite as full anymore though, much of your excess energy used up by this sudden growth.`)
      boobChange(Math.ceil(percent() / 33))
      gs.hunger -= 20
    } else {
      textLP(" Then the warmth subsides and your stomach grumbles from the strange food. You do feel less hungry though.")
    }
    doEnd()
  }
  // Malon's Milk
  if (ID === 214) {
    textL('You down the bottle of milk and feel refreshed!')
    doHP(15 + gs.milkHPMod)
    aff(5, Math.floor(percent() / 10), 0)
    gs.exhaustion -= 3
    doEnd()
  }
  // Octopus Egg Jelly
  if (ID === 217) {
    textL("You smear the jelly around your genitals. It's so slick and hot, you can't help but feel immensely aroused.")
    if (gs.vagTotal > 0) {
      textLP(` And as you rub it into your nether-lips, you feel it absorb into the walls of your vagina${plural(2)}. Slipping a finger in, it doesn't feel much different, until you actually prod a wall. It bends much more easily, as though it were more elastic than before. You could probably shove even larger things in there without feeling pain...`)
      gs.vagElastic += 0.1
    }
    doLust(50, 0)
    doEnd()
  }
  // Bulging Berry
  if (ID === 218) {
    textL('You pop the berry into your mouth. As it pops and gushes with juice within your mouth, your face cringes at how un-sweet it is. Tasting more salty with a thick texture, you swallow it as fast as possible.')
    if (gs.balls > 0 && gs.ballSize > 0 && gs.showBalls === true) {
      textLP(' Moments later, you feel a warmth in your groin. You squirm as your testicles feel crowded, your scrotum growing tight. You look to see and find an extra testicle in your sack!')
      gs.balls++
      doLust(percent() / 10, 0)
    } else if (gs.balls > 0 && gs.ballSize > 0 && gs.showBalls === false) {
      textLP(' Moments later, you feel a warmth in your groin. You squirm as you feel your cum churning within your body, something extra growing within... Seems as though this berry caused you to grow an extra internal testicle, somehow.')
      gs.balls++
      doLust(percent() / 10, 0)
    } else {
      textLP(" Moments later, you feel a bit of warmth in your groin, but it quickly passes. Now all you're left with is the aftertaste...")
    }
    doEnd()
  }
  // Fresh Egg
  if (ID === 219) {
    textL('You crack the egg open and swallow its contents, your belly thanking you for the food.')
    doHP(5)
    if (gs.hunger >= 70) {
      textLP('\r\rHowever, the fertile nature of the egg (and lots of protein) seem to go straight to your hips, making them grow wider.')
      gs.hips += Math.floor(percent() / 50)
      gs.hunger -= 25
    }
    doEnd()
  }
  // Kinky Carrot
  if (ID === 222) {
    textL("Happy with how clean you've gotten it, you munch on the tasty vegetable. It makes you feel healthier to the point where you're nearly hopping with energy.")
    aff(7, Math.floor((percent() / 15) + 2), -2)
    doHP(4)
    doEnd()
  }
  // Equan Snack
  if (ID === 223) {
    textL('The tasty morsel crumbles delightfully in your mouth.')
    doHP(5)
    if (gs.vagTotal > 0 && gs.hunger >= 90) {
      textLP(' Though it settles in your stomach rather oddly, as you feel some squirming slightly below that, the snack quickly digesting into something else...')
      vagChange(1, 0)
      gs.hunger -= 25
    }
    if (percent() <= 25) {
      textLP("\r\rAnd you don't quite feel stronger, you feel as though you could hold up more weight.")
      gs.carryMod++
    }
    doEnd()
  }
  // Lila's Milk
  if (ID === 224) {
    textL("Lila's breastmilk tastes quite sweet, with a slight aftertaste of her other fluids. It makes you feel a bit... tender, so to speak.")
    if (percent() <= 25 && gs.vagMoist < 12 && gs.vagTotal > 0) {
      textLP(" You feel some extra moistness in your loins as well, the liquid seeming to imprint some of the girl's wetness upon you.")
      gs.vagMoist++
    }
    if (gs.heat > 0) {
      if (gs.heatTime > 0) {
        textLP(" There's also a slight sensation of coming closer to your fertile period...")
        if (gs.heatTime > 5) { gs.heatTime -= 5 }
        if (gs.heatTime < 6) { gs.heatTime = 1 }
      }
      if (gs.heatTime < 0) {
        textLP(" There's also a slight tinge of heat that flows through your body, strengthening your estrus for a little longer...")
        gs.heatTime -= 5
      }
    }
    doEnd()
  }
  // Body Wash
  if (ID === 225) {
    textL('You quickly scrub yourself down with the body wash, feeling so fresh and so clean. Which is kinda odd, considering that you\'re currently playing a porn game.')
    gs.exhaustion -= 8
    stats(0, 1, 0, 2)
    doLust(-10, 0)
    doEnd()
  }
  // Felin Tea Mix
  if (ID === 226) {
    textL('You mix the tea with a nice cup of hot water, producing a nice calming aroma. You sip it down and quite quickly feel much more relaxed.')
    gs.exhaustion -= 6
    doLust(-10, 0)
    if (gs.heat > 0) {
      if (gs.heatTime > 0) { gs.heatTime += 3 }
      if (gs.heatTime < 0) {
        if (gs.heatTime < -3) { gs.heatTime += 3 }
        if (gs.heatTime > -4) { gs.heatTime = -1 }
      }
    }
    doEnd()
  }
  // Felin Oral Wash
  if (ID === 227) {
    textL('Taking a swig of the sweet-smelling stuff, you feel it tingle all the way down your throat and spread throughout your body from the inside.')
    doLust(10, 0)
    stats(0, 0, 1, 0)
    if (gs.skinType === 2) {
      textLP(' You then proceed to lick as much of your fur as possible, making it look sleek and shiny')
      stats(0, 0, 0, 1)
    }
    doEnd()
  }
  // Body Oil
  if (ID === 228) {
    textL(`You rub the oil all over your ${skinDesc()}, making yourself look shiny and attractive, bringing attention to all the contours of your body.`)
    if (gs.bodyOil > 0) { gs.bodyOil = 5 }
    else {
      gs.enticeMod += 5
      gs.bodyOil = 5
    }
    if (gs.skinType === 1 || gs.skinType === 3) {
      textLP(` It also makes your ${skinDesc()} feel so good to the touch~`)
      stats(0, 0, 0, 1)
    }
    doEnd()
  }
  // Desiccating Sand
  if (ID === 231) {
    if (gs.currentState !== 2) {
      textL('You can only use this dangerous sand in battle. You put the sand back into your bag.')
      itemAdd(231)
      doEnd()
    } else {
      const dmg = Math.floor(Math.random() * (1 + 40 - 20)) + 20
      textL(`You throw the pile of sand at the ${enemyName()}. It cringes and winces as the sand sucks the moisture from its body, dealing ${dmg} damage!`)
      doeHP(-dmg)
      if (percent() <= 25) {
        textLP('\r\rHowever, the wind catches some of the sand and it blow back at you! ')
        gs.rndArray = [0]
        if (gs.cockSizeMod > 0.5 && gs.cockTotal > 0) { gs.rndArray.push(1) }
        if (gs.vagSizeMod > 0.5 && gs.vagTotal > 0) { gs.rndArray.push(2) }
        if (gs.cumMod > 0.5 && gs.showBalls === true && gs.cockTotal > 0) { gs.rndArray.push(3) }
        if (gs.milkMod > 0) { gs.rndArray.push(4) }
        if (gs.pregnancyTime > 200) { gs.rndArray.push(5) }
        gs.rndArray.push(6)
        chooseFrom()
        if (gs.rndResult === 1) {
          textLP(`The stuff rushes across your ${cockDesc()} cock${plural(1)}, seeping in deep and causing some permanent shrinkage.`)
          gs.cockSizeMod -= 0.05
        } else if (gs.rndResult === 2) {
          textLP(`The stuff rushes between your legs and you can feel some slip up into your passage${plural(2)}, seeping in deep and resulting in some permanent shriveling.`)
          gs.vagSizeMod -= 0.05
        } else if (gs.rndResult === 3) {
          textLP(`The stuff rushes across your ${ballDesc()} balls, sinking through the scrotum and causing them to lose some of their efficiency.`)
          gs.cumMod -= 0.1
        } else if (gs.rndResult === 4) {
          textLP(`The stuff rushes across your ${boobDesc()} breasts, sinking into your mammary glands and reducing their power.`)
          gs.milkMod -= 5
        } else if (gs.rndResult === 5) {
          textLP(`The stuff rushes across your ${bellyDesc()} belly. It doesn't affect the life within, but you can feel your womb wane as it loses some of its future fertility.`)
          gs.pregRate -= 0.05
          gs.pregChanceMod -= 1
          gs.extraPregChance -= 1
        } else {
          textLP("Thankfully, it barely touches you and you're left unaffected.")
        }
      }
      if (gs.currentState === 2) { doEnd() }
    }
  }
  // Fellatio Rod
  if (ID === 235) {
    textL('You have equipped the fellatio rod.')
    gs.weapon = 235
    doEnd()
  }
  // Squeaky Cheese
  if (ID === 238) {
    textL('Nibbling the cheese, the delicious flavor melts in your mouth and feels so good going down. It feels good just eating it, like you could go hunting for lots more. Though... Hey, did your clothes get looser, or is it just your imagination?')
    gs.tallness -= 1
    aff(8, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Shiny Rock
  if (ID === 239) {
    textL('You take out the rock and stare at it, intently focused on how shiny it is. Your mind grows sharper, allowing you to focus even harder and... Wait, what? One last glint of shininess and the rock suddenly became dull. Maybe you stared too hard? Either way, you toss the now dull rock, no longer interested in it.')
    stats(0, 1, 0, 0)
    aff(9, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Facial Mud
  if (ID === 245) {
    textL(`You pour the mud out into your hands and slather it all over your face. You let it sit there for a few moments, enjoying the warm sensation and feeling it creep into your pores and make your ${skinDesc()} feel nice.\r\rYou soon wipe it off once it has had its effect, but tickle your nose a little in the process and make you laugh until you oink- err... snort.`)
    stats(0, 0, 0, 1)
    aff(10, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Fertile Gel
  if (ID === 246) {
    textL('You pour out the gel into your hand and rub it into your loins, making sure it gets in niiice and deeeep.')
    if (gs.vagTotal > 0) {
      textLP(' Your womb seems to soak up the warmth of the gel, feeling more receptive to semen~')
      if (gs.fertileGel === 0) { gs.pregChanceMod += 10 }
      gs.fertileGel += 24
    } else {
      textLP(" However, you're not sure why you did that, since you don't exactly have a womb to make more fertile... Oh well, you're a pervert anyways.")
    }
    doEnd()
  }
  // Breeder Potion
  if (ID === 248) {
    textL('You gulp down the potion yourself, rather than giving it to some animal that it was intended for.')
    if (gs.vagTotal > 0) {
      textLP(" Your womb immediately begins to warm up a little, your ovaries 'feeling' like they're working harder. It's strange to describe, but your body quickly adapts and the warmth settles down.")
      gs.extraPregChance += 3
    } else {
      textLP(" However, you don't really notice any effect when it comes to having a larger litter... You kinda can't have litters without a womb to birth them from, come to think of it.")
    }
    if (gs.heat > 0) {
      textLP(' Whereas your loins seem to feel flushed. Not exactly going into heat just from the potion, but more feeling like they will do so more readily now...')
      gs.heatMaxTime -= Math.floor(gs.heatMaxTime * 0.1)
    }
    doEnd()
  }
  // Foomp Bomb
  if (ID === 250) {
    if (gs.currentState !== 2) {
      textL("You can only use this escape bomb in battle, it's not really useful otherwise. You put the foomp bomb back into your bag.")
      itemAdd(250)
      doEnd()
    } else {
      textL(`Needing a quick escape, you throw the foomp bomb at the enemy. It explodes on contact with a cloud of magical dust and, just as its name implies, there's a sort of "foomp!" sound. As the dust clears, you can't help but giggle at the results. The ${enemyName()}'s whole body has ballooned to amusing proportions; inflated by the bomb.`)
      if (gs.eGen === 1 || gs.eGen === 3) { textLP(` The ${enemyName()}'s cock propels forward with the growth, flopping down onto the ground many times larger than it was, anchoring itself do the ground and preventing its owner from moving.`) }
      if (gs.eGen === 2 || gs.eGen === 3) { textLP(` The ${enemyName()}'s breasts swell to obscene sizes, making her fall forward and be cushioned by the pillowy masses, unable to stand.`) }
      if (gs.eGen === 4) { textLP(` The ${enemyName()}'s midsection grows so large and round that it is unable to move at all.`) }
      textLP(`\r\rHowever, the bomb's effects are already beginning to wear off as you stare at its results. Taking advantage of this short opportunity, you turn and dash away before the ${enemyName()} can shrink back down to a manageable size and continue the fight.`)
      gs.currentState = 1
      gs.hrs += 1
      doEnd()
    }
  }
  // Plump Quat
  if (ID === 251) {
    textL("Biting into the plump fruit, the sweet flesh melts delightfully in your mouth with a nice citrusy sour tinge. Gulping it down and feeling it splash into your stomach and warm your insides makes you crave even more. Your mouth immediately bites off another chunk of the fruit, then another, insatiably devouring the delicious thing. The flesh slips down your throat and sinks into your stomach, filling you up so delightfully~\r\rBut before you know it, you've already eaten the whole thing. You glutton. Though there's no more left, you can still feel it digesting inside, which in itself is rather pleasant...")
    gs.bellyMod += 10
    gs.plumpQuats += 6
    doEnd()
  }
  // Fragrant Flower
  if (ID === 255) {
    textL('You bring the flower to your nose and inhale deeply. It smells so good, the delightful scent filling your nostils and your lungs and leaving you feeling quite tingly all over.\r\rHowever, once you look back down afterwards, the flower has wilted and no longer has any scent at all...')
    stats(0, 0, 0, 2)
    aff(11, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Nectar Candy
  if (ID === 256) {
    textL('You suck on the hard candy, the nutrient-rich ingredients making you feel stronger as the sweet flavors fill your belly.')
    if (gs.eggLaying > 0) {
      textLP(' And your womb gets a good workout, the pro-something bacteria or whatever helping with its functions. Or something.')
      gs.eggTime -= 4
    }
    stats(1, 0, 0, 0)
    aff(12, Math.floor((percent() / 15) + 2), -2)
    doEnd()
  }
  // Too Human Potion
  if (ID === 257) {
    textL('You drink down the potion. You immediately begin to feel very odd...')
    if (gs.legType !== 1002) {
      gs.humanTaurAffinity = 100
      legChange(1002)
      textLP('\r\rFor a normal human, having a second body would -technically- be more human than a human. Though you can see why it was a failure...')
    } else {
      textLP('\r\rBut the feeling passes as nothing happens.')
    }
    doEnd()
  }
  // Tainted Potion
  if (ID === 258) {
    textL('You drink down the potion. You immediately begin to feel very odd...')
    if (gs.legType !== 1001) {
      gs.cowTaurAffinity = 100
      legChange(1001)
      textLP("\r\rIt's probably best that alchemist didn't sell it to others...")
    } else {
      textLP('\r\rBut the feeling passes as nothing happens.')
    }
    doEnd()
  }
  // Sweet & Sour Candy
  if (ID === 259) {
    textL("You pop the candy into your mouth and let it slowly dissolve. You immediately realize that the 'sour' comes before the 'sweet', despite the name, and your face puckers up with the intensity, your pain subsiding in relation.")
    if (gs.vagTotal > 0) {
      textLP(` You pucker so hard that you can feel your cunt${plural(2)} stretch further into your body from the force, permanently slightly larger...`)
      gs.vagSizeMod += 0.05
    }
    textLP('\r\rThen the sweetness comes along, your body relaxing and tingling from the blissful flavor.')
    if (gs.cockTotal > 0) {
      textLP(` You relax your body so much that your cock${plural(1)} droop out even further than usual, so far that they're permanently slightly longer...`)
      gs.cockSizeMod += 0.05
    }
    doHP(5)
    doLust(5, 0)
    doEnd()
  }
  // Succubus Draft
  if (ID === 260) {
    textL('You gulp down the draft. The stuff is very thick and heady, nearly burning your throat on the way down. The warmth spreads from your belly, your mind becoming more focused while your body grows stronger, more mature, and taller.')
    if (gs.cockTotal > 0) {
      textLP(` Your ${cockDesc()} cock${plural(1)} also grow${plural(3)} from the concentrated masculinity, bulging in your ${clothesBottom()}.`)
      cockChange(2, 0)
    }
    if (gs.vagTotal > 0) {
      textLP(` However, unexpectedly, the concentrated masculinity causes your ${clitDesc()} clit${plural(2)} to grow as well, pushing out your ${clothesBottom()} further...`)
      gs.clitSize += 2
    }
    gs.body += 1
    gs.tallness += 1
    stats(2, 1, 0, 0)
    doEnd()
  }
  // Eggcelerator
  if (ID === 230) {
    if (gs.vagTotal < 1) {
      textL("You take out the eggcelerator, realize you don't have an appropriate orifice, and put it back away...")
      itemAdd(230)
      doEnd()
    } else {
      textL(`You pull ${pullUD(2)} your ${clothesBottom()} and squat down to help spread your ${vulvaDesc()} lips. Grabbing the eggcelerator with your fingertips, you slip it into ${oneYour(2)} slit${plural(2)}, pointy end first. It doesn't take much before physics takes over and the suppository slips up into your deeper spaces where you can feel a slight tingle as it dissolves.`)
      if (gs.eggLaying > 0) {
        if (gs.eggceleratorDose > (6 + Math.ceil(percent() / 20))) {
          textLP(`\r\rYou can feel your next egg starting to come along more quickly than before... but it continues to build. Your ${bellyDesc()} belly lets out a groan as you feel the fresh egg already press against your lips, demanding its way out. You fall back onto your hands, your ${legDesc(6)} in the air as you lay it with such expediency that your thighs quiver and your pussy gasps in surprise. Yet, the sensation doesn't end, as more eggs begin to develop almost instantly inside your womb, one by one forcing their way through your passageway. Your ${hipDesc()} hips jerk and your ${clitDesc()} clit${plural(2)} stand${plural(4)} tall with a strange arousal as you thrust into the air again and again to plop out egg after egg. Part of you wants to furiously rub yourself as the eggs nearly launch from your spread cunt, but the rapid pace of the laying makes your body a twitching, seizing mess as you cry out in desparation. So many eggs fly out of you into a pile that you can hardly save them all; quite a few crack and ooze over the others. The round, smooth, slick object having their way with your sensitive flesh eventually makes you quake with an odd orgasm, somewhat powerful but not quite fulfilling, making you collapse back onto the ground as your womb pops out the rest...\r\rOver half an hour passes after your egg-laying extravaganza before you can collect yourself. You sit up to wipe the slime from your pussy, gazing upon the pile of eggs you have laid until you finally go through and pull out the good ones. You also notice that your womb seems to have completely calmed down afterwards, the eggcelerator having been purged from your system. It seems you had taken so many doses that your body could no longer handle it...`)
          for (let i = 0; i < gs.eggceleratorDose; i++) { itemAdd(219) }
          doLust(Math.floor(-gs.sen / 3), 2, 2)
          gs.eggceleratorTime = 0
          gs.eggRate -= gs.eggceleratorDose
          gs.eggceleratorDose = 0
          gs.hrs = 1
        } else {
          textLP("\r\rAlready you can somewhat feel that the next egg will be coming along more quickly than before and hope you'll be prepared for it.")
          gs.eggRate++
          gs.eggceleratorTime = 30
          gs.eggceleratorDose++
        }
      } else {
        textLP('\r\rOther than the tingling, it doesn\'t seem to do much... It would probably be more useful if you could actually lay eggs.')
      }
      doEnd()
    }
  }
  // Snuggle Ball
  if (ID === 244) {
    if (gs.snuggleBall === false) {
      textL(`You take out the snuggle ball and squeeze it against your chest, hugging it gleefully. So squishy and soft, the pleasant sensation of it forming around your body as you compress it is oh so nice~ Though it doesn't stop forming around your body...\r\rLiquidy tendrils lash out from the ball, sticking to your face and arms, belly and ${legDesc(2)}. You don't have time to resist as it wraps around your body, seeping past your ${currentClothes()} and coating your ${skinDesc()}.\r\rOver within moments, you stand there and gradually try to move. A plush and soft layer, slightly shiny and malleable just like the ball, covers all your ${skinDesc()}. It doesn't impede your movement or actions, almost like it was an extra layer of skin, and doesn't do much but make you... snuggly.`)
      gs.snuggleBall = true
      doEnd()
    } else {
      textL(`Would you like to try and remove the plush shiny layer of cuddliness that covers your ${skinDesc()}?`)
      buttonConfirm()
      gs.doListen = (): void => {
        if (gs.buttonChoice === 6) {
          if (percent() / 2 > gs.str) {
            textL("You pull and tug at the extra layer of 'skin'. It stretches from your body, but yanks itself out of your grip and snaps back in place. The little bugger just doesn't want to let go!")
          } else {
            textL(`You pull and tug at the extra layer of 'skin'. It stretches from your body and with a bit more exertion it snaps off, coalescing back down into a little ball in your hand. Your ${skinDesc()} now free of the little bugger, you put it back in your bag to deal with later.`)
            gs.snuggleBall = false
          }
          doEnd()
        } else {
          doProcess()
        }
      }
    }
  }
  // Support Harness
  if (ID === 247) {
    if (gs.suppHarness === false) {
      textL("You wrap the harness around your back with the latches in front of you so you can see what you're doing. You gauge how tight they should be for your chest, crotch, and other various anatomy to fit before twisting it around. Then you stuff your chest into the appropriate sling, and continue on down until the multiple slings hold up your various weighty bits snugly, giving you a good deal more support. You can't exactly carry the world on your shoulders, but you can at least carry a bit more of yourself now.")
      gs.carryMod += 50
      gs.suppHarness = true
    } else {
      gs.carryMod -= 50
      if (doWeight()) {
        textL('You reach around behind back and fiddle with the latches of the harness, forcing them open. Your anatomy immediately falls out of the slings, taken you with it as you crash to the ground, completely anchored by your own body. You at least manage to finish unequipping the harness and put it in your bag, but now you\'ve got some issues...')
        doWeight()
      } else {
        textLP("You reach around behind back and fiddle with the latches of the harness, forcing them open. Your bits bounce out as they're set free, making you jerk as the weight falls back upon your body. You then stuff the harness back into your bag, no longer equipped, and prepare yourself to continue on with the unsupported weight.")
      }
      gs.suppHarness = false
    }
    doEnd()
  }
  // Treant's Tear
  if (ID === 249) {
    textL("You drop the small tear into your mouth, swallowing it easily with a quick gulp. You don't even feel it in your stomach; it doesn't seem to do anything at first.\r\rHowever, a sensation of wilting envelopes your appendages, like they're growing weaker.")
    if (gs.cockTotal > 0 || gs.vagTotal > 0) {
      textLP(' The sensation coalesces into your crotch, focusing within your extra genitalia.')
      if (gs.cockTotal > 0) {
        gs.tallness += Math.ceil(gs.cockTotal / 4) * 2
        cockChange(0, -Math.ceil(gs.cockTotal / 4))
      }
      if (gs.balls > 2) {
        gs.tallness += Math.ceil(gs.balls / 4)
        if (gs.showBalls === true) { textLP(`\r\r${Math.ceil(gs.balls / 4)} of your testicles also shrivel up inside your scrotum, being absorbed back into your body.`) }
        gs.balls -= Math.ceil(gs.balls / 4)
      }
      if (gs.vagTotal > 0) {
        gs.tallness += Math.ceil(gs.vagTotal / 4) * 2
        vagChange(0, -Math.ceil(gs.vagTotal / 4))
      }
      textLP("\r\rThen, once you have lost the extra genitals, the ground below you falls away! Or, more accurately, your heads shoots upward as your body rapidly begins to grow, taller and taller to compensate for the genitals you have lost! You have shed your extra 'limbs' and grown towards the sky.")
    } else {
      textLP(" The sensation coalesces into your crotch for an instance, but quickly dissolves. Then... that's it.\r\rSeems whatever the tear was supposed to do didn't affect you. So much for that.")
    }
    doEnd()
  }
  // Bug Egg
  if (ID === 253) {
    if (gs.tail === 12) {
      viewButtonText(0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0)
      viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0)
      buttonWrite(5, 'Eat')
      buttonWrite(7, 'Ovipositor')
      textL('Considering the egg is just about the right size for the hole in your large ovipositor tail, what would you like to do with it?')
      gs.doListen = (): void => {
        if (gs.buttonChoice === 5) {
          textL("You pop the egg into your mouth and bite down. The gooey stuff splorts about your mouth and... isn't exactly tasty. Even swallowing it makes your belly want to rebel. The act kills off some of your arousal, at least.")
          doLust(-3, 0)
          doEnd()
        }
        if (gs.buttonChoice === 7) {
          textL(`Taking the chance, you bend around yourself and press the squishy egg up against the hole at the end of your blunted tail. You wince and shudder as you push it in, the passage inside sensitive as it quickly engulfs the sphere, arousing you slightly. Then it's gone.\r\rYou jiggle your ${buttDesc()} butt, feeling the wide fleshy tail flop up and down on it, and wait a few moments as you hear and sense some groaning within, similar to the sounds of digestion. Eventually you feel a pressure against the inside of the hole and you press down, your hand ready at the tip to catch the slimy thing as it pops back out.\r\r`)
          const chance = percent()
          if (chance <= 8) {
            textLP('The egg now glows with a sort of regal luster, slightly larger than before with a heavier weight.')
            itemAdd(537)
          } else if (chance <= 25) {
            textLP('The egg now feels tougher, less squishy in your hand than before.')
            itemAdd(538)
          } else if (chance <= 55) {
            textLP('The egg now looks somewhat dimmer, but also has some more warmth to it than before.')
            itemAdd(539)
          } else {
            textLP('The egg now seems rather bland, not as gooey and more starchy than before.')
            itemAdd(540)
          }
          doEnd()
        }
      }
    } else {
      textL("You pop the egg into your mouth and bite down. The gooey stuff splorts about your mouth and... isn't exactly tasty. Even swallowing it makes your belly want to rebel. The act kills off some of your arousal, at least.")
      doLust(-3, 0)
      doEnd()
    }
  }
  // Milk Bottle
  if (ID === 500) {
    textL('You down the bottle of milk and feel refreshed!')
    doHP(10 + gs.milkHPMod)
    gs.exhaustion -= 2
    doEnd()
  }
  // Milk Jug
  if (ID === 501) {
    textL('You guzzle down the jug of milk and feel very refreshed! And you feel like you have a rather full bladder...')
    doHP(40 + gs.milkHPMod)
    gs.exhaustion -= 6
    doEnd()
  }
  // Milk Barrel
  if (ID === 502) {
    textL('You pour the milk out of the barrel into 4 jugs...')
    itemAdd(501)
    itemAdd(501)
    itemAdd(501)
    itemAdd(501)
    doEnd()
  }
  // Lust Draft
  if (ID === 503) {
    textL('You take a swig of the draft, your loins warming within seconds.')
    doLust(20, 0)
    doEnd()
  }
  // Rejuvenating Potion
  if (ID === 504) {
    textL('You down the potion, your body feeling much better than before.')
    doHP(30)
    doLust(-15, 0)
    doEnd()
  }
  // Bad Experiment
  if (ID === 505) {
    if (gs.currentState !== 2) {
      textL('You can only use this explosive potion in battle. You put the bad experiment back into your bag.')
      itemAdd(505)
      doEnd()
    } else {
      const dmg = Math.floor(Math.random() * (1 + 20 - 10)) + 10
      textL(`You pull the bad experiment from your bag and toss it at the ${enemyName()}. The crude stuff explodes, far enough away to not harm you, dealing ${dmg} damage!`)
      doeHP(-dmg)
      doBattle()
    }
  }
  // Express Pregnancy Potion
  if (ID === 506) {
    if (pregCheck(0)) {
      textL(`Drinking this potion, you can feel your ${bellyDesc()} belly quiver, the offspring inside moving about. With a groan, you double over for a moment, your belly stretching beneath your hands. You can almost hear the ${skinDesc()} creak, growing taut!`)
      for (let i = 0; i < gs.pregArray.length; i += 5) {
        if (gs.pregArray[i] === true) { gs.pregArray[i + 3] += 50 }
      }
      textLP(`\r\rA few moments pass before you gather yourself, standing upright once more. You are slightly more swollen now, wielding a ${bellyDesc()} gut instead. Fortunately, both you and your offspring are uninjured, though it'll take a bit to get used to the sudden increase in size.`)
      doEnd()
    } else {
      textL("For some reason, you thought it necessary to drink this potion. It... doesn't seem to have any effect. Though you do strangely feel like you have to go to the bathroom all of a sudden...")
      doEnd()
    }
  }
  // Ball Sweller
  if (ID === 507) {
    if (gs.balls > 0 && gs.showBalls === true) {
      textL(`Downing the potion, you quickly begin to feel a slight ache in your ${ballDesc()} testicles, like you haven't had an orgasm in a while...`)
      gs.blueBalls += 30
      doEnd()
    } else if (gs.balls > 0 && gs.showBalls === false) {
      textL("Downing the potion, you quickly begin to feel a slight ache in your abdomen, like you haven't had an orgasm in a while...")
      gs.blueBalls += 30
      doEnd()
    } else {
      textL("Despite not having any balls to speak of, you drink this potion anyways. It does nothing. I hope you're happy.")
      doEnd()
    }
  }
  // Superior Lust Draft
  if (ID === 508) {
    textL('You take a swig of the draft, your loins burning hot within seconds.')
    doLust(50, 0)
    doEnd()
  }
  // Superior Rejuvenating Potion
  if (ID === 509) {
    textL('You down the potion, your body feeling immensely better than before.')
    doHP(70)
    doLust(-40, 0)
    doEnd()
  }
  // Superior Bad Experiment
  if (ID === 510) {
    if (gs.currentState !== 2) {
      textL('You can only use this explosive potion in battle. You put the bad experiment back into your bag.')
      itemAdd(510)
      doEnd()
    } else {
      const dmg = Math.floor(Math.random() * (1 + 40 - 20)) + 20
      textL(`You pull the super bad experiment from your bag and toss it at the ${enemyName()}. The super crude stuff explodes superbly, far enough away to not harm you, dealing a super ${dmg} damage!`)
      doeHP(-dmg)
      doBattle()
    }
  }
  // Superior Express Pregnancy Potion
  if (ID === 511) {
    if (pregCheck(0)) {
      textL(`Drinking this potion, you can feel your ${bellyDesc()} belly shake, the offspring inside moving about. With a groan, you double over for a moment, your belly stretching beneath your hands. You're pretty sure you can hear the ${skinDesc()} creak, growing taut, to the point where you fear it will tear!`)
      for (let i = 0; i < gs.pregArray.length; i += 5) {
        if (gs.pregArray[i] === true) { gs.pregArray[i + 3] += 120 }
      }
      textLP(`\r\rA few moments pass before you gather yourself, standing upright once more, having a bit of difficulty doing so. You are much more swollen now, wielding a ${bellyDesc()} gut instead. Fortunately, both you and your offspring are uninjured, though you're unsure if you'll be able to get used to this sudden increase in size...`)
      doEnd()
    } else {
      textL("For some reason, you thought it necessary to drink this potion. It... doesn't seem to have any effect. Though you do strangely wish there was a bathroom here all of a sudden...")
      doEnd()
    }
  }
  // Superior Ball Sweller
  if (ID === 512) {
    if (gs.balls > 0 && gs.showBalls === true) {
      textL(`Downing the potion, you quickly begin to feel a great ache in your ${ballDesc()} testicles, like you haven't had an orgasm in sooo long!`)
      gs.blueBalls += 70
      doEnd()
    } else if (gs.balls > 0 && gs.showBalls === false) {
      textL("Downing the potion, you quickly begin to feel a great ache in your abdomen, like you haven't had an orgasm in sooo long!")
      gs.blueBalls += 70
      doEnd()
    } else {
      textL("Despite not having any balls to speak of, you drink this potion anyways. It does nothing. I hope you're happy.")
      doEnd()
    }
  }

  // Masochism Potion
  if (ID === 514) {
    textL("After drinking the potion, your body feels tingly all over. You have the odd feeling like it would be fun to be whipped right about now...")
    gs.masoPot += 24
    doEnd()
  }

  // Baby Free Potion
  if (ID === 516) {
    textL("Taking the potion, you sudden feel less... fertile than before. You might still be a little fertile, but you suspect you can go out 'clubbing' for the next few days and not have to worry so much about a little extra weight in a few more. If you knew what any of that even meant.")
    gs.babyFree += 72
    doEnd()
  }

  // Potency Potion
  if (ID === 517) {
    if (gs.showBalls === true && gs.balls > 0) {
      textL(`Within seconds of drinking this potion, you can feel your balls grow slightly warmer. You can almost hear them hum as they work harder to produce more fun goop for your cock${plural(1)}.`)
    } else if (gs.showBalls === false && gs.balls > 0) {
      textL(`Within seconds of drinking this potion, you can feel your abdomen grow slightly warmer. You can almost hear something inside hum as it works harder to produce more fun goop for your cock${plural(1)}.`)
    } else {
      textL("If you had balls to be kicked in, they'd probably be feeling more active right now. Not that you would know, you ball-less freak.")
    }
    gs.cumMod += 0.2
    doEnd()
  }

  // Superior Masochism Potion
  if (ID === 519) {
    textL("After drinking the potion, your body feels like electricity is sparking all over. You have the odd feeling like it would be fun to be beaten to a pulp right about now...")
    gs.sMasoPot += 24
    doEnd()
  }

  // Superior Baby Free Potion
  if (ID === 521) {
    textL("Taking the potion, you sudden feel less... fertile than before. You might still be a little fertile, but you suspect you can go out 'clubbing' for the next several days and not have to worry so much about a little extra weight afterwards. If you knew what any of that even meant.")
    gs.babyFree += 216
    doEnd()
  }

  // Superior Potency Potion
  if (ID === 522) {
    if (gs.showBalls === true && gs.balls > 0) {
      textL(`Within seconds of drinking this potion, you can feel your balls grow slightly hotter. You can almost hear them whir as they work harder to produce more fun goop for your cock${plural(1)}.`)
    } else if (gs.showBalls === false && gs.balls > 0) {
      textL(`Within seconds of drinking this potion, you can feel your abdomen grow slightly hotter. You can almost hear something inside whir as it works harder to produce more fun goop for your cock${plural(1)}.`)
    } else {
      textL("If you had balls to be kicked in, they'd probably be feeling much more active right now. Not that you would know, you ball-less freak.")
    }
    gs.cumMod += 0.5
    doEnd()
  }

  // Cum Vial
  if (ID === 523) {
    textL("You pop open the vial of cum and let it ooze down your throat, shivering a bit from the heady taste.")
    doHP(2)
    doLust(5, 0)
    doEnd()
  }

  // Cum Bottle
  if (ID === 524) {
    textL("You gulp down the thick, creamy, sticky cum, having difficulty getting down the large amount of hot spunk with its heady taste.")
    doHP(5)
    doLust(15, 0)
    doEnd()
  }

  // Cum Jug
  if (ID === 525) {
    textL("You pour the jug of cum out into 3 bottles...")
    itemAdd(524)
    itemAdd(524)
    itemAdd(524)
    doEnd()
  }

  // Cum Barrel
  if (ID === 526) {
    if (gs.currentState === 2) {
      textL("You have no use for a barrel full of cum in the midst of battle, so you... tuck it away somewhere in your bag?")
      itemAdd(526)
      doEnd()
    } else {
      textL(`Without much of a use for it otherwise, you decide to... strip down naked and jump in!\r\rThe cum is nice and warm and feels so good on your ${skinDesc()}. You scrub yourself nice and thoroughly, making sure to get all the nooks and crannies. And with the slimy goop, you really focus on those crannies~\r\rAfter cleaning yourself up a bit, you sit back and relax, pulling out a toy to play with.\r\r\r'Oh rubber ducky, you're the one. You make bath-time lots of fun~'`)
      stats(0, 0, 1, 1)
      gs.hrs++
      doEnd()
    }
  }

  // Good Egg
  if (ID === 527) {
    textL("You crack open the good egg and down its contents, feeling healthier and stronger already.")
    doHP(15)
    stats(1, 0, 0, 0)
    doEnd()
  }

  // Bad Egg
  if (ID === 528) {
    if (gs.currentState !== 2) {
      textL("You can only use this dangerous egg in battle. You put the bad egg back into your bag.")
      itemAdd(528)
      doEnd()
    } else {
      const dmg = Math.floor(Math.random() * (1 + 20 - 10)) + 10
      textL(`You pull the bad egg from your bag and toss it at the ${enemyName()}. It explodes in a burst of fire, somehow, dealing ${dmg} damage!`)
      doeHP(-dmg)
      if (gs.currentState === 2) { doEnd() }
    }
  }

  // Charmed Egg
  if (ID === 530) {
    textL("You crack the charmed egg open and gulp its contents. You suddenly feel charming, oh so charming, it's alarming how charming you feeeeel~")
    if (gs.charmTime <= 0) {
      gs.enticeMod += 13
      gs.charmTime = 20
    } else {
      gs.charmTime += 20
    }
    stats(0, 1, 0, 0)
    doEnd()
  }

  // Divine Egg
  if (ID === 531) {
    textL("You can nearly hear the sounds of an angelic chorus as you crack the divine egg open, its gooey contents slipping down your throat.")
    if (gs.cockTotal > 0) {
      textLP(` Your ${cockDesc()} cock${plural(1)} pulse${plural(3)} and bulge${plural(3)} in your ${clothesBottom()}, swelling in size.`)
      if (gs.showBalls === true) {
        textLP(" Your balls groan to match the amount of growth, expanding in their confines.")
      }
      textLP(" You can feel the cum churn within your body, trying to make room for more.")
      cockChange(5, 0)
      gs.ballSize += 5
      gs.cumMod += 0.5
    }
    if (gs.vagTotal > 0) {
      textLP(` Your loins ache as your nether-lips grow between your thighs, your pelvis literally spreading to make more room as your ${hipDesc()} hips press outward. Your ovaries tickle a little as they spill their eggs for easier fertilization. Even your ${boobDesc()} breasts feel heavier, your ${nipDesc()}nipples growing longer for greater mouthfuls.`)
      vagChange(5, 0)
      gs.hips += 5
      gs.vulvaSize += 5
      gs.pregChanceMod += 5
      gs.extraPregChance += 10
      boobChange(5)
    }
    doEnd()
  }

  // Strong Pheromone
  if (ID === 532) {
    textL("You rub the strong-scented pheromones all over your body. It's so... powerful that even you feel a little rambunctious just wearing it. Others would probably find it much more enticing as well, strengthening their attraction to you.")
    if (gs.pheromone <= 0) {
      gs.pheromone = 30
      gs.enticeMod += 25
      statsMod(0, 0, 3, 0)
    } else {
      gs.pheromone += 30
    }
    doEnd()
  }

  // Male Enhancement Drug
  if (ID === 534) {
    textL("You pop the pill into your mouth, feeling a bit of warmth emanating from your groin.")
    if (gs.cockTotal > 0) {
      textLP(` You pull ${pullUD(2)} your ${clothesBottom()} and watch with awe as your shlong${plural(1)} grow longer`)
      if (gs.showBalls === true) {
        textLP(" and the testicles beneath swell within your scrotum")
      }
      textLP(".\r\rIt really does work!")
      gs.cockSize += 4
      gs.ballSize += 2
    } else if (gs.gender === 2) {
      textLP(` Yet, despite not having any male genitals to speak of, you feel something growing longer. Pulling ${pullUD(2)} your ${clothesBottom()}, you watch with awe as your clit${plural(2)} extends further from ${plural(6)} hood${plural(2)}! You also feel more... horny than usual...\r\rThough the pill was meant for males, females have quite a bit in common.`)
      gs.clitSize += 3
      stats(0, 0, 1, 0)
    } else {
      textLP("\r\rYou don't have any genitals for it to enhance though, so it was kind of a waste.")
    }
    doEnd()
  }

  // Milk Suppressant
  if (ID === 535) {
    textL(`You gulp down the vial of Milk Suppressant. You don't notice much of a difference, except that your ${nipDesc()} nipples`)
    if (gs.udders === true) {
      textLP(` and ${teatDesc()} teats`)
    }
    textLP(" stiffen to such a point that they feel almost rock-hard. They don't really settle down either, like they're trying to hold something back.")
    gs.milkSuppressant += 48
    gs.milkSuppressantLact = gs.lactation
    gs.milkSuppressantUdder = gs.udderLactation
    gs.lactation = 0
    gs.udderLactation = 0
    doEnd()
  }

  // Queen Egg
  if (ID === 537) {
    textL(`You munch on the egg, the wonderful flavors flowing over your tongue. It's sweet and buttery, quickly sliding down your gullet with delight until you're sucking the leftovers from your fingers. And as you ruminate over the delicious snack, you feel your ${clothesBottom()} grow tighter. Your hips grow wider and your rump larger,`)
    if (gs.vagTotal > 0) {
      textLP(" the lips of your sex swelling as well, while your womb becomes more efficient,")
      gs.pregRate += 0.05
      gs.vulvaSize += 1
    }
    textLP(` and your ${boobDesc()} chest feels slightly bigger on the inside than on the outside. Growing more suitable for a breeding queen.`)
    gs.hips += 1
    gs.butt += 1
    gs.milkCap += 4
    doEnd()
  }

  // Soldier Egg
  if (ID === 538) {
    textL("You bite down into the egg, getting through the tougher rind and giving it a good chew before you swallow. It takes a bit to get through the whole thing and by the time you're done the ground looks further away than usual. You've grown slightly taller and feel more lean and strong.")
    gs.tallness += 1
    gs.body += 1
    stats(1, 0, 0, 0)
    doEnd()
  }

  // Drone Egg
  if (ID === 539) {
    textL("You gobble down the egg, your mind quickly drifting more towards lustful thoughts.")
    if (gs.cockTotal > 0) {
      textLP(` Your cock${plural(1)} grow${plural(3)} slightly larger, more able to ensure a deeper injection of your seed.`)
      gs.cockSize += 1
      if (gs.showBalls === true) {
        textLP(" Your balls also feel more ready to spurt, as though you've gone many more hours without ejaculation than you actually have.")
      }
      gs.blueBalls += 10
    }
    if (gs.vagTotal > 0) {
      textLP(` And though ${plural(8)} not actually something that can impregnate, your clit${plural(2)} swell${plural(4)} slightly larger.`)
      gs.clitSize += 1
    }
    stats(0, -1, 1, 0)
    doEnd()
  }

  // Worker Egg
  if (ID === 540) {
    textL("You quickly chomp down the egg. It doesn't exactly taste good or bad, but that doesn't really matter. You just feel like you've got more energy to keep working!")
    gs.exhaustion -= 6
    doEnd()
  }

  // Blood Gauge
  if (ID === 108) {
    textL("You push the gauge against your pulse. It grows warm for a moment before a vague display shows up on the other side.")
    if (gs.humanAffinity > 0) {
      textLP("\r\rHuman:\r")
      for (let i = 1; i <= gs.humanAffinity; i++) { textLP("|") }
    }
    if (gs.horseAffinity > 0) {
      textLP("\r\rHorse:\r")
      for (let i = 1; i <= gs.horseAffinity; i++) { textLP("|") }
    }
    if (gs.wolfAffinity > 0) {
      textLP("\r\rWolf:\r")
      for (let i = 1; i <= gs.wolfAffinity; i++) { textLP("|") }
    }
    if (gs.catAffinity > 0) {
      textLP("\r\rCat:\r")
      for (let i = 1; i <= gs.catAffinity; i++) { textLP("|") }
    }
    if (gs.cowAffinity > 0) {
      textLP("\r\rCow:\r")
      for (let i = 1; i <= gs.cowAffinity; i++) { textLP("|") }
    }
    if (gs.lizardAffinity > 0) {
      textLP("\r\rLizard:\r")
      for (let i = 1; i <= gs.lizardAffinity; i++) { textLP("|") }
    }
    if (gs.rabbitAffinity > 0) {
      textLP("\r\rRabbit:\r")
      for (let i = 1; i <= gs.rabbitAffinity; i++) { textLP("|") }
    }
    if (gs.mouseAffinity > 0) {
      textLP("\r\rMouse:\r")
      for (let i = 1; i <= gs.mouseAffinity; i++) { textLP("|") }
    }
    if (gs.birdAffinity > 0) {
      textLP("\r\rBird:\r")
      for (let i = 1; i <= gs.birdAffinity; i++) { textLP("|") }
    }
    if (gs.pigAffinity > 0) {
      textLP("\r\rPig:\r")
      for (let i = 1; i <= gs.pigAffinity; i++) { textLP("|") }
    }
    if (gs.skunkAffinity > 0) {
      textLP("\r\rSkunk:\r")
      for (let i = 1; i <= gs.skunkAffinity; i++) { textLP("|") }
    }
    if (gs.bugAffinity > 0) {
      textLP("\r\rBug:\r")
      for (let i = 1; i <= gs.bugAffinity; i++) { textLP("|") }
    }
    doEnd()
  }

  // Educated Eggdicator
  if (ID === 109) {
    if (checkItem(219)) {
      if (gs.knowPheromone === true && gs.silRep < 1 && !checkItem(530) && !checkStash(530) && !checkItem(532) && !checkStash(532) && gs.pheromone < 1) {
        textL("You slip a Fresh Egg into the eggdicator and listen to it whir as it studies the egg. Within moments, you hear a *DING*.\r\r")
        loseManyItem(219, 1)
        textLP("Into the reception bin rolls a white-shelled egg with pretty red hearts all over.")
        itemAdd(530)
        doEnd()
      } else {
        const chance = percent()
        textL("You slip a Fresh Egg into the eggdicator and listen to it whir as it studies the egg. Within moments, you hear a *DING*.\r\r")
        loseManyItem(219, 1)
        if (chance <= 45) {
          textLP("Into the reception bin rolls a blue-shelled egg.")
          itemAdd(527)
        } else if (chance <= 85) {
          textLP("Into the reception bin rolls a red-shelled egg.")
          itemAdd(528)
        } else if (chance <= 92) {
          textLP("Into the reception bin rolls a pink-shelled egg with teal polka-dots.")
          itemAdd(529)
        } else if (chance <= 97) {
          textLP("Into the reception bin rolls a white-shelled egg with pretty red hearts all over.")
          itemAdd(530)
        } else if (chance <= 100) {
          textLP("Into the reception bin rolls a golden-shelled glowing egg.")
          itemAdd(531)
        }
        doEnd()
      }
    } else {
      textL("The well-educated eggdicator indicates a deficiency in your ovoid protein supply and thus cannot adequately correspond to your commands.\r\rI.e. - You need a Fresh Egg to use this.")
      doEnd()
    }
  }

  // Wet, Slimy Cloth
  if (ID === 213) {
    bc()
    viewButtonText(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0)
    viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0)
    buttonWrite(5, `Cock${plural(1)}`)
    buttonWrite(7, `Cunt${plural(2)}`)
    buttonWrite(10, "Breasts")
    buttonWrite(12, "Cancel")
    if (gs.cockTotal > 0) { setButtonVisible(5, true) }
    if (gs.vagTotal > 0) { setButtonVisible(7, true) }
    textL("What would you like to rub the wet, slimy cloth on?")
    gs.doListen = (): void => {
      if (gs.buttonChoice === 5) {
        textL(`You rub the slimy cloth around the head${plural(1)} of your ${cockDesc()} cock${plural(1)}, polishing until there's a nice sheen. You feel a bit aroused from doing so, yet the cloth seems to have finally dried off.\r\rHowever, your cock${plural(1)} begin${plural(3)} dripping with the slime of the cloth instead...`)
        gs.cockMoist++
        if (gs.cockMoist > 12) { textLP("\r\rHowever, that's not really any different than normal, leaving you fairly unaffected.") }
        doLust(percent() / 10, 0)
        doEnd()
      }
      if (gs.buttonChoice === 7) {
        textL(`You rub the slimy cloth through the lips of your ${vulvaDesc()} cunt${plural(2)} until your thighs are completely wet. You feel a bit aroused from doing so, yet the cloth seems to have finally dried off.\r\rHowever, your cunt${plural(2)} begin${plural(4)} dripping with the slime of the cloth instead...`)
        gs.vagMoist++
        if (gs.vagMoist > 12) { textLP("\r\rHowever, that's not really any different than normal, leaving you fairly unaffected.") }
        doLust(percent() / 10, 0)
        doEnd()
      }
      if (gs.buttonChoice === 10) {
        textL(`You rub the slimy cloth over your ${boobDesc()} breasts and ${nipDesc()}nipples until they're all completely wet. You feel a bit aroused from doing so, yet the cloth seems to have finally dried off.\r\rHowever, other than make your chest shine erotically, it doesn't really do much.`)
        doLust(percent() / 10, 0)
        doEnd()
      }
      if (gs.buttonChoice === 12) {
        itemAdd(213)
        doProcess()
      }
    }
  }

  // Bazoomba!
  if (ID === 536) {
    textL("You pop the little growing orb into your mouth and quickly gulp it down past your gag reflex. It doesn't take long before your chest begins to feel warm...")
    if (gs.boobTotal === 2) {
      textLP(`\r\rYour chest, close beneath your nipples, begins to tickle. A new pair of sensitive areolas form amongst your ${skinDesc()}, creating an extra row of breasts beneath the originals.`)
      if (bustRatio() > 1.07) {
        textLP(` The new nipples protrude as fleshy mounds form from beneath them. The new boobs wobble as they grow to the same size of your original pair, lifting the originals slightly with their girth.\tWhen you head back to town, you'll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ${clothesTop()} accordingly.`)
      }
      gs.boobTotal = 4
      gs.fourBoobAffinity = 100
      gs.twoBoobAffinity = 0
    } else if (gs.boobTotal === 4) {
      textLP(`\r\rYour chest and belly tickle. Two new nipples form amongst your ${skinDesc()}, right below your second pair above your belly, leaving you with three rows of two breasts.`)
      if (bustRatio() > 1.07) {
        textLP(` The nipples protrude as fleshy mounds form beneath them, while your second pair seems to shrink in turn. Breast-flesh wobbles, each row a fraction in size of the one above it. When you head back to town, you'll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ${clothesTop()} accordingly.`)
      }
      gs.boobTotal = 6
      gs.sixBoobAffinity = 100
      gs.fourBoobAffinity = 0
    } else if (gs.boobTotal === 6) {
      textLP(`\r\rYour chest and belly tickle. Two new nipples form amongst your ${skinDesc()}, right below your second pair above your belly, leaving you with four rows of two breasts, from chest to your lower belly.`)
      if (bustRatio() > 1.07) {
        textLP(` The lower pairs continue to grow while your top pair shrinks a little, all equalizing in size. When you head back to town, you'll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ${clothesTop()} accordingly.`)
      }
      gs.boobTotal = 8
      gs.eightBoobAffinity = 100
      gs.sixBoobAffinity = 0
    } else if (gs.boobTotal === 8) {
      textLP(`\r\rThe area above your crotch tickles. Two new nipples form amongst your ${skinDesc()}, right below your fourth pair below your belly, leaving you with five rows of two breasts, from your chest to your crotch.`)
      if (bustRatio() > 1.07) {
        textLP(` The lower pairs continue to grow while your top pair shrinks a little, all equalizing in size. When you head back to town, you'll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ${clothesTop()} accordingly.`)
      }
      gs.boobTotal = 10
      gs.tenBoobAffinity = 100
      gs.eightBoobAffinity = 0
    } else if (gs.boobTotal === 10) {
      textLP("\r\rYour chest down to your crotch starts to tickle. Checking, you see dozens of nipples beginning to appear amongst your breasts, going down to your groin and some even on your back. Mound of flesh begin growing everywhere until you're surrounded by tits!\r\rThen, a popping whir begins to fill the air. In a puff of pink smoke, all your breasts disappear at once, save the single primary pair upon your chest. It seems you have gone a bit overboard with the boobage...")
      gs.boobTotal = 2
      gs.twoBoobAffinity = 100
      gs.tenBoobAffinity = 0
    }
    doEnd()
  }

  // Strange Egg
  if (ID === 529) {
    textL("You crack open the strange egg and down its contents, feeling odd...")
    if (percent() <= 10) {
      textLP("\r\rYou grow an inch taller.")
      gs.tallness++
    }
    if (percent() <= 10) {
      textLP("\r\rYou shrink by an inch.")
      gs.tallness--
    }
    if (percent() <= 10) {
      textLP("\r\rYour chest springs out, swelling in size.")
      gs.breastSize += Math.ceil(percent() / 10)
    }
    if (percent() <= 10 && gs.breastSize > 1) {
      textLP("\r\rYour breasts recoil back, deflating.")
      gs.breastSize -= Math.ceil(percent() / 10)
    }
    if (percent() <= 10) {
      textLP("\r\rYour crotch feels strange as some feminine bits begin to appear...")
      vagChange(Math.ceil(percent() / 10), Math.ceil(percent() / 20))
    }
    if (percent() <= 10) {
      textLP("\r\rYour crotch feels strange as some masculine bits begin to appear...")
      cockChange(Math.ceil(percent() / 10), Math.ceil(percent() / 20))
    }
    if (percent() <= 10 && gs.cockTotal > 0) {
      textLP(`\r\rYour cock${plural(1)} grow${plural(3)} sporadically.`)
      cockChange(Math.ceil(percent() / 10), 0)
    }
    if (percent() <= 10 && gs.cockTotal > 0) {
      textLP(`\r\rYour cock${plural(1)} shrink${plural(3)} sporadically.`)
      cockChange(-Math.ceil(percent() / 10), 0)
    }
    if (percent() <= 10 && gs.vagTotal > 0) {
      textLP(`\r\rYour vulva${plural(2)} grow${plural(4)} sporadically.`)
      vagChange(Math.ceil(percent() / 10), 0)
      gs.vulvaSize += Math.ceil(percent() / 10)
      gs.clitSize += Math.ceil(percent() / 10)
    }
    if (percent() <= 10 && gs.vagTotal > 0) {
      textLP(`\r\rYour vulva${plural(2)} shrink${plural(4)} sporadically.`)
      vagChange(-Math.ceil(percent() / 10), 0)
      gs.vulvaSize -= Math.ceil(percent() / 10)
      gs.clitSize -= Math.ceil(percent() / 10)
    }
    if (percent() <= 10) {
      textLP("\r\rIt feels as though your blood has thinned out a bit.")
      aff(0, 0, -10)
    }
    if (percent() <= 10) {
      textLP("\r\rYou suddenly feel very aroused.")
      doLust(50, 0)
    }
    if (percent() <= 10) {
      textLP("\r\rYour arousal suddenly dies down.")
      doLust(-50, 0)
    }
    if (percent() <= 10) {
      textLP("\r\r10 coins pop out of your ears.")
      doCoin(10)
    }
    if (percent() <= 10 && gs.vagTotal > 0) {
      textLP(`\r\rYou grunt and squat, ${legVerb(1)} your ${legDesc(2)} and pulling ${pullUD(2)} your ${clothesBottom()} in time for more fresh eggs to come sliding out of your slit${plural(2)} from nowhere!`)
      itemAdd(219)
      itemAdd(219)
      itemAdd(219)
    }
    textLP("\r\rQuite strange indeed...")
    doEnd()
  }

  // Reduction
  if (ID === 110) {
    gs.choiceListArray = []
    if (gs.breastSize > 0) { gs.choiceListArray.push("Breasts") }
    if (gs.nippleSize > 1) { gs.choiceListArray.push("Nipples") }
    if (gs.butt > 1) { gs.choiceListArray.push("Butt") }
    if (gs.hips > 1) { gs.choiceListArray.push("Hips") }
    if (gs.vagTotal > 0) {
      gs.choiceListArray.push("Pussy")
      if (gs.vulvaSize > 0) { gs.choiceListArray.push("Vulva") }
      if (gs.clitSize > 1) { gs.choiceListArray.push("Clit") }
    }
    if (gs.cockTotal > 0) {
      gs.choiceListArray.push("Cock")
      if (gs.showBalls === true && gs.ballSize > 1) { gs.choiceListArray.push("Balls") }
    }
    if (gs.udders === true) {
      if (gs.udderSize > 1) { gs.choiceListArray.push("Udder") }
      if (gs.teatSize > 2) { gs.choiceListArray.push("Teats") }
    }
    if (gs.bellyMod > 0) { gs.choiceListArray.push("Belly") }

    choiceListButtons("Reduction")
    textL("Select which body part you would like to halve in size. If you don't have that part, this elixer will do nothing but will still be consumed.")
    gs.doListen = (): void => {
      choiceListSelect("Reduction")
      textL("You splash the elixir out onto your ")
      if (gs.choiceListResult[0] === "Cock") {
        textLP(`${cockDesc()} cock${plural(1)}`)
        textLP(" and watch with a shiver as the flesh receeds.")
        cockChange(-Math.ceil(gs.cockSize / 2), 0)
      }
      if (gs.choiceListResult[0] === "Balls") {
        textLP(`${ballDesc()} balls`)
        gs.ballSize -= Math.floor(gs.ballSize / 2)
        textLP(` and watch with a shiver as the orbs shrink, becoming ${ballDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Pussy") {
        textLP(`vagina${plural(2)}`)
        textLP(" and quiver as the fleshy walls within your body shrink.")
        vagChange(Math.floor(-gs.vagSize / 2), 0)
      }
      if (gs.choiceListResult[0] === "Vulva") {
        textLP(`${vulvaDesc()} vulva`)
        gs.vulvaSize -= Math.floor(gs.vulvaSize / 2)
        textLP(` and watch with a quiver as nether-lips shrink, becoming ${vulvaDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Clit") {
        textLP(`${clitDesc()} clit${plural(2)}`)
        gs.clitSize -= Math.floor(gs.clitSize / 2)
        textLP(` and watch with a quiver as the button${plural(2)} shrink${plural(4)}, becoming ${clitDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Breasts") {
        textLP(`${boobDesc()} breasts`)
        gs.breastSize -= Math.floor(gs.breastSize / 2)
        textLP(" and shudder as they shrink.")
      }
      if (gs.choiceListResult[0] === "Nipples") {
        textLP(`${nipDesc()} nipples`)
        gs.nippleSize -= Math.floor(gs.nippleSize / 2)
        textLP(" and shudder as they receed into your breasts.")
      }
      if (gs.choiceListResult[0] === "Udder") {
        textLP(`${udderDesc()} udder`)
        gs.udderSize -= Math.floor(gs.udderSize / 2)
        textLP(` and watch as it shrivels, becoming ${udderDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Teats") {
        textLP(`${teatDesc()} teats`)
        gs.teatSize -= Math.floor(gs.teatSize / 2)
        textLP(` and watch as they recede, becoming ${teatDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Butt") {
        textLP(`${buttDesc()} butt`)
        gs.butt -= Math.floor(gs.butt / 2)
        textLP(` and squirm as it shrinks, becoming ${buttDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Hips") {
        textLP(`${hipDesc()} hips`)
        gs.hips -= Math.floor(gs.hips / 2)
        textLP(` and squirm as they narrow, becoming ${hipDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Belly") {
        textLP(`${bellyDesc()} belly`)
        gs.bellyMod -= Math.floor(gs.bellyMod / 2)
        textLP(` and feel lighter as the chubbiness burns off, becoming ${bellyDesc()}.`)
      }
      if (gs.buttonChoice === 4 || gs.buttonChoice === 8) {
        choiceListButtons("Reduction")
      } else if (gs.buttonChoice === 12) {
        itemAdd(110)
        doProcess()
      } else {
        doEnd()
      }
    }
  }

  // Reduced Reduction
  if (ID === 533) {
    gs.choiceListArray = []
    if (gs.breastSize > 0) { gs.choiceListArray.push("Breasts") }
    if (gs.nippleSize > 1) { gs.choiceListArray.push("Nipples") }
    if (gs.butt > 1) { gs.choiceListArray.push("Butt") }
    if (gs.hips > 1) { gs.choiceListArray.push("Hips") }
    if (gs.vagTotal > 0) {
      gs.choiceListArray.push("Pussy")
      if (gs.vulvaSize > 0) { gs.choiceListArray.push("Vulva") }
      if (gs.clitSize > 1) { gs.choiceListArray.push("Clit") }
    }
    if (gs.cockTotal > 0) {
      gs.choiceListArray.push("Cock")
      if (gs.showBalls === true && gs.ballSize > 1) { gs.choiceListArray.push("Balls") }
    }
    if (gs.udders === true) {
      if (gs.udderSize > 1) { gs.choiceListArray.push("Udder") }
      if (gs.teatSize > 2) { gs.choiceListArray.push("Teats") }
    }
    if (gs.bellyMod > 0) { gs.choiceListArray.push("Belly") }

    choiceListButtons("Reduc Reduc")
    textL("Select which body part you would like to shrink a bit. If you don't have that part, this elixir will do nothing but will still be consumed.")
    gs.doListen = (): void => {
      choiceListSelect("Reduc Reduc")
      textL("You splash the elixir out onto your ")
      if (gs.choiceListResult[0] === "Cock") {
        textLP(`${cockDesc()} cock${plural(1)}`)
        textLP(` and watch the appendage${plural(1)} quiver and shrivel down by ${2 * gs.cockSizeMod} inches.`)
        cockChange(-4, 0)
      }
      if (gs.choiceListResult[0] === "Balls") {
        textLP(`${ballDesc()} balls`)
        gs.ballSize -= 4
        textLP(" and watch with a shiver as the orbs shrink.")
      }
      if (gs.choiceListResult[0] === "Pussy") {
        textLP(`vagina${plural(2)}`)
        textLP(" and quiver as the fleshy walls within your body shrink.")
        vagChange(-4, 0)
      }
      if (gs.choiceListResult[0] === "Vulva") {
        textLP(`${vulvaDesc()} vulva`)
        gs.vulvaSize -= 4
        textLP(` and watch with a quiver as nether-lips shrink, becoming ${vulvaDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Clit") {
        textLP(`${clitDesc()} clit${plural(2)}`)
        gs.clitSize -= 4
        textLP(` and watch with a quiver as the button${plural(2)} shrink${plural(4)}, becoming ${clitDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Breasts") {
        textLP(`${boobDesc()} breasts`)
        gs.breastSize -= 4
        textLP(" and shudder as they shrink by about 2 inches.")
      }
      if (gs.choiceListResult[0] === "Nipples") {
        textLP(`${nipDesc()} nipples`)
        gs.nippleSize -= 4
        textLP(" and shudder as they receed into your breasts nearly an inch.")
      }
      if (gs.choiceListResult[0] === "Udder") {
        textLP(`${udderDesc()} udder`)
        gs.udderSize -= 4
        textLP(` and watch as it shrivels, becoming ${udderDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Teats") {
        textLP(`${teatDesc()} teats`)
        gs.teatSize -= 4
        textLP(` and watch as they recede, becoming ${teatDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Butt") {
        textLP(`${buttDesc()} butt`)
        gs.butt -= 4
        textLP(` and squirm as it shrinks, becoming ${buttDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Hips") {
        textLP(`${hipDesc()} hips`)
        gs.hips -= 4
        textLP(` and squirm as they narrow, becoming ${hipDesc()}.`)
      }
      if (gs.choiceListResult[0] === "Belly") {
        textLP(`${bellyDesc()} belly`)
        gs.bellyMod -= 4
        textLP(` and watch as some of the fat burns off, becoming ${bellyDesc()}.`)
      }
      if (gs.buttonChoice === 4 || gs.buttonChoice === 8) {
        choiceListButtons("Reduc Reduc")
      } else if (gs.buttonChoice === 12) {
        itemAdd(533)
        doProcess()
      } else {
        doEnd()
      }
    }
  }

  // Milking Machine
  if (ID === 104) {
    if (gs.currentState !== 3) {
      textL("You can only use a milker while masturbating.")
      doEnd()
    } else {
      let tempNum = 0
      bc()
      viewButtonText(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0)
      viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0)
      buttonWrite(5, "Breasts")
      buttonWrite(7, "Udder")
      if (gs.udders === true) { setButtonVisible(7, true) }
      textL("What would you like to pump?")
      gs.doListen = (): void => {
        if (gs.buttonChoice === 5) { tempNum = 1 }
        if (gs.buttonChoice === 7) { tempNum = 2 }
        let getMilk = 0
        textL("You uncoil the tubes of your milker, stretching them out and starting up the pump. Attaching the appropriate cups, you slip them onto your ")
        if (tempNum === 1) { textLP(`${nipDesc()} nipples, until the rims press up and seal onto your ${boobDesc()} breasts with the gentle suction.`) }
        if (tempNum === 2) { textLP(`${teatDesc()} teats, until the rims press up and seal onto your ${udderDesc()} udder with the gentle suction.`) }
        textLP("\r\rYou shudder a little as the stuttered pumping vibrates through your body. Warmth begins to envelop your ")
        if (tempNum === 1) { textLP("chest") }
        if (tempNum === 2) { textLP("belly") }
        textLP(" feeling all tingly.")
        if ((tempNum === 1 && gs.lactation > 0) || (tempNum === 2 && gs.udderLactation > 0)) {
          gs.hrs++
          getMilk = milkAmount(tempNum)
          textLP(" Droplets of milk begin to trickle around your ")
          if (tempNum === 1) { textLP("nipples") }
          if (tempNum === 2) { textLP("teats") }
          textLP(" and slurps through the tubes. Within moments, your ")
          if (tempNum === 1) { textLP("nipples") }
          if (tempNum === 2) { textLP("teats") }
          textLP(" throb along with the pulse, ")
          if (getMilk <= 500) { textLP("small dribbles") }
          if (getMilk > 500 && getMilk <= 1000) { textLP("spurts") }
          if (getMilk > 1000 && getMilk <= 2000) { textLP("sprays") }
          if (getMilk > 2000 && getMilk <= 8000) { textLP("jets") }
          if (getMilk > 8000 && getMilk <= 19000) { textLP("steady streams") }
          if (getMilk > 19000) { textLP("small floods") }
          textLP(" of milk swishing through the tubes and collecting at the machine.")
        }
        textLP(" The pleasurable sensation lingers constantly, bringing you to a small orgasm")
        if (getMilk > 0) { textLP(" while your flow of milk slows to a stop") }
        textLP(".\r\rYou flip the machine off, the cups making a loud kissing sound as the vacuum is released. As they fall to the floor, you rub your aroused ")
        if (tempNum === 1) { textLP(`${nipDesc()} nipples`) }
        if (tempNum === 2) { textLP(`${teatDesc()} teats`) }
        textLP(", shivering from their shortly increased sensitivity, slightly engorged and inflated.")
        if (gs.boobTotal > 2 || tempNum === 2) { textLP(" Then you move onto the next pair...") }
        textLP(" Eventually you clean yourself up and put the machine away.")
        if (tempNum === 1) {
          gs.nipPump += 10
          if (gs.nipPump > 40) {
            gs.nipPump = 0
            gs.nippleSize++
            textLP("\r\rHowever, this time your nipples don't seem to relax back to their original state, permanently swollen larger...")
          }
        }
        if (tempNum === 2) {
          gs.teatPump += 10
          if (gs.teatPump > 40) {
            gs.teatPump = 0
            gs.teatSize++
            textLP("\r\rHowever, this time your teats don't seem to relax back to their original state, permanently swollen larger...")
          }
        }
        doNext()
        gs.doListen = (): void => {
          if (getMilk < 1000) { textL(`You have produced ${getMilk} ml of milk!`) }
          else if (getMilk >= 1000) { textL(`You have produced ${decGet(getMilk / 1000, 1)} liters of milk!`) }
          if (gs.breastSize > 14 && tempNum === 1) { doLust(-Math.floor(gs.sen / 4), 2, 3) }
          if (gs.breastSize < 4 && tempNum === 1) { doLust(-Math.floor(gs.sen / 4), 2, 3) }
          if (tempNum === 2) { doLust(-Math.floor(gs.sen / 4), 2, 4) }
          if (tempNum === 1) { gs.nipplePlay += 10 }
          if (tempNum === 2) { gs.udderPlay += 10 }
          if (getMilk < 1000) { textLP("\r\rUnfortunately, you haven't produced enough milk to fill a full bottle yet.") }
          if (getMilk >= 1000 && getMilk < 3000) { itemAdd(500) }
          if (getMilk >= 3000 && getMilk < 6000) { itemAdd(501) }
          if (getMilk >= 6000 && getMilk < 17000) {
            itemAdd(501)
            itemAdd(501)
          }
          if (getMilk >= 17000 && getMilk < 25000) { itemAdd(502) }
          if (getMilk >= 25000) {
            itemAdd(502)
            textLP("\r\rHowever, you produced so much milk that the container in the milker couldn't hold it all and everything beyond a barrel-full splashed out around the edges, making a mess everywhere!")
          }
          gs.hrs++
          doEnd()
        }
      }
    }
  }

  // Penis Pump
  if (ID === 106) {
    if (gs.currentState !== 3) {
      textL("You can only use the a penis pump while masturbating.")
      doEnd()
    } else {
      bc()
      viewButtonText(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0)
      viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0)
      buttonWrite(5, "Penis")
      if (gs.cockTotal > 0) { setButtonVisible(5, true) }
      buttonWrite(7, "Clit")
      if (gs.vagTotal > 0) { setButtonVisible(7, true) }
      buttonWrite(10, "None")
      textL("What would you like to pump?")
      gs.doListen = (): void => {
        if (gs.buttonChoice === 5) {
          gs.rndArray = []
          if (gs.humanCocks > 0) { gs.rndArray.push(1) }
          if (gs.horseCocks > 0) { gs.rndArray.push(2) }
          if (gs.wolfCocks > 0) { gs.rndArray.push(3) }
          if (gs.catCocks > 0) { gs.rndArray.push(4) }
          if (gs.lizardCocks > 0) { gs.rndArray.push(6) }
          if (gs.rabbitCocks > 0) { gs.rndArray.push(7) }
          if (gs.bugCocks > 0) { gs.rndArray.push(12) }
          const tempInt = chooseFrom()
          let whichCock = "WHICH COCK ERROR"
          if (tempInt === 1) { whichCock = "hard human rod" }
          if (tempInt === 2) { whichCock = "long equine flesh" }
          if (tempInt === 3) { whichCock = "pointy wolf meat" }
          if (tempInt === 4) { whichCock = "pink thorny cat prick" }
          if (tempInt === 6) { whichCock = "purple ribbed reptile rod" }
          if (tempInt === 7) { whichCock = "throbbing bunny carrot" }
          if (tempInt === 12) { whichCock = "bumpy-ridged spiked bug wang" }
          textL(`You pick out the appropriate cylinder size for ${oneYour(1)} cock${plural(1)}. You slip it over your ${whichCock} and attach the tube at the other end. Whether you were hard or not already, as soon as you flip on the pump's switch, your ${hipDesc()} hips jerk as blood flushes through the ${cockDesc()} member. The vacuum pressure makes it swell, growing stiffer and larger than before!\r\rThe pump then gently relaxes before giving you another nice suck, followed by another release, eventually building into a slow rhythm.`)
          if (gs.lust < 20) {
            textLP(" Yet, despite the pleasurable sensation, you're not really horny enough to climax, the pump merely sucking away at your engorgement for a while before you finally give up and put it away.")
            gs.cockPump += 10
            if (gs.cockPump > 40) {
              gs.cockPump = 0
              gs.cockSize++
              textLP(`\r\rAlthough, the swelling from the suction doesn't seem to go down all the way, your cock${plural(1)} permanently slightly larger.`)
            }
            gs.hrs = 1
            doEnd()
          } else {
            const getCum = cumAmount()
            if (moistCalc(1) <= 3) { textLP(" The bottle within the machine fills a little with your pre as it seeps out, but it's hardly much.\r\r") }
            if (moistCalc(1) > 3 && moistCalc(1) <= 7) { textLP(" The bottle within the machine fills nearly halfway with your pre as it dribbles out, so you quickly spill it out before you climax.\r\r") }
            if (moistCalc(1) > 7 && moistCalc(1) <= 11) { textLP(" The bottle within the machine fills to the brim with your pre as it spurts from your cock, forcing you to quickly replace it with a fresh bottle before you climax.\r\r") }
            if (moistCalc(1) > 11) { textLP(" The bottle within the machine fills to the brim with your pre as it gushes from your cock, spilling over the rim. You pull the bottle out and let your slime spew across the floor until you're about to climax and replace it with a fresh one.\r\r") }
            if (gs.showBalls === true) { textLP(`Eventually, your ${ballDesc()} balls groan as the sensation gets the best of them. `) }
            textLP(`You begin to buck as the machine does its job, your cum spurting from the tip of your ${whichCock} and flowing through the tubes, despositing into the bottle. Spurt after spurt gets sucked out, milking your cock until it's dry.`)
            if (getCum < 1000) { textLP(`\r\rYou have produced ${getCum} ml of spooge!`) }
            else if (getCum >= 1000) { textLP(`\r\rYou have produced ${decGet(getCum / 1000, 1)} liters of spooge!`) }
            if (getCum <= 400) { textLP(" Although, the resulting amount is so small that you can't really do anything with it...") }
            if (getCum > 400 && getCum <= 600) {
              textLP(" The resulting amount of spunk is just enough to fill a vial!")
              itemAdd(523)
            }
            if (getCum > 600 && getCum <= 1200) {
              textLP(" The resulting amount of spunk is more than enough to fill a vial, with a quite a bit left to spill over the edge.")
              itemAdd(523)
            }
            if (getCum > 1200 && getCum <= 2000) {
              textLP(" You come so much that you fill the whole bottle, great for resale!")
              itemAdd(524)
            }
            if (getCum > 2000 && getCum <= 4500) {
              textLP(" You come so much that you fill the whole bottle, and more continues to gush out over the edge, making quite the mess.")
              itemAdd(524)
            }
            if (getCum > 4500 && getCum <= 5500) {
              textLP(" Well prepared, you quickly swap out the bottle with a jug. Your cum floods inside, filling it up to the brim!")
              itemAdd(525)
            }
            if (getCum > 5500 && getCum <= 21000) {
              textLP(" Prepared, you quickly swap out the bottle with a jug. Your cum floods inside, filling it up to the brim. However, you continue to gush, overfilling it until cum spills over the edge and floods around you, making quite the mess...")
              itemAdd(525)
            }
            if (getCum > 21000) {
              textLP(" Worried about drowing in your own cum, you quickly pull the bottle out and attach a hose to the item you came prepared with... a barrel. Though you still manage to overfill it, you haven't created quite the natural disaster. And since you can't quite get much for a whole barrel of cum, you top off a jug as well...")
              itemAdd(525)
              itemAdd(526)
            }
            gs.cockPump += 10
            if (gs.cockPump > 40) {
              gs.cockPump = 0
              gs.cockSize++
              textLP(`\r\rAlthough, after cleaning up, the swelling from the suction doesn't seem to go down, your cock${plural(1)} permanently slightly larger...`)
            }
            if (gs.cockSize * gs.cockSizeMod * 4 > gs.tallness && gs.gender === 3) { doLust(-Math.floor(gs.sen / 4), 2, 58, 3, 57, 4) }
            else if (gs.cockSize * gs.cockSizeMod * 4 > gs.tallness) { doLust(-Math.floor(gs.sen / 4), 2, 58, 1, 57, 4) }
            else if (gs.gender === 3) { doLust(-Math.floor(gs.sen / 4), 2, 3, 57, 4) }
            else { doLust(-Math.floor(gs.sen / 4), 2, 1, 57, 4) }
            gs.hrs = 2
            doEnd()
          }
        }
        if (gs.buttonChoice === 7) {
          if (gs.lust < 20) {
            textL("You're not really in the mood to do it at the moment, opting to put the pump back in your bag for now...")
            doEnd()
          } else {
            if (gs.clitSize <= 20) { textL(`Feeling a little kinky, you take the smallest available cylinder and push it over ${oneYour(2)} clit${plural(2)}. Turning on the machine, you quickly notice you're still too small, having to manually seal the cylinder against your skin with your fingers. However, that isn't a problem, as you soon begin to enjoy the sucking on your clit, the button swelling from the vacuum while your fingers sliding through your ${vulvaDesc()} lips and dipping into your hole${plural(2)}, moving in rhythm to the pumping.`) }
            if (gs.clitSize > 20) { textL(`Feeling a little kinky, you take some cylinders to slide over ${oneYour(2)} clit${plural(2)}. Its so big that it easily fits into one of them, just like it were a cock. Turning on the machine, your ${hipDesc()} hips squirm as the suction forces your button to swell, becoming even larger. Your fingers slide through your ${vulvaDesc()} lips and dip into your hole${plural(2)}, moving in rhythm to the pumping.`) }
            if (moistCalc(2) > 0 && moistCalc(2) <= 3) { textLP(" The pump manages to suck up a few drops of your feminine honey as you masturbate, misting the tubes slightly.") }
            if (moistCalc(2) > 3 && moistCalc(2) <= 7) { textLP(" The pump manages to suck up some of your dribbling feminine honey, letting it drip lazily from into a bottle that was meant for spunk.") }
            if (moistCalc(2) > 7 && moistCalc(2) <= 11) { textLP(" The pump manages to suck up a bit of your flowing feminine honey, spurting it into a bottle meant for spunk instead.") }
            if (moistCalc(2) > 11) { textLP(" The pump manages to suck up a good deal of your gushing feminine honey, filling a bottle in the machine that was meant for spunk instead. It's not something you can sell, but it amuses you nonetheless.") }
            textLP(" You soon quiver and moan as you come to climax, sighing gently as you turn the pump off to enjoy your swollen clit by hand for a while.")
            gs.clitPump += 10
            if (gs.clitPump > 40) {
              gs.clitPump = 0
              gs.clitSize++
              textLP(`\r\rAlthough, after cleaning up, the swelling from the suction doesn't seem to go down, your clit${plural(1)} permanently slightly larger...`)
            }
            doLust(-Math.floor(gs.sen / 4), 2, 1)
            gs.hrs = 2
            doEnd()
          }
        }
        if (gs.buttonChoice === 10) {
          textL("You realize you didn't actually want to use the pump and put it back in your bag. You fickle bastard.")
          doEnd()
        }
      }
    }
  }

  // Flying Carpet
  if (ID === 232) {
    if (gs.currentState !== 1) {
      textL("You cannot activate the flying carpet during battle or while attempting to masturbate. It takes too long to set up during battle and it is not the kind of 'carpet-munching' you should be doing while masturbating.")
      doEnd()
    } else {
      viewButtonText(0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0)
      viewButtonOutline(0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0)
      buttonWrite(6, "Stay Here")
      textL("Where would you like to go?")
      if (gs.currentZone === 1) {
        if (gs.foundTieden === true) {
          setButtonVisible(1, true)
          buttonWrite(1, "Tieden")
        }
        if (gs.foundFirmshaft === true) {
          setButtonVisible(10, true)
          buttonWrite(10, "Firmshaft")
        }
      }
      if (gs.currentZone === 2) {
        if (gs.foundSoftlik === true) {
          setButtonVisible(3, true)
          buttonWrite(3, "Softlik")
        }
        if (gs.foundSizCalit === true) {
          setButtonVisible(5, true)
          buttonWrite(5, "Siz'Calit")
        }
        if (gs.foundOviasis === true) {
          setButtonVisible(10, true)
          buttonWrite(10, "Oviasis")
        }
        if (gs.foundSanctuary === true) {
          setButtonVisible(11, true)
          buttonWrite(11, "Sanctuary")
        }
      }
      if (gs.currentZone === 3) {
        if (gs.foundSoftlik === true) {
          setButtonVisible(7, true)
          buttonWrite(7, "Softlik")
        }
        if (gs.foundSizCalit === true) {
          setButtonVisible(9, true)
          buttonWrite(9, "Siz'Calit")
        }
      }
      if (gs.currentZone === 4) {
        if (gs.foundTieden === true) {
          setButtonVisible(2, true)
          buttonWrite(2, "Tieden")
        }
        if (gs.foundFirmshaft === true) {
          setButtonVisible(7, true)
          buttonWrite(7, "Firmshaft")
        }
        if (gs.foundOviasis === true) {
          setButtonVisible(11, true)
          buttonWrite(11, "Oviasis")
        }
      }
      if (gs.currentZone === 6) {
        if (gs.foundSizCalit === true) {
          setButtonVisible(1, true)
          buttonWrite(1, "Siz'Calit")
        }
        if (gs.foundFirmshaft === true) {
          setButtonVisible(2, true)
          buttonWrite(2, "Firmshaft")
        }
      }
      gs.doListen = (): void => {
        gs.inDungeon = false
        if (gs.currentZone === 1) {
          if (gs.buttonChoice === 1) { regionChange(3) }
          if (gs.buttonChoice === 10) { regionChange(2) }
        } else if (gs.currentZone === 2) {
          if (gs.buttonChoice === 3) { regionChange(1) }
          if (gs.buttonChoice === 5) { regionChange(4) }
          if (gs.buttonChoice === 10) { regionChange(6) }
          if (gs.buttonChoice === 11) { regionChange(12) }
        } else if (gs.currentZone === 3) {
          if (gs.buttonChoice === 7) { regionChange(1) }
          if (gs.buttonChoice === 9) { regionChange(4) }
        } else if (gs.currentZone === 4) {
          if (gs.buttonChoice === 2) { regionChange(3) }
          if (gs.buttonChoice === 7) { regionChange(2) }
          if (gs.buttonChoice === 11) { regionChange(6) }
        } else if (gs.currentZone === 6) {
          if (gs.buttonChoice === 1) { regionChange(4) }
          if (gs.buttonChoice === 2) { regionChange(2) }
        }
        if (gs.buttonChoice === 6) {
          doProcess()
        } else {
          textL(`You step onto the carpet and with a gentle woosh, it lifts into the air and darts off in the direction of your desired location. Within just a couple of hours, you land in ${regionName(gs.currentZone)}, just like you wanted.`)
          gs.hrs = 2
          doEnd()
        }
      }
    }
  }

  // Gender Swap Potion
  if (ID === 513) {
    if (gs.gender === 1) {
      textL(`You ingest the potion and quickly begin to feel its effects. You pull ${pullUD(2)} your ${clothesBottom()} and watch as your ${cockDesc()} cock${plural(1)} shrink more and more before eventually disappearing into your groin. Then, you hug your belly as you feel your insides wrench, making room for a small amount of vaginal flesh inside.`)
      if (gs.showBalls === true) {
        textLP(` Your ${ballDesc()} balls squeeze up ${legWhere(1)} your ${legDesc(2)} before eventually melding into your ${skinDesc()}, leaving behind 1 tiny pair of feminine lips.`)
      }
      if (gs.showBalls === false) {
        textLP(` The skin ${legWhere(1)} your ${legDesc(2)} swells slightly, forming two tiny mounds, 1 pair of new feminine lips.`)
      }
      textLP(" The lips part, the fresh air making you shiver as it passes across the moist flesh within. Your hand passes over your clitoris, making you shiver slightly, before you dip your finger into your new cunny, amazed at the sensation of being penetrated like that. For all intents and purposes, you are now a girl.")
      gs.balls = 0
      gs.ballSize = 0
      gs.cockSize = 0
      stats(0, 0, -(2 * (gs.cockTotal - 1)), 0)
      gs.cockTotal = 0
      gs.humanCocks = 0
      gs.horseCocks = 0
      gs.wolfCocks = 0
      gs.catCocks = 0
      gs.lizardCocks = 0
      gs.rabbitCocks = 0
      gs.bugCocks = 0
      vagBellyChange(1, 1)
      gs.vagTotal = 1
      gs.pregArray = [false, 0, 0, 0, 0]
      gs.vagSize = 1
      gs.vulvaSize = 1
      gs.clitSize = 1
      gs.gender = 2
    } else if (gs.gender === 2) {
      textL("You ingest the potion and quickly begin to feel its effects. You hug your belly as you feel your insides wrench, your vaginal flesh shrinking within.")
      cockChange(1, 1)
      textLP(`\r\rHowever, it doesn't last long as the last of your vagina${plural(2)} shrink${plural(4)} to nothing, your ${vulvaDesc()} lips disintegrating back against your groin before finally vanishing, making you a boy for all intents and purposes.`)
      vagChange(-1, 0)
      vagBellyChange(-gs.vagSize, -gs.vagTotal)
      stats(0, 0, -(2 * (gs.vagTotal - 1)), 0)
      gs.vagSize = 0
      gs.vagTotal = 0
      let i = 0
      while (i < gs.pregArray.length) {
        if (gs.pregArray[i] === false) {
          gs.pregArray.splice(i, 5)
          i = -5
        }
        i += 5
      }
      gs.vulvaSize = 0
      gs.clitSize = 0
      gs.gender = 1
    } else if (gs.gender === 3) {
      textL(`You ingest the potion and quickly begin to feel its effects. You hug your belly as you feel your insides wrench, your vaginal flesh shrinking within. Your ${clothesBottom()} feels loser as your ${cockDesc()} bulges dwindle as well.`)
      if (gs.showBalls === true) {
        textLP(" Even your testicles shrivel up, growing smaller and smaller.")
      }
      textLP(`\r\rBy the time you finally pull ${pullUD(2)} your ${clothesBottom()}, all your attributes are like that of a childs...`)
      vagChange(-1, 0)
      vagBellyChange(-(gs.vagSize - 1), 0)
      gs.ballSize = 1
      gs.cockSize = 1
      gs.vagSize = 1
      gs.vulvaSize = 1
      gs.clitSize = 1
    } else if (gs.gender === 0) {
      const chance = percent()
      textL("You ingest the potion and quickly begin to feel its effects.")
      if (chance <= 40) { cockChange(1, 1) }
      if (chance > 40 && chance <= 80) { vagChange(1, 1) }
      if (chance > 80) {
        cockChange(1, 1)
        vagChange(1, 1)
      }
    }
    doEnd()
  }

  // Dye items — share dyeThing helper
  if (ID === 216) { dyeThing(216, 5) }
  if (ID === 220) { dyeThing(220, 2) }
  if (ID === 240) { dyeThing(240, 6) }
  if (ID === 241) { dyeThing(241, 7) }
  if (ID === 242) { dyeThing(242, 8) }
  if (ID === 243) { dyeThing(243, 9) }
  if (ID === 515) { dyeThing(515, 1) }
  if (ID === 520) { dyeThing(520, 3) }

  // Concentrated Pussy Fruit Juice
  if (ID === 221) {
    textL("You down the vial. It's so sweet that your face puckers a bit, the concentrated syrup slowly dripping down your throat.")
    if (gs.vagTotal < 1) {
      textLP("\r\rYour loins feel quite warm for a moment, but the sensation quickly passes. It does nothing for you other than overwhelm your sweet-tooth.")
    }
    if (gs.vagTotal > 0) {
      textLP(`\r\rYour loins begin to grow hot. Your hand jerks down to your crotch, rubbing yourself feverishly through your ${clothesBottom()}. The garment quickly grows moist, your arousal spreading ${legWhere(1)} your ${legDesc(2)}. You can feel your labia swell beneath your grip, your lips bulging out of your grasp, while your belly aches slightly with a bloating sensation. Your clit${plural(2)} squeeze${plural(4)} between your fingers.\r\rThe change soon passes, but the changing in the size of your nethers is easily noticeable, making you walk awkwardly at first as you become accustomed.`)
      vagChange(Math.floor(percent() / 20) + 2, 0)
      gs.vulvaSize += Math.floor(percent() / 20) + 2
      gs.clitSize += Math.floor(percent() / 20) + 2
      gs.vagMoist++
    }
    doEnd()
  }

  // Superior Gender Swap Potion
  if (ID === 518) {
    if (gs.gender === 1) {
      textL(`You ingest the potion and quickly begin to feel its effects. You pull ${pullUD(2)} your ${clothesBottom()} and watch as your ${cockDesc()} cock${plural(1)} shrink more and more before eventually disappearing into your groin. Then, you hug your belly as you feel your insides wrench, making room for an equal amount of vaginal flesh inside.`)
      if (gs.showBalls === true) {
        textLP(` Your ${ballDesc()} balls squeeze up ${legWhere(1)} your ${legDesc(2)} before eventually melding into your ${skinDesc()}, forming mounds of equal size until you have ${gs.cockTotal} pair${plural(1)} of feminine lips.`)
      }
      if (gs.showBalls === false) {
        textLP(` The skin ${legWhere(1)} your ${legDesc(2)} swells slightly, forming mounds of plush flesh, ${gs.cockTotal} pair${plural(1)} of new feminine lips.`)
      }
      textLP(` The lips part, the fresh air making you shiver as it passes across the moist flesh within. Your hand passes over your new clit${plural(1)}, making you shiver slightly, before you dip your finger into ${oneYour(1)} new cunt${plural(1)}, amazed at the sensation of being penetrated like that. For all intents and purposes, you are now a girl.`)
      vagBellyChange(gs.cockSize, gs.cockTotal)
      gs.vagTotal = gs.cockTotal
      let i = 1
      while (i <= gs.vagTotal) {
        if (gs.pregArray.length / 5 < 1) {
          gs.pregArray = [false, 0, 0, 0, 0]
          i++
        } else if (gs.pregArray.length / 5 < gs.vagTotal) {
          gs.pregArray.push(false, 0, 0, 0, 0)
          i++
        } else {
          i++
        }
      }
      gs.vagSize = gs.cockSize
      gs.vulvaSize = gs.ballSize
      gs.clitSize = gs.ballSize
      gs.balls = 0
      gs.ballSize = 0
      gs.cockSize = 0
      gs.cockTotal = 0
      gs.humanCocks = 0
      gs.horseCocks = 0
      gs.wolfCocks = 0
      gs.catCocks = 0
      gs.lizardCocks = 0
      gs.rabbitCocks = 0
      gs.bugCocks = 0
      gs.gender = 2
    } else if (gs.gender === 2) {
      textL("You ingest the potion and quickly begin to feel its effects. You hug your belly as you feel your insides wrench, your vaginal flesh shrinking within.")
      cockChange(gs.vagSize, gs.vagTotal)
      textLP(`\r\rHowever, it doesn't last long as the last of your vagina${plural(2)} shrink${plural(4)} to nothing, your ${vulvaDesc()} lips disintegrating into your new scrotum, your testicles growing larger and larger before your lips finally vanish, making you a boy for all intents and purposes.`)
      gs.ballSize = gs.vulvaSize
      vagBellyChange(-gs.vagSize, -gs.vagTotal)
      gs.vagSize = 0
      gs.vagTotal = 0
      let i = 0
      while (i < gs.pregArray.length) {
        if (gs.pregArray[i] === false) {
          gs.pregArray.splice(i, 5)
          i = -5
        }
        i += 5
      }
      gs.vulvaSize = 0
      gs.clitSize = 0
      gs.gender = 1
    } else if (gs.gender === 3) {
      textL(`You ingest the potion and quickly begin to feel its effects. You hug your belly as you feel your insides wrench, your vaginal flesh attempting to match the size of your male anatomy. Your ${clothesBottom()} shakes as your ${cockDesc()} bulges try to mimic your female anatomy as well.`)
      if (gs.showBalls === true) {
        textLP(` Even your testicles shift, growing to match your pussy lips, while those lips do the same. Your clit${plural(2)} also change${plural(4)} to more closely match the size of your different vulva.`)
      } else {
        textLP(`Even your pussy lips shift, trying to match the size of what's in your abdomen. Your clit${plural(2)} also change${plural(4)} to more closely match the size of your different vulva.`)
      }
      textLP(" In the end, your whole body feels a little off balanced, having to adjust to the backwards genitals...")
      const tempCockSize = gs.cockSize
      const tempBallSize = gs.ballSize
      gs.cockSize = gs.vagSize
      gs.ballSize = gs.vulvaSize
      vagBellyChange((tempCockSize - gs.vagSize), 0)
      vagChange(-1, 0)
      gs.vagSize = tempCockSize
      gs.vulvaSize = tempBallSize
      gs.clitSize = tempBallSize
    } else if (gs.gender === 0) {
      const chance = percent()
      textL("You ingest the potion and quickly begin to feel its effects.")
      if (chance <= 40) {
        cockChange(Math.ceil(percent() / 5), 1)
        gs.ballSize = Math.ceil(percent() / 5)
      }
      if (chance > 40 && chance <= 80) {
        vagChange(Math.ceil(percent() / 5), 1)
        gs.vulvaSize = Math.ceil(percent() / 5)
        gs.clitSize = Math.ceil(percent() / 5)
      }
      if (chance > 80) {
        cockChange(Math.ceil(percent() / 5), 1)
        vagChange(Math.ceil(percent() / 5), 1)
        gs.ballSize = Math.ceil(percent() / 5)
        gs.vulvaSize = Math.ceil(percent() / 5)
        gs.clitSize = Math.ceil(percent() / 5)
      }
    }
    doEnd()
  }
}

/** dyeThing — dye item shared menu (Hair / Body / Cancel) */
export function dyeThing(ID: number, color: number): void {
  viewButtonOutline(0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0)
  viewButtonText(0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0)
  textL(`What would you like to apply the ${itemName(ID)} to?`)
  buttonWrite(5, "Hair")
  if (gs.hair > 0) { setButtonVisible(5, true) }
  buttonWrite(7, "Body")
  buttonWrite(10, "Nevermind")
  gs.doListen = (): void => {
    if (gs.buttonChoice === 5) {
      gs.hairColor = color
      textL(`You smear the ${itemName(ID)} around in your ${hairDesc()}, turning it ${hairC()} in color.`)
    }
    if (gs.buttonChoice === 7) {
      gs.skinColor = color
      textL(`You rub the ${itemName(ID)} well into your ${skinDesc()}, making sure it seeps in deep and turns your body a ${skinC()} color.`)
    }
    if (gs.buttonChoice === 10) {
      textL("Apparently you derped and didn't mean to use it, so you put the dye back in your bag.")
      itemAdd(ID)
    }
    doEnd()
  }
}

/** passiveItemRemove — remove passive effects when an item leaves the bag (sold/dropped) */
export function passiveItemRemove(id: number): void {
  if (id === 101) { gs.rapeMod -= 10 }
  if (id === 102) { gs.runMod -= 20 }
  if (id === 200) {
    gs.vagMoistMod -= 4
    gs.cockMoistMod -= 4
    statsMod(0, 0, 0, -10)
  }
  if (id === 215) {
    gs.rapeMod -= 5
    gs.runMod -= 5
    gs.milkHPMod -= 5
  }
  if (id === 233) { gs.carryMod -= 75 }
  if (id === 234) {
    gs.pregRate -= 0.5
    gs.minLust -= 10
    gs.hips -= 10
  }
  if (id === 236) {
    gs.SexPMod -= 0.5
    gs.changeMod -= 0.3
  }
  if (id === 237) {
    gs.vagMoistMod -= 8
    gs.cockMoistMod -= 8
    statsMod(0, 0, 0, -10)
    if (gs.heat >= 2) { gs.heatMaxTime += 12 }
    gs.heat--
  }
  if (id === 252) {
    gs.rapeMod -= 5
    gs.runMod -= 5
    gs.milkHPMod -= 5
    gs.carryMod -= 10
    gs.milkCap -= 3000
  }
  // Weapon removal - unequip if currently wielded
  if (id === 116 && gs.weapon === 116) { gs.weapon = 10 }
  if (id === 117 && gs.weapon === 117) { gs.weapon = 10 }
  if (id === 118 && gs.weapon === 118) { gs.weapon = 10 }
  if (id === 119 && gs.weapon === 119) { gs.weapon = 10 }
  if (id === 127 && gs.weapon === 127) { gs.weapon = 10 }
  if (id === 235 && gs.weapon === 235) { gs.weapon = 10 }
}

/** loseManyItem — remove a specific quantity of an item from the bag */
export function loseManyItem(id: number, amount: number): void {
  for (let i = gs.bagArray.length - 1; i >= 0 && amount > 0; i--) {
    if (gs.bagArray[i] === id) {
      if (amount >= gs.bagStackArray[i]) {
        amount -= gs.bagStackArray[i]
        gs.bagStackArray[i] = 0
        gs.bagArray[i] = 0
      } else {
        gs.bagStackArray[i] -= amount
        amount = 0
      }
    }
  }
}

/** gainItem — process gaining an item from itemGainArray */
export function gainItem(id: number): void {
  if (id === 0) return
  itemAdd(id)
}

// ── Item check helpers ─────────────────────────────────────────────────────

export function checkItem(id: number): boolean {
  return gs.bagArray.indexOf(id) !== -1
}

export function checkMagicItem(): boolean {
  return [101,102,200,215,231,233,234,235,236,237,252].some(id => checkItem(id))
}

export function checkStash(id: number): boolean {
  return gs.stashArray.indexOf(id) !== -1
}

export function countItem(id: number): number {
  let total = 0
  for (let i = 0; i < gs.bagArray.length; i++) {
    if (gs.bagArray[i] === id) total += gs.bagStackArray[i]
  }
  return total
}

// ── Item property queries ──────────────────────────────────────────────────

/** canLose(id) — true if item can be sold/dropped */
export function canLose(id: number): boolean {
  if (id === 244 && countItem(244) === 1 && gs.snuggleBall === true) return false
  if (id === 247 && countItem(247) === 1 && gs.suppHarness === true) return false
  return true
}

/** conItem(id) — true if item is consumable (can be used up) */
export function conItem(id: number): boolean {
  const consumables = new Set([
    103,105,110,111,112,113,114,115,120,121,122,123,124,125,126,128,
    201,202,203,204,205,207,208,209,210,211,212,213,214,216,217,218,
    219,220,221,222,223,224,225,226,227,228,230,231,238,239,240,241,
    242,243,245,246,248,249,250,251,253,255,256,257,258,259,260,
    500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,
    516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,
    532,533,534,535,536,537,538,539,540,
  ])
  return consumables.has(id)
}

/** usableItem(id) — true if item can be equipped/activated (not consumed) */
export function usableItem(id: number): boolean {
  const usable = new Set([104,106,108,109,116,117,118,119,127,232,235,244,247])
  return usable.has(id)
}

/** itemDescription(id) — item flavor text */
export function itemDescription(id: number): string {
  if (id === 101) return "Claws of the Lupine Ancestors\r\rHarkening back to supposed Lupan ancestry, as long as this item remains in your bag, your hands will change into clawed paws that will help hold down your foes, just like the wolves of the forest.\r\rAlthough, in your case, it just gives you a bonus to Rape attempts..."
  if (id === 102) return "Imbued Horseshoes\r\rCrafted by the Equans of Firmshaft, these horseshoes help improve your running capabilities as long as they're in your bag. And they'll turn your feet into hooves."
  if (id === 103) return "Magical Sands of the Dry Dunes\r\rApplying this special sand to your genitalia will permanently make it a bit less moist than usual. Often used by the women of Siz'Calit when their heat makes them a little too moist. Or when they're producing a bit too much milk (though that's rarely the case in Siz'Calit)."
  if (id === 104) return "Milking Machine\r\rA compact device that produces enough suction to pump any breasts/udder you wish to collect the lactation of. Doing so will allow you to store the milk to be used or sold later, if you can produce enough. Comes with 2 hoses and multiple cups to work on almost any nipple/teat.\r\rWarning: Excessive use may result in permanent nipple/teat growth.\r\rCan only be used during Masturbation."
  if (id === 105) return "'Cat's Meow' Potion\r\rFavored by the Felins of Siz'Calit, this potion helps increase the production of breastmilk. Just try not to show off in Siz'Calit, or you may draw a crowd."
  if (id === 106) return "Penis Pump\r\rA simple device with an elastic cylinder that's intended to slip over a penis and pump it until it climaxes. Doing so will allow you to store the semen to be used or sold later, if you can produce enough.\r\rCan only be used during Masturbation."
  if (id === 108) return "Blood Gauge\r\rDue to their propensity to be swayed by outside blood, humans developed this nifty little gadget. Pressing it against your pulse, the magic of the device can detect the levels of racial influence in your body."
  if (id === 109) return "Educated Eggdicator\r\rWith so many unfertilized eggs around the oasis, Lizan developed this to be able to tell a good egg from a bad egg. Even though an egg is just an egg beforehand, once put through this eggdicator its wave function collapses into a more determinable state.\r\rWarning: Using this item requires 1 Fresh Egg to operate."
  if (id === 110) return "A Reduction of Reducer Agents\r\rThis is a powerful - yet often necessary in Nimin - elixer that, when rubbed on a part of your body, will permanently shrink that part to half its original size. Be careful!\r\rWarning: This item is not useful against your enemies."
  if (id === 111) return "Skin Balm\r\rUsed and created by the Humans of Softlik, this balm helps increase their skin's supplesness and other human attributes, as well as decrease those of other races."
  if (id === 112) return "Bolstering Juice\r\rThis white 'juice' is often used and created by the Equans of Firmshaft. It helps strengthen their equan attributes and  decrease those of other races."
  if (id === 113) return "Tainted Leaf\r\rThis paw-shaped leaf is farmed and used by the Lupans of Tieden to fend off the attributes of other races, usually the more violent ones, and increase their lupan strengths."
  if (id === 114) return "Sweet Sap\r\rUsed and created by the Felins of Siz'Calit, this vial of clear liquid helps increase their felin sensitivities as well as ward off outside influences."
  if (id === 115) return "Poultice\r\rA generic swathe of cloth soaked in soothing balms, this poultice will heal 20 HP. It'll also make you a little aroused from rubbing it all over yourself..."
  if (id === 116) return "Dagger\r\rA relatively cheap weapon, the dagger is a nice way to defend oneself in Nimin.\r\rBase damage: 5-12"
  if (id === 117) return "Warhammer\r\rA rather blunt weapon, it's a bit unwieldy but gets the job done.\r\rBase damage: 2-20"
  if (id === 118) return "Saber\r\rA well-designed blade, the saber can deal significant damage to foes.\r\rBase damage: 10-25"
  if (id === 119) return "Whip\r\rA somewhat kinky weapon, the whip can leave some rather nasty welts.\r\rBase damage: 12-18"
  if (id === 120) return "Neuterizer\r\rDeveloped by the Lupans of Tieden, this isn't actually intended to be used on most of their inhabitants. Instead, it was created as a post-defensive measure against the... oddities of Nimin."
  if (id === 121) return "Teleport Scroll: Softlik\r\rCreated to make sure explorers can find their way back home, this scroll of teleportation will instantly return the user to the city of Softlik.\r\rCan be used at any time, even in the midst of battle."
  if (id === 122) return "Teleport Scroll: Firmshaft\r\rCreated to make sure explorers can find their way back home, this scroll of teleportation will instantly return the user to the city of Firmshaft.\r\rCan be used at any time, even in the midst of battle."
  if (id === 123) return "Teleport Scroll: Tieden\r\rCreated to make sure explorers can find their way back home, this scroll of teleportation will instantly return the user to the city of Tieden.\r\rCan be used at any time, even in the midst of battle."
  if (id === 124) return "Teleport Scroll: Siz'Calit\r\rCreated to make sure explorers can find their way back home, this scroll of teleportation will instantly return the user to the city of Siz'Calit.\r\rCan be used at any time, even in the midst of battle."
  if (id === 125) return "Teleport Scroll: Oviasis\r\rCreated to make sure explorers can find their way back home, this scroll of teleportation will instantly return the user to the city of Oviasis.\r\rCan be used at any time, even in the midst of battle."
  if (id === 126) return "Oasis Water\r\rA vial of the fresh water from the oasis in the lizan city of Oviasis, it helps the residents cool off and moisten their scales so they can hunt and sunbathe more, as well as ward off the influences of other races."
  if (id === 127) return "Tail Spike\r\rThis large spike is held firm upon leather straps. When attached to a tail, it can be used as a rather effective weapon.\r\rBase damage: 10-20\r\rRequirement: Must have a muscular/skeletal tail to equip (tails of hair or excessively fluffy tails will not work)."
  if (id === 128) return "Teleport Scroll: Sanctuary\r\rCreated for an easy return, this scroll of teleportation will instantly return the user to the city of Sanctuary.\r\rCan be used at any time, even in the midst of battle."
  if (id === 200) return "Lila's Gift\r\rA small charm given to you by the young felin girl in Siz'Calit, it seems to be pretty decoration made from flowers and leaves and some other cute little things. However, as you hold it, you notice it makes you wetter down under... This might have been the reason the girl was so wet to begin with, or maybe her extreme wetness for such a young age rubbed off onto her charm? Either way, as long as you carry it, you'll be wetter than usual. And you seem much more sensitive than usual...\r\rWarning: You cannot regain this item should you lose it."
  if (id === 201) return "Milk Creeper Poison\r\rObtained from a passed out Milk Creeper, this poison is a bit diluted from her ingestion from so much of your milk. It is unlikely that it will affect your lactation rate directly like the pure poison does, but rubbing it into your mammary glands will cause them to swell slightly larger."
  if (id === 202) return "Cock-Snake Venom\r\rObtained from the fangs of a passed out cock-snake, this venom is a potent male enhancement. And if you aren't male when you use it, you will be, if at least partially..."
  if (id === 203) return `Tuft of Wolf Fur\r\rObtained from an encounter with a feral wolf, a tuft of their fur has been known to decrease sensitivity, and thus increase your toughness against attacks, when rubbed onto your ${skinDesc()}.`
  if (id === 204) return "Small Pouch\r\rThis is a small pouch you have obtained somewhere. Use it to see what it contains!"
  if (id === 205) return "Small Pouch\r\rThis is a small pouch you have obtained somewhere. Use it to see what it contains!"
  if (id === 206) return "Shiny Trinket\r\rOther than being a pretty decoration, this thing isn't much use to you. However, it probably sells fairly well."
  if (id === 207) return "Wooden Cock Carving\r\rThis thing looks like a dildo made of wood, with decorated carvings all around. It sounds hollow, so maybe you could break it open and see if anything is inside?"
  if (id === 208) return "Bloated Berry\r\rA berry from across the ocean, it looks oddly bloated, nearly two berries in one. It seems edible though."
  if (id === 209) return "Handful of Grain\r\rA handful of fresh grain, it smells slightly sweet in your hands. Eating it will provide you some energy from the carbs!"
  if (id === 210) return "Pussy Fruit\r\rIt is unknown whether the name derives from the cat-like felin people that enjoy this fruit or from the fruit's rather... lewd shape. Either way, it is a very sweet and juicy fruit that felin females love."
  if (id === 211) return "DairE Pill\r\rProduced by the farmers of the Dairy Farm outside of Softlik, this pill supposedly helps increase the lactation rate of dairy cows. It is not suggested to be ingested by anything other than cows, though that's just a suggestion."
  if (id === 212) return "Red Mushroom\r\rAn odd looking mushroom with a red cap with a few white dots found on the walls of the Old Cave. You're not really sure what it does, but you think you'll get bigger so you can smash some blocks... or something."
  if (id === 213) return "Wet, Slimy Cloth\r\rThis piece of white cloth seems to be perpetually wet and slimy, no matter how long you keep it in your bag. You have no idea what it can do, however."
  if (id === 214) return "Malon's Milk\r\rUnlike the other bottles of milk that come from the Dairy Farm, this wasn't from a cow. From Malon's own supply, you're unsure exactly how it's different from the rest, though it does taste better."
  if (id === 215) return "Malon's Pendant\r\rGiven to you by Malon from the Dairy Farm, this gift of admiration seems to have been a keepsake of hers since she was a child and has imbued by her long-time love of animals and rather bovine qualities. As long as you hold onto it, everything is a bit more consensual towards being 'raped', be a bit more lenient to you running away, and all milk products heal you slightly more than usual.\r\rWarning: You cannot regain this item should you lose it."
  if (id === 216) return "Pink Ink\r\rOctopus ink gained from a rather pink octopus girl, this ink serves as a very rare and valuable hair dye. Should you use it, your hair will turn a coral pink color, if you have hair."
  if (id === 217) return "Octopus Egg Jelly\r\rThe jelly from the eggs of the octopus girls you gave birth to, it seems like it'd make you very aroused if you rubbed it on your genitals. Although, you're not quite sure what it would do beyond that..."
  if (id === 218) return "Bulging Berry\r\rA cousin of the bloated berry, this fruit splits into multiple spheres from the same stem, somewhat like cherries but can often have three of four from the same stem. It is quite edible, though it is highly suggested to not eat many."
  if (id === 219) return "Fresh Egg\r\rAn unfertilized egg from a lizan female (or herm), eggs like this are common in the lizan diet. High in protein, they're good for your health."
  if (id === 220) return "Blonde Dye\r\rA dye made from mashed grain, this will turn your hair blonde in color when used, if you have hair, or it can be sold for a decent sum."
  if (id === 221) return "Concentrated Pussy Fruit Juice\r\rCreated by a notable mistress in Siz'calit, this vial contains some rather concentrated juice from the Pussy Fruit. It is likely to have a notable effect on a woman's loins, more potent than its source."
  if (id === 222) return "Kinky Carrot\r\rUsed in lewd fashions by a small rabbit-like people, you're sure to clean this off as soon as you got it. Although you're not entirely certain what would happen if you ate it, besides being in better health for keeping veggies in your diet."
  if (id === 223) return "Equan Snack\r\rA common snack amongst the equan people, this sweet little thing has the kind of carbs that will help you get through the day, no matter what life may put on your shoulders. And it seems to be the cause of some bellies of some equan women..."
  if (id === 224) return "Lila's Milk\r\rFrom the ample supply of a certain little felin girl, this milk seems to be a tad sweeter than normal milk and also slightly tainted by the poor girl's constant heat."
  if (id === 225) return "Body Wash\r\rThis nice body wash is scented like a meadow of flowers. It can help clean up some dirty thoughts and make your body feel much fresher."
  if (id === 226) return "Felin Tea Mix\r\rA common brew amongst felins, this tea helps calm the body and mind. Especially the body, which is often necessary for Felins..."
  if (id === 227) return "Felin Oral Wash\r\rWith bath by licking being commonplace amongst felins, this wash is to aid in such endeavors. Delightfully tingly, this stuff will leave both your breath and your fur feeling fresh."
  if (id === 228) return "Body Oil\r\rNice and slick, this stuff is great for your skin or scales and makes you look quite shiny and alluring for the next 5 hours."
  if (id === 229) return "Leather Strap\r\rFound somewhere in Silandrias' den, this leather strap seems to be fitted to tie tightly around the base of her tail. Otherwise, you have no idea what it could be for."
  if (id === 230) return "Eggcelerator\r\rMeant to temporarily increase the rate of egg production in Lizan females, this pill looks to be a little egg-shaped itself, with more of a torpedo-like tip. This pill also seems to be too large to be ingested orally by the average person, which you deduct means it's meant as a suppository... Though, considering its nature, it's safe to say it's not meant to be administered anally, at least.\r\rIts effect stacks."
  if (id === 231) return "Desiccating Sand\r\rObtained from a sentient dust devil, this sand is specially imbued with the ability to suck moisture from a body. Though the Dust Devil only uses it to feed, in this quantity it can be rather damaging if thrown at an enemy all at once. Be wary of blow-back, though.\r\rThis item can only be used during battle."
  if (id === 232) return "Flying Carpet\r\rBorrowed from Silandrias, this flying carpet can take you on a magical ride to see a whole new world. However, it can only take you to towns you have already found, since you wouldn't know how to guide it someplace you haven't been, so the whole 'new' aspect is rather moot. But it is still quite convenient!\r\rYou cannot activate the flying carpet in amidst the heat of battle or amidst the heat of masturbation."
  if (id === 233) return `Anti-Gravity Rock\r\rBorrowed from Silandrias, this small rock, more of a pebble really, just kind of floats there and defies gravity. Yet, as you carry it, even you seem to defy gravity to a degree. You feel much lighter on your ${legDesc(10)} and your carry capacity increases by a whole 75! '75 what', you have no idea, but it's a big number so it's got to be good, right?`
  if (id === 234) return "Reindeer Charm\r\rBorrowed from Silandrias, this sapphire charm is carved into the shape of a reindeer's head, with large antlers. Carrying it imbues you with the essence of a reindeer mother, providing you with a nice set of antlers and a matching deer-butt, as well as speeding up your pregnancies and increasing your minimum lust, urging you to give birth to plenty of children."
  if (id === 235) return "Fellatio Rod\r\rBorrowed from Silandrias, this rather phallic rod is actually a weapon. When the base is pointed at the target, you can siphon out some of their life force by placing your lips around the bulbous end of the rod and gently sucking. If you're very skilled, you can make the weapon perform even stronger. It even ignores their natural resistance to physical attacks."
  if (id === 236) return "Reception Bell\r\rBorrowed from Silandrias, this small cowbell is worn around the neck and makes one more receptive to outside influences. In other words, the wearer gains 50% more SexP than usual *ding*. They also tend to be 30% more susceptible to blood-changes though... *dong*"
  if (id === 237) return "Lila's Dewy Gift\r\rOriginally given to you by Lila, dew drops have started forming on and falling from the leaves and flowers constantly, ever since it became more 'infused' with your relationship with Lila. As long as you hold it, you're sexual lubrication flows much more and makes you quite sensitive. It even feels warm to the touch, a warmth that sometimes may spread to you...\r\rWarning: You cannot regain this item should you lose it."
  if (id === 238) return "Squeaky Cheese\r\rSome cheese found in an alley that kinda squeaks when you rub it, it smells quite delicious and would help restore your energy if you're hurt. Other than that, though, well... you did find it in an alley, after all."
  if (id === 239) return "Shiny Rock\r\rA rather shiny rock you found, you're almost intent at staring at it. If anything, it at least improves your focus."
  if (id === 240) return "Auburn Dye\r\rA dark reddish color, this dye will turn your hair auburn when used, if you have hair"
  if (id === 241) return "Brown Dye\r\rA simple brownish, this dye will turn your hair brown when used, if you have hair"
  if (id === 242) return "Grey Dye\r\rA shade, this dye will turn your hair grey when used, if you have hair"
  if (id === 243) return "White Dye\r\rLacking any color, this dye will turn your hair pure white when used, if you have hair"
  if (id === 244) {
    if (gs.snuggleBall === false) return "Snuggle Ball\r\rSquishy and plush, this odd ball is made out of seemingly unnatural materials. Almost like a living liquid, it wobbles around in your hand and is slightly pliable. It feels so pleasant, you kinda want to snuggle with it."
    return "Snuggle Ball\r\rNot really a 'ball' at the moment, this squishy thing is currently coating your body with a thick plush layer of shiny snuggliness. You can attempt to take it off, though it does make you look kinda cute, like a cuddly toy."
  }
  if (id === 245) return "Facial Mud\r\rSome mud you found at a secluded mudhole in the savanna, this particular mud is quite clean and rich in minerals and would really help your complexion."
  if (id === 246) return "Fertile Gel\r\rA soft gel that gives off a pleasant warmth, it helps increase the fertility of women who want to be mothers or want a nice big swollen belly.\r\rExtra doses extend the duration of the gel."
  if (id === 247) {
    let s = "Support Harness\r\rThis contraption of straps and slings can be equipped to help support all those sizable appendages. Like a bra, except for the whole body!"
    if (gs.suppHarness === true) s += '\r\rYou currently have a harness equipped. Using it will unequip the harness.'
    return s
  }
  if (id === 248) return "Breeder Potion\r\rThis potion is normally used by animal breeders to increase the litter sizes of their animals and make their animals more frequently fertily receptive."
  if (id === 249) return "Treant's Tear\r\rThis small tear-shaped piece of wood looks almost like a seed. However, across its surface are etched images of tree-like beings losing their limbs as they dance around the tear, progressively larger and larger with the more limbs they have lost. It's like some sort of ancient ritual, one you have never heard of..."
  if (id === 250) return "Foomp Bomb\r\rMuch like a smoke bomb, this small ball can be tossed at an enemy to provide you an immediate escape from battle.\r\rThis item can only be used during battle. This item will automatically successfully run from battle."
  if (id === 251) return "Plump Quat\r\rThe quats is a very delicious fruit, so plump and ripe and full of mmm-mmm-goodness."
  if (id === 252) return "Malon's Milky Pendant\r\rThis is the pendant Malon had given you, except now infused with a sort of milky complexion that ensures you'll always share her milky tendancies as long as you hold it, supporting your relationship as a couple of drippy cows~ It still seems to retain all the properties it had before as well."
  if (id === 253) {
    let s = "Bug Egg\r\rRelatively small, this squishy unfertilized egg seems rather gooey. You could eat it, but the thought of doing so is somewhat nasty."
    if (gs.tail === 12) s += '\r\rHowever, you do notice that the egg is just about the right size for the ovipositor hanging off your backside.'
    return s
  }
  if (id === 254) return "Lantern\r\rThis is a fairly basic lantern that you found at the hidden entrance below the ground in the valley. And though it might be basic and have no other function, the light it gives off can help you access areas that are otherwise too dark."
  if (id === 255) return "Fragrant Flower\r\rA very pleasant smelling flower whose petals are black with white stripes. If you took a good whiff, it would likely help hone your senses a bit."
  if (id === 256) return "Nectar Candy\r\rA sweet treat that bugs seem to swarm if not stored properly. It bolsters your muscles and helps egg laying."
  if (id === 257) return "Too Human Potion\r\rThis potion was made to help the humans of Softlik regain some of their human attributes. However, this batch was apparently a failure for being too effective, somehow?"
  if (id === 258) return "Tainted Potion\r\rThis potion was tainted by your DairE Pill, so you don't really know what it will do until you ingest it."
  if (id === 259) return "Sweet & Sour Candy\r\rThis rare little treat is a favorite among many, if you can find it. It's that the sweetness is so sweet that you'll drop from the bliss and that the sourness is so sour that you'll suck yourself in."
  if (id === 260) return "Succubus Draft\r\rOne of the glowing vials from the succubus, this is some concentrated masculinity that has been drained from various people, quite possibly even yourself. For her, it's a source of food and power, for you... the effects are probably different."
  if (id === 500) return "Bottle of Milk\r\rA bottle of delicious milk that, when drunk, will heal 10 HP and help you stay awake a little longer."
  if (id === 501) return "Jug of Milk\r\rA large jug of delicious milk that, when drunk, will heal 40 HP and help you stay awake a while longer. When you're done peeing, of course."
  if (id === 502) return "Barrel of Milk\r\rA barrel full of delicious milk, this is mostly meant to be used for easy handling by merchants. However, if you use it, you will gain 4 Jugs of Milk instantly."
  if (id === 503) return "Lust Draft\r\rA potion that will increase your lust by 20 instantly when used."
  if (id === 504) return "Rejuvenating Potion\r\rA potion that will heal 30 HP and reduce your lust by 15 instantly when used."
  if (id === 505) return "Bad Experiment\r\rThis combustable concoction will deal 10-20 damage to your enemy before they can react!\r\rThis item can only be used during battle."
  if (id === 506) return "Express Pregnancy Potion\r\rWhen that baby is taking a while to gestate, this potion up the pregnancy as though 50 hours had passed."
  if (id === 507) return "Ball Sweller\r\rImbibing this will make your balls feel as though you hadn't ejaculated in 30 hours."
  if (id === 508) return "Superior Lust Draft\r\rA potion that will increase your lust by 50 instantly when used."
  if (id === 509) return "Superior Rejuvenating Potion\r\rA potion that will heal 70 HP and reduce your lust by 40 instantly when used."
  if (id === 510) return "Super Bad Experiment\r\rThis extremely combustable concoction will deal 20-40 damage to your enemy before they can react!\r\rThis item can only be used during battle."
  if (id === 511) return "Superior Express Pregnancy Potion\r\rWhen that baby is taking a while to gestate, this potion up the pregnancy as though 120 hours had passed."
  if (id === 512) return "Superior Ball Sweller\r\rImbibing this will make your balls feel as though you hadn't ejaculated in 70 hours."
  if (id === 513) return "Gender Swap Potion\r\rIf you want to try out the opposite sex, this potion will revert your genitals back to infancy, allowing them to reform as their opposite counterparts. If a hermaphrodite takes this, it reverts all genitals to their smallest value. If a genderless person takes this, the resulting gender is random."
  if (id === 514) return "Masochism Potion\r\rAfter this potion is imbibed, your nervous system confuses half of all damage as pleasure for a whole day."
  if (id === 515) return "Black Dye\r\rThis will turn your hair black in color when used, if you have hair."
  if (id === 516) return "Baby Free Potion\r\rSipping this potion will reduce your chance of becoming pregnancy by 50% for the next 3 days. This contraceptive is not gauranteed to prevent pregnancy, especially if you're especially fertile. It will work whether you have the appropriate plumbing or not. Multiple instances of Baby Free Potion will only extend the time of its duration, not increase the reduction in chance."
  if (id === 517) return "Potency Potion\r\rKicking your balls into gear, they will permanently produce 20% more cum, despite their size."
  if (id === 518) return "Superior Gender Swap Potion\r\rIf you want to try out the opposite sex, this potion will transform your genitals into their opposite counterparts, retaining the relative size. If a hermaphrodite takes this, the genitals swap sizes. If a genderless person takes this, the resulting gender is random, along with the sizes of their genitals (up to a certain amount)."
  if (id === 519) return "Superior Masochism Potion\r\rAfter this potion is imbibed, your nervous system confuses all damage as pleasure for a whole day."
  if (id === 520) return "Red Dye\r\rThis will turn your hair red in color when used, if you have hair."
  if (id === 521) return "Superior Baby Free Potion\r\rSipping this potion will reduce your chance of becoming pregnancy by 50% for the next 9 days. This contraceptive is not gauranteed to prevent pregnancy, especially if you're especially fertile. It will work whether you have the appropriate plumbing or not. Multiple instances of Superior Baby Free Potion will only extend the time of its duration, not increase the reduction in chance."
  if (id === 522) return "Superior Potency Potion\r\rDrop-kicking your balls into gear, they will permanently produce 50% more cum, despite their size."
  if (id === 523) return "Vial of Cum\r\rStill kinda warm, this vial of goop will arouse you slightly when imbibed, plus heal a bit."
  if (id === 524) return "Bottle of Cum\r\rA bottle of warm cum that will arouse you and heal you slightly when imbibed. If you can get it all down."
  if (id === 525) return "Jug of Cum\r\rA jug full of hot cum, this is mostly meant to be used for easy handling by the merchants that might be able to find a use for it. However, if you use it, you will gain 3 Bottles of Cum instantly."
  if (id === 526) return "Barrel of Cum\r\rThere's... not really much you can do with a barrel full of hot cum. The merchants will still buy it, but at a very low price, since there's not much they can do with it either..."
  if (id === 527) return "Good Egg\r\rAn unfertilized fresh egg that is especially good for your health and body."
  if (id === 528) return "Bad Egg\r\rAn unfertilized fresh egg that should never be eaten... Instead it can be thrown at your enemy for a quick 10-20 damage.\r\rThis item can only be used during battle."
  if (id === 529) return "Strange Egg\r\rAn unfertilized fresh egg that can do... odd things to your body."
  if (id === 530) return "Charmed Egg\r\rAn unfertilized fresh egg that will make you quite alluring for 20 hours."
  if (id === 531) return "Divine Egg\r\rA very rare unfertilized fresh egg, eating it will make you closer to a diety of fertility."
  if (id === 532) return "Strong Pheromone\r\rOriginally meant to be fishing bait, this concoction is much more potent than originally intended and attracts far more than fish for 30 hours..."
  if (id === 533) return "Reduced Reduction\r\rA weaker form of a Reduction, this will shrink the desired body part by a regular amount instead of halving its size."
  if (id === 534) return "Male Enhancement Drug\r\rA simple pill that, when ingested, will increase the size of you male genitals.\r\rCaution: females taking this pill may have similar side-effects."
  if (id === 535) return "Milk Suppressant\r\rThis drug will prevent any milk from leaking from your body. It does not prevent your mammary glands from producing milk, but it does prevent the milk from escaping for its duration, avoiding most unsightly leaks."
  if (id === 536) return "Bazoomba!\r\rThis glowing squishy orb is a secret recipe that creates more of one of the best things in life when ingested...!\r\rWarning - Be wary of overload."
  if (id === 537) return "Queen Egg\r\rNot the egg of a queen, but rather an unfertilized egg fit for a queen! This wonderful egg would make any queen's abdomen larger and sexier. Though, if you're not an insect, this mostly translates to things below the waist. It will also help shorten the gestation period for quicker offspring and help your breasts hold more milk for all those births."
  if (id === 538) return "Soldier Egg\r\rNot the egg of a soldier, but rather an unfertilized egg suitable for a soldier. This powerful egg will make you taller, stronger, and more physically fit just by eating it!"
  if (id === 539) return "Drone Egg\r\rNot the egg of a drone, but rather an unfertilized egg better fed to the sex-craving drones, those mindless males that are only useful for impregnating a queen. This will make them even better at that singular duty."
  if (id === 540) return "Worker Egg\r\rNot the egg of a worker, but rather an unfertilized egg that would help any worker. Munching down this little thing will help anybody feel less exhausted and thus allow them to work even more!"
  return `Item #${id}`
}

/** itemValue(id) — base sell value of item (buying costs 3x) */
export function itemValue(id: number): number {
  const VALUES: Record<number, number> = {
    1:13, 101:50, 102:50, 103:20, 104:100, 105:30, 106:75,
    108:50, 109:125, 110:20, 111:15, 112:15, 113:15, 114:15, 115:5,
    116:20, 117:30, 118:55, 119:40, 120:30,
    121:15, 122:15, 123:15, 124:15, 125:15, 126:15, 127:35, 128:25,
    200:0, 201:15, 202:15, 203:5, 204:1, 205:1, 206:30, 207:20,
    208:15, 209:3, 210:17, 211:10, 212:14, 213:5, 214:5, 215:0,
    216:150, 217:40, 218:20, 219:5, 220:50, 221:30, 222:15, 223:15,
    224:10, 225:10, 226:5, 227:10, 228:10, 229:0, 230:25, 231:15,
    232:0, 233:0, 234:0, 235:0, 236:0, 237:0, 238:10, 239:3,
    240:75, 241:30, 242:45, 243:100, 244:35, 245:15, 246:20, 247:80,
    248:25, 249:45, 250:45, 251:10, 252:0, 253:3, 254:0, 255:15,
    256:20, 257:30, 258:30, 259:50, 260:45,
    500:5, 501:15, 502:70, 503:10, 504:10, 505:10, 506:10, 507:10,
    508:25, 509:25, 510:25, 511:25, 512:25, 513:20, 514:20, 515:20,
    516:20, 517:20, 518:50, 519:50, 520:150, 521:50, 522:50,
    523:2, 524:7, 525:25, 526:5, 527:10, 528:2, 529:30, 530:40,
    531:69, 532:75, 533:5, 534:10, 535:20, 536:20, 537:30, 538:20,
    539:10, 540:5,
  }
  return VALUES[id] ?? 0
}

/** itemStackMax(id) — maximum stack size */
export function itemStackMax(id: number): number {
  const STACKS: Record<number, number> = {
    1:1, 101:1, 102:1, 103:15, 104:1, 105:5, 106:1,
    108:1, 109:1, 110:5, 111:5, 112:5, 113:5, 114:5, 115:10,
    116:1, 117:1, 118:1, 119:1, 120:5,
    121:10, 122:10, 123:10, 124:10, 125:10, 126:5, 127:1, 128:10,
    200:1, 201:5, 202:5, 203:15, 204:5, 205:5, 206:10, 207:5,
    208:10, 209:15, 210:5, 211:15, 212:10, 213:10, 214:10, 215:1,
    216:5, 217:5, 218:10, 219:5, 220:5, 221:10, 222:5, 223:10,
    224:10, 225:10, 226:15, 227:10, 228:10, 229:1, 230:5, 231:10,
    232:1, 233:1, 234:1, 235:1, 236:1, 237:1, 238:15, 239:15,
    240:5, 241:5, 242:5, 243:5, 244:1, 245:15, 246:10, 247:1,
    248:10, 249:5, 250:5, 251:15, 252:1, 253:15, 254:1, 255:15,
    256:15, 257:5, 258:5, 259:10, 260:10,
    500:10, 501:5, 502:1, 503:10, 504:10, 505:5, 506:10, 507:10,
    508:10, 509:10, 510:10, 511:10, 512:10, 513:5, 514:5, 515:5,
    516:5, 517:5, 518:5, 519:5, 520:5, 521:5, 522:5,
    523:15, 524:10, 525:5, 526:1, 527:10, 528:10, 529:5, 530:5,
    531:1, 532:5, 533:15, 534:10, 535:10, 536:5, 537:5, 538:10,
    539:10, 540:15,
  }
  return STACKS[id] ?? 0
}

/** foodItem(id) — hunger restoration amount (0 = not a food item).
 *  Caller must apply `gs.hunger += 2 * foodItem(id)` to actually feed the player.
 *  AS3 original was `function foodItem(ID:int):void { ... hunger += 2*tempNum; }` —
 *  this TS port made it a pure lookup so the same table can be reused for both
 *  consumption (Inventory.useItem) and "is this food?" UI checks. */
export function foodItem(id: number): number {
  const FOOD: Record<number, number> = {
    114:5, 208:8, 209:10, 210:20, 211:5, 212:15, 214:30,
    218:10, 219:15, 221:15, 222:10, 223:25, 224:20, 226:10,
    238:20, 251:40, 253:4, 256:15, 259:25,
    500:30, 501:70, 503:3, 504:5, 506:5, 507:7, 508:7, 509:8,
    511:10, 512:10, 513:4, 514:4, 516:15, 517:15, 518:8, 519:8,
    521:20, 522:20, 523:10, 524:30, 527:15, 529:1, 530:20, 531:50,
    534:5, 535:10, 536:15, 537:25, 538:20, 539:15, 540:10,
  }
  return FOOD[id] ?? 0
}
