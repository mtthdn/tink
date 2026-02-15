// tink project identity
package kg

import "quicue.ca/kg/ext@v0"

project: ext.#Context & {
	"@id":       "https://rfam.cc/tink"
	name:        "tink"
	description: "A tinker's loom — a game where graph construction via CUE-style unification IS the core mechanic"
	module:      "rfam.cc/tink@v0"
	status:      "experimental"
	uses: [
		{"@id": "https://quicue.ca/concept/cue-unification"},
		{"@id": "https://quicue.ca/pattern/struct-as-set"},
	]
	knows: [
		{"@id": "https://quicue.ca/concept/dependency-graph"},
		{"@id": "https://rfam.cc/tink/concept/thread-nature"},
		{"@id": "https://rfam.cc/tink/concept/crossing-archetype"},
		{"@id": "https://rfam.cc/tink/concept/weave-and-watch"},
	]
}
