/**
 * Hair.ts
 * 1:1 port of Hair.as — hair color/length descriptors AND the full
 * hairstyle shop tables (hairstyleName / hairstyleID / hairstyleValue /
 * hairstyleDescription / hairstyleLength). The salon shop UI itself is
 * implemented in TownStuff.ts:doSalon and consumes these tables.
 */
import { gs } from '../core/GameState.ts';

export function hairC(): string {
  if (gs.hairColor === 0) return '';
  if (gs.hairColor === 1) return 'black ';
  if (gs.hairColor === 2) return 'blonde ';
  if (gs.hairColor === 3) return 'red ';
  if (gs.hairColor === 4) return 'blue ';
  if (gs.hairColor === 5) return 'coral pink ';
  if (gs.hairColor === 6) return 'auburn ';
  if (gs.hairColor === 7) return 'brown ';
  if (gs.hairColor === 8) return 'grey ';
  if (gs.hairColor === 9) return 'white ';
  return '';
}

export function hairDesc(): string {
  if (gs.hair === 1)  return 'wavy hair';
  if (gs.hair === 2)  return 'hair pulled to the sides of your head in pigtails';
  if (gs.hair === 3)  return 'hair pulled back into a ponytail';
  if (gs.hair === 4)  return 'straight hair';
  if (gs.hair === 5)  return 'really short hair';
  if (gs.hair === 6)  return 'hair styled up into a mohawk';
  if (gs.hair === 7)  return 'hair curled up into a bun';
  if (gs.hair === 8)  return 'curly hair';
  if (gs.hair === 9)  return 'hair pulled to the sides of your head in braided pigtails';
  if (gs.hair === 10) return 'hair pulled back into a braided ponytail';
  if (gs.hair === 11) return 'braided hair';
  if (gs.hair === 12) return 'spiky hair';
  if (gs.hair === 13) return 'straight, stiff hair covering an eye';
  if (gs.hair === 14) return 'giant poofball of hair';
  return 'hair';
}

/** True if this hairstyle ID supports custom length picking after purchase. */
export function hairstyleLength(id: number): boolean {
  // AS3 list: 1, 2, 3, 4, 8, 9, 10, 11, 13
  return id === 1 || id === 2 || id === 3 || id === 4
      || id === 8 || id === 9 || id === 10 || id === 11
      || id === 13;
}

export function hairL(): string {
  if (gs.hairLength === 2)  return 'that is short enough to not dangle past your head';
  if (gs.hairLength === 4)  return 'that reaches down to your shoulders';
  if (gs.hairLength === 6)  return 'that reaches down your back';
  if (gs.hairLength === 8)  return 'that reaches down to your butt';
  if (gs.hairLength === 10) return 'that reaches down to the ground';
  return '';
}

export function hairstyleName(id: number): string {
  if (id === 0)  return 'None';
  if (id === 1)  return 'Wavy';
  if (id === 2)  return 'Pigtail';
  if (id === 3)  return 'Ponytail';
  if (id === 4)  return 'Straight';
  if (id === 5)  return 'Buzzcut';
  if (id === 6)  return 'Mohawk';
  if (id === 7)  return 'Bun';
  if (id === 8)  return 'Curly';
  if (id === 9)  return 'B Pigtail';
  if (id === 10) return 'B Ponytail';
  if (id === 11) return 'Braided';
  if (id === 12) return 'Spiky';
  if (id === 13) return 'Emo';
  if (id === 14) return 'Afro';
  return '';
}

