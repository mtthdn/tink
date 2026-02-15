# Tink Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable HTML5 game where players find threads, weave them on a hex loom via trait unification, and watch cascading archetype activations — starting from the existing JS prototype.

**Architecture:** Existing prototype provides core engine (unify.js, archetypes.js, threads.js, loom.js) with 40 passing tests. Phase 1 completes the engine (cascade mechanic, specificity fix, partial matches). Phase 2 builds the visual game as a single HTML file with Canvas rendering. Phase 3 adds the codex discovery system. Phase 4 adds the Wander exploration phase. Phases 5-6 add juice/sound and run structure.

**Tech Stack:** Vanilla JS (ES modules for prototype, inlined for game), HTML5 Canvas, Web Audio API, localStorage for persistence. No build step, no dependencies.

---

## Phase 1: Engine Completion

### Task 1: Add specificity weighting to archetype matching

The archetype matcher currently scores by `matched / total` ratio only, meaning a 2-trait common archetype at 100% beats a 4-trait rare archetype at 75%. Specificity weighting fixes this (INSIGHT-008).

**Files:**
- Modify: `prototype/archetypes.js` (scoreMatch function)
- Modify: `prototype/test.js` (add specificity tests)

**Step 1: Write the failing test**

Add to `prototype/test.js` before the summary section:

```javascript
section("Archetype: specificity weighting");
{
  // A thread combo that matches Heartstring (2 traits, 100%) AND
  // Vendetta Engine (3 traits, 100%). Vendetta should win due to specificity.
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
  // Verify a full 3-trait match outranks a partial 2-of-3 match
  // even when the partial match is on a higher-trait archetype
  const r = unify({ bright: true, cold: true }, { bright: true });
  const m = matchArchetype(r);
  eq(m.match?.name, "Aurora", "Aurora still wins with 2/2 perfect match");
  ok(m.candidates.length > 0, "Has candidates");
}
```

**Step 2: Run test to verify failure**

Run: `node prototype/test.js`
Expected: First specificity test FAILS (Heartstring wins over Vendetta Engine)

**Step 3: Implement specificity weighting**

In `prototype/archetypes.js`, modify `scoreMatch`:

```javascript
function scoreMatch(flat, archetype, conflicts) {
  const req = archetype.required;
  let matched = 0;
  let total = 0;

  for (const [key, val] of Object.entries(req)) {
    if (key === "_minConflicts") {
      total++;
      if (conflicts.length >= val) matched++;
      continue;
    }
    total++;
    if (key in flat && flat[key] === val) {
      matched++;
    }
  }

  const ratio = total > 0 ? matched / total : 0;
  // Specificity bonus: more required traits = higher score
  // A 3/3 match (score 3.3) beats a 2/2 match (score 2.2)
  const score = ratio * (total + total * 0.1);
  return { matched, total, ratio, score };
}
```

Update `matchArchetype` sort to use `score` instead of `ratio`:

```javascript
candidates.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  return (tierOrder[a.tier] ?? 4) - (tierOrder[b.tier] ?? 4);
});
```

**Step 4: Run test to verify pass**

Run: `node prototype/test.js`
Expected: ALL tests pass including new specificity tests

**Step 5: Commit**

```bash
git add prototype/archetypes.js prototype/test.js
git commit -m "Add specificity weighting to archetype matching"
```

---

### Task 2: Add partial match detection (near-misses)

When a crossing doesn't fully match an archetype but matches 50-99% of traits, report it as a "near miss" for the ambient discovery signal (INSIGHT-021, INSIGHT-024).

**Files:**
- Modify: `prototype/archetypes.js` (matchArchetype return value)
- Modify: `prototype/test.js`

**Step 1: Write the failing test**

```javascript
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
```

**Step 2: Run test to verify failure**

Run: `node prototype/test.js`
Expected: FAILS on `nearMisses field exists`

**Step 3: Implement near-miss detection**

In `prototype/archetypes.js`, modify `matchArchetype` to collect near-misses. A near-miss is a candidate that matched >=50% of traits but was not the best match, OR matched >=50% of an archetype the player hasn't discovered yet (for now, all archetypes qualify).

