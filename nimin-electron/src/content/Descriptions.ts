// Ported from Descriptions.as
import { gs } from '../core/GameState.ts';
import { percent } from '../core/GameUtilities.ts';
import { ballRatio } from '../core/Calculations.ts';
import { bustRatio, nipTallRatio, nipBreastRatio } from '../content/Breasts.ts';
import { waistRatio, waistFromPregnancy, waistFromFat } from '../systems/Pregnancy.ts';
import { hairC } from '../content/Hair.ts';

/** Return zone name for a given zone id */
export function regionName(zone: number): string {
  const names: Record<number, string> = {
    1: 'Softlik',
    2: 'Firmshaft',
    3: 'Tieden',
    4: "Siz'Calit",
    6: 'Oviasis',
    12: 'Sanctuary',
  };
  return names[zone] ?? 'Unknown';
}

/**
 * plural(topic) — returns pronoun/conjugation variants.
 * Odds = cocks, evens = vaginas.
 * 1/2: "s" when multiple (noun plural)
 * 3/4: "s" when singular (verb 3rd person)
 * 5/6: "its"/"their"
 * 7/8: "it's"/"they're"
 * 9/10: "it"/"them"
 * 11/12: "it"/"they"
 * 13/14: "is"/"are"
 * 15: "es" for penis→penises
 * 16: "y"/"ies" for pussy→pussies
 */
export function plural(topic: number): string {
  let tempStr = '';
  if (topic === 1  && gs.cockTotal > 1)  tempStr = 's';
  if (topic === 2  && gs.vagTotal > 1)   tempStr = 's';
  if (topic === 3  && gs.cockTotal < 2)  tempStr = 's';
  if (topic === 4  && gs.vagTotal < 2)   tempStr = 's';
  if (topic === 5  && gs.cockTotal < 2)  tempStr = 'its';
  if (topic === 5  && gs.cockTotal > 1)  tempStr = 'their';
  if (topic === 6  && gs.vagTotal < 2)   tempStr = 'its';
  if (topic === 6  && gs.vagTotal > 1)   tempStr = 'their';
  if (topic === 7  && gs.cockTotal < 2)  tempStr = "it's";
  if (topic === 7  && gs.cockTotal > 1)  tempStr = "they're";
  if (topic === 8  && gs.vagTotal < 2)   tempStr = "it's";
  if (topic === 8  && gs.vagTotal > 1)   tempStr = "they're";
  if (topic === 9  && gs.cockTotal < 2)  tempStr = 'it';
  if (topic === 9  && gs.cockTotal > 1)  tempStr = 'them';
  if (topic === 10 && gs.vagTotal < 2)   tempStr = 'it';
  if (topic === 10 && gs.vagTotal > 1)   tempStr = 'them';
  if (topic === 11 && gs.cockTotal < 2)  tempStr = 'it';
  if (topic === 11 && gs.cockTotal > 1)  tempStr = 'they';
  if (topic === 12 && gs.vagTotal < 2)   tempStr = 'it';
  if (topic === 12 && gs.vagTotal > 1)   tempStr = 'they';
  if (topic === 13 && gs.cockTotal < 2)  tempStr = 'is';
  if (topic === 13 && gs.cockTotal > 1)  tempStr = 'are';
  if (topic === 14 && gs.vagTotal < 2)   tempStr = 'is';
  if (topic === 14 && gs.vagTotal > 1)   tempStr = 'are';
  if (topic === 15 && gs.cockTotal > 1)  tempStr = 'es';
  if (topic === 16 && gs.vagTotal < 2)   tempStr = 'y';
  if (topic === 16 && gs.vagTotal > 1)   tempStr = 'ies';
  return tempStr;
}

/** "one of your" vs "your" for a single organ when you may have multiple */
export function oneYour(topic: number): string {
  if (topic === 1) {
    return gs.cockTotal > 1 ? 'one of your' : 'your';
  }
  if (topic === 2) {
    return gs.vagTotal > 1 ? 'one of your' : 'your';
  }
  return 'ONE YOUR ERROR';
}

