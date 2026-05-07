/**
 * Intro.ts
 * Ported from Intro.as
 * New game flow: race → gender → body type → starting description → world.
 */

import { gs, bc } from '../core/GameState.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import { viewButtonText, viewButtonOutline, buttonWrite, doNext, buttonConfirm } from '../ui/ButtonManager.ts'
import { statDisplay, showStatBar, regionChange, sideHide, toggleSide } from '../ui/UIManager.ts'
import { startStats, stats } from '../systems/StatSetup.ts'
import { doHP, doSexP } from '../systems/Leveling.ts'
import { doReturn } from '../core/GameEngine.ts'
import { percent } from '../core/GameUtilities.ts'

// Forward ref set by main.ts
let doGeneral: () => void = () => {}
export function setDoGeneral(fn: () => void): void { doGeneral = fn }

// ── newGameGo ──────────────────────────────────────────────────────────────

export function newGameGo(): void {
  buttonConfirm()
  textL('Are you sure you would like to start a new game?')
  if (gs.currentState === 0) {
    const btn7 = document.getElementById('btn-7')
    if (btn7) btn7.classList.add('hidden')
  }
  gs.doListen = function() {
    if (gs.buttonChoice === 6) {
      showStatBar()
      startStats()
      doRace()
    } else {
      doReturn()
    }
  }
}

// ── doRace ────────────────────────────────────────────────────────────────

function doRace(): void {
  bc()
  viewButtonText(1,0,1,0,0,1,0,0,1,0,1,0)
  viewButtonOutline(1,0,1,0,0,1,0,0,1,0,1,0)
  buttonWrite(1, 'Equan')
  buttonWrite(3, 'Lupan')
  buttonWrite(6, 'Human')
  buttonWrite(9, 'Felin')
  buttonWrite(11, 'Lizan')

  textL('Choose which race you want to be:')
  textLP('\r\rHuman - A race supposedly descendant of apes, their curious minds are more open to change and their skin is slightly more sensitive.')
  textLP('\r\rEquan - A race supposedly descendant of horses, their large genitals make them slightly more sexual and their muscles are more powerful.')
  textLP('\r\rLupan - A race supposedly descendant of wolves, their lean bodies are stronger and their minds more quick-witted.')
  textLP('\r\rFelin - A race supposedly descendant of cats, their lust-driven society makes them a bit more sexual and sensitive.')
  textLP('\r\rLizan - A race supposedly descendant of some kind of reptile, their desert-adapted bodies have made them stronger, but they\'re still careful as their scales make them somewhat sensitive.')

  gs.doListen = function() {
    gs.boobTotal = 2
    if (gs.buttonChoice === 6) {
      gs.race = 1; gs.changeMod += 0.5; gs.currentZone = 1; gs.foundSoftlik = true
      gs.humanAffinity = 50; gs.dominant = 1; gs.ears = 1; gs.skinType = 1; gs.faceType = 10
      gs.strength = 15; gs.mentality = 17; gs.libido = 15; gs.sensitivity = 17
      doGender()
    }
    if (gs.buttonChoice === 1) {
      gs.race = 2; gs.foundFirmshaft = true; gs.currentZone = 2; gs.horseAffinity = 50
      gs.cockSizeMod += 1; gs.cockNarrowMod += 0.5; gs.vagSizeMod += 1
      gs.dominant = 2; gs.tail = 2; gs.ears = 2; gs.skinType = 2; gs.faceType = 20
      gs.strength = 17; gs.mentality = 15; gs.libido = 17; gs.sensitivity = 15; gs.tallness = 4
      doGender()
    }
    if (gs.buttonChoice === 3) {
      gs.race = 3; gs.foundTieden = true; gs.currentZone = 3; gs.wolfAffinity = 50
      gs.knot = true; gs.boobTotal = 6; gs.dominant = 3; gs.tail = 3; gs.ears = 3
      gs.skinType = 2; gs.faceType = 30; gs.strength = 17; gs.mentality = 17
      gs.libido = 15; gs.sensitivity = 15; gs.tallness = -2
      gs.legType = 1 // wolf: digitigrade paws (was inherited from buggy startStats default)
      doGender()
    }
    if (gs.buttonChoice === 9) {
      gs.race = 4; gs.foundSizCalit = true; gs.currentZone = 4; gs.catAffinity = 50
      gs.dominant = 4; gs.heat++; gs.heatMaxTime = 96; gs.heatTime = 96; gs.boobTotal = 6
      gs.tail = 4; gs.ears = 4; gs.skinType = 2; gs.faceType = 40
      gs.strength = 15; gs.mentality = 15; gs.libido = 17; gs.sensitivity = 17; gs.tallness = -3
      gs.legType = 1 // cat: digitigrade paws (was inherited from buggy startStats default)
      doGender()
    }
    if (gs.buttonChoice === 11) {
      gs.race = 6; gs.foundOviasis = true; gs.currentZone = 6; gs.lizardAffinity = 50
      gs.dominant = 6; gs.eggLaying = 1; gs.eggTime = 36; gs.eggMaxTime = 36
      gs.tail = 6; gs.ears = 6; gs.skinType = 3; gs.faceType = 60
      gs.strength = 17; gs.mentality = 16; gs.libido = 15; gs.sensitivity = 16; gs.tallness = 2
      doGender()
    }
  }
}

