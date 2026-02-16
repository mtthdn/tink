// archetypes.js — Hidden archetype catalog + matching engine
//
// Each archetype defines required traits. The matcher finds the best fit
// from the unified nature of a crossing. Partial matches score lower.

import { flattenUnified } from "./unify.js";

const CATALOG = [
  // --- Natural phenomena ---
  {
    name: "Aurora",
    required: { bright: true, cold: true },
    tier: "uncommon",
    flavor: "Light bends through frozen air, painting impossible colors.",
    cascade: { cold: true, bright: true },
  },
  {
    name: "Stormglass",
    required: { volatile: true, bright: true, liquid: true },
    tier: "rare",
    flavor: "A vessel of contained lightning, swirling and alive.",
    cascade: { volatile: true, liquid: true },
  },
  {
    name: "Permafrost",
    required: { cold: true, persistent: true, vast: true },
    tier: "uncommon",
    flavor: "What freezes deep enough never thaws.",
    cascade: { cold: true, persistent: true },
  },
  {
    name: "Wildfire",
    required: { hot: true, volatile: true, organic: true },
    tier: "uncommon",
    flavor: "It doesn't burn the forest. It becomes the forest.",
    cascade: { hot: true, ephemeral: true },
  },

  // --- Emotional constructs ---
  {
    name: "Vendetta Engine",
    required: { emotional: true, mechanical: true, persistent: true },
    tier: "rare",
    flavor: "A grudge so precise it runs on clockwork.",
    cascade: { persistent: true, sharp: true },
  },
  {
    name: "Euphoria Cascade",
    required: { emotional: true, bright: true, volatile: true },
    tier: "uncommon",
    flavor: "Joy so intense it becomes unstable.",
    cascade: { bright: true, ephemeral: true },
  },
  {
    name: "Quiet Resolve",
    required: { emotional: true, persistent: true, calm: true },
    tier: "common",
    flavor: "Not loud. Not fast. But absolutely certain.",
    cascade: { calm: true },
  },
  {
    name: "Heartstring",
    required: { emotional: true, organic: true },
    tier: "common",
    flavor: "A connection that pulses with something warm.",
    cascade: { organic: true },
  },

  // --- Mythological archetypes ---
  {
    name: "Web of Wyrd",
    required: { persistent: true, vast: true, sharp: true },
    tier: "rare",
    flavor: "Fate is not a line. It is a net, and every knot remembers.",
    cascade: { persistent: true, vast: true },
  },
  {
    name: "Anansi's Thread",
    required: { sharp: true, organic: true, ephemeral: true },
    tier: "rare",
    flavor: "The trickster's gift: a story that catches you before you catch it.",
    cascade: { sharp: true, ephemeral: true },
  },
  {
    name: "Bifrost Shard",
    required: { bright: true, vast: true, cold: true },
    tier: "rare",
    flavor: "A fragment of the bridge between worlds, still humming.",
    cascade: { bright: true, vast: true },
  },

  // --- Inventions ---
  {
    name: "Perpetual Motion",
    required: { mechanical: true, persistent: true },
    tier: "uncommon",
    flavor: "It shouldn't work. It does. Don't ask why.",
    cascade: { mechanical: true },
  },
  {
    name: "Resonance Crystal",
    required: { bright: true, sharp: true, mechanical: true },
    tier: "uncommon",
    flavor: "Cut to a frequency that makes other things vibrate in sympathy.",
    cascade: { bright: true, sharp: true },
  },
  {
    name: "Living Clockwork",
    required: { mechanical: true, organic: true, persistent: true },
    tier: "rare",
    flavor: "Gears that grow. Springs that breathe. Ticking that sounds like a heartbeat.",
    cascade: { organic: true, mechanical: true },
  },

  // --- Paradox archetypes (require conflict) ---
  {
    name: "Paradox Bloom",
    required: { _minConflicts: 3 },
    tier: "mythic",
    flavor: "A flower that exists in the space between contradictions. It is beautiful and it should not be.",
    cascade: { volatile: true, organic: true, emotional: true },
  },
  {
    name: "Schrodinger's Thread",
    required: { _minConflicts: 2, mechanical: true },
    tier: "rare",
    flavor: "Simultaneously wound and unwound until observed.",
    cascade: { mechanical: true, ephemeral: true },
  },
  {
    name: "Oxymoron Engine",
    required: { _minConflicts: 2, persistent: true },
    tier: "rare",
    flavor: "Runs on impossibility. The more it contradicts, the harder it works.",
    cascade: { persistent: true, volatile: true },
  },

  // --- Abstract ---
  {
    name: "Echo Chamber",
    required: { vast: true, ephemeral: true },
    tier: "common",
    flavor: "A space where whispers return louder than they left.",
    cascade: { vast: true },
  },
  {
    name: "Void Lens",
    required: { vast: true, sharp: true, cold: true },
    tier: "rare",
    flavor: "Focuses emptiness until it cuts.",
    cascade: { cold: true, sharp: true },
  },

  // --- Legendary (cascade-only) ---
  {
    name: "Tapestry of Ages",
    required: { persistent: true, vast: true, emotional: true, bright: true, organic: true },
    cascade: { persistent: true, vast: true, calm: true },
    tier: "legendary",
    flavor: "Every thread that ever was, remembered in a single weave.",
  },
  {
    name: "Paradox Engine",
    required: { _minConflicts: 3, mechanical: true, persistent: true, volatile: true, emotional: true },
    cascade: { volatile: true, mechanical: true, sharp: true },
    tier: "legendary",
    flavor: "It runs on impossibility. Each contradiction powers the next.",
  },
  {
    name: "The Unraveling",
    required: { ephemeral: true, vast: true, sharp: true, volatile: true, emotional: true },
    cascade: { ephemeral: true, volatile: true },
    tier: "legendary",
    flavor: "Not destruction. Transformation so fast it looks like ending.",
  },
];

