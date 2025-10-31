import db, { initDatabase } from './database.js';

// Helper function to promisify db methods
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function seed() {
  console.log('🌱 Seeding database...');

  // Initialize database
  initDatabase();

  // Clear existing data
  await dbRun('DELETE FROM user_inventory');
  await dbRun('DELETE FROM shop_items');
  await dbRun('DELETE FROM gacha_banner_items');
  await dbRun('DELETE FROM gacha_banners');
  await dbRun('DELETE FROM items');
  await dbRun('DELETE FROM users');

  console.log('✅ Cleared existing data');

  // Create items from actual Highrise catalog with real image URLs
  const items = [
    // Legendary items from Neonwitch gacha
    { name: 'Plasma Whispers', type: 'aura', rarity: 'legendary', description: 'Electric plasma dragon aura', image_url: 'https://cdn.highrisegame.com/avatar/aura-n_neonwitch2025set1smoke.png' },
    { name: 'Darkwave Elegy', type: 'dress', rarity: 'legendary', description: 'Black neon dress', image_url: 'https://cdn.highrisegame.com/avatar/dress-n_neonwitch2025set2blackneondress.png' },
    { name: 'Witchfire Waves', type: 'hair', rarity: 'legendary', description: 'Purple neon hair', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_neonwitch2025set2neonhair.png' },
    { name: 'Voltage Inferno', type: 'bag', rarity: 'legendary', description: 'Neon fire skull', image_url: 'https://cdn.highrisegame.com/avatar/bag-n_neonwitch2025set2neonfireskull.png' },
    { name: 'Dripping Sorcery Cascade', type: 'hat', rarity: 'legendary', description: 'Melting witch hat', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_neonwitch2025set1witchmelting.png' },
    { name: 'Witch\'s Voltage Staff', type: 'handbag', rarity: 'legendary', description: 'Electric staff', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_neonwitch2025set1staff.png' },

    // Keep some original legendary items for shops
    { name: 'Madison Charm Hair', type: 'hair', rarity: 'legendary', description: 'Elegant styled hair', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_hrideas2025nabqthamadisoncharm.png' },
    { name: 'Beautiful Blowout', type: 'hair', rarity: 'legendary', description: 'Voluminous blowout style', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_hrideas2025beautifulllblowout.png' },

    // Epic items (Neonwitch Set)
    { name: 'Electric Enchant Glare', type: 'eye', rarity: 'epic', description: 'Electric neon eyes', image_url: 'https://cdn.highrisegame.com/avatar/eye-n_neonwitch2025set1glare.png' },
    { name: 'Glimmer Cursed Elbow', type: 'handbag', rarity: 'epic', description: 'Glowing cursed elbow', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_neonwitch2025set1potion.png' },
    { name: 'Witch\'s Plasma Top', type: 'shirt', rarity: 'epic', description: 'Plasma top with fur', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1fluffsleeves.png' },
    { name: 'Witch\'s Plasma Trail', type: 'skirt', rarity: 'epic', description: 'Flowing plasma trail', image_url: 'https://cdn.highrisegame.com/avatar/skirt-n_neonwitch2025set2glitterskirt.png' },
    { name: 'Plasma Flow Cape', type: 'necklace', rarity: 'epic', description: 'Electric cape', image_url: 'https://cdn.highrisegame.com/avatar/necklace-n_neonwitch2025set2neoncape.png' },
    { name: 'Witch\'s Venom Mask', type: 'hat', rarity: 'epic', description: 'Gas mask accessory', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_neonwitch2025set2gasmask.png' },
    { name: 'Glitter Top', type: 'shirt', rarity: 'epic', description: 'Glittery neon top', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set2glittertop.png' },
    { name: 'Glitter Skirt', type: 'skirt', rarity: 'epic', description: 'Sparkly neon skirt', image_url: 'https://cdn.highrisegame.com/avatar/skirt-n_neonwitch2025set2glitterskirt.png' },
    { name: 'Neon Corset', type: 'shirt', rarity: 'epic', description: 'Neon skeleton corset', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set2neoncorset.png' },
    { name: 'Melting Shirt', type: 'shirt', rarity: 'epic', description: 'Dripping neon shirt', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1melting.png' },
    { name: 'Skeleton Shirt', type: 'shirt', rarity: 'epic', description: 'Neon skeleton top', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1skeleton.png' },
    { name: 'Fluff Sleeves', type: 'shirt', rarity: 'epic', description: 'Fluffy purple sleeves', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1fluffsleeves.png' },
    { name: 'Fluff Skirt', type: 'skirt', rarity: 'epic', description: 'Fluffy purple skirt', image_url: 'https://cdn.highrisegame.com/avatar/skirt-n_neonwitch2025set1fluffskirt.png' },
    { name: 'Neon Cape', type: 'necklace', rarity: 'epic', description: 'Electric neon cape', image_url: 'https://cdn.highrisegame.com/avatar/necklace-n_neonwitch2025set2neoncape.png' },

    // Rare items (Neonwitch Set)
    { name: 'Plasma Drip Top', type: 'shirt', rarity: 'rare', description: 'Dripping plasma top', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1melting.png' },
    { name: 'Luminous Remains Shirt', type: 'shirt', rarity: 'rare', description: 'Neon skeleton shirt', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1skeleton.png' },
    { name: 'Arcane Luster Top', type: 'shirt', rarity: 'rare', description: 'Purple fringe top', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_neonwitch2025set1fluffsleeves.png' },
    { name: 'Arcane Luster Skirt', type: 'skirt', rarity: 'rare', description: 'Purple fringe skirt', image_url: 'https://cdn.highrisegame.com/avatar/skirt-n_neonwitch2025set1fluffskirt.png' },
    { name: 'Luminous Remains Pants', type: 'pants', rarity: 'rare', description: 'Neon skeleton pants', image_url: 'https://cdn.highrisegame.com/avatar/pants-n_neonwitch2025set2neonskeletonpants.png' },
    { name: 'Voltage Enchantress Neck', type: 'necklace', rarity: 'rare', description: 'Electric neck accessory', image_url: 'https://cdn.highrisegame.com/avatar/necklace-n_neonwitch2025set2neoncape.png' },
    { name: 'Sorcery Base', type: 'sock', rarity: 'rare', description: 'Black base socks', image_url: 'https://cdn.highrisegame.com/avatar/sock-n_neonwitch2025set1stockings.png' },
    { name: 'Voltage Enchantress Boots', type: 'shoes', rarity: 'rare', description: 'Neon platform boots', image_url: 'https://cdn.highrisegame.com/avatar/shoes-n_neonwitch2025set1spikeboots.png' },
    { name: 'Plasma Drip Thighs', type: 'pants', rarity: 'rare', description: 'Dripping thigh highs', image_url: 'https://cdn.highrisegame.com/avatar/pants-n_neonwitch2025set1panties.png' },
    { name: 'Voltage Enchantress Thighs', type: 'sock', rarity: 'rare', description: 'Electric thigh highs', image_url: 'https://cdn.highrisegame.com/avatar/sock-n_neonwitch2025set1stockings.png' },
    { name: 'Neon Gloves', type: 'gloves', rarity: 'rare', description: 'Electric neon gloves', image_url: 'https://cdn.highrisegame.com/avatar/gloves-n_neonwitch2025set1nails.png' },
    { name: 'Potion Handbag', type: 'handbag', rarity: 'rare', description: 'Magic potion accessory', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_neonwitch2025set1potion.png' },
    { name: 'Witch Glare', type: 'eye', rarity: 'rare', description: 'Intense witch eyes', image_url: 'https://cdn.highrisegame.com/avatar/eye-n_neonwitch2025set1glare.png' },
    { name: 'Neon Smoke', type: 'aura', rarity: 'rare', description: 'Purple neon smoke', image_url: 'https://cdn.highrisegame.com/avatar/aura-n_neonwitch2025set1smoke.png' },
    { name: 'Witch Staff', type: 'handbag', rarity: 'rare', description: 'Magical witch staff', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_neonwitch2025set1staff.png' },

    // Backgrounds - using the potion shop image provided
    { name: 'Potion Shop Background', type: 'background', rarity: 'legendary', description: 'Mystical potion shop interior with neon heart', image_url: '/potion-shop-bg.png' },
    { name: 'Purple Alchemy Background', type: 'background', rarity: 'epic', description: 'Enchanted purple potion workshop', image_url: '/potion-shop-bg.png' }
  ];

  const itemIds = {};
  for (const item of items) {
    const result = await dbRun(
      'INSERT INTO items (name, type, rarity, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [item.name, item.type, item.rarity, item.description, item.image_url]
    );
    itemIds[item.name] = result.id;
  }

  console.log(`✅ Created ${items.length} items`);

  // Create shop items - Gold Shop
  const goldShopItems = [
    // Featured Legendary items with GLOBAL stock limit (for entire userbase)
    { item_name: 'Madison Charm Hair', price: 100, item_type: 'legendary_item', global_stock_limit: 100, is_featured: true },
    { item_name: 'Beautiful Blowout', price: 100, item_type: 'legendary_item', global_stock_limit: 100, is_featured: true },

    // Regular items
    { item_name: 'Potion Shop Background', price: 1000, item_type: 'background' },
    { item_name: 'Glitter Top', price: 70, item_type: 'epic_item' },
    { item_name: 'Neon Corset', price: 70, item_type: 'epic_item' },
    { item_name: 'Witch\'s Venom Mask', price: 70, item_type: 'epic_item' },
    { item_id: null, price: 5, item_type: 'spin_token' },
    { item_id: null, price: 5, item_type: 'boost_token' },
    { item_id: null, price: 5, item_type: 'live_token' }
  ];

  for (const shopItem of goldShopItems) {
    const itemId = shopItem.item_name ? itemIds[shopItem.item_name] : null;
    await dbRun(
      'INSERT INTO shop_items (item_id, shop_type, price, item_type, stock_limit, global_stock_limit, global_stock_purchased, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [itemId, 'gold', shopItem.price, shopItem.item_type, shopItem.stock_limit || null, shopItem.global_stock_limit || null, 0, shopItem.is_featured ? 1 : 0]
    );
  }

  console.log(`✅ Created ${goldShopItems.length} gold shop items`);

  // Create shop items - Silver Shop
  const silverShopItems = [
    { item_id: null, price: 75, item_type: 'spin_token', stock_limit: 5, is_featured: true },
    { item_id: null, price: 30, item_type: 'bubble_token', stock_limit: null, quantity: 500 },
    { item_name: 'Voltage Enchantress Boots', price: 75, item_type: 'rare_item' },
    { item_name: 'Luminous Remains Pants', price: 75, item_type: 'rare_item' },
    { item_name: 'Arcane Luster Skirt', price: 75, item_type: 'rare_item' },
    { item_name: 'Arcane Luster Top', price: 75, item_type: 'rare_item' },
    { item_name: 'Neon Gloves', price: 75, item_type: 'rare_item' },
    { item_name: 'Potion Handbag', price: 75, item_type: 'rare_item' }
  ];

  for (const shopItem of silverShopItems) {
    const itemId = shopItem.item_name ? itemIds[shopItem.item_name] : null;
    await dbRun(
      'INSERT INTO shop_items (item_id, shop_type, price, item_type, stock_limit, global_stock_limit, global_stock_purchased, quantity, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [itemId, 'silver', shopItem.price, shopItem.item_type, shopItem.stock_limit || null, shopItem.global_stock_limit || null, 0, shopItem.quantity || 1, shopItem.is_featured ? 1 : 0]
    );
  }

  console.log(`✅ Created ${silverShopItems.length} silver shop items`);

  // Create gacha banner (Neonwitch themed)
  const bannerResult = await dbRun(
    'INSERT INTO gacha_banners (name, featured_item_id, is_active) VALUES (?, ?, ?)',
    ['Prism Hex', itemIds['Plasma Whispers'], 1]
  );
  const bannerId = bannerResult.id;

  console.log('✅ Created gacha banner');

  // Add items to banner
  const legendaryBannerItems = [
    'Plasma Whispers', 'Darkwave Elegy', 'Witchfire Waves', 'Voltage Inferno',
    'Dripping Sorcery Cascade', 'Witch\'s Voltage Staff'
  ];

  const epicBannerItems = [
    'Electric Enchant Glare', 'Glimmer Cursed Elbow', 'Witch\'s Plasma Top', 'Witch\'s Plasma Trail',
    'Plasma Flow Cape', 'Witch\'s Venom Mask', 'Glitter Top', 'Glitter Skirt',
    'Neon Corset', 'Melting Shirt', 'Skeleton Shirt', 'Fluff Sleeves',
    'Fluff Skirt', 'Neon Cape'
  ];

  const rareBannerItems = [
    'Plasma Drip Top', 'Luminous Remains Shirt', 'Arcane Luster Top', 'Arcane Luster Skirt',
    'Luminous Remains Pants', 'Voltage Enchantress Neck', 'Sorcery Base', 'Voltage Enchantress Boots',
    'Plasma Drip Thighs', 'Voltage Enchantress Thighs', 'Neon Gloves', 'Potion Handbag',
    'Witch Glare', 'Neon Smoke', 'Witch Staff'
  ];

  for (const itemName of legendaryBannerItems) {
    await dbRun(
      'INSERT INTO gacha_banner_items (banner_id, item_id, rarity) VALUES (?, ?, ?)',
      [bannerId, itemIds[itemName], 'legendary']
    );
  }

  for (const itemName of epicBannerItems) {
    await dbRun(
      'INSERT INTO gacha_banner_items (banner_id, item_id, rarity) VALUES (?, ?, ?)',
      [bannerId, itemIds[itemName], 'epic']
    );
  }

  for (const itemName of rareBannerItems) {
    await dbRun(
      'INSERT INTO gacha_banner_items (banner_id, item_id, rarity) VALUES (?, ?, ?)',
      [bannerId, itemIds[itemName], 'rare']
    );
  }

  console.log('✅ Added items to gacha banner');

  // Create default user with some starting items and tokens
  const userResult = await dbRun(
    'INSERT INTO users (username, gold_swap_tokens, silver_swap_tokens, spin_tokens) VALUES (?, ?, ?, ?)',
    ['demo_user', 0, 0, 10]
  );
  const userId = userResult.id;

  console.log('✅ Created default user');

  // Add some items to user inventory
  const starterItems = [
    // Rare items
    { name: 'Voltage Enchantress Boots', quantity: 2, favorited: 0 },
    { name: 'Luminous Remains Pants', quantity: 2, favorited: 0 },
    { name: 'Plasma Drip Top', quantity: 2, favorited: 0 },
    { name: 'Arcane Luster Skirt', quantity: 1, favorited: 0 },
    { name: 'Neon Gloves', quantity: 1, favorited: 1 },

    // Epic items
    { name: 'Glitter Top', quantity: 2, favorited: 0 },
    { name: 'Electric Enchant Glare', quantity: 2, favorited: 0 },
    { name: 'Neon Corset', quantity: 1, favorited: 1 },
    { name: 'Witch\'s Venom Mask', quantity: 2, favorited: 0 },
    { name: 'Fluff Skirt', quantity: 1, favorited: 1 },

    // Additional items
    { name: 'Potion Handbag', quantity: 2, favorited: 0 },
    { name: 'Witch Staff', quantity: 1, favorited: 0 },
    { name: 'Neon Smoke', quantity: 1, favorited: 0 },
    { name: 'Witch Glare', quantity: 1, favorited: 1 }
  ];

  // Add items as separate entries (no stacking)
  for (const starter of starterItems) {
    const itemId = itemIds[starter.name];
    // Create separate entries for each duplicate
    for (let i = 0; i < starter.quantity; i++) {
      // Only the first item of duplicates gets favorited (if specified)
      const shouldFavorite = i === 0 ? starter.favorited : 0;
      await dbRun(
        'INSERT INTO user_inventory (user_id, item_id, quantity, is_favorited) VALUES (?, ?, ?, ?)',
        [userId, itemId, 1, shouldFavorite]
      );
    }
  }

  console.log(`✅ Added ${starterItems.length} items to user inventory`);

  console.log('🎉 Database seeding complete!');
  process.exit(0);
}

seed().catch(error => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
