#!/usr/bin/env node
// test.js — Tests for tink trait unification engine

import { unify, flattenUnified } from "./unify.js";
import { matchArchetype, getCatalog } from "./archetypes.js";
import { Loom, LOOM_TIERS } from "./loom.js";
import { getAllThreads } from "./threads.js";
import {
  beatMatches, beatPartialScore, evaluateEpic, evaluateAllEpics, TEST_EPICS,
  EPICS, PROJECTIONS, STABILITY_TONE, STABILITY_HUE, scoreAxisAlignment, evaluateRun,
} from "./epics.js";

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

// ═══ Cascade: archetype output modifies downstream crossings ═══
section("Cascade: archetype output modifies downstream crossings");
{
  const loom = new Loom("medium");
  const threads = getAllThreads();
  const find = (name) => threads.find(t => t.name === name);

  // Place threads so center crossing produces an archetype with cascade traits
  // Ember: hot, bright, ephemeral
  // Glacier: cold, vast, persistent
  // Clockwork: mechanical, persistent, sharp
  loom.place(find("Ember"), 0, 0);      // center
  loom.place(find("Glacier"), 1, 0);     // east
  loom.place(find("Clockwork"), -1, 0);  // west

  const crossings = loom.activate();
  ok(crossings.length >= 2, "At least 2 crossings resolved");

  // Every crossing should have a cascadeApplied field (may be empty for first crossing)
  ok(crossings.every(cx => Array.isArray(cx.cascadeApplied)),
    "All crossings have cascadeApplied array");

  // First crossing (center) receives no cascade (nothing resolved before it)
  eq(crossings[0].cascadeApplied.length, 0,
    "First crossing receives no cascade (nothing resolved before it)");
}

// ═══ Cascade: traits inject into neighboring crossings ═══
section("Cascade: traits inject into neighboring crossings");
{
  const loom = new Loom("medium");
  const threads = getAllThreads();
  const find = (name) => threads.find(t => t.name === name);

  // Place Ember at center and Glacier east
  // Ember(hot,bright,ephemeral) x Glacier(cold,vast,persistent) should match something
  // and emit cascade traits to the positions
  loom.place(find("Ember"), 0, 0);
  loom.place(find("Glacier"), 1, 0);
  loom.place(find("Clockwork"), -1, 0);

  const crossings = loom.activate();

  // Check that later crossings may have received cascade traits
  // The center crossing's archetype (if any) emits cascade to neighbors
  if (crossings[0].archetype.match) {
    const cascade = crossings[0].archetype.match.cascade;
    if (cascade && Object.keys(cascade).length > 0) {
      // At least one later crossing should have cascade applied
      const laterWithCascade = crossings.slice(1).filter(
        cx => cx.cascadeApplied.length > 0
      );
      ok(laterWithCascade.length > 0 || crossings.length === 1,
        "Cascade traits propagate to later crossings");
    }
  }
  ok(true, "Cascade resolution completes without error");
}

// ═══ Archetype: cascade-only legendaries ═══
section("Archetype: cascade-only legendaries");
{
  const catalog = getCatalog();
  const legendaries = catalog.filter(a => a.tier === "legendary");
  ok(legendaries.length >= 3, "At least 3 legendary archetypes exist");
  ok(legendaries.every(a => Object.keys(a.required).length >= 5),
    "Legendaries require 5+ traits (impossible from single crossing)");
  ok(legendaries.every(a => a.cascade),
    "All legendaries have cascade fields");
}

// ═══ Loom tiers ═══
section("Loom tiers: size definitions");
{
  eq(LOOM_TIERS.small.positions.length, 3, "Small loom has 3 positions");
  eq(LOOM_TIERS.medium.positions.length, 7, "Medium loom has 7 positions");
  eq(LOOM_TIERS.large.positions.length, 12, "Large loom has 12 positions");
  eq(LOOM_TIERS.full.positions.length, 19, "Full loom has 19 positions");
}

