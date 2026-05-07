// Ported from Appearances.as
import { gs } from '../core/GameState.ts';
import { outputSideText, textL, decGet } from '../ui/TextRenderer.ts';
import { viewButtonOutline, viewButtonText, buttonWrite } from '../ui/ButtonManager.ts';
import { doProcess } from '../core/GameEngine.ts';
import { moistCalc } from '../core/Calculations.ts';
import { checkItem, itemName } from '../content/Items.ts';
import {
  bodyDesc, hipDesc, buttDesc, faceDesc, tailDesc, earDesc, legDesc, legWhere,
  skinDesc, vulvaDesc, clitDesc, oneYour, plural, udderDesc, teatDesc, cockDesc,
  ballDesc, bellyDesc, boobDesc, nipDesc, regionName, raceName, genName, domName,
} from '../content/Descriptions.ts';
import { hairC, hairDesc, hairstyleLength, hairL } from '../content/Hair.ts';
import { clothesTop, clothesBottom } from '../content/Clothes.ts';

function navButtons(activeSlot: number): void {
  // 1=MoreStats, 2=Titles, 3=Statuses, 5=Levels, 6=Gear, 7=Help, 9=Appearance, 11=Credits, 12=Return
  viewButtonOutline(1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1);
  const texts = [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1];
  texts[activeSlot - 1] = 0; // zero-index: slot-1 → dim that one
  viewButtonText(
    activeSlot !== 1  ? 1 : 0,
    activeSlot !== 2  ? 1 : 0,
    activeSlot !== 3  ? 1 : 0,
    0,
    activeSlot !== 5  ? 1 : 0,
    activeSlot !== 6  ? 1 : 0,
    activeSlot !== 7  ? 1 : 0,
    0,
    activeSlot !== 9  ? 1 : 0,
    0,
    activeSlot !== 11 ? 1 : 0,
    1,
  );
  if (activeSlot !== 1)  buttonWrite(1, 'More Stats');
  if (activeSlot !== 2)  buttonWrite(2, 'Titles');
  if (activeSlot !== 3)  buttonWrite(3, 'Statuses');
  if (activeSlot !== 5)  buttonWrite(5, 'Levels');
  if (activeSlot !== 6)  buttonWrite(6, 'Gear');
  if (activeSlot !== 7)  buttonWrite(7, 'Help');
  if (activeSlot !== 9)  buttonWrite(9, 'Appearance');
  if (activeSlot !== 11) buttonWrite(11, 'Credits');
  buttonWrite(12, 'Return');
  gs.doListen = function(): void {
    if (gs.buttonChoice === 1  && activeSlot !== 1)  { detailedStats(); }
    if (gs.buttonChoice === 2  && activeSlot !== 2)  { detailedTitles(); }
    if (gs.buttonChoice === 3  && activeSlot !== 3)  { detailedStatuses(); }
    if (gs.buttonChoice === 5  && activeSlot !== 5)  { detailedLevels(); }
    if (gs.buttonChoice === 6  && activeSlot !== 6)  { detailedGear(); }
    if (gs.buttonChoice === 7  && activeSlot !== 7)  { detailedHelp(); }
    if (gs.buttonChoice === 9  && activeSlot !== 9)  { appearanceGo(); }
    if (gs.buttonChoice === 11 && activeSlot !== 11) { detailedCredits(); }
    if (gs.buttonChoice === 12) { doProcess(); }
  };
}

