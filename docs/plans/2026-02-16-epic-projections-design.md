# Epic Projections: Layered Narrative Through Constraint Unification

## Core Thesis

The player's weaving history is immutable data. An epic is a constraint (a schema) that evaluates against that data. A projection is a different schema applied to the same data. Because unification is idempotent and confluent, multiple epics and projections evaluate simultaneously without interference — the same input always produces the same output.

This means:
- Adding new epics never breaks existing ones
- The same weaving history can satisfy multiple epics to different degrees
- New projections can be applied retroactively to the entire history
- Partial matches are a natural property of constraint evaluation, not a special case

## Architecture

### The Data: Weaving History

Each run produces a sequence of **crossing results** — one per crossing resolved during activation, across all cycles:

```javascript
// A single crossing result (produced by loom.activate())
{
  cycle: 2,                           // which cycle of the run
  threadA: { name: "Ember", ... },    // first thread
  threadB: { name: "Glacier", ... },  // second thread
  stability: "tension",               // harmony | resonance | tension | paradox
  traits: { bright: true, cold: true, volatile: "conflicted" },
  archetype: { name: "Stormglass", tier: "uncommon" } | null,
  nearMisses: [...],
  cascadeApplied: [...],
  cascadeDepth: 0,                    // 0 = no cascade input, 1+ = received cascade
}
```

The complete weaving history for a run is `crossingResult[]` — an append-only log.

### The Schema: Epics

An epic is a sequence of **beats**, each defined as a constraint over crossing results:

```javascript
{
  name: "The Forge of Contradiction",
  tier: "mythic",
  beats: [
    {
      label: "The Spark",
      requires: { stability: "tension", traits: { volatile: true } },
      onMatch: "A spark of defiance ignites in the threads.",
      onPartial: "Something smolders, but won't catch.",
    },
    {
      label: "The Tempering",
      requires: { cascadeDepth: { min: 2 } },
      onMatch: "The contradiction tears through, reforging everything it touches.",
      onPartial: "The weave strains but holds.",
    },
    {
      label: "The Reforging",
      requires: { stability: "paradox", archetype: { exists: true } },
      onMatch: "From impossibility, form emerges.",
      onPartial: "The paradox collapses without finding shape.",
    },
  ],
  onComplete: "The forge remembers what contradiction built.",
  onPartial: "The forge cools — the work remains unfinished.",
}
```

**Beat matching rules:**
- A beat matches a crossing result if ALL of its `requires` constraints are satisfied
- Each beat matches AT MOST once (first matching crossing claims it)
- Beats must match IN ORDER (beat 2 can only match a crossing that comes after beat 1's match)
- A beat is "partially matched" if it matches some but not all constraints

**Epic evaluation:**
- `matched / total` beats = completion ratio
- 1.0 = complete, 0.5-0.99 = partial, 0.0 = silent
- Near-miss: highest-scoring incomplete epic with ratio >= 0.67

### The Lens: Projections

A projection is a **named interpretation schema** that transforms the raw weaving history before epic evaluation. The base projection is identity (no transformation).

```javascript
{
  name: "Heroic Journey",
  id: "heroic",
  description: "See your weaving as a hero's journey — call, trials, ordeal, return.",
  transform(history) {
    // Annotate each crossing with hero's journey stage based on position
    return history.map((cx, i, all) => ({
      ...cx,
      heroStage: i < all.length * 0.25 ? "call"
               : i < all.length * 0.5  ? "trials"
               : i < all.length * 0.75 ? "ordeal"
               : "return",
    }));
  },
  epics: [ /* epics that use heroStage in their beat requirements */ ],
}
```

Projections add **derived fields** to the crossing results. Epics within a projection can require those derived fields. The base crossing data is never modified — projections are pure functions.

**Built-in projections:**
1. **The Tapestry** (default, always active) — epics match on raw traits, stability, archetypes
2. **Heroic Journey** — adds `heroStage` field based on crossing position in run
3. **Tragedy** — adds `dramaticArc` field based on escalating/declining stability
4. **Reflection** — adds `symmetry` field detecting repeated trait patterns

**Unlocking projections:**
- The Tapestry: always available
- Heroic Journey: unlocked at 5 codex discoveries
- Tragedy: unlocked at 10 codex discoveries
- Reflection: unlocked at 15 codex discoveries
- Future projections: found at special shrines, or from completing specific epics

### End-of-Run Reveal

After the final cycle, evaluate all active epics and show:

1. **Completed epics** — full ceremony with name, tier, and completion text
2. **Partial epics** — progress bar, matched beats listed, partial text
3. **Near-miss epics** — "You almost wove..." with what was missing
4. **Hidden count** — "X more epics remained hidden in the tapestry"
5. **Projection teaser** — "A new way of seeing awaits..." (if close to unlocking one)

The reveal is the emotional payoff: the player realizes their weaving had meaning they didn't see.

## Integration with Existing Systems

- **Replaces Task 21 (resonance):** Epics ARE the resonance system — which epics are active/progressing shapes what the game "wants" from the player
- **Replaces Task 22 (win/loss):** Completing any epic is a win. The score is how many epics you completed + how close you got on partials
- **Task 23 (deploy):** Unchanged — deploy script still needed
- **Codex integration:** Completed epics are recorded in the codex alongside archetypes
- **Shrine integration:** Some shrines could reveal projection hints or epic existence

## Partial Match Semantics

**Major mismatch = branch the story:**
Beat requires `stability: "paradox"` but crossing produced `harmony`. The epic's `onPartial` text describes a fundamentally different narrative direction: "The hero found peace where crisis was expected."

**Minor mismatch = degrade gracefully:**
Beat requires `cascadeDepth: { min: 3 }` but crossing had `cascadeDepth: 2`. The epic partially advances: "The chain almost reached deep enough."

**The epic author controls this** by choosing what goes in `requires` vs what's optional.

## Why This Works

1. **Idempotent evaluation:** Same history → same epic results. No hidden state, no ordering dependency.
2. **Open-world assumption:** New epics/projections can be added without modifying existing ones.
3. **Combinatorial richness:** 12 epics × 4 projections × 4 stability levels × variable cascade depth × 22 archetypes = enormous narrative space from a small authored set.
4. **Natural partial matches:** A 3/4 beat match isn't a special case — it's what the data IS when evaluated against the constraint.
5. **Retroactive reinterpretation:** Unlocking a new projection re-evaluates the entire run history, revealing meaning that was always latent.
