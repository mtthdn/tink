# Epic Projections Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a layered narrative system where hidden epics evaluate against the player's weaving history via constraint matching, with projections as unlockable interpretation lenses.

**Architecture:** Epics are declarative beat sequences with constraint-based requirements. Evaluation is a pure function over the weaving history (idempotent). Projections add derived fields to crossing results. End-of-run reveal shows completed/partial/hidden epics.

**Tech Stack:** Vanilla JS, same game.html single-file approach. No build step.

---

### Task A: Epic evaluation engine + weaving history

Build the core evaluation system as testable pure functions.

**Files:**
- Modify: `prototype/epics.js` (create)
- Modify: `prototype/test.js` (add epic tests)
- Modify: `game.html` (inline + wire)

**Step 1: Create `prototype/epics.js` with the data model**

```javascript
// 12 epics across the default Tapestry projection
const EPICS = [
  {
    name: "The Forge of Contradiction",
    tier: "mythic",
    projection: "tapestry",
    beats: [
      {
        label: "The Spark",
        requires: { stability: "tension", traits: { volatile: true } },
        onMatch: "A spark of defiance ignites in the threads.",
        onPartial: "Something smolders, but won't catch.",
      },
      {
        label: "The Tempering",
        requires: { cascadeDepth: 2 },
        onMatch: "The contradiction tears through, reforging everything it touches.",
        onPartial: "The weave strains but holds.",
      },
      {
        label: "The Reforging",
        requires: { stability: "paradox", hasArchetype: true },
        onMatch: "From impossibility, form emerges.",
        onPartial: "The paradox collapses without finding shape.",
      },
    ],
    onComplete: "The forge remembers what contradiction built.",
    onPartial: "The forge cools — the work remains unfinished.",
  },
  // ... 11 more epics from the brainstorming table
];

// Pure function: does a single crossing result satisfy a beat's requirements?
function beatMatches(beat, crossing) {
  const req = beat.requires;
  if (req.stability && crossing.stability !== req.stability) return false;
  if (req.traits) {
    for (const [k, v] of Object.entries(req.traits)) {
      if (crossing.traits[k] !== v) return false;
    }
  }
  if (req.hasArchetype && !crossing.archetype) return false;
  if (req.archetypeTier) {
    if (!crossing.archetype || crossing.archetype.tier !== req.archetypeTier) return false;
  }
  if (req.cascadeDepth && (crossing.cascadeDepth || 0) < req.cascadeDepth) return false;
  if (req.hasNearMiss && (!crossing.nearMisses || crossing.nearMisses.length === 0)) return false;
  if (req.minConflicts) {
    const conflicts = Object.values(crossing.traits).filter(v => v === "conflicted").length;
    if (conflicts < req.minConflicts) return false;
  }
  return true;
}

// Pure function: how many partial constraint matches does a beat have?
function beatPartialScore(beat, crossing) {
  const req = beat.requires;
  let total = 0, matched = 0;
  if (req.stability) { total++; if (crossing.stability === req.stability) matched++; }
  if (req.traits) {
    for (const [k, v] of Object.entries(req.traits)) {
      total++;
      if (crossing.traits[k] === v) matched++;
    }
  }
  if (req.hasArchetype) { total++; if (crossing.archetype) matched++; }
  if (req.archetypeTier) { total++; if (crossing.archetype?.tier === req.archetypeTier) matched++; }
  if (req.cascadeDepth) { total++; if ((crossing.cascadeDepth || 0) >= req.cascadeDepth) matched++; }
  return total === 0 ? 1 : matched / total;
}

// Pure function: evaluate an epic against a weaving history
function evaluateEpic(epic, history) {
  const matched = [];
  let historyIdx = 0;

  for (const beat of epic.beats) {
    let found = false;
    for (let i = historyIdx; i < history.length; i++) {
      if (beatMatches(beat, history[i])) {
        matched.push({ beat, crossing: history[i], index: i });
        historyIdx = i + 1;
        found = true;
        break;
      }
    }
    if (!found) {
      // Find best partial match for this beat in remaining history
      let bestPartial = 0;
      for (let i = historyIdx; i < history.length; i++) {
        bestPartial = Math.max(bestPartial, beatPartialScore(beat, history[i]));
      }
      matched.push({ beat, crossing: null, partial: bestPartial });
    }
  }

  const completedBeats = matched.filter(m => m.crossing !== null).length;
  const ratio = completedBeats / epic.beats.length;

  return {
    epic,
    matched,
    completedBeats,
    totalBeats: epic.beats.length,
    ratio,
    complete: ratio === 1,
    nearMiss: ratio >= 0.67 && ratio < 1,
  };
}

// Pure function: evaluate all epics against a weaving history
function evaluateAllEpics(epics, history) {
  return epics
    .map(e => evaluateEpic(e, history))
    .sort((a, b) => b.ratio - a.ratio);
}
```

