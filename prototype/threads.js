// threads.js — Library of sample threads for tink
//
// Each thread has: name, nature (trait-struct), rarity, flavor text

const THREADS = [
  // --- Physical (common) ---
  { name: "Ember", nature: { hot: true, bright: true, ephemeral: true }, rarity: "common", flavor: "A spark remembering the fire it came from." },
  { name: "Glacier", nature: { cold: true, vast: true, persistent: true }, rarity: "common", flavor: "Patience measured in millennia." },
  { name: "Clockwork", nature: { mechanical: true, persistent: true, sharp: true }, rarity: "common", flavor: "Every tooth knows its neighbor." },
  { name: "Tidepool", nature: { liquid: true, organic: true, calm: true }, rarity: "common", flavor: "A small world, complete." },
  { name: "Obsidian", nature: { sharp: true, cold: true, persistent: true }, rarity: "common", flavor: "Glass born from violence, cooled into patience." },
  { name: "Pollen", nature: { organic: true, ephemeral: true, bright: true }, rarity: "common", flavor: "Carries futures on the wind." },
  { name: "Lodestone", nature: { mechanical: true, persistent: true }, rarity: "common", flavor: "It points. It always points." },
  { name: "Dewdrop", nature: { liquid: true, bright: true, ephemeral: true }, rarity: "common", flavor: "A lens that lasts until the sun finds it." },
  { name: "Granite", nature: { vast: true, persistent: true, calm: true }, rarity: "common", flavor: "The mountain does not argue." },
  { name: "Spark", nature: { hot: true, volatile: true, ephemeral: true }, rarity: "common", flavor: "A beginning that doesn't know it yet." },

  // --- Emotional (uncommon) ---
  { name: "Grudge", nature: { emotional: true, persistent: true, hot: true }, rarity: "uncommon", flavor: "It remembers everything. Forgives nothing." },
  { name: "Joy", nature: { emotional: true, bright: true, volatile: true }, rarity: "uncommon", flavor: "Difficult to hold. Impossible to fake." },
  { name: "Doubt", nature: { emotional: true, cold: true, sharp: true }, rarity: "uncommon", flavor: "The blade you sharpen against yourself." },
  { name: "Nostalgia", nature: { emotional: true, ephemeral: true, calm: true }, rarity: "uncommon", flavor: "The past, edited for your comfort." },
  { name: "Fury", nature: { emotional: true, hot: true, volatile: true }, rarity: "uncommon", flavor: "Burns clean. Burns everything." },
  { name: "Awe", nature: { emotional: true, vast: true, bright: true }, rarity: "uncommon", flavor: "The feeling of smallness that makes you larger." },
  { name: "Dread", nature: { emotional: true, cold: true, persistent: true, vast: true }, rarity: "uncommon", flavor: "The weight of a future you can already see." },
  { name: "Whimsy", nature: { emotional: true, volatile: true, bright: true, organic: true }, rarity: "uncommon", flavor: "Rules? What rules?" },
  { name: "Patience", nature: { emotional: true, persistent: true, calm: true }, rarity: "uncommon", flavor: "Not waiting. Choosing when." },
  { name: "Spite", nature: { emotional: true, sharp: true, hot: true, persistent: true }, rarity: "uncommon", flavor: "Revenge's quieter, more efficient sibling." },

  // --- Abstract (rare) ---
  { name: "Paradox", nature: { volatile: true, persistent: true, hot: true, cold: true }, rarity: "rare", flavor: "It insists on being two things at once." },
  { name: "Echo", nature: { ephemeral: true, vast: true, mechanical: true }, rarity: "rare", flavor: "A shape left by something that already passed." },
  { name: "Silence", nature: { calm: true, vast: true, cold: true }, rarity: "rare", flavor: "Not the absence of sound. The presence of nothing." },
  { name: "Catalyst", nature: { volatile: true, sharp: true, organic: true }, rarity: "rare", flavor: "Unchanged by the change it causes." },
  { name: "Recursion", nature: { mechanical: true, persistent: true, vast: true }, rarity: "rare", flavor: "It contains itself, which contains itself, which—" },
  { name: "Mirage", nature: { bright: true, hot: true, vast: true, ephemeral: true }, rarity: "rare", flavor: "Real enough to walk toward. Gone when you arrive." },
  { name: "Entropy", nature: { vast: true, persistent: true, cold: true, volatile: true }, rarity: "rare", flavor: "Everything falls apart. This is how." },
  { name: "Anima", nature: { organic: true, emotional: true, bright: true, persistent: true }, rarity: "rare", flavor: "The part that makes the rest alive." },
  { name: "Void", nature: { vast: true, cold: true, calm: true, persistent: true }, rarity: "rare", flavor: "Not empty. Full of nothing." },
  { name: "Ouroboros", nature: { organic: true, mechanical: true, persistent: true, volatile: true }, rarity: "rare", flavor: "The end that is the beginning that is the end." },
];

/**
 * Get all threads.
 */
export function getAllThreads() {
  return THREADS;
}

/**
 * Get a random selection of threads.
 * @param {number} count
 */
export function randomThreads(count) {
  const shuffled = [...THREADS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get threads by rarity.
 * @param {"common"|"uncommon"|"rare"} rarity
 */
export function getByRarity(rarity) {
  return THREADS.filter((t) => t.rarity === rarity);
}
