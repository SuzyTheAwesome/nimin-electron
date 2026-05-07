/**
 * TownStuff.ts
 * Ported from TownStuff.as
 * Town general screen, shops (general, dye, apothecary), doJizzPants.
 */

import { gs, bc } from '../core/GameState.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import {
  viewButtonText, viewButtonOutline, buttonWrite, setButtonVisible,
  choiceListButtons, choiceListSelect, buttonConfirm, doNext,
} from '../ui/ButtonManager.ts'
import { doEnd, doProcess, doReturn } from '../core/GameEngine.ts'
import { doWeight } from '../content/Weight.ts'
import { regionName, plural, cockDesc, ballDesc, legDesc, legPlural, hipDesc, vulvaDesc } from '../content/Descriptions.ts'
import {
  clothesTop, clothesBottom, currentClothes, pullUD, changeBot,
  clothesName, clothesID, clothesValue, clothesDescription, clothesChange,
} from '../content/Clothes.ts'
import {
  hairstyleName, hairstyleID, hairstyleValue, hairstyleDescription, hairstyleLength,
} from '../content/Hair.ts'
import { cumAmount } from '../core/Calculations.ts'
import { doLust, doCoin, doHP } from '../systems/StatChanges.ts'
import { doLevelUP } from '../systems/Leveling.ts'
import {
  itemName, itemAdd, itemRemove, passiveItemRemove,
  checkItem, checkStash, itemDescription, itemValue, itemStackMax, canLose, conItem,
} from '../content/Items.ts'
import { bagSlotClear } from '../systems/Inventory.ts'
import { lactChange } from '../systems/Transformations.ts'
import { stats as _stats } from '../systems/StatSetup.ts'

// Forward-declared callbacks (set by main.ts after boot)
let _doBag:          () => void = () => {}
let _doMasturbate:   () => void = () => {}
let _doSleep:        () => void = () => {}
let _doDaycare:      () => void = () => {}
let _doAlchemy:      () => void = () => {}
let _doProstitute:   () => void = () => {}
let _doExplore:      () => void = () => {}

export function setTownCallbacks(cb: {
  doBag:        () => void
  doMasturbate: () => void
  doSleep:      () => void
  doDaycare:    () => void
  doAlchemy:    () => void
  doProstitute: () => void
  doExplore:    () => void
}): void {
  _doBag        = cb.doBag
  _doMasturbate = cb.doMasturbate
  _doSleep      = cb.doSleep
  _doDaycare    = cb.doDaycare
  _doAlchemy    = cb.doAlchemy
  _doProstitute = cb.doProstitute
  _doExplore    = cb.doExplore
}

// ── doGeneral ─────────────────────────────────────────────────────────────────

export function doGeneral(): void {
  bc()
  gs.currentState = 1
  viewButtonText(1,1,1,1,1,1,1,0,1,1,0,1)
  viewButtonOutline(1,1,1,1,1,1,1,0,1,1,0,1)
  textL('You are currently in ' + regionName(gs.currentZone) + '. What would you like to do?')
  buttonWrite(1, 'Bag')
  buttonWrite(6, 'Sleep')
  buttonWrite(5, 'Masturbate')
  buttonWrite(2, 'Stash')
  buttonWrite(3, 'Shops')
  buttonWrite(4, 'Day-Care')
  buttonWrite(7, 'Alchemy')
  buttonWrite(9, 'Wait')
  buttonWrite(12, 'Explore')
  buttonWrite(10, 'Prostitute')

  // Use class-based hiding (setButtonVisible) instead of inline style.display.
  // Inline `style.display = 'none'` overrides CSS classes, so once set it
  // STICKS across screen re-renders even when viewButtonText() tries to
  // re-show the button. That caused the Shops button to vanish permanently
  // after a single overnight visit, and the Explore button to vanish after
  // a single overweight episode.
  if (doWeight()) {
    setButtonVisible(12, false)
  }
  if (gs.hour > 20 || gs.hour < 7) {
    textLP('\r\rAll of the shops are closed at this hour of night.')
    setButtonVisible(3, false)
  }
  if (gs.levelUP > 0) {
    // AS3 inherited bug fix: AS3 only flipped Choice8.visible/Choice8Outline.visible
    // to show the Level Up button. The TS port's `viewButtonText(1,1,1,1,1,1,1,1,1,1,0,1)`
    // re-enabled all 12 buttons, un-hiding the Shops button after dark and the
    // Explore button after going overweight (both hidden by setButtonVisible above).
    setButtonVisible(8, true)
    buttonWrite(8, 'Level Up!')
  }

  // Breast engorgement overflow
  const breastCap = (gs.breastSize * (gs.breastSize + 1) + gs.tallness / 4) * 4 + gs.milkCap
  if (gs.milkEngorgement >= breastCap * 4 && gs.lactation > 0) {
    viewButtonText(0,0,0,0,1,0,0,0,1,0,0,0)
    textLP('\r\rMilk sprays from your chest, shooting through your ' + clothesTop() + ' and obscuring your view with a white mist. You must either milk your breasts or wait for the gushing to subside if you wish to continue. Either way, you have already wasted a large amount of milk.')
    gs.milkEngorgement -= breastCap * 1.5
    lactChange(1, -30)
  }

  // Udder engorgement overflow
  const udderCap = (gs.udderSize * (gs.udderSize + 1) + gs.tallness / 4) * 4 + gs.milkCap
  if (gs.udderEngorgement >= udderCap * 4 && gs.udderLactation > 0) {
    viewButtonText(0,0,0,0,1,0,0,0,1,0,0,0)
    textLP('\r\rMilk sprays from your belly, shooting through your ' + clothesBottom() + ' and obscuring your view with a white mist. You must milk your udder or wait for the gushing to subside. Either way, you have already wasted a large amount of milk.')
    gs.udderEngorgement -= udderCap * 1.5
    lactChange(2, -50)
  }

  // Blue balls
  if (gs.blueBalls >= 120 && Math.random() * gs.ment < Math.random() * (gs.lib + gs.blueBalls - 120) && gs.lib > (gs.ment - 70)) {
    doJizzPants()
    return
  }

  // Forced masturbation from max lust
  if (gs.lust === 100) {
    viewButtonText(0,0,0,0,1,0,0,0,0,0,0,0)
    // AS3 1:1: dynamic legDesc/legPlural rather than hard-coded "legs"
    textLP('\r\rYour body quivers and your ' + legDesc(2) + ' give' + legPlural(1) + ' out from under you as your arousal soaks through your clothes. Your mind seems focused only on one thing: SEX!\r\rYou must masturbate if you wish to continue.')
  } else if (gs.exhaustion > 44) {
    textLP("\r\rThere's only one thing on your mind right now...")
    viewButtonText(0,0,0,0,0,1,0,0,0,0,0,0)
  }

  gs.doListen = () => {
    if (gs.buttonChoice === 1)  { _doBag() }
    if (gs.buttonChoice === 6)  { _doSleep() }
    if (gs.buttonChoice === 5)  { _doMasturbate() }
    if (gs.buttonChoice === 2)  { doStash() }
    if (gs.buttonChoice === 3)  { doShops() }
    if (gs.buttonChoice === 4)  { _doDaycare() }
    if (gs.buttonChoice === 7)  { _doAlchemy() }
    if (gs.buttonChoice === 8)  { doLevelUP() }
    if (gs.buttonChoice === 12) { _doExplore() }
    if (gs.buttonChoice === 10) { _doProstitute() }
    if (gs.buttonChoice === 9)  { gs.hrs++; doProcess() }
  }
}

