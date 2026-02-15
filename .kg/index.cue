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
	}

	insights: {
		"INSIGHT-001": i001
		"INSIGHT-002": i002
		"INSIGHT-003": i003
		"INSIGHT-004": i004
		"INSIGHT-005": i005
		"INSIGHT-006": i006
		"INSIGHT-007": i007
	}

	rejected: {
		"REJ-001": r001
		"REJ-002": r002
		"REJ-003": r003
	}

	patterns: {
		"weave-and-watch":       p001
		"trait-unification":     p002
		"tension-spectrum":      p003
		"progressive-revelation": p004
	}
}

// W3C projections
_provenance:  aggregate.#Provenance & {index:   _index}
_annotations: aggregate.#Annotations & {index:  _index}
_catalog: aggregate.#DatasetEntry & {index: _index, context: project}