section("Loom tiers: constructor defaults");
{
  const loom = new Loom();
  eq(loom.tier, "small", "Default tier is small");
  eq(loom.positions.length, 3, "Default loom has 3 positions");
}

section("Loom tiers: explicit tier");
{
  const small = new Loom("small");
  eq(small.positions.length, 3, "Small loom constructed with 3 cells");

  const medium = new Loom("medium");
  eq(medium.positions.length, 7, "Medium loom constructed with 7 cells");

  const large = new Loom("large");
  eq(large.positions.length, 12, "Large loom constructed with 12 cells");

  const full = new Loom("full");
  eq(full.positions.length, 19, "Full loom constructed with 19 cells");
}

section("Loom tiers: placement respects tier boundaries");
{
  const small = new Loom("small");
  // (0,0) and (1,0) are valid in small
  small.place({ name: "Test", nature: { bright: true } }, 0, 0);
  ok(small.grid.has("0,0"), "Can place at center in small loom");

  let threwOnInvalid = false;
  try {
    small.place({ name: "Test2", nature: {} }, -1, 0);
  } catch (e) {
    threwOnInvalid = true;
  }
  ok(threwOnInvalid, "Cannot place at (-1,0) in small loom (not in tier)");

  const medium = new Loom("medium");
  medium.place({ name: "Test3", nature: {} }, -1, 0);
  ok(medium.grid.has("-1,0"), "Can place at (-1,0) in medium loom");
}

section("Loom tiers: tier affects crossings");
{
  const threads = getAllThreads();
  const find = (name) => threads.find(t => t.name === name);

  // Small loom: 3 cells, place at all 3 -> max crossings from adjacency
  const small = new Loom("small");
  small.place(find("Ember"), 0, 0);
  small.place(find("Glacier"), 1, 0);
  small.place(find("Clockwork"), 0, 1);
  const smallCrossings = small.activate();

  // Medium loom with same 3 threads at same positions
  const medium = new Loom("medium");
  medium.place(find("Ember"), 0, 0);
  medium.place(find("Glacier"), 1, 0);
  medium.place(find("Clockwork"), 0, 1);
  const mediumCrossings = medium.activate();

  // Same threads at same positions should produce same crossings
  eq(smallCrossings.length, mediumCrossings.length,
    "Same thread placement produces same crossings regardless of tier");

  // But medium allows more placements
  medium.place(find("Tidepool"), -1, 0);
  const expandedCrossings = medium.activate();
  ok(expandedCrossings.length > mediumCrossings.length,
    "More threads on medium loom produces more crossings");
}

// ═══ Beat matching ═══
section("Beat matching");
{
  const beat = { label: "Test", requires: { stability: "tension" } };
  const cxMatch = { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 };
  const cxMiss = { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 };
  ok(beatMatches(beat, cxMatch), "Exact stability match");
  ok(!beatMatches(beat, cxMiss), "Stability mismatch returns false");
}
{
  const beat = { label: "Test", requires: { traits: { bright: true, hot: true } } };
  const cxAll = { stability: "harmony", traits: { bright: true, hot: true, cold: true }, archetype: null, nearMisses: [], cascadeDepth: 0 };
  const cxPartial = { stability: "harmony", traits: { bright: true, cold: true }, archetype: null, nearMisses: [], cascadeDepth: 0 };
  ok(beatMatches(beat, cxAll), "Trait requirements all satisfied");
  ok(!beatMatches(beat, cxPartial), "Trait requirements partially fail");
}
{
  const beat = { label: "Test", requires: { hasArchetype: true } };
  const cxWith = { stability: "harmony", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 0 };
  const cxWithout = { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 };
  ok(beatMatches(beat, cxWith), "hasArchetype true with archetype present");
  ok(!beatMatches(beat, cxWithout), "hasArchetype true with no archetype");
}
{
  const beat = { label: "Test", requires: { cascadeDepth: 2 } };
  const cxMet = { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 3 };
  const cxNot = { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 1 };
  ok(beatMatches(beat, cxMet), "cascadeDepth requirement met");
  ok(!beatMatches(beat, cxNot), "cascadeDepth requirement not met");
}
{
  const beat = { label: "Test", requires: { stability: "tension", hasArchetype: true, cascadeDepth: 1 } };
  const cx = { stability: "tension", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 2 };
  ok(beatMatches(beat, cx), "Multiple requirements all satisfied");
}
{
  const beat = { label: "Test", requires: {} };
  const cx = { stability: "paradox", traits: { bright: true }, archetype: null, nearMisses: [], cascadeDepth: 0 };
  ok(beatMatches(beat, cx), "Empty requirements = always matches");
}

