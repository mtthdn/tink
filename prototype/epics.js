// epics.js — Epic evaluation engine for tink
//
// Pure-function evaluation: epics are declarative beat sequences that
// evaluate against immutable weaving history via constraint matching.
// Idempotent: same inputs always produce same outputs.

// --- Test epics (starter set for engine validation) ---

const TEST_EPICS = [
  {
    name: "Test Spark",
    tier: "common",
    projection: "tapestry",
    beats: [
      {
        label: "Beat 1",
        requires: { stability: "tension" },
        onMatch: "Tension found.",
        onPartial: "Not tense enough.",
      },
      {
        label: "Beat 2",
        requires: { hasArchetype: true },
        onMatch: "Archetype emerged.",
        onPartial: "Nothing emerged.",
      },
    ],
    onComplete: "Test complete.",
    onPartial: "Test incomplete.",
  },
  {
    name: "Test Echo",
    tier: "uncommon",
    projection: "tapestry",
    beats: [
      {
        label: "First Resonance",
        requires: { stability: "resonance" },
        onMatch: "The threads sing together.",
        onPartial: "Silence.",
      },
      {
        label: "Trait Alignment",
        requires: { traits: { bright: true, hot: true } },
        onMatch: "Light and heat converge.",
        onPartial: "The traits scatter.",
      },
      {
        label: "Cascade Arrival",
        requires: { cascadeDepth: 1 },
        onMatch: "The cascade ripples outward.",
        onPartial: "Nothing cascades.",
      },
    ],
    onComplete: "The echo reverberates through the tapestry.",
    onPartial: "The echo fades before completing.",
  },
  {
    name: "Test Paradox Walk",
    tier: "rare",
    projection: "tapestry",
    beats: [
      {
        label: "The Contradiction",
        requires: { stability: "paradox", minConflicts: 2 },
        onMatch: "Impossibility takes root.",
        onPartial: "Not enough contradiction.",
      },
      {
        label: "The Emergence",
        requires: { hasArchetype: true, archetypeTier: "mythic" },
        onMatch: "From paradox, myth emerges.",
        onPartial: "The paradox collapses.",
      },
    ],
    onComplete: "The walk through paradox is complete.",
    onPartial: "The path remains unfinished.",
  },
];

// --- Pure evaluation functions ---

/**
 * Does a single crossing result satisfy ALL of a beat's requirements?
 * All specified requirements must match. Empty requirements = always matches.
 * @param {Object} beat - Beat with a `requires` object
 * @param {Object} crossing - Crossing result from weaving history
 * @returns {boolean}
 */
function beatMatches(beat, crossing) {
  const req = beat.requires;
  if (!req) return true;

  if (req.stability && crossing.stability !== req.stability) return false;

  if (req.traits) {
    for (const [k, v] of Object.entries(req.traits)) {
      if (crossing.traits[k] !== v) return false;
    }
  }

  if (req.hasArchetype && !crossing.archetype) return false;

  if (req.archetypeTier) {
    if (!crossing.archetype || crossing.archetype.tier !== req.archetypeTier) return false;
  }

  if (req.cascadeDepth && (crossing.cascadeDepth || 0) < req.cascadeDepth) return false;

  if (req.hasNearMiss && (!crossing.nearMisses || crossing.nearMisses.length === 0)) return false;

  if (req.minConflicts) {
    const conflicts = Object.values(crossing.traits).filter(v => v === "conflicted").length;
    if (conflicts < req.minConflicts) return false;
  }

  // Projection-derived fields
  if (req.heroStage && crossing.heroStage !== req.heroStage) return false;
  if (req.dramaticArc && crossing.dramaticArc !== req.dramaticArc) return false;
  if (req.symmetry && crossing.symmetry !== req.symmetry) return false;

  return true;
}

/**
 * What fraction of a beat's requirements does this crossing satisfy?
 * Returns 0..1. Empty requirements = 1.0 (vacuous truth).
 * @param {Object} beat - Beat with a `requires` object
 * @param {Object} crossing - Crossing result from weaving history
 * @returns {number}
 */
function beatPartialScore(beat, crossing) {
  const req = beat.requires;
  if (!req) return 1;

  let total = 0, matched = 0;

  if (req.stability) {
    total++;
    if (crossing.stability === req.stability) matched++;
  }

  if (req.traits) {
    for (const [k, v] of Object.entries(req.traits)) {
      total++;
      if (crossing.traits[k] === v) matched++;
    }
  }

  if (req.hasArchetype) {
    total++;
    if (crossing.archetype) matched++;
  }

  if (req.archetypeTier) {
    total++;
    if (crossing.archetype && crossing.archetype.tier === req.archetypeTier) matched++;
  }

  if (req.cascadeDepth) {
    total++;
    if ((crossing.cascadeDepth || 0) >= req.cascadeDepth) matched++;
  }

  if (req.hasNearMiss) {
    total++;
    if (crossing.nearMisses && crossing.nearMisses.length > 0) matched++;
  }

  if (req.minConflicts) {
    total++;
    const conflicts = Object.values(crossing.traits).filter(v => v === "conflicted").length;
    if (conflicts >= req.minConflicts) matched++;
  }

  // Projection-derived fields
  if (req.heroStage) {
    total++;
    if (crossing.heroStage === req.heroStage) matched++;
  }

  if (req.dramaticArc) {
    total++;
    if (crossing.dramaticArc === req.dramaticArc) matched++;
  }

  if (req.symmetry) {
    total++;
    if (crossing.symmetry === req.symmetry) matched++;
  }

  return total === 0 ? 1 : matched / total;
}

/**
 * Evaluate an epic against a weaving history.
 * Beats are matched IN ORDER: beat N can only match a crossing that comes
 * after beat N-1's match in the history sequence.
 *
 * For unmatched beats, the best partial score from remaining history is recorded.
 *
 * @param {Object} epic - Epic definition with beats array
 * @param {Array} history - Array of crossing results (weaving history)
 * @returns {Object} Evaluation result
 */
function evaluateEpic(epic, history) {
  const matched = [];
  let historyIdx = 0;

  for (const beat of epic.beats) {
    let found = false;
    for (let i = historyIdx; i < history.length; i++) {
      if (beatMatches(beat, history[i])) {
        matched.push({ beat, crossing: history[i], index: i });
        historyIdx = i + 1;
        found = true;
        break;
      }
    }
    if (!found) {
      // Find best partial match for this beat in remaining history
      let bestPartial = 0;
      for (let i = historyIdx; i < history.length; i++) {
        bestPartial = Math.max(bestPartial, beatPartialScore(beat, history[i]));
      }
      matched.push({ beat, crossing: null, partial: bestPartial });
    }
  }

  const completedBeats = matched.filter(m => m.crossing !== null).length;
  const totalBeats = epic.beats.length;
  const ratio = totalBeats === 0 ? 0 : completedBeats / totalBeats;

  return {
    epic,
    matched,
    completedBeats,
    totalBeats,
    ratio,
    complete: ratio === 1,
    nearMiss: ratio >= 2 / 3 && ratio < 1,
  };
}

/**
 * Evaluate all epics against a weaving history.
 * Returns results sorted by ratio descending (best matches first).
 *
 * @param {Array} epics - Array of epic definitions
 * @param {Array} history - Array of crossing results (weaving history)
 * @returns {Array} Sorted evaluation results
 */
function evaluateAllEpics(epics, history) {
  return epics
    .map(e => evaluateEpic(e, history))
    .sort((a, b) => b.ratio - a.ratio);
}

export { beatMatches, beatPartialScore, evaluateEpic, evaluateAllEpics, TEST_EPICS };
