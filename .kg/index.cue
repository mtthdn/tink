// Knowledge graph index — comprehension-derived, never hand-maintained
package kg

import "quicue.ca/kg/aggregate@v0"

_index: aggregate.#KGIndex & {
	project: "tink"

	decisions: {
		"ADR-001": d001
		"ADR-002": d002
		"ADR-003": d003
		"ADR-004": d004
		"ADR-005": d005
		"ADR-006": d006
		"ADR-007": d007
		"ADR-008": d008
	}

	insights: {
		"INSIGHT-001": i001
		"INSIGHT-002": i002
		"INSIGHT-003": i003
		"INSIGHT-004": i004
		"INSIGHT-005": i005
		"INSIGHT-006": i006
		"INSIGHT-007": i007
		"INSIGHT-008": i008
		"INSIGHT-009": i009
		"INSIGHT-010": i010
		"INSIGHT-011": i011
		"INSIGHT-012": i012
		"INSIGHT-013": i013
		"INSIGHT-014": i014
		"INSIGHT-015": i015
		"INSIGHT-016": i016
		"INSIGHT-017": i017
		"INSIGHT-018": i018
		"INSIGHT-019": i019
		"INSIGHT-020": i020
		"INSIGHT-021": i021
		"INSIGHT-022": i022
		"INSIGHT-023": i023
		"INSIGHT-024": i024
		"INSIGHT-025": i025
		"INSIGHT-026": i026
		"INSIGHT-027": i027
		"INSIGHT-028": i028
	}

	rejected: {
		"REJ-001": r001
		"REJ-002": r002
		"REJ-003": r003
		"REJ-004": r004
	}

	patterns: {
		"weave-and-watch":           p001
		"trait-unification":         p002
		"tension-spectrum":          p003
		"progressive-revelation":    p004
		"cascade-chaining":          p005
		"knowledge-as-progression":  p006
		"loom-as-program":           p007
		"win-state-as-weaving-goal": p008
		"node-map-exploration":      p009
		"tapestry-resonance":        p010
		"codex-as-discovery-graph":  p011
		"two-stage-revelation":      p012
	}
}

// W3C projections
_provenance:  aggregate.#Provenance & {index:   _index}
_annotations: aggregate.#Annotations & {index:  _index}
_catalog: aggregate.#DatasetEntry & {index: _index, context: project}