**Step 2: Add weaving history tracking to game.html**

In `runActivationAnimation()`, after each crossing resolves, push a crossing result to `runState.weavingHistory`:

```javascript
runState.weavingHistory.push({
  cycle: runState.cycle,
  threadA: cx.threadA,
  threadB: cx.threadB,
  stability: cx.stability,
  traits: cx.unified,
  archetype: cx.archetype.match ? { name: cx.archetype.match.name, tier: cx.archetype.match.tier } : null,
  nearMisses: cx.archetype.nearMisses || [],
  cascadeApplied: cx.cascadeApplied || [],
  cascadeDepth: (cx.cascadeApplied || []).length,
});
```

Add `weavingHistory: []` to `runState` and reset it in `startRun()`.

**Step 3: Write tests**

Add to `prototype/test.js`:
- `beatMatches` with exact match, partial match, no match
- `evaluateEpic` with full history, partial history, empty history
- `evaluateAllEpics` returns sorted by ratio
- Idempotency: same input produces same output on repeated evaluation

**Step 4: Commit**

```bash
git add prototype/epics.js prototype/test.js game.html
git commit -m "Add epic evaluation engine with weaving history tracking"
```

---

### Task B: Author 12 epics + 4 projections + axis alignment

Write the full epic content, projection transforms, mood declarations, and axis alignment scoring.

**Files:**
- Modify: `prototype/epics.js` (add all epics, projections, alignment scoring)
- Modify: `prototype/test.js` (add projection + alignment tests)
- Modify: `game.html` (inline updated epics.js)

**Step 1: Author 12 epics across 3 projections, each beat with optional mood**

Each beat gets an optional `mood` object: `{ tone, hue, intensity }`. The mood declares what the crossing SHOULD feel like. The stability-to-tone mapping is: harmony="warm", resonance="crystalline", tension="dissonant", paradox="dark".

Tapestry (default, 6 epics):
1. The Forge of Contradiction (mythic) — tension → cascade → paradox+archetype
2. The Quiet Descent (rare) — 2× harmony → ancient trait → paradox
3. Combustion Engine (uncommon) — volatile in 2+ crossings → cascade chain → "Engine" archetype
4. Roots and Canopy (rare) — organic+ancient → cascade spreads organic → 3+ unique archetypes
5. Storm and Stillness (mythic) — harmony+paradox same activation → opposing traits → dual archetype
6. The Weaver's Doubt (uncommon) — 2+ no-match crossings → near-miss 75%+ → finally match mythic+

Heroic Journey (3 epics, requires heroStage field):
7. The Reluctant Hero (uncommon) — call=harmony → trials=tension → ordeal=paradox
8. The Mirror's Edge (rare) — trials=resonance with same traits as call → return=different archetype than ordeal
9. The Cartographer's Lie (mythic) — all 4 stages produce archetypes, none from the same tier

Tragedy (3 epics, requires dramaticArc field):
10. Paradox Garden (uncommon) — rising action has 2+ paradoxes → climax produces no archetype
11. The Severed Chord (rare) — 3× resonance → no paradox entire run → final=harmony
12. Inheritance (mythic) — same archetype produced in 2+ different cycles

**Step 2: Implement 4 projection transforms with palettes**

