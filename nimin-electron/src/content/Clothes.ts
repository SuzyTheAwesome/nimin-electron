// Ported from Clothes.as
import { gs } from '../core/GameState.ts';
import { statsMod } from '../systems/StatChanges.ts';

export function clothesName(id: number): string {
  if (id === 1)  return 'Shirt';
  if (id === 2)  return 'Pants';
  if (id === 3)  return 'Bikini Top';
  if (id === 4)  return 'Bikini Bottom';
  if (id === 5)  return 'Elegant Dress';
  if (id === 6)  return 'Latex Suit';
  if (id === 7)  return 'Skirt';
  if (id === 8)  return 'Shorts';
  if (id === 9)  return 'Blouse';
  if (id === 10) return 'Diaper';
  if (id === 11) return 'Poofy Diaper';
  if (id === 12) return 'Sundress';
  if (id === 13) return 'Skimpy Dress';
  if (id === 14) return 'Short Skirt';
  if (id === 15) return 'Short Shorts';
  if (id === 16) return 'Loin Cloth';
  if (id === 17) return 'Bathing Suit';
  if (id === 18) return 'Muscle Shirt';
  if (id === 19) return 'Corset';
  if (id === 20) return 'Silk Panties';
  if (id === 21) return 'Slingkini';
  if (id === 22) return 'Thong';
  if (id === 23) return 'Bloomers';
  if (id === 24) return 'Tights';
  if (id === 25) return 'Gothic Dress';
  if (id === 26) return 'Tube Top';
  if (id === 27) return 'Nipple Pasties';
  if (id === 28) return 'Camisole';
  if (id === 29) return 'Training Suit';
  if (id === 30) return 'Bouncy Bra';
  return '';
}

export function clothesValue(id: number): number {
  const vals: Record<number, number> = {
    1:5,2:5,3:25,4:25,5:45,6:60,7:25,8:25,9:25,10:30,11:40,12:40,
    13:50,14:35,15:35,16:40,17:55,18:15,19:50,20:35,21:65,22:40,
    23:30,24:35,25:60,26:20,27:45,28:40,29:35,30:45,
  };
  return vals[id] ?? 0;
}

