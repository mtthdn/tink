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

p005: core.#Pattern & {
	name:     "cascade-chaining"
	category: "game-mechanic"
	problem:  "Independent crossing resolution produces flat, predictable Activate phases — no exponential growth or surprise cascades"
	solution: "When a crossing resolves to an archetype, it emits cascade traits that inject into adjacent unresolved crossings, potentially changing their outcome. Resolution order (center outward) becomes a design axis. Players plan thread placement to create deliberate cascade pipelines."
	context:  "Balatro Joker chains, LBaL symbol triggers, Noita spell modifiers all create exponential cascade feelings. The 'scream moment' comes from unexpected chain depth. Tink needs this to make the Activate phase dramatic rather than a static report."
	example:  "Center crossing: Grudge+Clockwork -> Vendetta Engine (emits {persistent, sharp}). Adjacent crossing was Ember+Joy, would normally match Euphoria Cascade. But injected {persistent} tips it to match Anima instead. Player gasps."
	used_in: {"tink": true}
	related: {"weave-and-watch": true, "tension-spectrum": true}
}

p006: core.#Pattern & {
	name:     "knowledge-as-progression"
	category: "meta-game"
	problem:  "Traditional roguelike progression uses unlockable items/characters. This gates content behind time rather than skill."
	solution: "The only cross-run persistent state is the player's codex of discovered archetypes and collected hints. The player gets stronger across runs because they KNOW MORE, not because they have more stuff. First discovery is magic, subsequent ones are mastery."
	context:  "Outer Wilds: entire game progression is knowledge. Return of the Obra Dinn: the logbook IS the game. Cultist Simulator: discovering combinations IS the content. This pattern creates a unique satisfaction: you can't lose what you've learned."
	example:  "Run 1: accidentally discover Aurora (bright+cold). Run 2: deliberately build toward Aurora because you know the recipe. Run 5: engineer a cascade that chains Aurora into Bifrost Shard because you've learned both archetypes."
	used_in: {"tink": true}
	related: {"progressive-revelation": true}
}

p007: core.#Pattern & {
	name:     "loom-as-program"
	category: "game-mechanic"
	problem:  "Spatial placement on the loom could feel arbitrary if position doesn't meaningfully affect outcomes"
	solution: "The loom resolves center-outward, making thread position equivalent to instruction order in a program. Center threads are 'first executed', edge threads are 'last executed'. Cascade traits flow outward, so the center crossing's output shapes what the ring crossings produce. Thread placement becomes programming."
	context:  "Opus Magnum: spatial arrangement IS the program. Noita: wand slot order IS the spell program. Factorio: conveyor layout IS the production program. When spatial arrangement determines execution, the player's loom IS their strategy made physical."
	example:  "Player places a tension-producing thread pair at center (risky, powerful output). Ring threads are positioned to catch cascade traits from center, creating a pipeline. Loom shape: star pattern vs. chain pattern vs. cluster pattern each produce different cascade behaviors."
	used_in: {"tink": true}
	related: {"cascade-chaining": true, "weave-and-watch": true}
}

p008: core.#Pattern & {
	name:     "win-state-as-weaving-goal"
	category: "game-loop"
	problem:  "The game needs a win/loss condition to create tension but the core loop is creative/expressive — harsh failure would undermine the craft feeling"
	solution: "Each run has a 'pattern to weave' — a target tapestry shape or archetype combination. Wander discovers what the target is (gradually revealed). Weave and Activate are the player's attempt to produce it. Failure means the tapestry frays (partial success, some progress saved) rather than total loss."
	context:  "Slay the Spire: kill the boss. Balatro: beat the blind score. LBaL: pay the rent. The win condition creates urgency that makes choices meaningful. Without it, building is pleasant but inconsequential. With harsh failure, building feels punished."
	example:  "This run's pattern: produce a legendary archetype that requires a 3-crossing chain. You have 5 Wander-Weave-Activate cycles to find the right threads and engineer the chain. Each cycle gets you closer or reveals the pattern is harder than expected."
	used_in: {"tink": true}
	related: {"weave-and-watch": true, "knowledge-as-progression": true}
}

