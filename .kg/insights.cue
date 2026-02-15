// Discoveries from research and brainstorming
package kg

import "quicue.ca/kg/core@v0"

i001: core.#Insight & {
	id:         "INSIGHT-001"
	statement:  "The most compelling graph games hide their graph — synergies are felt, not shown"
	evidence: [
		"Slay the Spire never shows a synergy diagram; synergies emerge from card interactions",
		"Cultist Simulator's entire content is an unknown combination graph to discover",
		"Blue Prince hides room connections behind doors — discovery IS the game",
		"Path of Exile shows the graph explicitly and attracts a narrower systems-thinking audience",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink should show the loom (spatial graph) but hide the archetype system (outcome graph). Discovery of what crossings produce is the primary content."
	action_items: [
		"Design archetype discovery as progressive revelation",
		"Build a codex/journal system for recording discoveries",
		"Add Wander-phase clues that hint at undiscovered archetypes",
	]
}

i002: core.#Insight & {
	id:         "INSIGHT-002"
	statement:  "The 'build a machine then watch it run' pattern is the most satisfying graph-game loop"
	evidence: [
		"Factorio (build factory → watch production), Opus Magnum (build machine → watch transform)",
		"Autobattlers (build team → watch fight), Balatro (build Joker engine → watch score multiply)",
		"Noita (build wand → watch spell chain), Incredible Machine (build contraption → watch it go)",
		"Dormans' Machinations framework: emergence requires feedback loops in mechanic graphs",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink's Activate phase must be a spectacular 'watch it run' moment. The lever-pull should feel like Luck Be a Landlord's slot spin — you built the machine, now watch it cascade."
	action_items: [
		"Design activation sequence with visible energy flow through the loom",
		"Each crossing resolves visibly in sequence — camera follows the pulse",
		"Chain reactions must be legible: player can trace cause → effect",
	]
}

i003: core.#Insight & {
	id:         "INSIGHT-003"
	statement:  "Threshold nonlinearity makes graph composition addictive — phase transitions create dopamine"
	evidence: [
		"TFT: hitting 4/6 trait threshold dramatically changes team power",
		"Balatro: multiplicative Joker chains create exponential score growth",
		"Slay the Spire: 'the deck clicks' moment when synergies compound",
		"Daniel Cook's skill atom model: feedback loops create the 'one more turn' effect",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The archetype matching should have thresholds: a basic crossing produces a minor effect, but a crossing that matches ALL traits of a rare archetype produces a dramatically amplified result. The 'galaxy brain' moment when a thread bridges two sub-patterns."
	action_items: [
		"Design archetype tiers: partial match (common), full match (rare), multi-crossing chain match (legendary)",
		"The jump from partial to full match should feel like a power spike",
	]
}

i004: core.#Insight & {
	id:         "INSIGHT-004"
	statement:  "Weaving mythology provides a deep thematic resonance for graph-as-gameplay"
	evidence: [
		"Norse Norns weave Web of Wyrd at Yggdrasil's root — fate as graph",
		"Greek Moirai weave threads together — individual destiny inseparable from the network",
		"Navajo Spider Woman: weaving IS world-building, loom maps the cosmos",
		"Athena: goddess of weaving AND wisdom AND strategy — connecting threads IS strategic thinking",
		"Anansi: web is both trap and connection — dual nature of networks",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The loom metaphor is not just aesthetic — it taps into cross-cultural archetypes about creation, fate, and the interconnectedness of things. The tinker-weaver identity resonates because humans have always understood that connecting things IS making things."
	action_items: [
		"Draw visual identity from textile/weaving imagery — threads, crossings, patterns in fabric",
		"Consider mythological thread archetypes: Thread of Fate, Spider's Silk, Lightning Weft",
		"The loom itself could have personality — it hums, breathes, responds to what you weave",
	]
}

