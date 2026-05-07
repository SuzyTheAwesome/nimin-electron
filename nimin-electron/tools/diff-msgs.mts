#!/usr/bin/env node --experimental-strip-types
import * as fs from "node:fs";

// Match textLP("...") or textLP('...') or textLP(`...`)
const reAny = /textLP\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`]*)`)/g;

function unq(file: string): Set<string> {
  const text = fs.readFileSync(file, "utf8");
  const set = new Set<string>();
  let m;
  while ((m = reAny.exec(text)) !== null) {
    const raw = m[1] ?? m[2] ?? m[3] ?? "";
    const s = raw
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      // Decode \uXXXX escape sequences (TS port uses these for non-ASCII chars)
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      // Normalize Unicode smart-quotes / ellipsis (AS3 used Unicode literals,
      // TS port may use ASCII or escape sequences — fold to ASCII)
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/…/g, "...");
    set.add(s.slice(0, 70));
  }
  return set;
}

const pairs = process.argv.slice(2);
for (let i = 0; i < pairs.length; i += 2) {
  const a = pairs[i], t = pairs[i + 1];
  const as3 = unq(a);
  const ts = unq(t);
  const missing = [...as3].filter((m) => !ts.has(m)).sort();
  const extra = [...ts].filter((m) => !as3.has(m)).sort();
  console.log(`\n=== ${a} → ${t} ===`);
  console.log(`AS3=${as3.size} TS=${ts.size} missing=${missing.length} extra=${extra.length}`);
  missing.forEach((m) => console.log("  < " + m));
}