export function bodyDesc(): string {
  const { gender, body, hips, breastSize } = gs;
  if (gender === 1) {
    if (body <= 11)  return 'childish';
    if (body <= 17) {
      if (hips > 3 && breastSize > 4) return 'shemale';
      if (hips > 2) return 'femme-boyish';
      return 'boyish';
    }
    if (body <= 25) return 'manly';
    return 'musclebound';
  }
  if (gender === 2) {
    if (body <= 10)  return 'childish';
    if (body > 17 && breastSize <= 2) return 'cunt-boy';
    if (body > 20)   return 'musclebound';
    if (body <= 14)  return 'girly';
    if (hips > 4 || gs.butt > 4 || breastSize > 4) return 'voluptuous';
    return 'womanly';
  }
  if (gender === 3) {
    if (body <= 11)  return 'childish';
    if (body <= 23) {
      if (hips > 2 && breastSize > 2) return 'feminine';
      return 'masculine';
    }
    return 'musclebound';
  }
  // gender 0
  if (body <= 11)  return 'childish';
  if (body <= 15)  return 'teenage';
  if (body <= 23)  return 'fully grown';
  return 'musclebound';
}

export function tailDesc(): string {
  const chance = percent();
  let tempStr = '';
  if (chance <= 100) {
    if (gs.tail === 2)    tempStr = 'equine';
    if (gs.tail === 3)    tempStr = 'wolfish';
    if (gs.tail === 4)    tempStr = 'cat-like';
    if (gs.tail === 5)    tempStr = 'bovine';
    if (gs.tail === 6)    tempStr = 'reptillian';
    if (gs.tail === 7)    tempStr = 'bunny';
    if (gs.tail === 8)    tempStr = 'mousy';
    if (gs.tail === 9)    tempStr = 'birdy';
    if (gs.tail === 10)   tempStr = 'piggy';
    if (gs.tail === 11)   tempStr = 'skunky';
    if (gs.tail === 12)   tempStr = 'thick ovipositor';
  }
  if (chance <= 50) {
    if (gs.tail === 2)    tempStr = 'bristly';
    if (gs.tail === 3)    tempStr = 'fluffy';
    if (gs.tail === 4)    tempStr = 'lithe';
    if (gs.tail === 5)    tempStr = 'skinny, bristly-tipped';
    if (gs.tail === 6)    tempStr = 'thick, sleek';
    if (gs.tail === 7)    tempStr = 'poofy puff-ball';
    if (gs.tail === 8)    tempStr = 'thin, naked';
    if (gs.tail === 9)    tempStr = 'feathery';
    if (gs.tail === 10)   tempStr = 'short, curly';
    if (gs.tail === 11)   tempStr = 'big striped fluffy';
    if (gs.tail === 12)   tempStr = 'wide bulbous';
  }
  return tempStr;
}

export function boobDesc(): string {
  const chance = percent();
  const bust = bustRatio();
  let tempStr = '';
  if (chance <= 100) {
    if (bust <= 1.03)  tempStr = 'flat';
    else if (bust <= 1.07)  tempStr = 'nearly flat';
    else if (bust <= 1.125) tempStr = 'perky';
    else if (bust <= 1.2)   tempStr = 'bouncy';
    else if (bust <= 1.3)   tempStr = 'jiggly';
    else if (bust <= 1.45)  tempStr = 'swinging';
    else if (bust <= 1.66)  tempStr = 'swaying';
    else if (bust <= 2)     tempStr = 'huge';
    else if (bust <= 2.4)   tempStr = 'impressive';
    else if (bust <= 2.9)   tempStr = 'immense';
    else if (bust <= 3.6)   tempStr = 'humongous';
    else if (bust <= 4.5)   tempStr = 'massive';
    else if (bust <= 6)     tempStr = 'enormous';
    else if (bust <= 8)     tempStr = 'gigantic';
    else if (bust <= 11)    tempStr = 'gargantuan';
    else if (bust <= 15)    tempStr = 'tremendous';
    else if (bust <= 20)    tempStr = 'colossal';
    else if (bust <= 30)    tempStr = 'monstrous';
    else tempStr = 'kaiju';
  }
  if (chance > 50) {
    // AS3 inherited bug fix: the original "flat" alt-descriptor was an empty
    // string, producing output like "2  breasts" (double space, no adjective)
    // ~50% of the time for very-tiny-bust characters. Use 'flat' to match
    // the chance≤100 branch and ensure the sentence always reads correctly.
    if (bust <= 1.03)  tempStr = 'flat';
    else if (bust <= 1.07)  tempStr = 'tiny';
    else if (bust <= 1.125) tempStr = 'palmable';
    else if (bust <= 1.2)   tempStr = 'hand-filling';
    else if (bust <= 1.3)   tempStr = 'ample';
    else if (bust <= 1.45)  tempStr = 'arm-filling';
    else if (bust <= 1.66)  tempStr = 'head-sized';
    else if (bust <= 2)     tempStr = 'belly-resting';
    else if (bust <= 2.4)   tempStr = 'belly-covering';
    else if (bust <= 2.9)   tempStr = 'hip-reaching';
    else if (bust <= 3.6)   tempStr = 'thigh-hitting';
    else if (bust <= 4.5)   tempStr = 'knee-bouncing';
    else if (bust <= 6)     tempStr = 'floor-touching';
    else if (bust <= 8)     tempStr = 'ground-dragging';
    else if (bust <= 11)    tempStr = 'bed-sized';
    else if (bust <= 15)    tempStr = 'road-clearing';
    else if (bust <= 20)    tempStr = 'room-filling';
    else if (bust <= 30)    tempStr = 'building-sized';
    else tempStr = 'mobile-landmark';
  }
  return tempStr;
}

