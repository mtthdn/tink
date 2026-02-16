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

// --- Stability mood constants ---

const STABILITY_TONE = { harmony: "warm", resonance: "crystalline", tension: "dissonant", paradox: "dark" };
const STABILITY_HUE = { harmony: "#44aa88", resonance: "#4488ff", tension: "#ff6600", paradox: "#aa00ff" };

// --- The 12 Epics ---

const EPICS = [
  // ═══ Tapestry projection (6 epics) ═══

  {
    name: "The Forge of Contradiction",
    tier: "mythic",
    projection: "tapestry",
    beats: [
      {
        label: "The Spark That Bites",
        requires: { stability: "tension", traits: { volatile: true } },
        mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 },
        onMatch: "Something burns at the edges of coherence. The volatile thread pulls against its own nature, and the loom shudders with potential.",
        onPartial: "The threads strain, but the contradiction lacks teeth.",
      },
      {
        label: "The Deepening",
        requires: { cascadeDepth: 2 },
        onMatch: "The fracture propagates. What began as a single contradiction now echoes through layer after layer, each cascade carrying the wound deeper into the weave.",
        onPartial: "The ripples fade before reaching sufficient depth.",
      },
      {
        label: "The Impossible Bloom",
        requires: { stability: "paradox", hasArchetype: true },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "From the heart of impossibility, something crystallizes. A form that should not exist takes shape in the space between contradictions, and the loom accepts what logic cannot.",
        onPartial: "The paradox swirls but refuses to coalesce into form.",
      },
    ],
    onComplete: "The forge burns with paradox-light. What was broken is reforged into something the loom has never seen -- a pattern born of its own impossibility.",
    onPartial: "The contradictions gather but the forge remains cold, waiting for the final catalyst.",
  },

  {
    name: "The Quiet Descent",
    tier: "rare",
    projection: "tapestry",
    beats: [
      {
        label: "The Stillness Before",
        requires: { stability: "harmony" },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "Everything is gentle. The threads lie flat and easy, whispering of simple things. It feels like the beginning of something ordinary.",
        onPartial: "The loom stirs, not yet settled.",
      },
      {
        label: "The Second Calm",
        requires: { stability: "harmony" },
        onMatch: "Again, harmony. But this time there is a tremor beneath the surface -- the kind of peace that comes from not looking too closely at the cracks.",
        onPartial: "The weave refuses its second rest.",
      },
      {
        label: "The Root",
        requires: { traits: { organic: true } },
        onMatch: "Something living threads itself through the calm. It grows without permission, patient and slow, drawing nourishment from the stillness.",
        onPartial: "The weave remains inert, refusing the organic.",
      },
      {
        label: "The Unraveling",
        requires: { stability: "paradox" },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "The quiet shatters. What grew in the stillness was not peace but pressure, and now the roots crack the foundation open. The descent was always here, waiting.",
        onPartial: "The paradox lingers at the threshold but does not cross.",
      },
    ],
    onComplete: "The loom remembers silence differently now. What seemed like tranquility was a slow, beautiful fall -- and at the bottom, something ancient stirs.",
    onPartial: "The descent halts mid-step, suspended between peace and collapse.",
  },

  {
    name: "Combustion Engine",
    tier: "uncommon",
    projection: "tapestry",
    beats: [
      {
        label: "First Ignition",
        requires: { traits: { volatile: true } },
        mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 },
        onMatch: "A volatile thread enters the weave and the air changes. Something is going to burn.",
        onPartial: "The weave remains inert, refusing the spark.",
      },
      {
        label: "Second Ignition",
        requires: { traits: { volatile: true } },
        onMatch: "Again volatile. The repetition is not redundancy -- it is fuel. Each volatile thread feeds the next, building toward something inevitable.",
        onPartial: "The second spark fails to catch.",
      },
      {
        label: "The Cascade",
        requires: { cascadeDepth: 1 },
        mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 },
        onMatch: "Ignition. The accumulated volatility finally catches and the cascade tears through the weave, transforming everything it touches.",
        onPartial: "The fuel is present but the spark never reaches the tinder.",
      },
    ],
    onComplete: "The engine turns over. Volatile upon volatile upon cascade -- a machine made of instability, somehow running true.",
    onPartial: "The engine sputters, lacking sufficient fuel for combustion.",
  },

  {
    name: "Roots and Canopy",
    tier: "rare",
    projection: "tapestry",
    beats: [
      {
        label: "The Seed",
        requires: { traits: { organic: true } },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "Something organic takes root in the weave. It is small and patient, a seed that knows only one direction: upward.",
        onPartial: "The soil is barren. Nothing organic takes hold.",
      },
      {
        label: "The Growth",
        requires: { cascadeDepth: 1, traits: { organic: true } },
        onMatch: "The organic thread cascades, branching outward like roots seeking water. Life begets life, each new growth feeding the next.",
        onPartial: "Growth stalls -- the roots cannot find purchase deep enough.",
      },
      {
        label: "The Crown",
        requires: { hasArchetype: true },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "An archetype emerges from the canopy -- the tree has grown tall enough to bear fruit. What began as a single seed now casts its shadow across the entire weave.",
        onPartial: "The tree grows but bears no fruit. The canopy remains empty.",
      },
    ],
    onComplete: "From root to crown, the tree stands complete. Organic persistence, cascading growth, and emergent form -- the oldest story in the weave.",
    onPartial: "The tree grows crooked, reaching toward a canopy it cannot yet touch.",
  },

  {
    name: "Storm and Stillness",
    tier: "mythic",
    projection: "tapestry",
    beats: [
      {
        label: "The Calm",
        requires: { stability: "harmony" },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "Perfect harmony. The threads lie still, each one exactly where it belongs. The loom holds its breath.",
        onPartial: "The stillness is imperfect, tainted by distant vibrations.",
      },
      {
        label: "The Storm",
        requires: { stability: "paradox" },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "The paradox arrives like weather. Everything that was still is now in motion, every calm thread screaming with contradiction. The loom bends under the weight of impossibility.",
        onPartial: "Thunder rumbles but the storm does not break.",
      },
      {
        label: "The Eye",
        requires: { hasArchetype: true },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "In the eye of the paradox-storm, an archetype crystallizes. Not despite the chaos but because of it -- a form that can only exist in the space between calm and catastrophe.",
        onPartial: "The storm rages but nothing takes form within it.",
      },
    ],
    onComplete: "The storm passes. The stillness returns. But now the loom carries a shape that was forged in the space between them -- a myth written in weather.",
    onPartial: "The storm and stillness circle each other, never quite meeting.",
  },

  {
    name: "The Weaver's Doubt",
    tier: "uncommon",
    projection: "tapestry",
    beats: [
      {
        label: "The First Hesitation",
        requires: { hasNearMiss: true },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "A near-miss. Something almost formed but didn't -- and in that gap, a question: what if I had woven differently?",
        onPartial: "The weave proceeds without doubt. Every thread finds its place.",
      },
      {
        label: "The Second Hesitation",
        requires: { hasNearMiss: true },
        onMatch: "Another near-miss. The pattern of doubt deepens. Each almost-archetype is a ghost of a choice not taken, a thread not pulled.",
        onPartial: "Confidence holds. The second hesitation does not come.",
      },
      {
        label: "The Commitment",
        requires: { hasArchetype: true },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "After two hesitations, the third crossing finally resolves. The archetype that emerges carries the weight of every doubt -- and is stronger for it.",
        onPartial: "The doubt continues. No archetype emerges to answer it.",
      },
    ],
    onComplete: "The weaver's hands shake, but the pattern holds. Doubt was not weakness -- it was the loom testing the thread before committing to the shape.",
    onPartial: "The doubt lingers, neither resolved nor released.",
  },

  // ═══ Heroic Journey projection (3 epics) ═══

  {
    name: "The Reluctant Hero",
    tier: "uncommon",
    projection: "heroic",
    beats: [
      {
        label: "The Ordinary World",
        requires: { heroStage: "call", stability: "harmony" },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "The call comes in a moment of peace. The weave is harmonious, the threads settled -- and that is precisely why the disruption feels so unwelcome.",
        onPartial: "The call has not yet arrived, or the world is already too turbulent to hear it.",
      },
      {
        label: "The Trial by Fire",
        requires: { heroStage: "trials", stability: "tension" },
        mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 },
        onMatch: "Tension mounts with each trial. The threads strain against each other and the weaver must choose which to sacrifice and which to save.",
        onPartial: "The trials have not yet begun, or they lack sufficient tension.",
      },
      {
        label: "The Breaking Point",
        requires: { heroStage: "ordeal", stability: "paradox" },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "The ordeal arrives as paradox -- an impossible choice, a thread that must be both cut and kept. The hero breaks, and in breaking, discovers what was always underneath.",
        onPartial: "The ordeal approaches but the paradox does not fully manifest.",
      },
    ],
    onComplete: "The reluctant hero completes the journey not through courage but through necessity. Each stage demanded more than the last, and each time the weave answered with exactly enough.",
    onPartial: "The hero hesitates at the threshold, the journey incomplete.",
  },

  {
    name: "The Mirror's Edge",
    tier: "rare",
    projection: "heroic",
    beats: [
      {
        label: "The Reflected Call",
        requires: { heroStage: "call", hasArchetype: true },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "The call arrives not as a summons but as a reflection. An archetype forms in the weave, and the hero sees themselves in its facets -- distorted, clarified, made strange.",
        onPartial: "The mirror is dark. No archetype forms to show the hero their reflection.",
      },
      {
        label: "The Crystal Trials",
        requires: { heroStage: "trials", stability: "resonance" },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "The trials resonate. Each challenge echoes the one before it, each solution reflecting a deeper truth. The hero learns not by conquering but by recognizing.",
        onPartial: "The trials lack resonance -- each feels disconnected from the last.",
      },
      {
        label: "The Final Reflection",
        requires: { heroStage: "return", hasArchetype: true },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "The hero returns bearing a second archetype -- a mirror image of the first. Together they form a complete picture: who the hero was, and who the hero has become.",
        onPartial: "The return brings no new archetype. The mirror remains one-sided.",
      },
    ],
    onComplete: "Two archetypes, one journey. The mirror's edge is the line between who you were and who you are, and the hero walks it with perfect, crystalline balance.",
    onPartial: "The mirror cracks before the reflection is complete.",
  },

  {
    name: "The Cartographer's Lie",
    tier: "mythic",
    projection: "heroic",
    beats: [
      {
        label: "The Map",
        requires: { heroStage: "call", hasArchetype: true },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "The journey begins with a map -- an archetype that promises the shape of things to come. But every map is a simplification, and every simplification is a kind of lie.",
        onPartial: "No archetype emerges to chart the course ahead.",
      },
      {
        label: "The Territory",
        requires: { heroStage: "trials", hasArchetype: true },
        onMatch: "A second archetype forms during the trials, one that contradicts the first. The territory is not the map. The hero must choose: trust the chart, or trust their eyes.",
        onPartial: "The trials proceed without a second archetype to challenge the map.",
      },
      {
        label: "The Revision",
        requires: { heroStage: "ordeal", hasArchetype: true },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "The ordeal produces a third archetype. Three contradictory truths, three maps of the same terrain. The hero realizes the lie was not in the map but in believing any single map could be enough.",
        onPartial: "The ordeal rages but produces no new form to challenge the existing maps.",
      },
      {
        label: "The New Cartography",
        requires: { heroStage: "return", hasArchetype: true },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "The hero returns not with a better map but with the wisdom that maps are tools, not truths. A fourth archetype crystallizes -- not a destination but a way of seeing.",
        onPartial: "The return bears no final archetype. The cartography remains unfinished.",
      },
    ],
    onComplete: "Four archetypes, four maps, one journey. The cartographer's lie was the belief that the territory could be captured. The truth is that every crossing draws the map anew.",
    onPartial: "The cartographer's work is incomplete. Some territories remain uncharted.",
  },

  // ═══ Tragedy projection (3 epics) ═══

  {
    name: "Paradox Garden",
    tier: "uncommon",
    projection: "tragedy",
    beats: [
      {
        label: "The First Seed of Impossibility",
        requires: { dramaticArc: "rising", stability: "paradox" },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "A paradox blooms while the arc still climbs. Something impossible takes root in fertile ground -- growing upward even as logic demands it fall.",
        onPartial: "The soil accepts no contradiction. The paradox cannot take root.",
      },
      {
        label: "The Second Bloom",
        requires: { dramaticArc: "rising", stability: "paradox" },
        onMatch: "A second paradox, still rising. The garden grows denser, each impossibility feeding the next. The beauty is undeniable, even as the foundations crack.",
        onPartial: "The second bloom withers before opening.",
      },
      {
        label: "The Wilting",
        requires: { dramaticArc: "falling" },
        mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 },
        onMatch: "The arc turns downward and the garden follows. Every impossible bloom that climbed so fiercely now bends under its own weight. The tragedy is not the falling -- it is that they grew at all.",
        onPartial: "The fall has not yet come. The garden persists against its nature.",
      },
    ],
    onComplete: "The paradox garden lies still. Every flower that defied logic has returned to the earth, and the soil is richer for having held impossibilities.",
    onPartial: "The garden grows unevenly, some blooms still reaching while others have already fallen.",
  },

  {
    name: "The Severed Chord",
    tier: "rare",
    projection: "tragedy",
    beats: [
      {
        label: "The First Note",
        requires: { stability: "resonance" },
        mood: { tone: "crystalline", hue: "#4488ff", intensity: 0.5 },
        onMatch: "Resonance. The threads vibrate in sympathy, producing a note so pure it seems to have always existed. The chord begins.",
        onPartial: "The threads do not sing. Silence holds.",
      },
      {
        label: "The Sustain",
        requires: { stability: "resonance" },
        onMatch: "The resonance holds. Note upon note, the chord builds -- layered, complex, trembling with harmonic beauty. It cannot last. Nothing this perfect ever does.",
        onPartial: "The sustain falters. The resonance cannot maintain itself.",
      },
      {
        label: "The Severance",
        requires: { stability: "resonance", dramaticArc: "falling" },
        mood: { tone: "dissonant", hue: "#ff6600", intensity: 0.7 },
        onMatch: "The chord is cut mid-note. The resonance continues even as the arc falls -- a beautiful sound in a collapsing world. The severance is not the end of the music but its transformation into something unbearably bittersweet.",
        onPartial: "The chord fades naturally. There is no severance, only silence.",
      },
    ],
    onComplete: "The severed chord reverberates in the empty space. Three resonances, each building on the last, cut short by the arc's descent. What remains is not silence but the memory of sound.",
    onPartial: "The chord plays on, not yet severed, not yet complete.",
  },

  {
    name: "Inheritance",
    tier: "mythic",
    projection: "tragedy",
    beats: [
      {
        label: "The Bequest",
        requires: { hasArchetype: true },
        mood: { tone: "warm", hue: "#44aa88", intensity: 0.3 },
        onMatch: "An archetype crystallizes -- the first inheritance. It carries with it the weight of everything that came before, a legacy encoded in pattern and possibility.",
        onPartial: "No archetype forms. There is nothing yet to inherit.",
      },
      {
        label: "The Burden",
        requires: { hasArchetype: true, dramaticArc: "rising" },
        onMatch: "A second archetype emerges while the arc still climbs. Two inheritances now, each demanding attention, each pulling the weave in a different direction. The burden doubles.",
        onPartial: "The arc rises but bears no second inheritance.",
      },
      {
        label: "The Reckoning",
        requires: { dramaticArc: "denouement", hasArchetype: true },
        mood: { tone: "dark", hue: "#aa00ff", intensity: 0.9 },
        onMatch: "In the denouement, a final archetype emerges -- shaped by everything that came before, carrying the weight of both inheritances. The reckoning is not judgment but acknowledgment: this is what was passed down, and this is what it became.",
        onPartial: "The denouement arrives but the final inheritance does not crystallize.",
      },
    ],
    onComplete: "Three archetypes, three inheritances. What was given, what was carried, and what was made of both. The tragedy is not loss but the impossible weight of what persists.",
    onPartial: "The inheritance passes incompletely. Some legacies remain unclaimed.",
  },
];