// ── doStash ──────────────────────────────────────────────────────────────────

function doStash(): void {
  choiceListButtons('Stash')
  textL('Click on an item in your stash to retrieve it.')
  gs.doListen = () => {
    choiceListSelect('Stash')
    if (gs.buttonChoice === 12) { doReturn() }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { doStash() }
    else if (gs.choiceListResult[0] !== '' && gs.choiceListResult[0] !== 0) {
      const id = gs.stashArray[gs.choiceListResult[1] as number]
      itemAdd(id)
      gs.stashArray[gs.choiceListResult[1] as number] = 0
      doStash()
    }
  }
}

// ── doJizzPants ──────────────────────────────────────────────────────────────

function doJizzPants(): void {
  const getCum = cumAmount()
  textL('\r\rYour ' + ballDesc() + ' balls feel so absolutely swollen and sensitive, that you can\'t stop thinking about it. They just feel like they\'ve gotta... gotta... gotta...')
  gs.hrs += 1

  if (getCum <= 300) {
    textLP('\r\rYou let out a gasp as you feel your ' + cockDesc() + ' cock' + plural(1) + ' begin' + plural(3) + ' to twitch within your ' + clothesBottom() + ' while standing in the middle of ' + regionName(gs.currentZone) + '. You feel wads of cum seep out, climaxing without anything to assist it.\r\rYet, it\'s so little that you quickly regain your composure. A bit flushed, you feel lucky that nobody else noticed.')
  } else if (getCum <= 800) {
    textLP('\r\rYou gasp and begin to pant as you feel your ' + cockDesc() + ' cock' + plural(1) + ' begin' + plural(3) + ' to jerk within your ' + clothesBottom() + ' while standing in the middle of ' + regionName(gs.currentZone) + '. Spurts of cum launch from your cock, pooling slightly within your ' + clothesBottom() + '.\r\rIt takes several moments to regain your composure, only to notice the moist blotch spreading across your ' + clothesBottom() + '.')
    gs.hrs += 1
  } else if (getCum <= 1000) {
    textLP('\r\rYou clench your mouth shut as you instinctively begin to moan. Your ' + cockDesc() + ' cock' + plural(1) + ' begin' + plural(3) + ' to buck within your ' + clothesBottom() + ', spurts of cum launching down through your ' + clothesBottom() + '. Streams of the white slimy stuff dribble down your ' + legDesc(2) + ', severely blotching your ' + clothesBottom() + ', and making a few bystanders turn to wonder what you are doing.')
    gs.hrs += 3
    _stats(0, -1, 0, 0)
  } else if (getCum <= 3000) {
    textLP('\r\rYou let out a moan that catches the attention of several bystanders in the middle of ' + regionName(gs.currentZone) + '. A thick stream of hot spunk pours down through your ' + clothesBottom() + ' to the ground below, making a light splattering sound as it begins to form a puddle. Cum still dribbling down your ' + legDesc(2) + ', you step away and rush back home to clean up.')
    gs.hrs += 4
    _stats(0, -3, 0, 0)
  } else if (getCum <= 8000) {
    textLP('\r\rYour hands leap to your ' + cockDesc() + ' cock' + plural(1) + ' and grab ' + plural(9) + ' through your ' + clothesBottom() + ' just as thick spurts of hot spunk spew within, pouring out over your hands and down your ' + legDesc(2) + ' as you moan again and again. All in the middle of ' + regionName(gs.currentZone) + ', catching the attention of many strangers.')
    gs.hrs += 7
    _stats(0, -5, 0, 0)
  } else if (getCum <= 25000) {
    textLP('\r\rYour hands leap to your ' + cockDesc() + ' cock' + plural(1) + ' and grab ' + plural(9) + ' through your ' + clothesBottom() + ' just as small waves of hot thick spunk gurgle out of your crotch in the middle of ' + regionName(gs.currentZone) + '. You collapse over yourself and crumble to the ground, your hands rubbing and pressing down into your crotch... You just come so hard and so long...')
    gs.hrs += 9
    _stats(0, -5, 0, 0)
    gs.exhaustion += 15
  } else {
    textLP('\r\rThe sound of your ' + clothesBottom() + ' being shredded fills the air in ' + regionName(gs.currentZone) + ' as a massive amount of hot thick slimy sticky cum erupts from your ' + cockDesc() + ' cock' + plural(1) + ' and tears a path through your ' + clothesBottom() + '. You fall onto your back from the force, your fingers scratching at the ground below you...')
    // AS3 inherited bug fix: TS port left this commented as "implement when
    // Clothes.ts is ported", but Clothes.ts already exports changeBot which
    // handles id=-1 (tattered shreds). Restored the AS3 call.
    changeBot(-1)
    gs.hrs += 10
    _stats(0, -5, 2, 0)
    gs.exhaustion += 20
  }
  doLust(-Math.floor(gs.lib / 4), 2, 1)
  doNext()
  gs.doListen = () => { doEnd() }
}