export function clothesDescription(id: number): string {
  if (id === 1)  return 'A generic shirt with no special attributes.\r\rTakes top clothes slot.';
  if (id === 2)  return 'A generic pair of pants with no special attributes.\r\rTakes bottom clothes slot.';
  if (id === 3)  return 'A rather revealing bikini top/s, covering all your breasts, looking good and hugging tightly to improve enticement and sensitivity, but reduces your mentality and milk production.\r\rTakes top clothes slot.';
  if (id === 4)  return 'A rather revealing bikini bottom, covering your groin, looking good and hugging tightly to improve enticement and sensitivity, but reduces your mentality and cum production.\r\rTakes bottom clothes slot.';
  if (id === 5)  return "A courtly dress that's more about giving a good impression than a slutty one, improving mentality, but the caution to prevent ripping reduces strength. It also increases the speed of your pregnancies slightly.\r\rTakes both top and bottom clothes slots.";
  if (id === 6)  return 'A suit made of a thin, very tight material that covers most of your body and greatly improves enticement and sensitivity, but also reduces mentality, run chance, cum and milk production.\r\rTakes both top and bottom clothes slots.';
  if (id === 7)  return "A modest skirt, very helpful in terms of function. Improves run chance, strength, and cum production, but reduces mentality and increases pregnancy chance with its 'ease of access'.\r\rTakes bottom clothes slot.";
  if (id === 8)  return 'A pair of shorts, very helpful in terms of function. Improves run chance and strength, but reduces libido with its lackluster appearance.\r\rTakes bottom clothes slot.';
  if (id === 9)  return 'A buttoned shirt that allows your breasts to produce more milk while looking good to increase mentality, but reduces sensitivity and strength.\r\rTakes top clothes slot.';
  if (id === 10) return 'A diaper that helps soak up some of your moistness and makes your hips look bigger, but reduces mentality.\r\rWarning: Removing the diaper after wearing it could potentially make you even wetter than before you put it on, your body depending too much on it.\r\rTakes bottom clothes slot.';
  if (id === 11) return 'A poofy diaper that helps soak up a lot of your moistness and makes both your hips and butt look bigger, but reduces mentality and libido.\r\rWarning: Removing the poofy diaper after wearing it could potentially make you even wetter than before you put it on, your body depending too much on it.\r\rTakes bottom clothes slot.';
  if (id === 12) return 'A casual dress that gives your body a lot of exposure, improving sensitivity, cum production, and libido, but reduces run chance, strength, and increases pregnancy chance.\r\rTakes both top and bottom clothes slots.';
  if (id === 13) return 'A skimpy dress that really hugs your curves, improving sensitivity, enticement, and libido, but reduces strength and mentality with its slutty appearance, and increases pregnancy chance with its ease of access.\r\rTakes both top and bottom clothes slots.';
  if (id === 14) return "A short skirt that's more attractive than modest, improving cum production, sensitivity, and enticement, but reduces mentality and increases pregnancy chance with its ease of access.\r\rTakes bottom clothes slot.";
  if (id === 15) return 'A pair of short shorts that are more skimpy than functional, hugging tightly to improve sensitivity, enticement, and run chance, but reduces cum production, mentality, and strength.\r\rTakes bottom clothes slot.';
  if (id === 16) return 'A loin cloth that is more suited for the simplicity of the wild, but also a bit uncivilized, improving cum production, run chance, strength, and sensitivity, but reduces mentality and increases pregnancy chance.\r\rTakes bottom clothes slot.';
  if (id === 17) return "A one-piece bathing suit that covers both chest and groin and is great for swimming, it acts as a barrier to liquids. The suit prevents your sexual lubrication from drying away as easily, thus increasing your moistness, as well as increasing strength and sensitivity while reducing mentality and pregnancy chance.\r\rTakes both top and bottom clothes slots.";
  if (id === 18) return 'A simple muscle shirt that is more functional than civilized. Increases strength but reduces mentality, and makes your chest look slightly bigger.\r\rTakes top clothes slot.';
  if (id === 19) return 'A corset that ties tightly around your waist, greatly magnifying your bust and hips, increasing your mentality and libido, but is also quite restrictive and hard to breath in, reducing strength and your maximum HP.\r\rTakes top clothes slot.';
  if (id === 20) return 'A pair of silken panties, this underwear looks and feels good, amplifying your vulva size, increasing your enticement, libido, and sensitivity, but also reduces mentality, cum production, and run chance as you are afraid of tearing them.\r\rTakes bottom clothes slot.';
  if (id === 21) return 'A very scant bathing suit that consists of thin fabric that barely covers your crotch and forks to sling around your body and just barely cover your nipples. Largely increases enticement, as well as increasing libido and sensitivity. However, it largely reduces your mentality, reduces your strength, keeps you constantly slightly aroused, and is rather difficult to run in.\r\rTakes both top and bottom clothes slots.';
  if (id === 22) return 'A quite small piece of underwear that shows off much of your posterior, the thong is quite enticing and raises your libido, but reduces strength, mentality, and sensitivity, and is slightly difficult to run in as it rides up your rear.\r\rTakes bottom clothes slot.';
  if (id === 23) return 'A pair of form-fitting athletic bloomers, they are very nice to run in and increases strength and libido, but also reduces mentality and is slightly difficult to rape others while wearing them.\r\rTakes bottom clothes slot.';
  if (id === 24) return 'A pair of form-fitting, stretchy, agile tights, they are easy to run in and increase your sensitivity, but their tightness reduces cum production and ability to get pregnant.\r\rTakes bottom clothes slot.';
  if (id === 25) return 'A dark and decorated frilly dress of the gothic variety, it increases your mentality and the intimidation helps you rape others, but it also makes vaginal passages more stretchy for some strange reason.\r\rTakes both top and bottom clothes slots.';
  if (id === 26) return 'A single piece of stretchy fabric that wraps around the chest, the tube top is slightly enticing and slightly increases milk production. However, it tends to outline nipples so well that it seems to make them bigger and also lowers mentality.\r\rTakes top clothes slot.';
  if (id === 27) return 'A simple bunch of adhesive stickers that paste to the nipples to cover them and only them. Extremely lewd, it lowers your mentality significantly, but also raises enticement, libido, and sensitivity, and increases the amount of milk your breasts can hold by literally capping your nipples.\r\rTakes top clothes slot.';
  if (id === 28) return 'A soft and loose piece of lingerie, this camisole is an attractive and smart way to cover your breasts, increasing enticement, mentality, and sensitivity. The soft fabric constantly teasing your nipples also reduces the rate at which your breasts dry up, should they be lactating.\r\rTakes top clothes slot.';
  if (id === 29) return 'A yellow tracksuit with black stripes up the sides, this training suit makes you feel much stronger and heartier while wearing it, perfect for fighting. However, it looks fairly silly, basically the opposite of attractive, and reduces your mentality, libido, and sensitivity.\r\rTakes both top and bottom clothes slots.';
  if (id === 30) return 'A bra that allows for a little more bounce to your step by allowing you to withstand a bit more weight. And it\'s so wonderful that it helps you carry -any- extra weight, even beyond your breasts!\r\rTakes top clothes slot.';
  return '';
}