export function appearanceGo(): void {
  let s = '';
  s += 'You began your journey as a ' + raceName() + '.\r\r';
  s += Math.floor(gs.tallness / 12) + ' feet and ' + (gs.tallness - Math.floor(gs.tallness / 12) * 12) + ' inches tall, you wield ' + hipDesc() + ' hips and a ' + buttDesc() + ' butt on an overall ' + bodyDesc() + ' figure.';

  if (gs.hair > 0) {
    s += ' With ' + hairC() + hairDesc();
    if (hairstyleLength(gs.hair)) s += ' ' + hairL();
    s += ', you look much like a' + genName() + ' ' + domName();
  } else {
    s += ' You look much like a' + genName() + ' ' + domName();
  }
  s += faceDesc();
  if (gs.tail > 1) s += ', and a ' + tailDesc() + ' tail swishing upon your backside';

  if (gs.skunkAffinity >= 40) {
    s += '. A rather alluring scent constant lingers from your rump, sweet and pleasant, but with the potential for something far worse';
    if (gs.skinType === 2) {
      s += '. Your fur also sports two stripes that connect at your brow and runs over your head down to the scented area';
      if (gs.tail === 11) s += ' where they connect to the stripes on your tail';
    }
  }

  s += '. ' + earDesc() + '.';

  if (checkItem(234)) {
    s += ' Large, multi-pointed, slightly fuzzy antlers grow out from atop your head, feeling slightly heavy but perfectly melded to your skull so you can easily lift them.';
  }
  if (checkItem(101)) {
    s += ' Soft padding protects the palms of your hands, making them look much like paws, your nails being sharp claws.';
  } else if (gs.dominant === 9) {
    s += ' Pointy talons grow from the tips of your fingers, more menacing than normal nails but not useful enough to be a threat.';
  }

  if (gs.legType >= 1000) {
    s += ' From your waist down extends an almost second body, complete with a second belly and set of legs, standing on four ' + legDesc(10) + ". 'Taur' tends to be the term for such a being, with your crotch and rump far back at the end of the continued body.";
    if (gs.legType === 1001) s += ' This second body is covered in white fur with large black patches, and your ass is squared off a bit from the bulky rear hips.';
    if (gs.legType === 1002) s += ' This second body matches the ' + skinDesc() + ' of your upper half, with a thin and lithe torso, looking somewhat like a humans and not exactly made for riding but makes up for the frailness with plantigrade feet that easily support yourself, even though they aren\'t the speediest.';
  }
  if (checkItem(102) || gs.legType === 1001) {
    s += ' Keratin extends from your combined toes like hooves, your ankle angled upward and high up like a second backwards knee, making you walk on the tips of your hooved toes with a clap against the ground every step.';
  } else if (gs.legType === 1) {
    s += ' Your ankles elongated and lithe, the front of your feet are large wide paws that help balance you as you walk digitigrade, your steps nothing but a soft and gentle patter against the ground.';
  } else if (gs.skinType === 5 && legDesc(10) === 'feet') {
    s += ' Chitin extends further past your heels, making you stand higher and balancing more on your toes.';
  }
  if (checkItem(234)) {
    s += ' Your ' + buttDesc() + ' butt also looks a bit tighter for its size with the ' + skinDesc() + ' around it a lighter color than the rest, acting like a bullseye to your nethers. Below, the bone structure of your ' + legDesc(2) + ' is also fairly lithe, causing you to step with a graceful swagger and wave your ' + hipDesc() + ' hips erotically with every footfall.';
  }

  s += '\r\rYou are currently wearing a ';
  if (gs.attireTop !== gs.attireBot) s += clothesTop() + ' and ' + clothesBottom() + ' that cover';
  else s += clothesTop() + ' that covers';
  if (gs.snuggleBall === true) s += ' the thick and soft layer of plushy snuggliness which coats';
  s += ' your ' + skinDesc() + ' ';
  if (gs.weapon === 10) s += 'while you defend yourself unarmed.';
  else s += 'while you defend yourself with a ' + itemName(gs.weapon) + ' as your weapon.';
  if (gs.lilaWetStatus > 0 && (gs.attireBot === 10 || gs.attireBot === 11)) {
    s += " Although, your " + clothesBottom() + " doesn't do much to stem your squishy flow of slick fluids, just like a certain little felin girl.";
  }

  if (gs.legType >= 1000) {
    s += ' Your tauric waist measures ' + decGet(gs.tallness * 0.75 + gs.pregnancyTime / 10 + gs.vagBellyMod / 8 + gs.bellyMod / 10, 1) + ' inches around, your ' + bellyDesc() + ' belly swinging underneath.';
  } else {
    s += ' Your waist measures ' + decGet(gs.tallness / 2 + gs.pregnancyTime / 10 + gs.vagBellyMod / 8 + gs.bellyMod / 10, 1) + ' inches around, sporting a ' + bellyDesc() + ' belly beneath your ' + clothesTop() + '.';
  }

  if (gs.dominant === 10) s += ' There\'s also a bit of extra pudge around your waist, some chubbiness to add to your pig-like nature.';

  if (gs.wings > 0) {
    s += ' Holes over your shoulders help your ';
    if (gs.wings === 9) s += 'feathery';
    s += ' wings stretch freely, even though they\'re not of much use beyond hopping around and fly out of battle.';
  }

  if (gs.dairyFarmBrand === true) {
    s += ' Beneath your ' + clothesBottom() + ', the shape of a bucket with milk splashing out over the edges is forever imprinted upon your ' + buttDesc() + ' hind, marking you as property of the Softlik Dairy Farm.';
  }

  // Breasts
  if (gs.breastSize > 0) {
    const bs2 = decGet(gs.breastSize * 0.5, 1);
    if (gs.boobTotal === 2)  s += '\r\rUpon your chest heaves ' + gs.boobTotal + ' ' + boobDesc() + ' breasts. Your bust measures ' + bs2 + ' inches in circumference beyond that of your chest, with ' + nipDesc();
    if (gs.boobTotal === 4)  s += '\r\rUpon your chest heaves ' + gs.boobTotal + ' ' + boobDesc() + ' breasts; two pairs of equal size, one close below the other. Your dual busts each measure ' + bs2 + ' inches in circumference beyond that of your chest, with ' + nipDesc();
    if (gs.boobTotal === 6)  s += '\r\rUpon your chest and down to your belly heaves ' + gs.boobTotal + ' ' + boobDesc() + ' breasts; three pairs diminishing in size the lower they go. Your bust measures ' + bs2 + ' inches in circumference beyond that of your chest, the next pair measuring ' + decGet(gs.breastSize * 0.25, 2) + ' inches and the next measuring ' + decGet(gs.breastSize * 0.15, 2) + ' inches; each with ' + nipDesc();
    if (gs.boobTotal === 8)  s += '\r\rUpon your chest and down to your lower belly heaves ' + gs.boobTotal + ' ' + boobDesc() + ' breasts; four pairs all the same size and practically stacked on top of each other. Your bust measures ' + decGet(gs.breastSize * 0.38, 1) + ' inches in circumference beyond that of your chest, the lower pairs just as large; each with ' + nipDesc();
    if (gs.boobTotal === 10) s += '\r\rUpon your chest and down to just above your crotch heaves ' + gs.boobTotal + ' ' + boobDesc() + ' breasts; five pairs all the same size and practically stacked on top of each other. Your bust measures ' + decGet(gs.breastSize * 0.4, 1) + ' inches in circumference beyond that of your chest, the lower pairs just as large; each with ' + nipDesc();
    if (gs.dominant === 5) s += 'teats';
    else                   s += 'nipples';
    if (gs.nipType === 2) s += ' hidden within slits in your areola.';
    else if (gs.lust < 50)  s += ' softly bulging ' + decGet(gs.nippleSize * 0.1, 1) + ' inches beyond that.';
    else if (gs.lust < 75)  s += ' stiffly standing ' + decGet(gs.nippleSize * 0.2, 1) + ' inches beyond that.';
    else                    s += ' achingly hard and reaching ' + decGet(gs.nippleSize * 0.25, 1) + ' inches beyond that.';
    if (gs.nipType === 1) s += " With four nubs each, your breasts look quite similar to cows' udders.";
    if (gs.lactation > 0) {
      if (gs.milkEngorgementLevel === 2) s += ' A few drops of milk dangle from each nipple as you pull your ' + clothesTop() + ' from your engorged breasts to inspect yourself.';
      if (gs.milkEngorgementLevel === 3) s += ' Milk sprays from each of your nipples as you pull your ' + clothesTop() + ' from your heavily engorged breasts to inspect yourself, and continue to dribble down your belly and soaking into your ' + clothesBottom() + '.';
    }
    if (gs.milkSuppressantLact > 0) {
      if (gs.milkEngorgementLevel === 2) s += ' The mounds beneath your nipples feel a bit swollen and sensitive, holding back all their milk.';
      if (gs.milkEngorgementLevel === 3) s += " The mounds beneath your nipples stand more perk than ever, despite feeling so heavy; so stuffed with milk that they're fairly hard.";
    }
  }

  // Udder
  if (gs.udders === true) {
    if (gs.legType === 1001) s += '\r\rJust behind your tauric belly, squishing between your rear legs, hangs a ' + udderDesc() + ' udder ';
    else if (gs.cowAffinity >= 55) s += '\r\rJust below your belly hangs a ' + udderDesc() + ' udder ';
    s += 'with 4 ' + teatDesc() + ' teats, each ' + decGet(gs.teatSize * 0.2, 1) + ' inches long';
    if (gs.udderLactation > 0) {
      if (gs.udderEngorgementLevel === 2) s += ' and dribbling milk from your engorgement';
      if (gs.udderEngorgementLevel === 3) s += ' and practically spraying milk onto the ground before you from your excessive engorgment';
    }
    if (gs.milkSuppressantUdder > 0) {
      if (gs.milkEngorgementLevel === 2) s += ' feeling stiff as the bag beneath them is swollen with milk';
      if (gs.milkEngorgementLevel === 3) s += ' feeling quite hard and almost pointing straight out from the very swollen bag beneath them';
    }
    s += '.';
  }

  // Cocks
  if (gs.cockTotal > 0) {
    s += '\r\rAbove your groin rests ' + gs.cockTotal + ' ' + cockDesc() + ' wang' + plural(1) + '.';
    const cs2 = decGet(gs.cockSize * gs.cockSizeMod * 0.5, 1);
    const cs25 = decGet(gs.cockSize * gs.cockSizeMod * 0.25, 2);
    const thk12 = decGet(gs.cockSize * gs.cockSizeMod / 12, 1);
    const thk16 = decGet(gs.cockSize * gs.cockSizeMod / 16, 1);
    const m1 = moistCalc(1);
    if (gs.lust <= 30) {
      if (gs.humanCocks > 0)  s += ' ' + gs.humanCocks + ' dangle' + plural(3) + ' flaccidly from your groin, reaching ' + cs25 + ' inches down, with smooth skin and a mushroom-like glans, just like a human\'s.';
      if (gs.horseCocks > 0)  s += ' ' + gs.horseCocks + ' hide' + plural(3) + ' within a fuzzy sheath that protrudes from your groin, around ' + thk12 + ' inches in thickness.';
      if (gs.wolfCocks > 0 || gs.catCocks > 0 || gs.rabbitCocks > 0) s += ' ' + (gs.wolfCocks + gs.catCocks + gs.rabbitCocks) + ' hide' + plural(3) + ' within a fuzzy sheath that protrudes from your groin, around ' + thk16 + ' inches in thickness.';
      if (gs.lizardCocks > 0) s += ' ' + gs.lizardCocks + ' hide' + plural(3) + ' in a slit, flush against your body.';
      if (gs.bugCocks > 0)    s += ' ' + gs.bugCocks + ' dangle' + plural(3) + ' flaccidly from your groin, reaching ' + cs25 + ' inches down, its four spikes around glans soft and blunt at the moment, the bumpy ridge underneath soft, almost like a bug\'s.';
      if (m1 > 2) {
        s += ' Drops of pre slowly bead at the tip of your cock' + plural(1) + ', ';
        if (gs.horseCocks > 0 || gs.wolfCocks > 0 || gs.catCocks > 0 || gs.rabbitCocks > 0) s += ' pooling within your sheath' + plural(1) + ',';
        s += ' running down your thighs as it continually blotches your ' + clothesBottom() + ', even though you\'re barely aroused at all. The slime is enough to slip yourself into a pussy smaller than you are long, at least.';
      }
    }
    if (gs.lust > 30 && gs.lust <= 70) {
      if (gs.humanCocks > 0)  s += ' ' + gs.humanCocks + ' stand' + plural(3) + ' erect, reaching ' + cs2 + ' inches up, with smooth skin and a mushroom-like glans, just like a human\'s.';
      if (gs.horseCocks > 0)  s += ' ' + gs.horseCocks + ' droop' + plural(3) + ' out of a ' + thk12 + '-inch thick smooth sheath, reaching ' + cs2 + ' inches down your thigh with a ring of prepuce halfway down its length and a flat head at the end, just like a horse\'s.';
      if (gs.wolfCocks > 0)   s += ' ' + gs.wolfCocks + ' poke' + plural(3) + ' out of a ' + thk16 + '-inch thick fuzzy sheath, red and hard, smooth and covered in veins with a narrowing tip' + plural(1) + ', standing ' + cs2 + ' inches high, just like a wolf\'s.';
      if (gs.catCocks > 0)    s += ' ' + gs.catCocks + ' poke' + plural(3) + ' out of a ' + thk16 + '-inch thick fuzzy sheath, pink and soft, with tender barbs near the narrowing tip' + plural(1) + ', standing ' + cs2 + ' inches high, just like a cat\'s.';
      if (gs.lizardCocks > 0) s += ' ' + gs.lizardCocks + ' poke' + plural(3) + ' through the slit, stretching it wide as the purple flesh pulses with the ribbing along the top slightly stiff and the bulbous head feeling squishy to the touch, the narrow tip reaching ' + cs2 + ' inches high, probably like a reptile\'s.';
      if (gs.rabbitCocks > 0) s += ' ' + gs.rabbitCocks + ' poke' + plural(3) + ' out of a ' + thk16 + '-inch thick fuzzy sheath, red and pointy, gently narrowing to their tip' + plural(1) + ', somewhat like a carrot, standing ' + cs2 + ' inches high, just like a rabbit\'s.';
      if (gs.bugCocks > 0)    s += ' ' + gs.bugCocks + ' stand' + plural(3) + ' erect, reaching ' + cs2 + ' inches up, with four fleshy spikes poking out from the rim of the glans and a sturdy bumpy ridge lining the underside, almost like a bug\'s.';
      if (gs.knot === true)   s += ' Your cock' + plural(1) + ' swell' + plural(3) + ' a little near the base, preparing for a chance for the knot' + plural(1) + ' to expand.';
      if (m1 > 2 && m1 <= 5) s += ' Drops of pre slowly bead at the tip of your cock' + plural(1) + ',  running down your thighs as it blotches your ' + clothesBottom() + '. The slime is enough to slip yourself into a pussy smaller than you are long, at least.';
      if (m1 > 5)             s += ' Pre steadily drips from your groin, making a large wet spot on your ' + clothesBottom() + ', looking more like you had peed yourself from all the seminal fluid.  Fortunately, you could probably slip ' + oneYour(1) + ' cock' + plural(1) + ' into a pussy smaller than you are, thanks to all the lubrication.';
    }
    if (gs.lust > 70) {
      if (gs.humanCocks > 0)  s += ' ' + gs.humanCocks + ' stand' + plural(3) + ' erect, reaching ' + cs2 + ' inches up, throbbing strongly with smooth skin and a mushroom-like glans that is nearly purple in color, just like a human\'s.';
      if (gs.horseCocks > 0)  s += ' ' + gs.horseCocks + ' twitches out of a ' + thk12 + '-inch thick smooth sheath, trying to stand ' + cs2 + ' inches from your body with a ring of prepuce halfway down its length and a flaring flat head at the end, just like a horse\'s.';
      if (gs.wolfCocks > 0)   s += ' ' + gs.wolfCocks + ' throb' + plural(3) + ' out of a ' + thk16 + '-inch thick fuzzy sheath, red and hard, smooth and covered in veins that almost look purple, they\'re so full of blood, with a narrowing tip' + plural(1) + ', standing ' + cs2 + ' inches high, just like a wolf\'s.';
      if (gs.catCocks > 0)    s += ' ' + gs.catCocks + ' stiffly stand' + plural(3) + ' out of a ' + thk16 + '-inch thick fuzzy sheath, pink and nearly hard, with tender barbs bristling out near the narrowing tip' + plural(1) + ', standing ' + cs2 + ' inches high, just like a cat\'s.';
      if (gs.lizardCocks > 0) s += ' ' + gs.lizardCocks + ' harden' + plural(3) + ' through the slit, stretching it wide as the purple flesh throbs with the ribbing along the top nearly like actual bone and the bulbous head feeling quite swollen, the narrow tip reaching ' + cs2 + ' inches high, probably like a reptile\'s.';
      if (gs.rabbitCocks > 0) s += ' ' + gs.rabbitCocks + ' stiffly stand' + plural(3) + ' out of a ' + thk16 + '-inch thick fuzzy sheath, red and throbbing, almost breaking the conical shape with the pulsing, and standing ' + cs2 + ' inches high, just like a rabbit\'s.';
      if (gs.bugCocks > 0)    s += ' ' + gs.bugCocks + ' stand' + plural(3) + ' erect, reaching ' + cs2 + ' inches up, throbbing strongly with four spikes jutting out around the glans, hard and pointy, and a bumpy ridge lining the underside that presses outward, almost like a bug\'s.';
      if (gs.knot === true)   s += ' Your cock' + plural(1) + ' bulge' + plural(3) + ' tremendously at ' + plural(5) + ' base' + plural(1) + ', the knot' + plural(1) + ' completely expecting to come at any moment and nearly ' + decGet(gs.cockSize * gs.cockSizeMod / 4, 1) + ' inches thick.';
      if (m1 > 2 && m1 <= 5)  s += ' Drops of pre slowly bead at the tip of your cock' + plural(1) + ',  running down your thighs as it blotches your ' + clothesBottom() + '. The slime is enough to slip yourself into a pussy smaller than you are long, at least.';
      if (m1 > 5 && m1 <= 10) s += ' Pre steadily drips from your groin, making a large wet spot on your ' + clothesBottom() + ', looking more like you had peed yourself from all the seminal fluid. Fortunately, you could probably slip ' + oneYour(1) + ' cock' + plural(1) + ' into a pussy smaller than you are, thanks to all the lubrication.';
      if (m1 > 10)             s += ' Your ' + clothesBottom() + ' feels completely swamped as pre flies from your lower half as you move about. Standing still for too long, you quickly form a small puddle of the slick stuff. You could probably stuff ' + oneYour(1) + ' cock' + plural(1) + ' into a pussy half your size without any difficulty, you\'re so slimy!';
    }
  }

  // Balls
  if (gs.showBalls === true && gs.balls > 0) {
    s += '\r\rBeneath your cock' + plural(1) + ' swing' + plural(3) + ' a scrotum filled with ' + gs.balls + ' ' + ballDesc() + ' testicles.';
    if (gs.blueBalls > 36 && gs.blueBalls <= 84) s += ' They groan and squirm, full of hot cum just waiting to blow.';
    if (gs.blueBalls > 84) s += ' They groan so strongly you shudder slightly. They\'re so full of cum that they ache a bit, desperately wanting to come.';
  }

  // Vagina
  if (gs.vagTotal > 0) {
    const m2 = moistCalc(2);
    s += '\r\rAlso, ' + legWhere(1) + ' your ' + legDesc(2) + ' nestles ' + gs.vagTotal + ' ' + vulvaDesc() + ' pair' + plural(2) + ' of feminine nether-lips, about ' + decGet(gs.vagSize * gs.vagSizeMod * 0.5, 1) + ' inches deep, when aroused.';
    if (gs.vagSize * gs.vagSizeMod * gs.vagTotal > gs.tallness / 2) s += ' So deep, in fact, that your belly bulges more because of the excess vaginal flesh.';
    if (gs.lust <= 30) {
      if (gs.clitSize > gs.vulvaSize * 3) s += ' Although you\'re hardly aroused, your ' + clitDesc() + ' clit' + plural(2) + ' dangle' + plural(4) + ' softly from the front of your slit' + plural(2) + ', measuring nearly ' + decGet(gs.clitSize * 0.1, 1) + ' inches in length.';
      if (m2 > 2) s += ' Lubrication makes your cunt' + plural(2) + ' slick, the lips slipping past each other as you walk, while the slime continually blotches the crotch of your ' + clothesBottom() + ', whether you\'re horny or not. Fortunately, you could take a cock slightly bigger than you are deep, thanks to the slickness.';
    }
    if (gs.lust > 30 && gs.lust <= 70) {
      s += ' Your ' + clitDesc() + ' clit' + plural(2) + ' swell' + plural(4) + ' from the hood' + plural(2) + ' at the front of your slit' + plural(2) + ', reaching ' + decGet(gs.clitSize * 0.2, 1) + ' inches in length and making you walk awkwardly as the sensitive button' + plural(2) + ' rub' + plural(4) + ' between your thighs.';
      if (m2 > 2 && m2 <= 5) s += ' Lubrication makes your cunt' + plural(2) + ' slick, the lips slipping past each other as you walk, while the slime continually blotches the crotch of your ' + clothesBottom() + ', whether you\'re horny or not. Fortunately, you could take a cock slightly bigger than you are deep, thanks to the slickness.';
      if (m2 > 5)             s += ' So much feminine honey drips from your cunt' + plural(2) + ' that it looks like you have peed in your ' + clothesBottom() + ' and webs of slime form sheets ' + legWhere(2) + ' your ' + legDesc(2) + '. But, with all that lubrication you could take a cock around one and a half times long as you are deep.';
    }
    if (gs.lust > 70) {
      s += ' Your ' + clitDesc() + ' clit' + plural(2) + ' swell' + plural(4) + ' tremendously from the hood' + plural(2) + ' at the front of your slit' + plural(2) + ', reaching ' + decGet(gs.clitSize * 0.25, 2) + ' inches in length. You walk awkwardly half the time as squeezing the clit' + plural(2) + ' and swollen lips between your thighs is often too much, making you hunger to hump something.';
      if (m2 > 2 && m2 <= 5)  s += ' Lubrication makes your cunt' + plural(2) + ' slick, the lips slipping past each other as you walk, while the slime continually blotches the crotch of your ' + clothesBottom() + ', whether you\'re horny or not. Fortunately, you could take a cock slightly bigger than you are deep, thanks to the slickness.';
      if (m2 > 5 && m2 <= 10) s += ' So much feminine honey drips from your cunt' + plural(2) + ' that it looks like you have peed in your ' + clothesBottom() + ' and webs of slime form sheets ' + legWhere(2) + ' your ' + legDesc(2) + '. But, with all that lubrication you could take a cock around one and a half times long as you are deep.';
      if (m2 > 10)             s += ' A slow waterfall of feminine honey drips from your crotch, your ' + clothesBottom() + ' completely soaked. If you stand for too long, you worry your ' + legDesc(10) + ' will slip in the puddle you quickly make beneath you. It\'s so much that you could probably take a cock twice as large as you are deep!';
    }
    if (gs.heat > 0 && gs.heatTime < 0) s += ' Your nether-lips are also puffier and redder than usual, heat emanating from your loins, an oven just waiting to cook something...';
  }

  if (gs.showSide === true) { outputSideText(s, true); }
  else {
    textL(s);
    // AS3 hid slot 9 (Appearance — current page) and slot 10 (unused).
    // The TS port previously hid slot 1 (More Stats) by mistake, making it unclickable.
    viewButtonOutline(1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1);
    viewButtonText(1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1);
    buttonWrite(1, 'More Stats');
    buttonWrite(2, 'Titles');
    buttonWrite(3, 'Statuses');
    buttonWrite(5, 'Levels');
    buttonWrite(6, 'Gear');
    buttonWrite(7, 'Help');
    buttonWrite(11, 'Credits');
    buttonWrite(12, 'Return');
    gs.doListen = function(): void {
      if (gs.buttonChoice === 1)  { detailedStats(); }
      if (gs.buttonChoice === 2)  { detailedTitles(); }
      if (gs.buttonChoice === 3)  { detailedStatuses(); }
      if (gs.buttonChoice === 5)  { detailedLevels(); }
      if (gs.buttonChoice === 6)  { detailedGear(); }
      if (gs.buttonChoice === 7)  { detailedHelp(); }
      if (gs.buttonChoice === 11) { detailedCredits(); }
      if (gs.buttonChoice === 12) { doProcess(); }
    };
  }
}

