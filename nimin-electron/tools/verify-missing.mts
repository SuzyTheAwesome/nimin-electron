#!/usr/bin/env node --experimental-strip-types
// For each AS3 "missing" message, do a substring search in TS source
// to distinguish real missing content from concatenation false positives.
import * as fs from "node:fs";

const reAny = /textLP\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`]*)`)/g;

function unq(file: string): Set<string> {
  let text = fs.readFileSync(file, "utf8");
  // Strip /* ... */ block comments AND // line-comment lines — content inside
  // them is dead code in AS3 and shouldn't count as "missing" if absent from
  // the TS port. (Note: a simple line-comment strip handles the common AS3
  // pattern `\t\t//if (foo) { textLP("..."); }`. It would mis-strip a // that
  // appears inside a string literal, but those are rare and would only cause
  // FALSE NEGATIVES, not false positives — acceptable trade-off here.)
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");
  text = text.replace(/^\s*\/\/.*$/gm, "");
  const set = new Set<string>();
  let m;
  while ((m = reAny.exec(text)) !== null) {
    const raw = m[1] ?? m[2] ?? m[3] ?? "";
    const s = raw
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, "...");
    set.add(s.slice(0, 70));
  }
  return set;
}

const [as3File, tsFile] = process.argv.slice(2);
const as3 = unq(as3File);
const ts = unq(tsFile);
// Concatenate ALL TS source files so cross-file moves (e.g., AS3 doSalon
// content now living in TownStuff.ts) don't show as false-positive "missing".
function collectTsTree(dir: string): string {
  let out = "";
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out += collectTsTree(p);
    else if (e.isFile() && e.name.endsWith(".ts")) out += "\n" + fs.readFileSync(p, "utf8");
  }
  return out;
}
const tsText = collectTsTree("src");

const missing = [...as3].filter((m) => !ts.has(m)).sort();
console.log(`AS3=${as3.size} TS=${ts.size} suspicious=${missing.length}\n`);

let realMissing = 0;
let falsePositives = 0;
const reallyGone: string[] = [];
for (const m of missing) {
  // Strip leading whitespace + \r\r markers for substring search
  const probe = m.replace(/^\\r\\r/, "").replace(/^\s+/, "").slice(0, 40);
  if (probe.length < 10) {
    falsePositives++;
    continue;
  }
  // Check whether TS source contains this probe text anywhere
  if (tsText.includes(probe)) {
    falsePositives++;
  } else {
    realMissing++;
    reallyGone.push(m);
  }
}

console.log(`Real missing: ${realMissing}`);
console.log(`False positives (text exists in TS, fragmented by concat): ${falsePositives}\n`);
if (reallyGone.length > 0) {
  console.log("=== ACTUAL MISSING CONTENT ===");
  reallyGone.forEach((m) => console.log("  < " + m));
}