/** Zone-based tailor shop inventory (slot 1-11 → clothing ID) */
export function clothesID(choice: number): number {
  const zone = gs.currentZone;
  type Table = Record<number, number>;
  const tables: Record<number, Table> = {
    1:  {1:1,2:2,3:29,5:6,6:9,7:10,9:13,10:22,11:27},
    2:  {1:1,2:2,3:29,5:8,6:9,7:15,9:18,10:24,11:26},
    3:  {1:1,2:2,3:29,5:5,6:13,7:19,9:22,10:23,11:25},
    4:  {1:1,2:2,3:29,5:3,6:4,7:11,9:12,10:20,11:28},
    6:  {1:1,2:2,3:29,5:7,6:14,7:16,9:17,10:19,11:21},
    12: {1:1,2:2,3:29,5:28,6:30,7:25,9:23,10:22,11:19},
  };
  return tables[zone]?.[choice] ?? 0;
}

export function clothesTop(): string {
  const a = gs.attireTop;
  if (a === -1) return 'tattered shreds';
  if (a === 0)  return 'invisible underwear';
  if (a === 1)  return 'shirt';
  if (a === 3)  return gs.boobTotal >= 4 ? 'bikini tops' : 'bikini top';
  if (a === 5)  return 'elegant dress';
  if (a === 6)  return 'latex suit';
  if (a === 9)  return 'blouse';
  if (a === 12) return 'sundress';
  if (a === 13) return 'skimpy dress';
  if (a === 17) return 'bathing suit';
  if (a === 18) return 'muscle shirt';
  if (a === 19) return 'corset';
  if (a === 21) return 'slingkini';
  if (a === 25) return 'gothic dress';
  if (a === 26) return 'tube top';
  if (a === 27) return 'nipple pasties';
  if (a === 28) return 'camisole';
  if (a === 29) return 'training suit';
  if (a === 30) return 'bouncy bra';
  return 'top';
}

export function clothesBottom(): string {
  const a = gs.attireBot;
  if (a === -1) return 'tattered shreds';
  if (a === 0)  return 'invisible underwear';
  if (a === 2)  return 'pants';
  if (a === 4)  return 'bikini bottom';
  if (a === 5)  return 'elegant dress';
  if (a === 6)  return 'latex suit';
  if (a === 7)  return 'skirt';
  if (a === 8)  return 'shorts';
  if (a === 10) return 'diaper';
  if (a === 11) return 'poofy diaper';
  if (a === 12) return 'sundress';
  if (a === 13) return 'skimpy dress';
  if (a === 14) return 'short skirt';
  if (a === 15) return 'short shorts';
  if (a === 16) return 'loincloth';
  if (a === 17) return 'bathing suit';
  if (a === 20) return 'silken panties';
  if (a === 21) return 'slingkini';
  if (a === 22) return 'thong';
  if (a === 23) return 'bloomer';
  if (a === 24) return 'tights';
  if (a === 25) return 'gothic dress';
  if (a === 29) return 'training suit';
  return 'bottoms';
}

export function currentClothes(): string {
  if (gs.attireTop === gs.attireBot) return clothesTop();
  return clothesTop() + ' and ' + clothesBottom();
}