export function udderDesc(): string {
  const chance = percent();
  const u = gs.udderSize / 2;
  let tempStr = '';
  if (chance <= 100) {
    if (u <= 2)   tempStr = 'nearly flat';
    else if (u <= 8)   tempStr = 'noticeable';
    else if (u <= 20)  tempStr = 'large';
    else if (u <= 40)  tempStr = 'huge';
    else if (u <= 76)  tempStr = 'humongous';
    else if (u <= 146) tempStr = 'massive';
    else if (u <= 210) tempStr = 'gargantuan';
    else if (u <= 280) tempStr = 'tremendous';
    else if (u <= 560) tempStr = 'colossal';
    else tempStr = 'ridiculously huge';
  }
  if (chance > 50) {
    if (u <= 2)   tempStr = 'tiny';
    else if (u <= 8)   tempStr = 'palmable';
    else if (u <= 20)  tempStr = 'ample';
    else if (u <= 40)  tempStr = 'head-sized';
    else if (u <= 76)  tempStr = 'hefty';
    else if (u <= 146) tempStr = 'beachball-sized';
    else if (u <= 210) tempStr = 'normally back-breaking';
    else if (u <= 280) tempStr = 'view-obscuring';
    else if (u <= 560) tempStr = 'bed-sized';
    else tempStr = 'road-filling';
  }
  return tempStr;
}

export function teatDesc(): string {
  const chance = percent();
  const t = gs.teatSize;
  let tempStr = '';
  if (chance <= 100) {
    if (t <= 2)   tempStr = 'normal';
    else if (t <= 5)   tempStr = 'noticeable';
    else if (t <= 9)   tempStr = 'blatant';
    else if (t <= 30)  tempStr = 'normal-for-a-cow';
    else if (t <= 50)  tempStr = 'cock-like';
    else if (t <= 100) tempStr = 'horsecock-like';
    else if (t <= 140) tempStr = 'arm-length';
    else if (t <= 300) tempStr = 'street-clearing';
    else tempStr = 'obscene';
  }
  if (chance > 50) {
    // AS3 inherited bug fix: same pattern as boobDesc — empty alt-descriptor
    // for the smallest tier produced "with  teats" (double space) ~50% of
    // the time on cow-race chars with tiny teats. Use 'small' to give a
    // sensible smallest-teat descriptor (chance≤100 branch uses 'normal').
    if (t <= 2)   tempStr = 'small';
    else if (t <= 5)   tempStr = 'perky';
    else if (t <= 9)   tempStr = 'hypnotizing';
    else if (t <= 30)  tempStr = 'long';
    else if (t <= 50)  tempStr = 'huge';
    else if (t <= 100) tempStr = 'enormous';
    else if (t <= 140) tempStr = 'extreme';
    else if (t <= 300) tempStr = 'ridiculous';
    else tempStr = 'obscene';
  }
  return tempStr;
}

export function buttDesc(): string {
  const chance = percent();
  const b = gs.butt * gs.buttMod;
  let tempStr = '';
  if (chance <= 100) {
    if (b <= 2)   tempStr = 'flat';
    else if (b <= 5)   tempStr = 'tight';
    else if (b <= 15)  tempStr = 'ample';
    else if (b <= 30)  tempStr = 'large';
    else if (b <= 50)  tempStr = 'huge';
    else if (b <= 80)  tempStr = 'grand';
    else if (b <= 130) tempStr = 'jumbo';
    else if (b <= 175) tempStr = 'giant';
    else tempStr = 'ginormous';
  }
  if (chance > 50) {
    if (b <= 2)   tempStr = 'boney';
    else if (b <= 5)   tempStr = 'firm';
    else if (b <= 15)  tempStr = 'grope-able';
    else if (b <= 30)  tempStr = 'jiggly';
    else if (b <= 50)  tempStr = 'pillow-like';
    else if (b <= 80)  tempStr = 'wobbling';
    else if (b <= 130) tempStr = 'swaying';
    else if (b <= 175) tempStr = 'bouncing';
    else tempStr = 'constantly quivering';
  }
  return tempStr;
}

