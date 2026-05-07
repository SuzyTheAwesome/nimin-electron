// Ported from Transformations.as
import { gs } from '../core/GameState.ts';
import { textL, textLP } from '../ui/TextRenderer.ts';
import { percent } from '../core/GameUtilities.ts';
import {
  vulvaDesc, legDesc, skinDesc, nipDesc,
  tailDesc, buttDesc, hipDesc, cockDesc, ballDesc, boobDesc, plural
} from '../content/Descriptions.ts';
import { clothesBottom, clothesTop, pullUD } from '../content/Clothes.ts';
import { checkItem } from '../content/Items.ts';

let _doProcess: (() => void) | null = null
let _doEnd: (() => void) | null = null
let _changeTop: ((id: number) => void) | null = null
let _changeBot: ((id: number) => void) | null = null
let _stats: ((s: number, m: number, l: number, se: number) => void) | null = null

export function setTransformationCallbacks(cbs: {
  doProcess?: () => void
  doEnd?: () => void
  changeTop?: (id: number) => void
  changeBot?: (id: number) => void
  stats?: (s: number, m: number, l: number, se: number) => void
}): void {
  if (cbs.doProcess) _doProcess = cbs.doProcess
  if (cbs.doEnd)     _doEnd = cbs.doEnd
  if (cbs.changeTop) _changeTop = cbs.changeTop
  if (cbs.changeBot) _changeBot = cbs.changeBot
  if (cbs.stats)     _stats = cbs.stats
}

export function affinity(
  humanChange: number, horseChange: number, wolfChange: number, catChange: number,
  cowChange: number, lizardChange: number, rabbitChange: number
): void {
  gs.human  += Math.ceil(humanChange  * gs.changeMod);
  gs.horse  += Math.ceil(horseChange  * gs.changeMod);
  gs.wolf   += Math.ceil(wolfChange   * gs.changeMod);
  gs.cat    += Math.ceil(catChange    * gs.changeMod);
  gs.cow    += Math.ceil(cowChange    * gs.changeMod);
  gs.lizard += Math.ceil(lizardChange * gs.changeMod);
  gs.rabbit += Math.ceil(rabbitChange * gs.changeMod);
}

export function aff(tempRace: number, tempChange: number, otherChange: number): void {
  gs.human  += Math.ceil(otherChange * gs.changeMod);
  gs.horse  += Math.ceil(otherChange * gs.changeMod);
  gs.wolf   += Math.ceil(otherChange * gs.changeMod);
  gs.cat    += Math.ceil(otherChange * gs.changeMod);
  gs.cow    += Math.ceil(otherChange * gs.changeMod);
  gs.lizard += Math.ceil(otherChange * gs.changeMod);
  gs.rabbit += Math.ceil(otherChange * gs.changeMod);
  gs.mouse  += Math.ceil(otherChange * gs.changeMod);
  gs.bird   += Math.ceil(otherChange * gs.changeMod);
  gs.pig    += Math.ceil(otherChange * gs.changeMod);
  gs.skunk  += Math.ceil(otherChange * gs.changeMod);
  gs.bug    += Math.ceil(otherChange * gs.changeMod);

  gs.twoBoobAffinity   += Math.ceil(otherChange * gs.changeMod);
  gs.fourBoobAffinity  += Math.ceil(otherChange * gs.changeMod);
  gs.sixBoobAffinity   += Math.ceil(otherChange * gs.changeMod);
  gs.eightBoobAffinity += Math.ceil(otherChange * gs.changeMod);
  gs.tenBoobAffinity   += Math.ceil(otherChange * gs.changeMod);
  gs.cowTaurAffinity   += Math.ceil(otherChange * gs.changeMod);
  gs.humanTaurAffinity += Math.ceil(otherChange * gs.changeMod);

  const delta = Math.ceil(tempChange * gs.changeMod) - Math.ceil(otherChange * gs.changeMod);
  if (tempRace === 1)  gs.human  += delta;
  if (tempRace === 2)  gs.horse  += delta;
  if (tempRace === 3)  gs.wolf   += delta;
  if (tempRace === 4)  gs.cat    += delta;
  if (tempRace === 5)  gs.cow    += delta;
  if (tempRace === 6)  gs.lizard += delta;
  if (tempRace === 7)  gs.rabbit += delta;
  if (tempRace === 8)  gs.mouse  += delta;
  if (tempRace === 9)  gs.bird   += delta;
  if (tempRace === 10) gs.pig    += delta;
  if (tempRace === 11) gs.skunk  += delta;
  if (tempRace === 12) gs.bug    += delta;
}