export function pullUD(source: number): string {
  if (source === 1) {
    const a = gs.attireTop;
    if (a === -1) return 'open';
    if (a === 0)  return 'up';
    if (a === 1)  return 'up';
    if (a === 3)  return 'down';
    if (a === 5)  return 'down';
    if (a === 6)  return 'open';
    if (a === 9)  return 'open';
    if (a === 12) return 'down';
    if (a === 13) return 'down';
    if (a === 17) return 'down';
    if (a === 18) return 'up';
    if (a === 19) return 'down';
    if (a === 21) return 'open';
    if (a === 25) return 'down';
    if (a === 26) return 'down';
    if (a === 27) return 'off';
    if (a === 28) return 'up';
    if (a === 29) return 'open';
    if (a === 30) return 'down';
    return 'up';
  }
  const a = gs.attireBot;
  if (a === -1) return 'open';
  if (a === 0)  return 'down';
  if (a === 2)  return 'down';
  if (a === 4)  return 'down';
  if (a === 5)  return 'up';
  if (a === 6)  return 'open';
  if (a === 7)  return 'up';
  if (a === 8)  return 'down';
  if (a === 10) return 'down';
  if (a === 11) return 'down';
  if (a === 12) return 'up';
  if (a === 13) return 'up';
  if (a === 14) return 'up';
  if (a === 15) return 'down';
  if (a === 16) return 'up';
  if (a === 17) return 'aside';
  if (a === 20) return 'down';
  if (a === 21) return 'aside';
  if (a === 22) return 'down';
  if (a === 23) return 'down';
  if (a === 24) return 'down';
  if (a === 25) return 'up';
  if (a === 29) return 'open';
  return 'down';
}

export function clothesChange(id: number): void {
  const both = [5, 6, 12, 13, 17, 21, 25, 29];
  const topOnly = [1, 3, 9, 18, 19, 26, 27, 28, 30];
  if (both.includes(id))    { changeTop(id); changeBot(id); }
  else if (topOnly.includes(id)) { changeTop(id); }
  else                      { changeBot(id); }
}

export function changeTop(id: number): void {
  if (id === gs.attireTop) return;
  // Remove old bonus
  _applyTopBonus(gs.attireTop, -1);
  // If was matching set and new is not invisible, reset bottom to pants
  if (gs.attireTop === gs.attireBot && id !== 0 && id !== -1) {
    gs.attireTop = id;
    changeBot(2);
  } else {
    gs.attireTop = id;
  }
  // Apply new bonus
  _applyTopBonus(id, 1);
}

export function changeBot(id: number): void {
  if (id === gs.attireBot) return;
  // Remove old bonus
  _applyBotBonus(gs.attireBot, -1);
  gs.attireBot = id;
  // Apply new bonus
  _applyBotBonus(id, 1);
}

function _applyTopBonus(id: number, sign: number): void {
  if (id === -1) { statsMod(-2 * sign, -2 * sign, 0, 0); }
  if (id === 0)  { statsMod(0, -4 * sign, 0, 0); }
  if (id === 3)  { gs.enticeMod += 6 * sign; statsMod(0, -2 * sign, 0, 2 * sign); gs.milkMod -= 15 * sign; }
  if (id === 5)  { statsMod(-2 * sign, 4 * sign, 0, 0); gs.pregRate += 0.2 * sign; }
  if (id === 6)  { gs.enticeMod += 8 * sign; statsMod(0, -2 * sign, 0, 8 * sign); gs.cumMod -= 0.2 * sign; gs.milkMod -= 10 * sign; gs.runMod -= 5 * sign; }
  if (id === 9)  { statsMod(-2 * sign, 2 * sign, 0, -1 * sign); gs.milkMod += 20 * sign; }
  if (id === 12) { statsMod(-2 * sign, 0, 2 * sign, 2 * sign); gs.cumMod += 0.2 * sign; gs.runMod -= 5 * sign; gs.pregChanceMod += 5 * sign; }
  if (id === 13) { statsMod(-2 * sign, -3 * sign, 2 * sign, 3 * sign); gs.enticeMod += 14 * sign; gs.pregChanceMod += 5 * sign; }
  if (id === 17) { statsMod(2 * sign, -2 * sign, 0, 2 * sign); gs.vagMoistMod += 2 * sign; gs.cockMoistMod += 2 * sign; gs.pregChanceMod -= 5 * sign; }
  if (id === 18) { statsMod(2 * sign, -2 * sign, 0, 0); gs.breastSize += 1 * sign; }
  if (id === 19) { statsMod(-2 * sign, 2 * sign, 2 * sign, 0); gs.breastSize += 4 * sign; gs.hips += 2 * sign; gs.HPMod -= 5 * sign; }
  if (id === 21) { gs.enticeMod += 18 * sign; statsMod(-2 * sign, -6 * sign, 4 * sign, 4 * sign); gs.runMod -= 10 * sign; gs.minLust += 5 * sign; }
  if (id === 25) { statsMod(0, 4 * sign, 0, 0); gs.rapeMod += 3 * sign; gs.vagElastic += 0.2 * sign; }
  if (id === 26) { gs.enticeMod += 2 * sign; statsMod(0, -2 * sign, 0, 0); gs.milkMod += 5 * sign; gs.nippleSize += 2 * sign; }
  if (id === 27) { statsMod(0, -6 * sign, 2 * sign, 4 * sign); gs.milkCap += 250 * sign; gs.enticeMod += 6 * sign; }
  if (id === 28) { statsMod(0, 2 * sign, 0, 4 * sign); gs.enticeMod += 4 * sign; }
  if (id === 29) { statsMod(10 * sign, -2 * sign, -2 * sign, -2 * sign); gs.enticeMod -= 10 * sign; gs.HPMod += 10 * sign; }
  if (id === 30) { gs.carryMod += 15 * sign; }
}