export function vulvaDesc(): string {
  const chance = percent();
  const v = gs.vulvaSize;
  let tempStr = '';
  if (chance <= 100) {
    if (v <= 2)   tempStr = 'tiny';
    else if (v <= 8)   tempStr = 'plush';
    else if (v <= 16)  tempStr = 'plump';
    else if (v <= 24)  tempStr = 'huge';
    else if (v <= 36)  tempStr = 'enormous';
    else if (v <= 54)  tempStr = 'gigantic';
    else if (v <= 84)  tempStr = 'humongous';
    else if (v <= 124) tempStr = 'tremendous';
    else if (v <= 160) tempStr = 'colossal';
    else tempStr = 'ridiculous';
  }
  if (chance > 50) {
    if (v === 2)  tempStr = 'childlike';
    else if (v <= 8)   tempStr = 'dainty';
    else if (v <= 16)  tempStr = 'kissable';
    else if (v <= 24)  tempStr = 'groin-filling';
    else if (v <= 36)  tempStr = 'thigh-spreading';
    else if (v <= 54)  tempStr = legDesc(1) + '-' + legVerb(2);
    else if (v <= 84)  tempStr = 'ground-scraping';
    else if (v <= 124) tempStr = 'person-sized';
    else if (v <= 160) tempStr = 'room-sized';
    else tempStr = 'building-sized';
  }
  return tempStr;
}

export function cockDesc(): string {
  const chance = percent();
  const tempCock = Math.floor(gs.cockSize * gs.cockSizeMod);
  let tempStr = '';
  if (chance <= 100) {
    if (tempCock <= 8)    tempStr = 'puny';
    else if (tempCock <= 12)   tempStr = 'average-sized';
    else if (tempCock <= 24)   tempStr = 'big';
    else if (tempCock <= 32)   tempStr = 'large';
    else if (tempCock <= 56)   tempStr = 'huge';
    else if (tempCock <= 72)   tempStr = 'enormous';
    else if (tempCock <= 100)  tempStr = 'gigantic';
    else if (tempCock <= 152)  tempStr = 'humongous';
    else if (tempCock <= 304)  tempStr = 'tremendous';
    else if (tempCock <= 608)  tempStr = 'colossal';
    else if (tempCock <= 1200) tempStr = 'ridiculous';
    else tempStr = 'impossibly-ginormous';
  }
  if (chance > 50) {
    if (tempCock <= 8)    tempStr = 'infantile';
    else if (tempCock <= 12)   tempStr = 'hand-length';
    else if (tempCock <= 24)   tempStr = 'larger than normal';
    else if (tempCock <= 32)   tempStr = 'foot-long';
    else if (tempCock <= 56)   tempStr = 'thigh-slapping';
    else if (tempCock <= 72)   tempStr = 'knee-knocking';
    else if (tempCock <= 100)  tempStr = 'leg-sized';
    else if (tempCock <= 152)  tempStr = 'person-sized';
    else if (tempCock <= 304)  tempStr = 'car-sized';
    else if (tempCock <= 608)  tempStr = 'bus-sized';
    else if (tempCock <= 1200) tempStr = 'building-sized';
    else tempStr = 'landscape-filling';
  }
  return tempStr;
}

