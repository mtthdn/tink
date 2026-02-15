# Tink — A Tinker's Loom

**Date**: 2026-02-15
**Status**: Design approved, prototype in progress

## Identity

You are a tinker-weaver. You find threads in a shifting world — each thread is a fragment of *something*: a personality, a material, an event, a rule. You bring them back to your loom and connect them together. Where threads cross, something *happens* — not because you programmed it, but because the threads' natures demanded it. Then you watch your tapestry come alive.

## Core Mechanic: Trait Unification

Threads have **natures** — trait-structs like `{volatile: true, bright: true, liquid: false}`. When two threads are adjacent on the loom, their natures **unify** (merge). The unified result is matched against a hidden **archetype catalog** to determine what the crossing produces.

There are no crafting recipes. No synergy tables. Players learn *what traits do when combined*, not what specific pairs produce. This makes the possibility space genuinely combinatorial rather than enumerable. (See ADR-001.)

### The Tension Spectrum

Trait conflicts don't produce errors — they produce drama.

| Level | Condition | Effect |
|-------|-----------|--------|
| **Harmony** | All traits compatible | Stable, moderate output |
| **Resonance** | Traits amplify each other | Strong, self-reinforcing |
| **Tension** | Some traits conflict | Powerful but unstable, may break |
| **Paradox** | Deep contradiction | Wild, transformative, may cascade |

Players who want safety weave harmonious tapestries. Players who want power court tension. Players who want discovery chase paradox. (See ADR-002.)

## Three-Phase Loop

### 1. Wander (Explore)
- Procedural, shifting world with themed regions
- Find threads of varying rarity and nature
- Encounter clues about undiscovered archetypes
- Discover echoes of other players' tapestries

### 2. Weave (Build)
- Place threads on the loom (hex/grid board)
- Drag connections between adjacent threads
- Preview: see unified traits on hover, but NOT the archetype outcome
- Spatial arrangement matters: one thread can participate in multiple crossings

### 3. Activate (Watch)
- Pull the lever — the loom comes alive
- Energy flows through threads, crossings resolve in sequence
- Each crossing produces an outcome: creatures, events, resources, rule-changes
- Cascading effects: one crossing's output can modify downstream crossings
- The output feeds back: new threads, world changes, new regions

## Fun Pillars

| Pillar | Mechanism |
|--------|-----------|
| **Discovery/surprise** | Hidden archetype system. You don't know what crossings produce until activation. "What happens if...?" is the core question. |
| **Mastery/optimization** | Learn trait interaction patterns. Build deliberate compositions. Transition from happy accidents to intentional design. |
| **Expression/creativity** | No optimal build. Every loom is unique. Your tapestry is your playthrough identity. |
| **Tension/stakes** | Tension crossings are powerful but fragile. Paradox can cascade. The lever-pull is a commitment. |

## Key References

- **Luck Be a Landlord**: Cascade watching (add symbol → spin → chain reaction → scream)
- **Blue Prince**: Discovery of hidden connections (open door → impossible room → revelation)
- **Balatro**: Build a scoring engine, watch it multiply (Joker composition → exponential chain)
- **Cultist Simulator**: Unknown combination graph IS the content to discover
- **Opus Magnum**: Build a machine, watch it run (purest graph-as-gameplay)

## Mythological Grounding

The loom metaphor taps cross-cultural archetypes:
- **Norse Norns**: Web of Wyrd — fate as graph, threads as lives, crossings as destiny
- **Greek Moirai**: Threads woven together — individual destiny inseparable from network
- **Navajo Spider Woman**: Weaving IS world-building, loom maps cosmos
- **Athena**: Weaving = wisdom = strategy — connecting threads IS strategic thinking
- **Anansi**: Web as both trap and connection — dual nature of networks

## Technical Approach

- **Runtime**: JavaScript/TypeScript — trait merging is simple object operations
- **CUE**: Schema validation and data modeling only (thread nature schemas, archetype definitions)
- **Visualization**: D3.js / existing VizData infrastructure for loom rendering
- **Export**: JSON-LD for interop with quicue.ca ecosystem
- **Knowledge graph**: `.kg/` directory with quicue-kg patterns (18 entries and growing)

## Anti-Goals

- NOT a spreadsheet optimizer — feel over calculation
- NOT an explicit graph visualizer — the graph is felt, not shown (see ADR-004)
- NOT a recipe-completion puzzle — combinatorial discovery, not lookup
- NOT mechanically novel for its own sake — must be FUN first (see INSIGHT-005, REJ-003)

## What's Next

1. Prototype: JS unification engine + hex loom + CLI demo (in progress)
2. Playtest the core loop with 5-7 threads on a small loom
3. Design the archetype catalog (15-20 initial archetypes)
4. Build the Activate phase visualization
5. Add the Wander phase (procedural exploration)
6. Iterate on feel: juice, sound, visual feedback