i005: core.#Insight & {
	id:         "INSIGHT-005"
	statement:  "Existing game prototypes (Chimera Clash, Fusion Hand, Ouroboros Factory) are mechanically connected but not fun"
	evidence: [
		"User feedback: 'none of those games are fun. they're mechanically connected but not pleasant'",
		"All three prototypes in novel-games/docs/2026-02-03-novel-combo-specs.md",
		"Chimera Clash: autobattler+crafting; Fusion Hand: merging+deckbuilder; Ouroboros Factory: factory+RPS",
	]
	method:     "observation"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Mechanical novelty alone does not produce fun. The gap is juice, surprise, and emotional resonance. Tink must prioritize the FEELING of building and watching over the mechanical correctness of the system."
	action_items: [
		"Every design decision must pass the 'is this fun or just clever?' test",
		"Invest heavily in visual feedback (juice) during Activate phase",
		"Prototype the feel before the depth — a loom with 5 threads that feels amazing beats 50 threads that feel clinical",
	]
}

i006: core.#Insight & {
	id:         "INSIGHT-006"
	statement:  "9 playable HTML games already exist in fing-mod/web-games with proven game loop patterns"
	evidence: [
		"fing-mod/web-games/OVERNIGHT_LOG.md documents all 9 games",
		"Auto Battler (58KB): 120 chars, 3 shop tiers, endless mode — proven autobattler loop",
		"Loop Hero (991KB): 56 episodes, 13 buildings, combos, save/load — proven build loop",
		"Prestige Tree (52KB): 4 eras, 3 challenges, transcendence — proven progression system",
	]
	method:     "observation"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "We have battle-tested HTML game scaffolding. The auto-battler and loop-hero implementations contain reusable patterns for shop/draft mechanics, build-then-watch loops, and progression systems. Tink can build on these rather than starting from zero."
	action_items: [
		"Extract reusable game loop patterns from fing-mod/web-games",
		"The auto-battler's shop-and-fight loop maps directly to Wander-and-Activate",
		"Loop Hero's building placement maps to loom thread placement",
	]
}

i007: core.#Insight & {
	id:         "INSIGHT-007"
	statement:  "CUE unification has a practical ceiling of ~17 nodes for transitive closure"
	evidence: [
		"quicue.ca patterns: #InfraGraph transitive closure times out beyond 17 nodes",
		"CJLQ nhcf: 18 nodes, 27 edges validates in <4s — near the limit",
		"Wide fan-in is worse than deep chains for CUE evaluation",
	]
	method:     "experiment"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "If we model the loom in CUE for validation/export, keep loom sizes under ~15-20 threads. For runtime game logic, the unification mechanic should be implemented in JavaScript/TypeScript directly — CUE is for schema validation and data modeling, not real-time game state."
	action_items: [
		"Runtime unification: implement trait-struct merge in JS (simple object spread + conflict detection)",
		"CUE models: thread nature schemas, archetype definitions, loom constraints — static validation only",
		"Export loom state as JSON-LD for visualization with existing D3.js infrastructure",
	]
}

i008: core.#Insight & {
	id:         "INSIGHT-008"
	statement:  "Archetype matching needs specificity weighting — generalist archetypes dominate when threads share traits"
	evidence: [
		"Prototype demo: cold/emotional-heavy draw produced Bifrost Shard on 3 of 6 crossings",
		"Bifrost Shard requires {bright, vast, cold} — common traits that appear on many threads",
		"Vendetta Engine requires {emotional, mechanical, persistent} — more specific, matched less often",
		"With flat scoring, a 2-trait archetype with 100% match outranks a 4-trait archetype with 75% match",
	]
	method:     "experiment"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Archetypes requiring more traits should score higher per-match to reward complex compositions. A 3/3 match on a rare archetype should outrank a 2/2 match on a common one. This is the 'specificity' principle from CSS — more specific selectors win."
	action_items: [
		"Add specificity bonus: score = (matched/total) * (1 + 0.1 * total) or similar",
		"Alternatively: archetype tier acts as tiebreaker (mythic > rare > uncommon > common)",
		"Test with varied thread draws to confirm diverse archetype production",
	]
}

