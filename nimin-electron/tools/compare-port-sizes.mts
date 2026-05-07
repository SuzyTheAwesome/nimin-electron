#!/usr/bin/env node --experimental-strip-types
/**
 * compare-port-sizes.mts
 *
 * Compare each AS3 file under ../Nimin v1/code/ against the corresponding
 * TS port under src/ and flag any TS file that is dramatically shorter
 * (potential silent truncation). Reports modules where TS is < 60% the
 * size of AS3.
 *
 * Note: TS legitimately runs shorter than AS3 because:
 *   - Record/Set lookup tables replace AS3 `if/else` ladders
 *   - variableFunctions.as setters are inlined
 *   - JSDoc replaces some commented prose
 *   - imports replace `#include`
 * So a 30-40% reduction is normal. Only flag the outliers.
 *
 * Run: node --experimental-strip-types tools/compare-port-sizes.mts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const AS3_DIR = path.resolve('../Nimin v1/code');
const TS_DIR = path.resolve('src');

interface Mapping { as3: string; ts: string; }

// Manual map: AS3 filename → TS file location (known port destinations).
const map: Mapping[] = [
  { as3: 'Battling.as',         ts: 'systems/Battling.ts' },
  { as3: 'Calculations.as',     ts: 'core/Calculations.ts' },
  { as3: 'Character.as',        ts: 'core/Character.ts' },
  { as3: 'Clothes.as',          ts: 'content/Clothes.ts' },
  { as3: 'Descriptions.as',     ts: 'content/Descriptions.ts' },
  { as3: 'Dungeons.as',         ts: 'systems/Dungeon.ts' },
  { as3: 'Enemies.as',          ts: 'content/Enemies.ts' },
  { as3: 'GameSetup.as',        ts: 'core/GameState.ts' },
  { as3: 'GameUtilities.as',    ts: 'core/GameUtilities.ts' },
  { as3: 'Hair.as',             ts: 'content/Hair.ts' },
  { as3: 'Intro.as',            ts: 'screens/Intro.ts' },
  { as3: 'Inventory.as',        ts: 'systems/Inventory.ts' },
  { as3: 'Items.as',            ts: 'content/Items.ts' },
  { as3: 'Leveling.as',         ts: 'systems/Leveling.ts' },
  { as3: 'Masturbation.as',     ts: 'systems/Masturbation.ts' },
  { as3: 'Pregnancy.as',        ts: 'systems/Pregnancy.ts' },
  { as3: 'Preferences.as',      ts: 'content/Preferences.ts' },
  { as3: 'SaveLoad.as',         ts: 'systems/SaveLoad.ts' },
  { as3: 'Sleep.as',            ts: 'systems/Sleep.ts' },
  { as3: 'StatChanges.as',      ts: 'systems/StatChanges.ts' },
  { as3: 'StatSetup.as',        ts: 'systems/StatSetup.ts' },
  { as3: 'Statuses.as',         ts: 'systems/Statuses.ts' },
  { as3: 'TownStuff.as',        ts: 'screens/TownStuff.ts' },
  { as3: 'Transformations.as',  ts: 'systems/Transformations.ts' },
  { as3: 'Weight.as',           ts: 'content/Weight.ts' },
  { as3: 'Alchemy.as',          ts: 'systems/Alchemy.ts' },
  { as3: 'Daycare.as',          ts: 'systems/Daycare.ts' },
  { as3: 'Exploration.as',      ts: 'screens/Exploration.ts' },
  { as3: 'EventUtilities.as',   ts: 'screens/EventUtilities.ts' },
  { as3: 'Prostitution.as',     ts: 'systems/Prostitution.ts' },
  { as3: 'Buttons.as',          ts: 'ui/ButtonManager.ts' },
  { as3: 'Appearances.as',      ts: 'content/Appearances.ts' },
  { as3: 'Breasts.as',          ts: 'content/Breasts.ts' },
  // Event files
  { as3: 'Events/Beach.as',      ts: 'events/Beach.ts' },
  { as3: 'Events/Cave.as',       ts: 'events/Cave.ts' },
  { as3: 'Events/DairyFarm.as',  ts: 'events/DairyFarm.ts' },
  { as3: 'Events/Den.as',        ts: 'events/Den.ts' },
  { as3: 'Events/Desert.as',     ts: 'events/Desert.ts' },
  { as3: 'Events/Firmshaft.as',  ts: 'events/Firmshaft.ts' },
  { as3: 'Events/Forest.as',     ts: 'events/Forest.ts' },
  { as3: 'Events/Jungle.as',     ts: 'events/Jungle.ts' },
  { as3: 'Events/Plains.as',     ts: 'events/Plains.ts' },
  { as3: 'Events/Savanna.as',    ts: 'events/Savanna.ts' },
  { as3: 'Events/SizCalit.as',   ts: 'events/SizCalit.ts' },
  { as3: 'Events/Softlik.as',    ts: 'events/Softlik.ts' },
  { as3: 'Events/Tieden.as',     ts: 'events/Tieden.ts' },
  { as3: 'Events/Oviasis.as',    ts: 'events/Oviasis.ts' },
  { as3: 'Events/Sanctuary.as',  ts: 'events/Sanctuary.ts' },
];

function lc(p: string): number {
  if (!fs.existsSync(p)) return -1;
  return fs.readFileSync(p, 'utf8').split(/\r?\n/).length;
}

console.log('AS3 vs TS port size comparison\n');
console.log('  AS3 file                | AS3 lines | TS file                       | TS lines | TS/AS3');
console.log('  ' + '-'.repeat(105));

const flagged: { as3: string; ts: string; ratio: number }[] = [];

for (const m of map) {
  const as3path = path.join(AS3_DIR, m.as3);
  const tspath = path.join(TS_DIR, m.ts);
  const a = lc(as3path);
  const t = lc(tspath);
  const ratio = (a > 0 && t > 0) ? t / a : 0;
  const flag = (a > 50 && ratio < 0.6) ? '  ⚠️ ' : '     ';
  console.log(`${flag}${m.as3.padEnd(24)} | ${String(a).padStart(9)} | ${m.ts.padEnd(30)} | ${String(t).padStart(8)} | ${(ratio * 100).toFixed(0)}%`);
  if (a > 50 && ratio < 0.6) flagged.push({ as3: m.as3, ts: m.ts, ratio });
}

console.log('\n');
if (flagged.length > 0) {
  console.log(`${flagged.length} file(s) flagged with TS < 60% of AS3 size:`);
  for (const f of flagged) {
    console.log(`  ${f.as3} → ${f.ts}: ${(f.ratio * 100).toFixed(0)}% — investigate for dropped content`);
  }
} else {
  console.log('All ports within reasonable size range.');
}