function _applyBotBonus(id: number, sign: number): void {
  if (id === -1) { statsMod(-2 * sign, -2 * sign, 0, 0); }
  if (id === 0)  { statsMod(0, -4 * sign, 0, 0); }
  if (id === 4)  { gs.enticeMod += 6 * sign; statsMod(0, -2 * sign, 0, 2 * sign); gs.cumMod -= 0.2 * sign; }
  if (id === 7)  { gs.runMod += 3 * sign; gs.cumMod += 0.2 * sign; statsMod(-2 * sign, -2 * sign, 0, 0); gs.pregChanceMod += 4 * sign; }
  if (id === 8)  { gs.runMod += 3 * sign; statsMod(-2 * sign, 0, -3 * sign, 0); }
  if (id === 10) { gs.vagMoistMod -= 2 * sign; gs.cockMoistMod -= 2 * sign; gs.hips += 1 * sign; statsMod(0, -4 * sign, 0, 0); }
  if (id === 11) { gs.vagMoistMod -= 5 * sign; gs.cockMoistMod -= 5 * sign; gs.hips += 1 * sign; gs.butt += 2 * sign; statsMod(0, -4 * sign, -4 * sign, 0); }
  if (id === 14) { gs.cumMod += 0.2 * sign; gs.enticeMod += 7 * sign; statsMod(0, -4 * sign, 0, 2 * sign); gs.pregChanceMod += 6 * sign; }
  if (id === 15) { gs.cumMod -= 0.2 * sign; gs.runMod += 5 * sign; gs.enticeMod += 4 * sign; statsMod(-2 * sign, -3 * sign, 0, 2 * sign); }
  if (id === 16) { gs.cumMod += 0.2 * sign; gs.runMod += 4 * sign; gs.pregChanceMod += 5 * sign; statsMod(-2 * sign, -4 * sign, 0, 2 * sign); }
  if (id === 20) { gs.cumMod -= 0.3 * sign; gs.runMod -= 3 * sign; gs.vulvaSize += 1 * sign; gs.enticeMod += 7 * sign; statsMod(0, -2 * sign, 2 * sign, 2 * sign); }
  if (id === 22) { gs.runMod -= 5 * sign; gs.enticeMod += 9 * sign; statsMod(-2 * sign, -2 * sign, 4 * sign, -2 * sign); }
  if (id === 23) { gs.runMod += 6 * sign; gs.rapeMod -= 4 * sign; statsMod(-2 * sign, -2 * sign, 2 * sign, 0); }
  if (id === 24) { gs.runMod += 4 * sign; gs.cumMod -= 0.2 * sign; gs.pregChanceMod -= 3 * sign; statsMod(0, 0, 0, 2 * sign); }
}