i009: core.#Insight & {
	id:         "INSIGHT-009"
	statement:  "Single-trait conflicts should be tension, not paradox — paradox requires multiple contradictions"
	evidence: [
		"Prototype: {element: 'fire'} & {element: 'water'} was 1/1 = 100% conflict → classified as paradox",
		"A single disagreement feels like 'tension' not 'reality breaking'",
		"Fixed by requiring conflicts.length >= 2 for paradox classification",
		"This makes paradox genuinely rare and dramatic — you need to deliberately stack contradictions",
	]
	method:     "experiment"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The paradox threshold (>50% AND >=2 conflicts) is a critical balance lever. It ensures paradox is earned through deliberate risk-taking, not triggered by trivial single-key overlaps. The rarity of paradox makes paradox-dependent archetypes (Paradox Bloom, Schrodinger's Thread) genuinely exciting to achieve."
	action_items: [
		"Monitor paradox frequency across varied draws — should be rare (1 in 5-10 activations)",
		"Consider making paradox threshold configurable as a difficulty knob",
	]
}

i010: core.#Insight & {
	id:         "INSIGHT-010"
	statement:  "The trait vocabulary needs orthogonal dimensions — too much overlap produces boring uniformity"
	evidence: [
		"Current traits: hot/cold/bright/volatile/persistent/ephemeral/calm/vast/sharp/liquid/organic/mechanical/emotional",
		"Several threads share 3+ traits, producing similar unified results",
		"Emotional threads all share 'emotional: true' making them semi-interchangeable",
		"Physical traits (hot/cold/bright) appear across many threads",
	]
	method:     "experiment"
	confidence: "medium"
	discovered: "2026-02-15"
	implication: "Traits should be organized into orthogonal dimensions so different thread categories contribute different axes. Consider: physical (hot/cold/liquid/solid), temporal (persistent/ephemeral/cyclical), agency (calm/volatile/driven), scale (vast/intimate/focused), domain (organic/mechanical/elemental/emotional). Each thread draws from 2-3 dimensions, ensuring diverse crossings."
	action_items: [
		"Map current trait vocabulary onto orthogonal dimensions",
		"Ensure each archetype requires traits from at least 2 different dimensions",
		"Consider adding dimensional traits: cyclical, intimate, focused, driven, elemental",
		"Research: how does Pokemon's 18-type system maintain diversity? (partial answer: dual-typing)",
	]
}

i011: core.#Insight & {
	id:         "INSIGHT-011"
	statement:  "Cascading crossings (where output of one crossing affects inputs of the next) are the path to the scream moment"
	evidence: [
		"Current prototype resolves crossings independently — no chaining",
		"Luck Be a Landlord: symbol A triggers symbol B which triggers symbol C = cascade",
		"Balatro: Joker multiplies chip count which feeds into next Joker = exponential chain",
		"Noita: spell modifier affects spell which triggers next spell = program execution",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The Activate phase needs crossing-to-crossing cascading. When a crossing produces an archetype, it should emit traits or effects that modify adjacent crossings before they resolve. This creates the exponential chain feeling. Design question: does a crossing add traits to neighboring threads, or does it spawn a new temporary 'phantom thread' at its position?"
	action_items: [
		"Design cascade mechanic: archetype outputs modify downstream crossings",
		"Prototype: crossing produces temporary trait injection into adjacent unresolved crossings",
		"The cascade order (center→outward) becomes critically important for chain design",
		"Balance: cascades should be possible but not automatic — require deliberate thread placement",
	]
}

