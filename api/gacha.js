/**
 * Gacha System Implementation
 *
 * Rarity Distribution:
 * - 5★ (Legendary): 0.6%
 * - 4★ (Epic): 5.1%
 * - 3★ (Rare): 94.3%
 *
 * Pity System:
 * - Soft pity starts at pull 76, ramping linearly to 100% by pull 90
 * - Hard pity guarantees 5★ at pull 90
 * - 4★ guarantee: At least one 4★ every 10 pulls
 *
 * Featured/50-50 Rule:
 * - Each 5★ pull has 50% chance to be featured
 * - If non-featured 5★ received, next 5★ is guaranteed featured
 */

const BASE_5STAR_RATE = 0.006; // 0.6%
const BASE_4STAR_RATE = 0.051; // 5.1%
const BASE_3STAR_RATE = 0.943; // 94.3%

const SOFT_PITY_START = 76;
const HARD_PITY = 90;
const FOUR_STAR_PITY = 10;

const FEATURED_RATE = 0.5; // 50% for featured on 5★

/**
 * Calculate 5★ rate with soft pity
 */
function calculate5StarRate(pullsSince5Star) {
  if (pullsSince5Star < SOFT_PITY_START) {
    return BASE_5STAR_RATE;
  }

  if (pullsSince5Star >= HARD_PITY) {
    return 1.0; // 100% at hard pity
  }

  // Linear ramp from soft pity to hard pity
  const softPityProgress = (pullsSince5Star - SOFT_PITY_START) / (HARD_PITY - SOFT_PITY_START);
  return BASE_5STAR_RATE + (1.0 - BASE_5STAR_RATE) * softPityProgress;
}

/**
 * Perform a single gacha pull
 */
export function performPull(gachaState, bannerItems, featuredItemId) {
  const { pulls_since_5star, pulls_since_4star, guaranteed_featured } = gachaState;

  const rate5Star = calculate5StarRate(pulls_since_5star);
  const is4StarPity = (pulls_since_4star + 1) >= FOUR_STAR_PITY;

  const random = Math.random();

  let rarity;
  let isFeatured = false;

  // Determine rarity
  if (random < rate5Star) {
    // 5★ pull
    rarity = 'legendary';

    // Determine if featured
    if (guaranteed_featured) {
      isFeatured = true;
    } else {
      isFeatured = Math.random() < FEATURED_RATE;
    }

    // Update pity state
    gachaState.pulls_since_5star = 0;
    gachaState.pulls_since_4star = 0;
    gachaState.guaranteed_featured = isFeatured ? false : true;

  } else if (is4StarPity || random < (rate5Star + BASE_4STAR_RATE)) {
    // 4★ pull
    rarity = 'epic';
    gachaState.pulls_since_4star = 0;
    gachaState.pulls_since_5star++;

  } else {
    // 3★ pull
    rarity = 'rare';
    gachaState.pulls_since_4star++;
    gachaState.pulls_since_5star++;
  }

  // Select item from banner pool
  const itemsOfRarity = bannerItems.filter(item => item.rarity === rarity);
  let selectedItem;

  if (rarity === 'legendary' && isFeatured) {
    selectedItem = bannerItems.find(item => item.id === featuredItemId);
  } else {
    // Equal weighting within rarity
    selectedItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  }

  return {
    item: selectedItem,
    rarity,
    isFeatured,
    newState: gachaState
  };
}

/**
 * Perform multiple pulls (10-pull)
 */
export function performMultiPull(gachaState, bannerItems, featuredItemId, count = 10) {
  const results = [];

  for (let i = 0; i < count; i++) {
    const result = performPull(gachaState, bannerItems, featuredItemId);
    results.push(result);
    gachaState = result.newState;
  }

  return {
    results,
    newState: gachaState
  };
}

/**
 * Calculate disenchant value based on rarity
 */
export function getDisenchantValue(rarity) {
  const values = {
    legendary: { gold: 20, silver: 0 },
    epic: { gold: 5, silver: 0 },
    rare: { gold: 0, silver: 15 },
    uncommon: { gold: 0, silver: 1 },
    common: { gold: 0, silver: 0 }
  };

  return values[rarity] || { gold: 0, silver: 0 };
}

export default {
  performPull,
  performMultiPull,
  getDisenchantValue,
  calculate5StarRate
};
