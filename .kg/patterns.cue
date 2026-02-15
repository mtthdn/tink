// Reusable patterns identified for tink
package kg

import "quicue.ca/kg/core@v0"

p001: core.#Pattern & {
	name:     "weave-and-watch"
	category: "game-loop"
	problem:  "Graph construction games need a satisfying execution phase that rewards the building phase"
	solution: "Split gameplay into build (Weave) and execute (Activate) phases. During Weave, player has full agency constructing the graph. During Activate, the graph runs autonomously with visible energy flow. The gap between expectation and outcome creates surprise and learning."
	context:  "Autobattlers, Factorio, Opus Magnum, Balatro all use this pattern. It works because authorship (building) + surprise (execution) + feedback (diagnosis) create the core satisfaction loop."
	example:  "Player places 'Grudge' next to 'Clockwork' on the loom. Activation: energy flows through → crossing unifies to {emotional, dark, persistent, mechanical} → matches 'Vendetta Engine' archetype → spawns a creature that hunts a specific enemy type."
	used_in: {"tink": true}
	related: {"build-then-watch": true, "lever-pull": true}
}

p002: core.#Pattern & {
	name:     "trait-unification"
	category: "game-mechanic"
	problem:  "Traditional synergy systems use explicit tables (3 Warriors = bonus). This is finite, solvable, and requires hand-authoring every combo."
	solution: "Represent entities as trait-structs. Synergy = structural unification of adjacent trait-structs. Outcomes are determined by pattern-matching the unified result against an archetype catalog. Adding one new trait creates interactions with ALL existing traits automatically."
	context:  "Inspired by CUE language unification semantics. In CUE, {a: 1} & {b: 2} = {a: 1, b: 2}. Applied to game design: thread natures merge when adjacent, and the merged struct determines what happens."
	example:  "{volatile: true, bright: true} & {liquid: true, cold: true} = {volatile: true, bright: true, liquid: true, cold: true} → matches 'Aurora' archetype"
	used_in: {"tink": true}
	related: {"struct-as-set": true, "cue-unification": true}
}

p003: core.#Pattern & {
	name:     "tension-spectrum"
	category: "game-mechanic"
	problem:  "Pure constraint satisfaction (compatible = success, incompatible = failure) creates binary outcomes that lack drama"
	solution: "Instead of binary pass/fail, use a four-point spectrum: Harmony (all compatible, stable), Resonance (amplifying, strong), Tension (conflicting, powerful but unstable), Paradox (deeply contradictory, wild and transformative). Players choose their position on the risk/reward curve."
	context:  "Balatro's multiplicative chains court risk for exponential reward. Noita's wand building can create god-tier or self-destructive wands. The tension spectrum replaces 'does it work?' with 'how hard is it pushing?'"
	example:  "Thread 'Patience' {persistent: true, calm: true} + Thread 'Lightning' {ephemeral: true, volatile: true} → Tension crossing: persistent vs ephemeral, calm vs volatile. Powerful but 30% break chance per activation."
	used_in: {"tink": true}
	related: {"trait-unification": true, "risk-reward": true}
}

p004: core.#Pattern & {
	name:     "progressive-revelation"
	category: "content-design"
	problem:  "If players can see all possible outcomes, the game becomes a lookup puzzle. If outcomes are completely random, the game feels arbitrary."
	solution: "Hide the archetype catalog but provide clues. Discovered archetypes are recorded in a codex. Wander-phase exploration reveals hints about undiscovered archetypes. Advanced play involves deducing archetype patterns from observed trait interactions."
	context:  "Cultist Simulator hides its combination graph — discovering what cards do together IS the game. Blue Prince hides room connections behind doors. The Watcher mechanic in Slay the Spire reveals card synergies through stance transitions."
	example:  "During Wander, player finds a tablet reading 'where fire meets memory, the past ignites.' This hints at an undiscovered archetype involving {hot: true} and {temporal: true} traits."
	used_in: {"tink": true}
	related: {"weave-and-watch": true, "archetype-discovery": true}
}