i012: core.#Insight & {
	id:         "INSIGHT-012"
	statement:  "The loom should grow over a run — start small (3 cells), expand as you progress"
	evidence: [
		"Slay the Spire: deck starts small (10 cards) and grows, creating escalating complexity",
		"TFT: team size expands with level (1→9 slots), gating composition complexity",
		"Balatro: Joker slots start at 5, can be expanded with vouchers",
		"Current prototype uses fixed 7-cell hex — no progression in board size",
	]
	method:     "cross_reference"
	confidence: "medium"
	discovered: "2026-02-15"
	implication: "Early game: 3-cell loom (center + 2 slots). Only 1-2 crossings possible. Teaches the mechanic gently. Mid game: expand to 7 cells (full hex). Complex crossings, chain reactions possible. Late game: 19-cell hex (2 rings) or custom loom shapes. Loom expansion is itself a reward and a progression milestone."
	action_items: [
		"Design loom sizes: 3 → 7 → 12 → 19 cells as progression tiers",
		"Loom expansion could be an archetype reward ('this crossing builds a new cell')",
		"Custom loom shapes as late-game expression (player chooses where to add cells)",
	]
}

i013: core.#Insight & {
	id:         "INSIGHT-013"
	statement:  "Sequential visible resolution with running accumulation is the key to making engines feel watchable"
	evidence: [
		"Balatro: each card steps forward, chips/mult counters update in real-time, mult counter catches fire at high values",
		"LBaL: symbols highlight as they process, coin counter ticks up, spatial resolution order (top→bottom, left→right) gives a readable flow",
		"Noita: wand execution resolves left-to-right, each spell visibly fires before the next",
		"All three games: the player can trace cause→effect at each step of the cascade",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink's Activate phase must resolve crossings sequentially with visible accumulation. Energy flows from center outward, each crossing lights up, unified traits flash, archetype match appears, cascade traits emit visibly along connection lines to adjacent unresolved crossings. The player should be able to pause mentally at any step and trace the causal chain."
	action_items: [
		"Design activation animation: energy pulse travels along thread connections",
		"Each crossing shows: trait merge → archetype match → cascade emission as distinct visual beats",
		"Running state display: show which archetypes have been produced so far during activation",
	]
}

i014: core.#Insight & {
	id:         "INSIGHT-014"
	statement:  "Multiplicative compounding creates the scream moment — additive effects alone produce flat emotional curves"
	evidence: [
		"Balatro: xMult Jokers compound (x2 then x3 = x6), Blueprint copies xMult Joker creating x16 from x4",
		"LBaL: Bee gives 2x to adjacent Flower, three Bees = 8x, compounds across multiple Flowers",
		"Both games: the scream moment is when multiplicative effects exceed linear mental arithmetic by an order of magnitude",
		"Noita: wrapping + Chainsaw zero-delay creates infinite spell engines — multiplicative in time dimension",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink's cascade traits should be multiplicative: an archetype's cascade output should amplify downstream crossings, not just add to them. Resonance crossings that amplify shared traits should compound — two resonance crossings in a chain should produce dramatically more than the sum of their parts."
	action_items: [
		"Design cascade trait injection as amplification (boost matching traits) not just addition",
		"Test: can two resonance crossings in sequence produce exponential-feeling results?",
		"Balance: multiplicative compounding must be gated by spatial planning difficulty",
	]
}

i015: core.#Insight & {
	id:         "INSIGHT-015"
	statement:  "Component ordering in a pipeline creates the deepest strategic layer — position IS the strategy"
	evidence: [
		"Balatro: Joker position matters enormously — +Mult before xMult is strictly better than the reverse",
		"LBaL: symbol adjacency determines which interactions fire — moving one symbol changes everything",
		"Noita: spell order on wand determines execution — modifiers before multicasts apply to all projectiles",
		"All three: the player physically arranges components in space, and arrangement determines outcome",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink's center-outward resolution order means center placement IS the most important strategic decision. Threads at center resolve first and their cascade output shapes the ring. The loom-as-program pattern (p007) is validated: spatial arrangement is literally instruction order. This should be made explicit in the UI — show resolution order numbers on cells."
	action_items: [
		"Show activation order numbers on loom cells during Weave phase",
		"Design 'order preview' showing which crossings resolve when",
		"Consider allowing the player to choose resolution direction (not just center-outward)",
	]
}