export function detailedStats(): void {
  let s = 'These are the modifiers and multipliers for more detailed stats beyond your base stats:\r';
  s += '\rStrength Modifier:\t\t\t' + gs.strMod;
  s += '\rMentality Modifier:\t\t\t' + gs.mentMod;
  s += '\rLibidio Modifier:\t\t\t' + gs.libMod;
  s += '\rSensitivity Modifier:\t\t\t' + gs.senMod;
  s += '\r';
  s += '\rSexP Multiplier:\t\t\t\t' + gs.SexPMod;
  s += '\rAdapting Multiplier:\t\t\t' + gs.changeMod;
  s += '\rCarry Capacity Modifier:\t' + gs.carryMod;
  s += '\rHit Point Modifier:\t\t\t+' + gs.HPMod;
  s += '\rBonus Coin Gain:\t\t\t+' + gs.coinMod;
  s += '\r';
  s += '\rPenis Size Multiplier:\t\t' + gs.cockSizeMod;
  s += '\rVagina Size Multiplier:\t\t' + gs.vagSizeMod;
  s += '\rSemen Multiplier:\t\t\t' + gs.cumMod;
  s += '\rButt Size Multiplier:\t\t\t' + gs.buttMod;
  s += '\rHip Size Multiplier:\t\t\t' + gs.hipMod;
  const babyFreeAdj = gs.babyFree > 0 ? -50 : 0;
  s += '\rPregnancy Chance:\t\t\t' + (10 + gs.pregChanceMod + babyFreeAdj) + '%';
  s += '\rExtra Baby Chance Mod:\t+' + gs.extraPregChance + '%';
  s += '\rPregnancy Time Mod:\t\t' + gs.pregTimeMod + 'hrs';
  s += '\rPregnancy Time Rate:\t\t' + gs.pregRate + 'x';
  s += '\rBoob Lactation Rate:\t\t' + gs.lactation + 'ml/hr';
  if (gs.udders === true) s += '\rUdder Lactation Rate:\t\t' + gs.udderLactation + 'ml/hr';
  s += '\rMilk Modifier:\t\t\t\t+' + gs.milkMod + 'ml/hr';
  s += '\rBonus Milk Capacity:\t\t' + gs.milkCap + 'ml';
  s += '\r';
  s += '\rRape Modifier:\t\t\t\t+' + gs.rapeMod;
  s += '\rEnticement Modifier:\t\t+' + gs.enticeMod;
  s += '\rRun Chance:\t\t\t\t' + (20 + gs.runMod) + '%';

  if (gs.showSide === true) { outputSideText(s, true); }
  else {
    textL(s);
    navButtons(1);
    buttonWrite(9, 'Appearance');
  }
}