// --- Projection transforms ---

const PROJECTIONS = [
  {
    name: "The Tapestry",
    id: "tapestry",
    description: "The weave as it is -- threads, crossings, and what emerges.",
    unlocked: true,
    unlocksAt: 0,
    palette: { baseHue: "#888888", defaultIntensity: 0.5 },
    transform: (history) => history,
  },
  {
    name: "Heroic Journey",
    id: "heroic",
    description: "See your weaving as a hero's journey -- call, trials, ordeal, return.",
    unlocked: false,
    unlocksAt: 5,
    palette: { baseHue: "#cc8800", defaultIntensity: 0.6 },
    transform: (history) => history.map((cx, i, all) => ({
      ...cx,
      heroStage: i < all.length * 0.25 ? "call"
               : i < all.length * 0.5  ? "trials"
               : i < all.length * 0.75 ? "ordeal"
               : "return",
    })),
  },
  {
    name: "Tragedy",
    id: "tragedy",
    description: "The arc bends toward sorrow -- or transcendence.",
    unlocked: false,
    unlocksAt: 10,
    palette: { baseHue: "#660033", defaultIntensity: 0.4 },
    transform: (history) => {
      const severityMap = { harmony: 0, resonance: 1, tension: 2, paradox: 3 };
      let peak = 0;
      return history.map((cx, i) => {
        const sev = severityMap[cx.stability] || 0;
        if (sev >= peak) { peak = sev; return { ...cx, dramaticArc: "rising" }; }
        return { ...cx, dramaticArc: i > history.length * 0.7 ? "denouement" : "falling" };
      });
    },
  },
  {
    name: "Reflection",
    id: "reflection",
    description: "Patterns repeat. The loom remembers.",
    unlocked: false,
    unlocksAt: 15,
    palette: { baseHue: "#336699", defaultIntensity: 0.5 },
    transform: (history) => {
      const seen = {};
      return history.map(cx => {
        const key = Object.keys(cx.traits).sort().join(",");
        const count = (seen[key] || 0) + 1;
        seen[key] = count;
        return { ...cx, symmetry: count > 1 ? "echo" : "first", echoCount: count };
      });
    },
  },
];