i016: core.#Insight & {
	id:         "INSIGHT-016"
	statement:  "The engine can backfire — risk of self-destruction makes building thrilling rather than merely optimizable"
	evidence: [
		"Noita: wands can kill the player — explosions damage you, fire spreads to your position",
		"LBaL: Void symbol self-destructs paying 8 coins if no adjacent empties; over-optimizing board removes escape valves",
		"Balatro: Glass Cards have a 1 in 4 chance of breaking after scoring — xMult power at risk of permanent loss",
		"Vampire Survivors: Death at minute 30 forces run end regardless of power — the clock IS the backfire",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Paradox cascades should be able to destroy threads, change thread natures unpredictably, or produce negative archetypes. The player who courts paradox gains the most powerful outcomes but risks loom destruction. The visual should be dramatic: threads burning, archetypes destabilizing, then sometimes what emerges from chaos is more powerful than what was built deliberately."
	action_items: [
		"Implement paradox cascade destruction: chance to destroy adjacent threads based on paradox depth",
		"Design 'phoenix' mechanic: destroyed threads can leave residual traits that modify replacement threads",
		"Balance: paradox destruction should be possible but not automatic — give the player agency in risk management",
	]
}

i017: core.#Insight & {
	id:         "INSIGHT-017"
	statement:  "Escalating audiovisual feedback proportional to cascade depth is non-negotiable for the scream moment"
	evidence: [
		"Balatro: mult counter catches fire, screen shake intensifies, sound effects escalate with each contribution",
		"Vampire Survivors: screen density IS the power meter — late game is 90% your projectiles, 10% enemies",
		"LBaL: coin counter physically scrolls upward, large payouts produce proportionally larger numbers",
		"Noita: particle density + sound layering = wand complexity readout",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink's activation visuals must escalate with cascade depth and tension level. Harmony = gentle glow + soft chime. Resonance = bright pulse + harmonic chord. Tension = crackling + dissonant tone + visible instability. Paradox = screen-wide effects + intense audio. Screen shake and color saturation as power indicators. A paradox-laden tapestry should feel almost uncomfortable to watch."
	action_items: [
		"Define 4-tier visual/audio escalation matching the tension spectrum",
		"Screen shake intensity proportional to cascade chain length",
		"Color saturation increases with tension level — paradox should push colors toward oversaturation",
	]
}

i018: core.#Insight & {
	id:         "INSIGHT-018"
	statement:  "Thread drafting with a satchel limit turns collection into strategy — the constraint IS the decision"
	evidence: [
		"Slay the Spire: draft 1 of 3 cards after combat; skip option makes experienced players curate precisely",
		"Binding of Isaac: item pool depletion prevents repetition; seeing an item removes it from the run pool",
		"Cogmind: item orthogonality — good items have potential disadvantages, weak items have niche uses",
		"FTL: limited cargo means choosing between fuel, missiles, and drone parts is the strategy layer",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Wander should offer 2-3 threads per node, player picks 1-2. Satchel limit of 5-7 threads per excursion prevents hoarding and forces draft decisions during Wander. What you DON'T take matters as much as what you do. Thread pool depletion within a Wander (no repeat offerings) creates natural variety."
	action_items: [
		"Implement satchel limit (5-7 threads per Wander excursion)",
		"Pity mechanic: after 3 nodes with no Rare+ thread, next node guarantees one",
		"Thread pool depletion within a single Wander — once offered, removed from generation pool",
	]
}

