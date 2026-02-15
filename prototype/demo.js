#!/usr/bin/env node
// demo.js — CLI demo of tink trait unification on a hex loom

import { Loom } from "./loom.js";
import { randomThreads } from "./threads.js";

// ═══ ANSI ═══
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", italic: "\x1b[3m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m",
  magenta: "\x1b[35m", cyan: "\x1b[36m", white: "\x1b[37m",
  bRed: "\x1b[91m", bGreen: "\x1b[92m", bYellow: "\x1b[93m",
  bBlue: "\x1b[94m", bMagenta: "\x1b[95m", bCyan: "\x1b[96m",
};

const STAB = {
  harmony:   { c: C.bGreen,   icon: "\u2261", label: "HARMONY" },
  resonance: { c: C.bCyan,    icon: "\u2728", label: "RESONANCE" },
  tension:   { c: C.bYellow,  icon: "\u26A1", label: "TENSION" },
  paradox:   { c: C.bRed,     icon: "\u2623", label: "PARADOX" },
};

const TIER = {
  mythic:   { c: C.bMagenta, label: "\u2605\u2605\u2605" },
  rare:     { c: C.bBlue,    label: "\u2605\u2605\u2606" },
  uncommon: { c: C.bGreen,   label: "\u2605\u2606\u2606" },
  common:   { c: C.white,    label: "\u2606\u2606\u2606" },
};

const RAR = {
  common:   { c: C.white },
  uncommon: { c: C.green },
  rare:     { c: C.blue },
};