```javascript
const STABILITY_TONE = { harmony: "warm", resonance: "crystalline", tension: "dissonant", paradox: "dark" };
const STABILITY_HUE = { harmony: "#44aa88", resonance: "#4488ff", tension: "#ff6600", paradox: "#aa00ff" };

const PROJECTIONS = [
  {
    name: "The Tapestry",
    id: "tapestry",
    description: "The weave as it is — threads, crossings, and what emerges.",
    unlocked: true,
    unlocksAt: 0,
    palette: { baseHue: "#888888", defaultIntensity: 0.5 },
    transform: (history) => history,
  },
  {
    name: "Heroic Journey",
    id: "heroic",
    description: "See your weaving as a hero's journey.",
    unlocked: false,
    unlocksAt: 5,
    palette: { baseHue: "#cc8800", defaultIntensity: 0.6 },
    transform: (history) => history.map((cx, i, all) => ({
      ...cx,
      heroStage: i < all.length * 0.25 ? "call"
               : i < all.length * 0.5  ? "trials"
               : i < all.length * 0.75 ? "ordeal"
               : "return",
    })),
  },
  {
    name: "Tragedy",
    id: "tragedy",
    description: "The arc bends toward sorrow — or transcendence.",
    unlocked: false,
    unlocksAt: 10,
    palette: { baseHue: "#660033", defaultIntensity: 0.4 },
    transform: (history) => {
      const severityMap = { harmony: 0, resonance: 1, tension: 2, paradox: 3 };
      let peak = 0;
      return history.map((cx, i) => {
        const sev = severityMap[cx.stability] || 0;
        if (sev >= peak) { peak = sev; return { ...cx, dramaticArc: "rising" }; }
        return { ...cx, dramaticArc: i > history.length * 0.7 ? "denouement" : "falling" };
      });
    },
  },
  {
    name: "Reflection",
    id: "reflection",
    description: "Patterns repeat. The loom remembers.",
    unlocked: false,
    unlocksAt: 15,
    palette: { baseHue: "#336699", defaultIntensity: 0.5 },
    transform: (history) => {
      const seen = {};
      return history.map(cx => {
        const key = Object.keys(cx.traits).sort().join(",");
        const count = (seen[key] || 0) + 1;
        seen[key] = count;
        return { ...cx, symmetry: count > 1 ? "echo" : "first", echoCount: count };
      });
    },
  },
];
```

**Step 3: Add axis alignment scoring**

```javascript
// Pure function: how many sensory axes align for a matched beat?
function scoreAxisAlignment(beat, crossing) {
  if (!beat.mood) return { aligned: 0, total: 0, ratio: 0, golden: false };
  const mood = beat.mood;
  let total = 0, aligned = 0;

  if (mood.tone) {
    total++;
    if (STABILITY_TONE[crossing.stability] === mood.tone) aligned++;
  }
  if (mood.hue) {
    total++;
    if (STABILITY_HUE[crossing.stability] === mood.hue) aligned++;
  }
  if (mood.intensity !== undefined) {
    total++;
    // Map stability to natural intensity: harmony=0.2, resonance=0.4, tension=0.6, paradox=0.9
    const natIntensity = { harmony: 0.2, resonance: 0.4, tension: 0.6, paradox: 0.9 };
    if (Math.abs((natIntensity[crossing.stability] || 0.5) - mood.intensity) < 0.25) aligned++;
  }

  const ratio = total === 0 ? 0 : aligned / total;
  return { aligned, total, ratio, golden: ratio > 0.8 };
}

// Enhanced evaluateRun with alignment tracking
function evaluateRun(history, projections, allEpics) {
  const results = [];
  let goldenMoments = 0;
  for (const proj of projections) {
    if (!proj.unlocked) continue;
    const transformed = proj.transform(history);
    const projEpics = allEpics.filter(e => e.projection === proj.id);
    const evaluated = evaluateAllEpics(projEpics, transformed);
    for (const r of evaluated) {
      const alignments = r.matched
        .filter(m => m.crossing)
        .map(m => scoreAxisAlignment(m.beat, m.crossing));
      const goldenCount = alignments.filter(a => a.golden).length;
      goldenMoments += goldenCount;
      results.push({ ...r, projection: proj, alignments, goldenCount });
    }
  }
  return { results: results.sort((a, b) => b.ratio - a.ratio), goldenMoments };
}
```

**Step 4: Add tests for projections, full epic set, and alignment scoring**