export function affinityChange(): void {
  textL('Something feels odd...');
  const chance = percent();

  // Determine dominant blood
  const affinityCheckArray = [
    gs.humanAffinity  + gs.human,
    gs.horseAffinity  + gs.horse,
    gs.wolfAffinity   + gs.wolf,
    gs.catAffinity    + gs.cat,
    gs.cowAffinity    + gs.cow,
    gs.lizardAffinity + gs.lizard,
    gs.rabbitAffinity + gs.rabbit,
    gs.mouseAffinity  + gs.mouse,
    gs.birdAffinity   + gs.bird,
    gs.pigAffinity    + gs.pig,
    gs.skunkAffinity  + gs.skunk,
    gs.bugAffinity    + gs.bug,
  ];
  const sorted = [...affinityCheckArray].sort((a, b) => a - b);
  const domCheck = sorted[sorted.length - 1];
  const second   = sorted[sorted.length - 2];

  if (domCheck === gs.humanAffinity  + gs.human  && gs.human  >= 0) gs.dominant = 1;
  else if (domCheck === gs.horseAffinity  + gs.horse  && gs.horse  >= 0) gs.dominant = 2;
  else if (domCheck === gs.wolfAffinity   + gs.wolf   && gs.wolf   >= 0) gs.dominant = 3;
  else if (domCheck === gs.catAffinity    + gs.cat    && gs.cat    >= 0) gs.dominant = 4;
  else if (domCheck === gs.cowAffinity    + gs.cow    && gs.cow    >= 0) gs.dominant = 5;
  else if (domCheck === gs.lizardAffinity + gs.lizard && gs.lizard >= 0) gs.dominant = 6;
  else if (domCheck === gs.rabbitAffinity + gs.rabbit && gs.rabbit >= 0) gs.dominant = 7;
  else if (domCheck === gs.mouseAffinity  + gs.mouse  && gs.mouse  >= 0) gs.dominant = 8;
  else if (domCheck === gs.birdAffinity   + gs.bird   && gs.bird   >= 0) gs.dominant = 9;
  else if (domCheck === gs.pigAffinity    + gs.pig    && gs.pig    >= 0) gs.dominant = 10;
  else if (domCheck === gs.skunkAffinity  + gs.skunk  && gs.skunk  >= 0) gs.dominant = 11;
  else if (domCheck === gs.bugAffinity    + gs.bug    && gs.bug    >= 0) gs.dominant = 12;

  // Human
  if ((gs.humanAffinity + gs.human) >= 40 && gs.humanAffinity < 40) {
    textLP('\r\rYour body feels quite... adaptive? There\'s a strange sense of being more susceptible to change');
    gs.changeMod += 0.5;
  }
  if ((gs.humanAffinity + gs.human) < 40 && gs.humanAffinity >= 40) {
    textLP('\r\rYour body feels less ready to bend to your surroundings as much as it had anymore.');
    gs.changeMod -= 0.5;
  }
  // Horse
  if ((gs.horseAffinity + gs.horse) >= 40 && gs.horseAffinity < 40) {
    if (gs.cockTotal > 0) { textLP('\r\rYour ' + clothesBottom() + ' grows tight, filling with extra cockflesh. Opening the ' + clothesBottom() + ', your cock' + plural(1) + ' spill' + plural(3) + ' out, dangling while swelling larger and larger. The growth slows to a halt, much, much longer than before. \'Hung like a horse\' seems like the appropriate phrase. And you\'re also going to have to sneak back into town while you hide your perverse excess flesh, rushing to a tailor to refit you.'); }
    if (gs.vagTotal > 0) { textLP('\r\rDoubling over, you hug your belly as it begins to cramp. You can clearly feel your vaginal flesh grow within, the walls growing much deeper. By the time it\'s over, you feel somewhat like a mare, able to take cocks much larger than you could have before...'); }
    gs.cockNarrowMod += 0.5;
    gs.cockSizeMod += 1;
    gs.vagSizeMod += 1;
    vagBellyChange(0, 0);
  }
  if ((gs.horseAffinity + gs.horse) < 40 && gs.horseAffinity >= 40) {
    if (gs.cockTotal > 0) { textLP('\r\rYour ' + clothesBottom() + ' feel baggier. Opening the ' + clothesBottom() + ', your cock' + plural(1) + ' shrinking towards your groin, losing a great deal of length. It seems like you have lost your equine engorgement.'); }
    if (gs.vagTotal > 0) { textLP('\r\rYour belly feels rather empty all of a sudden. Placing your hand over it, you can feel the vaginal flesh recede, no longer built like mare.'); }
    gs.cockNarrowMod -= 0.5;
    gs.cockSizeMod -= 1;
    gs.vagSizeMod -= 1;
    vagBellyChange(0, 0);
  }
  // Wolf
  if ((gs.wolfAffinity + gs.wolf) >= 40 && gs.wolfAffinity < 40) {
    if (gs.cockTotal > 0) { textLP('\r\rA sudden wave of lust washes over you, your cock' + plural(1) + ' growing stiff in your ' + clothesBottom() + '. You quickly open open your ' + clothesBottom() + ' to see what\'s going on. Within, the base' + plural(1) + ' of your shaft' + plural(1) + ' swell' + plural(3) + '. In an instant, you\'re surprised by spurts of cum that shower you, a small volley from a quick unexpected orgasm. Wiping your eyes so you can see, the swelling persists as you continue to come for a while. It would be very difficult to remove your cock from a hot hole with a large \'knot\' like that, until finished draining your seed.'); }
    gs.knot = true;
    gs.cumMod += 0.5;
  }
  if ((gs.wolfAffinity + gs.wolf) < 40 && gs.wolfAffinity >= 40) {
    if (gs.cockTotal > 0) { textLP('\r\rAn odd draining fills your ' + clothesBottom() + '. Looking within, you see your cock' + plural(1) + ' grow slightly stiff, your knot' + plural(1) + ' swelling. Pre lazily seeps from your urethra' + plural(1) + ' as the knot' + plural(1) + ' deflate' + plural(1) + ' immediately while your cock' + plural(1) + ' remain' + plural(3) + ' stiff. It seems as though you have lost your knot' + plural(1) + '.'); }
    gs.knot = false;
    gs.cumMod -= 0.5;
  }
  // Cat
  if ((gs.catAffinity + gs.cat) >= 40 && gs.catAffinity < 40) {
    if (gs.vagTotal > 0) { textLP('\r\rYour ' + clothesBottom() + ' grows slightly moist, your cunt' + plural(2) + ' burning with arousal. The feeling quickly fades, but something tells you your reproductive instincts might occasionally take over...'); }
    if (gs.heat < 1) { gs.heatMaxTime = 96; gs.heatTime = 96; gs.heat++; }
    else if (gs.heat >= 1) { gs.heatMaxTime -= 12; gs.heat++; }
  }
  if ((gs.catAffinity + gs.cat) < 40 && gs.catAffinity >= 40) {
    if (gs.vagTotal > 0) { textLP(' You also feel your vagina' + plural(2) + ' cool a little, no longer as eager to be impregnated on certain days.'); }
    if (gs.heat >= 2) { gs.heatMaxTime += 12; }
    gs.heat--;
  }
  // Cow
  if ((gs.cowAffinity + gs.cow) >= 10 && gs.cowAffinity < 10) {
    textLP('\r\rYour nipples stiffen beneath your ' + clothesTop() + '. They protrude nearly further than before, though slightly narrower!');
    gs.nippleSize += 2; gs.nipNarrowMod += 0.2; gs.milkMod += 50;
  }
  if ((gs.cowAffinity + gs.cow) >= 25 && gs.cowAffinity < 25) {
    textLP('\r\rYour nipples stiffen beneath your ' + clothesTop() + '. They protrude even further than before, though slightly narrower! And your hips seem slightly broader...');
    lactChange(1, 75); gs.nipNarrowMod += 0.3; gs.nippleSize += 5; gs.hips += 4; gs.milkMod += 50;
  }
  if ((gs.cowAffinity + gs.cow) >= 40 && gs.cowAffinity < 40) {
    textLP('\r\rYour nipples squirm within your ' + clothesTop() + '. They\'ve grown even further than before, being more narrow and teat-like! And your hips feel like they\'re more \'square\' than before...');
    lactChange(1, 75); gs.nipNarrowMod += 0.4; gs.nippleSize += 8; gs.hips += 6; gs.milkMod += 50;
  }
  if ((gs.cowAffinity + gs.cow) >= 55 && gs.cowAffinity < 55) {
    textLP('\r\rJust above your groin, your belly begins to feel bloated. You wince as it pushes against your ' + clothesBottom() + ', especially noticing the increased sensitivity of four spots in particular. Before you can act, your ' + clothesBottom() + ' tears at the waist, as a mound crashes through. Hanging naked and free, with four teats twice as long as your nipples, an udder about twice as large as your chest dribbles milk. You\'ll definitely be getting a special bra or perhaps adjust your ' + clothesBottom() + ' when you get back to town, at least to account for your surprisingly wider hips... ');
    lactChange(1, 150); lactChange(2, gs.lactation); gs.hips += 8;
    gs.udders = true; gs.udderSize = 2 * gs.breastSize; gs.teatSize = 2 * gs.nippleSize;
  }
  if ((gs.cowAffinity + gs.cow) < 10 && gs.cowAffinity >= 10) {
    textLP('\r\rYour nipples are less noticeable, receding back into your breasts slightly.');
    gs.nippleSize -= 2; gs.nipNarrowMod -= 0.2; gs.milkMod -= 50;
  }
  if ((gs.cowAffinity + gs.cow) < 25 && gs.cowAffinity >= 25) {
    textLP('\r\rYour nipples seem less noticeable as they shrink and your hips are less wide.');
    lactChange(1, -50); if (gs.udders === true) { lactChange(2, -50); }
    gs.nippleSize -= 5; gs.nipNarrowMod -= 0.3; gs.hips -= 4; gs.milkMod -= 50;
  }
  if ((gs.cowAffinity + gs.cow) < 40 && gs.cowAffinity >= 40) {
    textLP('\r\rYour ' + clothesTop() + ' feels slightly looser, as your nipples no longer stand out as far. You hips also narrow a little, protruding less than before.');
    lactChange(1, -50); if (gs.udders === true) { lactChange(2, -50); }
    gs.nipNarrowMod -= 0.4; gs.hips -= 6; gs.nippleSize -= 8; gs.milkMod -= 50;
  }
  if ((gs.cowAffinity + gs.cow) < 55 && gs.cowAffinity >= 55) {
    if (!udderCheck(1)) {
      textLP('\r\rThe fleshy bag of milk at your abdomen shrinks to nothing, disappearing along with its teats. You\'re no longer lugging around an udder. Plus your waistbands seem quite loose after your hips shrink by a few inches.');
      lactChange(1, -100); gs.hips -= 8; gs.udders = false;
      gs.udderLactation = 0; gs.udderEngorgement = 0; gs.udderEngorgementLevel = 0;
      gs.udderPlay = 0; gs.udderSize = 0; gs.teatSize = 0;
    } else {
      textLP('\r\rYour waistbands seem quite loose after your hips shrink by a few inches.');
      lactChange(1, -100); gs.hips -= 8;
    }
  }
  // Lizard
  if ((gs.lizardAffinity + gs.lizard) >= 40 && gs.lizardAffinity < 40) {
    if (gs.cockTotal === 1) { cockChange(0, 1); }
    if (gs.vagTotal > 0) { textLP('\r\rAn odd sensation of warmth fills your womb' + plural(2) + '. You can literally feel your eggs stir within, preparing themselves to cycle much more frequently, growing hard shells to protect them, whenever you\'re not pregnant.'); }
    if (gs.eggLaying === 0) { gs.eggLaying++; gs.eggType = 0; gs.eggMaxTime = 36; gs.eggTime = 36; }
    else { gs.eggMaxTime -= 6; gs.eggLaying++; }
  }
  if ((gs.lizardAffinity + gs.lizard) < 40 && gs.lizardAffinity >= 40) {
    if (gs.cockTotal === 2) { cockChange(0, -1); }
    if (gs.vagTotal > 0) { textLP('\r\rYour womb' + plural(2) + ' calm' + plural(4) + ' down, no longer working as hard to pop out more eggs.'); }
    if (gs.eggLaying === 1) { gs.eggLaying--; gs.eggMaxTime = 0; gs.eggTime = 0; }
    else if (gs.eggLaying > 1) { gs.eggMaxTime += 6; gs.eggLaying--; }
  }
  // Rabbit
  if ((gs.rabbitAffinity + gs.rabbit) >= 10 && gs.rabbitAffinity < 10) { if (_stats) _stats(0, 0, 2, 0); }
  if ((gs.rabbitAffinity + gs.rabbit) >= 30 && gs.rabbitAffinity < 30) { if (_stats) _stats(0, 0, 5, 0); }
  if ((gs.rabbitAffinity + gs.rabbit) >= 50 && gs.rabbitAffinity < 50) { if (_stats) _stats(0, 0, 7, 0); }
  if ((gs.rabbitAffinity + gs.rabbit) >= 40 && gs.rabbitAffinity < 40) {
    if (gs.vagTotal > 0) { textLP('\r\rYour womb' + plural(2) + ' feel' + plural(4) + ' a bit... hyperactive. It feels as though you could breed like some sort of cute, small, fuzzy animal.'); }
    gs.pregRate += 1;
  }
  if ((gs.rabbitAffinity + gs.rabbit) < 10 && gs.rabbitAffinity >= 10) { if (_stats) _stats(0, 0, -2, 0); }
  if ((gs.rabbitAffinity + gs.rabbit) < 30 && gs.rabbitAffinity >= 30) { if (_stats) _stats(0, 0, -5, 0); }
  if ((gs.rabbitAffinity + gs.rabbit) < 50 && gs.rabbitAffinity >= 50) { if (_stats) _stats(0, 0, -7, 0); }
  if ((gs.rabbitAffinity + gs.rabbit) < 40 && gs.rabbitAffinity >= 40) {
    if (gs.vagTotal > 0) { textLP('\r\rYour womb' + plural(2) + ' feel' + plural(4) + ' calmer. Now you can take your fertility nice and easy... relatively.'); }
    gs.pregRate -= 1;
  }
  // Mouse
  if ((gs.mouseAffinity + gs.mouse) >= 40 && gs.mouseAffinity < 40) {
    textLP('\r\rA slight paranoia lingers in your mind, making you feel quite skittish. If you needed to, you could probably run from a threat at the drop of a needle.');
    if (gs.balls > 0 && gs.showBalls === true) { textLP(' Your ' + ballDesc() + ' nuts also feel slightly \'skittish\', like they\'re making far more than they just were...'); }
    gs.runMod += 25; gs.cumMod += 3;
  }
  if ((gs.mouseAffinity + gs.mouse) < 40 && gs.mouseAffinity >= 40) {
    textLP('\r\rThe paranoia dissipates from your mind, your body languishing and no longer as flighty.');
    if (gs.balls > 0 && gs.showBalls === true) { textLP(' Your ' + ballDesc() + ' nuts also calm down, their production diminishing.'); }
    gs.runMod -= 25; gs.cumMod -= 3;
  }
  // Bird
  if ((gs.birdAffinity + gs.bird) >= 40 && gs.birdAffinity < 40) {
    textLP('\r\rYours eyes dart about for a moment as shiny things become suddenly more noticeable. After a few moments, you calm down, but your definitely able to spot shiny things more accurately, able to find an extra couple coins whenever you come across any.');
    gs.coinMod += 2;
    if (gs.vagTotal > 0) { textLP('\r\rAn odd sensation of warmth fills your womb' + plural(2) + '. You can literally feel your eggs stir within, preparing themselves to cycle much more frequently, growing hard shells to protect them, whenever you\'re not pregnant.'); }
    if (gs.eggLaying === 0) { gs.eggLaying++; gs.eggMaxTime = 36; gs.eggTime = 36; gs.eggType = 0; }
    else { gs.eggMaxTime -= 6; gs.eggLaying++; }
  }
  if ((gs.birdAffinity + gs.bird) < 40 && gs.birdAffinity >= 40) {
    textLP('\r\rYour affinity for shinies dissipates. Not quite as focused on them, you aren\'t able to find an extra couple coins anymore.');
    gs.coinMod -= 2;
    if (gs.vagTotal > 0) { textLP('\r\rYour womb' + plural(2) + ' calm' + plural(4) + ' down, no longer working as hard to pop out more eggs.'); }
    if (gs.eggLaying === 1) { gs.eggLaying--; gs.eggMaxTime = 0; gs.eggTime = 0; }
    else if (gs.eggLaying > 1) { gs.eggLaying--; gs.eggMaxTime += 6; }
  }
  // Pig
  if ((gs.pigAffinity + gs.pig) >= 10 && gs.pigAffinity < 10) { textLP('\r\rYour belly jiggles a bit more than you remember. Seems you\'ve gotten a bit chubbier, despite what you have eaten...'); gs.bellyMod += 20; }
  if ((gs.pigAffinity + gs.pig) >= 30 && gs.pigAffinity < 30) { textLP('\r\rYour belly jiggles a bit more than you remember. Seems you\'ve gotten a bit chubbier, despite what you have eaten...'); gs.bellyMod += 20; }
  if ((gs.pigAffinity + gs.pig) >= 50 && gs.pigAffinity < 50) { textLP('\r\rYour belly jiggles a bit more than you remember. Seems you\'ve gotten a bit chubbier, despite what you have eaten...'); gs.bellyMod += 20; }
  if ((gs.pigAffinity + gs.pig) >= 70 && gs.pigAffinity < 70) { textLP('\r\rYour belly jiggles a bit more than you remember. Seems you\'ve gotten a bit chubbier, despite what you have eaten...'); gs.bellyMod += 20; }
  if ((gs.pigAffinity + gs.pig) >= 40 && gs.pigAffinity < 40) {
    textLP('\r\rYou groan as you feel some of your extra weight grow heavier. Your hips grow wider and your ass grows larger, exaggerating your chubbiness.');
    if (gs.balls > 0 && gs.showBalls === true) { textLP(' Your ' + ballDesc() + ' balls also feel rather \'fat\', growing heavy with seed...'); }
    gs.cumMod += 5; gs.hipMod += 0.5; gs.buttMod += 0.5;
  }
  if ((gs.pigAffinity + gs.pig) < 10 && gs.pigAffinity >= 10) { textLP('\r\rYour belly feels lighter, your extra porkiness dissipating.'); gs.bellyMod -= 20; }
  if ((gs.pigAffinity + gs.pig) < 30 && gs.pigAffinity >= 30) { textLP('\r\rYour belly feels lighter, your extra porkiness diminishing.'); gs.bellyMod -= 20; }
  if ((gs.pigAffinity + gs.pig) < 50 && gs.pigAffinity >= 50) { textLP('\r\rYour belly feels lighter, your extra porkiness diminishing.'); gs.bellyMod -= 20; }
  if ((gs.pigAffinity + gs.pig) < 70 && gs.pigAffinity >= 70) { textLP('\r\rYour belly feels lighter, your extra porkiness diminishing.'); gs.bellyMod -= 20; }
  if ((gs.pigAffinity + gs.pig) < 40 && gs.pigAffinity >= 40) {
    textLP('\r\rYou moan as you feel some of your extra weight lift from you. Your hips and rump shrink, no longer nearly as chubby.');
    if (gs.balls > 0 && gs.showBalls === true) { textLP(' Your ' + ballDesc() + ' balls also feel lighter, no longer producing as much seed.'); }
    gs.cumMod -= 5; gs.hipMod -= 0.5; gs.buttMod -= 0.5;
  }
  // Skunk
  if ((gs.skunkAffinity + gs.skunk) >= 40 && gs.skunkAffinity < 40) {
    textLP('\r\rYou feel your ' + buttDesc() + ' rump grow slightly larger. Then a strange scent fills your nose, casually rising from your backside. It... It doesn\'t stink at all like you would expect from the area, but rather smells quite pleasant. A nice, pleasing, and even somewhat alluring aroma.\r\rYou try to see if you can control this scent, pushing some glands inside you never noticed before. And sure enough, you manage to spray out a more concentrated mist. However, you immediately start gagging. It smells horrible... Not something you want to try normally, but rather reserve for more severe occassions.');
    if (gs.skinType === 2) {
      textLP('\r\rAnd to accentuate the change further, two parallel stripes emerge in your fur, connecting together at your brow and rung over your head all the way down to your rump');
      if (gs.tail === 11) { textLP(' where it connects to the stripes on your tail'); }
      textLP('.');
    }
    gs.enticeMod += 10; gs.butt += 2;
  }
  if ((gs.skunkAffinity + gs.skunk) < 40 && gs.skunkAffinity >= 40) {
    textLP('\r\rYou feel your ' + buttDesc() + ' rump shrink slightly. The pleasant scent that exudes from it disappears, as well as the other scent you could produce.');
    if (gs.skinType === 2) {
      textLP('\r\rThe twin stripes in your fur from your head to your rump also fade');
      if (gs.tail === 11) { textLP(', though the ones on your tail remain'); }
      textLP('.');
    }
    gs.enticeMod -= 10; gs.butt -= 2;
  }
  // Bug
  if ((gs.bugAffinity + gs.bug) >= 40 && gs.bugAffinity < 40) {
    if (gs.vagTotal > 0) { textLP('\r\rAn odd sensation of warmth fills your womb' + plural(2) + '. You can literally feel your eggs stir within, preparing themselves to cycle much more frequently, growing soft shells to protect them, whenever you\'re not pregnant.'); }
    if (gs.eggLaying === 0) { gs.eggLaying++; gs.eggType = 1; gs.eggMaxTime = 14; gs.eggTime = 14; }
    else { gs.eggMaxTime -= 6; gs.eggLaying++; }
  }
  if ((gs.bugAffinity + gs.bug) < 40 && gs.bugAffinity >= 40) {
    if (gs.vagTotal > 0) { textLP('\r\rYour womb' + plural(2) + ' calm' + plural(4) + ' down, no longer working as hard to pop out more insect-like eggs.'); }
    if (gs.eggLaying === 1) { gs.eggLaying--; gs.eggMaxTime = 0; gs.eggTime = 0; }
    else if (gs.eggLaying > 1) { gs.eggMaxTime += 6; gs.eggLaying--; }
  }

  // Clamp affinity values 0–100
  const clampAff = (cur: number, delta: number): number => {
    const next = cur + delta;
    if (next < 0) return 0;
    if (next > 100) return 100;
    return next;
  };
  gs.humanAffinity  = clampAff(gs.humanAffinity,  gs.human);
  gs.horseAffinity  = clampAff(gs.horseAffinity,  gs.horse);
  gs.wolfAffinity   = clampAff(gs.wolfAffinity,   gs.wolf);
  gs.catAffinity    = clampAff(gs.catAffinity,    gs.cat);
  gs.cowAffinity    = clampAff(gs.cowAffinity,    gs.cow);
  gs.lizardAffinity = clampAff(gs.lizardAffinity, gs.lizard);
  gs.rabbitAffinity = clampAff(gs.rabbitAffinity, gs.rabbit);
  gs.mouseAffinity  = clampAff(gs.mouseAffinity,  gs.mouse);
  gs.birdAffinity   = clampAff(gs.birdAffinity,   gs.bird);
  gs.pigAffinity    = clampAff(gs.pigAffinity,     gs.pig);
  gs.skunkAffinity  = clampAff(gs.skunkAffinity,  gs.skunk);
  gs.bugAffinity    = clampAff(gs.bugAffinity,     gs.bug);

  // Skin change
  const maxSkin    = Math.max(gs.humanAffinity, gs.pigAffinity);
  const maxFur     = Math.max(gs.horseAffinity, gs.wolfAffinity, gs.catAffinity, gs.cowAffinity, gs.rabbitAffinity, gs.mouseAffinity, gs.skunkAffinity);
  const maxScale   = gs.lizardAffinity;
  const maxFeather = gs.birdAffinity;
  const maxChitin  = gs.bugAffinity;
  const maxNonSkin    = Math.max(maxFur, maxScale, maxFeather, maxChitin);
  const maxNonFur     = Math.max(maxSkin, maxScale, maxFeather, maxChitin);
  const maxNonScale   = Math.max(maxFur, maxSkin, maxFeather, maxChitin);
  const maxNonFeather = Math.max(maxFur, maxScale, maxSkin, maxChitin);
  const maxNonChitin  = Math.max(maxFur, maxScale, maxSkin, maxFeather);
  if (gs.lockSkin === 0) {
    if (maxSkin > maxNonSkin + 35 && gs.skinType !== 1) { textLP('\r\rYour ' + skinDesc() + ' feels oddly cool. Looking at it, your ' + skinDesc() + ' shrinks into your skin, leaving you \'bald\' all over. You feel a little naked as you get used to your bare skin.'); gs.skinType = 1; }
    if (maxFur > maxNonFur + 35 && gs.skinType !== 2) {
      textLP('\r\rYour ' + skinDesc() + ' begins to itch all over as soft hairs begin to sprout in patches. Before you know it, your whole body is soon covered in a coat of fur.');
      gs.skinType = 2;
      if (gs.skunkAffinity >= 40) { textLP(' The fur is mostly a single color, except for two parallel stripes that connect at your brow and run over your head and down your back to your rump'); if (gs.tail === 11) { textLP(' where it connects to the stripes on your tail'); } textLP('.'); }
    }
    if (maxScale > maxNonScale + 35 && gs.skinType !== 3) { textLP('\r\rYour ' + skinDesc() + ' begins to feel oddly dry, feeling somewhat flaky. Before you know it, your whole body feels soft and extremely smooth, covered in a thin layer of scales.'); gs.skinType = 3; }
    if (maxFeather > maxNonFeather + 35 && gs.skinType !== 4) { textLP('\r\rYour ' + skinDesc() + ' begins to tickle all over, tiny hair sprouting up all over and collecting into groups. Before you know it, you\'re rustling and fluffing up, sleeking back a layer of feathers.'); gs.skinType = 4; }
    if (maxChitin > maxNonChitin + 35 && gs.skinType !== 5) { textLP('\r\rYour ' + skinDesc() + ' begins to feel stiff, as though it were getting harder. Before you know it, your whole body is covered with a layer of chitin, almost like full suit of segmented armor. However, unlike armor, this doesn\'t really afford you any protection, since you seem to have all the usual sensations through it like any other kind of skin.'); if (legDesc(10) === 'feet') { textLP(' And more of the chitin extends from your heels, making you stand higher without actually being taller as you walk more on your toes.'); } gs.skinType = 5; }
  }

  // Face change
  let hasMuzzle = false;
  if (gs.lockFace === 0) {
    if (gs.faceType === 21 || gs.faceType === 31 || gs.faceType === 61) { hasMuzzle = true; }
    if (gs.dominant === 1 && gs.faceType !== 10) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your face rounds out and your nose resizes so it nestles neatly between your eyes, reaching from your brow down to just above your mouth and looks much like a human\'s.'); gs.faceType = 10; hasMuzzle = false; }
    if (gs.dominant === 2 && gs.faceType !== 20 && gs.faceType !== 21) { if (hasMuzzle) { textLP('\r\rYour facial demeanor softens and becomes more focused as your eyes grow wide and round, giving you a more considerate yet strong appearance.'); } else { textLP('\r\rYour jaw seems to be a bit low and wide, your face looking longer than average. Your nose also appears wider to make up for the slightly stretched appearance.'); } gs.faceType = 20; }
    else if (gs.dominant === 2 && gs.faceType !== 21 && gs.horseAffinity > 70) { if (hasMuzzle) { textLP('\r\rYour muzzle widens along with your teeth until your smile is full and your teeth gently rest flatly upon each other. With your large eyes peering down the strong jaw, you seem to have a more equine appearance.'); } else { textLP('\r\rYour jaw juts outward, growing forward, taking your mouth and the end of your nose with it. The bridge of your nose flattens as it reaches away from your face, molding around your upper teeth and forming a distinct muzzle. With its width and strength of character, you look much more like a horse.'); } gs.faceType = 21; hasMuzzle = true; }
    if (gs.dominant === 3 && gs.faceType !== 30 && gs.faceType !== 31) { if (hasMuzzle) { textLP('\r\rYour facial demeanor becomes more fierce as your eyes narrow slightly and your teeth become sharper, giving you a more carnivorous appearance.'); } else { textLP('\r\rYour teeth grow sharper and your eyes focus more. The tip of your nose also moistens and becomes softer, giving you a more feral appearance.'); } gs.faceType = 30; }
    else if (gs.dominant === 3 && gs.faceType !== 31 && gs.wolfAffinity > 70) { if (hasMuzzle) { textLP('\r\rYour muzzle narrows and your teeth grow long and sharp, your canines especially visible. With your narrow eyes peering down the vicious jaw, you seem to have a more lupin appearance.'); } else { textLP('\r\rYour jaw juts outward, growing forward, taking your mouth and nose with it. The bridge of your nose flattens as it stretches from your brow, molding around your upper teeth and forming a distinct muzzle. The whole muzzle narrow and filled with sharp teeth, you look much more like a wolf.'); } gs.faceType = 31; hasMuzzle = true; }
    if (gs.dominant === 4 && gs.faceType !== 40 && gs.faceType !== 41) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your face flattens and your nose shrinks a bit, the tip changing color slightly and becoming softer. Your eyes grow narrow as well, making you seem like a hunter.'); gs.faceType = 40; hasMuzzle = false; }
    else if (gs.dominant === 4 && gs.faceType !== 41 && gs.catAffinity > 60) { textLP('\r\rYour upper lip curls up at the center and long stiff thin whiskers sprout from the front of your cheeks. They\'re a bit sensitive when you touch them and give you a rather cat-like appearance.'); gs.faceType = 41; }
    if (gs.dominant === 5 && gs.faceType !== 50 && gs.faceType !== 51) { if (hasMuzzle) { textLP('\r\rYour facial demeanor softens and becomes more focused as your eyes grow round and slightly droopy, giving you a domesticated appearance.'); } else { textLP('\r\rYour jaw seems to be a bit low and wide, your face looking longer than average. Your nose also seems noticeably broader.'); } gs.faceType = 50; }
    else if (gs.dominant === 5 && gs.faceType !== 51 && gs.cowAffinity > 70) { if (hasMuzzle) { textLP('\r\rYour muzzle widens along with your teeth until your smile is full and your teeth gently rest flatly upon each other. With your large droopy eyes peering down the broad muzzle, you seem to have a more bovine appearance.'); } else { textLP('\r\rYour jaw juts outward, growing forward, taking your mouth and the end of your nose with it. The bridge of your nose flattens as it reaches away from your face, molding around your upper teeth and forming a distinct muzzle. With its broadness and rather sedate appearance, you look much more like a cow.'); } gs.faceType = 51; hasMuzzle = true; }
    if (gs.dominant === 6 && gs.faceType !== 60 && gs.faceType !== 61) { if (hasMuzzle) { textLP('\r\rYour nostrils flatten into slits against your muzzle, giving you a more reptillian appearance.'); } else { textLP('\r\rYour nose flattens until your nostrils are almost merely slits. Your lips also thin slightly, giving you a more reptillian appearance.'); } gs.faceType = 60; }
    else if (gs.dominant === 6 && gs.faceType !== 61 && gs.lizardAffinity > 70) { if (hasMuzzle) { textLP('\r\rYour muzzle narrows and flattens out a bit more, making you look more like some kind of lizard.'); } else { textLP('\r\rYour jaw juts outward, growing forward, taking your mouth and nostrils with it, forming a sort of muzzle. It narrows almost to a point as it stretches, making you look like some kind of lizard.'); } gs.faceType = 61; hasMuzzle = true; }
    if (gs.dominant === 7 && gs.faceType !== 70 && gs.faceType !== 71) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your face flattens while your nose shrinks a bit, the tip changing color slightly and becoming softer and twitchy. Your eyes become round and soft, making you seem relatively meek.'); gs.faceType = 70; hasMuzzle = false; }
    else if (gs.dominant === 7 && gs.faceType !== 71 && gs.rabbitAffinity > 60) { textLP('\r\rYour upper lip curls up at the center and long stiff thin whiskers sprout from the front of your cheeks. Your two front teeth stick out from the rest, almost protruding from your lips, making you look much like a bunny.'); gs.faceType = 71; }
    if (gs.dominant === 8 && gs.faceType !== 80 && gs.faceType !== 81) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your lower face protrudes outward while your nose shrinks a bit, the tip changing color slightly and becoming softer and twitchy. Your eyes become slightly smaller yet more open, making you seem more cautious of your surroundings.'); gs.faceType = 80; hasMuzzle = false; }
    else if (gs.dominant === 8 && gs.faceType !== 81 && gs.mouseAffinity > 60) { textLP('\r\rThin whiskers sprout from the front of your cheeks. Your two front teeth stick out from the rest, almost protruding from your lips, making you look much like a mouse.'); gs.faceType = 81; }
    if (gs.dominant === 9 && gs.faceType !== 90 && gs.faceType !== 91) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your jaw becomes sharper while your nose grows larger from the rest of your face, almost have a hooked shape. Your eyes become wide and aware, making you seem more focused.'); gs.faceType = 90; hasMuzzle = false; }
    else if (gs.dominant === 9 && gs.faceType !== 91 && gs.birdAffinity > 70) { textLP('\r\rYour upper lip molds up against your large nose, becoming stiff and hard while the bottom lip protrudes and matches the hooked shape. Your nose and mouth morph into a sturdy powerful beak, making you look much like a bird.'); gs.faceType = 91; }
    if (gs.dominant === 10 && gs.faceType !== 100 && gs.faceType !== 101 && gs.faceType !== 102) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your cheeks become fuller, your face growing fatter, giving you a bit of a pudgy look.'); gs.faceType = 100; hasMuzzle = false; }
    else if (gs.dominant === 10 && gs.faceType !== 101 && gs.faceType !== 102 && gs.pigAffinity > 60) { textLP('\r\rYour nose flattens and turns upward, your nostrils growing larger and pointing straight out, making you look much like a pig.'); gs.faceType = 101; }
    else if (gs.dominant === 10 && gs.faceType !== 102 && gs.pigAffinity > 85) { textLP('\r\rTwo of your lower teeth suddenly begin to surge outward, growing rapidly into two large tusks that stick out from your lips and curl upward.'); gs.faceType = 102; }
    if (gs.dominant === 11 && gs.faceType !== 110 && gs.faceType !== 111) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your face stretches out along your nose a bit, the tip growing smaller and more narrow and becoming softer. Your eyes become soft and gentle, but with the potential to become defensive and vicious at any moment.'); gs.faceType = 110; hasMuzzle = false; }
    else if (gs.dominant === 11 && gs.faceType !== 111 && gs.skunkAffinity > 60) { textLP('\r\rLong stiff thin whiskers sprout from the front of your cheeks. They\'re a bit sensitive when you touch them and give you a rather skunk-like appearance.'); gs.faceType = 111; }
    if (gs.dominant === 12 && gs.faceType !== 120 && gs.faceType !== 121) { textLP('\r\r'); if (hasMuzzle) { textLP('The muzzle that stretches from your face begins to shrink back, your jaw returning to the rest of your skull. '); } textLP('Your face flattens and your nose shrinks a bit, a chitinous \'bandage\' forming over the bridge of your nose to protect it. Your eyes grow much larger compared to the rest of your face, almost alien but still able to show plenty of emotion.'); gs.faceType = 120; hasMuzzle = false; }
    else if (gs.dominant === 12 && gs.faceType !== 121 && gs.bugAffinity > 60) { textLP('\r\rYour lips grow large and plush, looking like they could suck nectar out of even the largest flowers. Your eyes also turn completely black, and with their large size they give you a rather bug-like appearance.'); gs.faceType = 121; }
  }

  // Tail change
  const tempTailArr = [gs.horseAffinity, gs.wolfAffinity, gs.catAffinity, gs.cowAffinity, gs.lizardAffinity, gs.rabbitAffinity, gs.mouseAffinity, gs.pigAffinity, gs.skunkAffinity, gs.bugAffinity, gs.humanTaurAffinity];
  const sortedTail = [...tempTailArr].sort((a, b) => a - b);
  const maxTail    = sortedTail[sortedTail.length - 1];
  const secondTail = sortedTail[sortedTail.length - 2];
  const maxNonTail = gs.humanAffinity;
  if (gs.lockTail === 0) {
    if (gs.tail < 1) {
      if (gs.dominant === 2 && gs.horseAffinity > maxNonTail + 15) { gs.tail = 2; }
      if (gs.dominant === 3 && gs.wolfAffinity  > maxNonTail + 15) { gs.tail = 3; }
      if (gs.dominant === 4 && gs.catAffinity   > maxNonTail + 15) { gs.tail = 4; }
      if (gs.dominant === 5 && gs.cowAffinity   > maxNonTail + 15) { gs.tail = 5; }
      if (gs.dominant === 6 && gs.lizardAffinity> maxNonTail + 15) { gs.tail = 6; }
      if (gs.dominant === 7 && gs.rabbitAffinity> maxNonTail + 15) { gs.tail = 7; }
      if (gs.dominant === 8 && gs.mouseAffinity > maxNonTail + 15) { gs.tail = 8; }
      if (gs.dominant === 9 && gs.birdAffinity  > maxNonTail + 15) { gs.tail = 9; }
      if (gs.dominant === 10 && gs.pigAffinity  > maxNonTail + 15) { gs.tail = 10; }
      if (gs.dominant === 11 && gs.skunkAffinity> maxNonTail + 15) { gs.tail = 11; }
      if (gs.dominant === 12 && gs.bugAffinity  > maxNonTail + 15) { gs.tail = 12; }
      if (gs.tail > 1) { textLP('\r\rYou feel a tickle upon your backside as your ' + clothesBottom() + ' feels tight. With a groan, the pressure builds behind you, until a tearing sound fills the air and the pain is gone. Checking your backside, you see a new ' + tailDesc() + ' tail bobbing above your ' + buttDesc() + ' bum. Next time you go to town, you\'ll be visiting a tailor to fix your clothes to account for your new appendage...'); }
    }
    if (gs.dominant === 1 && gs.humanAffinity > maxTail + 10 && gs.tail > 1) { gs.tail = 0; textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it shrinks into your back, disappearing altogether. You no longer have a tail.'); }
    if (gs.dominant === 2 && gs.horseAffinity  > secondTail + 10 && gs.tail > 1 && gs.tail !== 2)  { gs.tail = 2;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it bursts into hundreds of long hairs. Any control you had over it before is gone, save for the muscles at the base that allow you to swish it with your mood and swat against your thighs. Just like a horse\'s.'); }
    if (gs.dominant === 3 && gs.wolfAffinity   > secondTail + 10 && gs.tail > 1 && gs.tail !== 3)  { gs.tail = 3;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it widens with long hairs around a skeletal base. It wags with your mood and reflexes, though you don\'t really have control over it otherwise, and it\'s oh so fluffy. Just like a wolf\'s.'); }
    if (gs.dominant === 4 && gs.catAffinity    > secondTail + 10 && gs.tail > 1 && gs.tail !== 4)  { gs.tail = 4;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it narrows with short hairs around a skeletal base. It wags with your mood and reflexes and likes to curl around your touch with limited control, and it\'s oh so soft. Just like a cat\'s.'); }
    if (gs.dominant === 5 && gs.cowAffinity    > secondTail + 10 && gs.tail > 1 && gs.tail !== 5)  { gs.tail = 5;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it narrows with short hairs around a skeletal base and a tuft of long hair bursts at the tip. It sways lazily across your ' + buttDesc() + ' backside and you can swat yourself with the tip like a soft whip. Just like a cow\'s.'); }
    if (gs.dominant === 6 && gs.lizardAffinity > secondTail + 10 && gs.tail > 1 && gs.tail !== 6)  { gs.tail = 6;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it thickens at the base and narrows gradually to a point. It\'s quite agile, able to move at your whim, the tip even being slightly prehensile. Much like a lizard\'s.'); }
    if (gs.dominant === 7 && gs.rabbitAffinity > secondTail + 10 && gs.tail > 1 && gs.tail !== 7)  { gs.tail = 7;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as shrinks into your back, exploding into a tuft of soft puffy hair before it disappears. It wiggles above your ' + buttDesc() + ' bum cutely and quite fluffy. Much like a rabbit\'s.'); }
    if (gs.dominant === 8 && gs.mouseAffinity  > secondTail + 10 && gs.tail > 1 && gs.tail !== 8)  { gs.tail = 8;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it narrows with fine hairs around a skeletal base. Thin and lithe, the fur doesn\'t really hide the pink skin underneath. It whips above your ' + buttDesc() + ' bum and you can curl it around with limited control. Just like a mouse\'s.'); }
    if (gs.dominant === 9 && gs.birdAffinity   > secondTail + 10 && gs.tail > 1 && gs.tail !== 9)  { gs.tail = 9;  textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it shrinks to your back and burst into a plume of feathers. Long and somewhat controllable, you can adjust their direction for aerodynamic turning. Just like a bird\'s.'); }
    if (gs.dominant === 10 && gs.pigAffinity   > secondTail + 10 && gs.tail > 1 && gs.tail !== 10) { gs.tail = 10; textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it shrinks into your back, shriveling in girth and coiling around. It twitches a bit when you try to wiggle it and you can try to straighten it out but it pops right back into its curly state. Just like a pig\'s.'); }
    if (gs.dominant === 11 && gs.skunkAffinity > secondTail + 10 && gs.tail > 1 && gs.tail !== 11) { gs.tail = 11; textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it poofs into a large, long, wide fluffy tail that curls up behind your back with the pointed tip gently sagging away from you. Two parrallel stripes run closely together from the tip of your tail, widening with the tail, and down to the base'); if (gs.skinType === 2 && gs.skunkAffinity >= 40) { textLP(' where it meets up with the stripes of your fur'); } textLP('. Just like a skunk\'s.'); }
    if (gs.dominant === 12 && gs.bugAffinity   > secondTail + 10 && gs.tail > 1 && gs.tail !== 12) { gs.tail = 12; textLP('\r\rYour tail begins to tingle. As you turn around, you watch as it bloats up, growing nearly as thick as your waist and nearly as stout. It\'s so big and weighty with flesh that you can hardly move it, merely resting against your ' + buttDesc() + ' butt. And at the tip where it\'s rather blunt, you can feel another hole. It\'s not terribly large, but it looks large enough to fit a small-ish egg, your finger able to easily poke up inside to feel the warm moist interior. If you were to venture a guess, it seems more like an ovipositor than an actual tail, though such a large change to your anatomy would be impossible, so what could it be for?'); }
    if (gs.weapon === 127 && gs.tail !== 4 && gs.tail !== 5 && gs.tail !== 6 && gs.tail !== 8) { gs.weapon = 10; }
  }

  // Wings
  const maxNonWings = Math.max(gs.humanAffinity, gs.horseAffinity, gs.wolfAffinity, gs.catAffinity, gs.cowAffinity, gs.lizardAffinity, gs.rabbitAffinity, gs.mouseAffinity, gs.pigAffinity);
  const maxWings = gs.birdAffinity;
  if (gs.wings < 1 && maxWings > maxNonWings + 60) {
    if (gs.dominant === 9 && gs.birdAffinity > maxNonWings + 60) { textLP('\r\rA sharp pain engulfs your back, centered around your shoulder blades. You keel forward, falling to your hands and ' + legDesc(6) + ' as you try to brace yourself against the sharp ache. Then, you cry out as feathers tear through your ' + clothesTop() + ', stretching out across new appendages. As soon as they grow, the pain stops and you gather yourself.\r\rStanding, you flap your new feathery wings. While not strong enough to carry you long distances, they\'ll definitely help you flee from unwanted threats.'); gs.wings = 9; }
    gs.runMod += 20;
  }
  if (gs.wings > 0 && maxNonWings > maxWings + 60) { textLP('\r\rYour wings feel strange and rapidly begin to shrivel. Shrinking down, they disappear into your shoulder blades, the ' + skinDesc() + ' left smooth as though there were never anything there. You have lost your wings, it seems.'); gs.runMod -= 20; gs.wings = 0; }

  // Ears
  if (gs.lockEars === 0) {
    if (gs.dominant === 1  && gs.humanAffinity  > second + 15 && gs.ears !== 1)  { gs.ears = 1;  textLP('\r\rYour ears twitch as they become rounded and hug the sides of you head, looking more like a human\'s.'); }
    if (gs.dominant === 2  && gs.horseAffinity  > second + 15 && gs.ears !== 2)  { gs.ears = 2;  textLP('\r\rYour ears twitch as they become rounded and pointed at the tip, flicking atop your head, looking more like a horse\'s.'); }
    if (gs.dominant === 3  && gs.wolfAffinity   > second + 15 && gs.ears !== 3)  { gs.ears = 3;  textLP('\r\rYour ears twitch as they become triangular, standing pert atop your head, looking more like a wolf\'s.'); }
    if (gs.dominant === 4  && gs.catAffinity    > second + 15 && gs.ears !== 4)  { gs.ears = 4;  textLP('\r\rYour ears twitch as they become triangular, standing pert atop your head, looking more like a cat\'s.'); }
    if (gs.dominant === 5  && gs.cowAffinity    > second + 15 && gs.ears !== 5)  { gs.ears = 5;  textLP('\r\rYour ears twitch as they become rounded and large, standing several inches out from the sides of your head, looking more like a cow\'s.'); }
    if (gs.dominant === 6  && gs.lizardAffinity > second + 15 && gs.ears !== 6)  { gs.ears = 6;  textLP('\r\rYour ears feel quite strange, shrinking into the sides of your head before they disappear, becoming sleek holes.'); }
    if (gs.dominant === 7  && gs.rabbitAffinity > second + 15 && gs.ears !== 7)  { gs.ears = 7;  textLP('\r\rYour ears twitch as they become quite long, standing several inches high atop your head, looking more like a rabbit\'s.'); }
    if (gs.dominant === 8  && gs.mouseAffinity  > second + 15 && gs.ears !== 8)  { gs.ears = 8;  textLP('\r\rYour ears twitch as they grow larger and larger, rounding out into thin discs standing out from the sides of your head, looking more like a mouse\'s.'); }
    if (gs.dominant === 9  && gs.birdAffinity   > second + 15 && gs.ears !== 9)  { gs.ears = 9;  textLP('\r\rYour ears feel quite strange, shrinking into the sides of your head before disappearing behind a small patch of feathers, looking more like a bird\'s.'); }
    if (gs.dominant === 10 && gs.pigAffinity    > second + 15 && gs.ears !== 10) { gs.ears = 10; textLP('\r\rYour ears feel quite strange, growing long and triangular out the sides of your head, folding over and dropping as they get too long, looking more like a pig\'s.'); }
    if (gs.dominant === 11 && gs.skunkAffinity  > second + 15 && gs.ears !== 11) { gs.ears = 11; textLP('\r\rYour ears twitch as they become rounded and small, standing pert atop your head, looking more like a skunk\'s.'); }
    if (gs.dominant === 12 && gs.bugAffinity    > second + 15 && gs.ears !== 12) { gs.ears = 12; textLP('\r\rYour ears twitch as they grow long and narrow to a point on the sides of your head, becoming a vibrant color while the lobes become wavy with a delicate design, looking almost like butterfly wings.'); }
  }

  // Boob count
  const twoBoob   = Math.max(gs.twoBoobAffinity,   gs.humanAffinity, gs.horseAffinity, gs.cowAffinity, gs.lizardAffinity, gs.rabbitAffinity, gs.mouseAffinity, gs.birdAffinity);
  const sixBoob   = Math.max(gs.sixBoobAffinity,   gs.catAffinity, gs.wolfAffinity, gs.skunkAffinity);
  const fourBoob  = gs.fourBoobAffinity;
  const eightBoob = Math.max(gs.eightBoobAffinity, gs.pigAffinity);
  const tenBoob   = Math.max(gs.tenBoobAffinity,   gs.bugAffinity);
  const nonTwoBoob   = Math.max(sixBoob, fourBoob, eightBoob, tenBoob);
  const nonSixBoob   = Math.max(twoBoob, fourBoob, eightBoob, tenBoob);
  const nonFourBoob  = Math.max(twoBoob, sixBoob, eightBoob, tenBoob);
  const nonEightBoob = Math.max(twoBoob, sixBoob, fourBoob, tenBoob);
  const nonTenBoob   = Math.max(twoBoob, fourBoob, eightBoob, sixBoob);
  if (gs.lockBreasts === 0) {
    if (twoBoob > nonTwoBoob + 20 && gs.boobTotal !== 2) {
      if (gs.boobTotal === 4)  { textLP('\r\rYour lower chest tickles'); if (gs.breastSize > 4) { textLP(', both growing much lighter'); } textLP('. Checking, you catch your second set of nipples disappear flat into your ' + skinDesc() + ', leaving you with only the highest pair on your chest.'); }
      if (gs.boobTotal === 6)  { textLP('\r\rYour lower chest and belly tickle'); if (gs.breastSize > 4) { textLP(', both growing much lighter'); } textLP('. Checking, you catch your extra sets of nipples disappear flat into your ' + skinDesc() + ', leaving you with only the primary pair on your chest.'); }
      if (gs.boobTotal === 8)  { textLP('\r\rYour lower chest and belly tickle'); if (gs.breastSize > 4) { textLP(', both growing much lighter'); } textLP('. Checking, you catch your extra sets of nipples disappear flat into your ' + skinDesc() + ', leaving you with only the primary pair on your chest, which seems to have grown larger.'); }
      if (gs.boobTotal === 10) { textLP('\r\rYour lower chest and belly tickle'); if (gs.breastSize > 4) { textLP(', both growing much lighter'); } textLP('. Checking, you catch your extra sets of nipples disappear flat into your ' + skinDesc() + ', leaving you with only the primary pair on your chest, which seems to have grown larger.'); }
      gs.boobTotal = 2;
    }
    if (fourBoob > nonFourBoob + 20 && gs.boobTotal !== 4) {
      // AS3 inherited bug fix: TS port had only boobTotal 2/6 branches; AS3
      // covers 2/6/8/10 — restore the 8 and 10 cases for shrinking down to 4.
      if (gs.boobTotal === 2) { textLP('\r\rYour lower chest, close beneath your nipples, begins to tickle. A new pair of sensitive areolas form amongst your ' + skinDesc() + ', creating an extra row of breasts beneath the originals.'); if (gs.breastSize > 4) { textLP(' The new nipples protrude as fleshy mounds form from beneath them. The new boobs wobble as they grow to the same size of your original pair, lifting the originals slightly with their girth. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 6) { textLP('\r\rYour belly tickles'); if (gs.breastSize > 4) { textLP(', growing much lighter'); } textLP('. Checking, you catch your bottom set of nipples disappear flat into your ' + skinDesc() + ', while your middle pair swells to match the first, leaving you with two sets of equally sized breasts, the top resting upon the bottom.'); }
      if (gs.boobTotal === 8) { textLP('\r\rYour belly tickles'); if (gs.breastSize > 4) { textLP(', growing much lighter'); } textLP('. Checking, you catch your two lowest sets of nipples disappear flat into your ' + skinDesc() + ', while the other two pairs swell slightly, leaving you with two sets of breasts larger than before.'); }
      if (gs.boobTotal === 10) { textLP('\r\rYour belly tickles'); if (gs.breastSize > 4) { textLP(', growing much lighter'); } textLP('. Checking, you catch your three lowest sets of nipples disappear flat into your ' + skinDesc() + ', while the other two pairs swell slightly, leaving you with two sets of breasts larger than before.'); }
      gs.boobTotal = 4;
    }
    if (sixBoob > nonSixBoob + 20 && gs.boobTotal !== 6) {
      // AS3 inherited bug fix: was missing boobTotal 8/10 shrink branches.
      if (gs.boobTotal === 2) { textLP('\r\rYour lower chest and belly tickle. Four new nipples form amongst your ' + skinDesc() + ', a fresh pair below your original two and another pair below that, leaving you with three rows of two breasts from your chest down to your upper belly.'); if (gs.breastSize > 4) { textLP(' The nipples protrude as fleshy mounds form beneath them. Breast-flesh wobbles, each row a fraction in size of the one above it. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 4) { textLP('\r\rYour belly tickles. Two new nipples form amongst your ' + skinDesc() + ', right below your second pair on your upper belly, leaving you with three rows of two breasts.'); if (gs.breastSize > 4) { textLP(' The nipples protrude as fleshy mounds form beneath them, while your second pair seems to shrink in turn. Breast-flesh wobbles, each row a fraction in size of the one above it. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 8) { textLP('\r\rYour lower belly tickles'); if (gs.breastSize > 4) { textLP(', growing much lighter'); } textLP('. Checking, you catch your lowest set of nipples disappear flat into your ' + skinDesc() + ', while the next lowest pair shrinks and the top pair swells, giving you a slope of three rows of breasts.'); }
      if (gs.boobTotal === 10) { textLP('\r\rYour lower belly and the area above your crotch tickle'); if (gs.breastSize > 4) { textLP(', growing much lighter'); } textLP('. Checking, you catch your two lowest sets of nipples disappear flat into your ' + skinDesc() + ', while the next lowest pair shrinks and the top pair swells, giving you a slope of three rows of breasts.'); }
      gs.boobTotal = 6;
    }
    if (eightBoob > nonEightBoob + 20 && gs.boobTotal !== 8) {
      // AS3 inherited bug fix: was missing boobTotal 4/6/10 transition branches.
      if (gs.boobTotal === 2) { textLP('\r\rYour lower chest and belly, close beneath your nipples, begin to tickle. A new pair of sensitive areolas form amongst your ' + skinDesc() + ', creating an extra row of breasts beneath the originals. The process repeats twice more, for a total of 8 breasts from your chest to your lower belly! And they\'re all slightly smaller than your original pair.'); if (gs.breastSize > 4) { textLP(' The new nipples protrude as fleshy mounds form from beneath them. The new boobs wobble as they grow to the same size of your original pair, lifting the originals slightly with their girth. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 4) { textLP('\r\rYour chest and belly tickle. Four new nipples form amongst your ' + skinDesc() + ', right below your second pair above your belly, leaving you with four rows of two breasts, from your chest to your lower belly.'); if (gs.breastSize > 4) { textLP(' Your original breasts shrink a little to match the ingrowing ones, until they\'re all the same size. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 6) { textLP('\r\rYour belly tickles. Two new nipples form amongst your ' + skinDesc() + ', right below your second pair above your belly, leaving you with four rows of two breasts, from your chest to your lower belly.'); if (gs.breastSize > 4) { textLP(' The lower pairs continue to grow while your top pair shrinks a little, all equalizing in size. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 10) { textLP('\r\rThe area above your crotch tickles'); if (gs.breastSize > 4) { textLP(', growing much lighter'); } textLP('. Checking, you catch your two lowest sets of nipples disappear flat into your ' + skinDesc() + ', while the rest grow slightly larger.'); }
      gs.boobTotal = 8;
    }
    if (tenBoob > nonTenBoob + 20 && gs.boobTotal !== 10) {
      // AS3 inherited bug fix: was missing boobTotal 4/6/8 grow branches.
      if (gs.boobTotal === 2) { textLP('\r\rYour lower chest and belly, close beneath your nipples, begin to tickle. A new pair of sensitive areolas form amongst your ' + skinDesc() + ', creating an extra row of breasts beneath the originals. The process repeats three more times, for a total of 10 breasts from your chest to your just above your crotch! And they\'re all slightly smaller than your original pair.'); if (gs.breastSize > 4) { textLP(' The new nipples protrude as fleshy mounds form from beneath them. The new boobs wobble as they grow to the same size of your original pair, lifting the originals slightly with their girth. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 4) { textLP('\r\rYour chest and belly tickle. Six new nipples form amongst your ' + skinDesc() + ', right below your second pair above your belly, leaving you with five rows of two breasts, from your chest to just above your crtoch.'); if (gs.breastSize > 4) { textLP(' Your original breasts shrink a little to match the ingrowing ones, until they\'re all the same size. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 6) { textLP('\r\rYour lower belly  and the area above your crotch tickle. Four new nipples form amongst your ' + skinDesc() + ', right below your third pair, leaving you with five rows of two breasts, from your chest down to your crotch.'); if (gs.breastSize > 4) { textLP(' The lower pairs continue to grow while your top pair shrinks a little, all equalizing in size. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      if (gs.boobTotal === 8) { textLP('\r\rThe area above your crotch tickles. Two new nipples form amongst your ' + skinDesc() + ', right below your fourth pair below your belly, leaving you with five rows of two breasts, from your chest to your crotch.'); if (gs.breastSize > 4) { textLP(' The lower pairs continue to grow while your top pair shrinks a little, all equalizing in size. When you head back to town, you\'ll be covering your extra indecency with your arms the best you can while you head for the tailor to update your ' + clothesTop() + ' accordingly.'); } }
      gs.boobTotal = 10;
    }
  }

  // Leg change
  const bipedal = Math.max(gs.humanAffinity, gs.horseAffinity, gs.wolfAffinity, gs.catAffinity, gs.cowAffinity, gs.lizardAffinity, gs.rabbitAffinity, gs.mouseAffinity, gs.birdAffinity, gs.pigAffinity);
  const bipedalDigiPaw = gs.skunkAffinity;
  const otherLegsArr = [gs.cowTaurAffinity, gs.humanTaurAffinity];
  const legArr = [bipedal, bipedalDigiPaw, 0, ...otherLegsArr].sort((a, b) => a - b);
  legArr.pop();
  const secondLegs = legArr[legArr.length - 1] ?? 0;
  if (gs.lockLegs === 0) {
    if (bipedalDigiPaw > secondLegs + 50 && gs.legType !== 1) { legChange(1); }
    if (bipedal > secondLegs + 50 && gs.legType !== 0) { legChange(0); }
    if (gs.cowTaurAffinity > secondLegs + 50 && gs.legType !== 1001) { legChange(1001); }
    if (gs.humanTaurAffinity > secondLegs + 50 && gs.legType !== 1002) { legChange(1002); }
  }

  // Nipple type
  const nip0 = Math.max(gs.humanAffinity, gs.horseAffinity, gs.wolfAffinity, gs.catAffinity, gs.lizardAffinity, gs.rabbitAffinity, gs.mouseAffinity, gs.birdAffinity, gs.pigAffinity);
  const nip1 = gs.cowAffinity;
  const nip2 = gs.bugAffinity;
  if (gs.lockNipples === 0) {
    if (nip0 > Math.max(nip1, nip2) + 60 && gs.nipType !== 0) { if (gs.nipType === 1) { textLP('\r\rMany of your nipples begin to tickle. They begin to shrink beneath your ' + clothesTop() + ', receding back into your breasts. As you lift the clothing away to see what\'s going on, the extra three nipples on each of your breasts fade away, leaving you with only one each.'); } if (gs.nipType === 2) { textLP('\r\rYour nipples pop out from your breast, no longer sunken or hidden within.'); } gs.nipType = 0; }
    if (nip1 > Math.max(nip0, nip2) + 60 && gs.nipType !== 1) { if (gs.nipType === 2) { textLP('\r\rYour nipples pop out from your breast, no longer sunken or hidden within.'); } if (gs.nipType === 0 || gs.nipType === 2) { textLP('\r\rSpots begin to tingle around your nipples. Your hand roves under your ' + clothesTop() + ' to inspect the areas, noticeably more sensitive than before. The patches grow softer and puff up beneath your fingertips, feeling rather... familiar? Pulling your ' + clothesTop() + ' ' + pullUD(1) + ', you can see extra nipples form around the ones you already have, complete with darkened areoles and matching size.\r\rYour breasts now each have four nipples equidistant from each other, just as functional as the originals, and just as sensitive, each looking almost like a cow\'s udder...'); } gs.nipType = 1; }
    if (nip2 > Math.max(nip0, nip1) + 60 && gs.nipType !== 2) { if (gs.nipType === 1) { textLP('\r\rMany of your nipples begin to tickle. They begin to shrink beneath your ' + clothesTop() + ', receding back into your breasts. As you lift the clothing away to see what\'s going on, the extra three nipples on each of your breasts fade away, leaving you with only one each.'); } textLP('\r\rYour nipples sink into your breasts, becoming inverted slits within your areola, only coming out when aroused.'); gs.nipType = 2; }
  }

  // Egg type
  if (gs.eggLaying > 0) {
    const egg0 = Math.max(gs.lizardAffinity, gs.birdAffinity);
    const egg1 = gs.bugAffinity;
    if (egg0 > egg1 + 20 && gs.eggType !== 0) { textLP('\r\rYou sense your womb shifting, the eggs inside feeling like their forming somehow differently than they did before.'); if (gs.eggType === 1) { gs.eggMaxTime += 22; } gs.eggType = 0; }
    if (egg1 > egg0 + 20 && gs.eggType !== 1) { textLP('\r\rYou sense your womb shifting, the eggs inside feeling like their forming somehow differently than they did before.'); if (gs.eggType === 0) { gs.eggMaxTime -= 22; } gs.eggType = 1; }
  }

  // Cock change (racial type)
  if (gs.lockCock === 0) {
    if (gs.dominant === 1 && gs.humanAffinity  > second + 25 && gs.human  > 0 && gs.cockTotal > 0 && gs.humanCocks  < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to see your cock hanging out from your body, limp and flaccid. It\'s smooth and fleshy, easily teased into erection. Its skin is slightly less sensitive, but the thick mushroom-like head twitches in your grip. It looks very much like a human\'s.'); gs.humanCocks++; cockLoss(); }
    if (gs.dominant === 2 && gs.horseAffinity  > second + 25 && gs.horse  > 0 && gs.cockTotal > 0 && gs.horseCocks  < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to watch as a thick sheath envelopes your cock. Relaxing your muscles, the cock slowly droops out over your ' + clothesBottom() + '. It\'s long and smooth, with the prepuce only reaching halfway down its length making an obvious ring. The head is flat and as you knead it in your hand, it flares wide. It looks very much like a horse\'s.'); gs.horseCocks++; cockLoss(); }
    if (gs.dominant === 3 && gs.wolfAffinity   > second + 25 && gs.wolf   > 0 && gs.cockTotal > 0 && gs.wolfCocks   < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to watch as a thin sheath envelopes your cock. Flexing your muscles, your cock slowly pushes out, red and hard, no matter how aroused you are. It\'s veiny and smooth, already a bit moist from being within the sheath. The head narrows off to a pointy tip where you can feel the urethra resides. It looks very much like a wolf\'s.'); gs.wolfCocks++; cockLoss(); }
    if (gs.dominant === 4 && gs.catAffinity    > second + 25 && gs.cat    > 0 && gs.cockTotal > 0 && gs.catCocks    < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to watch as a thin sheath envelopes your cock. Flexing your muscles, your cock slowly pushes out, pink and soft. It\'s smooth and already a bit moist from being within the sheath, covered in tiny barbs that feel rough as your hand strokes against them. The head narrows off to a pointy tip where you can feel the urethra resides. It looks very much like a cat\'s.'); gs.catCocks++; cockLoss(); }
    if (gs.dominant === 6 && gs.lizardAffinity > second + 25 && gs.lizard > 0 && gs.cockTotal > 0 && gs.lizardCocks < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to watch as your cock sinks into your body, leaving behind a small slit at the front. Flexing your muscles, the slit pushes open and your cock slowly pushes out, looking quite purple. It\'s bumpy, with ribs along its upper side and a head that looks bulbous before rapidly narrowing into a pointy tip where you can feel the urethra resides. You think it looks like a lizard\'s?'); gs.lizardCocks++; cockLoss(); }
    if (gs.dominant === 7 && gs.rabbitAffinity > second + 25 && gs.rabbit > 0 && gs.cockTotal > 0 && gs.rabbitCocks < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to watch as a thin sheath envelopes your cock. Flexing your muscles, your cock slowly pushes out, red and pointy. It\'s smooth and already a bit moist from being within the sheath, its whole length gradually narrowing to the pointy tip, reminiscent of a carrot. It looks very much like a rabbit\'s.'); gs.rabbitCocks++; cockLoss(); }
    if (gs.dominant === 12 && gs.bugAffinity   > second + 25 && gs.bug   > 0 && gs.cockTotal > 0 && gs.bugCocks    < gs.cockTotal) { textLP('\r\rYour ' + hipDesc() + ' hips twitch as your cock begins to feel strange. You open your ' + clothesBottom() + ' to see what is happening, only to see your cock hanging out from your body, with four fleshy spikes pointing back towards you from the rim of the glans, not hard enough to hurt but enough to definitely get a grip inside tender walls. The underside is also adorned with extra grip, a ridge following down the middle with many bumps along its length. You\'re not really sure what it is, but some bugs do have rather... \'wild\' penises that could come close.'); gs.bugCocks++; cockLoss(); }
  }

  // Reset pending deltas
  gs.human = 0; gs.horse = 0; gs.wolf = 0; gs.cat = 0; gs.cow = 0;
  gs.lizard = 0; gs.rabbit = 0; gs.mouse = 0; gs.bird = 0;
  gs.pig = 0; gs.skunk = 0; gs.bug = 0;

  if (gs.currentText === 'Something feels odd...') {
    textL('');
    if (_doProcess) _doProcess();
  } else {
    if (_doEnd) _doEnd();
  }
}

export function cockChange(sizeChange: number, totalChange: number): void {
  const maxCock = Math.max(gs.humanAffinity, gs.horseAffinity, gs.wolfAffinity, gs.catAffinity, gs.lizardAffinity, gs.rabbitAffinity, gs.bugAffinity);
  const nonCock = (gs.dominant === 5 || gs.dominant === 8 || gs.dominant === 9 || gs.dominant === 10 || gs.dominant === 11);

  if ((gs.cockSize + sizeChange <= 0 || (gs.cockTotal + totalChange) < 1) && gs.cockSize > 0 && gs.cockTotal > 0) {
    textLP('\r\rYou shiver a little as your cock' + plural(1) + ' and balls shrink into your body, disappearing');
    if (gs.vagTotal > 0) { textLP(', leaving you with only your vagina' + plural(2) + ' and making you solely female.'); gs.gender = 2; }
    if (gs.vagTotal < 1) { textLP(', leaving you with no genitals whatsoever. This is going to make things tough...'); gs.gender = 0; }
    gs.balls = 0; if (_stats) _stats(0, 0, -(2 * gs.cockTotal), 0);
    gs.ballSize = 0; gs.cockSize = 0; gs.cockTotal = 0;
    gs.humanCocks = 0; gs.horseCocks = 0; gs.wolfCocks = 0;
    gs.catCocks = 0; gs.lizardCocks = 0; gs.rabbitCocks = 0; gs.bugCocks = 0;
  } else if ((gs.cockTotal + totalChange) > 0 && gs.cockTotal < 1) {
    textLP('\r\rA strange sensation of arousal engulfs your groin. Your ' + clothesBottom() + ' grows tight as you feel something swell within. You don\'t have much time to pull ' + pullUD(2) + ' your ' + clothesBottom() + ' as flesh bulges over the fitted garment. Throbbing and dripping with pre, a fresh, new ');
    if (gs.dominant === 1 || (nonCock && maxCock === gs.humanAffinity))       { textLP('human ');     gs.humanCocks++; }
    else if (gs.dominant === 2 || (nonCock && maxCock === gs.horseAffinity))   { textLP('equine ');    gs.horseCocks++; }
    else if (gs.dominant === 3 || (nonCock && maxCock === gs.wolfAffinity))    { textLP('canine ');    gs.wolfCocks++; }
    else if (gs.dominant === 4 || (nonCock && maxCock === gs.catAffinity))     { textLP('feline ');    gs.catCocks++; }
    else if (gs.dominant === 6 || (nonCock && maxCock === gs.lizardAffinity))  { textLP('reptillian '); gs.lizardCocks++; }
    else if (gs.dominant === 7 || (nonCock && maxCock === gs.rabbitAffinity))  { textLP('lapin ');     gs.rabbitCocks++; }
    else if (gs.dominant === 12 || (nonCock && maxCock === gs.bugAffinity))    { textLP('insectile '); gs.bugCocks++; }
    textLP('penis stands erect and balls to match settle within your crotch beneath');
    if (gs.vagTotal > 0) { textLP(', slipping into your ' + vulvaDesc() + ' lips. You now are considered a cross between genders, a herm.'); gs.gender = 3; }
    else { textLP('. You have now graduated from androgynous to male, congratulations!'); gs.gender = 1; }
    gs.ballSize = 1; gs.balls = 2; gs.showBalls = true; gs.cockSize = 1;
    if (_stats) _stats(0, 0, 2, 0);
    gs.cockTotal = 1;
    gs.cockSize += sizeChange;
    totalChange--;
    cockChange(0, totalChange);
  } else if (totalChange > 0 && gs.cockTotal > 0) {
    textLP('\r\rA strange sensation of arousal engulfs your groin. Your ' + clothesBottom() + ' grows tight as you feel something swell within. You don\'t have much time to open your ' + clothesBottom() + ' as flesh bulges over the fitted garment. Throbbing and dripping with pre, fresh and new,');
    if (totalChange > 1) { textLP(' ' + totalChange); }
    if (gs.dominant === 1 || (nonCock && maxCock === gs.humanAffinity))       { textLP(' human ');     gs.humanCocks  += totalChange; }
    else if (gs.dominant === 2 || (nonCock && maxCock === gs.horseAffinity))   { textLP(' equine ');    gs.horseCocks  += totalChange; }
    else if (gs.dominant === 3 || (nonCock && maxCock === gs.wolfAffinity))    { textLP(' canine ');    gs.wolfCocks   += totalChange; }
    else if (gs.dominant === 4 || (nonCock && maxCock === gs.catAffinity))     { textLP(' feline ');    gs.catCocks    += totalChange; }
    else if (gs.dominant === 6 || (nonCock && maxCock === gs.lizardAffinity))  { textLP(' reptillian '); gs.lizardCocks += totalChange; }
    else if (gs.dominant === 7 || (nonCock && maxCock === gs.rabbitAffinity))  { textLP(' lapin ');     gs.rabbitCocks += totalChange; }
    else if (gs.dominant === 12 || (nonCock && maxCock === gs.bugAffinity))    { textLP(' insectile '); gs.bugCocks    += totalChange; }
    textLP('penis'); if (totalChange > 1) { textLP('es'); } textLP(' standing erect with the other' + plural(1) + '.');
    if (_stats) _stats(0, 0, 2 * totalChange, 0);
    gs.cockTotal += totalChange;
    gs.cockSize  += sizeChange;
  } else if (totalChange < 0 && gs.cockTotal > 0 && gs.cockSize > 0) {
    textLP('\r\rYou notice an odd sensation of numbness within your groin. Your ' + clothesBottom() + ' feels looser, something going missing within. By the time you open your ' + clothesBottom() + ' you notice that you have lost something.');
    gs.cockTotal += totalChange;
    let tc = totalChange;
    while (tc < 0) { cockLoss(); tc++; }
    if (_stats) _stats(0, 0, 2 * totalChange, 0);
  } else if (gs.cockTotal > 0) {
    gs.cockSize += sizeChange;
  }
}

function cockLoss(): void {
  let hasHuman  = gs.humanCocks  > 0 ? gs.humanAffinity  : 101;
  let hasHorse  = gs.horseCocks  > 0 ? gs.horseAffinity  : 101;
  let hasWolf   = gs.wolfCocks   > 0 ? gs.wolfAffinity   : 101;
  let hasCat    = gs.catCocks    > 0 ? gs.catAffinity    : 101;
  let hasLizard = gs.lizardCocks > 0 ? gs.lizardAffinity : 101;
  let hasRabbit = gs.rabbitCocks > 0 ? gs.rabbitAffinity : 101;
  let hasBug    = gs.bugCocks    > 0 ? gs.bugAffinity    : 101;
  const minCock = Math.min(hasHuman, hasHorse, hasWolf, hasCat, hasLizard, hasRabbit, hasBug);
  if (minCock === gs.humanAffinity  && gs.humanCocks  > 0) { textLP('\r\rYou have lost one human cock.');   gs.humanCocks--;  }
  else if (minCock === gs.horseAffinity  && gs.horseCocks  > 0) { textLP('\r\rYou have lost one horse cock.');   gs.horseCocks--;  }
  else if (minCock === gs.wolfAffinity   && gs.wolfCocks   > 0) { textLP('\r\rYou have lost one wolf cock.');    gs.wolfCocks--;   }
  else if (minCock === gs.catAffinity    && gs.catCocks    > 0) { textLP('\r\rYou have lost one cat cock.');     gs.catCocks--;    }
  else if (minCock === gs.lizardAffinity && gs.lizardCocks > 0) { textLP('\r\rYou have lost one lizard cock.');  gs.lizardCocks--; }
  else if (minCock === gs.rabbitAffinity && gs.rabbitCocks > 0) { textLP('\r\rYou have lost one rabbit cock.');  gs.rabbitCocks--; }
  else if (minCock === gs.bugAffinity    && gs.bugCocks    > 0) { textLP('\r\rYou have lost one bug cock.');     gs.bugCocks--;    }
}

export function vagChange(sizeChange: number, totalChange: number): void {
  // Cock-Snake escape on shrink
  if (gs.cockSnakePreg > 0 && (sizeChange < 0 || totalChange < 0)) {
    let bcSnake = 0;
    textLP('\r\rWith the changing size of your passageway, you feel a sudden squirming within your womb. You brace yourself as you feel the cock-snake within slither its way through your passage. Your ' + clothesBottom() + ' becomes drenched by your feminine lubricant as a bunch of it splashes out, the phallic head of the snake breaching your ' + vulvaDesc() + ' lips. Its body constantly drags over your sensitive flesh as it flees what is about to come, making you shudder in mild orgasm as the creature descends down your ' + legDesc(1) + '. You gasp and regain yourself, the snake slithering away. It must have been frightened by the shrinking of its home and fleed...');
    gs.cockSnakePreg = 0;
    let i = 0;
    while (i < gs.pregArray.length) {
      if (gs.pregArray[i + 1] === 503) {
        gs.pregArray[i] = false; gs.pregArray[i + 3] = 0; bcSnake++;
        if (bcSnake === 2) { textLP('\r\rAnd it\'s not the first; you shudder again as another snake in another womb escapes out from your ' + clothesBottom() + ' and down your ' + legDesc(1) + ', fleeing like the first.'); }
        if (bcSnake === 3) { textLP('\r\rFollowed by another...'); }
        if (bcSnake > 3)  { textLP('\r\rAnd another...'); }
      }
      i += 5;
    }
  }

  if (((gs.vagSize + sizeChange) <= 0 || (gs.vagTotal + totalChange) < 1) && gs.vagSize > 0 && gs.vagTotal > 0) {
    textLP('\r\rSudden intense cramping makes you double over. A slight moistness in your ' + clothesBottom() + ' causes your hand to inspect the situation. It reaches your once ' + vulvaDesc() + ' vulva just in time to feel it shrink to nothing, sealing over with ' + skinDesc() + '. It seems you have lost your vagina' + plural(2) + ', ');
    if (gs.cockTotal > 0) { textLP('leaving only your cock' + plural(1) + ' remaining. You are now considered only male.'); gs.gender = 1; }
    if (gs.cockTotal < 1) { textLP('leaving you with no genetalia, completely androgynous where it matters. Things might be difficult...'); gs.gender = 0; }
    vagBellyChange(sizeChange, totalChange);
    if (_stats) _stats(0, 0, 2 * gs.vagTotal, 0);
    gs.vagSize = 0; gs.vagTotal = 0; gs.vulvaSize = 0; gs.clitSize = 0;
    let i = 0;
    while (i < gs.pregArray.length) {
      if (gs.pregArray[i] === false) { gs.pregArray.splice(i, 5); i -= 5; }
      i += 5;
    }
  } else if ((gs.vagTotal + totalChange) > 0 && gs.vagTotal < 1) {
    textLP('\r\rYour tummy feels weird as your thighs rub against each other. Your ' + clothesBottom() + ' feels wet in the crotch, an oddly new sensation. Reaching in, your hand slips across sensitive and supple flesh. It splits beneath your touch, letting your finger slip in between the moist folds. You let out a moan as your palm slips across the sensitive bump at the front of the crevice, your finger sinking into a hole. The tip brushes against an even more sensitive ring that sinks further into your body - a fresh womb.');
    if (totalChange > 1) { textLP(' Yet, that\'s simply the first. More moistness slimes your hand as ' + totalChange + ' more gashes fill your ' + vulvaDesc() + ' groin, all as sensitive and large as the first. A bevy of pussies for your fingers to slip into, your hand rolling over all the labia and making you gasp with all the separate erotic thrills.'); }
    gs.vagSize = 1; gs.vulvaSize = 1; gs.clitSize = 1;
    if (_stats) _stats(0, 0, 2 * totalChange, 0);
    vagBellyChange(sizeChange, totalChange);
    gs.vagTotal += totalChange;
    gs.vagSize  += sizeChange;
    if (gs.cockTotal > 0) { textLP('\r\rYou lay your ' + cockDesc() + ' cock back down to cover your new slit, as you\'re now considered to be both genders... A herm.'); gs.gender = 3; }
    else { textLP('\r\rYou have now graduated from androgynous to female, congratulations!'); gs.gender = 2; }
    let tc = totalChange;
    while (tc > 0) { if (gs.pregArray.length / 5 < gs.vagTotal) { gs.pregArray.push(false, 0, 0, 0, 0); tc--; } else { tc = 0; } }
  } else if (totalChange > 0 && gs.vagTotal > 0) {
    textLP('\r\rYour ' + clothesBottom() + ' feels wet in the crotch, an oddly new sensation. Reaching in, your hand slips across another slit of sensitive and supple flesh. It splits beneath your touch, letting your finger slip in between the moist folds. You let out a moan as your palm slips across another bump at the front of the crevice, your finger sinking into a hole. A brand new vagina to go with the rest.');
    vagBellyChange(sizeChange, totalChange);
    if (_stats) _stats(0, 0, 2 * totalChange, 0);
    gs.vagTotal += totalChange;
    gs.vagSize  += sizeChange;
    let tc = totalChange;
    while (tc > 0) { if (gs.pregArray.length / 5 < gs.vagTotal) { gs.pregArray.push(false, 0, 0, 0, 0); tc--; } else { tc = 0; } }
  } else if (totalChange < 0 && (gs.vagTotal + totalChange) > 0) {
    textLP('\r\rYou notice an odd sensation of numbness within your groin. Slipping a hand into your ' + clothesBottom() + ', you notice you\'re missing ' + (-totalChange) + ' of your vaginas.');
    vagBellyChange(sizeChange, totalChange);
    if (_stats) _stats(0, 0, 2 * totalChange, 0);
    gs.vagTotal += totalChange;
    gs.vagSize  += sizeChange;
    let tc = totalChange;
    while (tc < 0) {
      let found = false;
      let i = 0;
      while (i < gs.pregArray.length) {
        if (gs.pregArray[i] === false) { gs.pregArray.splice(i, 5); tc++; found = true; break; }
        i += 5;
      }
      if (!found) { tc = 0; }
    }
  } else if (gs.vagTotal > 0) {
    vagBellyChange(sizeChange, totalChange);
    gs.vagSize += sizeChange;
  }
}

export function vagBellyChange(sizeChange: number, totalChange: number): void {
  // AS3 declared newBelly:int — truncate to match original behavior
  const newBelly = Math.floor((gs.vagSize + sizeChange) * (gs.vagTotal + totalChange) * gs.vagSizeMod - gs.tallness / 2);
  const nb = newBelly < 0 ? 0 : newBelly;
  if (nb < gs.vagBellyMod) { textLP('\r\rYour belly flattens slightly as the amount of vaginal flesh within becomes less disproportionate to your body.'); }
  else if (nb > gs.vagBellyMod) { textLP('\r\rYour belly bulges slightly more as the vaginal flesh within takes up more room than your belly can handle...'); }
  gs.vagBellyMod = nb < 0 ? 0 : nb;
}

export function legChange(which: number): void {
  // Tauric loss
  if (gs.legType > 1000 && which < 1000) {
    textLP('\r\rA strange sensation envelopes your tauric half. Things pop and grow tight as the backside shrinks, your back legs dwindling down into your rear crotch while your secondary chest shrivels and your spine shortens up. The entirety of your tauric half shrinks back to your primary body, leaving you to fall back onto your ' + buttDesc() + ' ass while your crotch shifts forward to nestle between your front legs.');
    if (gs.legType === 1001) {
      textLP(' Your keratin hooves soften and elongate into bipedal feet, the black and white fur disappearing to match your ' + skinDesc() + '.');
      if (!udderCheck(2) && gs.udders === true) { textLP(' Your udder also shrinks away into nothing...'); gs.udders = false; gs.udderLactation = 0; gs.udderEngorgement = 0; gs.udderEngorgementLevel = 0; gs.udderPlay = 0; gs.udderSize = 0; gs.teatSize = 0; }
      else { textLP(' Your udder is still there, though, hanging just below your belly, having slipped up through your legs just before your crotch came through.'); }
    }
    if (gs.legType === 1002) { if (gs.tail === 1002) { textLP(' Your ' + tailDesc() + ' tail, also disappears with your extra half, no longer swishing above your backside.'); gs.tail = 0; } gs.runMod += 10; gs.carryMod -= 15; }
    textLP('\r\rIt takes several minutes before you can manage to stand without the extra legs to square you off... It feels so strange, like a great weight has been lifted yet at the same time things feel heavier. It\'s going to take a bit of walking to get used to...');
    gs.carryMod -= 100;
  }
  // Bipedal
  if (gs.legType !== 0 && which === 0) {
    if (gs.legType === 1) { textLP('\r\rYour paws feel strange as they begin to narrow and shrink. You almost lose your balance and fall over, but your ankles touch against the floor, having grown away from your knees and forming heels. The space between your paws and ankles thicken, providing a wider base to stand upon. Feet. Not quite as agile, but a bit sturdier.'); }
  }
  // Biped digitigrade
  if (gs.legType !== 1 && which === 1) {
    if (gs.legType === 0) { textLP('\r\rYour feet ache as your ankles lengthen and your lower-leg shortens. Your knees bend out to keep you balanced and you rise up onto your toes to stand digitigrade. Your toes also change to help, growing larger and rounder, with soft pads beneath, until the ends of your feet become a paws. Eventually, you quickly learn to balance and walk with these paws on your digitigrade legs, feeling much lighter on your \'feet\', though it\'s more difficult to carry as much weight on such agile things.'); }
    if (gs.legType >= 1000) { textLP('\r\rBut then, your feet ache as your ankles lengthen and your lower-leg shortens. Your knees bend out to keep you balanced and you rise up onto your toes to stand digitigrade. Your toes also change to help, growing larger and rounder, with soft pads beneath, until the ends of your feet become a paws. Eventually, you quickly learn to balance and walk with these paws on your digitigrade legs, feeling much lighter on your \'feet\', though it\'s more difficult to carry as much weight on such agile things.'); }
    gs.carryMod -= 10; gs.runMod += 10;
  }
  if (gs.legType === 1 && which !== 1) { gs.carryMod += 10; gs.runMod -= 10; }
  // Tauric gain
  if (gs.legType < 1000 && which > 1000) {
    if (gs.legType === 0 || gs.legType === 1) { textLP('\r\rYour ' + hipDesc() + ' hips begin to ache as you feel something grow from them within your ' + clothesBottom() + '. Not outward, however, but towards your backside. As your hands grasp them, you can feel your thickening pelvis split in two. Your ' + buttDesc() + ' rear moves away from your body as the second pelvis grows along your tailbone, your spine forming more vertebrae to extend further. You collapse to your knees while your ass tears through your ' + clothesBottom() + ', taking your crotch away from your original legs with it. Bumps form from the new pelvis as two new limbs begin to grow from the sides of your crotch, a second set of legs that touch down upon the ground, making you stumble as they grow longer and turn your rump and crotch upwards to face straight out, as though you were bending over. Your insides feel even stranger as many of your internal organs shift around, doubling or expanding down in between your two sets of legs. More ribs sprout from the lengthening spine, forming a second chest cavity that guards the organs.\r\rIt takes a few minutes before your body finishes growing its second set of legs and nearly a complete second body. A tauric body. You falter a bit as you try to stand on all 4 of your legs, your arms helping pick you up from the ground but waving for balance as your original torso teeters on top. It\'s a very strange sensation as your mind adjusts to account for a second set of legs, working them in unison until you can walk while your second belly swings between them. Though you do feel like you can hold up much more with this strong, broader frame, so that\'s a plus. On the other hand, your ass and genital region are much further away now, while your original crotch feels more like a neck to the second body, so that\'s going to take some getting used to...'); }
    if (gs.legType === 1) { gs.carryMod += 10; gs.runMod -= 10; }
    if (_changeBot) _changeBot(-1);
    gs.carryMod += 100;
  }
  // Cowtaur
  if (gs.legType !== 1001 && which === 1001) {
    textLP('\r\rYour tauric half feels strange and tingly.');
    if (gs.skinType !== 2) { textLP(' Short fur sprouts up from your ' + skinDesc() + ', only on your tauric half, white in color with large black spots'); }
    else { textLP(' The fur on your tauric half turns white in color, with large black spots around it'); }
    textLP(', while your ' + buttDesc() + ' ass grows larger and more square from the second hips. The ends of your legs harden, your ankles rising as the balls of your feet terminate in keratin hooves.');
    if (gs.udders === false) { textLP(' And you feel a weight growing from your tauric belly. You look around yourself to see 4 long teats extend, an udder growing beneath you, making your lower half look much like a dairy cow...'); gs.udders = true; gs.udderSize = 2 * gs.breastSize; gs.teatSize = 2 * gs.nippleSize; }
    else { textLP(' Your udder also went along with the rest of your crotch, now hanging down from your tauric belly and threatening to drag across the ground if it gets too big, instead of sitting at your normal waist.'); }
  }
  if (gs.legType === 1001 && which !== 1001 && which > 1000) {
    if (!udderCheck(2) && gs.udders === true) { textLP('\r\rYour udder shrinks into your ' + skinDesc() + ' and disappears...'); gs.udders = false; gs.udderLactation = 0; gs.udderEngorgement = 0; gs.udderEngorgementLevel = 0; gs.udderPlay = 0; gs.udderSize = 0; gs.teatSize = 0; }
  }
  // Humantaur
  if (gs.legType !== 1002 && which === 1002) {
    textLP('\r\rAll four feet relax themselves against the ground, level from toes to heels, standing plantigrade and sturdy. Not exactly fast and a bit awkward, but they can hold much more weight, especially considering your second half is as thin as the first and would have otherwise not been the best frame for carrying things across your extended back.');
    if (gs.tail > 0 && gs.tail !== 1002 && gs.hair !== 0) { textLP(' And your ' + tailDesc() + ' shifts into hairs that matches the hair on your head.'); }
    else if (gs.tail === 0 && gs.hair !== 0) { textLP(' And to finish off the transformation, just above your butt sprouts a tail of hairs from your tailbone that matches the hair on your head and swishes with your control.'); }
    else { textLP(' You also feel some extra muscle control above your butt, around your tailbone, where it feels like you\'ve got a tail, but there\'s nothing there to speak of yet.'); }
    gs.tail = 1002; gs.runMod -= 10; gs.carryMod += 15;
  }
  if (gs.legType === 1002 && which !== 1002 && which > 1000) { gs.runMod += 10; gs.carryMod -= 15; }
  gs.legType = which;
}

export function boobChange(sizeChange: number): void {
  gs.breastSize += sizeChange;
  gs.nippleSize += sizeChange;
}

export function udderChange(sizeChange: number): void {
  gs.udderSize += sizeChange;
  gs.teatSize  += sizeChange;
}

export function udderCheck(which: number): boolean {
  let tempBool = false;
  if (which !== 1 && gs.cowAffinity >= 55) { tempBool = true; }
  if (which !== 2 && gs.legType === 1001)  { tempBool = true; }
  return tempBool;
}

export function lactChange(which: number, amount: number): void {
  if (which === 1 && (gs.lactation + amount) >= 1 && gs.lactation < 1) {
    textLP('\r\rBlotches spread across your ' + clothesTop() + ' around your nipples. Curiously, you dab your finger in the moistness and take a taste. Milk... Your breasts seem to have begun lactating!');
    gs.nipplePlay = 20;
  }
  if (which === 2 && (gs.udderLactation + amount) >= 1 && gs.udderLactation < 1 && gs.udders === true) {
    textLP('\r\rBlotches spread across your ' + clothesBottom() + ', starting from your teats. Curiously, you dab your finger in the moistness and take a taste. Milk... Your udder seems to have begun lactating!');
    gs.udderPlay = 20;
  }
  if (which === 1 && (gs.lactation + amount) < 1 && gs.lactation >= 1) {
    textLP('\r\rYour nipples feel exceptionally dry... It seems your breasts are no longer producing milk.');
    gs.nipplePlay = 0;
    if (gs.milkEngorgementLevel === 1) { boobChange(-1); }
    if (gs.milkEngorgementLevel === 2) { boobChange(-2); }
    if (gs.milkEngorgementLevel === 3) { boobChange(-3); }
    gs.milkEngorgementLevel = 0;
    gs.milkEngorgement = 0;
  }
  if (which === 2 && (gs.udderLactation + amount) < 1 && gs.udderLactation >= 1 && gs.udders === true) {
    textLP('\r\rYour teats feel exceptionally dry... It seems your udder is no longer producing milk.');
    if (gs.udderEngorgementLevel === 1) { udderChange(-2); }
    if (gs.udderEngorgementLevel === 2) { udderChange(-5); }
    if (gs.udderEngorgementLevel === 3) { udderChange(-8); }
    gs.udderEngorgementLevel = 0;
    gs.udderEngorgement = 0;
    gs.udderPlay = 0;
  }
  if (which === 1) { gs.lactation += amount; }
  if (which === 2) { gs.udderLactation += amount; }

  if (gs.milkSuppressant <= 0) {
    if ((gs.lactation <= 0 || (gs.udderLactation <= 0 && gs.udders === true)) && gs.pregStatus > 0) {
      textLP(' ...However a few minutes later your milk starts right back up. Seems your body needs the milk for something else.');
      gs.lactation = 20;
      if (gs.udders === true) { gs.udderLactation = 20; }
    }
    if ((gs.lactation < 3000 || (gs.udderLactation < 3000 && gs.udders === true)) && checkItem(252)) {
      textLP(' ...However a few minutes later you begin to squirt again, soaking your outfit. The milky pendant feels warmer than usual, suffusing its essence back into your body and preventing you from being less drippy...');
      gs.lactation = 3000;
      if (gs.udders === true) { gs.udderLactation = 3000; }
    }
  }
}