// ── doShops ──────────────────────────────────────────────────────────────────

function doShops(): void {
  viewButtonOutline(1,1,1,0,0,1,1,0,0,0,0,1)
  viewButtonText(1,1,1,0,0,1,1,0,0,0,0,1)
  buttonWrite(1, 'General')
  buttonWrite(2, 'Dyes')
  buttonWrite(3, 'Apothecary')
  buttonWrite(6, 'Salon')
  buttonWrite(7, 'Tailor')
  buttonWrite(12, 'Return')
  textL('General Store - Come here to see what kinds of goods ' + regionName(gs.currentZone) + ' has for sale. You can also sell your own goods here as well.\r\rDye Shop - If you want to feel unique and look special, stop by for some new colors.\r\rApothecary - Need some ingredients for your alchemy brewing? Or maybe need to learn a new recipe? Come check out what\'s available.\r\rSalon - Want a different haircut? Stop by here to see what styles are popular in ' + regionName(gs.currentZone) + '.\r\rTailor - If you\'re looking to get a new outfit, the ' + regionName(gs.currentZone) + ' tailor might be able to custom-fit something for you.')
  gs.doListen = () => {
    if (gs.buttonChoice === 1)  doShop()
    if (gs.buttonChoice === 2)  doDyeShop()
    if (gs.buttonChoice === 3)  doApothecary()
    if (gs.buttonChoice === 6)  doSalon()
    if (gs.buttonChoice === 7)  doTailor()
    if (gs.buttonChoice === 12) doReturn()
  }
}

// ── doShop ───────────────────────────────────────────────────────────────────