export function ballDesc(): string {
  const chance = percent();
  const br = ballRatio();
  let tempStr = '';
  // AS3 inherited bug fix: v1 source had no "golfball-sized" tier, only "puny"
  // for tiny balls. v9.7 added "golfball-sized" as a sensible small-ball
  // descriptor. Insert it between puny (very tiny) and small (existing) so
  // starting characters (ballRatio ≈ 0.006 with ballSize=4, tallness≈64) get
  // a reasonable "golfball-sized" descriptor instead of "puny" / "hard-to-find".
  if (chance <= 50) {
    if (br < 0.005)       tempStr = 'puny';
    else if (br < 0.009)  tempStr = 'golfball-sized';
    else if (br < 0.016)  tempStr = 'small';
    else if (br < 0.033)  tempStr = 'sizeable';
    else if (br < 0.066)  tempStr = 'big';
    else if (br < 0.1)    tempStr = 'large';
    else if (br < 0.15)   tempStr = 'impressive';
    else if (br < 0.2)    tempStr = 'hefty';
    else if (br < 0.3)    tempStr = 'huge';
    else if (br < 0.45)   tempStr = 'giant';
    else if (br < 0.7)    tempStr = 'tremendous';
    else if (br < 1)      tempStr = 'massive';
    else if (br < 1.5)    tempStr = 'intimidating';
    else if (br < 2.5)    tempStr = 'frighteningly large';
    else if (br < 4.0)    tempStr = 'impossibly large';
    else if (br < 7)      tempStr = 'colossal';
    else if (br < 11)     tempStr = 'threateningly big';
    else if (br < 20)     tempStr = 'awe-inspiring';
    else tempStr = 'force-of-destruction';
  } else {
    if (br < 0.005)       tempStr = 'hard-to-find';
    else if (br < 0.009)  tempStr = 'golfball-like';
    else if (br < 0.016)  tempStr = 'barely grabable';
    else if (br < 0.033)  tempStr = 'graspable';
    else if (br < 0.066)  tempStr = 'hand-filling';
    else if (br < 0.1)    tempStr = 'crotch-filling';
    else if (br < 0.15)   tempStr = 'thigh-slapping';
    else if (br < 0.2)    tempStr = 'thigh-filling';
    else if (br < 0.3)    tempStr = 'knee-knocking';
    else if (br < 0.45)   tempStr = 'shin-slapping';
    else if (br < 0.7)    tempStr = 'ground-dragging';
    else if (br < 1)      tempStr = 'hippity-hop';
    else if (br < 1.5)    tempStr = 'larger-than-yourself';
    else if (br < 2.5)    tempStr = 'cover-granting';
    else if (br < 4.0)    tempStr = 'room-sized';
    else if (br < 7)      tempStr = 'building-sized';
    else if (br < 11)     tempStr = 'mobile-hill';
    else if (br < 20)     tempStr = 'sky-scraping';
    else tempStr = 'sub-celestial';
  }
  return tempStr;
}

export function nipDesc(): string {
  const chance = percent();
  const ntr = nipTallRatio();
  const nbr = nipBreastRatio();
  let tempStr = '';
  if (chance <= 100 || nbr === 0.0) {
    if (ntr <= 0.002)  tempStr = 'tiny';
    else if (ntr <= 0.004)  tempStr = 'small';
    else if (ntr <= 0.008)  tempStr = 'protruding';
    else if (ntr <= 0.016)  tempStr = 'thimble-sized';
    else if (ntr <= 0.035)  tempStr = 'thumb-sized';
    else if (ntr <= 0.07)   tempStr = 'grabbable';
    else if (ntr <= 0.15)   tempStr = 'strokeable';
    else if (ntr <= 0.3)    tempStr = 'forearm-sized';
    else if (ntr <= 0.6)    tempStr = 'arm-length';
    else if (ntr <= 1.2)    tempStr = 'person-sized';
    else if (ntr <= 2.5)    tempStr = 'pole-like';
    else if (ntr <= 5)      tempStr = 'tree-sized';
    else if (ntr <= 10)     tempStr = 'road-clearing';
    else if (ntr <= 20)     tempStr = 'path-scouting';
    else tempStr = 'sky-touching';
  } else if (chance > 50) {
    if (nbr <= 0.06)   tempStr = 'flat';
    else if (nbr <= 0.125) tempStr = '';
    else if (nbr <= 0.25)  tempStr = 'perky';
    else if (nbr <= 0.5)   tempStr = 'pokey';
    else if (nbr <= 1)     tempStr = 'far-standing';
    else if (nbr <= 2)     tempStr = 'drooping';
    else if (nbr <= 4)     tempStr = 'flopping';
    else if (nbr <= 8)     tempStr = 'chest-crowding';
    else if (nbr <= 16)    tempStr = 'breast-hiding';
    else tempStr = 'overshadowing';
    if (gs.nipType === 2 && gs.lust < 50) tempStr = 'sunken ';
  }
  const chance2 = percent();
  if (gs.nipType === 1) {
    if (chance2 <= 50) tempStr = tempStr + ' quad-';
    else tempStr = 'quartets of ' + tempStr;
  }
  // AS3 inherited bug fix: callers concatenate `nipDesc() + 'nipples'` with no
  // separator, producing "grabbablenipples" when the descriptor doesn't end in
  // a space (or hyphen for the 'quad-' compound case). Normalize so the result
  // ends in either ' ' (regular descriptor) or '-' (compound prefix), making
  // every concatenation produce the correct spacing.
  if (!tempStr.endsWith('-')) {
    tempStr = tempStr.replace(/\s+$/, '') + ' ';
  }
  return tempStr;
}