// ── doGender ──────────────────────────────────────────────────────────────

function doGender(): void {
  gs.currentDayCare = gs.dominant
  statDisplay()
  viewButtonText(0,0,0,0,1,1,1,0,0,0,0,0)
  viewButtonOutline(0,0,0,0,1,1,1,0,0,0,0,0)
  buttonWrite(5, 'Male')
  buttonWrite(6, 'Female')
  buttonWrite(7, 'Herm')
  textL('Choose which gender you want to be:\r\rMale - You has painus!\r\rFemale - You has vagoo!\r\rHerm - You has painus and vagoo!')

  gs.doListen = function() {
    if (gs.buttonChoice === 5) gs.gender = 1
    if (gs.buttonChoice === 6) gs.gender = 2
    if (gs.buttonChoice === 7) gs.gender = 3

    if (gs.gender === 1) {
      gs.cockSize = 12; gs.ballSize = 4; gs.balls = 2; gs.cockTotal = 1; gs.cockMoist = 1
      gs.strength++
      if (gs.dominant === 1) gs.humanCocks = 1
      if (gs.dominant === 2) gs.horseCocks = 1
      if (gs.dominant === 3) gs.wolfCocks = 1
      if (gs.dominant === 4) gs.catCocks = 1
      if (gs.dominant === 6) { gs.lizardCocks = 2; gs.cockTotal++ }
    }
    if (gs.gender === 2) {
      gs.vagSize = 12; gs.vulvaSize = 5; gs.pregArray = [false, 0, 0, 0, 0]
      gs.vagTotal = 1; gs.vagMoist = 1; gs.clitSize = 2; gs.mentality++
    }
    if (gs.gender === 3) {
      gs.cockSize = 8; gs.ballSize = 2; gs.balls = 2; gs.cockTotal = 1; gs.cockMoist = 1
      gs.pregArray = [false, 0, 0, 0, 0]; gs.vagTotal = 1; gs.vagMoist = 1
      gs.vagSize = 8; gs.vulvaSize = 3
      if (gs.dominant === 1) gs.humanCocks = 1
      if (gs.dominant === 2) gs.horseCocks = 1
      if (gs.dominant === 3) gs.wolfCocks = 1
      if (gs.dominant === 4) gs.catCocks = 1
      if (gs.dominant === 6) { gs.lizardCocks = 2; gs.cockTotal++ }
      gs.libido++
    }
    bodyType()
  }
}

// ── bodyType ──────────────────────────────────────────────────────────────