export function detailedTitles(): void {
  let s = 'Around town, you are thought of as being:\r';
  const { enticeMod, ment, lib, cockSize, cockSizeMod, tallness, breastSize, cockTotal,
    vulvaSize, clitSize, vagTotal, ballSize, balls, cumMod, lactation, udderLactation,
    milkMod, pregnancyTime, vagBellyMod, dominant, currentZone, cowAffinity, malonRep,
    malonChildren, lilaRep, silRep, silPreg } = gs;

  if (enticeMod >= 10 && (ment + 40) < lib && lib > 75)   s += '\rA Sex Monster';
  else if ((ment + 40) < lib && lib > 60)                  s += '\rA Sex Fiend';
  else if (enticeMod >= 10 && lib > 60)                    s += '\rA Slut';
  else if (enticeMod >= 10)                                s += '\rA Whore';

  if (cockSize * cockSizeMod > tallness && breastSize > tallness * 3 && cockTotal > 0 && (vulvaSize > 50 || clitSize * 3 > tallness) && vagTotal > 0) s += '\rA Mobile Pile of Naughtiness';
  else if (cockSize * cockSizeMod > tallness && cockSize * cockSizeMod > 300 && cockTotal > 0) s += '\rCock Mountain';
  else if (vulvaSize * tallness > 300 && vulvaSize > 50 && vagTotal > 0) s += '\rThe Mobile Fuckable Hill';
  else if (cockSize * cockSizeMod * 2 > tallness && cockSize * cockSizeMod > 100 && cockTotal > 0) s += '\rA Massive Dick';
  else if (vulvaSize * tallness > 100 && vulvaSize > 50 && vagTotal > 0) s += '\rA Giant Pussy';

  if (cockTotal > 10) s += '\rA Cock-Forest';
  else if (cockTotal > 4) s += '\rA Cock-Tree';
  if (vagTotal > 10) s += '\rPussy Galore';
  else if (vagTotal > 4) s += '\rGreat for Orgies';

  const cumPower = ballSize * (ballSize / 2) * balls * cumMod * 2;
  if (cumPower > 20000) s += "\rThe 'Cum Flooder'";
  else if (cumPower > 5000) s += '\rDangerous When You Come';
  else if (cumPower > 1000) s += '\rOverflowing With Seed';

  if (breastSize > tallness * 3) s += '\rMissus Tits';
  else if (breastSize > tallness * 2) s += '\rWildly Top-Heavy';
  else if (breastSize > tallness) s += '\rBlessed by the Boob Goddess';
  else if (breastSize * 2 > tallness) s += '\rSurprisingly Stacked';
  else if (breastSize * 4 > tallness) s += '\rThe Beautiful Bouncy Boobs that Everyone Stares At';

  if ((lactation + milkMod > 15000 && lactation > 0) || (gs.udderLactation + milkMod > 30000 && gs.udderLactation > 0)) s += '\rThe Milk Cannon';
  else if ((lactation + milkMod > 5000 && lactation > 0) || (gs.udderLactation + milkMod > 10000 && gs.udderLactation > 0)) s += '\rA Walking Milk Tank';
  else if ((lactation + milkMod > 500 && lactation > 0) || (gs.udderLactation + milkMod > 1000 && gs.udderLactation > 0)) s += '\rA Dairy Cow';

  if (pregnancyTime + vagBellyMod > 500 && vagTotal > 0) s += "\rThe 'Extraordinary Enormous Pregnant Belly'";
  else if (pregnancyTime + vagBellyMod > 300 && vagTotal > 0) s += '\rA Fertility Goddess';

  s += '\r\rWithin ' + regionName(currentZone) + ' specifically, you are considered to be:\r';
  if (dominant === currentZone) s += '\rA Fellow Native';
  else                          s += '\rA Strange Outsider';
  if (currentZone === 1) {
    if (cowAffinity > 50)    s += '\rFrom the Dairy Farm';
    if (malonRep === 2)      s += "\rMalon's Personal Milker";
    if (malonRep === 3)      s += "\rMalon's Lover";
    if (malonRep > 3)        s += "\rMalon's Loving Partner";
    if (malonChildren > 4)   s += '\rThe Progenitor of a New Race';
  }
  if (currentZone === 4) {
    if (lilaRep === 2) s += "\rLila's Friend";
    if (lilaRep === 3) s += "\rLila's 'Playmate'";
    if (lilaRep === 4) s += "\rLila's Close Friend";
    if (lilaRep === 5) s += "\rLila's Kinky Mate";
  }
  if (currentZone === 6) {
    if (silRep === 1) s += "\rA Friend of the Strange Woman";
    if (silRep > 1 && silRep < 4) s += "\rSilandrias' Virile Companion";
    if (silRep > 3 && silRep < 6) s += "\rSilandrias' Excessively Fertile Companion";
    if (silRep === 6) s += "\rSilandrias' Trusted Lover and Mate";
    if (silRep === 6 && silPreg > 5000) s += '\rThe Progenitor of an Extinct Race';
  }

  if (gs.showSide === true) { outputSideText(s, true); }
  else { textL(s); navButtons(2); }
}

