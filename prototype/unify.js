// unify.js — Core trait unification engine for tink
//
// Two natures (trait-structs) merge. The result classifies as:
//   harmony   — no shared keys conflict
//   resonance — shared keys agree (amplification)
//   tension   — some shared keys conflict (≤50%)
//   paradox   — most shared keys conflict (>50%)

/**
 * Unify two nature-structs.
 * @param {Object} a — first nature
 * @param {Object} b — second nature
 * @returns {{ unified, stability, conflicts, resonances }}
 */
export function unify(a, b) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const sharedKeys = Object.keys(a).filter((k) => k in b);

  const unified = {};
  const conflicts = [];
  const resonances = [];

  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;

    if (inA && inB) {
      const va = a[key];
      const vb = b[key];

      if (va === vb) {
        // Same value = resonance on this trait
        unified[key] = va;
        resonances.push(key);
      } else if (typeof va === "number" && typeof vb === "number") {
        // Numbers: same sign = sum (harmony), opposite = tension
        if ((va > 0 && vb > 0) || (va < 0 && vb < 0) || va === 0 || vb === 0) {
          unified[key] = va + vb;
        } else {
          unified[key] = { conflicted: true, from: [va, vb] };
          conflicts.push(key);
        }
      } else {
        // Different values on same key = conflict
        unified[key] = { conflicted: true, from: [va, vb] };
        conflicts.push(key);
      }
    } else {
      // Only in one = passes through
      unified[key] = inA ? a[key] : b[key];
    }
  }

  // Classify stability
  // Paradox requires multiple conflicts — a single contradiction is tension, not paradox
  let stability;
  if (sharedKeys.length === 0) {
    stability = "harmony";
  } else if (conflicts.length === 0) {
    stability = "resonance";
  } else if (conflicts.length >= 2 && conflicts.length / sharedKeys.length > 0.5) {
    stability = "paradox";
  } else {
    stability = "tension";
  }

  return { unified, stability, conflicts, resonances };
}

/**
 * Flatten a unified struct for archetype matching.
 * Conflicted traits become "conflicted", everything else passes through.
 */
export function flattenUnified(unified) {
  const flat = {};
  for (const [k, v] of Object.entries(unified)) {
    if (v && typeof v === "object" && v.conflicted) {
      flat[k] = "conflicted";
    } else {
      flat[k] = v;
    }
  }
  return flat;
}