export function doShop(): void {
  bc()
  gs.inShop = true
  let buy = 0
  viewButtonOutline(1,1,1,1,1,1,1,1,1,1,1,1)
  viewButtonText(1,1,1,1,1,1,1,1,1,1,1,1)
  for (let i = 1; i <= 9; i++) {
    buttonWrite(i, itemName(goodsID(i)))
  }
  buttonWrite(10, 'Buy')
  buttonWrite(11, 'Sell')
  buttonWrite(12, 'Return')
  textL('Click on an item to view a description. If you would like to purchase it, click the Buy button.\r\rIf you would like to sell an item from your bag, click Sell.')
  gs.doListen = () => {
    if (gs.buttonChoice !== 10 && gs.buttonChoice !== 11 && gs.buttonChoice !== 12 && goodsID(gs.buttonChoice) !== 0) {
      textL(itemDescription(goodsID(gs.buttonChoice)) + '\r\rCost: ' + 3 * itemValue(goodsID(gs.buttonChoice)) + ' coins.')
      buy = gs.buttonChoice
    }
    if (gs.buttonChoice === 10 && buy !== 0) {
      textLP('\r\rAre you sure you would like to buy ' + itemName(goodsID(buy)) + '?')
      if (itemStackMax(goodsID(buy)) > 1) {
        viewButtonOutline(1,1,1,0,0,0,0,0,0,0,0,1)
        viewButtonText(1,1,1,0,0,0,0,0,0,0,0,1)
        buttonWrite(1, 'Buy 1'); buttonWrite(2, 'Buy 2'); buttonWrite(3, 'Buy 5'); buttonWrite(12, 'Nevermind')
        textLP('\r\rThis item can be bought in the following quantities: 1 for ' + 3 * itemValue(goodsID(buy)) + ' coins, 2 for ' + 6 * itemValue(goodsID(buy)) + ' coins, 5 for ' + 15 * itemValue(goodsID(buy)) + ' coins')
        if (itemStackMax(goodsID(buy)) >= 10) {
          buttonWrite(9, 'Buy 10')
          viewButtonText(1,1,1,0,0,0,0,0,1,0,0,1)
          textLP(', 10 for ' + 30 * itemValue(goodsID(buy)) + ' coins')
        }
        if (itemStackMax(goodsID(buy)) >= 15) {
          buttonWrite(10, 'Buy 15')
          viewButtonText(1,1,1,0,0,0,0,0,1,1,0,1)
          textLP(', 15 for ' + 45 * itemValue(goodsID(buy)) + ' coins')
        }
        textLP('.')
      } else {
        buttonConfirm()
      }
      gs.doListen = () => {
        if (gs.buttonChoice !== 7 && gs.buttonChoice !== 12) {
          let tempInt = 0
          if (gs.buttonChoice === 1 || gs.buttonChoice === 6) tempInt = 1
          if (gs.buttonChoice === 2) tempInt = 2
          if (gs.buttonChoice === 3) tempInt = 5
          if (gs.buttonChoice === 9) tempInt = 10
          if (gs.buttonChoice === 10) tempInt = 15
          const cost = 3 * tempInt * itemValue(goodsID(buy))
          if (gs.coin < cost) {
            textL('Sorry, but you only have ' + gs.coin + ' coins. You require at least ' + (cost - gs.coin) + ' more coins to purchase ' + (tempInt > 1 ? tempInt + 'x ' : '') + itemName(goodsID(buy)) + '.')
            doNext()
            gs.doListen = () => { doShop() }
          } else if (checkItem(goodsID(buy)) && !conItem(goodsID(buy))) {
            textL('Sorry, but you cannot buy ' + itemName(goodsID(buy)) + ' if you already have one. Please choose something else.')
            doNext()
            gs.doListen = () => { doShop() }
          } else {
            for (let i = 1; i <= tempInt; i++) itemAdd(goodsID(buy))
            doCoin(-cost)
            doProcess()
          }
        } else {
          doShop()
        }
      }
    }
    if (gs.buttonChoice === 11) doSell()
    if (gs.buttonChoice === 12) { gs.inShop = false; doReturn() }
  }
}

// ── doSell ───────────────────────────────────────────────────────────────────

function doSell(): void {
  choiceListButtons('Bag')
  textL('Click on an item you would like to sell.')
  gs.doListen = () => {
    choiceListSelect('Bag')
    if (gs.buttonChoice === 12) { doShop(); return }
    if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Bag'); return }
    if (gs.choiceListResult[0] !== 0 && gs.choiceListResult[0] !== '') {
      const id = gs.choiceListResult[0] as number
      const slot = gs.choiceListResult[1] as number
      if (gs.bagStackArray[slot] < 2) {
        if (itemValue(id) === 0 || !canLose(id)) {
          textL('You cannot sell the selected item. Either it is not yours to sell or needs to be unequipped first. Please select another item.')
          doSell()
        } else {
          textL(itemName(id) + ' sells for ' + itemValue(id) + '.\r\rAre you sure you want to sell it?')
          buttonConfirm()
          gs.doListen = () => {
            if (gs.buttonChoice === 6) {
              doCoin(itemValue(id))
              gs.bagArray[slot] = 0
              passiveItemRemove(id)
              doSell()
            } else {
              doSell()
            }
          }
        }
      } else {
        textL(itemName(id) + ' sells for ' + itemValue(id) + ' each.\r\rHow many would you like to sell?')
        viewButtonOutline(1,0,1,0,0,0,0,0,1,0,1,0)
        viewButtonText(1,0,1,0,0,0,0,0,1,0,1,0)
        if (gs.bagStackArray[slot] >= 5)  { viewButtonText(1,0,1,0,1,0,0,0,1,0,1,0); viewButtonOutline(1,0,1,0,1,0,0,0,1,0,1,0) }
        if (gs.bagStackArray[slot] >= 10) { viewButtonText(1,0,1,0,1,0,1,0,1,0,1,0); viewButtonOutline(1,0,1,0,1,0,1,0,1,0,1,0) }
        buttonWrite(1,'1'); buttonWrite(3,'2'); buttonWrite(5,'5'); buttonWrite(7,'10'); buttonWrite(9,'All'); buttonWrite(11,'None')
        gs.doListen = () => {
          let tempInt = 0
          if (gs.buttonChoice === 1) tempInt = 1
          if (gs.buttonChoice === 3) tempInt = 2
          if (gs.buttonChoice === 5) tempInt = 5
          if (gs.buttonChoice === 7) tempInt = 10
          if (gs.buttonChoice === 9) tempInt = gs.bagStackArray[slot]
          if (gs.bagStackArray[slot] === tempInt) bagSlotClear(slot)
          else gs.bagStackArray[slot] -= tempInt
          if (tempInt > 0) doCoin(tempInt * itemValue(id))
          doSell()
        }
      }
    }
  }
}

