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
