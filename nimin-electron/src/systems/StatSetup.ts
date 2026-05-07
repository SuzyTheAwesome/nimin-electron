/**
 * StatSetup.ts
 * Ported from StatSetup.as
 * Initializes all stats to starting values when a new game begins.
 */

import { gs } from '../core/GameState.ts'
import { bagSlotAdd, stashSlotAdd } from './Inventory.ts'

export function startStats(): void {
  // Character general stats
  gs.str  = 15
  gs.ment = 15
  gs.lib  = 15
  gs.sen  = 15
  gs.HP   = 5
  gs.lust = 0
  gs.coin = 0
  gs.strMod = 0
  gs.mentMod = 0
  gs.libMod = 0
  gs.senMod = 0
  gs.hunger = 0

  // Time stats
  gs.day = 0
  gs.hour = 8

  // Equipment
  gs.attireTop = 1
  gs.attireBot = 2
  gs.weapon = 10

  // Base body stats
  gs.gender = 1
  gs.race = 1
  gs.body = 15
  gs.dominant = 1
  gs.hips = 1
  gs.butt = 1
  gs.tallness = 60
  gs.skinType = 1
  gs.tail = 0
  gs.ears = 1
  gs.hair = 0
  gs.hairLength = 0
  gs.hairColor = 0
  // AS3 inherited bug fix: original default was 1 (digitigrade cat-paws), but
  // no race init in Intro overrides this, so every new character — including
  // humans — got the cat-paws description. legType 0 = plain plantigrade feet
  // (the sensible human default); Lupan/Felin race inits below set 1 explicitly.
  gs.legType = 0
  gs.wings = 0
  gs.faceType = 10
  gs.skinColor = 0

  // Phallic stats
  gs.cockTotal = 0
  gs.humanCocks = 0
  gs.horseCocks = 0
  gs.wolfCocks = 0
  gs.catCocks = 0
  gs.lizardCocks = 0
  gs.rabbitCocks = 0
  gs.cockSize = 0
  gs.cockMoist = 0
  gs.balls = 0
  gs.ballSize = 0
  gs.showBalls = true
  gs.knot = false
  gs.bugCocks = 0

  // Mammary stats
  gs.breastSize = 0
  gs.boobTotal = 2
  gs.nippleSize = 1
  gs.udders = false
  gs.udderSize = 0
  gs.teatSize = 0
  gs.clitSize = 0
  gs.vagTotal = 0
  gs.vagSize = 0
  gs.vagMoist = 0
  gs.vulvaSize = 0
  // AS3 inherited bug fix: original default was 1 (cow four-nub nipples), but
  // no race init overrides it, so every new character displayed "With four
  // nubs each, your breasts look quite similar to cows' udders." nipType 0 =
  // plain nipples (sensible human/non-cow default); cow TFs set 1, lizard 2.
  gs.nipType = 0

  // Stat modifiers
  gs.runMod = 0
  gs.rapeMod = 0
  gs.cumMod = 1
  gs.cockSizeMod = 1
  gs.vagSizeMod = 1
  gs.vagElastic = 1
  gs.milkMod = 0
  gs.carryMod = 0
  gs.vagBellyMod = 0
  gs.pregChanceMod = 0
  gs.extraPregChance = 0
  gs.pregTimeMod = 0
  gs.enticeMod = 0
  gs.milkHPMod = 0
  gs.changeMod = 1
  gs.HPMod = 0
  gs.SexPMod = 1
  gs.minLust = 0
  gs.milkCap = 0
  gs.coinMod = 0
  gs.hipMod = 1
  gs.buttMod = 1
  gs.bellyMod = 0
  gs.cockMoistMod = 0
  gs.vagMoistMod = 0
  gs.lockTail = 0
  gs.lockFace = 0
  gs.lockSkin = 0
  gs.lockBreasts = 0
  gs.lockEars = 0
  gs.lockLegs = 0
  gs.lockNipples = 0
  gs.lockCock = 0
  gs.breastSizeMod = 1
  gs.nippleSizeMod = 1
  gs.nipNarrowMod = 1.07
  gs.cockNarrowMod = 1.3
  gs.clitNarrowMod = 1.5
  gs.ballSizeMod = 1

  // Time-based statuses
  gs.pregArray = []
  gs.pregStatus = 0
  gs.pregnancyTime = 0
  gs.pregRate = 1
  gs.eggLaying = 0
  gs.eggMaxTime = 0
  gs.eggTime = 0
  gs.eggRate = 0
  gs.exhaustion = 0
  gs.exhaustionPenalty = 0
  gs.milkEngorgement = 0
  gs.milkEngorgementLevel = 0
  gs.udderEngorgement = 0
  gs.udderEngorgementLevel = 0
  gs.heat = 0
  gs.heatTime = 0
  gs.heatMaxTime = 0
  gs.lactation = 0
  gs.udderLactation = 0
  gs.nipplePlay = 0
  gs.udderPlay = 0
  gs.blueBalls = 0
  gs.teatPump = 0
  gs.nipPump = 0
  gs.cockPump = 0
  gs.clitPump = 0
  gs.vulvaPump = 0
  gs.masoPot = 0
  gs.sMasoPot = 0
  gs.babyFree = 0
  gs.charmTime = 0
  gs.pheromone = 0
  gs.eggceleratorTime = 0
  gs.eggceleratorDose = 0
  gs.bodyOil = 0
  gs.lustPenalty = 0
  gs.snuggleBall = false
  gs.fertileGel = 0
  gs.eggType = 0
  gs.milkSuppressant = 0
  gs.milkSuppressantLact = 0
  gs.milkSuppressantUdder = 0
  gs.suppHarness = false
  gs.fertilityStatueCurse = 0
  gs.plumpQuats = 0
  gs.lilaWetStatus = 0
  gs.cockSnakePreg = 0
  gs.milkCPoisonNip = 0
  gs.milkCPoisonUdd = 0
  gs.cockSnakeVenom = 0

  // Race affinities
  gs.humanAffinity = 0
  gs.horseAffinity = 0
  gs.wolfAffinity = 0
  gs.catAffinity = 0
  gs.cowAffinity = 0
  gs.lizardAffinity = 0
  gs.rabbitAffinity = 0
  gs.fourBoobAffinity = 0
  gs.mouseAffinity = 0
  gs.birdAffinity = 0
  gs.pigAffinity = 0
  gs.twoBoobAffinity = 0
  gs.sixBoobAffinity = 0
  gs.eightBoobAffinity = 0
  gs.tenBoobAffinity = 0
  gs.cowTaurAffinity = 0
  gs.humanTaurAffinity = 0
  gs.skunkAffinity = 0
  gs.bugAffinity = 0

  // Leveling
  gs.SexP = 0
  gs.levelUP = 0
  gs.level = 0
  gs.babyFactLevel = 0
  gs.bodyBuildLevel = 0
  gs.hyperHappyLevel = 0
  gs.alchemistLevel = 0
  gs.fetishMasterLevel = 0
  gs.milkMaidLevel = 0
  gs.shapeshiftyLevel = 0
  gs.shapeshiftyFirst = ''
  gs.shapeshiftySecond = ''

  // NPC stats
  gs.lilaRep = 0
  gs.lilaVulva = 0
  gs.lilaMilk = 0
  gs.lilaPreg = -2
  gs.malonRep = 0
  gs.malonPreg = 0
  gs.malonChildren = 0
  gs.mistressRep = 0
  gs.jamieRep = 0
  gs.jamieSize = 4
  gs.jamieChildren = 0
  gs.silRep = 0
  gs.silPreg = 0
  gs.silRate = 0
  gs.silLay = 10
  gs.silTied = false
  gs.silGrowthTime = 0
  gs.lilaUB = false
  gs.dairyFarmBrand = false
  gs.jamieRep1 = 0
  gs.jamieRep2 = 0
  gs.jamieRep3 = 0
  gs.lilaWetness = 0

  // Alchemy knowledge
  gs.knowLustDraft = false
  gs.knowRejuvPot = false
  gs.knowExpPreg = false
  gs.knowBallSwell = false
  gs.knowMaleEnhance = false
  gs.knowSLustDraft = false
  gs.knowSRejuvPot = false
  gs.knowSExpPreg = false
  gs.knowSBallSwell = false
  gs.knowGenSwap = false
  gs.knowMasoPot = false
  gs.knowBabyFree = false
  gs.knowPotPot = false
  gs.knowMilkSuppress = false
  gs.knowSGenSwap = false
  gs.knowSMasoPot = false
  gs.knowSBabyFree = false
  gs.knowSPotPot = false
  gs.knowPussJuice = false
  gs.knowPheromone = false
  gs.knowBazoomba = false

  // Fetishes
  gs.maleFetish = 1
  gs.femaleFetish = 1
  gs.hermFetish = 1
  gs.narcissistFetish = 1
  gs.dependentFetish = 1
  gs.dominantFetish = 1
  gs.submissiveFetish = 1
  gs.lboobFetish = 1
  gs.sboobFetish = 1
  gs.furryFetish = 1
  gs.scalyFetish = 1
  gs.smoothyFetish = 1
  gs.pregnancyFetish = 1
  gs.bestialityFetish = 1
  gs.milkFetish = 1
  gs.sizeFetish = 1
  gs.unbirthingFetish = 1
  gs.ovipositionFetish = 1
  gs.toyFetish = 1
  gs.hyperFetish = 1

  // Children
  gs.currentDayCare = 0
  gs.humanChildren = 0
  gs.equanChildren = 0
  gs.lupanChildren = 0
  gs.felinChildren = 0
  gs.cowChildren = 0
  gs.lizanEggs = 0
  gs.lizanChildren = 0
  gs.bunnionChildren = 0
  gs.wolfPupChildren = 0
  gs.miceChildren = 0
  gs.birdEggs = 0
  gs.birdChildren = 0
  gs.pigChildren = 0
  gs.calfChildren = 0
  gs.bugEggs = 0
  gs.bugChildren = 0
  gs.skunkChildren = 0
  gs.minotaurChildren = 0
  gs.freakyGirlChildren = 0

  // Tracking
  gs.currentState = 0
  gs.currentZone = 0
  gs.inBag = false
  gs.inShop = false
  gs.inDungeon = false
  gs.currentDungeon = 0

  // Progress
  gs.foundSoftlik = false
  gs.foundFirmshaft = false
  gs.foundTieden = false
  gs.foundSizCalit = false
  gs.foundOviasis = false
  gs.foundValley = false
  gs.foundSanctuary = false
  gs.defeatedMinotaur = false
  gs.defeatedFreakyGirl = false
  gs.defeatedSuccubus = false
  gs.firstExplore = false

  // Inventory
  gs.bagPage = 1
  gs.bagArray = []
  gs.bagStackArray = []
  bagSlotAdd(27)
  gs.stashArray = []
  gs.stashStackArray = []
  stashSlotAdd(27)
}

/** stats(str, men, lib, sen) - add race/body bonuses to base stats */
export function stats(s: number, m: number, l: number, sen: number): void {
  gs.strength += s
  gs.mentality += m
  gs.libido += l
  gs.sensitivity += sen
}