```javascript
export function matchArchetype(unificationResult) {
  const { unified, conflicts } = unificationResult;
  const flat = flattenUnified(unified);
  const candidates = [];

  for (const archetype of CATALOG) {
    const result = scoreMatch(flat, archetype, conflicts);
    if (result.ratio >= 0.5) {
      candidates.push({ ...archetype, ...result });
    }
  }

  const tierOrder = { mythic: 0, rare: 1, uncommon: 2, common: 3 };
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (tierOrder[a.tier] ?? 4) - (tierOrder[b.tier] ?? 4);
  });

  const best = candidates[0] || null;

  // Near-misses: candidates that matched well but weren't the best
  const nearMisses = candidates
    .filter((c) => c !== best && c.ratio >= 0.5 && c.ratio < 1.0)
    .map((c) => ({
      name: c.name,
      tier: c.tier,
      matched: c.matched,
      total: c.total,
      ratio: c.ratio,
      missingTraits: Object.keys(c.required)
        .filter((k) => k !== "_minConflicts" && !(k in flat && flat[k] === c.required[k])),
    }))
    .slice(0, 3); // Top 3 near-misses max

  return {
    match: best ? { name: best.name, tier: best.tier, flavor: best.flavor } : null,
    score: best ? { matched: best.matched, total: best.total, ratio: best.ratio, score: best.score } : null,
    candidates: candidates.map((c) => ({
      name: c.name, tier: c.tier, matched: c.matched, total: c.total, ratio: c.ratio,
    })),
    nearMisses,
  };
}
```

Also update `scoreMatch` to expose `missingTraits` computation (already captured in the filter above using `required`).

**Step 4: Run test to verify pass**

Run: `node prototype/test.js`
Expected: ALL tests pass

**Step 5: Commit**

```bash
git add prototype/archetypes.js prototype/test.js
git commit -m "Add near-miss detection to archetype matching"
```

---

### Task 3: Add cascade trait emission to archetypes

Each archetype needs a `cascade` field — traits it emits when it resolves, injected into adjacent unresolved crossings (ADR-005, INSIGHT-011).

**Files:**
- Modify: `prototype/archetypes.js` (add cascade field to CATALOG entries)
- Modify: `prototype/test.js`

**Step 1: Write the failing test**

```javascript
section("Archetype: cascade field");
{
  import { getCatalog } from "./archetypes.js";
  const catalog = getCatalog();
  const aurora = catalog.find(a => a.name === "Aurora");
  ok(aurora.cascade !== undefined, "Aurora has cascade field");
  ok(typeof aurora.cascade === "object", "Cascade is an object");
  ok(Object.keys(aurora.cascade).length > 0, "Cascade has at least one trait");

  const bloom = catalog.find(a => a.name === "Paradox Bloom");
  ok(bloom.cascade !== undefined, "Paradox Bloom has cascade field");
}
```

**Step 2: Run test to verify failure**

Run: `node prototype/test.js`
Expected: FAILS on `Aurora has cascade field`

**Step 3: Add cascade fields to all archetypes**

In `prototype/archetypes.js`, add a `cascade` property to each archetype in CATALOG. Cascade traits should be thematically connected to the archetype's identity:

```javascript
// Aurora → emits cold + bright (reinforces its identity)
{ name: "Aurora", required: { bright: true, cold: true }, cascade: { cold: true, bright: true }, tier: "uncommon", flavor: "..." },

// Vendetta Engine → emits persistent + sharp (grudge sharpens)
{ name: "Vendetta Engine", required: { emotional: true, mechanical: true, persistent: true }, cascade: { persistent: true, sharp: true }, tier: "rare", flavor: "..." },

// Paradox Bloom → emits volatile + organic (chaos spreads life)
{ name: "Paradox Bloom", required: { _minConflicts: 3 }, cascade: { volatile: true, organic: true, emotional: true }, tier: "mythic", flavor: "..." },
```

Add cascade to ALL 19 archetypes. Each cascade should emit 1-3 traits. Higher-tier archetypes emit more cascade traits.

**Step 4: Run test to verify pass**

Run: `node prototype/test.js`
Expected: ALL tests pass

**Step 5: Commit**

```bash
git add prototype/archetypes.js prototype/test.js
git commit -m "Add cascade trait emission fields to all archetypes"
```

---

### Task 4: Implement cascade resolution in loom activation

The loom's `activate()` currently resolves crossings independently. Now: when a crossing matches an archetype, its cascade traits are injected into adjacent unresolved crossings before they resolve (ADR-005, p005).

**Files:**
- Modify: `prototype/loom.js` (activate method)
- Modify: `prototype/test.js`

**Step 1: Write the failing test**

