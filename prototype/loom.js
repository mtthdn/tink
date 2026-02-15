// loom.js — Hex-grid loom for tink
//
// 3-ring hex loom (7 cells): center + 6 neighbors
// Uses axial coordinates (q, r)

import { unify } from "./unify.js";
import { matchArchetype } from "./archetypes.js";

// 7-cell hex: center (0,0) + 6 neighbors
const HEX_POSITIONS = [
  { q: 0, r: 0 },   // center
  { q: 1, r: 0 },   // east
  { q: 0, r: 1 },   // southeast
  { q: -1, r: 1 },  // southwest
  { q: -1, r: 0 },  // west
  { q: 0, r: -1 },  // northwest
  { q: 1, r: -1 },  // northeast
];

// 6 hex directions (axial)
const HEX_DIRS = [
  { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
  { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
];

function posKey(q, r) { return `${q},${r}`; }
function isValid(q, r) { return HEX_POSITIONS.some((p) => p.q === q && p.r === r); }

export class Loom {
  constructor() {
    this.grid = new Map();   // "q,r" -> thread
    this.crossings = [];
  }

  place(thread, q, r) {
    if (!isValid(q, r)) throw new Error(`Invalid hex position (${q}, ${r})`);
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
    return HEX_POSITIONS.map((p) => ({
      q: p.q, r: p.r,
      thread: this.grid.get(posKey(p.q, p.r)) || null,
    }));
  }

  /**
   * Activate: resolve all crossings outward from center.
   * Each pair crossed only once.
   */
  activate() {
    this.crossings = [];
    const resolved = new Set();
    const pairKey = (q1, r1, q2, r2) => {
      const a = posKey(q1, r1), b = posKey(q2, r2);
      return a < b ? `${a}|${b}` : `${b}|${a}`;
    };

    // Center first
    const center = this.grid.get(posKey(0, 0));
    if (center) {
      for (const nb of this.getNeighbors(0, 0)) {
        const pk = pairKey(0, 0, nb.q, nb.r);
        if (!resolved.has(pk)) {
          resolved.add(pk);
          this.crossings.push(this._resolve(center, 0, 0, nb.thread, nb.q, nb.r));
        }
      }
    }

    // Then ring cells
    for (let i = 1; i < HEX_POSITIONS.length; i++) {
      const pos = HEX_POSITIONS[i];
      const thread = this.grid.get(posKey(pos.q, pos.r));
      if (!thread) continue;
      for (const nb of this.getNeighbors(pos.q, pos.r)) {
        const pk = pairKey(pos.q, pos.r, nb.q, nb.r);
        if (!resolved.has(pk)) {
          resolved.add(pk);
          this.crossings.push(this._resolve(thread, pos.q, pos.r, nb.thread, nb.q, nb.r));
        }
      }
    }

    return this.crossings;
  }

  _resolve(tA, qa, ra, tB, qb, rb) {
    const result = unify(tA.nature, tB.nature);
    const archetype = matchArchetype(result);
    return {
      threadA: { ...tA, position: { q: qa, r: ra } },
      threadB: { ...tB, position: { q: qb, r: rb } },
      unification: result,
      archetype,
    };
  }

  static get POSITIONS() { return HEX_POSITIONS; }
}