function bodyType(): void {
  statDisplay()
  if (gs.gender === 1) {
    viewButtonOutline(1,0,1,0,1,0,1,0,0,1,0,0)
    viewButtonText(1,0,1,0,1,0,1,0,0,1,0,0)
    buttonWrite(1, 'Bodybuilder'); buttonWrite(3, 'Average')
    buttonWrite(5, 'Cunt Boy');   buttonWrite(7, 'Femme Boy')
    buttonWrite(10, 'Childlike')
  }
  if (gs.gender === 2) {
    viewButtonOutline(0,1,1,0,1,0,0,0,0,1,0,0)
    viewButtonText(0,1,1,0,1,0,0,0,0,1,0,0)
    buttonWrite(2, 'Bodybuilder'); buttonWrite(3, 'Voluptuous')
    buttonWrite(5, 'Average');     buttonWrite(10, 'Childlike')
  }
  if (gs.gender === 3) {
    viewButtonOutline(0,1,0,0,1,1,0,0,0,1,0,0)
    viewButtonText(0,1,0,0,1,1,0,0,0,1,0,0)
    buttonWrite(2, 'Bodybuilder'); buttonWrite(5, 'Masculine')
    buttonWrite(6, 'Feminine');    buttonWrite(10, 'Childlike')
  }
  textL('Choose your body type. Types determine height and a few beginning characteristics.')

  gs.doListen = function() {
    const bc = gs.buttonChoice
    if (gs.gender === 1) {
      if (bc === 1)  { gs.body=29; gs.hips=4; gs.butt=4; gs.tallness=70+Math.floor(percent()/10); gs.strength+=1; stats(0,0,0,0); doStartingDescription() }
      // AS3 inherited bug fix: original tallness=68+percent/10 gives 68-77 (5'8"-6'5"),
      // but the "Average" male body type is documented as 6'0"-6'5". Use 72+percent/20
      // so percent 1-100 maps to 72-77 inches inclusive (6'0" to 6'5").
      if (bc === 3)  { gs.body=20; gs.hips=3; gs.butt=3; gs.tallness=72+Math.floor(percent()/20); gs.libido+=1;   stats(0,0,0,0); doStartingDescription() }
      if (bc === 5)  {
        gs.body=20; gs.hips=3; gs.butt=3; gs.tallness=68+Math.floor(percent()/10); gs.libido+=1; stats(0,0,0,0)
        gs.cockSize=0; gs.ballSize=0; gs.balls=0; gs.cockTotal=0; gs.cockMoist=0
        gs.humanCocks=0; gs.horseCocks=0; gs.wolfCocks=0; gs.catCocks=0; gs.lizardCocks=0
        gs.vagSize=8; gs.vulvaSize=3; gs.pregArray=[false,0,0,0,0]; gs.gender=2
        gs.vagTotal=1; gs.vagMoist=1; gs.clitSize=2
        doStartingDescription()
      }
      // AS3 inherited bug fix: AS3 starter set breastSize=4 which produces a
      // bustRatio of ~1.06-1.08 ("nearly flat"/"perky"/"palmable") and a
      // displayed bust of 2 inches — but the documented design intent for
      // "Femme Boy" is a 1-inch flat chest. breastSize=2 yields ratio ≈ 1.02
      // ("flat") and 1-inch display, matching expected output.
      if (bc === 7)  { gs.body=15; gs.hips=7; gs.butt=6; gs.breastSize=2; gs.nippleSize=2; gs.tallness=60+Math.floor(percent()/10); gs.sensitivity+=1; stats(0,0,0,0); doStartingDescription() }
      if (bc === 10) { gs.body=7;  gs.hips=1; gs.butt=2; gs.tallness=42+Math.floor(percent()/10); gs.sensitivity+=2; gs.mentality-=2; gs.strength-=4; gs.libido+=2; gs.cockSize=6; gs.cockMoist=1; gs.ballSize=2; stats(0,0,0,0); doStartingDescription() }
    }
    if (gs.gender === 2) {
      if (bc === 2)  { gs.body=29; gs.hips=5; gs.butt=4; gs.tallness=68+Math.floor(percent()/10); gs.breastSize=4; gs.nippleSize=4; gs.strength+=1; stats(0,0,0,0); doStartingDescription() }
      if (bc === 3)  { gs.body=16; gs.hips=9; gs.butt=6; gs.tallness=60+Math.floor(percent()/10); gs.breastSize=10; gs.nippleSize=10; gs.libido+=2; stats(0,0,0,0); doStartingDescription() }
      if (bc === 5)  { gs.body=13; gs.hips=6; gs.butt=5; gs.tallness=60+Math.floor(percent()/10); gs.breastSize=6; gs.nippleSize=6; gs.mentality+=1; stats(0,0,0,0); doStartingDescription() }
      if (bc === 10) { gs.body=7;  gs.hips=2; gs.butt=2; gs.tallness=41+Math.floor(percent()/10); gs.sensitivity+=2; gs.mentality-=2; gs.strength-=4; gs.libido+=2; gs.vagSize=6; gs.breastSize=2; gs.nippleSize=2; gs.vulvaSize=2; gs.clitSize=1; gs.vagMoist=1; stats(0,0,0,0); doStartingDescription() }
    }
    if (gs.gender === 3) {
      if (bc === 2)  { gs.body=29; gs.hips=4; gs.butt=4; gs.tallness=68+Math.floor(percent()/10); gs.breastSize=5; gs.nippleSize=6; gs.strength+=1; stats(0,0,0,0); doStartingDescription() }
      if (bc === 5)  { gs.body=19; gs.hips=3; gs.butt=3; gs.tallness=62+Math.floor(percent()/10); gs.breastSize=2; gs.nippleSize=2; gs.libido+=1; stats(0,0,0,0); doStartingDescription() }
      if (bc === 6)  { gs.body=14; gs.hips=5; gs.butt=4; gs.tallness=58+Math.floor(percent()/10); gs.breastSize=6; gs.nippleSize=6; gs.mentality+=1; stats(0,0,0,0); doStartingDescription() }
      if (bc === 10) { gs.body=7;  gs.hips=2; gs.butt=2; gs.tallness=42+Math.floor(percent()/10); gs.sensitivity+=2; gs.mentality-=2; gs.strength-=4; gs.libido+=2; gs.cockSize=4; gs.cockMoist=1; gs.ballSize=1; gs.vagSize=4; gs.clitSize=1; gs.vagMoist=1; gs.vulvaSize=1; gs.breastSize=1; gs.nippleSize=1; stats(0,0,0,0); doStartingDescription() }
    }
  }
}