export function clitDesc(): string {
  const chance = percent();
  const c = gs.clitSize;
  let tempStr = '';
  if (chance <= 100) {
    if (c <= 2)   tempStr = 'tiny';
    else if (c <= 3)   tempStr = 'nibble-able';
    else if (c <= 6)   tempStr = 'protruding';
    else if (c <= 12)  tempStr = 'blatant';
    else if (c <= 25)  tempStr = 'suckable';
    else if (c <= 50)  tempStr = 'cock-like';
    else if (c <= 100) tempStr = 'horsecock-like';
    else if (c <= 140) tempStr = 'arm-length';
    else if (c <= 300) tempStr = 'person-sized';
    else tempStr = 'obscene';
  }
  if (chance > 50) {
    if (c <= 2)   tempStr = 'small';
    else if (c <= 3)   tempStr = 'pinchable';
    else if (c <= 6)   tempStr = 'flickable';
    else if (c <= 12)  tempStr = 'panty-tenting';
    else if (c <= 25)  tempStr = 'stroke-able';
    else if (c <= 50)  tempStr = 'huge';
    else if (c <= 100) tempStr = 'gigantic';
    else if (c <= 140) tempStr = 'doorway-smacking';
    else if (c <= 300) tempStr = 'snuggle-able';
    else tempStr = 'obscene';
  }
  return tempStr;
}

export function hipDesc(): string {
  const chance = percent();
  const h = gs.hips * gs.hipMod;
  let tempStr = '';
  if (chance <= 100) {
    if (h <= 3)   tempStr = 'narrow';
    else if (h <= 8)   tempStr = 'unnoticeable';
    else if (h <= 16)  tempStr = 'wide';
    else if (h <= 28)  tempStr = 'endowed';
    else if (h <= 40)  tempStr = 'protruding';
    else if (h <= 55)  tempStr = 'cow-like';
    else if (h <= 75)  tempStr = 'shelf-like';
    else if (h <= 100) tempStr = 'doorway-jamming';
    else tempStr = 'perpetually-swaying';
  }
  if (chance > 50) {
    if (h <= 3)   tempStr = 'prepubescent';
    else if (h <= 8)   tempStr = 'average';
    else if (h <= 16)  tempStr = 'child-bearing';
    else if (h <= 28)  tempStr = 'especially fertile';
    else if (h <= 40)  tempStr = 'hypnotizing';
    else if (h <= 55)  tempStr = 'blatantly obvious';
    else if (h <= 75)  tempStr = 'excessively wide';
    else if (h <= 100) tempStr = 'greatly protruding';
    else tempStr = 'gigantic';
  }
  return tempStr;
}

export function bellyDesc(): string {
  const chance = percent();
  const tempBelly = waistRatio();
  let tempStr = '';

  if (waistFromPregnancy() > waistFromFat()) {
    if (tempBelly <= 1.125)  tempStr = 'flat';
    else if (tempBelly <= 1.2)   tempStr = 'hardly noticeable';
    else if (tempBelly <= 1.3)   tempStr = 'slightly bulging';
    else if (tempBelly <= 1.45)  tempStr = 'obviously swollen';
    else if (tempBelly <= 1.66)  tempStr = 'significantly protruding';
    else if (tempBelly <= 2)     tempStr = 'cradleable';
    else if (tempBelly <= 2.4)   tempStr = 'huggable';
    else if (tempBelly <= 2.9)   tempStr = 'unbalancing';
    else if (tempBelly <= 3.6)   tempStr = 'too-large-to-reach-around';
    else if (tempBelly <= 4.5)   tempStr = 'knee-knocking';
    else if (tempBelly <= 6)     tempStr = 'path-clearing';
    else if (tempBelly <= 8)     tempStr = 'ground-scraping';
    else if (tempBelly <= 11)    tempStr = 'view-blocking';
    else if (tempBelly <= 15)    tempStr = 'double-your-height';
    else if (tempBelly <= 20)    tempStr = 'room-sized';
    else tempStr = 'breeding-factory';
    if (chance <= 50 && tempBelly > 11) tempStr += ' pregnant-looking';
    else if (tempBelly > 11) tempStr += ' gravid';
  } else {
    if (tempBelly <= 1.125)  tempStr = 'flat';
    else if (tempBelly <= 1.2)   tempStr = 'chubby';
    else if (tempBelly <= 1.3)   tempStr = 'porky';
    else if (tempBelly <= 1.45)  tempStr = 'multi-rolled';
    else if (tempBelly <= 1.66)  tempStr = 'pillow-like';
    else if (tempBelly <= 2)     tempStr = 'morbidly obese';
    else if (tempBelly <= 2.4)   tempStr = 'bed-like';
    else if (tempBelly <= 2.9)   tempStr = 'fat-encompassing';
    else if (tempBelly <= 3.6)   tempStr = 'item-losing';
    else if (tempBelly <= 4.5)   tempStr = 'bed-sized';
    else if (tempBelly <= 6)     tempStr = 'impossibly large';
    else if (tempBelly <= 8)     tempStr = 'blob-like';
    else if (tempBelly <= 11)    tempStr = 'limb-engulfing';
    else tempStr = 'gigantic blubbery mass of';
    if (chance <= 50 && tempBelly > 1.45) tempStr += ' jiggly';
    else if (tempBelly > 1.45) tempStr += ' meaty';
  }
  return tempStr;
}