// ── goodsID ──────────────────────────────────────────────────────────────────

export function goodsID(slot: number): number {
  // Layout note: Buy=10, Sell=11, Return=12 (UI buttons). Items occupy slots 1-9 only.
  // Items historically at slots 10/11 in the AS3 original have moved to slots 4/8
  // (which were previously Buy/Sell) so the UI buttons can sit alongside Return.
  const zone = gs.currentZone
  if (zone === 1) {
    if (slot === 1)  return 104
    if (slot === 2)  return 111
    if (slot === 3)  return 116
    if (slot === 4)  return 115  // moved from slot 10
    if (slot === 5)  return 500
    if (slot === 6)  return 501
    if (slot === 7)  return 108
    if (slot === 8)  return 121  // moved from slot 11
    if (slot === 9)  return 110
  }
  if (zone === 2) {
    if (slot === 1)  return 102
    if (slot === 2)  return 112
    if (slot === 3)  return 117
    if (slot === 4)  return 115  // moved from slot 10
    if (slot === 5)  return 106
    if (slot === 8)  return 122  // moved from slot 11
    if (slot === 9)  return 110
  }
  if (zone === 3) {
    if (slot === 1)  return 101
    if (slot === 2)  return 113
    if (slot === 3)  return 118
    if (slot === 4)  return 115  // moved from slot 10
    if (slot === 5)  return 120
    if (slot === 8)  return 123  // moved from slot 11
    if (slot === 9)  return 110
  }
  if (zone === 4) {
    if (slot === 2)  return 114
    if (slot === 3)  return 119
    if (slot === 4)  return 115  // moved from slot 10
    if (slot === 5)  return 103
    if (slot === 6)  return 105
    if (slot === 8)  return 124  // moved from slot 11
    if (slot === 9)  return 110
  }
  if (zone === 6) {
    if (slot === 1)  return 109
    if (slot === 2)  return 126
    if (slot === 3)  return 127
    if (slot === 4)  return 115  // moved from slot 10
    if (slot === 5)  return 103
    if (slot === 6)  return 230
    if (slot === 8)  return 125  // moved from slot 11
    if (slot === 9)  return 110
  }
  if (zone === 12) {
    if (slot === 1)  return 247
    if (slot === 2)  return 250
    if (slot === 3)  return 256
    if (slot === 4)  return 115  // moved from slot 10
    if (slot === 5)  return 120
    if (slot === 8)  return 128  // moved from slot 11
    if (slot === 9)  return 110
  }
  return 0
}

// ── doDyeShop ────────────────────────────────────────────────────────────────

function doDyeShop(): void {
  let buy = 0
  viewButtonOutline(1,1,1,1,1,1,1,1,1,1,1,1)
  viewButtonText(1,1,1,1,1,1,1,1,1,1,1,1)
  for (let i = 1; i <= 12; i++) buttonWrite(i, itemName(dyeID(i)))
  buttonWrite(4, 'Buy')
  buttonWrite(12, 'Return')
  textL('Click on a dye to view a description. If you would like to purchase it, click the Buy button.')
  gs.doListen = () => {
    if (gs.buttonChoice !== 4 && gs.buttonChoice !== 8 && gs.buttonChoice !== 12 && dyeID(gs.buttonChoice) !== 0) {
      textL(itemDescription(dyeID(gs.buttonChoice)) + '\r\rCost: ' + 3 * itemValue(dyeID(gs.buttonChoice)) + ' coins.')
      buy = gs.buttonChoice
    }
    if (gs.buttonChoice === 4 && buy !== 0) {
      textLP('\r\rAre you sure you would like to buy ' + itemName(dyeID(buy)) + '?')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          const cost = 3 * itemValue(dyeID(buy))
          if (gs.coin < cost) {
            textL('Sorry, but you only have ' + gs.coin + ' coins. You require at least ' + (cost - gs.coin) + ' more coins to purchase ' + itemName(dyeID(buy)) + '.')
            doNext()
            gs.doListen = () => { doDyeShop() }
          } else {
            itemAdd(dyeID(buy))
            doCoin(-cost)
            doProcess()
          }
        } else {
          doDyeShop()
        }
      }
    }
    if (gs.buttonChoice === 12) doReturn()
  }
}

function dyeID(slot: number): number {
  if (slot === 1) return 240
  if (slot === 2) return 241
  if (slot === 5) return 242
  if (slot === 6) return 243
  return 0
}

// ── doApothecary ─────────────────────────────────────────────────────────────