// --- Axis alignment scoring ---

/**
 * Score how well a crossing's natural mood aligns with a beat's declared mood.
 * Returns { aligned, total, ratio, golden } where golden means >80% alignment.
 * @param {Object} beat - Beat with optional `mood` declaration
 * @param {Object} crossing - Crossing result from weaving history
 * @returns {Object}
 */
function scoreAxisAlignment(beat, crossing) {
  if (!beat.mood) return { aligned: 0, total: 0, ratio: 0, golden: false };
  const mood = beat.mood;
  let total = 0, aligned = 0;
  if (mood.tone) {
    total++;
    if (STABILITY_TONE[crossing.stability] === mood.tone) aligned++;
  }
  if (mood.hue) {
    total++;
    if (STABILITY_HUE[crossing.stability] === mood.hue) aligned++;
  }
  if (mood.intensity !== undefined) {
    total++;
    const natIntensity = { harmony: 0.2, resonance: 0.4, tension: 0.6, paradox: 0.9 };
    if (Math.abs((natIntensity[crossing.stability] || 0.5) - mood.intensity) < 0.25) aligned++;
  }
  const ratio = total === 0 ? 0 : aligned / total;
  return { aligned, total, ratio, golden: ratio > 0.8 };
}

// --- Run evaluation (across projections) ---