```javascript
import { Loom } from "./loom.js";
import { getAllThreads } from "./threads.js";

section("Cascade: archetype output modifies downstream crossings");
{
  const loom = new Loom();
  const threads = getAllThreads();
  const find = (name) => threads.find(t => t.name === name);

  // Place threads so center crossing produces an archetype with cascade traits
  // that modify what the ring crossings produce
  loom.place(find("Ember"), 0, 0);      // center: hot, bright, ephemeral
  loom.place(find("Glacier"), 1, 0);     // east: cold, vast, persistent
  loom.place(find("Clockwork"), -1, 0);  // west: mechanical, persistent, sharp

  const crossings = loom.activate();
  ok(crossings.length >= 2, "At least 2 crossings resolved");

  // The center crossing (Ember×Glacier or Ember×Clockwork) resolves first
  // If it matches an archetype with cascade, the cascadeApplied field should exist
  const hasCascade = crossings.some(cx => cx.cascadeApplied && cx.cascadeApplied.length > 0);
  // Center resolves first, so ring crossings may receive cascade injection
  ok(crossings[0].cascadeApplied === undefined || crossings[0].cascadeApplied.length === 0,
    "First crossing receives no cascade (nothing resolved before it)");
}
```

**Step 2: Run test to verify failure**

Run: `node prototype/test.js`
Expected: FAILS on `cascadeApplied`

**Step 3: Implement cascade in loom.activate()**

Modify `prototype/loom.js` activate method. The key change: after resolving a crossing, if it matched an archetype with cascade traits, inject those traits into adjacent threads that haven't been involved in a resolved crossing yet.

```javascript
activate() {
  this.crossings = [];
  const resolved = new Set();     // pair keys that have been resolved
  const cascadePool = new Map();  // posKey -> extra traits from cascade

  const pairKey = (q1, r1, q2, r2) => {
    const a = posKey(q1, r1), b = posKey(q2, r2);
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  };

  const resolveAt = (q, r, thread) => {
    for (const nb of this.getNeighbors(q, r)) {
      const pk = pairKey(q, r, nb.q, nb.r);
      if (resolved.has(pk)) continue;
      resolved.add(pk);

      // Merge cascade traits into both threads' natures for this crossing
      const extraA = cascadePool.get(posKey(q, r)) || {};
      const extraB = cascadePool.get(posKey(nb.q, nb.r)) || {};
      const natureA = { ...thread.nature, ...extraA };
      const natureB = { ...nb.thread.nature, ...extraB };

      const result = unify(natureA, natureB);
      const archetype = matchArchetype(result);
      const cascadeApplied = [
        ...Object.keys(extraA).map(k => ({ trait: k, to: `${q},${r}` })),
        ...Object.keys(extraB).map(k => ({ trait: k, to: `${nb.q},${nb.r}` })),
      ];

      this.crossings.push({
        threadA: { ...thread, position: { q, r } },
        threadB: { ...nb.thread, position: { q: nb.q, r: nb.r } },
        unification: result,
        archetype,
        cascadeApplied,
      });

      // If archetype matched, emit cascade traits to adjacent positions
      if (archetype.match && archetype.match.cascade) {
        // We need cascade from the catalog entry, not the stripped match
        // Store cascade on the match result from archetypes.js
      }
    }
  };

  // Center first
  const center = this.grid.get(posKey(0, 0));
  if (center) resolveAt(0, 0, center);

  // Then ring
  for (let i = 1; i < HEX_POSITIONS.length; i++) {
    const pos = HEX_POSITIONS[i];
    const thread = this.grid.get(posKey(pos.q, pos.r));
    if (!thread) continue;
    resolveAt(pos.q, pos.r, thread);
  }

  return this.crossings;
}
```

Note: `matchArchetype` must also return cascade traits from the matched archetype. Modify the return value in `archetypes.js`:

```javascript
match: best ? { name: best.name, tier: best.tier, flavor: best.flavor, cascade: best.cascade || {} } : null,
```

Then in `loom.js`, after resolving a crossing, if it matched:

```javascript
if (archetype.match?.cascade) {
  for (const pos of [posKey(q, r), posKey(nb.q, nb.r)]) {
    for (const nb2 of this.getNeighbors(...pos.split(",").map(Number))) {
      const existing = cascadePool.get(posKey(nb2.q, nb2.r)) || {};
      cascadePool.set(posKey(nb2.q, nb2.r), { ...existing, ...archetype.match.cascade });
    }
  }
}
```

**Step 4: Run test to verify pass**

Run: `node prototype/test.js`
Expected: ALL tests pass (including all previous tests — cascade should not break independent resolution)

**Step 5: Commit**

```bash
git add prototype/loom.js prototype/archetypes.js prototype/test.js
git commit -m "Implement cascade resolution: archetype outputs inject traits downstream"
```

---

### Task 5: Add cascade-only archetypes

Add 3 "legendary" archetypes that require traits impossible from a single crossing — only reachable through cascade chain reactions (INSIGHT-026).

**Files:**
- Modify: `prototype/archetypes.js` (add to CATALOG)
- Modify: `prototype/test.js`

**Step 1: Write the failing test**

```javascript
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
```

**Step 2: Run test to verify failure**

Run: `node prototype/test.js`
Expected: FAILS (no legendary tier exists yet)

