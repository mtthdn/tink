#!/usr/bin/env node
// test.js — Tests for tink trait unification engine

import { unify, flattenUnified } from "./unify.js";
import { matchArchetype, getCatalog } from "./archetypes.js";

let passed = 0, failed = 0, total = 0;
const G = "\x1b[32m", R = "\x1b[31m", C = "\x1b[36m", B = "\x1b[1m", D = "\x1b[0m";

function ok(cond, msg) {
  total++;
  if (cond) { passed++; console.log(`  ${G}\u2713${D} ${msg}`); }
  else { failed++; console.log(`  ${R}\u2717${D} ${msg}`); }
}
function eq(a, b, msg) {
  total++;
  if (a === b) { passed++; console.log(`  ${G}\u2713${D} ${msg}`); }
  else { failed++; console.log(`  ${R}\u2717${D} ${msg} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`); }
}
function section(s) { console.log(`\n${B}${C}\u2500\u2500 ${s} \u2500\u2500${D}`); }

// ═══ Harmony ═══
section("Harmony");
{
  const r = unify({ bright: true, hot: true }, { liquid: true, organic: true });
  eq(r.stability, "harmony", "Disjoint natures = harmony");
  eq(r.conflicts.length, 0, "No conflicts");
  eq(r.resonances.length, 0, "No resonances");
  eq(Object.keys(r.unified).length, 4, "All 4 traits present");
}
{
  const r = unify({ hot: true }, { cold: true });
  eq(r.stability, "harmony", "Non-overlapping booleans = harmony");
}

// ═══ Resonance ═══
section("Resonance");
{
  const r = unify({ bright: true, emotional: true, hot: true }, { bright: true, emotional: true, liquid: true });
  eq(r.stability, "resonance", "Shared same-value traits = resonance");
  ok(r.resonances.length >= 2, "At least 2 resonant traits");
  eq(r.conflicts.length, 0, "No conflicts");
}
{
  const r = unify({ volatile: true, bright: true }, { volatile: true, bright: true });
  eq(r.stability, "resonance", "Identical natures = pure resonance");
  eq(r.resonances.length, 2, "Both resonate");
}

// ═══ Tension ═══
section("Tension");
{
  const r = unify({ bright: true, volatile: true, organic: true }, { bright: false, volatile: true, mechanical: true });
  eq(r.stability, "tension", "1 conflict / 2 shared = tension");
  ok(r.conflicts.includes("bright"), "bright conflicts");
  ok(r.resonances.includes("volatile"), "volatile resonates");
  ok(r.unified.bright?.conflicted, "Conflicted trait marked");
}
{
  const r = unify({ hot: true, cold: true }, { hot: false, cold: true });
  eq(r.stability, "tension", "50% conflict = tension (not paradox)");
}

// ═══ Paradox ═══
section("Paradox");
{
  const r = unify({ bright: true, hot: true, organic: true }, { bright: false, hot: false, organic: false });
  eq(r.stability, "paradox", "All shared keys conflict = paradox");
  eq(r.conflicts.length, 3, "3 conflicts");
  eq(r.resonances.length, 0, "No resonances");
}
{
  const r = unify({ bright: true, hot: true, vast: true, quiet: true }, { bright: false, hot: false, vast: true, liquid: true });
  eq(r.stability, "paradox", "2/3 conflict ratio = paradox");
}

// ═══ flattenUnified ═══
section("flattenUnified");
{
  const f = flattenUnified({ bright: true, hot: { conflicted: true, from: [true, false] }, level: 5 });
  eq(f.bright, true, "Boolean passes through");
  eq(f.hot, "conflicted", "Conflicted becomes 'conflicted'");
  eq(f.level, 5, "Number passes through");
}

// ═══ Archetype matching ═══
section("Archetype: exact match");
{
  const r = unify({ bright: true, cold: true }, { bright: true });
  const m = matchArchetype(r);
  ok(m.match !== null, "Found match");
  eq(m.match?.name, "Aurora", "Aurora matched");
  eq(m.score?.ratio, 1.0, "Perfect ratio");
}

section("Archetype: Vendetta Engine");
{
  const r = unify({ emotional: true, mechanical: true }, { persistent: true, mechanical: true });
  const m = matchArchetype(r);
  ok(m.match !== null, "Found match");
  eq(m.match?.name, "Vendetta Engine", "Vendetta Engine matched");
}

section("Archetype: Paradox Bloom");
{
  const r = unify({ bright: true, hot: true, organic: true }, { bright: false, hot: false, organic: false });
  const m = matchArchetype(r);
  ok(m.match !== null, "Found match");
  eq(m.match?.name, "Paradox Bloom", "Paradox Bloom matched");
}

section("Archetype: no match");
{
  const r = unify({ magnetic: true }, { uncertain: true });
  const m = matchArchetype(r);
  eq(m.match, null, "No match for obscure traits");
}