p009: core.#Pattern & {
	name:     "node-map-exploration"
	category: "game-loop"
	problem:  "The Wander phase needs structure that creates meaningful route decisions without full dungeon exploration overhead"
	solution: "Use a node-map (Slay the Spire style): 5-7 columns, 3-5 nodes per column, no crossing paths. Node types (Thread Cluster, Clue Shrine, Echo Chamber, Hazard, Rest) are visible; contents are partially hidden via three-tier visibility (type icon + region tint + adjacent preview). Fan-out toward themed endpoints rather than converging to a boss."
	context:  "Slay the Spire's 7x15 grid with no-cross paths, Hades' door reward preview icons, FTL's partial beacon visibility, Inscryption's fixed icon vocabulary. Node-maps are faster than room exploration and let the spatial puzzle live in the Weave phase where it belongs."
	example:  "Player sees 3 paths from column 2: left path has blue-tinted Thread Cluster (probably cold/liquid threads), center has a Clue Shrine (archetype hint), right has a Hazard node (risky but rare threads). Player chooses based on what they plan to weave."
	used_in: {"tink": true}
	related: {"weave-and-watch": true, "progressive-revelation": true}
}

p010: core.#Pattern & {
	name:     "tapestry-resonance"
	category: "meta-game"
	problem:  "The procedural world feels disconnected from the player's weaving choices — Wander outputs don't reflect Activate inputs"
	solution: "Track a run-level resonance: weighted sum of all archetype trait signatures produced so far. Aligned Wander regions become easier (more nodes, better threads). Opposed regions become harder but offer rarer threads. At extreme resonance (>0.9 in any trait), a Breach node appears. The world leans toward responding to the tapestry with 20-30% weight shifts, preserving surprise."
	context:  "Loop Hero: tile placement IS world building, tile synergies create feedback loops. Hades: meta-progression changes future runs. The feedback loop (weave choices → world changes → new threads → new weave choices) creates naturally themed runs without forcing paths."
	example:  "Player has woven 3 fire archetypes. The Forge region gains extra nodes and better thread quality. The Shallows (cold/liquid) becomes sparser but its threads are now rare-tier. A Breach node appears in The Forge offering paradox-tier fire threads."
	used_in: {"tink": true}
	related: {"weave-and-watch": true, "win-state-as-weaving-goal": true}
}

p011: core.#Pattern & {
	name:     "codex-as-discovery-graph"
	category: "meta-game"
	problem:  "Flat list codexes (Pokemon Pokedex, StS Compendium) reduce discovery to checkbox completion — no sense of spatial relationship between entries"
	solution: "Visualize the archetype space as a 2D graph with fog-of-war. Discovered archetypes are bright nodes. Related archetypes (shared traits) are spatially close. Cascade connections are directed edges. Wander hints illuminate fog regions without revealing contents. The codex is a map to explore, not a list to complete."
	context:  "Outer Wilds' Rumor Mode visualizes knowledge as a connected graph with 'more to explore here' indicators. Potion Craft's alchemy map uses persistent fog-of-war over a 2D space. Both transform completion-tracking into spatial exploration. The Zeigarnik effect (incomplete tasks create tension) works best when players can see the shape of what's missing."
	example:  "Player discovers Aurora (bright+cold). Codex shows Aurora as a bright node. Fog near Aurora lifts slightly, revealing edges to two undiscovered neighbors. A Wander hint found earlier ('where fire meets memory') illuminates a distant fog region. The player now has two spatial leads: explore near Aurora, or investigate the fire-memory region."
	used_in: {"tink": true}
	related: {"progressive-revelation": true, "knowledge-as-progression": true}
}

p012: core.#Pattern & {
	name:     "two-stage-revelation"
	category: "content-design"
	problem:  "Showing nothing about undiscovered content (Hollow Knight) loses direction; showing everything (explicit recipe list) kills discovery"
	solution: "Reveal archetype existence and recipe in two separate stages. Stage 1 (Wander): hints, tablets, echoes create named-but-unfilled codex entries — the player knows an archetype EXISTS and its thematic flavor but not its recipe. Stage 2 (Activate): successfully producing the archetype fills in mechanical details (required traits, cascade output). The productive middle state ('I know what to look for but not how to make it') drives purposeful experimentation."
	context:  "Pokemon silhouettes show existence without recipes. Obra Dinn's 60 empty journal rows frame the problem before evidence. Cultist Simulator's aspect hints on verbs show 'you need more X' without revealing the full recipe. The two-stage approach combines the motivation of knowing something exists with the satisfaction of figuring out how to reach it."
	example:  "During Wander, player finds a tablet: 'Vendetta Engine — where grudge becomes machinery, and patience sharpens the blade.' Codex creates a named entry with thematic description but blank recipe. Player now knows to experiment with emotional + mechanical + persistent traits. When they successfully produce Vendetta Engine during Activate, the full entry fills in: required traits, cascade output, and the previous weaver's journal note."
	used_in: {"tink": true}
	related: {"progressive-revelation": true, "codex-as-discovery-graph": true}
}