/**
 * Evaluate all epics across all unlocked projections for a weaving history.
 * Returns { results, goldenMoments } where results are sorted by ratio desc.
 * @param {Array} history - Array of crossing results
 * @param {Array} projections - Array of projection definitions
 * @param {Array} allEpics - Array of epic definitions
 * @returns {Object}
 */
function evaluateRun(history, projections, allEpics) {
  const results = [];
  let goldenMoments = 0;
  for (const proj of projections) {
    if (!proj.unlocked) continue;
    const transformed = proj.transform(history);
    const projEpics = allEpics.filter(e => e.projection === proj.id);
    const evaluated = evaluateAllEpics(projEpics, transformed);
    for (const r of evaluated) {
      const alignments = r.matched
        .filter(m => m.crossing)
        .map(m => scoreAxisAlignment(m.beat, m.crossing));
      const goldenCount = alignments.filter(a => a.golden).length;
      goldenMoments += goldenCount;
      results.push({ ...r, projection: proj, alignments, goldenCount });
    }
  }
  return { results: results.sort((a, b) => b.ratio - a.ratio), goldenMoments };
}

export {
  beatMatches, beatPartialScore, evaluateEpic, evaluateAllEpics, TEST_EPICS,
  EPICS, PROJECTIONS, STABILITY_TONE, STABILITY_HUE, scoreAxisAlignment, evaluateRun,
};