/**
 * Match a unification result against the archetype catalog.
 * @param {{ unified, stability, conflicts, resonances }} unificationResult
 * @returns {{ match, score, candidates }}
 */
export function matchArchetype(unificationResult) {
  const { unified, conflicts } = unificationResult;
  const flat = flattenUnified(unified);
  const candidates = [];

  for (const archetype of CATALOG) {
    const score = scoreMatch(flat, archetype, conflicts);
    if (score.ratio >= 0.5) {
      candidates.push({ ...archetype, ...score });
    }
  }

  // Sort by specificity-weighted score desc, then tier rarity
  const tierOrder = { legendary: -1, mythic: 0, rare: 1, uncommon: 2, common: 3 };
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (tierOrder[a.tier] ?? 4) - (tierOrder[b.tier] ?? 4);
  });

  const best = candidates[0] || null;

  // Near-misses: candidates that matched well but weren't the best
  const nearMisses = candidates
    .filter((c) => c !== best && c.ratio >= 0.5 && c.ratio < 1.0)
    .map((c) => ({
      name: c.name,
      tier: c.tier,
      matched: c.matched,
      total: c.total,
      ratio: c.ratio,
      missingTraits: Object.keys(c.required)
        .filter((k) => k !== "_minConflicts" && !(k in flat && flat[k] === c.required[k])),
    }))
    .slice(0, 3);

  return {
    match: best ? { name: best.name, tier: best.tier, flavor: best.flavor, cascade: best.cascade || {} } : null,
    score: best ? { matched: best.matched, total: best.total, ratio: best.ratio, score: best.score } : null,
    candidates: candidates.map((c) => ({
      name: c.name,
      tier: c.tier,
      matched: c.matched,
      total: c.total,
      ratio: c.ratio,
      score: c.score,
    })),
    nearMisses,
  };
}

function scoreMatch(flat, archetype, conflicts) {
  const req = archetype.required;
  let matched = 0;
  let total = 0;

  for (const [key, val] of Object.entries(req)) {
    if (key === "_minConflicts") {
      total++;
      if (conflicts.length >= val) matched++;
      continue;
    }
    total++;
    if (key in flat && flat[key] === val) {
      matched++;
    }
  }

  const ratio = total > 0 ? matched / total : 0;
  // Specificity bonus: more matched traits = higher score, ratio gives small boost
  // A 3/3 match (score=3.3) beats a 2/2 match (score=2.2)
  // But a 3/5 partial (score≈3.18) never beats a 3/3 perfect (score=3.3)
  const score = matched * (1 + ratio * 0.1);
  return { matched, total, ratio, score };
}

export function getCatalog() {
  return CATALOG;
}