// ── doStartingDescription ─────────────────────────────────────────────────

function doStartingDescription(): void {
  regionChange(gs.currentZone)
  dayTime(0)
  doHP(10000)
  doSexP(0)

  textL('\r"...Hello?"')
  doNext()
  gs.doListen = function() {
    textL('\r\r"...Can anybody hear me?"')
    doNext()
    gs.doListen = function() {
      textL('\r\r\r"Please... I know you are still young... You still do not know the world... But... It is almost ready again..."')
      doNext()
      gs.doListen = function() {
        textL('\r\r\r\r"I am so tired..."\r\r"...Please..."')
        doNext()
        gs.doListen = function() {
          textL('\r\r\r\r\r"S\u231Eæ\u263C m\u00B1\u00A5\u00A7 me..."')
          doNext()
          gs.doListen = function() {
            // AS3 1:1: full opening monologue (TS port had abbreviated it).
            textL('Ugh... You awaken from that dream for the fifth time this month. That soft, gentle voice echoes around your mind. A numbing dream with nothing to keep your attention. Something about a tower... Not a dream about flying or fleeing, nor school nor sex. Just this bland dream that you can remember better than all the rest. And yet you can never recall those last words...\r\rIt\'s been a few months since you started having that dream and it\'s been growing in frequency. Just so... annoying. Makes you feel anxious and antsy, like there is something missing in your life.\r\rLife isn\'t bad in ')
            // AS3 1:1: per-race city descriptions (full text restored from AS3)
            if (gs.race === 1) textLP('Softlik, though. The houses of wood and stone are comfortable, safe, and stable. The rolling hills around the city are quite beautiful. Lots of people in town are coming up with new potions or inventions, and with humans being so prone to being changed by the outside world of Nimin, there\'s rarely a dull moment.')
            if (gs.race === 2) textLP('Firmshaft, though. The large canvas tents provide plenty of room for harems filled with the large genitals equans are most notable for, with plenty of airflow to keep things from getting too hot. The broad plains allow for lots of trotting and races. Between the warmth and the plentiful activity, there\'s always great sex and comfort around here, with little need to venture into the outside world of Nimin.')
            if (gs.race === 3) textLP('Tieden, though. The wooden buildings and surrounding walls provide plenty of security from the outside world of Nimin, all the forest and jungle around filled with dangers. Not that there\'s any reason to be afraid; with the training and constant vigil, lupans are great at handling their foes. Especially when it comes to "handling" them. Plus letting off steam around here tends to be rather enjoyable.')
            if (gs.race === 4) textLP('Siz\'Calit, though. The tree-borne huts and bridges admist the canopy of the jungle allows for plenty of breezes and pleasant napping spots in the hot and humid area. And with so many felin females going into heat and craving sex, it\'s difficult to tell if the humidity is from the jungle itself or the kinky activity within. It\'s hard to imagine a sex-crazed felin surviving long in the outside world on Nimin.')
            if (gs.race === 6) textLP('Oviasis, though. The rock-hewn homes built into the sides of the surrounding cliffs provide plenty of insulation against the warm days and cool nights of the desert. This small oasis of paradise in the middle of nowhere provides plenty of ways to lounge, allowing the lizan people to soak in the sun and the women to casually lay their eggs. This near-resort is usually much more pleasant than the outside world of Nimin.')
            textLP('\r\rBut that dream...')
            doNext()
            gs.doListen = function() {
              // AS3 1:1: full "venturing out" monologue
              textL('It isn\'t unheard of to go venturing out. In fact, you know there are other civilizations around, separated by the strange wilderness. Explorers of other races have come and visited from time to time. A rarity and always so interesting in how they look and act, so diverse from your own people.\r\rAlthough, they do make you wonder... Why don\'t you see them more often? They seem to enjoy visiting, after all. There\'s no history of hate or trouble between the peoples. Although, the recorded history only goes back a few generations, so who knows what could have happened centuries ago...\r\rOh well.')
              doNext()
              gs.doListen = function() {
                textL('You finally get out of bed and start your day. And after that dream, you just can\'t seem to shake the feeling that there\'s more to this life, this world... The dangerously odd world of Nimin.')
                doNext()
                gs.doListen = function() {
                  toggleSide()
                  toggleSide()
                  const opt7 = document.getElementById('btn-toggle-side')
                  if (opt7) opt7.classList.remove('hidden')
                  gs.currentState = 1
                  doGeneral()
                }
              }
            }
          }
        }
      }
    }
  }
}

// ── dayTime stub (wired up from Sleep.ts via main.ts) ─────────────────────
let dayTime: (n: number) => void = () => {}
export function setDayTime(fn: (n: number) => void): void { dayTime = fn }
