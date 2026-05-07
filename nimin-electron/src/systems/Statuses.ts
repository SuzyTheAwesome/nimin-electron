// Ported from Statuses.as
import { gs } from '../core/GameState.ts';
import { textL, textLP } from '../ui/TextRenderer.ts';
import { percent } from '../core/GameUtilities.ts';
import { statsMod, doLust, statDisplay } from './StatChanges.ts';
import { pregCheck } from './Pregnancy.ts';
import {
  oneYour, vulvaDesc, legDesc, legVerb,
  bellyDesc, skinDesc, nipDesc, teatDesc, plural
} from '../content/Descriptions.ts';
import { clothesBottom, clothesTop, pullUD } from '../content/Clothes.ts';
import { itemAdd } from '../content/Items.ts';
import { boobChange, udderChange, lactChange, vagBellyChange } from './Transformations.ts';
import { moistCalc } from '../core/Calculations.ts';

let _doBirth: ((i: number, count: number) => void) | null = null
let _pregChanges: ((i: number) => void) | null = null
let _birthTime: ((race: number) => number) | null = null
let _doProcess: (() => void) | null = null
let _doEnd: (() => void) | null = null
let _changeTop: ((id: number) => void) | null = null
let _changeBot: ((id: number) => void) | null = null
let _milkAmount: ((which: number) => void) | null = null
let _stats: ((s: number, m: number, l: number, se: number) => void) | null = null

export function setStatusCallbacks(cbs: {
  doBirth?: (i: number, count: number) => void
  pregChanges?: (i: number) => void
  birthTime?: (race: number) => number
  doProcess?: () => void
  doEnd?: () => void
  changeTop?: (id: number) => void
  changeBot?: (id: number) => void
  milkAmount?: (which: number) => void
  stats?: (s: number, m: number, l: number, se: number) => void
}): void {
  if (cbs.doBirth)     _doBirth = cbs.doBirth
  if (cbs.pregChanges) _pregChanges = cbs.pregChanges
  if (cbs.birthTime)   _birthTime = cbs.birthTime
  if (cbs.doProcess)   _doProcess = cbs.doProcess
  if (cbs.doEnd)       _doEnd = cbs.doEnd
  if (cbs.changeTop)   _changeTop = cbs.changeTop
  if (cbs.changeBot)   _changeBot = cbs.changeBot
  if (cbs.milkAmount)  _milkAmount = cbs.milkAmount
  if (cbs.stats)       _stats = cbs.stats
}

function milkCap(): number { return gs.milkCap }

function blueBallsCap(): number {
  return gs.ballSize * gs.ballSizeMod * 7;
}