**Step 3: Add legendary archetypes to CATALOG**

```javascript
// --- Legendary (cascade-only) ---
{
  name: "Tapestry of Ages",
  required: { persistent: true, vast: true, emotional: true, bright: true, organic: true },
  cascade: { persistent: true, vast: true, calm: true },
  tier: "legendary",
  flavor: "Every thread that ever was, remembered in a single weave.",
},
{
  name: "Paradox Engine",
  required: { _minConflicts: 3, mechanical: true, persistent: true, volatile: true },
  cascade: { volatile: true, mechanical: true, sharp: true },
  tier: "legendary",
  flavor: "It runs on impossibility. Each contradiction powers the next.",
},
{
  name: "The Unraveling",
  required: { ephemeral: true, vast: true, sharp: true, volatile: true, emotional: true },
  cascade: { ephemeral: true, volatile: true },
  tier: "legendary",
  flavor: "Not destruction. Transformation so fast it looks like ending.",
},
```

Update `tierOrder` in `matchArchetype`:
```javascript
const tierOrder = { legendary: -1, mythic: 0, rare: 1, uncommon: 2, common: 3 };
```

**Step 4: Run test to verify pass**

Run: `node prototype/test.js`
Expected: ALL tests pass

**Step 5: Commit**

```bash
git add prototype/archetypes.js prototype/test.js
git commit -m "Add 3 cascade-only legendary archetypes"
```

---

## Phase 2: Visual Prototype

### Task 6: Create game.html scaffold with Canvas loom renderer

Build the visual game as a single HTML file. Start with a hex loom rendered on Canvas with static thread placement.

**Files:**
- Create: `game.html`

**Step 1: Create the HTML scaffold**

Create `game.html` with:
- Inline all JS (unify, archetypes, threads, loom engine from prototype/)
- HTML5 Canvas element for the loom (centered, 800x600)
- Basic hex grid rendering: 7 cells as hexagons with axial coordinates
- Empty cells drawn as outlined hexagons, occupied cells filled with thread color
- Thread name rendered inside each hex cell
- No interactivity yet — just render a static loom with pre-placed threads

The file structure:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tink — A Tinker's Loom</title>
  <style>/* inline styles */</style>
</head>
<body>
  <canvas id="loom" width="800" height="600"></canvas>
  <script>
    // === ENGINE (from prototype/) ===
    // unify(), flattenUnified(), matchArchetype(), etc.

    // === RENDERER ===
    // Canvas hex grid drawing

    // === GAME STATE ===
    // Current threads, loom state, codex

    // === INIT ===
    // Place 5 random threads, render loom
  </script>
</body>
</html>
```

**Step 2: Verify it renders**

Open `game.html` in a browser. Should see a hex grid with 7 cells, 5 of them containing thread names.

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add visual game scaffold with Canvas hex loom renderer"
```

---

### Task 7: Add thread tray and drag-to-place interaction

Add a thread selection tray below the loom. Player drags threads from tray onto hex cells.

**Files:**
- Modify: `game.html`

**Step 1: Implement thread tray**

- Draw a horizontal tray below the loom showing available threads (name + trait icons)
- Implement drag interaction: mousedown on tray thread → mousemove shows ghost → mouseup on hex cell places thread
- Occupied cells reject placement (visual feedback: red flash)
- Placed threads removed from tray
- Thread nature traits displayed as colored dots on tray cards

**Step 2: Verify interaction works**

Open `game.html`. Drag a thread from tray to an empty hex cell. Thread appears in cell, removed from tray. Try dragging to occupied cell — rejected.

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add thread tray with drag-to-place interaction"
```

---

### Task 8: Add the lever-pull and sequential activation animation

The core spectacle: player clicks "Activate" button, loom locks, silence beat, then crossings resolve center-outward with visible energy flow (INSIGHT-020, INSIGHT-013).

**Files:**
- Modify: `game.html`

**Step 1: Implement activation sequence**

1. "Activate" button appears when >=2 adjacent threads placed
2. Click button: (a) lock loom (no more edits), (b) tray slides down/dims, (c) 500ms charge-up animation (energy gathers at center), (d) crossings resolve sequentially with 800ms delay between each
3. Each crossing resolution: (a) energy pulse travels along connection line, (b) both threads glow, (c) unified traits flash at crossing point, (d) stability classification appears (color-coded), (e) archetype name materializes if matched
4. After all crossings resolve: summary panel appears showing produced archetypes
5. "Reset" button to clear loom and draw new threads

**Step 2: Implement 4-tier visual escalation**

Per INSIGHT-017, each stability level gets distinct visuals:
- Harmony: gentle green glow, soft pulse
- Resonance: bright cyan pulse, hex border brightens
- Tension: yellow crackling effect, slight shake on the crossing hex
- Paradox: red screen-edge vignette, all hexes vibrate, intense glow

**Step 3: Verify animation sequence**

Open `game.html`. Place 3+ threads. Click Activate. Watch sequential resolution with visual differences per stability level.

**Step 4: Commit**

```bash
git add game.html
git commit -m "Add lever-pull activation with sequential cascade animation"
```

---

### Task 9: Add hover preview and trait unification display

During Weave phase, hovering over a crossing (edge between two occupied hexes) shows the unified traits and stability — but NOT the archetype outcome (ADR-004).

**Files:**
- Modify: `game.html`

**Step 1: Implement crossing preview**

- Detect when mouse hovers over the midpoint between two occupied adjacent hexes
- Show a tooltip/overlay with: thread A name, thread B name, unified traits (colored by type), stability classification
- Do NOT show archetype match (this is the hidden graph — discovery happens on Activate)
- Show conflict/resonance indicators per trait

**Step 2: Verify preview**

Open `game.html`. Place 2 adjacent threads. Hover between them. See unified traits and stability preview.

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add crossing hover preview showing unified traits (not archetype)"
```

