// Architecture decisions for tink
package kg

import "quicue.ca/kg/core@v0"

d001: core.#Decision & {
	id:      "ADR-001"
	title:   "Unification as the only mechanic — no crafting recipes, no synergy tables"
	status:  "accepted"
	date:    "2026-02-15"
	context: "Graph-based games typically use explicit synergy tables (TFT trait thresholds) or recipe lists (Factorio). These are discoverable but ultimately finite and solvable. CUE's unification model offers a different approach: outcomes emerge from structural compatibility of merged values."
	decision: "Thread crossings produce outcomes by unifying the nature-structs of adjacent threads. The unified result is matched against hidden archetypes. There are no explicit recipes — players learn what traits do when combined, not what specific pairs produce."
	rationale: "This makes the possibility space genuinely combinatorial rather than enumerable. Players develop intuition about trait interactions rather than memorizing lookup tables. It also means the system scales: adding one new trait creates interactions with ALL existing traits without hand-authoring each combo."
	consequences: [
		"Must design a trait vocabulary where most 2-trait combinations produce interesting (not degenerate) unified structs",
		"Archetype matching must be fuzzy enough that near-misses produce degraded versions rather than nothing",
		"Balance testing becomes a trait-interaction-matrix problem rather than a recipe-list problem",
		"Players who understand CUE unification have a meta-advantage (feature, not bug — we ARE quicue)",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
}

d002: core.#Decision & {
	id:      "ADR-002"
	title:   "Tensions (trait conflicts) produce drama, not errors"
	status:  "accepted"
	date:    "2026-02-15"
	context: "In CUE, unifying conflicting values produces bottom (_|_). A game mechanic built on pure CUE unification would make conflicting threads simply fail to connect. This is mechanically clean but narratively dead — conflicts ARE the interesting part."
	decision: "Extend the unification model: compatible traits produce Harmony, amplifying traits produce Resonance, conflicting traits produce Tension (powerful but unstable), deeply contradictory traits produce Paradox (wild, transformative). The conflict spectrum IS the risk/reward curve."
	rationale: "Luck Be a Landlord and Balatro demonstrate that the most exciting moments come from risky compositions that barely hold together. Pure CUE semantics would make the game a constraint-satisfaction puzzle. The tension spectrum makes it a gamble."
	consequences: [
		"Need a stability mechanic — tension crossings have a chance of breaking per activation",
		"Paradox crossings can cascade and destroy/transform adjacent crossings",
		"Players who court tension are rewarded with power but risk loom destruction",
		"The stability calculation must be transparent enough to feel fair, opaque enough to feel exciting",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-001": true}
}

d003: core.#Decision & {
	id:      "ADR-003"
	title:   "Three-phase loop: Wander, Weave, Activate"
	status:  "accepted"
	date:    "2026-02-15"
	context: "The game needs a core loop that serves all four fun pillars (discovery, mastery, expression, tension). Approach A (Tink workbench) provides build-and-watch. Approach C (Loom fate weaver) provides narrative emergence. The two must unify."
	decision: "Three phases per cycle: (1) Wander — explore a shifting procedural world, find threads with varied natures, encounter clues about archetypes; (2) Weave — place threads on the loom, form crossings, see unified traits in preview but NOT outcomes; (3) Activate — pull the lever, watch crossings resolve in sequence producing cascading outcomes that change the world and yield new threads."
	rationale: "Wander serves Discovery. Weave serves Expression + Mastery. Activate serves Tension + Surprise. The cycle feeds itself: activation outputs become world changes that alter what you find in the next Wander phase. This is the Slay-the-Spire draft-play loop but with spatial graph construction instead of linear deck building."
	consequences: [
		"Each phase needs distinct UI/feel — Wander is exploration, Weave is spatial puzzling, Activate is spectacle",
		"The feedback loop (activate → world change → new threads) must be fast enough to feel connected",
		"Session length is a design knob: short runs (3-5 cycles) vs. long campaigns (20+ cycles)",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-001": true, "ADR-002": true}
}

d004: core.#Decision & {
	id:      "ADR-004"
	title:   "The graph is felt, not shown — implicit over explicit"
	status:  "proposed"
	date:    "2026-02-15"
	context: "Research identified a spectrum: explicit graphs (Path of Exile) attract analytical players, implicit graphs (Slay the Spire) have broader appeal, hidden graphs (Cultist Simulator) maximize discovery. The loom is inherently visual/spatial but the synergy graph underneath could be exposed or hidden."
	decision: "The loom is visible and spatial (threads, crossings, connections are on screen). But the archetype matching system is hidden — players see unified traits on hover but NOT what archetype they match until activation. The discovery of archetypes IS the content."
	rationale: "Blue Prince's joy is finding rooms that shouldn't exist. Our equivalent: finding crossings that produce archetypes you didn't know existed. If we show the archetype catalog, the game becomes a lookup puzzle. If we hide it, every activation is a potential revelation."
	consequences: [
		"Need a codex/journal that records discovered archetypes (so knowledge accumulates across runs)",
		"Hints and clues found during Wander phase make archetype discovery feel guided, not random",
		"Advanced players develop mental models of the archetype space — this IS mastery",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-001": true}
}

