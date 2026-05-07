#!/usr/bin/env node --experimental-strip-types
/**
 * find-dead-code.mts
 *
 * Scan every .ts file under src/ for commented-out code and stubs.
 * Reports:
 *   - Single-line `//` comments whose body looks like a statement (contains
 *     `;` or `=` not in `//` markers, or starts with a JS keyword + open paren).
 *   - Block `/* ... *​/` comments containing a semicolon-terminated line that
 *     looks like AS3/JS code (function call, assignment, if/else with body).
 *   - JSDoc-style file headers and pure-prose comments are excluded.
 *
 * Run: node --experimental-strip-types tools/find-dead-code.mts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC = path.resolve('src');

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && entry.name.endsWith('.ts')) yield p;
  }
}

interface Finding {
  file: string;
  line: number;
  kind: 'inline' | 'block';
  content: string;
}

const findings: Finding[] = [];

// Patterns that indicate "this comment body looks like code, not prose".
function looksLikeCode(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  // pure prose / file headers — bail early
  if (/^[*-]+$/.test(t)) return false;        // separator like ─── or ***
  if (/^@(param|returns|throws|see)/i.test(t)) return false; // JSDoc tags
  // strong code signals
  if (/[a-zA-Z_]\w*\s*\([^)]*\)\s*;/.test(t)) return true;     // foo(args);
  if (/^(if|while|for|return|var|let|const|function|else)\b/.test(t)) return true;
  if (/\b\w+(\.\w+)+\s*=\s*[^=]/.test(t)) return true;         // gs.foo = bar
  if (/\b\w+\s*\+=|\b\w+\s*-=|\b\w+\s*\*=/.test(t)) return true; // a += b
  if (/^[A-Za-z_]\w*\.[A-Za-z_]\w*\s*=/.test(t)) return true;  // X.y = ...
  return false;
}

for (const file of walk(SRC)) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative('.', file).replace(/\\/g, '/');

  // 1. Single-line // comments — scan line by line
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^\s*\/\/\s?(.*)$/);
    if (!m) continue;
    const body = m[1];
    // Skip my AS3-bug-fix comments (they quote AS3 but explain a fix)
    if (/AS3 inherited bug fix|AS3 said/i.test(body)) continue;
    // Skip pure section banners: ── or ── name ─── or **
    if (/^[─=*\-]{3,}/.test(body.trim())) continue;
    if (looksLikeCode(body)) {
      findings.push({ file: rel, line: i + 1, kind: 'inline', content: body });
    }
  }

  // 2. Block /* ... */ comments — find each one and inspect content
  const blockRe = /\/\*([\s\S]*?)\*\//g;
  let bm: RegExpExecArray | null;
  while ((bm = blockRe.exec(text)) !== null) {
    const body = bm[1];
    // Compute starting line number of the block
    const startLine = text.slice(0, bm.index).split(/\r?\n/).length;
    // Skip JSDoc that's mostly @param/@returns
    const lineCount = body.split(/\r?\n/).length;
    const docTagCount = (body.match(/^\s*\*\s*@\w+/gm) ?? []).length;
    if (docTagCount > 0 && docTagCount / lineCount > 0.3) continue;
    // Inspect each line
    const inner = body.split(/\r?\n/);
    for (let j = 0; j < inner.length; j++) {
      const raw = inner[j].replace(/^\s*\*\s?/, ''); // strip leading "* "
      if (looksLikeCode(raw)) {
        findings.push({
          file: rel, line: startLine + j, kind: 'block',
          content: raw.trim(),
        });
      }
    }
  }
}

if (findings.length === 0) {
  console.log('No commented-out code found. Codebase is clean.');
  process.exit(0);
}

console.log(`Found ${findings.length} suspicious comment line(s):\n`);
const byFile = new Map<string, Finding[]>();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file)!.push(f);
}
for (const [file, fs_] of byFile) {
  console.log(`\n=== ${file} (${fs_.length}) ===`);
  for (const f of fs_) {
    console.log(`  L${f.line} [${f.kind}]: ${f.content.slice(0, 120)}`);
  }
}