---

### Task 10: Add near-miss "something stirs" visual during activation

When a crossing nearly matches an undiscovered archetype during activation, show an ambient visual signal (INSIGHT-024).

**Files:**
- Modify: `game.html`

**Step 1: Implement near-miss signal**

During activation animation, when `archetype.nearMisses` has entries:
- Brief thematic color flash on the crossing (color based on near-miss archetype's trait theme)
- Subtle particle effect (few floating motes that dissipate)
- Text: "Something stirs..." fades in and out over 1s
- If matched 75%+: stronger effect than 50%

**Step 2: Verify signal**

Place threads that partially match an archetype. Activate. See the ambient near-miss signal.

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add ambient near-miss signal during activation"
```

---

## Phase 3: Codex System

### Task 11: Implement codex data model with localStorage persistence

Track discovered archetypes across sessions. The codex persists via localStorage.

**Files:**
- Modify: `game.html` (add codex module)

**Step 1: Implement codex state**

```javascript
const Codex = {
  KEY: "tink-codex-v1",

  load() {
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : { discovered: {}, hints: {}, stats: { runs: 0, totalDiscoveries: 0 } };
  },

  save(codex) {
    localStorage.setItem(this.KEY, JSON.stringify(codex));
  },

  discover(codex, archetype, crossingDetails) {
    const isNew = !(archetype.name in codex.discovered);
    codex.discovered[archetype.name] = {
      name: archetype.name,
      tier: archetype.tier,
      flavor: archetype.flavor,
      firstDiscovered: codex.discovered[archetype.name]?.firstDiscovered || Date.now(),
      timesProduced: (codex.discovered[archetype.name]?.timesProduced || 0) + 1,
      requiredTraits: crossingDetails.requiredTraits, // filled on first discovery
    };
    if (isNew) codex.stats.totalDiscoveries++;
    this.save(codex);
    return isNew;
  },

  addHint(codex, hintText, archetypeName) {
    codex.hints[archetypeName] = { text: hintText, found: Date.now() };
    this.save(codex);
  },

  getCompletionRatio(codex, totalArchetypes) {
    return Object.keys(codex.discovered).length / totalArchetypes;
  },
};
```

**Step 2: Verify persistence**

Discover an archetype → close tab → reopen → codex still has the entry.

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add codex data model with localStorage persistence"
```

---

### Task 12: Add codex UI panel with discovery graph

Show the codex as a toggleable panel. Discovered archetypes are bright nodes; undiscovered are fog. Uses simple 2D layout by trait dimensions (INSIGHT-027, p011).

**Files:**
- Modify: `game.html`

**Step 1: Implement codex panel**

- "Codex" button in top-right corner, toggles panel overlay
- Panel shows: "X of Y archetypes discovered" at top
- Grid/graph of archetype slots: discovered ones show name + tier + flavor, undiscovered show "???" with dim outline
- If a hint exists for an undiscovered archetype, show the hint text instead of "???"
- Archetypes grouped by tier: common → uncommon → rare → mythic → legendary
- Discovered entries show required traits as colored badges

**Step 2: Verify codex display**

Play through activation. Discover an archetype. Open codex. See it listed with full details. See undiscovered slots as "???".

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add codex UI panel with discovery tracking"
```

---

### Task 13: Add first-discovery ceremony

When a player discovers an archetype for the first time, trigger a special ceremony (INSIGHT-025).

**Files:**
- Modify: `game.html`

**Step 1: Implement discovery ceremony**

During activation, when `Codex.discover()` returns `isNew === true`:
1. Pause the activation sequence for 1.5s
2. Crossing hex expands with a radial burst animation
3. Archetype name materializes letter-by-letter in gold text above the crossing
4. Flavor text fades in below
5. Brief codex icon flash in the corner indicating "new entry"
6. Sound cue: ascending chord (Web Audio API, pentatonic — implemented in Phase 5, visual-only for now)

Subsequent productions of the same archetype: normal resolution animation, no ceremony.

**Step 2: Verify ceremony**

Discover a new archetype. See the ceremony. Produce the same archetype again. See normal resolution (no ceremony).

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add first-discovery ceremony animation"
```

---

## Phase 4: Wander Phase

### Task 14: Implement node-map generation

Generate a Slay-the-Spire-style node map for the Wander phase (p009). 5 columns, 3-4 nodes per column, no crossing paths.

**Files:**
- Modify: `game.html` (add Wander module)

**Step 1: Implement map generator**

```javascript
function generateNodeMap(columns = 5, nodesPerCol = [3, 4, 3, 4, 3]) {
  const nodes = [];
  const edges = [];

  // Generate nodes per column
  for (let col = 0; col < columns; col++) {
    const count = nodesPerCol[col];
    for (let row = 0; row < count; row++) {
      const types = ["thread-cluster", "thread-cluster", "clue-shrine", "hazard", "rest"];
      const type = types[Math.floor(Math.random() * types.length)];
      nodes.push({ id: `${col}-${row}`, col, row, type, visited: false });
    }
  }

  // Connect columns: each node connects to 1-2 nodes in next column
  // No crossing paths (sort by row, connect in order)
  for (let col = 0; col < columns - 1; col++) {
    const current = nodes.filter(n => n.col === col);
    const next = nodes.filter(n => n.col === col + 1);
    // ... path generation ensuring no crossings
  }

  return { nodes, edges };
}
```

**Step 2: Add node-map Canvas renderer**

Render the node map on the same canvas (or a separate view). Nodes as circles with type icons. Edges as lines. Player position as a highlight.

**Step 3: Add navigation**

Click a connected node to move there. On thread-cluster nodes, show thread draft interface (2-3 threads offered, pick 1-2).

**Step 4: Commit**

```bash
git add game.html
git commit -m "Add Wander phase with node-map generation and navigation"
```

---

### Task 15: Add thread drafting with satchel limit

At thread-cluster nodes, offer 2-3 threads. Player picks 1-2. Satchel limit of 6 threads per Wander excursion (INSIGHT-018).

**Files:**
- Modify: `game.html`

**Step 1: Implement thread drafting**

- When player visits a thread-cluster node, show 2-3 thread cards
- Each card shows: name, rarity, nature traits
- Player clicks to add to satchel (shown at bottom of map view)
- Satchel counter: "X / 6 threads collected"
- When satchel full, only navigation available (no more thread-cluster collection)
- "Return to Loom" button available at any time — transitions to Weave phase with collected threads

**Step 2: Add thread pool depletion**

Once a thread is offered at a node (even if not taken), remove it from the current Wander's generation pool. No repeat thread offerings within a single excursion.

**Step 3: Add pity mechanic**

After 3 consecutive thread-cluster nodes with no rare+ thread offered, next node guarantees at least one rare thread.

**Step 4: Commit**

```bash
git add game.html
git commit -m "Add thread drafting with satchel limit and pity mechanic"
```

---

### Task 16: Add clue shrine nodes

Clue shrine nodes reveal thematic hints about undiscovered archetypes. Hints encode required traits through flavor text, not mechanically (p012, INSIGHT-022).

**Files:**
- Modify: `game.html`

**Step 1: Implement clue generation**

Create a hint table — each archetype gets a thematic clue:

```javascript
const CLUES = {
  "Aurora": "Where brilliance meets the chill, colors paint the silent sky.",
  "Vendetta Engine": "Where grudge becomes machinery, and patience sharpens the blade.",
  "Paradox Bloom": "Born from deep contradiction — the more it shouldn't exist, the more vibrantly it does.",
  // ... one per archetype
};
```

When player visits a clue shrine, show a random clue for an archetype they haven't discovered. Add it to the codex as a hint (two-stage revelation: existence known, recipe unknown).

**Step 2: Verify clue-to-codex flow**

Visit clue shrine → see thematic hint → open codex → see hint entry for the named archetype (but no recipe details yet).

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add clue shrine nodes with thematic archetype hints"
```

---

## Phase 5: Sound and Juice

### Task 17: Add Web Audio API sound design

Per-stability-level audio palette using pentatonic tones (INSIGHT-017, juice research).

**Files:**
- Modify: `game.html`

**Step 1: Implement audio engine**

```javascript
const Audio = {
  ctx: null,
  init() { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },

  playTone(freq, duration = 0.3, type = "sine", gain = 0.3) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(g).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // Pentatonic scale: C D E G A
  harmony()   { this.playTone(523.25, 0.4, "sine", 0.2); },     // C5 soft
  resonance() { this.playTone(659.25, 0.5, "triangle", 0.3); },  // E5 bright
  tension()   { this.playTone(466.16, 0.3, "sawtooth", 0.15); }, // Bb4 dissonant
  paradox()   { /* cluster chord */ },

  leverPull() { /* 300ms silence then low rumble */ },
  discovery() { /* ascending arpeggio C-E-G-C */ },
};
```

**Step 2: Wire audio to activation events**

- Lever pull: silence dip → low rumble
- Each crossing: stability-matched tone
- Archetype match: chord hit
- First discovery: ascending arpeggio

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add Web Audio API sound design with per-stability tones"
```

---

### Task 18: Add screen shake and visual juice

Escalating visual effects proportional to cascade depth and tension level (INSIGHT-017).

**Files:**
- Modify: `game.html`

**Step 1: Implement screen shake**

```javascript
function screenShake(intensity = 5, duration = 200) {
  const canvas = document.getElementById("loom");
  const start = performance.now();
  function shake(t) {
    const elapsed = t - start;
    if (elapsed > duration) { canvas.style.transform = ""; return; }
    const decay = 1 - elapsed / duration;
    const dx = (Math.random() - 0.5) * intensity * decay * 2;
    const dy = (Math.random() - 0.5) * intensity * decay * 2;
    canvas.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(shake);
  }
  requestAnimationFrame(shake);
}
```

**Step 2: Wire to stability levels**

- Harmony: no shake
- Resonance: very subtle (1px, 100ms)
- Tension: moderate (3px, 200ms)
- Paradox: strong (8px, 400ms)
- Cascade chain length 3+: additional shake on top

**Step 3: Add color saturation escalation**

Canvas filter: `saturate()` increases with cascade depth. Paradox pushes toward oversaturated, almost uncomfortable colors.

**Step 4: Commit**

```bash
git add game.html
git commit -m "Add screen shake and visual escalation per stability level"
```

---

## Phase 6: Run Structure

### Task 19: Add loom growth (3 → 7 → 12 → 19 cells)

Start with 3-cell loom. Expand as milestones are reached (ADR-006).

**Files:**
- Modify: `prototype/loom.js` (support variable sizes)
- Modify: `game.html`

**Step 1: Make Loom constructor accept size tiers**

```javascript
const LOOM_TIERS = {
  small:  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }],                    // 3 cells
  medium: [/* current 7-cell hex */],                                              // 7 cells
  large:  [/* 7 + 5 more in partial second ring */],                              // 12 cells
  full:   [/* full 19-cell hex (2 rings) */],                                     // 19 cells
};

class Loom {
  constructor(tier = "small") {
    this.tier = tier;
    this.positions = LOOM_TIERS[tier];
    this.grid = new Map();
    this.crossings = [];
  }
}
```

**Step 2: Implement loom expansion trigger**

After activation, if a specific archetype is produced (or after N total archetypes), upgrade loom tier. New cells appear with animation.

**Step 3: Commit**

```bash
git add prototype/loom.js game.html prototype/test.js
git commit -m "Add loom growth from 3 to 19 cells across run progression"
```

---

### Task 20: Add Wander-Weave-Activate game loop

Wire Wander → Weave → Activate as the core game loop with state transitions.

**Files:**
- Modify: `game.html`

**Step 1: Implement game state machine**

```javascript
const GameState = {
  phase: "wander",  // "wander" | "weave" | "activate" | "results"
  run: { cycle: 1, maxCycles: 5, loomTier: "small", resonance: {} },
  satchel: [],
  codex: Codex.load(),

  transition(to) {
    this.phase = to;
    render();  // re-render appropriate view
  },
};
```

**Step 2: Implement cycle flow**

1. Wander: generate node map → player explores → collects threads in satchel → clicks "Return to Loom"
2. Weave: show loom + collected threads in tray → player places threads → clicks "Activate"
3. Activate: cascade resolution animation → results panel
4. Results: show archetypes produced, codex updates, loom growth check → "Next Cycle" button
5. After cycle 5: run end — show summary, codex persists

**Step 3: Commit**

```bash
git add game.html
git commit -m "Wire Wander-Weave-Activate game loop with state machine"
```

---

### Task 21: Add tapestry resonance (world responds to weaving)

Track cumulative trait signature from produced archetypes. Shift Wander region weights accordingly (p010).

**Files:**
- Modify: `game.html`

**Step 1: Implement resonance tracking**

After each Activate phase, update run resonance based on produced archetype traits:

```javascript
function updateResonance(resonance, producedArchetypes) {
  for (const arch of producedArchetypes) {
    for (const [trait, val] of Object.entries(arch.requiredTraits || {})) {
      if (trait.startsWith("_")) continue;
      resonance[trait] = (resonance[trait] || 0) + (val === true ? 0.1 : 0);
    }
  }
  // Normalize so max = 1.0
  const max = Math.max(...Object.values(resonance), 0.01);
  for (const k of Object.keys(resonance)) resonance[k] /= max;
  return resonance;
}
```

**Step 2: Wire resonance to Wander map generation**

Aligned regions (matching dominant resonance traits) get +2 nodes and better thread quality. Opposed regions get -1 node but threads are rarer. At extreme resonance (>0.9), a Breach node appears.

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add tapestry resonance shifting Wander region weights"
```

---

### Task 22: Add win/loss condition

Each run has a target: produce a specific archetype or reach a cascade chain of length N (p008).

**Files:**
- Modify: `game.html`

**Step 1: Implement run objectives**

```javascript
function generateObjective(codex) {
  // Objective scales with codex completeness
  const discovered = Object.keys(codex.discovered).length;
  if (discovered < 5) return { type: "discover-any", target: 3, description: "Discover 3 archetypes" };
  if (discovered < 10) return { type: "produce-rare", target: "any-rare", description: "Produce a rare archetype" };
  return { type: "cascade-chain", target: 3, description: "Create a 3-step cascade chain" };
}
```

**Step 2: Implement success/failure**

- Success: objective met within 5 cycles → celebration screen, bonus codex entry
- Failure: 5 cycles pass without meeting objective → "the tapestry frays" → partial progress saved (any discoveries made during the run persist in codex)
- No harsh failure — failure is "you didn't achieve the goal" not "you lose everything"

**Step 3: Commit**

```bash
git add game.html
git commit -m "Add run objectives with win/loss conditions"
```

---

### Task 23: Deploy to quique.ca

Deploy the game as a static file to the existing Caddy infrastructure.

**Files:**
- Create: `deploy.sh`

**Step 1: Create deploy script**

```bash
#!/bin/bash
set -euo pipefail
echo "Deploying tink to quique.ca..."
scp game.html tulip:/tmp/tink-game.html
ssh tulip "pct push 612 /tmp/tink-game.html /var/www/quique.ca/tink/index.html"
echo "Deployed to https://quique.ca/tink/"
```

**Step 2: Deploy and verify**

```bash
bash deploy.sh
curl -sI https://quique.ca/tink/
```

**Step 3: Commit**

```bash
git add deploy.sh
git commit -m "Add deploy script for quique.ca/tink"
```

---

## Task Dependency Summary

```
Phase 1 (Engine): Task 1 → 2 → 3 → 4 → 5 (sequential, each builds on prior)
Phase 2 (Visual): Task 6 → 7 → 8 → 9 → 10 (sequential)
Phase 3 (Codex):  Task 11 → 12 → 13 (sequential)
Phase 4 (Wander): Task 14 → 15 → 16 (sequential)
Phase 5 (Juice):  Task 17 → 18 (sequential, depends on Phase 2)
Phase 6 (Run):    Task 19 → 20 → 21 → 22 → 23 (sequential, depends on all prior)

Phase 1 must complete before Phase 2.
Phase 2 must complete before Phases 3-5.
Phases 3, 4, 5 can run in parallel after Phase 2.
Phase 6 depends on Phases 3 + 4.
```

## Key Design References (from .kg/)

| ID | Title | Relevance |
|----|-------|-----------|
| ADR-001 | Unification as only mechanic | Core engine — already implemented |
| ADR-002 | Tensions produce drama | Tension spectrum — already implemented |
| ADR-003 | Three-phase loop | Wander/Weave/Activate — Phase 4+6 |
| ADR-005 | Cascade mechanic | Phase 1, Task 4 |
| ADR-006 | Loom grows 3→19 | Phase 6, Task 19 |
| ADR-008 | HTML5 Canvas single-file | Phase 2 architecture |
| INSIGHT-008 | Specificity weighting | Phase 1, Task 1 |
| INSIGHT-017 | Escalating AV feedback | Phase 5 |
| INSIGHT-020 | Lever-pull silence | Phase 2, Task 8 |
| INSIGHT-021 | Every crossing readable | Phase 1, Task 2 |
| INSIGHT-025 | First discovery ceremony | Phase 3, Task 13 |
| p005 | cascade-chaining | Phase 1, Task 4 |
| p011 | codex-as-discovery-graph | Phase 3, Task 12 |
| p012 | two-stage-revelation | Phase 3+4 |
