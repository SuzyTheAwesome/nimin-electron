/**
 * Leveling.ts
 * Ported from Leveling.as
 * Perk selection system (doLevelUP) and re-exports of doHP/doSexP from StatChanges.
 */

import { gs } from '../core/GameState.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import {
  viewButtonText, viewButtonOutline, buttonWrite, setButtonVisible,
  choiceListButtons, choiceListSelect, buttonConfirm,
} from '../ui/ButtonManager.ts'
import { doEnd } from '../core/GameEngine.ts'
import { stats } from './StatSetup.ts'
import { doHP, doSexP, doLust, doCoin } from './StatChanges.ts'
import {
  cockChange, vagChange, lactChange, aff,
} from './Transformations.ts'
import { itemAdd } from '../content/Items.ts'
import { plural } from '../content/Descriptions.ts'
import { clothesTop, clothesBottom, pullUD } from '../content/Clothes.ts'
import { percent, chooseFrom } from '../core/GameUtilities.ts'

// Re-export so callers can import doHP/doSexP from here
export { doHP, doSexP, doLust, doCoin }

export function doLevelUP(): void {
  gs.choiceListArray = []
  textL('You have this many perks pending: ' + gs.levelUP + '\r\rClick on an option to view a description and spend a perk.\r\rSuper perks are different from normal perks in that they only apply a single major effect and cost 3 perks to take.')

  gs.choiceListArray.push('Super Perk')
  gs.choiceListArray.push('')
  gs.choiceListArray.push('Body Build')
  gs.choiceListArray.push('Hyper Happy')
  if (gs.vagTotal > 0) gs.choiceListArray.push('Baby Fact')
  gs.choiceListArray.push('Alchemist')
  if (gs.lactation > 0 || gs.udderLactation > 0) gs.choiceListArray.push('Milk Maid')
  gs.choiceListArray.push('Shapeshifty')

  choiceListButtons('Level Up')
  gs.doListen = () => {
    choiceListSelect('Level Up')
    if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { doLevelUP(); return }
    if (gs.buttonChoice === 12) { doEnd(); return }
    gs.choicePage = 1

    // ── Body Build ──────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Body Build') {
      textL('Body Builder is training to make you strong and more buff.\r\rWith every level in Body Builder, you gain a +2 increase to your maximum Stamina.\r\rWith every 2 levels, your Strength score increases by 2.\r\rEvery 3 levels, you grow 2 inches taller and your body fills out more.\r\rYou have ' + gs.bodyBuildLevel + ' levels in Body Builder.\r\r\rAre you sure you want to spend a Perk on Body Builder?')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          gs.HPMod += 2
          doHP(2)
          textL('The exercise makes you healthier.')
          if (Math.floor((gs.bodyBuildLevel + 1) / 2) > Math.floor(gs.bodyBuildLevel / 2)) {
            stats(2, 0, 0, 0)
            textLP(' You flex your muscles, feeling stronger already!')
          }
          if (Math.floor((gs.bodyBuildLevel + 1) / 3) > Math.floor(gs.bodyBuildLevel / 3)) {
            gs.body += 2
            textLP('\r\rEven your body feels more developed and you measure 2 inches taller than you were before.')
            gs.tallness += 2
          }
          gs.bodyBuildLevel++
          gs.levelUP--
          doEnd()
        } else {
          doLevelUP()
        }
      }
    }

    // ── Hyper Happy ─────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Hyper Happy') {
      textL('Hyper Happy is a perk for those who like things... \'big\'.\r\rEvery level of Hyper Happy, you can choose a body part you would like to make a little bigger.\r\rEvery 3 levels, you become slightly used to your growth, increasing your carrying capacity.\r\rEvery 5th level, you forego that level\'s smaller change for a much greater growth.\r\rYou have ' + gs.hyperHappyLevel + ' levels in Hyper Happy.')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          const isBig = Math.floor((gs.hyperHappyLevel + 1) / 5) > Math.floor(gs.hyperHappyLevel / 5)
          const isSmall = !isBig

          const buildHHList = () => {
            gs.choiceListArray = []
            gs.choiceListArray.push('Breasts')
            gs.choiceListArray.push('Nipples')
            gs.choiceListArray.push('Butt')
            gs.choiceListArray.push('Hips')
            if (gs.vagTotal > 0) {
              gs.choiceListArray.push('Pussy')
              gs.choiceListArray.push('Vulva')
              gs.choiceListArray.push('Clit')
            }
            if (gs.cockTotal > 0) {
              gs.choiceListArray.push('Cock')
              if (gs.showBalls) gs.choiceListArray.push('Balls')
            }
            if (gs.udders) {
              gs.choiceListArray.push('Udder')
              gs.choiceListArray.push('Teats')
            }
            choiceListButtons('Hyper Happy')
          }

          const applyHH = (mult: number) => {
            const r = gs.choiceListResult[0]
            // AS3 1:1: at the every-5th-level mega-growth (mult > 1), AS3
            // prints a full paragraph of flavor text; small growth (mult==1)
            // is the short one-liner. The TS port had collapsed both into a
            // single ternary, losing all the mega-growth detail.
            if (mult > 1) {
              textL('With some focus and a sudden surge of growth, your ')
              if (r === 'Cock')    { cockChange(20, 0); textLP('cock' + plural(1) + ' extend' + plural(3) + ' within your ' + clothesBottom() + ', growing thicker and longer until ' + plural(11) + ' spring' + plural(3) + ' out and you catch ' + plural(11) + ' in your hands. Heavier and more cumbersome, you barely manage to fit ' + plural(9) + ' back into your ' + clothesBottom() + '...') }
              else if (r === 'Balls')   { gs.ballSize += 20; textLP('testicles swell tremendously within your ' + clothesBottom() + ', lifting your cock' + plural(1) + ' and pushing against your thighs. You quickly pull ' + pullUD(2) + ' your ' + clothesBottom() + ' and breathe a sigh of relief as the orbs settle before you. It takes some time to squeeze them back in...') }
              else if (r === 'Pussy')   { vagChange(20, 0); textLP('vagina' + plural(2) + ' grow' + plural(4) + ' much deeper, filling you up inside with more tunnel space to plow...') }
              else if (r === 'Vulva')   { gs.vulvaSize += 20; textLP('pussy lips swell tremendously, bulging in your ' + clothesBottom() + ' and pressing into your thighs until you have to pull' + pullUD(2) + ' your ' + clothesBottom() + ' and give your labiasome air. So thick and tender, it takes some time to stuff yourself back into your clothes...') }
              else if (r === 'Clit')    { gs.clitSize += 20; textLP('clit' + plural(2) + ' extend' + plural(4) + ' within your ' + clothesBottom() + ', forming a more noticeable bulge in the fabric and nearly driving you to orgasm as ' + plural(12) + ' drag' + plural(4) + ' across the cloth...') }
              else if (r === 'Breasts') { gs.breastSize += 20; textLP('breasts swell tremendously, pressing against your ' + clothesTop() + ' until you have to pull the cloth ' + pullUD(1) + ' and let your bosom fall out with a gasp. They\'re much heavier and wobble a bit until you can get balanced and take some time to stuff back in...') }
              else if (r === 'Nipples') { gs.nippleSize += 20; textLP('nipples grow much longer, protruding through your ' + clothesTop() + ' far more and making you gasp in near-orgasm as they drag across the fabric...') }
              else if (r === 'Udder')   { gs.udderSize += 20; textLP('udder swells tremendously, making you fall to your knees as it weighs you down until you let it flop over the ground. You take a few moments before you\'re able to lift yourself back up, swinging your hips slightly as you try to balance yourself with the added mass...') }
              else if (r === 'Teats')   { gs.teatSize += 20; textLP('teats grow much longer, flopping out over your udder and protruding much further, almost like you\'ve got multiple erections forming over your belly...') }
              else if (r === 'Butt')    { gs.butt += 20; textLP('rump swells tremendously, making your ' + clothesBottom() + ' creak as your tush pushes at the fabric. You quickly pull the ' + clothesBottom() + ' ' + pullUD(2) + ' and bend forward while your ass hangs out behind you, wobbling and jiggling with its sudden spurt. You have quite some trouble fitting back into your clothes, with a good deal of crack and cheek still exposed...') }
              else if (r === 'Hips')    { gs.hips += 20; textLP('hips widen tremendously, making your ' + clothesBottom() + ' pull tighter and tigher around your waist. The fabric slips over your pelvis as it tries to make room until you\'re eventually sucking in your gut the best you can to not make the cloth explode...') }
              return
            }
            // Small growth path
            if (r === 'Cock')    { cockChange(2, 0); textL('Your cock' + plural(1) + ' grow' + plural(3) + ' slightly larger.') }
            else if (r === 'Balls')   { gs.ballSize += 2; textL('Your testicles swell a bit.') }
            else if (r === 'Pussy')   { vagChange(2, 0); textL('Your vagina' + plural(2) + ' grow' + plural(4) + ' slightly deeper.') }
            else if (r === 'Vulva')   { gs.vulvaSize += 2; textL('Your pussy lips swell a bit.') }
            else if (r === 'Clit')    { gs.clitSize += 2; textL('Your clit' + plural(2) + ' grow' + plural(4) + ' slightly larger.') }
            else if (r === 'Breasts') { gs.breastSize += 2; textL('Your breasts swell a bit.') }
            else if (r === 'Nipples') { gs.nippleSize += 2; textL('Your nipples grow slightly longer.') }
            else if (r === 'Udder')   { gs.udderSize += 2; textL('Your udder swells a bit.') }
            else if (r === 'Teats')   { gs.teatSize += 2; textL('Your teats grow slightly longer.') }
            else if (r === 'Butt')    { gs.butt += 2; textL('Your rump swells a bit.') }
            else if (r === 'Hips')    { gs.hips += 2; textL('Your hips widen a bit.') }
          }

          if (isSmall) {
            textL('Choose a body part you would like to increase.')
            buildHHList()
            gs.doListen = () => {
              choiceListSelect('Hyper Happy')
              if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { buildHHList(); return }
              if (gs.buttonChoice === 12) { gs.choicePage = 1; doLevelUP(); return }
              applyHH(1)
              if (Math.floor((gs.hyperHappyLevel + 1) / 3) > Math.floor(gs.hyperHappyLevel / 3)) {
                gs.carryMod += 10
                textLP('\r\rYou also become a bit more accustomed to your attributes.')
              }
              gs.choicePage = 1
              gs.levelUP--
              gs.hyperHappyLevel++
              doEnd()
            }
          } else {
            textL('Choose a body part you would like to greatly increase. This will be 10x more effective than a normal level in Hyper Happy.')
            buildHHList()
            gs.doListen = () => {
              choiceListSelect('Hyper Happy')
              if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { buildHHList(); return }
              if (gs.buttonChoice === 12) { gs.choicePage = 1; doLevelUP(); return }
              textL('With some focus and a sudden surge of growth, your ')
              applyHH(10)
              if (Math.floor((gs.hyperHappyLevel + 1) / 3) > Math.floor(gs.hyperHappyLevel / 3)) {
                gs.carryMod += 10
                textLP('\r\rYou also become a bit more accustomed to your attributes, learning how to carry them more efficiently.')
              }
              gs.levelUP--
              gs.hyperHappyLevel++
              doEnd()
            }
          }
        } else {
          doLevelUP()
        }
      }
    }

    // ── Baby Factory ────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Baby Fact') {
      textL('Baby Factory makes you much better at making babies.\r\rEvery level of Baby Factory increases your chance to get pregnant by 4%.\r\rEvery 2 levels, you have an increased chance of having more offspring.\r\rEvery 4 levels results in hip and rear growth.\r\rYou have ' + gs.babyFactLevel + ' levels in Baby Factory.\r\r\rAre you sure you want to spend a Perk on Baby Factory?')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          gs.pregChanceMod += 4
          textL("There's an odd feeling like you... 'need' to get pregnant? Like you could really enjoy some hot come inside of you...")
          if (Math.floor((gs.babyFactLevel + 1) / 2) > Math.floor(gs.babyFactLevel / 2)) {
            gs.extraPregChance += 5
            textLP('\r\rYour ovaries kinda tickle a little, a tad more likely to pop out more eggs when you ovulate.')
          }
          if (Math.floor((gs.babyFactLevel + 1) / 4) > Math.floor(gs.babyFactLevel / 4)) {
            gs.hips += 3
            gs.butt += 3
            textLP('\r\rWith all of the fertile preparation, your hips widen and your ass swells, giving you a more fecund appearance.')
          }
          gs.levelUP--
          gs.babyFactLevel++
          doEnd()
        } else {
          doLevelUP()
        }
      }
    }

    // ── Alchemist ───────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Alchemist') {
      textL("When not turning metals into gold, alchemists also dabble in a variety of other... things.\r\rEvery level, you manage to scrounge up an ingredient or two for a recipe you know, finding more as you become more proficient.\r\rAlso, every level of Alchemist increases your chance of creating an extra simple concoction by 2%, complex concoction by 1%, and advanced concoction by .66%, up to a maximum of 4 concoctions from a single batch.\r\rYou have " + gs.alchemistLevel + ' levels in Alchemist.\r\r\rAre you sure you want to spend a Perk on Alchemist?')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          textL('Your alchemical prowess has improved!')
          gs.levelUP--
          gs.alchemistLevel++

          let i = 0
          while (percent() < (gs.alchemistLevel * (10 + percent()) - (20 * (i + 2) * i))) {
            gs.rndArray = []
            gs.rndArray.push(209, 110, 203, 212)
            if (gs.knowLustDraft)    gs.rndArray.push(209, 114, 523)
            if (gs.knowRejuvPot)     gs.rndArray.push(115, 203)
            if (gs.knowExpPreg)      gs.rndArray.push(114, 219)
            if (gs.knowBallSwell)    gs.rndArray.push(208)
            if (gs.knowSLustDraft)   gs.rndArray.push(209, 112, 524)
            if (gs.knowSRejuvPot)    gs.rndArray.push(503, 500, 501)
            if (gs.knowSExpPreg)     gs.rndArray.push(213, 219)
            if (gs.knowSBallSwell)   gs.rndArray.push(208, 218)
            if (gs.knowGenSwap)      gs.rndArray.push(110, 120)
            if (gs.knowMasoPot)      gs.rndArray.push(203, 503)
            if (gs.knowBabyFree)     gs.rndArray.push(110, 203)
            if (gs.knowPotPot)       gs.rndArray.push(507, 523)
            if (gs.knowMilkSuppress) gs.rndArray.push(201, 533)
            if (gs.knowSGenSwap)     gs.rndArray.push(201, 202, 207, 210)
            if (gs.knowSMasoPot)     gs.rndArray.push(222, 504)
            if (gs.knowSBabyFree)    gs.rndArray.push(120, 210)
            if (gs.knowSPotPot)      gs.rndArray.push(512, 524)
            if (gs.knowPussJuice)    gs.rndArray.push(210, 114)
            if (gs.knowPheromone)    gs.rndArray.push(530, 212, 206)
            if (gs.knowBazoomba)     gs.rndArray.push(207, 212, 501, 529)
            itemAdd(chooseFrom())
            i++
          }
          doEnd()
        } else {
          doLevelUP()
        }
      }
    }

    // ── Milk Maid ───────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Milk Maid') {
      textL("If you want to feed the world, Milk Maid is... well, one way to go I suppose.\r\rWith every level of Milk Maid, your lactation rate increases by 100 ml/hr (and so does your udder lactation rate, if you have an udder).\r\rEvery other level increases your milk modifier by 50 ml/hr.\r\rEvery 4th level increases your base milk capacity 300 ml.\r\rEvery 5th level increases the amount of stamina restored when you drink milk by 2.\r\rYou have " + gs.milkMaidLevel + ' levels in Milk Maid.\r\r\rAre you sure you want to spend a Perk on Milk Maid?')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          lactChange(1, 100)
          if (gs.udders) lactChange(2, 100)
          textL('Your mammaries feel warm and you can already feel them begin to swell with the sudden increase in production.')
          if (Math.floor((gs.milkMaidLevel + 1) / 2) > Math.floor(gs.milkMaidLevel / 2)) {
            gs.milkMod += 50
            textLP(" So much so that you'll always be prone to large amounts of milking...")
          }
          if (Math.floor((gs.milkMaidLevel + 1) / 4) > Math.floor(gs.milkMaidLevel / 4)) {
            gs.milkCap += 300
            textLP("\r\rIt's surprising how much you've grown accustomed to storing milk, your body much more efficient at the task.")
          }
          if (Math.floor((gs.milkMaidLevel + 1) / 5) > Math.floor(gs.milkMaidLevel / 5)) {
            gs.milkHPMod += 2
            textLP('\r\rAnd with all this milk flowing within your body, drinking the stuff would make you feel even better.')
          }
          gs.milkMaidLevel++
          gs.levelUP--
          doEnd()
        } else {
          doLevelUP()
        }
      }
    }

    // ── Shapeshifty ─────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Shapeshifty') {
      textL("While it is rather difficult to remain in control of one's form in the world of Nimin, some can be a little shifty about it and maintain slight shape-discipline.\r\rAt the first level and every three levels after, you may increase the amount of blood of a race that already exists in your system.\r\rAt the second level and every three levels after, you can choose to increase or decrease your sensitivity to blood changes.\r\rAt the third level and every six levels after, you can choose to lock a single racial trait.\r\rAt the sixth level and every six levels after, you may choose a second feature to lock.\r\rYou have " + gs.shapeshiftyLevel + ' levels in Shapeshifty.\r\r\rAre you sure you want to spend a Perk on Shapeshifty?')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          // Every 3rd level (0, 3, 6...) = lock feature or blood boost
          if (Math.floor((gs.shapeshiftyLevel + 1) / 3) > Math.floor(gs.shapeshiftyLevel / 3)) {
            const isSecondLock = Math.floor((gs.shapeshiftyLevel + 1) / 6) > Math.floor(gs.shapeshiftyLevel / 6)
            const allTraits = ['Face','Skin','Ears','Legs','Breasts','Nipples','Tail','Cock']
            gs.choiceListArray = allTraits.filter(t => {
              if (isSecondLock) return t !== gs.shapeshiftyFirst
              return t !== gs.shapeshiftySecond
            })
            textL('What feature would you like to lock, preventing it from being changed by racial blood?')
            choiceListButtons('Shapeshifty')
            gs.doListen = () => {
              choiceListSelect('Shapeshifty')
              if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Shapeshifty'); return }
              if (gs.buttonChoice === 12) { gs.choicePage = 1; doLevelUP(); return }

              // AS3 inherited bug fix: TS port had `// lock/unlock flags would
              // be set here in full port` — never actually toggled the lock*
              // state, so the perk did nothing mechanically. Replicate AS3:
              // first decrement the OLD lock for whichever slot we're rewriting,
              // then increment the new lock for the new trait.
              const lockMap: Record<string, keyof typeof gs> = {
                Face: 'lockFace', Skin: 'lockSkin', Ears: 'lockEars',
                Legs: 'lockLegs', Breasts: 'lockBreasts', Nipples: 'lockNipples',
                Tail: 'lockTail', Cock: 'lockCock',
              }
              const oldTrait = isSecondLock ? gs.shapeshiftySecond : gs.shapeshiftyFirst
              if (oldTrait && lockMap[oldTrait]) {
                (gs as any)[lockMap[oldTrait]] -= 1
              }
              const trait = gs.choiceListResult[0] as string
              if (isSecondLock) gs.shapeshiftySecond = trait
              else gs.shapeshiftyFirst = trait
              if (lockMap[trait]) {
                (gs as any)[lockMap[trait]] += 1
              }

              textL('With some effort, you manage to gain control of that portion of your body, preventing it from shifting further from blood changes.')
              gs.choicePage = 1
              gs.levelUP--
              gs.shapeshiftyLevel++
              doEnd()
            }
          } else if (Math.floor((gs.shapeshiftyLevel + 2) / 3) > Math.floor(gs.shapeshiftyLevel / 3)) {
            // Susceptibility change
            viewButtonOutline(1,0,1,0,0,0,0,0,0,1,0,1)
            viewButtonText(1,0,1,0,0,0,0,0,0,1,0,1)
            textL('Would you like to increase or decrease your racial susceptibility by 10%?')
            // AS3 1:1: warn the player when they're already immune (changeMod 0)
            if (gs.changeMod === 0) {
              textLP("\r\rHowever, you're already immune to blood-type changes, so you cannot decrease it any further.")
              setButtonVisible(3, false)
            }
            buttonWrite(1, 'Increase')
            buttonWrite(3, 'Decrease')
            buttonWrite(10, 'Lay Egg')
            buttonWrite(12, 'Cancel')
            gs.doListen = () => {
              if (gs.buttonChoice === 1) {
                textL('You meditate and focus hard, riling up your blood and allowing it to become more influenced by change.')
                gs.changeMod += 0.1
              } else if (gs.buttonChoice === 3) {
                textL('You meditate and focus hard, calming your blood and bracing it against change.')
                gs.changeMod -= 0.1
              } else if (gs.buttonChoice === 10) {
                textL("You meditate and focus hard... but you're not sure what you're focusing on to begin with. You grunt and push...\r\r\r... *Ploop*\r\rFrom somewhere from between your legs, a single egg descends and gently falls to the ground.")
                itemAdd(219)
              } else if (gs.buttonChoice === 12) {
                doLevelUP()
                return
              }
              gs.choicePage = 1
              gs.levelUP--
              gs.shapeshiftyLevel++
              doEnd()
            }
          } else {
            // Blood type boost
            gs.choiceListArray = []
            textL('What blood-type would you like to increase?')
            if (gs.humanAffinity > 0)  gs.choiceListArray.push('Human')
            if (gs.horseAffinity > 0)  gs.choiceListArray.push('Equan')
            if (gs.wolfAffinity > 0)   gs.choiceListArray.push('Lupan')
            if (gs.catAffinity > 0)    gs.choiceListArray.push('Felin')
            if (gs.cowAffinity > 0)    gs.choiceListArray.push('Cow')
            if (gs.lizardAffinity > 0) gs.choiceListArray.push('Lizan')
            if (gs.rabbitAffinity > 0) gs.choiceListArray.push('Rabbit')
            if (gs.mouseAffinity > 0)  gs.choiceListArray.push('Mouse')
            if (gs.birdAffinity > 0)   gs.choiceListArray.push('Bird')
            if (gs.pigAffinity > 0)    gs.choiceListArray.push('Pig')
            if (gs.skunkAffinity > 0)  gs.choiceListArray.push('Skunk')
            if (gs.bugAffinity > 0)    gs.choiceListArray.push('Bug')
            choiceListButtons('Shapeshifty')
            gs.doListen = () => {
              choiceListSelect('Shapeshifty')
              const raceMap: Record<string, number> = {
                Human:1, Equan:2, Lupan:3, Felin:4, Cow:5, Lizan:6, Rabbit:7, Mouse:8, Bird:9, Pig:10, Skunk:11, Bug:12,
              }
              const r = gs.choiceListResult[0] as string
              if (raceMap[r]) aff(raceMap[r], 20, 0)
              if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Shapeshifty'); return }
              if (gs.buttonChoice === 12) { gs.choicePage = 1; doLevelUP(); return }
              textL('Breathing slowly and with intense focus, you reach deep within to strengthen an aspect of yourself...\r\rYou feel it stir and well up within.')
              gs.choicePage = 1
              gs.levelUP--
              gs.shapeshiftyLevel++
              doEnd()
            }
          }
        } else {
          doLevelUP()
        }
      }
    }

    // ── Fetish Master ───────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Fetish Master') {
      textL('For those who want to be the very best, Fetish Master allows you to collect all the kinks.\r\rEvery 4th level: Major kink (+30%, opposing -20%).\r\rEvery 3rd level: Moderate kink (+20%, opposing -10%).\r\rOtherwise: Minor kink (+10%).\r\rYou have ' + gs.fetishMasterLevel + ' levels in Fetish Master.')
      buttonConfirm()
      gs.doListen = () => {
        if (gs.buttonChoice === 6) {
          if (Math.floor((gs.fetishMasterLevel + 1) / 4) > Math.floor(gs.fetishMasterLevel / 4)) {
            // AS3 1:1: full per-fetish descriptions (TS port had only a header summary)
            textL('Major fetishes affect most sexual situations. Selecting one will increase your lust gained or lost by an additional 30%, but does so at the cost of an opposing fetish (decrease lust by 20%).')
            textLP('\r\rMale - Applies to sexual situations with males. Selecting it will reduce your female and herm fetishes.')
            textLP('\r\rFemale - Applies to sexual situations with females. Selecting it will reduce your male and herm fetishes.')
            textLP('\r\rHerm - Applies to sexual situation with hermaphrodites, people with both male and female parts. Selecting it will reduce your male and female fetishes.')
            textLP('\r\rNarcissist - Applies to sexual situations that only involve yourself. Selecting it will reduce your dependent fetish.')
            textLP('\r\rDependent - Applies to sexual situations that involve others with you. Selecting it will reduce your narcissist fetish.')
            viewButtonText(1,1,1,0,1,1,0,0,0,0,0,1)
            viewButtonOutline(1,1,1,0,1,1,0,0,0,0,0,1)
            buttonWrite(1, 'Male'); buttonWrite(2, 'Female'); buttonWrite(3, 'Herm')
            buttonWrite(5, 'Narcissist'); buttonWrite(6, 'Dependent'); buttonWrite(12, 'Cancel')
            gs.doListen = () => {
              if (gs.buttonChoice === 1)  { gs.maleFetish += .3; gs.femaleFetish -= .2; gs.hermFetish -= .1; textL('You now find pee-pees more attractive.') }
              if (gs.buttonChoice === 2)  { gs.femaleFetish += .3; gs.maleFetish -= .2; gs.hermFetish -= .1; textL('You now find vagoos more attractive.') }
              if (gs.buttonChoice === 3)  { gs.hermFetish += .3; gs.femaleFetish -= .2; gs.maleFetish -= .2; textL('You now find pee-pees and vagoos together more attractive.') }
              if (gs.buttonChoice === 5)  { gs.narcissistFetish += .3; gs.dependentFetish -= .2; textL('You now see yourself as more of a sexy devil.') }
              if (gs.buttonChoice === 6)  { gs.dependentFetish += .3; gs.narcissistFetish -= .2; textL('You now find yourself more needy of others.') }
              if (gs.buttonChoice === 12) { doLevelUP(); return }
              gs.levelUP--; gs.fetishMasterLevel++; doEnd()
            }
          } else if (Math.floor((gs.fetishMasterLevel + 1) / 3) > Math.floor(gs.fetishMasterLevel / 3)) {
            // AS3 1:1: full per-fetish descriptions
            textL('Moderate fetishes affect many sexual situations. Selecting one will increase your lust gained or lost by an additional 20%, but does so at the cost of an opposing fetish (decrease lust by 10%).')
            textLP('\r\rDominant - Applies to sexual situations where you are in charge. Selecting it will reduce your submissive fetish.')
            textLP('\r\rSubmissive - Applies to sexual situations where you are being dominated. Selecting it will reduce your dominant fetish.')
            textLP('\r\rLarge Breasts - Applies to sexual situations that involve relatively large breasts. Selecting it will reduce your small breasts fetish.')
            textLP('\r\rSmall Breasts- Applies to sexual situations that involve relatively small breasts. Selecting it will reduce your large breasts fetish.')
            textLP('\r\rFurry - Applies to sexual situations with fur-covered people. Selecting it will reduce your scaly and smoothy fetishes.')
            textLP('\r\rScaly - Applies to sexual situations with scale-covered people. Selecting it will reduce your furry and smoothy fetishes.')
            textLP('\r\rSmoothy - Applies to sexual situations with smooth skin-covered people. Selecting it will reduce your furry and scaly fetishes.')
            viewButtonText(1,1,0,0,1,1,0,0,1,1,1,1)
            viewButtonOutline(1,1,0,0,1,1,0,0,1,1,1,1)
            buttonWrite(1,'Dominant'); buttonWrite(2,'Submissive'); buttonWrite(5,'Large Boobs')
            buttonWrite(6,'Small Boobs'); buttonWrite(9,'Furry'); buttonWrite(10,'Scaly')
            buttonWrite(11,'Smoothy'); buttonWrite(12,'Cancel')
            gs.doListen = () => {
              if (gs.buttonChoice === 1)  { gs.dominantFetish += .2; gs.submissiveFetish -= .1; textL('You now enjoy stomping on people more.') }
              if (gs.buttonChoice === 2)  { gs.submissiveFetish += .2; gs.dominantFetish -= .1; textL('You now enjoy being told what to do more.') }
              if (gs.buttonChoice === 5)  { gs.lboobFetish += .2; gs.sboobFetish -= .1; textL('You now enjoy motorboating more.') }
              if (gs.buttonChoice === 6)  { gs.sboobFetish += .2; gs.lboobFetish -= .1; textL('You now find small dainty tatas more attractive.') }
              if (gs.buttonChoice === 9)  { gs.furryFetish += .2; gs.scalyFetish -= .1; gs.smoothyFetish -= .1; textL('You now enjoy cuddling up with fuzzies more.') }
              if (gs.buttonChoice === 10) { gs.scalyFetish += .2; gs.furryFetish -= .1; gs.smoothyFetish -= .1; textL('You now enjoy shiny, luxurious scales more.') }
              if (gs.buttonChoice === 11) { gs.smoothyFetish += .2; gs.scalyFetish -= .1; gs.furryFetish -= .1; textL('You now enjoy the feeling of smooth, soft skin more.') }
              if (gs.buttonChoice === 12) { doLevelUP(); return }
              gs.levelUP--; gs.fetishMasterLevel++; doEnd()
            }
          } else {
            // AS3 1:1: full per-fetish descriptions
            textL('Minor fetishes affect some sexual situations. Selecting one will increase your lust gained or lost by an additional 10%. They easily allow room for other fetishes, so they don\'t reduce others.')
            textLP('\r\rPregnancy - Applies to sexual situations where someone is pregnant.')
            textLP('\r\rBestiality - Applies to sexual situations with feral animals.')
            textLP('\r\rMilk - Applies to sexual situations that involve lactation.')
            textLP('\r\rSize - Applies to sexual situations where one person is significantly larger than the other.')
            textLP('\r\rUnbirthing - Applies to sexual situations that involve reverse-birthing.')
            textLP('\r\rOviposition - Applies to sexual situations where eggs are popping out.')
            textLP('\r\rToy - Applies to sexual situations with inanimate objects.')
            textLP('\r\rHyper - Applies to sexual situations where something is significantly bigger than usual.')
            viewButtonText(1,1,1,0,1,1,1,0,1,1,0,1)
            viewButtonOutline(1,1,1,0,1,1,1,0,1,1,0,1)
            buttonWrite(1,'Pregnancy'); buttonWrite(2,'Bestiality'); buttonWrite(3,'Milk')
            buttonWrite(5,'Size'); buttonWrite(6,'Unbirthing'); buttonWrite(7,'Oviposition')
            buttonWrite(9,'Toy'); buttonWrite(10,'Hyper'); buttonWrite(12,'Cancel')
            gs.doListen = () => {
              if (gs.buttonChoice === 1)  { gs.pregnancyFetish += .1; textL('You now enjoy big swollen baby-filled bellies more.') }
              if (gs.buttonChoice === 2)  { gs.bestialityFetish += .1; textL("You now enjoy 'doggy-style' being literal more.") }
              if (gs.buttonChoice === 3)  { gs.milkFetish += .1; textL('You now want to suck on those drippy milkbags more.') }
              if (gs.buttonChoice === 5)  { gs.sizeFetish += .1; textL('You now enjoy giants and tiny people more.') }
              if (gs.buttonChoice === 6)  { gs.unbirthingFetish += .1; textL('You now find the thought of being stuffed back into a womb more appealing.') }
              if (gs.buttonChoice === 7)  { gs.ovipositionFetish += .1; textL('You now find egg-laying to be more fun.') }
              if (gs.buttonChoice === 9)  { gs.toyFetish += .1; textL('You now enjoy the things you keep in your dresser drawer more.') }
              if (gs.buttonChoice === 10) { gs.hyperFetish += .1; textL('You now find absurd proportions more amusing.') }
              if (gs.buttonChoice === 12) { doLevelUP(); return }
              gs.levelUP--; gs.fetishMasterLevel++; doEnd()
            }
          }
        } else {
          doLevelUP()
        }
      }
    }

    // ── Super Perk ──────────────────────────────────────────────────────────
    if (gs.choiceListResult[0] === 'Super Perk') {
      // AS3 1:1: full per-perk descriptions (was abbreviated in TS port)
      textL('Super perks focuses the experience from 3 perks to apply a single major effect upon yourself. They can be taken as many times as you like, but cost 3 perks every time.\r')
      textLP('\r\rPure Blood - Choose a currently major blood type active within your body (at least 50% maximum or your dominant type). That blood type will get a slight boost while all other blood types will be purged from your body.')
      textLP('\r\rRegression - Your body regresses to a more childlike state.')
      textLP('\r\rBalance - Your primary stats are added together and evenly distributed amongst them all.')
      textLP('\r\rStamina Boost - Your body becomes fortified, increasing your maximum stamina by 15.')
      textLP('\r\rSex Reset - Choose a gender. All genitals not related to the chosen gender will be nullified, restoring you to a particular gender.')

      if (gs.levelUP < 3) {
        textLP('\r\rHowever, you do not have enough levels to achieve any of the perks.')
        viewButtonOutline(0,0,0,0,0,1,0,0,0,0,0,0)
        viewButtonText(0,0,0,0,0,1,0,0,0,0,0,0)
        buttonWrite(6, 'Back')
        gs.doListen = () => { if (gs.buttonChoice === 6) doLevelUP() }
        return
      }

      gs.choiceListArray = ['Pure Blood','Regression','Balance','Stam Boost','Sex Reset']
      choiceListButtons('Super Perks')
      gs.doListen = () => {
        choiceListSelect('Super Perks')
        if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Super Perks'); return }
        if (gs.buttonChoice === 12) { gs.choicePage = 1; doLevelUP(); return }

        // Pure Blood
        if (gs.choiceListResult[0] === 'Pure Blood') {
          textL('Pure Blood will allow you to select a single racial blood type to make pure, boosting it and flushing out all other blood types.\r\rAre you sure you want to spend 3 perks?')
          buttonConfirm()
          gs.doListen = () => {
            if (gs.buttonChoice === 6) {
              gs.choiceListArray = []
              const raceMap: Record<string, number> = {
                Human:1, Equan:2, Lupan:3, Felin:4, Cow:5, Lizan:6, Rabbit:7, Mouse:8, Bird:9, Pig:10, Skunk:11, Bug:12,
              }
              if (gs.humanAffinity > 50 || gs.dominant === 1)  gs.choiceListArray.push('Human')
              if (gs.horseAffinity > 50 || gs.dominant === 2)  gs.choiceListArray.push('Equan')
              if (gs.wolfAffinity > 50 || gs.dominant === 3)   gs.choiceListArray.push('Lupan')
              if (gs.catAffinity > 50 || gs.dominant === 4)    gs.choiceListArray.push('Felin')
              if (gs.cowAffinity > 50 || gs.dominant === 5)    gs.choiceListArray.push('Cow')
              if (gs.lizardAffinity > 50 || gs.dominant === 6) gs.choiceListArray.push('Lizan')
              if (gs.rabbitAffinity > 50 || gs.dominant === 7) gs.choiceListArray.push('Rabbit')
              if (gs.mouseAffinity > 50 || gs.dominant === 8)  gs.choiceListArray.push('Mouse')
              if (gs.birdAffinity > 50 || gs.dominant === 9)   gs.choiceListArray.push('Bird')
              if (gs.pigAffinity > 50 || gs.dominant === 10)   gs.choiceListArray.push('Pig')
              if (gs.skunkAffinity > 50 || gs.dominant === 11) gs.choiceListArray.push('Skunk')
              if (gs.bugAffinity > 50 || gs.dominant === 12)   gs.choiceListArray.push('Bug')
              choiceListButtons('Pure Blood')
              textL('Select the racial blood type you would like to purify.')
              gs.doListen = () => {
                choiceListSelect('Pure Blood')
                if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Pure Blood'); return }
                if (gs.buttonChoice === 12) { gs.choicePage = 1; doLevelUP(); return }
                textL('You take a moment to focus, channeling the experience you have gained to single out the blood coursing through your body...')
                const r = gs.choiceListResult[0] as string
                if (raceMap[r]) aff(raceMap[r], 10, -1000)
                gs.levelUP -= 3
                doEnd()
              }
            } else { doLevelUP() }
          }
        }

        // Regression
        if (gs.choiceListResult[0] === 'Regression') {
          textL('Regression will cause your body to regress to a more childlike state, reducing your height by half (min 3 inches) and giving you a childlike figure. Decreases strength and mentality by 3, increases libido and sensitivity by 5.\r\rAre you sure you want to spend 3 perks?')
          buttonConfirm()
          gs.doListen = () => {
            if (gs.buttonChoice === 6) {
              textL("You take a moment to focus, channeling the experience you have gained to return your body to a more youthful state. You close your eyes and concentrate, feeling your skin brush across the inside of your clothes as you shrink within.\r\rBy the time you open your eyes, wispy steam floats off of you from the energy you expelled. Your body has reverted to a less aged state, your muscles and mind weaker, but your nerves and arousal stronger.")
              if (gs.tallness > 5) {
                textLP("\r\rThere's also the slight problem of your clothes barely hanging onto you. You quickly grab the fabric before it falls away and dash to the tailor for a re-fitting.")
                gs.hrs += 1
              }
              gs.tallness -= Math.floor(gs.tallness / 2)
              gs.body = 5
              stats(-3, -3, 5, 5)
              gs.levelUP -= 3
              doEnd()
            } else { gs.choicePage = 1; doLevelUP() }
          }
        }

        // Balance
        if (gs.choiceListResult[0] === 'Balance') {
          textL('Balance will redistribute your primary stats evenly.\r\rAre you sure you want to spend 3 perks?')
          buttonConfirm()
          gs.doListen = () => {
            if (gs.buttonChoice === 6) {
              textL('You take a moment to focus, channeling the experience you have gained to achieve a state of balance within your body. Several sensations begin to whirl around you until they finally settle.')
              const tempInt = Math.ceil((gs.str + gs.ment + gs.lib + gs.sen) / 4)
              gs.strength = 0; gs.mentality = 0; gs.libido = 0; gs.sensitivity = 0
              stats(tempInt, tempInt, tempInt, tempInt)
              gs.levelUP -= 3
              doEnd()
            } else { gs.choicePage = 1; doLevelUP() }
          }
        }

        // Stam Boost
        if (gs.choiceListResult[0] === 'Stam Boost') {
          textL('Stamina Boost will give you a permanent +15 to your maximum stamina points.\r\rAre you sure you want to spend 3 perks?')
          buttonConfirm()
          gs.doListen = () => {
            if (gs.buttonChoice === 6) {
              textL("You take a moment to focus, channeling the experience you have gained to fortify your body from harm. It doesn't really take long, and once finished you feel... much healthier.")
              gs.HPMod += 15
              doHP(15)
              gs.levelUP -= 3
              doEnd()
            } else { gs.choicePage = 1; doLevelUP() }
          }
        }

        // Sex Reset
        if (gs.choiceListResult[0] === 'Sex Reset') {
          textL('Sex Reset will allow you to select a gender (male, female, or herm) and nullify all genitals not belonging to that gender and all excess genitals. Breasts are not affected.\r\rAre you sure you want to spend 3 perks?')
          buttonConfirm()
          gs.doListen = () => {
            if (gs.buttonChoice === 6) {
              viewButtonOutline(0,0,0,0,1,1,1,0,0,0,0,1)
              viewButtonText(0,0,0,0,1,1,1,0,0,0,0,1)
              buttonWrite(5,'Male'); buttonWrite(6,'Female'); buttonWrite(7,'Herm'); buttonWrite(12,'Cancel')
              textL('Which gender would you like to reset to?')
              gs.doListen = () => {
                textL('You take a moment to focus, channeling the experience you have gained to adjust your sex...')
                if (gs.buttonChoice === 5) {
                  vagChange(0, -gs.vagTotal)
                  if (gs.cockTotal > 1) cockChange(0, -(gs.cockTotal - 1))
                  if (gs.balls > 2) { textLP('\r\rWithin your scrotum, you feel your extra testicles begin to shrink until they vanish, leaving you with a single pair.'); gs.balls = 2 }
                }
                if (gs.buttonChoice === 6) {
                  if (gs.vagTotal > 1) vagChange(0, -(gs.vagTotal - 1))
                  cockChange(0, -gs.cockTotal)
                }
                if (gs.buttonChoice === 7) {
                  if (gs.vagTotal > 1) vagChange(0, -(gs.vagTotal - 1))
                  if (gs.cockTotal > 1) cockChange(0, -(gs.cockTotal - 1))
                  if (gs.balls > 2) { textLP('\r\rWithin your scrotum, you feel your extra testicles begin to shrink until they vanish, leaving you with a single pair.'); gs.balls = 2 }
                }
                if (gs.buttonChoice === 12) { doLevelUP(); return }
                gs.levelUP -= 3
                doEnd()
              }
            } else { gs.choicePage = 1; doLevelUP() }
          }
        }
      }
    }
  }
}