export function skinDesc(): string {
  let tempStr = '';
  if (gs.skinType === 1) tempStr = 'skin';
  if (gs.skinType === 2) tempStr = 'fur';
  if (gs.skinType === 3) tempStr = 'scales';
  if (gs.skinType === 4) tempStr = 'feathers';
  if (gs.skinType === 5) tempStr = 'chitin';
  if (gs.snuggleBall === true) tempStr = 'plush and snuggly ' + tempStr;
  if (gs.skinColor > 0) tempStr = skinC() + tempStr;
  return tempStr;
}

export function skinC(): string {
  if (gs.skinColor === 0) return '';
  if (gs.skinColor === 1) return 'black ';
  if (gs.skinColor === 2) return 'blonde ';
  if (gs.skinColor === 3) return 'red ';
  if (gs.skinColor === 4) return 'brown ';
  if (gs.skinColor === 5) return 'coral pink ';
  if (gs.skinColor === 6) return 'auburn ';
  if (gs.skinColor === 7) return 'brown ';
  if (gs.skinColor === 8) return 'grey ';
  if (gs.skinColor === 9) return 'white ';
  return '';
}

export function legDesc(part: number): string {
  if (part === 1) return 'leg';
  if (part === 2) return 'legs';
  if (part === 3) return 'thigh';
  if (part === 4) return 'thighs';
  if (part === 5) return 'knee';
  if (part === 6) return 'knees';
  if (part === 7) return 'ankle';
  if (part === 8) return 'ankles';
  if (part === 9) {
    if (gs.legType === 1) return 'paw';
    if (gs.legType === 1001) return 'hoof';
    return 'foot';
  }
  if (part === 10) {
    if (gs.legType === 1) return 'paws';
    if (gs.legType === 1001) return 'hooves';
    return 'feet';
  }
  if (part === 11) return '';
  return 'leg';
}

export function legVerb(part: number): string {
  if (part === 1) return 'spreading';
  if (part === 2) return 'spread wide';
  if (part === 3) return 'spread';
  if (part === 4) return 'clench';
  if (part === 5) return 'straddling';
  return '';
}

export function legWhere(part: number): string {
  if (part === 1) {
    return gs.legType === 1001 ? 'behind' : 'between';
  }
  if (part === 2) return 'between';
  return 'between';
}

export function legPlural(which: number): string {
  if (which === 1) return '';
  if (which === 2) return 'are';
  return '';
}

export function raceName(): string {
  if (gs.race === 1) return 'Human';
  if (gs.race === 2) return 'Equan';
  if (gs.race === 3) return 'Lupan';
  if (gs.race === 4) return 'Felin';
  if (gs.race === 6) return 'Lizan';
  return 'Unknown';
}

export function domName(): string {
  if (gs.dominant === 1)  return 'human';
  if (gs.dominant === 2)  return 'horse';
  if (gs.dominant === 3)  return 'wolf';
  if (gs.dominant === 4)  return 'cat';
  if (gs.dominant === 5)  return 'cow';
  if (gs.dominant === 6)  return 'lizard';
  if (gs.dominant === 7)  return 'bunny';
  if (gs.dominant === 8)  return 'mouse';
  if (gs.dominant === 9)  return 'bird';
  if (gs.dominant === 10) return 'pig';
  if (gs.dominant === 11) return 'skunk';
  if (gs.dominant === 12) return 'bug';
  return 'creature';
}

export function genName(): string {
  const { gender, hips, breastSize, body } = gs;
  if (gender === 1 && hips > 3 && breastSize > 4) return ' female';
  if (gender === 1) return ' male';
  if (gender === 2 && body > 17 && breastSize <= 2) return ' male';
  if (gender === 2) return ' female';
  if (gender === 3) return ' herm';
  return 'n androgynous';
}