d005: core.#Decision & {
	id:      "ADR-005"
	title:   "Cascade mechanic: archetype outputs inject traits into neighboring unresolved crossings"
	status:  "proposed"
	date:    "2026-02-15"
	context: "Current prototype resolves each crossing independently. But the 'scream moment' in cascade games (LBaL, Balatro, Noita) comes from chain reactions where one outcome feeds into the next. Without cascading, the Activate phase is N independent evaluations rather than one connected sequence."
	decision: "When a crossing resolves and matches an archetype, the archetype emits 'cascade traits' that are injected into adjacent crossings that haven't resolved yet. These bonus traits can change what archetype the downstream crossing matches, creating chain reactions."
	rationale: "This creates the exponential chain feeling. Placing thread A next to thread B next to thread C becomes a deliberate pipeline: A×B produces archetype X which emits trait Z which makes B×C match archetype Y instead of archetype W. The spatial layout of the loom becomes a program."
	consequences: [
		"Activation order (center→outward) becomes a critical design element — players plan cascade direction",
		"Each archetype needs a 'cascade output' field — what traits it emits when it resolves",
		"Balance: cascade traits should be weaker than thread traits (partial injection, not full override)",
		"Visual: cascade needs distinct animation — trait flowing along connection lines from resolved to unresolved",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-001": true, "ADR-003": true}
}

d006: core.#Decision & {
	id:      "ADR-006"
	title:   "Loom grows during a run — 3 to 7 to 12 to 19 cells as progression"
	status:  "proposed"
	date:    "2026-02-15"
	context: "Fixed-size looms limit the complexity arc of a run. Early game should be simple (learn mechanics with 1-2 crossings). Late game should be complex (chain reactions across many crossings). Games like Slay the Spire, TFT, and Balatro all expand the player's composition space over a run."
	decision: "Start each run with a 3-cell loom (center + 2 adjacent). Expand to 7 (full inner ring), then 12, then 19 (two full rings) via specific archetype rewards or Wander-phase milestones. Players choose WHERE to add new cells, creating loom shape as expression."
	rationale: "Progressive loom expansion serves multiple purposes: tutorials the mechanic gently, creates milestone rewards that feel powerful, and makes late-game cascade chains possible without overwhelming early game. The choice of where to add cells adds a spatial strategy layer."
	consequences: [
		"Need a cell-addition UI/mechanic during Weave phase",
		"Early archetypes should be achievable with 1-2 crossings",
		"Late-game archetypes can require chain cascades that need 4+ crossings",
		"Loom shape becomes part of build identity",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-003": true}
}

d007: core.#Decision & {
	id:      "ADR-007"
	title:   "Run structure: roguelike with persistent codex"
	status:  "proposed"
	date:    "2026-02-15"
	context: "The game needs both within-run progression (loom growth, thread collection) and cross-run progression (knowledge accumulation). Roguelike structure provides replayability through varied thread draws. Persistent codex provides the hidden graph discovery content."
	decision: "Each run is a self-contained sequence of Wander-Weave-Activate cycles ending in success or failure. Between runs, the codex persists: discovered archetypes, thread descriptions, hints collected. New runs offer different thread draws but the player's KNOWLEDGE carries over."
	rationale: "Outer Wilds demonstrates that knowledge-as-progression is deeply satisfying. The first time you discover Paradox Bloom is magic. The second time, you know how to build toward it deliberately. The codex turns random experimentation into purposeful engineering across runs."
	consequences: [
		"Need a codex UI that records: discovered archetypes, their required traits, their cascade outputs",
		"First discovery of an archetype should be a special moment (animation, sound, codex entry unlocks)",
		"Run success/failure condition needs design: what is the win state? Threat to survive? Score to hit?",
		"Difficulty scaling across runs: ascension-style modifiers, harder thread draws, aggressive world",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-003": true, "ADR-004": true}
}

d008: core.#Decision & {
	id:      "ADR-008"
	title:   "Technology: HTML5 Canvas plus D3.js, single-file deployable"
	status:  "proposed"
	date:    "2026-02-15"
	context: "We have 9 proven HTML games in fing-mod/web-games (up to 991KB single-file). We have D3.js viz infrastructure in quicue.ca and CJLQ. We deploy static files to Caddy on container 612. The prototype is plain Node.js ES modules."
	decision: "Build the visual game as a single HTML file with embedded JS (like fing-mod games). Use Canvas for the loom rendering and animations, D3.js for data-driven transitions if needed. No build step, no dependencies beyond CDN libs."
	rationale: "Single-file HTML games deploy trivially (scp to Caddy), work offline, are shareable as downloads, and have proven viable at complex game scale (Loop Hero clone was 991KB). Canvas provides the animation performance needed for cascade visualization. Caddy MIME type issues with external .js files make inlined scripts more reliable."
	consequences: [
		"All game code lives in one HTML file (or a small set of inlined files)",
		"Canvas for loom/animation, DOM for UI/menus/codex",
		"CDN for D3.js, everything else self-contained",
		"Deploy via existing deploy.sh pattern to quique.ca or rfam.cc",
	]
	appliesTo: [{"@id": "https://rfam.cc/tink"}]
	related: {"ADR-003": true}
}