i019: core.#Insight & {
	id:         "INSIGHT-019"
	statement:  "Wander regions should differ mechanically, not just statistically — each region changes HOW you explore"
	evidence: [
		"Hades: each biome changes how you play (wall slam in Tartarus, lava in Asphodel, armor in Elysium)",
		"Dead Cells: concept graphs define level length, branching, density, pacing per biome",
		"Loop Hero: tile synergies are hidden — players discover Mountain Peak, Blooming Meadow through experimentation",
		"Risk of Rain: stages differ by enemy pool composition and terrain geometry",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Each Wander region needs a unique mechanical behavior beyond trait weights. The Shallows: paths disappear after one traversal (ephemeral). The Tangle: hidden nodes appear only after visiting prerequisite nodes. The Archive: thread natures visible before collection. The Breach: nodes shift after visits. Statistical differentiation alone produces same-feeling exploration."
	action_items: [
		"Define 5 Wander regions with distinct mechanical behaviors, not just trait distributions",
		"Region trait weights should be 70/30 (suggestive, not deterministic) to preserve surprise",
		"Tapestry resonance shifts region weights by 20-30% — aligned regions easier, opposed regions harder but rarer",
	]
}

i020: core.#Insight & {
	id:         "INSIGHT-020"
	statement:  "The lever-pull transition from build to watch is the single most important UX moment — silence before impact"
	evidence: [
		"Balatro: score is NOT pre-calculated — you must play the hand to see the result, creating suspense",
		"LBaL: the spin is irrevocable commitment — you set up the board, pull the lever, watch",
		"Opus Magnum: pressing Play transforms editor into viewer — static construction gains physics",
		"Peggle: drumroll-to-Ode-to-Joy — brief silence before impact creates contrast that sells the moment",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "When the player pulls the lever: (1) lock the loom — no more edits, (2) duck all audio for 300ms, (3) charge-up animation — energy gathers at loom center, (4) first crossing resolves with full impact. The build UI should dim/slide away. The silence frame is what makes the impact feel real. Build mode = calm, well-lit workspace. Activate mode = darker palette, threads glow, connections become organic/alive."
	action_items: [
		"Design lever-pull as 3-beat sequence: lock → silence → impact",
		"Build UI dims/slides off-screen during Activate — distinct mode switch",
		"Charge-up animation (0.5-1s) before first crossing resolves",
	]
}

i021: core.#Insight & {
	id:         "INSIGHT-021"
	statement:  "Every crossing must produce a readable signal — 'nothing happens' kills experimentation"
	evidence: [
		"Little Alchemy: invalid combinations produce zero feedback, late-game becomes brute-force pair testing",
		"Cultist Simulator: every verb action produces a result card — even failures teach aspect relationships",
		"Golden Idol: graduated green/yellow/red feedback + 'two or fewer incorrect' sustains engagement even when wrong",
		"Potion Craft: every ingredient moves the marker — invalid paths still reveal fog-of-war terrain",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Tink's tension spectrum already ensures every crossing has a classification (harmony/resonance/tension/paradox). The archetype match step must also produce readable output on non-match: partial match → 'something stirs' visual signal with thematic hint; no match → generic trait-bundle resource with visible unified traits. Experimentation is never wasted — every activation teaches something about trait space."
	action_items: [
		"Design 3-tier archetype result: full match (archetype produced), partial match (ambient signal + thematic flicker), no match (raw trait-bundle)",
		"Log partial matches in codex if hint exists: 'you were close to discovering something'",
		"Generic trait-bundles from non-matches become crafting resources for thread upgrades",
	]
}

i022: core.#Insight & {
	id:         "INSIGHT-022"
	statement:  "Separate 'what exists' from 'how to get there' — the productive middle state drives exploration"
	evidence: [
		"Pokemon: silhouettes show existence without recipes — targeted collection replaces random grinding",
		"Outer Wilds: Ship Log rumors show destinations without paths — knowledge of 'where' doesn't give 'how'",
		"Obra Dinn: 60 empty journal rows frame the problem scope before any evidence is gathered",
		"Potion Craft: fog-of-war reveals effect nodes exist at map edges before showing what they are",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The codex should reveal archetypes in two stages. Stage 1 (Wander): hints, tablets, echoes reveal that an archetype EXISTS — name, thematic flavor, maybe one required trait. 'Vendetta Engine — where grudge becomes machinery.' Stage 2 (Activate): successfully producing the archetype fills in the mechanical details — all required traits, cascade outputs, tension level. The middle state ('I know it exists but not how to make it') drives purposeful experimentation."
	action_items: [
		"Design Wander-phase 'archetype hint' collectibles that create named-but-unfilled codex entries",
		"Hints encode required traits thematically, not mechanically: 'where fire meets memory' not 'requires hot + temporal'",
		"Filled codex entries show full trait requirements + cascade output for deliberate reproduction",
	]
}