export function faceDesc(): string {
  let tempStr = '';
  const f = gs.faceType;
  if (f === 10) tempStr += ', your face round with a moderate-sized nose';
  if (f === 20) tempStr += ', your face slightly longer than normal with large confident eyes';
  if (f === 21) tempStr += ', your face having a wide and strong muzzle with large confident eyes';
  if (f === 30) tempStr += ', your face looking slightly fierce with sharp teeth and focused eyes';
  if (f === 31) tempStr += ', your face having a narrow and toothy muzzle with focused eyes';
  if (f === 40) tempStr += ', your face somewhat flat with a small button nose';
  if (f === 41) tempStr += ', your face somewhat flat with a small button nose, long whiskers, and a general catty grin';
  if (f === 50) tempStr += ', your face seemingly docile with a broad nose and slightly gentle eyes';
  if (f === 51) tempStr += ', your face having a broad muzzle and calm gentle eyes';
  if (f === 60) tempStr += ', your face somewhat flat with a nose that is mostly a slight bump with two slits for nostrils';
  if (f === 61) tempStr += ', your face narrowing down a short muzzle with only slits for nostrils';
  if (f === 70) tempStr += ', your face somewhat flat with a twitchy button nose and large friendly eyes';
  if (f === 71) tempStr += ', your face somewhat flat with a twitchy button nose and whiskers, slightly buck-toothed, and your eyes large and friendly';
  if (f === 80) tempStr += ', your face somewhat narrowed with a curious button nose, your eyes careful of their surroundings';
  if (f === 81) tempStr += ', your face somewhat narrowed with a curious button nose, your eyes careful of their surroundings while your buck-teeth chitter as the whiskers on your puffy cheeks twitch';
  if (f === 90) tempStr += ', your face rather awake with your large hooked nose and constantly alert eyes';
  if (f === 91) tempStr += ', your face narrowing down to a razor-sharp beak that makes up your nose and mouth while your eyes are constantly watchful';
  if (f === 100) tempStr += ', your face rather round and somewhat pudgy';
  if (f === 101) tempStr += ', your face rather round and somewhat pudgy with a large upturned nose';
  if (f === 102) tempStr += ', your face rather round and somewhat pudgy with a large upturned nose and pointed tusks that grow up from the sides of your mouth to nearly obstruct your vision';
  if (f === 110) tempStr += ', your face somewhat long with a small button nose and cute eyes';
  if (f === 111) tempStr += ', your face somewhat long with a small button nose, long whiskers, and cute gentle eyes';
  if (f === 120) tempStr += ', your face somewhat flat with a chitinous bandage over the bridge of your nose and large gazing eyes';
  if (f === 121) tempStr += ', your face somewhat flat with a chitinous bandage over the bridge of your nose and large nectar-sucking lips that offset your large darkened eyes';
  return tempStr;
}

export function earDesc(): string {
  const e = gs.ears;
  if (e === 1)  return 'Hugging the sides of your head, you have small rounded ears that can easily be hidden by your hair, like that of a human\'s';
  if (e === 2)  return 'Atop your head, you have large tear-drop shaped ears that flick every now and then, able to hear quite well, like that of a horse\'s';
  if (e === 3)  return 'Atop your head, you have small triangular ears that stand perk, like that of a wolf\'s';
  if (e === 4)  return 'Atop your head, you have small triangular ears that stand perk, like that of a cat\'s';
  if (e === 5)  return 'Standing out perpendicular from the sides of your head, you have large oval ears that droop slightly from their size, like that of a cow\'s';
  if (e === 6)  return 'On the sides of your head, you have sleek holes for ears, like many lizards have';
  if (e === 7)  return 'Atop your head, you have long ears that stand high and vigilant, like that of a rabbit\'s';
  if (e === 8)  return 'Standing out perpendicular the sides of your head, large rounded ears practically flap when they twitch, looking like you glued discs to the sides of your head, like that of a mouse\'s';
  if (e === 9)  return 'On the sides of your head, have flat patches of feathers covering your holes, like a bird\'s';
  if (e === 10) return 'Standing out perpendicular from the sides of your head, you have triangular ears that fold near the ends and droop down from their length, like that of a pig\'s';
  if (e === 11) return 'Atop your head, you have small round ears that stand perk, like that of a skunk\'s';
  if (e === 12) return 'Hugging the sides of your head, you have long pointy ears with wavy-shaped lobes, colored vibrantly like the wings of a butterfly';
  return '';
}
