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