section("Archetype: candidates list");
{
  const r = unify({ hot: true, emotional: true, volatile: true, bright: true }, { organic: true, persistent: true });
  const m = matchArchetype(r);
  ok(m.candidates.length > 0, "Multiple candidates found");
  ok(m.candidates.every((c) => c.ratio >= 0.5), "All candidates >= 50% threshold");
}

// ═══ Edge cases ═══
section("Edge cases");
{
  eq(unify({}, {}).stability, "harmony", "Empty natures = harmony");
  eq(Object.keys(unify({}, {}).unified).length, 0, "Empty unified");
  eq(unify({}, { bright: true }).stability, "harmony", "One empty = harmony");
  eq(unify({ element: "fire" }, { element: "water" }).stability, "tension", "String conflict = tension");
}

// ═══ Number merging ═══
section("Number merging");
{
  const r = unify({ power: 3 }, { power: 5 });
  eq(r.stability, "resonance", "Same-sign numbers = resonance");
  eq(r.unified.power, 8, "Numbers sum");
}
{
  const r = unify({ charge: 5 }, { charge: -3 });
  eq(r.stability, "tension", "Opposite-sign numbers = tension");
  ok(r.unified.charge?.conflicted, "Conflicted number marked");
}

// ═══ Archetype: specificity weighting ═══
section("Archetype: specificity weighting");
{
  // Aurora (2 traits: bright+cold, uncommon) and Quiet Resolve
  // (3 traits: emotional+persistent+calm, common) both match at 100%.
  // Without specificity, ratio ties at 1.0 and tier tiebreak picks Aurora (uncommon > common).
  // With specificity, Quiet Resolve should win because 3 matching traits > 2.
  const r = unify(
    { bright: true, cold: true, emotional: true },
    { persistent: true, calm: true }
  );
  const m = matchArchetype(r);
  ok(m.match !== null, "Found a match");
  eq(m.match?.name, "Quiet Resolve",
    "Specificity: 3-trait Quiet Resolve beats 2-trait Aurora");
}
{
  // A thread combo that matches Heartstring (2 traits: emotional+organic, common) AND
  // Vendetta Engine (3 traits: emotional+mechanical+persistent, rare).
  // Vendetta should win on both specificity and tier.
  const r = unify(
    { emotional: true, mechanical: true, persistent: true },
    { organic: true, emotional: true }
  );
  const m = matchArchetype(r);
  ok(m.match !== null, "Found a match");
  eq(m.match?.name, "Vendetta Engine",
    "Specificity: 3-trait Vendetta Engine beats 2-trait Heartstring");
}
{
  // Verify a full 2-trait match still works when it's the only candidate
  const r = unify({ bright: true, cold: true }, { bright: true });
  const m = matchArchetype(r);
  eq(m.match?.name, "Aurora", "Aurora still wins with 2/2 perfect match");
  ok(m.candidates.length > 0, "Has candidates");
}

// ═══ Archetype: near-miss detection ═══
section("Archetype: near-miss detection");
{
  // Has bright + cold (Aurora needs bright + cold) — exact match
  // But also has volatile (Stormglass needs volatile + bright + liquid)
  // Stormglass should show as near-miss (2/3 matched)
  const r = unify({ bright: true, cold: true }, { volatile: true });
  const m = matchArchetype(r);
  eq(m.match?.name, "Aurora", "Aurora is the match");
  ok(m.nearMisses !== undefined, "nearMisses field exists");
  ok(m.nearMisses.length > 0, "Has near-misses");
  ok(m.nearMisses.some(n => n.name === "Stormglass"),
    "Stormglass is a near-miss (2/3 traits)");
  ok(m.nearMisses[0].missingTraits !== undefined,
    "Near-miss includes missing traits");
}

// ═══ Archetype: cascade field ═══
section("Archetype: cascade field");
{
  const catalog = getCatalog();
  const aurora = catalog.find(a => a.name === "Aurora");
  ok(aurora.cascade !== undefined, "Aurora has cascade field");
  ok(typeof aurora.cascade === "object", "Cascade is an object");
  ok(Object.keys(aurora.cascade).length > 0, "Cascade has at least one trait");

  const bloom = catalog.find(a => a.name === "Paradox Bloom");
  ok(bloom.cascade !== undefined, "Paradox Bloom has cascade field");
}

section("Archetype: match includes cascade");
{
  const r = unify({ bright: true, cold: true }, { bright: true });
  const m = matchArchetype(r);
  ok(m.match !== null, "Found match");
  ok(m.match.cascade !== undefined, "Match result includes cascade");
  ok(typeof m.match.cascade === "object", "Cascade is an object");
}

// ═══ Summary ═══
console.log(`\n${B}\u2500\u2500 Results \u2500\u2500${D}`);
console.log(`  Total:  ${total}`);
console.log(`  ${G}Passed: ${passed}${D}`);
if (failed > 0) { console.log(`  ${R}Failed: ${failed}${D}`); process.exit(1); }
else { console.log(`\n  ${G}${B}\u2713 All tests passed!${D}\n`); }