/** hairstyleID(slot) — which hairstyle ID is in salon button `slot` for the current zone. */
export function hairstyleID(choice: number): number {
  // Note: AS3 had a `Choice10.visible = false` on slot 10 in every zone — this
  // was vestigial dead code (the function is a getter, not a UI setup). We keep
  // slot 10 returning 0 so the salon shop just shows it as empty.
  if (gs.currentZone === 1) {
    if (choice === 1)  return 1;
    if (choice === 2)  return 4;
    if (choice === 3)  return 8;
    if (choice === 5)  return 2;
    if (choice === 6)  return 3;
    if (choice === 7)  return 12;
    if (choice === 9)  return 14;
    if (choice === 11) return 0;
  }
  if (gs.currentZone === 2) {
    if (choice === 1)  return 1;
    if (choice === 2)  return 4;
    if (choice === 3)  return 8;
    if (choice === 5)  return 3;
    if (choice === 6)  return 10;
    if (choice === 7)  return 5;
    if (choice === 9)  return 6;
    if (choice === 11) return 0;
  }
  if (gs.currentZone === 3) {
    if (choice === 1)  return 1;
    if (choice === 2)  return 4;
    if (choice === 3)  return 8;
    if (choice === 5)  return 6;
    if (choice === 6)  return 11;
    if (choice === 7)  return 12;
    if (choice === 9)  return 13;
    if (choice === 11) return 0;
  }
  if (gs.currentZone === 4) {
    if (choice === 1)  return 1;
    if (choice === 2)  return 4;
    if (choice === 3)  return 8;
    if (choice === 5)  return 2;
    if (choice === 6)  return 9;
    if (choice === 7)  return 7;
    if (choice === 9)  return 13;
    if (choice === 11) return 0;
  }
  if (gs.currentZone === 6) {
    if (choice === 1)  return 2;
    if (choice === 2)  return 3;
    if (choice === 3)  return 4;
    if (choice === 5)  return 9;
    if (choice === 6)  return 10;
    if (choice === 7)  return 11;
    if (choice === 9)  return 12;
    if (choice === 11) return 0;
  }
  if (gs.currentZone === 12) {
    if (choice === 1)  return 2;
    if (choice === 2)  return 9;
    if (choice === 3)  return 6;
    if (choice === 5)  return 12;
    if (choice === 6)  return 13;
    if (choice === 7)  return 1;
    if (choice === 9)  return 4;
    if (choice === 11) return 0;
  }
  return 0;
}

export function hairstyleValue(id: number): number {
  if (id === 0)  return 0;
  if (id === 1)  return 5;
  if (id === 2)  return 8;
  if (id === 3)  return 8;
  if (id === 4)  return 5;
  if (id === 5)  return 7;
  if (id === 6)  return 20;
  if (id === 7)  return 10;
  if (id === 8)  return 5;
  if (id === 9)  return 15;
  if (id === 10) return 15;
  if (id === 11) return 23;
  if (id === 12) return 18;
  if (id === 13) return 18;
  if (id === 14) return 20;
  return 0;
}

export function hairstyleDescription(id: number): string {
  if (id === 0)  return 'No hairstyle whatsoever. Choosing this option removes any mention of hair from your appearance description.';
  if (id === 1)  return 'Wavy hair has subtle curves that make it seem more flowing.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 2)  return 'Pigtails are straight/wavy/curvy hair pulled away from the face and gathered towards the sides of your head, where it is bundled and tied at the base, allowing it to hang freely over your shoulders.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 3)  return 'A Ponytail is straight/wavy/curvy hair pulled away from the face and gathered at the back of your head, where it is bundled and tied at the base, allowing it to hang freely over your back.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 4)  return 'Straight hair has been combed out to be nice and straight.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 5)  return 'A Buzzcut is hair cut quite short, less than a quarter inch from your head.';
  if (id === 6)  return 'A Mohawk leaves only the hair along the center, from front to back, left, shaving the rest. It\'s usually a couple inches long.';
  if (id === 7)  return 'A Bun is straight or wavy hair pulled up into a bun-like shape on top of the back of your head.';
  if (id === 8)  return 'Curly hair has been treated to make it nice and curly with a bit of spring.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 9)  return 'Braided Pigtails are pigtails that have been braided, keeping the dangling hair in a nice tight formation.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 10) return 'A Braided Ponytail is a ponytail that has been braided, keeping the dangling hair in a nice tight formation.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 11) return 'Braided hair involves tying all your hair into many braids, keeping it all in multiple tight formations.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 12) return 'Spiky hair is hair that has been treated to stand away from your head, defying gravity. Due to limitations, it can only reach a few inches in length.';
  if (id === 13) return 'Emo hair is hair that has been treated to sit straight at all times, with bangs often hanging over one eye.\r\rThis hairstyle has additional length options available after purchasing.';
  if (id === 14) return 'An Afro is a giant poofball of curly hair. Due to limitations, it only reaches about half a foot from your head.';
  return '';
}