export function detailedStatuses(): void {
  let s = 'The following status effects are currently active on you that you are aware of: (Name - Hours Left)\r';
  if (gs.masoPot > 0)           s += '\rMasochism Potion\t\t' + gs.masoPot;
  if (gs.sMasoPot > 0)          s += '\rSupererior Maso. Pot.\t\t' + gs.sMasoPot;
  if (gs.babyFree > 0)          s += '\rBaby Free\t\t\t\t' + gs.babyFree;
  if (gs.charmTime > 0)         s += '\rCharmed\t\t\t\t' + gs.charmTime;
  if (gs.pheromone > 0)         s += '\rPheromones\t\t\t' + gs.pheromone;
  if (gs.eggceleratorTime > 0)  s += '\rEggcelerator\t\t\t' + gs.eggceleratorTime;
  if (gs.bodyOil > 0)           s += '\rBody Oil\t\t\t\t' + gs.bodyOil;
  if (gs.fertileGel > 0)        s += '\rFertile Gel\t\t\t' + gs.fertileGel;
  if (gs.milkSuppressant > 0)   s += '\rMilk Suppressant\t' + gs.milkSuppressant;
  s += '\r';
  if (gs.exhaustionPenalty === 2) s += '\rExhausted';
  if (gs.exhaustionPenalty === 1) s += '\rTired';
  if (gs.lustPenalty > 0)       s += '\rHorny';
  if (gs.heatTime < 0)          s += '\rIn Heat';
  if (gs.milkEngorgementLevel > 0) s += '\rEngorged Breasts';
  if (gs.udderEngorgementLevel > 0) s += '\rEngorged Udder';
  if (gs.blueBalls > 84)        s += '\rBlue Balls';
  if (gs.pregnancyTime > 36)    s += '\rPregnant';
  s += '\r';
  if (gs.lockTail > 0)     s += '\rRacial-locked Tail';
  if (gs.lockFace > 0)     s += '\rRacial-locked Face';
  if (gs.lockSkin > 0)     s += '\rRacial-locked Skin';
  if (gs.lockBreasts > 0)  s += '\rRacial-locked Breasts';
  if (gs.lockEars > 0)     s += '\rRacial-locked Ears';
  if (gs.lockLegs > 0)     s += '\rRacial-locked Legs';
  if (gs.lockNipples > 0)  s += '\rRacial-locked Nipples';
  if (gs.lockCock > 0)     s += '\rRacial-locked Cocks';

  if (gs.showSide === true) { outputSideText(s, true); }
  else { textL(s); navButtons(3); }
}