function doApothecary(): void {
  let buy = 0
  viewButtonOutline(1,1,1,1,1,1,1,1,1,1,1,1)
  viewButtonText(1,1,1,1,1,1,1,1,1,1,1,1)
  for (let i = 1; i <= 10; i++) buttonWrite(i, apothName(apothID(i)))
  buttonWrite(11, 'Buy')
  buttonWrite(12, 'Return')
  textL('Click on an item to view its description. If you would like to purchase it, click the Buy button.\r\rRecipes for Alchemy only need to be bought once.')
  gs.doListen = () => {
    if (gs.buttonChoice !== 11 && gs.buttonChoice !== 12 && apothID(gs.buttonChoice) !== 0) {
      textL(apothDescription(apothID(gs.buttonChoice)) + '\r\rCost: ' + 3 * apothValue(apothID(gs.buttonChoice)) + ' coins.')
      buy = gs.buttonChoice
    }
    if (gs.buttonChoice === 11 && buy !== 0) {
      textLP('\r\rAre you sure you would like to buy ' + apothName(apothID(buy)) + '?')
      if (apothID(buy) > 200 && itemStackMax(apothID(buy)) > 1) {
        viewButtonOutline(1,1,1,0,0,0,0,0,0,0,0,1)
        viewButtonText(1,1,1,0,0,0,0,0,0,0,0,1)
        buttonWrite(1,'Buy 1'); buttonWrite(2,'Buy 2'); buttonWrite(3,'Buy 5'); buttonWrite(12,'Nevermind')
        textLP('\r\rThis item can be bought in the following quantities: 1 for ' + 3 * apothValue(apothID(buy)) + ' coins, 2 for ' + 6 * apothValue(apothID(buy)) + ' coins, 5 for ' + 15 * apothValue(apothID(buy)) + ' coins')
        if (itemStackMax(apothID(buy)) >= 10) { buttonWrite(9,'Buy 10'); viewButtonText(1,1,1,0,0,0,0,0,1,0,0,1); textLP(', 10 for ' + 30 * apothValue(apothID(buy)) + ' coins') }
        if (itemStackMax(apothID(buy)) >= 15) { buttonWrite(10,'Buy 15'); viewButtonText(1,1,1,0,0,0,0,0,1,1,0,1); textLP(', 15 for ' + 45 * apothValue(apothID(buy)) + ' coins') }
        textLP('.')
      } else {
        buttonConfirm()
      }
      gs.doListen = () => {
        if (gs.buttonChoice !== 7 && gs.buttonChoice !== 12) {
          let tempInt = 0
          if (gs.buttonChoice === 1 || gs.buttonChoice === 6) tempInt = 1
          if (gs.buttonChoice === 2) tempInt = 2
          if (gs.buttonChoice === 3) tempInt = 5
          if (gs.buttonChoice === 9) tempInt = 10
          if (gs.buttonChoice === 10) tempInt = 15
          const cost = 3 * tempInt * apothValue(apothID(buy))
          if (gs.coin < cost) {
            textL('Sorry, but you only have ' + gs.coin + ' coins. You require at least ' + (cost - gs.coin) + ' more coins to purchase ' + (tempInt > 1 ? tempInt + 'x ' : '') + apothName(apothID(buy)) + '.')
            doNext()
            gs.doListen = () => { doApothecary() }
          } else if (checkItem(apothID(buy)) && !conItem(apothID(buy))) {
            textL('Sorry, but you cannot buy ' + apothName(apothID(buy)) + ' if you already have one.')
            doNext()
            gs.doListen = () => { doApothecary() }
          } else {
            doCoin(-cost)
            if (apothID(buy) > 200) {
              for (let i = 1; i <= tempInt; i++) itemAdd(apothID(buy))
            } else {
              apothLearn(apothID(buy))
            }
            doProcess()
          }
        } else {
          doApothecary()
        }
      }
    }
    if (gs.buttonChoice === 12) doReturn()
  }
}

function apothID(slot: number): number {
  // Layout note: Buy=11, Return=12 (UI buttons). Items occupy slots 1-10 only.
  // Items historically at slot 11 in the AS3 original have moved to slot 4
  // (which was previously Buy) so the Buy button can sit alongside Return.
  const zone = gs.currentZone
  if (zone === 1) {
    if (slot === 1) return 203; if (slot === 2) return 209; if (slot === 3) return 523
    if (slot === 4 && !gs.knowBabyFree)   return 11  // moved from slot 11
    if (slot === 7 && !gs.knowLustDraft)  return 1
    if (slot === 9 && !gs.knowSRejuvPot)  return 6
  }
  if (zone === 2) {
    if (slot === 1) return 209; if (slot === 2) return 202; if (slot === 3) return 206; if (slot === 5) return 212; if (slot === 6) return 524
    if (slot === 9 && !gs.knowRejuvPot)   return 2
    if (slot === 10 && !gs.knowSLustDraft) return 5
  }
  if (zone === 3) {
    if (slot === 1) return 201; if (slot === 2) return 202; if (slot === 3) return 203
    if (slot === 4 && !gs.knowSGenSwap)   return 13  // moved from slot 11
    if (slot === 9 && !gs.knowBallSwell)  return 4
    if (slot === 10 && !gs.knowPotPot)    return 12
  }
  if (zone === 4) {
    if (slot === 1) return 210; if (slot === 2) return 201; if (slot === 3) return 218
    if (slot === 4 && !gs.knowSBabyFree)  return 15  // moved from slot 11
    if (slot === 9 && !gs.knowExpPreg)    return 3
    if (slot === 10 && !gs.knowGenSwap)   return 9
  }
  if (zone === 6) {
    if (slot === 1) return 207; if (slot === 2) return 213; if (slot === 3) return 208; if (slot === 5) return 228
    if (slot === 4 && !gs.knowSPotPot)    return 16  // moved from slot 11
    if (slot === 9 && !gs.knowSExpPreg)   return 7
    if (slot === 10 && !gs.knowSBallSwell) return 8
  }
  if (zone === 12) {
    if (slot === 9 && !gs.knowMilkSuppress) return 17
  }
  return 0
}