- Projection transforms add correct derived fields
- Each epic matches against crafted history sequences
- scoreAxisAlignment returns correct aligned/total/ratio/golden
- evaluateRun aggregates goldenMoments correctly

**Step 5: Commit**

```bash
git add prototype/epics.js prototype/test.js game.html
git commit -m "Author 12 epics across 4 projections with axis alignment scoring"
```

---

### Task C: End-of-run epic reveal UI

Show the epic evaluation results and axis alignment at the end of a run.

**Files:**
- Modify: `game.html`

**Step 1: Create epic reveal overlay**

After the final cycle's results, show a full-screen reveal sequence:

1. **"The tapestry speaks..."** — brief pause with ambient glow
2. **Golden moments count** — "The threads aligned X times" (if goldenMoments > 0)
3. **Completed epics** — one by one, name + tier + completion text, with ceremony (similar to archetype discovery). Golden beats get a shimmer indicator.
4. **Partial epics** — progress bars showing X/Y beats matched, partial text
5. **Hidden count** — "X more epics remained hidden in the tapestry"
6. **Projection teaser** — if player is close to unlocking a new projection, hint at it
7. **"New Run" button**

**Step 2: CSS for epic reveal**

- `.epic-reveal-overlay` — full-screen dark overlay
- `.epic-reveal-entry` — card for each epic result
- `.epic-progress-bar` — progress indicator for partial epics
- `.epic-tier-badge` — colored by epic tier
- `.golden-indicator` — shimmer for aligned beats
- Tier colors match archetype tier colors

**Step 3: Wire into game loop**

In `endRun()`:
1. Compute `evaluateRun(runState.weavingHistory, PROJECTIONS, EPICS)`
2. Update projection unlock state based on codex discoveries
3. Show epic reveal overlay with golden moment count
4. Record completed epics in codex (new section: `codexData.epics`)

**Step 4: Commit**

```bash
git add game.html
git commit -m "Add end-of-run epic reveal with axis alignment scoring"
```

---

### Task D: Mid-run epic ambiance + golden path moments + projection unlocks

Add multi-sensory ambient signals during gameplay that respond to epic progress and axis alignment.

**Files:**
- Modify: `game.html`

**Step 1: After each activation, evaluate active epics and detect alignment**

After each activation animation completes, run `evaluateRun` on the history so far. For any epic with a beat that just matched:
- Brief ambient text flash: the beat's `onMatch` text, styled in the epic's tier color, fading in/out over 1.5s
- If the beat has a mood, apply a brief color wash (beat.mood.hue) to the canvas, fading over 1s
- This is subtle — not a ceremony, just atmosphere

For near-misses (beat almost matched):
- Even subtler: the beat's `onPartial` text in dimmed color, 0.5s

**Step 2: Golden path moments**

When `scoreAxisAlignment` returns `golden: true` for a just-matched beat:
- First golden moment in run: subtle canvas shimmer + brief whisper "the threads align"
- Second: canvas border glow (1px gold outline, 2s fade), tonal accent via GameAudio
- Third+: escalating emphasis — brighter glow, longer duration, harmonic chord
- Track golden moments in `runState.goldenMoments` counter

**Step 3: Projection unlock ceremony**

When the player's codex discoveries cross a projection unlock threshold (5, 10, 15):
- Show a brief overlay: "A new way of seeing awakens..."
- Projection name + description fade in, tinted with projection's palette.baseHue
- All existing history is re-evaluated through the new projection
- Any retroactively matched epic beats get a quick "the tapestry shifts..." message

**Step 4: Codex integration**

Add an "Epics" tab to the codex panel:
- Completed epics: name, tier, completion text, which projection
- Partial epics from last run: progress bar, matched beats
- Golden beats marked with shimmer icon
- Locked projections: "??? — Discover X more archetypes"

**Step 5: Commit**

```bash
git add game.html
git commit -m "Add mid-run golden path moments and projection unlock ceremony"
```

---

## Task Dependency

```
Task A (engine) → Task B (content) → Task C (reveal UI) → Task D (ambiance)
```

All sequential. Task A is the foundation, Task B populates it, Task C shows results, Task D adds polish.