export function detailedLevels(): void {
  let s = 'You have the following perks and their respective ranks:\r';
  if (gs.babyFactLevel > 0)    s += '\rBaby Factory\t\t' + gs.babyFactLevel;
  if (gs.bodyBuildLevel > 0)   s += '\rBody Builder\t\t' + gs.bodyBuildLevel;
  if (gs.hyperHappyLevel > 0)  s += '\rHyper Happy\t\t' + gs.hyperHappyLevel;
  if (gs.alchemistLevel > 0)   s += '\rAlchemist\t\t' + gs.alchemistLevel;
  if (gs.milkMaidLevel > 0)    s += '\rMilk Maid\t\t' + gs.milkMaidLevel;
  if (gs.shapeshiftyLevel > 0) s += '\rShapeshifty\t\t' + gs.shapeshiftyLevel;
  s += '\r\rFor a total of ' + gs.level + ' levels.';

  if (gs.showSide === true) { outputSideText(s, true); }
  else { textL(s); navButtons(5); }
}

export function detailedGear(): void {
  let s = 'You have the following items in your Bag:\r';
  for (let i = 0; i <= gs.bagArray.length; i++) {
    if (gs.bagArray[i] && gs.bagArray[i] !== 0) {
      s += '\r' + itemName(gs.bagArray[i]);
      if (gs.bagStackArray[i] > 1) s += ' x' + gs.bagStackArray[i];
    }
  }

  if (gs.showSide === true) { outputSideText(s, true); }
  else { textL(s); navButtons(6); }
}