function apothLearn(id: number): void {
  if (id === 1)  gs.knowLustDraft    = true
  if (id === 2)  gs.knowRejuvPot     = true
  if (id === 3)  gs.knowExpPreg      = true
  if (id === 4)  gs.knowBallSwell    = true
  if (id === 5)  gs.knowSLustDraft   = true
  if (id === 6)  gs.knowSRejuvPot    = true
  if (id === 7)  gs.knowSExpPreg     = true
  if (id === 8)  gs.knowSBallSwell   = true
  if (id === 9)  gs.knowGenSwap      = true
  if (id === 10) gs.knowMasoPot      = true
  if (id === 11) gs.knowBabyFree     = true
  if (id === 12) gs.knowPotPot       = true
  if (id === 13) gs.knowSGenSwap     = true
  if (id === 14) gs.knowSMasoPot     = true
  if (id === 15) gs.knowSBabyFree    = true
  if (id === 16) gs.knowSPotPot      = true
  if (id === 17) gs.knowMilkSuppress = true
}

function apothName(id: number): string {
  if (id >= 200) return itemName(id)
  const names: Record<number, string> = {
    1:'R: LustDraft', 2:'R: RejuvPot', 3:'R: ExpPreg', 4:'R: BallSwell',
    5:'R: SLustDraft', 6:'R: SRejuvPot', 7:'R: SExpPreg', 8:'R: SBallSwell',
    9:'R: GenSwap', 10:'R: MasoPot', 11:'R: BabyFree', 12:'R: PotPot',
    13:'R: SGenSwap', 14:'R: SMasoPot', 15:'R: SBabyFree', 16:'R: SPotPot',
    17:'R: MilkSuppress',
  }
  return names[id] ?? ''
}

function apothDescription(id: number): string {
  if (id >= 200) return itemDescription(id)
  const descs: Record<number, string> = {
    1:'Recipe: Lust Draft\r\rFor those who need a boost in the bedroom.\r\rAlchemy difficulty: Simple',
    2:'Recipe: Rejuvenation Potion\r\rUseful for soothing what ails you.\r\rAlchemy difficulty: Simple',
    3:'Recipe: Express Pregnancy Potion\r\rHelps quicken the gestation period.\r\rAlchemy difficulty: Simple',
    4:'Recipe: Ball Sweller\r\rGives your nuts a jump in their production.\r\rAlchemy difficulty: Simple',
    5:"Recipe: Superior Lust Draft\r\rFor when you've got a long night ahead.\r\rAlchemy difficulty: Complex",
    6:'Recipe: Superior Rejuvenation Potion\r\rGreatly soothes your ailments.\r\rAlchemy difficulty: Complex',
    7:'Recipe: Superior Express Pregnancy Potion\r\rBecause that baby just needs to get out.\r\rAlchemy difficulty: Complex',
    8:"Recipe: Superior Ball Sweller\r\rIf you like that swollen, achy, full of seed feeling.\r\rAlchemy difficulty: Complex",
    9:"Recipe: Gender Swap Potion\r\rDon't like your current path in life?\r\rAlchemy difficulty: Complex",
    10:'Recipe: Masochism Potion\r\rMakes some the pain feel pleasurable instead.\r\rAlchemy difficulty: Complex',
    11:'Recipe: Baby Free Potion\r\rA good contraceptive.\r\rAlchemy difficulty: Complex',
    12:'Recipe: Potency Potion\r\rMakes your testicles more efficient in their duties.\r\rAlchemy difficulty: Complex',
    13:"Recipe: Superior Gender Swap Potion\r\rFor when you're bored and wanna try something new.\r\rAlchemy difficulty: Advanced",
    14:"Recipe: Superior Masochism Potion\r\rReally helps take on the big fellas.\r\rAlchemy difficulty: Advanced",
    15:"Recipe: Superior Baby Free Potion\r\rNecessary in Siz'Calit.\r\rAlchemy difficulty: Advanced",
    16:'Recipe: Superior Potency Potion\r\rHelps make sure you absolutely fertilize all those eggs.\r\rAlchemy difficulty: Advanced',
    17:'Recipe: Milk Suppressant\r\rSometimes all that leaking can be a bit of a nuisance.\r\rAlchemy difficulty: Complex',
  }
  return descs[id] ?? ''
}

function apothValue(id: number): number {
  if (id >= 200) return itemValue(id)
  const vals: Record<number, number> = {
    1:20, 2:25, 3:25, 4:20, 5:35, 6:40, 7:35, 8:30,
    9:45, 10:45, 11:40, 12:45, 13:60, 14:70, 15:55, 16:65, 17:35,
  }
  return vals[id] ?? 0
}

// ── Salon (1:1 port of AS3 Hair.as:doSalon) ───────────────────────────────────