i023: core.#Insight & {
	id:         "INSIGHT-023"
	statement:  "Confirmation granularity must match iteration speed — tink's multi-minute cycles need gradient feedback"
	evidence: [
		"Obra Dinn: batch-3 confirmation with slow iteration = high frustration between confirmations",
		"Golden Idol: per-section graduated feedback with fast iteration = sustained engagement, lower frustration",
		"Little Alchemy: instant binary (works/nothing) with fast iteration = no guidance at all",
		"Cultist Simulator: aspect-satisfaction display shows 'you need more X' = mechanical proximity wrapped in theme",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "Each Wander-Weave-Activate cycle takes multiple minutes. At this cadence, feedback must be gradient (Golden Idol model), not batch (Obra Dinn model). Show partial match proximity visually during Activate. Log near-misses in codex. Confirm each archetype independently on first discovery — no batch requirement."
	action_items: [
		"During Activate: visually indicate partial match strength (3/4 traits = bright flicker, 2/4 = dim pulse)",
		"Independent archetype confirmation — each discovery is validated immediately, not batched",
		"Near-miss logging: codex records 'closest approach' to undiscovered archetypes per run",
	]
}

i024: core.#Insight & {
	id:         "INSIGHT-024"
	statement:  "Near-miss signals must be ambient and diegetic — a glow, not a popup"
	evidence: [
		"Potion Craft: fog-edge glow reveals outer edge of effect nodes before you can identify them",
		"Breath of the Wild: temperature gauge and audible cues near hidden shrines — ambient, not interruptive",
		"Avowed: shimmering sounds guide toward collectibles without map markers — rewards attention",
		"Tunic: instruction manual pages in constructed language — the signal IS a puzzle",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "During Activate, when a crossing nearly matches an undiscovered archetype: (1) crossing glows with the archetype's thematic color before resolving to its actual output, (2) subtle sound cue — a chord that resolves differently than a full discovery fanfare, (3) unified traits briefly highlight which matched and which were missing, (4) codex hint for that archetype pulses if one exists. Casual players might miss these; attentive players use them to plan next Weave."
	action_items: [
		"Design 'something stirs' animation: thematic color glow + chord fragment, distinct from discovery fanfare",
		"Highlight matching traits green, missing traits as dim silhouettes during near-miss flash",
		"Connect near-miss to Wander hint: if codex has a hint entry, pulse it during the near-miss",
	]
}

i025: core.#Insight & {
	id:         "INSIGHT-025"
	statement:  "First discovery of an archetype must be an unrepeatable peak experience"
	evidence: [
		"Cultist Simulator: first successful rite is a breakthrough after hours of failed attempts — player remembers it",
		"Outer Wilds: the moment a connection clicks in the Ship Log is pure joy — unrepeatable once known",
		"Obra Dinn: first batch-3 confirmation after 30 minutes of uncertainty = cathartic release",
		"Slay the Spire: first Corruption+Dead Branch infinite combo discovery = 'this game is deeper than I thought'",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "When a player discovers a new archetype for the first time: (1) pause Activate sequence briefly — the loom itself reacts, (2) unique materialization animation per archetype, (3) distinctive sound motif (each archetype has its own chord), (4) codex opens with entry filling in, (5) first appearance produces enhanced cascade output. Subsequent productions are satisfying but muted — the discovery moment is unrepeatable and precious."
	action_items: [
		"Design 'first discovery' ceremony: loom pause + materialization + codex fanfare",
		"Each archetype gets a unique sound motif (2-3 note chord) played only on first discovery",
		"First production bonus: enhanced cascade output or extra trait emission as mechanical reward",
	]
}