export function doStatus(time: number): void {
  textL('Afterwards...');
  gs.hrs = 0;

  // Pregnancy
  gs.pregnancyTime = 0;
  let birthCount = 0;
  let pregMilk = 0;
  let i = 0;
  while (i < gs.pregArray.length) {
    if (gs.pregArray[i] === true) {
      if (gs.pregArray[i + 1] !== 503) {
        gs.pregArray[i + 3] += Math.ceil(time * gs.pregRate);
        if (_pregChanges) _pregChanges(i);
      }
      const bt = _birthTime ? _birthTime(gs.pregArray[i + 1] as number) : 432;
      if ((gs.pregArray[i + 3] as number) > bt) {
        if (_doBirth) _doBirth(i, birthCount);
        birthCount++;
        gs.pregArray[i] = false;
        gs.pregArray[i + 3] = 0;
      } else {
        gs.pregnancyTime += gs.pregArray[i + 3] as number;
      }
    }
    i += 5;
  }

  if (pregMilk > 0) {
    lactChange(1, pregMilk);
    lactChange(2, pregMilk);
    if (gs.lactation - 50 <= 0) {
      textLP("\r\rYour body must be getting ready for the baby that's growing inside of you. Your breasts feel heavier as they fill with a nutritious fluid...");
    } else {
      textLP("\r\rYour breasts are producing even more milk, feeling even fuller... Your body must be getting ready for the baby that's growing inside of you.");
    }
    if (pregMilk > 10) {
      textLP(' With so much production, your breasts');
      if (gs.udders === true) { textLP(' and udder'); }
      textLP(' have swollen larger from the maternity growth.');
      boobChange(Math.floor(pregMilk / 10));
      udderChange(Math.floor(pregMilk / 10));
    }
  }

  // Egg laying
  if (gs.eggLaying > 0 && gs.vagTotal > 0 && pregCheck(1) && time > 0) {
    let tempInt = time + 2 * gs.eggRate;
    let tempInt2 = 0;
    while (tempInt > 0) {
      gs.eggTime--;
      tempInt--;
      if (gs.eggTime <= 0) {
        tempInt2++;
        gs.eggTime = gs.eggMaxTime;
      }
    }
    if (tempInt2 === 1) {
      if (percent() < gs.ment / 2 + 20) {
        if (gs.eggType === 0) { textLP('\r\rHaving missed your body\'s signals, you suddenly double over and begin to groan as you feel something press against the inside of ' + oneYour(2) + ' ' + vulvaDesc() + ' nether-lips. Your thighs clench to hold it back, but the smooth slick object spreads your cunt wide, squeezing out into your ' + clothesBottom() + ' where it cracks and spreads into a wet mess.\r\rYolky goop squishing in your groin with little bits of white shell jabbing you here and there, you take a moment to pull out the broken unfertilized egg and attempt to clean up after yourself...'); }
        if (gs.eggType === 1) { textLP('\r\rHaving missed your body\'s signals, you suddenly double over and begin to groan as you feel something press against the inside of ' + oneYour(2) + ' ' + vulvaDesc() + ' nether-lips. Your thighs clench to hold it back, but the smooth slick object spreads your cunt wide, squeezing out into your ' + clothesBottom() + ' where it squishes and spreads into a wet mess.\r\rSlimy goop squishing in your groin with little bits of squishy shell sliding about, you take a moment to pull out the broken unfertilized bug egg and attempt to clean up after yourself...'); }
      } else {
        if (gs.eggType === 0) {
          textLP('\r\rYou pause for a moment as you feel something drop within your womb. Groaning a bit, you ' + legVerb(1) + ' your ' + legDesc(2) + ' in preparation, a hand pushing your ' + clothesBottom() + ' aside and helping spread ' + vulvaDesc() + ' nether-lips. You hold your breath and with a quick push, you feel ' + oneYour(2) + ' cunt' + plural(2) + ' stretch wide. Your fingers feel the hard shell beginning to crown and with a grunt it slips out into your palm.\r\rYou take a moment to gather yourself, slipping the smooth, round egg through your slit, still wet from your inner-slime, before you finally pull it out from your ' + clothesBottom() + '. Drying it off, you have something to snack on later.');
          itemAdd(219);
        }
        if (gs.eggType === 1) {
          textLP('\r\rYou pause for a moment as you feel something drop within your womb. Groaning a bit, you ' + legVerb(1) + ' your ' + legDesc(2) + ' in preparation, a hand pushing your ' + clothesBottom() + ' aside and helping spread ' + vulvaDesc() + ' nether-lips. You hold your breath and with a quick push, you feel ' + oneYour(2) + ' cunt' + plural(2) + ' stretch wide. Your fingers feel the soft shell beginning to crown and with a grunt it slips out into your palm.\r\rYou take a moment to gather yourself, slipping the squishy round egg through your slit, still wet from your inner-slime, before you finally pull it out from your ' + clothesBottom() + '. Drying it off, you have something to snack on later.');
          itemAdd(253);
        }
      }
    }
    if (tempInt2 > 1) {
      if (percent() < gs.ment / 2 + 20 - 4 * tempInt2) {
        if (gs.eggType === 0) { textLP('\r\rHaving been distracted and unable to lay for such a long time, you are unprepared for the buildup of ovid objects within your womb. You double over as you feel them crowd against the inside of your ' + vulvaDesc() + ' nether-lips, your thighs clenching to hold them back, but the smooth slick objects press on through anyways. They squeeze out into your ' + clothesBottom() + ' where they pile up and crack, spreading into a wet mess.\r\rYolky goop squishing in your groin with little bits of white shell jabbing you here and there, you take a moment to pull out the broken unfertilized eggs and attempt to clean up after yourself...'); }
        if (gs.eggType === 1) { textLP('\r\rHaving been distracted and unable to lay for such a long time, you are unprepared for the buildup of spherical objects within your womb. You double over as you feel them crowd against the inside of your ' + vulvaDesc() + ' nether-lips, your thighs clenching to hold them back, but the smooth slick objects press on through anyways. They squeeze out into your ' + clothesBottom() + ' where they pile up and squish, spreading into a wet mess.\r\rSlimy goop squishing in your groin with little bits of squishy shell sliding about, you take a moment to pull out the broken unfertilized bug eggs and attempt to clean up after yourself...'); }
      } else {
        if (gs.eggType === 0) {
          textLP('\r\rHaving been distracted and unable to lay for such a long time, you pause for a moment as you prepare for the objects that have built up within your womb. Groaning a bit, you ' + legVerb(1) + ' your ' + legDesc(2) + ' in preparation, a hand pushing your ' + clothesBottom() + ' aside and helping spread ' + vulvaDesc() + ' nether-lips. You hold your breath and with a quick push, you feel ' + oneYour(2) + ' cunt' + plural(2) + ' stretch wide. Your fingers feel the hard shell beginning to crown and with a grunt it slips out into your palm. You place it down beside you and continue to lay until you are completely empty.\r\rYou take a moment to gather yourself, slipping the last smooth, round egg through your slit, still wet from your inner-slime, before you finally pull it out from your ' + clothesBottom() + '. Drying them all off, you have some snacks for later.');
          let t2 = tempInt2;
          while (t2 > 0) { itemAdd(219); t2--; }
        }
        if (gs.eggType === 1) {
          textLP('\r\rHaving been distracted and unable to lay for such a long time, you pause for a moment as you prepare for the objects that have built up within your womb. Groaning a bit, you ' + legVerb(1) + ' your ' + legDesc(2) + ' in preparation, a hand pushing your ' + clothesBottom() + ' aside and helping spread ' + vulvaDesc() + ' nether-lips. You hold your breath and with a quick push, you feel ' + oneYour(2) + ' cunt' + plural(2) + ' stretch wide. Your fingers feel the soft shell beginning to crown and with a grunt it slips out into your palm. You place it down beside you and continue to lay until you are completely empty.\r\rYou take a moment to gather yourself, slipping the last squishy round egg through your slit, still wet from your inner-slime, before you finally pull it out from your ' + clothesBottom() + '. Drying them all off, you have some snacks for later.');
          let t2 = tempInt2;
          while (t2 > 0) { itemAdd(253); t2--; }
        }
      }
    }
  }

  // Cock-Snake Pregnancy
  if (gs.cockSnakePreg > 0) {
    if (gs.cockSnakePreg - time <= 0) {
      let bcSnake = 0;
      textLP('\r\rYou feel a sudden squirming within your womb. You brace yourself as you feel the cock-snake within slither its way through your passage. Your ' + clothesBottom() + ' becomes drenched by your feminine lubricant as a bunch of it splashes out, the phallic head of the snake breaching your ' + vulvaDesc() + ' lips. Its body constantly drags over your sensitive flesh as it flees what is about to come, making you shudder in mild orgasm as the creature descends down your ' + legDesc(1) + '. You gasp and regain yourself, the snake slithering away. It must have been too hungry too survive inside you any longer...');
      gs.cockSnakePreg = 0;
      i = 0;
      while (i < gs.pregArray.length) {
        if (gs.pregArray[i + 1] === 1503) {
          gs.pregArray[i] = false;
          gs.pregArray[i + 3] = 0;
          bcSnake++;
          if (bcSnake === 2) { textLP('\r\rAnd it\'s not the first; you shudder again as another snake in another womb escapes out from your ' + clothesBottom() + ' and down your ' + legDesc(1) + ', giving up on you like the first.'); }
          if (bcSnake === 3) { textLP('\r\rFollowed by another...'); }
          if (bcSnake > 3) { textLP('\r\rAnd another...'); }
          doLust(-Math.floor(gs.sen / 4), 2, 2);
        }
        i += 5;
      }
    } else if (gs.cockSnakePreg - time <= 10) {
      textLP('\r\rYour ' + bellyDesc() + ' belly twists and jiggles about as the snake inside boinks about your womb. It seems to know all the best places to touch, greatly arousing you over time with its squirming, teasing you much more vigorously to make you thirst for cum down below...');
      gs.cockSnakePreg -= time;
      doLust(5 * time, 1);
    } else if (gs.cockSnakePreg - time <= 30) {
      textLP('\r\rYour ' + bellyDesc() + ' belly shudders as the snake inside clamors for cum, arousing you over time with its twisting and squirming, helping your passage grow sensitive and thirsty for penetration...');
      gs.cockSnakePreg -= time;
      doLust(3 * time, 1);
    } else if (gs.cockSnakePreg - time <= 50) {
      textLP('\r\rYour ' + bellyDesc() + ' belly wiggles a bit as the snake inside tries to tease your passage, making you thirsty for cock below and arousing you over time...');
      gs.cockSnakePreg -= time;
      doLust(time, 1);
    } else {
      gs.cockSnakePreg -= time;
    }
  }

  // Malon Pregnancy
  if (gs.malonRep === 4) { gs.malonPreg += time; }

  // Lila Pregnancy
  if ((gs.lilaPreg + time) > 40 && gs.lilaPreg <= 40 && gs.lilaPreg > 0) {
    gs.lilaMilk++;
    if (gs.lilaMilk > 19) { gs.lilaMilk = 19; }
  }
  if ((gs.lilaPreg + time) > 80 && gs.lilaPreg <= 80 && gs.lilaPreg > 0) {
    gs.lilaMilk += 2;
    if (gs.lilaMilk > 19) { gs.lilaMilk = 19; }
  }
  if (gs.lilaPreg > 0) { gs.lilaPreg += time; }

  // Silandrias Pregnancy
  if (gs.silPreg > 0 && gs.silRep < 5 && time > 0) {
    gs.silPreg += time + 2 * gs.silRate;
    let tempSil = time + gs.silRate;
    if (gs.silPreg > 30 && gs.silTied === false) {
      while (tempSil > 0) {
        gs.silLay--;
        tempSil--;
        if (gs.silLay <= 0) {
          gs.silPreg -= 10;
          gs.silLay = 10;
        }
      }
    }
  } else if (gs.silPreg > 0 && gs.silRep === 5 && time > 0 && gs.silGrowthTime <= 360 && gs.silPreg < 10000) {
    gs.silPreg += time + 2 * gs.silRate;
    gs.silGrowthTime += time;
  }

  // Heat
  if (gs.heat > 0 && gs.vagTotal > 0 && !pregCheck(0)) {
    if (gs.heatTime >= 0 && (gs.heatTime - time) < 0) {
      textLP('\r\rYour crotch feels hot and tingly, your face becoming flush. Thoughts of sex, being pounded and filled with seed until your womb has been sufficiently impregnated, permeate your mind and makes you greatly aroused. You\'re feeling especially fertile and extremely lustful as you go into heat...');
      gs.pregChanceMod += 15;
      statsMod(0, -5, 10, 0);
      doLust(15, 0);
      gs.vagMoistMod += 3;
      gs.heatTime = -24;
    } else if (gs.heatTime < 0 && (gs.heatTime + time) >= 0) {
      textLP('\r\rYou breath a sigh of relief as the heat finally passes, your body calming and no longer needing to reproduce as much.');
      gs.pregChanceMod -= 15;
      statsMod(0, 5, -10, 0);
      gs.vagMoistMod -= 3;
      gs.heatTime = gs.heatMaxTime;
    } else if (gs.heatTime > 0 && (gs.heatTime - time) > 0) {
      gs.heatTime -= time;
    } else if (gs.heatTime < 0 && (gs.heatTime + time) < 0) {
      gs.heatTime += time;
    }
  } else if (gs.heat > 0 && gs.heatTime < 0 && pregCheck(0)) {
    textLP('\r\rYou breath a sigh of relief as the heat passes, your body calming and no longer needing to reproduce as much. However, it seems to have ended a bit early...');
    gs.pregChanceMod -= 15;
    statsMod(0, 5, -10, 0);
    gs.vagMoistMod -= 3;
    gs.heatTime = gs.heatMaxTime;
  } else if (gs.heat > 0 && gs.heatTime !== gs.heatMaxTime && pregCheck(0)) {
    gs.heatTime = gs.heatMaxTime;
  } else if (gs.heat < 1 && gs.heatTime > 0) {
    gs.heatMaxTime = 0;
    gs.heatTime = 0;
  } else if ((gs.heat < 1 || gs.vagTotal < 1) && gs.heatTime < 0) {
    gs.pregChanceMod -= 15;
    statsMod(0, 5, -10, 0);
    gs.vagMoistMod -= 3;
    gs.heatMaxTime = 0;
    gs.heatTime = 0;
  }

  // Milk engorgement (breasts)
  if (gs.lactation > 0) {
    const milkBase = (gs.breastSize * (gs.breastSize + 1) + gs.tallness / 4) * 4 + milkCap();
    const milkNext = gs.milkEngorgement + (gs.lactation + gs.milkMod) * time;
    if (gs.milkEngorgementLevel < 3 && milkNext > milkBase * 2 && gs.milkEngorgement <= milkBase * 2) {
      textLP('\r\rPulling ' + pullUD(1) + ' your ' + clothesTop() + ', streams of milk shoot from your aching tits. Your nipples dribble uncontrollably, occasionally spitting the milk quite far. Your mammaries are producing far more milk than your breasts can hold and will continue to waste breastmilk until you drain them or they dry up from lack of demand.');
      if (gs.milkEngorgementLevel < 1) { boobChange(3); }
      else if (gs.milkEngorgementLevel < 2) { boobChange(2); }
      else { boobChange(1); }
      gs.milkEngorgementLevel++;
    } else if (gs.milkEngorgementLevel < 2 && milkNext > milkBase * 1.5 && gs.milkEngorgement <= milkBase * 1.5) {
      textLP('\r\rYour ' + clothesTop() + ' is soaked in front. Milk dribbles from your nipples almost constantly, your breasts slightly overfull and engorged. The abundant supply is getting to be a little more than the plush mounds can handle.');
      if (gs.milkEngorgementLevel < 1) { boobChange(2); }
      else { boobChange(1); }
      gs.milkEngorgementLevel++;
    } else if (gs.milkEngorgementLevel < 1 && milkNext > milkBase && gs.milkEngorgement <= milkBase) {
      textLP('\r\rYour ' + clothesTop() + ' feels moist around your nipples. Your breasts feel slightly swollen as the wet blotches spread, milk leaking from your laden mammaries. It\'s a sign that they are nice and full for a good breastfeeding, or whatever your kinky mind has for them.');
      gs.milkEngorgementLevel++;
      boobChange(1);
    }
    gs.milkEngorgement += (gs.lactation + gs.milkMod) * time;
  }

  // Milk engorgement (udder)
  if (gs.udderLactation > 0 && gs.udders === true) {
    const udBase = (gs.udderSize * (gs.udderSize + 1) + gs.tallness / 4) * 4 + milkCap();
    const udNext = gs.udderEngorgement + (gs.udderLactation + gs.milkMod) * time;
    if (gs.udderEngorgementLevel < 3 && udNext > udBase * 2 && gs.udderEngorgement <= udBase * 2) {
      textLP('\r\rJets of milk shoot from the teats of your udder with each step. When standing still, it dribbles constantly, your udder so big and sore and especially sensitive from being stretched and heavy with engorgement. The production of milk far exceeds its capacities, wasting milk until you drain it or it dries up.');
      if (gs.udderEngorgementLevel < 1) { udderChange(5); }
      else if (gs.udderEngorgementLevel === 1) { udderChange(3); }
      gs.udderEngorgementLevel++;
      udderChange(3);
    } else if (gs.udderEngorgementLevel < 2 && udNext > udBase * 1.5 && gs.udderEngorgement <= udBase * 1.5) {
      textLP('\r\rYour ' + clothesBottom() + ' is soaked in front. Milk dribbles from your teats almost constantly, too much to retain. The abundant supply seems to be overwhelming the lack of demand...');
      if (gs.udderEngorgementLevel < 1) { udderChange(2); }
      gs.udderEngorgementLevel++;
      udderChange(3);
    } else if (gs.udderEngorgementLevel < 1 && udNext > udBase && gs.udderEngorgement <= udBase) {
      textLP('\r\rYour ' + clothesBottom() + ' feels moist beneath your teats. Your udder feels slightly swollen as milk leaks out. It is nice and full enough for a good milking.');
      gs.udderEngorgementLevel++;
      udderChange(2);
    }
    gs.udderEngorgement += (gs.udderLactation + gs.milkMod) * time;
  }

  // Nipple play / lactation demand
  if (gs.nipplePlay > 100 && gs.lactation > 0) {
    lactChange(1, 15);
    textLP('\r\rYour breasts feel even more active, the high demand on their motherly supply increase your production rate.');
    gs.nipplePlay = 0;
  }
  if (gs.udderPlay > 100 && gs.udderLactation > 0) {
    lactChange(2, 25);
    textLP('\r\rYour breasts feel even more active, the high demand on their motherly supply increase your production rate.');
    gs.udderPlay = 0;
  }
  if (gs.lactation > 0 && !(gs.attireTop === 28 && percent() < 50)) { gs.nipplePlay -= time; }
  if (gs.nipplePlay > 100 && gs.lactation <= 0) {
    lactChange(1, 15);
    textLP(' All of the attention to your nipples has induced your milky state.');
    gs.nipplePlay = 0;
  }
  if (gs.udderLactation > 0 && gs.udders === true) { gs.udderPlay -= time; }
  else if (gs.udderPlay > 100) {
    lactChange(2, 25);
    textLP(' All of the attention to your teats has induced your milky state.');
    gs.udderPlay = 0;
  }
  if (gs.lactation > 0 && gs.nipplePlay < -20) {
    lactChange(1, -10);
    if (gs.lactation === 0) { textLP(' It seems as though the mammary glands in your breasts have adapted to the lack of demand.'); }
    gs.nipplePlay = 0;
  }
  if (gs.udderLactation > 0 && gs.udderPlay < -20 && gs.udders === true) {
    lactChange(2, -15);
    if (gs.udderLactation === 0) { textLP(' It seems as though the mammary glands in your udder have adapted to the lack of demand.'); }
    gs.udderPlay = 0;
  }

  // Milk Suppressant
  if ((gs.lactation > 0 || gs.udderLactation > 0) && gs.milkSuppressant > 0) {
    textLP('\r\rThe flow of milk quickly seizes up and stops as the milk suppressant takes over and prevents any more from escaping.');
    gs.milkSuppressantLact += gs.lactation;
    gs.milkSuppressantUdder += gs.udderLactation;
    gs.lactation = 0;
    gs.udderLactation = 0;
  }
  if (gs.milkSuppressant > 0) {
    if (gs.milkSuppressantLact > 0) {
      const msBase = (gs.breastSize * (gs.breastSize + 1) + gs.tallness / 4) * 4 + milkCap();
      const msNext = gs.milkEngorgement + (gs.milkSuppressantLact + gs.milkMod) * time;
      if (gs.milkEngorgementLevel < 3 && msNext > msBase * 2 && gs.milkEngorgement <= msBase * 2) {
        textLP('\r\rYour breasts are so swollen that they feel like balloons on your chest. When standing still, it takes a while for the fluid inside to stop swishing, they\'re so big and sore and especially sensitive from being stretched and heavy with engorgement. The production of milk far exceeds their capacities, but the excess just gets absorbed back into your body since the milk suppressant prevents any other escape...');
        if (gs.milkEngorgementLevel < 1) { boobChange(3); }
        else if (gs.milkEngorgementLevel < 2) { boobChange(2); }
        else { boobChange(1); }
        gs.milkEngorgementLevel++;
      } else if (gs.milkEngorgementLevel < 2 && msNext > msBase * 1.5 && gs.milkEngorgement <= msBase * 1.5) {
        textLP('\r\rYour breasts feel stretched and heavy, so full of milk and almost aching because none of the white fluid will escape with the milk suppressant active...');
        if (gs.milkEngorgementLevel < 1) { boobChange(2); }
        else { boobChange(1); }
        gs.milkEngorgementLevel++;
      } else if (gs.milkEngorgementLevel < 1 && msNext > msBase && gs.milkEngorgement <= msBase) {
        textLP('\r\rYour breasts feel slightly swollen and heavy, your mammaries laden with milk. It\'s a sign that they are nice and full for a good breastfeeding, or whatever your kinky mind has for them, if you could only leak...');
        gs.milkEngorgementLevel++;
        boobChange(1);
      }
      gs.milkEngorgement += (gs.milkSuppressantLact + gs.milkMod) * time;
      const msCap = msBase * 7;
      if (gs.milkEngorgement >= msCap) { gs.milkEngorgement = msCap; }
    }
    if (gs.milkSuppressantUdder > 0 && gs.udders === true) {
      const usBase = (gs.udderSize * (gs.udderSize + 1) + gs.tallness / 4) * 4 + milkCap();
      const usNext = gs.udderEngorgement + (gs.milkSuppressantUdder + gs.milkMod) * time;
      if (gs.udderEngorgementLevel < 3 && usNext > usBase * 2 && gs.udderEngorgement <= usBase * 2) {
        textLP('\r\rYour udder is so swollen that it feels like a balloon. When standing still, it takes a while for the fluid inside to stop swishing, it\'s so big and sore and especially sensitive from being stretched and heavy with engorgement. The production of milk far exceeds its capacities, but the excess just gets absorbed back into your body since the milk suppressant prevents any other escape...');
        if (gs.udderEngorgementLevel < 1) { udderChange(5); }
        else if (gs.udderEngorgementLevel === 1) { udderChange(3); }
        gs.udderEngorgementLevel++;
        udderChange(3);
      } else if (gs.udderEngorgementLevel < 2 && usNext > usBase * 1.5 && gs.udderEngorgement <= usBase * 1.5) {
        textLP('\r\rYour udder feels so stretch and heavy, so full of milk and almost aching because none of the white fluid will escape with the milk suppressant active...');
        if (gs.udderEngorgementLevel < 1) { udderChange(2); }
        gs.udderEngorgementLevel++;
        udderChange(3);
      } else if (gs.udderEngorgementLevel < 1 && usNext > usBase && gs.udderEngorgement <= usBase) {
        textLP('\r\rYour udder feels slightly swollen, even though there is no milk flowing. It is nice and full enough for a good milking, if the milk suppressant wasn\'t stopping it.');
        gs.udderEngorgementLevel++;
        udderChange(2);
      }
      gs.udderEngorgement += (gs.milkSuppressantUdder + gs.milkMod) * time;
      const usCap = usBase * 7;
      if (gs.udderEngorgement >= usCap) { gs.udderEngorgement = usCap; }
    }

    gs.milkSuppressant -= time;
    if (gs.milkSuppressant <= 0) {
      const msBase2 = (gs.breastSize * (gs.breastSize + 1) + gs.tallness / 4) * 4 + milkCap();
      if (gs.milkEngorgement >= msBase2 * 6) {
        textLP('\r\rYou feel a rumbling in your breasts as the milk suppressant begins to wear off. Your arms shake as you try to take care of your ' + clothesTop() + ', but to no avail.\r\rYou only see white as a roaring sound escapes your chest. Milk explodes from your nipples, spraying around and around, tearing apart your ' + clothesTop() + ' from the sheer pressure and drenching everything in the area. You can\'t hear or see anything and milk end up in nearly every hole. It takes a few minutes before the eruption dies down, leaving your nipples feeling limp and de-sensitized, your breasts still huge from the engorgement though feeling much more lighter. There\'s not much that can be said about your ' + clothesTop() + ' anymore though...');
        gs.milkEngorgement = msBase2 * 0.5;
        gs.milkEngorgementLevel = 0;
        if (_stats) _stats(0, 0, 0, -5);
        if (_changeTop) _changeTop(-1);
      } else if (gs.milkEngorgement >= msBase2 * 4) {
        textLP('\r\rYou suddenly can\'t breath as your chest tenses up. For an instant, you feel your ' + nipDesc() + ' nipples soften.\r\rMilk sprays with fervor all around you, spewing from your nipples like hoses. You shudder in orgasm from the force, milk getting everywhere. There\'s so much in there that you nearly tear apart your ' + clothesTop() + ' from the pressure of the gushing. But thankfully, the fabric survives and your nipples die back down, allowing you to see again... So much milk lost, but your breasts have returned to normal in those few moments...');
        if (_milkAmount) _milkAmount(1);
        doLust(-Math.floor(gs.sen / 2), 2, 3);
      } else if (gs.milkEngorgement >= msBase2 * 2) {
        textLP('\r\rJets of milk spray from beneath your ' + clothesTop() + ' as the milk suppressant wears off. It quickly dies down without losing much milk, but you\'re now leaking again.');
        gs.milkEngorgement = msBase2 * 2;
      } else if (gs.milkEngorgement >= msBase2) {
        textLP('\r\rMilk spurts up and begins dribbling down your chest as the milk suppressant wears off, your nipples calming down and leaking again.');
      } else {
        textLP('\r\rYour nipples soften up as the milk suppressant wears off, allowing you to leak once more.');
      }

      if (gs.udders === true) {
        const usBase2 = (gs.udderSize * (gs.udderSize + 1) + gs.tallness / 4) * 4 + milkCap();
        if (gs.udderEngorgement >= usBase2 * 6) {
          textLP('\r\rYou feel a rumbling in your udder as the milk suppressant begins to wear off. Your legs shake as you try to take care of your ' + clothesBottom() + ', but to no avail.\r\rYou only see white as a roaring sound echoes around your belly. Milk explodes from your teats, spraying around and around, tearing apart your ' + clothesBottom() + ' from the sheer pressure and drenching everything in the area. You can\'t hear or see anything and milk end up in nearly every hole. It takes a few minutes before the eruption dies down, leaving your teats feeling limp and de-sensitized, your udder still huge from the engorgement though feeling much more lighter. There\'s not much that can be said about your ' + clothesBottom() + ' anymore though...');
          gs.udderEngorgement = usBase2 * 0.5;
          gs.udderEngorgementLevel = 0;
          if (_stats) _stats(0, 0, 0, -5);
          if (_changeBot) _changeBot(-1);
        } else if (gs.udderEngorgement >= usBase2 * 4) {
          textLP('\r\rYou suddenly feel sick as your belly tenses up. For an instant, you feel your ' + teatDesc() + ' teats soften.\r\rMilk sprays with fervor all around you, spewing from your teats like hoses. You shudder in orgasm from the force, milk getting everywhere. There\'s so much in there that you nearly tear apart your ' + clothesBottom() + ' from the pressure of the gushing. But thankfully, the fabric survives and your teats die back down, allowing you to see again... So much milk lost, but your udder has returned to normal in those few moments...');
          if (_milkAmount) _milkAmount(1);
          doLust(-Math.floor(gs.sen / 2), 2, 4);
        } else if (gs.udderEngorgement >= usBase2 * 2) {
          textLP('\r\rJets of milk spray from beneath your ' + clothesBottom() + ' as the milk suppressant wears off. It quickly dies down without losing much milk, but you\'re now leaking again.');
          gs.udderEngorgement = usBase2 * 2;
        } else if (gs.udderEngorgement >= usBase2) {
          textLP('\r\rMilk spurts up and begins dribbling down your ' + legDesc(2) + ' as the milk suppressant wears off, your teats calming down and leaking again.');
        } else {
          textLP('\r\rYour teats soften up as the milk suppressant wears off, allowing you to leak once more.');
        }
      }

      gs.lactation = gs.milkSuppressantLact;
      gs.udderLactation = gs.milkSuppressantUdder;
      gs.milkSuppressantLact = 0;
      gs.milkSuppressantUdder = 0;
      gs.milkSuppressant = 0;
    }
  }

  // Hunger
  if (gs.hunger - time <= -50) {
    textLP('\r\rWith the lack of eating and all the action, you\'ve managed to shave off a bit of your excess weight around your belly.');
    gs.bellyMod -= 2;
    gs.hunger = 0;
    if (gs.bellyMod <= 0) {
      textLP(' Although, you don\'t exactly have any belly to shave off anymore, so instead your stomach growls with the hunger pains...');
      gs.hunger = 0;
      gs.bellyMod = 0;
    }
  } else if (gs.hunger - time >= 100) {
    textLP('\r\rYou notice a bit more chub around your belly thanks to all you\'ve been eating lately. You may want to watch your diet more closely.');
    gs.bellyMod += 5;
    gs.hunger = gs.hunger - time - 30;
  } else {
    gs.hunger -= time;
  }

  // Exhaustion
  if (gs.skipExhaustion === true) { gs.skipExhaustion = false; }
  else { gs.exhaustion += time; }
  if (gs.exhaustion > 20 && gs.exhaustion <= 32) {
    textLP('\r\rYour body is getting tired, affecting your ability to do things. Sleep is sounding like a nice idea...');
    if (gs.exhaustionPenalty === 0) {
      gs.exhaustionPenalty = 1;
      statsMod(-3, -3, 0, 0);
    }
  } else if (gs.exhaustion > 32 && gs.exhaustion <= 44) {
    textLP('\r\rExhaustion is creeping over you, making any task seem tedious. Your wits are a lot less witty and your muscles are fatigued.');
    if (gs.exhaustionPenalty === 1) {
      gs.exhaustionPenalty = 2;
      statsMod(-8, -8, 0, 0);
    }
    if (gs.exhaustionPenalty === 0) {
      gs.exhaustionPenalty = 2;
      statsMod(-11, -11, 0, 0);
    }
  } else if (gs.exhaustion > 44) {
    gs.currentState = 1;
  } else {
    if (gs.exhaustionPenalty === 1 && gs.exhaustion <= 20) {
      gs.exhaustionPenalty = 0;
      statsMod(3, 3, 0, 0);
    }
    if (gs.exhaustionPenalty === 2 && gs.exhaustion <= 20) {
      gs.exhaustionPenalty = 0;
      statsMod(11, 11, 0, 0);
    }
    if (gs.exhaustionPenalty === 2 && gs.exhaustion <= 32) {
      gs.exhaustionPenalty = 1;
      statsMod(8, 8, 0, 0);
    }
  }

  // Natural Lust Gain
  if (time > 0) {
    if (percent() <= gs.lib && gs.lust < 90) { doLust(Math.floor(gs.lib / 25 + 1), 0); }
  }

  // Lust Check
  if (gs.lust < 90 && gs.lustPenalty === 3) {
    textLP('\r\rYour ' + skinDesc() + ' feels calmer, no longer hypersensitive.');
    statsMod(0, 0, 0, -10);
    gs.lustPenalty = 2;
  }
  if (gs.lust < 60 && gs.lustPenalty === 2) {
    textLP('\r\rStrength returns to your muscles now that the strong arousal has been sated.');
    statsMod(5, 0, 0, 0);
    gs.lustPenalty = 1;
  }
  if (gs.lust < 30 && gs.lustPenalty === 1) {
    textLP('\r\rWith the distracting \'itch\' lifted from your mind, you\'re now able to focus better than before.');
    statsMod(0, 4, 0, 0);
    gs.lustPenalty = 0;
  }

  // Vag belly check
  vagBellyChange(0, 0);

  // Blue Balls
  if ((gs.blueBalls + Math.floor(time * gs.ballSize * gs.ballSizeMod / 336)) > blueBallsCap() && gs.blueBalls <= blueBallsCap() && gs.showBalls === true && gs.balls > 0) {
    textLP('\r\rYour ' + (gs.balls > 1 ? 'balls' : 'ball') + ' feel swollen and heavy within your ' + clothesBottom() + '. The need to spill your seed makes you a little aroused.');
    doLust(Math.ceil(gs.ballSize / 4), 0);
  }
  if (gs.balls > 0) { gs.blueBalls += Math.ceil(time * gs.ballSize * gs.ballSizeMod / 336); }
  if (gs.blueBalls > blueBallsCap()) { gs.blueBalls = blueBallsCap(); }

  // Body Oil
  if (gs.bodyOil > 0) {
    if (gs.bodyOil - time <= 0) {
      textLP('\r\rThe body oil finally dries off, leaving you ' + skinDesc() + ' not looking quite as shiny and attractive as before.');
      gs.enticeMod -= 5;
      gs.bodyOil = 0;
    } else { gs.bodyOil -= 5; }
  }

  // Masochism Potion
  if ((gs.masoPot - time) <= 0 && gs.masoPot > 0) {
    textLP('\r\rYou shiver a little as your nerves seem to feel more... normal. The effects of the Masochism Potion have apparently worn off, so you might want to be slightly more cautious once again.');
    gs.masoPot = 0;
  } else if (gs.masoPot > 0) { gs.masoPot -= time; }

  // S Masochism Potion
  if ((gs.sMasoPot - time) <= 0 && gs.sMasoPot > 0) {
    textLP('\r\rYou shiver a lot as your nerves seem to feel more... normal. The effects of the Superior Masochism Potion have apparently worn off, so you might want to be much more cautious once again.');
    gs.sMasoPot = 0;
  } else if (gs.sMasoPot > 0) { gs.sMasoPot -= time; }

  // Baby Free Potion
  if ((gs.babyFree - time) <= 0 && gs.babyFree > 0) {
    textLP('\r\rYour belly groans as you feel your fertility return to you, urging you to remain cautious of becoming pregnant again. It seems as though you\'re no longer as baby free as before.');
    if (gs.vagTotal < 1) { textLP(' Not that any of that means anything to you, considering you don\'t even have a womb to become pregnant in the first place.'); }
    gs.babyFree = 0;
  } else if (gs.babyFree > 0) { gs.babyFree -= time; }

  // Charmed Status
  if (gs.charmTime > 0) {
    if (gs.charmTime - time <= 0) {
      textLP('\r\rYour charming effect wears off, making you not so alluring as before.');
      gs.charmTime = 0;
      gs.enticeMod -= 13;
    } else { gs.charmTime -= time; }
  }

  // Pheromone
  if (gs.pheromone > 0) {
    if (gs.pheromone - time <= 0) {
      textLP('\r\rThe scent of pheromones finally fades away, leaving you not so unexpectedly desireable to nearly everything.');
      gs.pheromone = 0;
      gs.enticeMod -= 25;
      statsMod(0, 0, -3, 0);
    } else { gs.pheromone -= time; }
  }

  // Eggcelerator
  if (gs.eggceleratorTime > 0) {
    if (gs.eggceleratorTime - time <= 0) {
      textLP('\r\rYour belly feels calmer as the eggcelerator wears off, allowing your womb to relax a little.');
      gs.eggceleratorTime = 0;
      gs.eggRate -= gs.eggceleratorDose;
      gs.eggceleratorDose = 0;
    } else { gs.eggceleratorTime -= time; }
  }

  // Fertile Gel
  if (gs.fertileGel > 0) {
    if (gs.fertileGel - time <= 0) {
      textLP('\r\rYour womb cools off a little as the fertile gel wears off.');
      gs.fertileGel = 0;
      gs.pregChanceMod -= 10;
    } else { gs.fertileGel -= time; }
  }

  // Plump Quat
  if (gs.plumpQuats > 0) {
    if (gs.plumpQuats - time <= 0) {
      textLP('\r\rThe last of the quat dissolves inside your stomach, your belly bloating further as the abundant energy is added to your figure. Your stomach cools off, finished with the digestive process.');
      gs.bellyMod += 5 * gs.plumpQuats;
      gs.plumpQuats = 0;
    } else {
      textLP('\r\rYour stomach gurgles warmly as it continues to digest the quat. So much energy from the fruit\'s flesh gets absorbed by your body, swelling your belly a little and giving you a bit more girth...');
      gs.bellyMod += 5 * time;
      gs.plumpQuats -= time;
    }
  }

  // Fertility Statue Curse
  if (gs.fertilityStatueCurse > 0) {
    if (gs.fertilityStatueCurse - time <= 0) {
      textLP('\r\rThe overbearing feeling of lust finally subdues. Seems as though the statue\'s curse has finally worn off, so you won\'t be getting as much of a lesson about how to please the female gender. Well, at least for now...');
      gs.fertilityStatueCurse = 0;
      gs.minLust -= 10;
    } else { gs.fertilityStatueCurse -= time; }
  }

  // Lila Wet Status
  if (gs.lilaWetStatus > 0) {
    if (gs.lilaWetStatus - time <= 0) {
      textLP('\r\rThe flow in your loins calms down a bit after not having been influenced by a certain little felin in a while.');
      gs.lilaWetStatus = 0;
      gs.cockMoistMod -= 6;
      gs.vagMoistMod -= 6;
      gs.minLust -= 5;
    } else { gs.lilaWetStatus -= time; }
  }

  // Milk Creeper Poison
  if (gs.milkCPoisonNip > 0) {
    if (gs.milkCPoisonNip - time <= 0) {
      textLP('\r\rThe warmth from the poison in your bosom fades, no longer as tingly.');
      gs.milkCPoisonNip = 0;
    } else { gs.milkCPoisonNip -= time; }
  }
  if (gs.milkCPoisonUdd > 0) {
    if (gs.milkCPoisonUdd - time <= 0) {
      textLP('\r\rThe warmth from the poison in your bosom fades, no longer as tingly.');
      gs.milkCPoisonUdd = 0;
    } else { gs.milkCPoisonUdd -= time; }
  }

  // Cock-Snake Venom
  if (gs.cockSnakeVenom > 0) {
    if (gs.cockSnakeVenom - time <= 0) {
      textLP('\r\rThe warmth from the venom in your loins fades, your body fully metabolizing it and rendering it neutral.');
      gs.cockSnakeVenom = 0;
    } else { gs.cockSnakeVenom -= time; }
  }

  statDisplay();
  if (gs.currentText === 'Afterwards...') {
    textL('');
    if (_doProcess) _doProcess();
  } else {
    if (_doEnd) _doEnd();
  }
}
