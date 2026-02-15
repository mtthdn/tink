// Approaches tried and rejected
package kg

import "quicue.ca/kg/core@v0"

r001: core.#Rejected & {
	id:          "REJ-001"
	approach:    "Explicit synergy tables (N units of type X = bonus Y)"
	reason:      "Finite, solvable, requires hand-authoring every combination. TFT-style trait thresholds are discoverable but ultimately a lookup table. The game becomes 'find the best known composition' rather than 'discover new compositions.'"
	date:        "2026-02-15"
	alternative: "Trait-unification mechanic (ADR-001) where outcomes emerge from structural compatibility of merged values. Combinatorially open rather than enumerable."
	related:     {"ADR-001": true}
}

r002: core.#Rejected & {
	id:          "REJ-002"
	approach:    "PvP-first competitive graph racing (Approach B: Strand)"
	reason:      "Requires PvP balance tuning from day one. Opaque opponent graphs make the competitive element feel unfair until deep understanding develops. Delays the fun — new players need to learn the system before competition is meaningful."
	date:        "2026-02-15"
	alternative: "Single-player roguelike structure with optional echo/ghost sharing. Other players' tapestries appear as discoverable echoes in the world — competitive flavor without competitive pressure."
	related:     {"ADR-003": true}
}

r003: core.#Rejected & {
	id:          "REJ-003"
	approach:    "Mechanical-only game design without thematic grounding (previous prototypes)"
	reason:      "Chimera Clash, Fusion Hand, and Ouroboros Factory are mechanically sound but user reported 'none of those games are fun — mechanically connected but not pleasant.' Mechanical novelty alone does not produce fun."
	date:        "2026-02-15"
	alternative: "Ground the mechanics in thematic resonance (weaving/tinkering mythology), invest in visual juice and spectacle during activation, prioritize feel over depth in early prototypes."
	related:     {"INSIGHT-005": true}
}