i026: core.#Insight & {
	id:         "INSIGHT-026"
	statement:  "Cascade-only archetypes create the ultimate discovery — impossible from a single crossing, only reachable through chain engineering"
	evidence: [
		"Cultist Simulator: multi-step lore upgrades require chaining verb outcomes — Exalt rite requires passing through Disciple and Follower first",
		"Potion Craft: deepest effects on the alchemy map require long ingredient chains through dangerous territory",
		"Balatro: the highest scores require multi-Joker chains that no single Joker can produce",
		"Noita: the most powerful wand builds require modifier-spell-trigger chains that emerge from understanding component interaction",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The archetype catalog should contain 'legendary' archetypes that require traits no single crossing can produce — they can only be reached when cascade emissions from one archetype modify downstream crossings. Discovering a cascade-only archetype is the peak experience: you engineered a multi-step chain that produced something no individual placement could. These are the archetypes players describe when they tell friends about the game."
	action_items: [
		"Design 3-5 cascade-only archetypes requiring traits only achievable through chain reactions",
		"Cascade-only archetypes get the most dramatic discovery ceremony (screen-wide effects, unique animation)",
		"Codex hints for cascade-only archetypes should be cryptic: 'born not from crossing but from consequence'",
	]
}

i027: core.#Insight & {
	id:         "INSIGHT-027"
	statement:  "Potion Craft's fog-of-war codex is the right metaphor for tink's archetype space visualization"
	evidence: [
		"Potion Craft: 2D alchemy map with persistent fog — explored areas stay revealed, unexplored regions are dark",
		"Outer Wilds: Rumor Mode shows connected knowledge as a graph with 'more to explore' indicators",
		"Pokemon: numbered Pokedex with visible gaps creates targeted pursuit (Zeigarnik effect)",
		"Hollow Knight: Hunter's Journal shows nothing until encountered — pure unknown unknowns",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "The codex should visualize archetype space as a 2D map with fog. Discovered archetypes are bright nodes. Wander hints illuminate fog regions ('something fire-related exists near the volatile cluster'). Related archetypes are spatially close (shared traits = neighbors). Cascade connections are visible edges between discovered nodes. The codex becomes a map of the archetype space that the player fills through play — not a list to complete but a territory to explore."
	action_items: [
		"Design codex as 2D trait-space map: axes are trait dimensions, archetypes plotted by required traits",
		"Fog-of-war covers undiscovered regions; Wander hints illuminate specific areas",
		"Discovered archetypes show as bright nodes with connections to related archetypes",
		"Completion percentage visible: 'X of Y archetypes discovered' (Zeigarnik motivation)",
	]
}

i028: core.#Insight & {
	id:         "INSIGHT-028"
	statement:  "Thematic coherence transforms mechanical discovery into narrative discovery — flavor text should encode recipes"
	evidence: [
		"Cultist Simulator: aspect-based lore teaches the symbolic language — 'Lantern is light and knowledge' informs combinations",
		"Book of Hours: library catalog organizes knowledge thematically — finding the right book IS the mechanic",
		"Hades: Achilles' subjective codex entries add character — the codex voice creates emotional connection",
		"Outer Wilds: every discovery has narrative significance — 'the sun is dying' is both story and game state",
	]
	method:     "cross_reference"
	confidence: "high"
	discovered: "2026-02-15"
	implication: "'Vendetta Engine — where grudge becomes machinery, and patience sharpens the blade' teaches the recipe through theme better than 'Archetype #7: requires emotional + mechanical + persistent.' Every archetype name, description, and Wander hint should encode required traits thematically. The codex voice should be consistent — the loom's voice? A previous weaver's journal? The threads themselves speaking?"
	action_items: [
		"Establish codex voice/perspective — recommend 'previous weaver's journal' for warmth + mystery",
		"Every archetype description must encode at least 2 required traits thematically",
		"Wander hint text should use the same thematic vocabulary as archetype descriptions",
	]
}