function doSalon(): void {
  bc()
  let buy = 0
  viewButtonOutline(1,1,1,1,1,1,1,0,1,1,1,1)
  viewButtonText(1,1,1,1,1,1,1,0,1,1,1,1)
  for (let i = 1; i <= 11; i++) {
    if (i !== 4 && i !== 8) buttonWrite(i, hairstyleName(hairstyleID(i)))
  }
  buttonWrite(4, 'Buy')
  buttonWrite(12, 'Return')
  textL('Click on a hairstyle to view a description of the hairstyle. If you would like to purchase it, click the Buy button.\r\rNote: Buying hairstyles automatically replaces your current hairstyle. You cannot sell hairstyles.')

  gs.doListen = function(): void {
    if (gs.buttonChoice !== 4 && gs.buttonChoice !== 8 && gs.buttonChoice !== 12 && hairstyleID(gs.buttonChoice) !== 0) {
      textL(hairstyleDescription(hairstyleID(gs.buttonChoice)) + '\r\rCost: ' + hairstyleValue(hairstyleID(gs.buttonChoice)) + ' coins.')
      buy = gs.buttonChoice
    }
    if (gs.buttonChoice === 4 && buy !== 0) {
      textLP('\r\rAre you sure you would like to buy ' + hairstyleName(hairstyleID(buy)) + '?')
      buttonConfirm()
      gs.doListen = function(): void {
        if (gs.buttonChoice === 6) {
          if (gs.coin < hairstyleValue(hairstyleID(buy))) {
            textL('Sorry, but you only have ' + gs.coin + ' coins. You require at least ' + (hairstyleValue(hairstyleID(buy)) - gs.coin) + ' more coins to purchase ' + hairstyleName(hairstyleID(buy)) + '.')
            doNext()
            gs.doListen = function(): void { doSalon() }
          } else {
            gs.hair = hairstyleID(buy)
            doCoin(-hairstyleValue(hairstyleID(buy)))
            if (hairstyleLength(hairstyleID(buy))) {
              viewButtonOutline(1,1,0,0,1,1,1,0,0,0,0,0)
              viewButtonText(1,1,0,0,1,1,1,0,0,0,0,0)
              buttonWrite(1, 'Short')
              buttonWrite(2, 'Medium')
              buttonWrite(5, 'Long')
              buttonWrite(6, 'X-Long')
              buttonWrite(7, 'XX-Long')
              textLP('What length would you like your hair to be? This does not affect its cost.\r\rShort - Doesn\'t hang past head.\r\rMedium - Reaches shoulders.\r\rLong - Reaches past shoulderblades.\r\rX-Long - Hangs past your butt.\r\rXX-Long - Reaches the ground.')
              gs.doListen = function(): void {
                if (gs.buttonChoice === 1)      gs.hairLength = 2
                else if (gs.buttonChoice === 2) gs.hairLength = 4
                else if (gs.buttonChoice === 5) gs.hairLength = 6
                else if (gs.buttonChoice === 6) gs.hairLength = 8
                else if (gs.buttonChoice === 7) gs.hairLength = 10
                doSalon()
              }
            } else {
              doSalon()
            }
          }
        } else {
          doSalon()
        }
      }
    }
    if (gs.buttonChoice === 12) doReturn()
  }
}

// ── Tailor (1:1 port of AS3 Clothes.as:doTailor) ──────────────────────────────

function doTailor(): void {
  bc()
  let buy = 0
  viewButtonOutline(1,1,1,1,1,1,1,0,1,1,1,1)
  viewButtonText(1,1,1,1,1,1,1,0,1,1,1,1)
  for (let i = 1; i <= 11; i++) {
    if (i !== 4 && i !== 8) buttonWrite(i, clothesName(clothesID(i)))
  }
  buttonWrite(4, 'Buy')
  buttonWrite(12, 'Return')
  textL('Click on a piece of clothing to view a description for the piece. If you would like to purchase it, click the Buy button.\r\rNote: Buying clothes automatically replaces what you\'re already wearing. You cannot sell outfits.')

  gs.doListen = function(): void {
    if (gs.buttonChoice !== 4 && gs.buttonChoice !== 8 && gs.buttonChoice !== 12 && clothesID(gs.buttonChoice) !== 0) {
      textL(clothesDescription(clothesID(gs.buttonChoice)) + '\r\rCost: ' + clothesValue(clothesID(gs.buttonChoice)) + ' coins.')
      buy = gs.buttonChoice
    }
    if (gs.buttonChoice === 4 && buy !== 0) {
      textLP('\r\rAre you sure you would like to buy ' + clothesName(clothesID(buy)) + '?')
      if (gs.attireTop === gs.attireBot) {
        textLP('\r\rBe wary, replacing your ' + clothesTop() + ' with something that only takes a single clothes slot, your other clothes slot will default to the basic shirt/pants.')
      }
      buttonConfirm()
      gs.doListen = function(): void {
        if (gs.buttonChoice === 6) {
          if (gs.coin < clothesValue(clothesID(buy))) {
            textL('Sorry, but you only have ' + gs.coin + ' coins. You require at least ' + (clothesValue(clothesID(buy)) - gs.coin) + ' more coins to purchase ' + clothesName(clothesID(buy)) + '.')
            doNext()
            gs.doListen = function(): void { doTailor() }
          } else {
            clothesChange(clothesID(buy))
            doCoin(-clothesValue(clothesID(buy)))
            doTailor()
          }
        } else {
          doTailor()
        }
      }
    }
    if (gs.buttonChoice === 12) doReturn()
  }
}