export function detailedHelp(): void {
  let s = '';
  s += '<b><u>Stats</u></b>\r';
  s += '\r-Strength - Adds to damage, rape chance, carry capacity, and HP. Reduces SexP gain from sex and masturbation.';
  s += '\r-Mentality - Fights hostile lust gain, improves helpful lust loss.';
  s += '\r-Libido - Increases lust gain, can hinder mentality in events.';
  s += '\r-Sensitivity - Increases damage taken and increases lust loss.';
  s += '\r-HP - Your Hit Points. Lose too much and you\'ll pass out.';
  s += '\r-Lust - Can overwhelm your actions, resulting in getting raped in battle, but large pleasant losses of lust grant SexP.';
  s += '\r\r<b><u>Actions</u></b>\r';
  s += '\r-Stash - Extra inventory space that you cannot carry, but moves with you from town to town.';
  s += "\r-Prostitute - When desparate for money, you can resort to prostitution. Remember, beggars can't be choosers and you may not like the company.";
  s += '\r-Alchemy - Mix items together to get other items. Learn recipes around the world.';
  s += '\r-Bag - Where you hold all your items. Shift+Click will allow you to select an item to move, Shift+Click a slot to move it to.';
  s += '\r-Rape - A combat action to attempt to overpower your opponent and sex their brains out. An aroused opponent is easier to rape.';
  s += '\r-Entice - A combat action to raise opponent\'s lust (if they find you attractive).';
  s += '\r-Run - A combat action to flee from battle. Running in a dungeon will leave the dungeon.';
  s += "\r-Submit - Because some people can't wait to be king- I mean raped.";
  s += '\r\r<b><u>Tips</u></b>\r';
  s += '\r-Carry Capacity - Determined by strength, height, body type, and modifiers. Determines how much of yourself you can carry.';
  s += '\r-Shops - Each town has unique wares in many of their shops, so it\'s good to look around.';
  s += '\r-Race - Some racial features are based on whatever blood is most dominant. Some features can be shared.';
  s += '\r-Bust Size - 1 inch of bust circumference = 1 cup in real life. 1 inch = A-cup, 4 inches = D-cup, 4.5 inches = DD-cup, 26 inches = Z-cup.';
  s += '\r-Breasts - Everybody has breasts. Yes, even males. How many is determined by your race.';
  s += '\r-Empty Button - Outside of inventories, these mean you have access to something, but do not currently have the correct item/requirements.';
  s += '\r\r<b><u>Hotkeys</u></b>\r';
  s += '\rOnly function when they show.';
  s += '\r-Save = F2, Load = F4, New Game = Backspace, Appearance = U';
  s += '\r-Font Size+ = Up, Font Size- = Down, Theme = Left, Font Color = Right';
  s += '\r-Reset Font Size = Ctrl, Font Bold = /?, Toggle Side Window = .';
  s += '\r-Side window buttons (in order):';
  s += '\r\tUIOP';
  s += '\r\tHJKL';
  s += '\r-Main choice buttons (both keyboard and NumPad in order):';
  s += '\r\tQWER\t789-';
  s += '\r\tASDF\t456+';
  s += '\r\tZXCV\t123Enter';

  if (gs.showSide === true) { outputSideText(s, true); }
  else { textL(s); navButtons(7); }
}