function strip(s) { return s.replace(/\x1b\[[0-9;]*m/g, ""); }

function hr(ch = "\u2500", w = 64) { return C.dim + ch.repeat(w) + C.reset; }

function box(title, lines, bc = C.cyan) {
  const w = 62;
  const out = [`${bc}\u256D${"\u2500".repeat(w)}\u256E${C.reset}`];
  if (title) {
    const t = ` ${title} `;
    out.push(`${bc}\u2502${C.reset}${C.bold}${t}${" ".repeat(Math.max(0, w - strip(t).length))}${C.reset}${bc}\u2502${C.reset}`);
    out.push(`${bc}\u251C${"\u2500".repeat(w)}\u2524${C.reset}`);
  }
  for (const l of lines) {
    const fill = w - strip(l).length;
    out.push(`${bc}\u2502${C.reset} ${l}${" ".repeat(Math.max(0, fill - 1))}${bc}\u2502${C.reset}`);
  }
  out.push(`${bc}\u2570${"\u2500".repeat(w)}\u256F${C.reset}`);
  return out.join("\n");
}

function fmtNature(n) {
  return Object.entries(n).map(([k, v]) => {
    if (v === true) return `${C.green}+${k}${C.reset}`;
    if (v === false) return `${C.red}-${k}${C.reset}`;
    if (v && typeof v === "object" && v.conflicted) return `${C.bRed}\u2716${k}${C.reset}`;
    return `${C.yellow}${k}:${v}${C.reset}`;
  }).join("  ");
}

// ═══ Hex grid display ═══
function renderHex(loom) {
  const pos = loom.getPositions();
  const cell = (q, r) => {
    const p = pos.find((p) => p.q === q && p.r === r);
    if (p?.thread) {
      const rc = RAR[p.thread.rarity] || RAR.common;
      return `${rc.c}${C.bold}${p.thread.name}${C.reset}`;
    }
    return `${C.dim}\u00B7${C.reset}`;
  };
  const pad = (s, w) => {
    const sl = strip(s).length;
    const l = Math.floor((w - sl) / 2);
    return " ".repeat(Math.max(0, l)) + s + " ".repeat(Math.max(0, w - sl - l));
  };
  const w = 14;
  return [
    `${" ".repeat(w / 2)}${pad(cell(0, -1), w)}  ${pad(cell(1, -1), w)}`,
    `${pad(cell(-1, 0), w)}  ${pad(cell(0, 0), w)}  ${pad(cell(1, 0), w)}`,
    `${" ".repeat(w / 2)}${pad(cell(-1, 1), w)}  ${pad(cell(0, 1), w)}`,
  ].join("\n");
}

// ═══ Main ═══
function main() {
  console.log("\n" + hr("\u2550"));
  console.log(`${C.bold}${C.bCyan}  TINK \u2014 Trait Unification Prototype${C.reset}`);
  console.log(`${C.dim}  Weaving threads on a hex loom to see what emerges${C.reset}`);
  console.log(hr("\u2550") + "\n");

  const threads = randomThreads(5);

  console.log(box(`${C.bCyan}THREADS DRAWN`, threads.map((t, i) =>
    `${C.bold}${i + 1}. ${t.name}${C.reset} ${C.dim}(${t.rarity})${C.reset}  ${fmtNature(t.nature)}`
  )));
  console.log();

  const loom = new Loom();
  const slots = [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }];
  threads.forEach((t, i) => loom.place(t, slots[i].q, slots[i].r));

  console.log(box(`${C.bCyan}HEX LOOM`, renderHex(loom).split("\n"), C.magenta));
  console.log();

  console.log(`${C.bold}${C.bYellow}  \u2699  Activating loom...${C.reset}\n`);
  const crossings = loom.activate();

  if (!crossings.length) {
    console.log(`${C.dim}  No adjacent threads to cross.${C.reset}\n`);
    return;
  }

  for (let i = 0; i < crossings.length; i++) {
    const cx = crossings[i];
    const s = STAB[cx.unification.stability];
    const lines = [
      `${C.bold}${cx.threadA.name}${C.reset}  ${s.c}${s.icon}${C.reset}  ${C.bold}${cx.threadB.name}${C.reset}`,
      `Stability: ${s.c}${C.bold}${s.label}${C.reset}`,
    ];
    if (cx.unification.resonances.length)
      lines.push(`${C.bCyan}\u2261 Resonances:${C.reset} ${cx.unification.resonances.join(", ")}`);
    if (cx.unification.conflicts.length)
      lines.push(`${C.bRed}\u2716 Conflicts:${C.reset}  ${cx.unification.conflicts.join(", ")}`);
    lines.push(`Unified:    ${fmtNature(cx.unification.unified)}`);

    if (cx.archetype.match) {
      const t = TIER[cx.archetype.match.tier] || TIER.common;
      lines.push("");
      lines.push(`${t.c}${C.bold}\u2192 ${cx.archetype.match.name}${C.reset}  ${t.c}${t.label}${C.reset}  ${C.dim}(${Math.round(cx.archetype.score.ratio * 100)}% match)${C.reset}`);
      lines.push(`${C.italic}${C.dim}  "${cx.archetype.match.flavor}"${C.reset}`);
    } else {
      lines.push("", `${C.dim}\u2192 No archetype matched \u2014 raw essence${C.reset}`);
    }
    console.log(box(`${s.c}Crossing ${i + 1}`, lines, s.c));
    console.log();
  }

  // Summary
  const counts = { harmony: 0, resonance: 0, tension: 0, paradox: 0 };
  crossings.forEach((cx) => counts[cx.unification.stability]++);
  const sl = Object.entries(counts).filter(([, c]) => c > 0)
    .map(([k, c]) => `${STAB[k].c}${STAB[k].icon} ${STAB[k].label}: ${c}${C.reset}`);
  sl.push("", `${C.dim}Total crossings: ${crossings.length}${C.reset}`);
  const names = crossings.filter((cx) => cx.archetype.match).map((cx) => cx.archetype.match.name);
  if (names.length) sl.push(`${C.bold}Archetypes: ${names.join(", ")}${C.reset}`);
  console.log(box(`${C.bCyan}LOOM SUMMARY`, sl, C.cyan));
  console.log();
}

main();
