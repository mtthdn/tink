// loom.js — Hex-grid loom for tink
//
// Expandable hex loom: 3 → 7 → 12 → 19 cells
// Uses axial coordinates (q, r)

import { unify } from "./unify.js";
import { matchArchetype } from "./archetypes.js";

// Ring 1: 6 neighbors at distance 1
const RING_1 = [
  { q: 1, r: 0 },   // east
  { q: 0, r: 1 },   // southeast
  { q: -1, r: 1 },  // southwest
  { q: -1, r: 0 },  // west
  { q: 0, r: -1 },  // northwest
  { q: 1, r: -1 },  // northeast
];

// Ring 2: 12 cells at distance 2
const RING_2 = [
  { q: 2, r: 0 },   // far east
  { q: 2, r: -1 },  // far ENE
  { q: 2, r: -2 },  // far NE
  { q: 1, r: -2 },  // far NNE
  { q: 0, r: -2 },  // far north
  { q: -1, r: -1 }, // far NNW
  { q: -2, r: 0 },  // far west
  { q: -2, r: 1 },  // far WSW
  { q: -2, r: 2 },  // far SW
  { q: -1, r: 2 },  // far SSW
  { q: 0, r: 2 },   // far south
  { q: 1, r: 1 },   // far SSE
];

// Partial ring 2: 5 cells for the "large" tier (star pattern extending outward)
const RING_2_PARTIAL = [
  { q: 2, r: -1 },  // far ENE
  { q: 0, r: -2 },  // far north
  { q: -2, r: 1 },  // far WSW
  { q: -1, r: 2 },  // far SSW
  { q: 1, r: 1 },   // far SSE
];

const LOOM_TIERS = {
  small: {
    positions: [
      { q: 0, r: 0 },   // center
      { q: 1, r: 0 },   // east
      { q: 0, r: 1 },   // southeast
    ],
    label: "Apprentice Loom",
  },
  medium: {
    positions: [
      { q: 0, r: 0 },   // center
      ...RING_1,
    ],
    label: "Journeyman Loom",
  },
  large: {
    positions: [
      { q: 0, r: 0 },   // center
      ...RING_1,
      ...RING_2_PARTIAL,
    ],
    label: "Master Loom",
  },
  full: {
    positions: [
      { q: 0, r: 0 },   // center
      ...RING_1,
      ...RING_2,
    ],
    label: "Grand Loom",
  },
};

// Legacy alias for backwards compatibility
const HEX_POSITIONS = LOOM_TIERS.medium.positions;

// 6 hex directions (axial)
const HEX_DIRS = [
  { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
  { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
];

function posKey(q, r) { return `${q},${r}`; }

export { LOOM_TIERS };

export class Loom {
  constructor(tier = "small") {
    this.tier = tier;
    this.positions = LOOM_TIERS[tier].positions;
    this.grid = new Map();   // "q,r" -> thread
    this.crossings = [];
  }

  isValid(q, r) {
    return this.positions.some((p) => p.q === q && p.r === r);
  }

  place(thread, q, r) {
    if (!this.isValid(q, r)) throw new Error(`Invalid hex position (${q}, ${r})`);
    const key = posKey(q, r);
    if (this.grid.has(key)) throw new Error(`Position (${q}, ${r}) occupied by "${this.grid.get(key).name}"`);
    this.grid.set(key, thread);
    return this;
  }

  getNeighbors(q, r) {
    const neighbors = [];
    for (const d of HEX_DIRS) {
      const key = posKey(q + d.q, r + d.r);
      if (this.grid.has(key)) {
        neighbors.push({ q: q + d.q, r: r + d.r, thread: this.grid.get(key) });
      }
    }
    return neighbors;
  }

  getPositions() {
    return this.positions.map((p) => ({
      q: p.q, r: p.r,
      thread: this.grid.get(posKey(p.q, p.r)) || null,
    }));
  }

  // Upgrade to a new tier, preserving placed threads
  upgradeTier(newTier) {
    this.tier = newTier;
    this.positions = LOOM_TIERS[newTier].positions;
  }

  /**
   * Activate: resolve all crossings outward from center.
   * Each pair crossed only once.
   * Cascade: when a crossing matches an archetype with cascade traits,
   * those traits are injected into adjacent unresolved crossings.
   */
  activate() {
    this.crossings = [];
    const resolved = new Set();
    const cascadePool = new Map(); // posKey -> extra traits from cascade
    const pairKey = (q1, r1, q2, r2) => {
      const a = posKey(q1, r1), b = posKey(q2, r2);
      return a < b ? `${a}|${b}` : `${b}|${a}`;
    };

    const resolveCrossing = (tA, qa, ra, tB, qb, rb) => {
      const keyA = posKey(qa, ra);
      const keyB = posKey(qb, rb);
      const extraA = cascadePool.get(keyA) || {};
      const extraB = cascadePool.get(keyB) || {};

      // Merge cascade traits into natures before unifying
      const natureA = { ...tA.nature, ...extraA };
      const natureB = { ...tB.nature, ...extraB };

      const result = unify(natureA, natureB);
      const archetype = matchArchetype(result);

      // If archetype matched with cascade, inject into neighbors of both positions
      if (archetype.match?.cascade) {
        const cascade = archetype.match.cascade;
        for (const [pq, pr] of [[qa, ra], [qb, rb]]) {
          for (const nb2 of this.getNeighbors(pq, pr)) {
            const nbKey = posKey(nb2.q, nb2.r);
            const existing = cascadePool.get(nbKey) || {};
            cascadePool.set(nbKey, { ...existing, ...cascade });
          }
        }
      }

      return {
        threadA: { ...tA, position: { q: qa, r: ra } },
        threadB: { ...tB, position: { q: qb, r: rb } },
        unification: result,
        archetype,
        cascadeApplied: [
          ...Object.keys(extraA).map(k => ({ trait: k, to: keyA })),
          ...Object.keys(extraB).map(k => ({ trait: k, to: keyB })),
        ],
      };
    };

    // Center first
    const center = this.grid.get(posKey(0, 0));
    if (center) {
      for (const nb of this.getNeighbors(0, 0)) {
        const pk = pairKey(0, 0, nb.q, nb.r);
        if (!resolved.has(pk)) {
          resolved.add(pk);
          this.crossings.push(resolveCrossing(center, 0, 0, nb.thread, nb.q, nb.r));
        }
      }
    }

    // Then remaining cells
    for (let i = 1; i < this.positions.length; i++) {
      const pos = this.positions[i];
      const thread = this.grid.get(posKey(pos.q, pos.r));
      if (!thread) continue;
      for (const nb of this.getNeighbors(pos.q, pos.r)) {
        const pk = pairKey(pos.q, pos.r, nb.q, nb.r);
        if (!resolved.has(pk)) {
          resolved.add(pk);
          this.crossings.push(resolveCrossing(thread, pos.q, pos.r, nb.thread, nb.q, nb.r));
        }
      }
    }

    return this.crossings;
  }

  static get POSITIONS() { return HEX_POSITIONS; }
  static get TIERS() { return LOOM_TIERS; }
}