// ═══ Beat partial score ═══
section("Beat partial score");
{
  const beat = { label: "Test", requires: { stability: "tension", hasArchetype: true } };
  const cxFull = { stability: "tension", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 0 };
  eq(beatPartialScore(beat, cxFull), 1.0, "Full match = 1.0");
}
{
  const beat = { label: "Test", requires: { stability: "paradox", hasArchetype: true } };
  const cxNone = { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 };
  eq(beatPartialScore(beat, cxNone), 0.0, "No match = 0.0");
}
{
  const beat = { label: "Test", requires: { stability: "tension", hasArchetype: true } };
  const cxHalf = { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 };
  eq(beatPartialScore(beat, cxHalf), 0.5, "Half match = 0.5");
}
{
  const beat = { label: "Test", requires: {} };
  const cx = { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 };
  eq(beatPartialScore(beat, cx), 1.0, "Empty requirements = 1.0");
}

// ═══ Epic evaluation ═══
section("Epic evaluation");
{
  // Build a history that matches Test Spark's two beats in order
  const history = [
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 0 },
  ];
  const result = evaluateEpic(TEST_EPICS[0], history);
  eq(result.completedBeats, 2, "All beats match in order");
  ok(result.complete, "Complete flag true when all match");
}
{
  // Only first beat matches
  const history = [
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "resonance", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  const result = evaluateEpic(TEST_EPICS[0], history);
  eq(result.completedBeats, 1, "Partial when some beats match");
  ok(!result.complete, "Not complete when partial");
}
{
  // Test Echo: 3 beats, 2 match = 0.67 = near-miss
  const history = [
    { stability: "resonance", traits: { bright: true, hot: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: { bright: true, hot: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  const result = evaluateEpic(TEST_EPICS[1], history);
  // Beat 1 (resonance) matches history[0], Beat 2 (traits bright+hot) matches history[1], Beat 3 (cascadeDepth 1) doesn't match
  eq(result.completedBeats, 2, "Two of three beats matched");
  ok(result.nearMiss, "Near-miss at 67%+ completion");
}
{
  // Beats must match in ORDER: beat 2 can only match after beat 1's match
  // History has archetype first, tension second — but beat 1 needs tension, beat 2 needs archetype
  const history = [
    { stability: "harmony", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  const result = evaluateEpic(TEST_EPICS[0], history);
  // Beat 1 (stability: tension) matches history[1] (index 1)
  // Beat 2 (hasArchetype: true) needs to match AFTER index 1 — nothing left
  eq(result.completedBeats, 1, "Beats must match in order (beat 2 after beat 1)");
}
{
  const result = evaluateEpic(TEST_EPICS[0], []);
  eq(result.completedBeats, 0, "Empty history = no matches");
  eq(result.ratio, 0, "Empty history ratio = 0");
}
{
  const history = [
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 0 },
  ];
  const r1 = evaluateEpic(TEST_EPICS[0], history);
  const r2 = evaluateEpic(TEST_EPICS[0], history);
  ok(r1.completedBeats === r2.completedBeats && r1.ratio === r2.ratio && r1.complete === r2.complete,
    "Same input produces same output (idempotency)");
}

// ═══ Evaluate all epics ═══
section("Evaluate all epics");
{
  // History that fully matches Test Spark but not Test Echo or Test Paradox Walk
  const history = [
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: { name: "Aurora", tier: "uncommon" }, nearMisses: [], cascadeDepth: 0 },
  ];
  const results = evaluateAllEpics(TEST_EPICS, history);
  ok(results.length === 3, "All three test epics evaluated");
  // Results should be sorted by ratio descending
  ok(results[0].ratio >= results[1].ratio && results[1].ratio >= results[2].ratio,
    "Returns sorted by ratio descending");
  // Test Spark should be first (complete = ratio 1.0)
  eq(results[0].epic.name, "Test Spark", "Fully matched epic first");
}
{
  // Verify each epic is evaluated independently — different histories for different epics
  const history = [
    { stability: "resonance", traits: { bright: true, hot: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: { bright: true, hot: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 1 },
  ];
  const results = evaluateAllEpics(TEST_EPICS, history);
  // Test Echo should match all 3 beats (resonance, traits bright+hot, cascadeDepth 1)
  const echoResult = results.find(r => r.epic.name === "Test Echo");
  eq(echoResult.completedBeats, 3, "Multiple epics evaluated independently");
}

// ═══ Projection transforms ═══
section("Projection: heroic adds heroStage");
{
  const history = [
    { stability: "harmony", traits: { bright: true } },
    { stability: "tension", traits: { hot: true } },
    { stability: "resonance", traits: { cold: true } },
    { stability: "paradox", traits: { volatile: true } },
  ];
  const heroicProj = PROJECTIONS.find(p => p.id === "heroic");
  const transformed = heroicProj.transform(history);
  eq(transformed[0].heroStage, "call", "Heroic: first quarter = call");
  eq(transformed[1].heroStage, "trials", "Heroic: second quarter = trials");
  eq(transformed[2].heroStage, "ordeal", "Heroic: third quarter = ordeal");
  eq(transformed[3].heroStage, "return", "Heroic: last quarter = return");
  eq(transformed[0].stability, "harmony", "Heroic: original fields preserved");
}

section("Projection: tragedy adds dramaticArc");
{
  const history = [
    { stability: "harmony", traits: {} },
    { stability: "tension", traits: {} },
    { stability: "paradox", traits: {} },
    { stability: "resonance", traits: {} },   // lower than paradox -> falling
    { stability: "harmony", traits: {} },      // still lower -> past 70%, denouement
  ];
  const tragProj = PROJECTIONS.find(p => p.id === "tragedy");
  const transformed = tragProj.transform(history);
  eq(transformed[0].dramaticArc, "rising", "Tragedy: harmony start = rising");
  eq(transformed[1].dramaticArc, "rising", "Tragedy: tension > harmony = rising");
  eq(transformed[2].dramaticArc, "rising", "Tragedy: paradox = peak, still rising");
  eq(transformed[3].dramaticArc, "falling", "Tragedy: resonance < peak = falling");
  // index 4 is at 80% (4/5 = 0.8 > 0.7), so denouement
  eq(transformed[4].dramaticArc, "denouement", "Tragedy: late fall = denouement");
}

section("Projection: reflection adds symmetry and echoCount");
{
  const history = [
    { stability: "harmony", traits: { bright: true, cold: true } },
    { stability: "tension", traits: { hot: true } },
    { stability: "harmony", traits: { bright: true, cold: true } },  // same trait key set
  ];
  const reflProj = PROJECTIONS.find(p => p.id === "reflection");
  const transformed = reflProj.transform(history);
  eq(transformed[0].symmetry, "first", "Reflection: first occurrence = first");
  eq(transformed[0].echoCount, 1, "Reflection: first echoCount = 1");
  eq(transformed[1].symmetry, "first", "Reflection: unique trait set = first");
  eq(transformed[2].symmetry, "echo", "Reflection: repeated trait set = echo");
  eq(transformed[2].echoCount, 2, "Reflection: second echoCount = 2");
}

section("Projection: tapestry is identity");
{
  const history = [{ stability: "harmony", traits: { bright: true } }];
  const tapProj = PROJECTIONS.find(p => p.id === "tapestry");
  const transformed = tapProj.transform(history);
  ok(transformed === history, "Tapestry transform returns same array reference");
}

// ═══ scoreAxisAlignment ═══
section("scoreAxisAlignment: perfect alignment");
{
  const beat = { mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 } };
  const cx = { stability: "tension", traits: {} };
  const result = scoreAxisAlignment(beat, cx);
  eq(result.aligned, 3, "All 3 axes aligned for tension/dissonant");
  eq(result.total, 3, "3 total axes checked");
  eq(result.ratio, 1, "Ratio = 1 for perfect alignment");
  ok(result.golden, "Golden = true for ratio > 0.8");
}

section("scoreAxisAlignment: misaligned mood");
{
  const beat = { mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 } };
  const cx = { stability: "paradox", traits: {} };
  const result = scoreAxisAlignment(beat, cx);
  eq(result.aligned, 0, "No axes aligned (harmony mood vs paradox stability)");
  eq(result.total, 3, "3 total axes checked");
  eq(result.ratio, 0, "Ratio = 0 for no alignment");
  ok(!result.golden, "Golden = false for zero alignment");
}

section("scoreAxisAlignment: no mood");
{
  const beat = { requires: { stability: "tension" } };
  const cx = { stability: "tension", traits: {} };
  const result = scoreAxisAlignment(beat, cx);
  eq(result.aligned, 0, "No mood = 0 aligned");
  eq(result.total, 0, "No mood = 0 total");
  eq(result.ratio, 0, "No mood = 0 ratio");
  ok(!result.golden, "No mood = not golden");
}

section("scoreAxisAlignment: partial alignment");
{
  // tone matches (crystalline = resonance), hue matches, but intensity off
  const beat = { mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.9 } };
  const cx = { stability: "resonance", traits: {} };
  const result = scoreAxisAlignment(beat, cx);
  // tone: crystalline === STABILITY_TONE.resonance -> aligned
  // hue: #4488ff === STABILITY_HUE.resonance -> aligned
  // intensity: natIntensity.resonance = 0.4, mood.intensity = 0.9, |0.4 - 0.9| = 0.5 >= 0.25 -> NOT aligned
  eq(result.aligned, 2, "2 of 3 axes aligned (tone + hue, not intensity)");
  eq(result.total, 3, "3 total axes checked");
  ok(result.ratio > 0.6 && result.ratio < 0.7, "Ratio is 2/3");
  ok(!result.golden, "Not golden at 2/3 alignment");
}

// ═══ evaluateRun ═══
section("evaluateRun: filters by unlocked projections");
{
  const history = [
    { stability: "harmony", traits: { organic: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: { volatile: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  // Only tapestry is unlocked by default
  const projections = PROJECTIONS.map(p => ({ ...p }));
  projections[0].unlocked = true;   // tapestry
  projections[1].unlocked = false;  // heroic
  projections[2].unlocked = false;  // tragedy
  projections[3].unlocked = false;  // reflection

  const { results } = evaluateRun(history, projections, EPICS);
  // Only tapestry epics should appear
  ok(results.every(r => r.projection.id === "tapestry"),
    "Only tapestry epics when only tapestry unlocked");
  eq(results.length, 6, "6 tapestry epics evaluated");
}

section("evaluateRun: aggregates goldenMoments");
{
  // Craft a history that triggers Combustion Engine (tapestry) with aligned moods
  // Beat 1: volatile trait + tension stability (mood: dissonant/#ff6600/0.7 -> tension aligns)
  // Beat 2: volatile trait (no mood)
  // Beat 3: cascadeDepth >= 1 + tension stability (mood: dissonant/#ff6600/0.7)
  const history = [
    { stability: "tension", traits: { volatile: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: { volatile: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 2 },
  ];
  const projections = PROJECTIONS.map(p => ({ ...p, unlocked: p.id === "tapestry" }));
  const { results, goldenMoments } = evaluateRun(history, projections, EPICS);
  // Combustion Engine should be complete (all 3 beats match)
  const combustion = results.find(r => r.epic.name === "Combustion Engine");
  ok(combustion !== undefined, "Combustion Engine found in results");
  ok(combustion.complete, "Combustion Engine complete");
  ok(goldenMoments >= 0, "goldenMoments is a non-negative number");
}

section("evaluateRun: results sorted by ratio descending");
{
  const history = [
    { stability: "tension", traits: { volatile: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  const projections = PROJECTIONS.map(p => ({ ...p, unlocked: p.id === "tapestry" }));
  const { results } = evaluateRun(history, projections, EPICS);
  for (let i = 1; i < results.length; i++) {
    ok(results[i - 1].ratio >= results[i].ratio,
      `Result ${i - 1} ratio >= result ${i} ratio`);
  }
}

// ═══ Full epic beats: end-to-end ═══
section("Full epic: Combustion Engine end-to-end");
{
  // Combustion Engine: volatile, volatile, cascadeDepth>=1
  const history = [
    { stability: "tension", traits: { volatile: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: { volatile: true, bright: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "resonance", traits: { cold: true }, archetype: null, nearMisses: [], cascadeDepth: 1 },
  ];
  const combustion = EPICS.find(e => e.name === "Combustion Engine");
  const result = evaluateEpic(combustion, history);
  eq(result.completedBeats, 3, "Combustion Engine: all 3 beats match");
  ok(result.complete, "Combustion Engine: marked complete");
  eq(result.matched[0].index, 0, "Beat 1 matched at history[0]");
  eq(result.matched[1].index, 1, "Beat 2 matched at history[1]");
  eq(result.matched[2].index, 2, "Beat 3 matched at history[2]");
}

section("Full epic: The Weaver's Doubt end-to-end");
{
  // The Weaver's Doubt: hasNearMiss, hasNearMiss, hasArchetype
  const history = [
    { stability: "harmony", traits: {}, archetype: null, nearMisses: [{ name: "Aurora" }], cascadeDepth: 0 },
    { stability: "tension", traits: { bright: true }, archetype: null, nearMisses: [{ name: "Stormglass" }], cascadeDepth: 0 },
    { stability: "resonance", traits: {}, archetype: { name: "Paradox Bloom", tier: "mythic" }, nearMisses: [], cascadeDepth: 0 },
  ];
  const doubt = EPICS.find(e => e.name === "The Weaver's Doubt");
  const result = evaluateEpic(doubt, history);
  eq(result.completedBeats, 3, "Weaver's Doubt: all 3 beats match");
  ok(result.complete, "Weaver's Doubt: marked complete");
}

// ═══ Heroic Journey epic with projection transform ═══
section("Heroic Journey epic: The Reluctant Hero with projection");
{
  // 8 crossings: 2 call (harmony), 2 trials (tension), 2 ordeal (paradox), 2 return
  const rawHistory = [
    { stability: "harmony", traits: { calm: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: { bright: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: { volatile: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: { hot: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "paradox", traits: { organic: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "paradox", traits: { mechanical: true }, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "resonance", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  const heroicProj = PROJECTIONS.find(p => p.id === "heroic");
  const transformed = heroicProj.transform(rawHistory);

  // Verify stages assigned correctly for 8 items:
  // 0,1 = call (< 2), 2,3 = trials (< 4), 4,5 = ordeal (< 6), 6,7 = return
  eq(transformed[0].heroStage, "call", "Index 0 = call");
  eq(transformed[2].heroStage, "trials", "Index 2 = trials");
  eq(transformed[4].heroStage, "ordeal", "Index 4 = ordeal");
  eq(transformed[6].heroStage, "return", "Index 6 = return");

  // The Reluctant Hero: call+harmony, trials+tension, ordeal+paradox
  const hero = EPICS.find(e => e.name === "The Reluctant Hero");
  const result = evaluateEpic(hero, transformed);
  eq(result.completedBeats, 3, "Reluctant Hero: all 3 beats match with projected history");
  ok(result.complete, "Reluctant Hero: complete after heroic projection");
}

section("Heroic Journey epic: hero beats fail without projection");
{
  // Same history but without heroic projection -- heroStage fields missing
  const rawHistory = [
    { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "tension", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "paradox", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
    { stability: "harmony", traits: {}, archetype: null, nearMisses: [], cascadeDepth: 0 },
  ];
  const hero = EPICS.find(e => e.name === "The Reluctant Hero");
  const result = evaluateEpic(hero, rawHistory);
  eq(result.completedBeats, 0, "Reluctant Hero: 0 beats without heroic projection");
  ok(!result.complete, "Reluctant Hero: not complete without projection");
}

// ═══ Epic data integrity ═══
section("Epic data integrity");
{
  eq(EPICS.length, 12, "12 epics total");
  const tapestry = EPICS.filter(e => e.projection === "tapestry");
  const heroic = EPICS.filter(e => e.projection === "heroic");
  const tragedy = EPICS.filter(e => e.projection === "tragedy");
  eq(tapestry.length, 6, "6 tapestry epics");
  eq(heroic.length, 3, "3 heroic epics");
  eq(tragedy.length, 3, "3 tragedy epics");

  ok(EPICS.every(e => e.name && e.tier && e.projection && e.beats.length >= 2),
    "All epics have name, tier, projection, and 2+ beats");
  ok(EPICS.every(e => e.onComplete && e.onPartial),
    "All epics have onComplete and onPartial text");
  ok(EPICS.every(e => e.beats.every(b => b.label && b.requires && b.onMatch && b.onPartial)),
    "All beats have label, requires, onMatch, onPartial");
}

section("Stability constants");
{
  eq(STABILITY_TONE.harmony, "warm", "Harmony tone = warm");
  eq(STABILITY_TONE.resonance, "crystalline", "Resonance tone = crystalline");
  eq(STABILITY_TONE.tension, "dissonant", "Tension tone = dissonant");
  eq(STABILITY_TONE.paradox, "dark", "Paradox tone = dark");
  eq(STABILITY_HUE.harmony, "#44aa88", "Harmony hue");
  eq(STABILITY_HUE.resonance, "#4488ff", "Resonance hue");
  eq(STABILITY_HUE.tension, "#ff6600", "Tension hue");
  eq(STABILITY_HUE.paradox, "#aa00ff", "Paradox hue");
}

section("Projection data integrity");
{
  eq(PROJECTIONS.length, 4, "4 projections total");
  ok(PROJECTIONS[0].unlocked, "Tapestry starts unlocked");
  ok(!PROJECTIONS[1].unlocked, "Heroic starts locked");
  ok(!PROJECTIONS[2].unlocked, "Tragedy starts locked");
  ok(!PROJECTIONS[3].unlocked, "Reflection starts locked");
  ok(PROJECTIONS.every(p => p.name && p.id && p.description && typeof p.transform === "function"),
    "All projections have name, id, description, transform");
  ok(PROJECTIONS.every(p => p.palette && p.palette.baseHue),
    "All projections have palette with baseHue");
}

// ═══ Summary ═══
console.log(`\n${B}\u2500\u2500 Results \u2500\u2500${D}`);
console.log(`  Total:  ${total}`);
console.log(`  ${G}Passed: ${passed}${D}`);
if (failed > 0) { console.log(`  ${R}Failed: ${failed}${D}`); process.exit(1); }
else { console.log(`\n  ${G}${B}\u2713 All tests passed!${D}\n`); }