export function detailedCredits(): void {
  let s = 'Nimin v' + gs.versionNumber + '\rCreated by:\t--Xadera\r\twww.furaffinity.net/user/xadera/\r\rOriginal concept by:\t--Fenoxo\r\tfenoxo.com';
  s += '\r\rSpecial thanks to SumigakiFox (owner of Silandrias) and Arlyurl (made the Nimin image) on FA.';
  s += '\r\rProstitution scene editors (thanks for the work!): Torakazu, Bahamad, and omegaokami on FA.';
  s += '\r\rProstitution scene writers:\r\t--Buncubus, BantinNysam, TheAbyssalWatcher, mike12345, V, grottokraft, Ludoergosum, perrothetraveler, reikonova, shockblock99, Kidou, bunnybunbun, supernaut, shaesullivan, m3chawolf, Kizzneth, barkbarkboom, Torakazu';

  if (gs.showSide === true) { outputSideText(s, true); }
  else { textL(s); navButtons(11); }
}

/** updateSide — refresh the side panel based on sideFocus */
export function updateSide(): void {
  if (gs.sideFocus === 1) appearanceGo();
  if (gs.sideFocus === 2) detailedStats();
  if (gs.sideFocus === 3) detailedStatuses();
  if (gs.sideFocus === 4) detailedHelp();
  if (gs.sideFocus === 5) detailedLevels();
  if (gs.sideFocus === 6) detailedGear();
  if (gs.sideFocus === 7) detailedTitles();
  if (gs.sideFocus === 8) detailedCredits();
}
