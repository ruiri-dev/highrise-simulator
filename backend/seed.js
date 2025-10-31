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
    // Legendary items from Ghost Stories gacha
    { name: 'Phantom Mist', type: 'aura', rarity: 'legendary', description: 'Ethereal phantom mist aura', image_url: 'https://cdn.highrisegame.com/avatar/aura-n_ghoststories2025set1ghostbook.png' },
    { name: 'Skeletal Terror', type: 'shirt', rarity: 'legendary', description: 'Skeleton sweater', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set3skeletonsweater.png' },
    { name: 'Poltergeist Pistol', type: 'handbag', rarity: 'legendary', description: 'Haunted pistol accessory', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_ghoststories2025set1scaryclaws.png' },
    { name: 'Boo\'d Up', type: 'bag', rarity: 'legendary', description: 'Ghost companion', image_url: 'https://cdn.highrisegame.com/avatar/bag-n_ghoststories2025set4whiteghostsuit.png' },
    { name: 'Chill To The Bone', type: 'shirt', rarity: 'legendary', description: 'Skeleton torso', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set3skeletonsweater.png' },
    { name: 'Boo Booties', type: 'shoes', rarity: 'legendary', description: 'Ghost boots', image_url: 'https://cdn.highrisegame.com/avatar/shoes-n_ghoststories2025set5ghostbooties.png' },

    // Keep some original legendary items for shops
    { name: 'Madison Charm Hair', type: 'hair', rarity: 'legendary', description: 'Elegant styled hair', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_hrideas2025nabqthamadisoncharm.png' },
    { name: 'Beautiful Blowout', type: 'hair', rarity: 'legendary', description: 'Voluminous blowout style', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_hrideas2025beautifulllblowout.png' },

    // Epic items (Ghost Stories Set)
    { name: 'Tide Cursed Tresses', type: 'hair', rarity: 'epic', description: 'Oceanic cursed hair', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_ghoststories2025set6hair.png' },
    { name: 'Wailing Tide Eyes', type: 'eye', rarity: 'epic', description: 'Feminine oceanic eyes', image_url: 'https://cdn.highrisegame.com/avatar/eye-n_ghoststories2025set6femeyes.png' },
    { name: 'Purrpuff', type: 'hat', rarity: 'epic', description: 'Smoke cat companion', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set4smokecat.png' },
    { name: 'Muffled Boo', type: 'mouth', rarity: 'epic', description: 'Sealed mouth', image_url: 'https://cdn.highrisegame.com/avatar/mouth-n_ghoststories2025set5boo.png' },
    { name: 'Sealed In Sorrow', type: 'eye', rarity: 'epic', description: 'Bandaged eyes', image_url: 'https://cdn.highrisegame.com/avatar/eye-n_ghoststories2025set3bigscaredeyes.png' },
    { name: 'Levitating Tome Of Curses', type: 'handbag', rarity: 'epic', description: 'Floating spell book', image_url: 'https://cdn.highrisegame.com/avatar/aura-n_ghoststories2025set1ghostbook.png' },
    { name: 'Gothic Doll Dress', type: 'dress', rarity: 'epic', description: 'White gothic dress', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set4whitedress.png' },
    { name: 'The Forgotten Bride', type: 'dress', rarity: 'epic', description: 'Tattered wedding dress', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set1ghostdress.png' },
    { name: 'The Guiding Flame', type: 'accessory', rarity: 'epic', description: 'Candles on posed arm', image_url: 'https://cdn.highrisegame.com/avatar/bag-n_ghoststories2025set2candlesposedarm.png' },
    { name: 'Phantom Purr Blanket', type: 'bag', rarity: 'epic', description: 'Ghost cat blanket', image_url: 'https://cdn.highrisegame.com/avatar/bag-n_ghoststories2025set7blanket.png' },
    { name: 'Last Breath Below', type: 'hat', rarity: 'epic', description: 'Underwater bubbles', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set6bubbles.png' },
    { name: 'Coral Mourning Top', type: 'shirt', rarity: 'epic', description: 'Seaweed bra top', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set6seaweedbra.png' },
    { name: 'Sea Of Echoes', type: 'pants', rarity: 'epic', description: 'Ghostly sea legs', image_url: 'https://cdn.highrisegame.com/avatar/pants-n_ghoststories2025set6ghostlylegs.png' },
    { name: 'Drowned Enchantress', type: 'dress', rarity: 'epic', description: 'Seaweed dress', image_url: 'https://cdn.highrisegame.com/avatar/dress-n_ghoststories2025set6seaweeddress.png' },

    // Rare items (Ghost Stories Set)
    { name: 'Gloom\'s Glare', type: 'hair', rarity: 'rare', description: 'Dark shadowy hair', image_url: 'https://cdn.highrisegame.com/avatar/hair_front-n_ghoststories2025set4messyhair.png' },
    { name: 'The Last Glance', type: 'eye', rarity: 'rare', description: 'Sad glowing eyes', image_url: 'https://cdn.highrisegame.com/avatar/eye-n_ghoststories2025set5shadow.png' },
    { name: 'Shadowed Lips', type: 'mouth', rarity: 'rare', description: 'Black mid pout', image_url: 'https://cdn.highrisegame.com/avatar/mouth-n_ghoststories2025set2blackmidpout.png' },
    { name: 'Glow Of The Deep', type: 'freckle', rarity: 'rare', description: 'Bioluminescent face glow', image_url: 'https://cdn.highrisegame.com/avatar/freckle-n_ghoststories2025set6skinglowface.png' },
    { name: 'Haunted Glow', type: 'freckle', rarity: 'rare', description: 'Ghostly face glow', image_url: 'https://cdn.highrisegame.com/avatar/freckle-n_ghoststories2025set1hauntedface.png' },
    { name: 'Boo Kitty Buddies', type: 'hat', rarity: 'rare', description: 'Tiny ghost kittens', image_url: 'https://cdn.highrisegame.com/avatar/aura-n_ghoststories2025set7tinykittens.png' },
    { name: 'Silly Spirit', type: 'hat', rarity: 'rare', description: 'Cute ghost companion', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set4sillyghost.png' },
    { name: 'Anchor Of Regret', type: 'bag', rarity: 'rare', description: 'Heavy anchor accessory', image_url: 'https://cdn.highrisegame.com/avatar/bag-n_ghoststories2025set6anchor.png' },
    { name: 'Séance Blouse', type: 'shirt', rarity: 'rare', description: 'Ethereal sleeve shirt', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set2sleeveshirt.png' },
    { name: 'Widow\'s Blouse', type: 'shirt', rarity: 'rare', description: 'Puff sleeve mourning shirt', image_url: 'https://cdn.highrisegame.com/avatar/shirt-n_ghoststories2025set2puffsleeveshirt.png' },
    { name: 'Haunted Pleats', type: 'skirt', rarity: 'rare', description: 'Dark pleated skirt', image_url: 'https://cdn.highrisegame.com/avatar/skirt-n_ghoststories2025set3opacityskirt.png' },
    { name: 'Wraith Drape', type: 'skirt', rarity: 'rare', description: 'Ghostly skirt', image_url: 'https://cdn.highrisegame.com/avatar/skirt-n_ghoststories2025set2skirt.png' },
    { name: 'Grave Dandy Shorts', type: 'pants', rarity: 'rare', description: 'Black shorts with suspenders', image_url: 'https://cdn.highrisegame.com/avatar/pants-n_ghoststories2025set2blackshortssuspenders.png' },
    { name: 'Gothic Benediction', type: 'bag', rarity: 'rare', description: 'Cross accessories', image_url: 'https://cdn.highrisegame.com/avatar/bag-n_ghoststories2025set4neckr ibbons.png' },
    { name: 'Midnight Ministry', type: 'handbag', rarity: 'rare', description: 'Cross claw hands', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_ghoststories2025set1scaryclaws.png' },
    { name: 'The Eternal Bride', type: 'hat', rarity: 'rare', description: 'Wedding veil', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set2veil.png' },
    { name: 'Holy Mourner', type: 'hat', rarity: 'rare', description: 'Angelic crown', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set4cutecrown.png' },
    { name: 'Spirit Starfish', type: 'hat', rarity: 'rare', description: 'Ghostly starfish', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set6starfish.png' },
    { name: 'Skelly Meowrmi Night Cap', type: 'hat', rarity: 'rare', description: 'Skeleton cat hat', image_url: 'https://cdn.highrisegame.com/avatar/hat-n_ghoststories2025set5skellysushicat.png' },
    { name: 'Glisten Of The Deep', type: 'tattoo', rarity: 'rare', description: 'Underwater skin glow', image_url: 'https://cdn.highrisegame.com/avatar/tattoo-n_ghoststories2025set6skinglow.png' },
    { name: 'Wraith Claws', type: 'handbag', rarity: 'rare', description: 'Ghostly claw hands', image_url: 'https://cdn.highrisegame.com/avatar/handbag-n_ghoststories2025set1scaryclaws.png' },
    { name: 'Bootiful Socks', type: 'sock', rarity: 'rare', description: 'Ghost socks', image_url: 'https://cdn.highrisegame.com/avatar/sock-n_ghoststories2025set1ghostsocks.png' },
    { name: 'Phantom Kicks', type: 'shoes', rarity: 'rare', description: 'Ghost sneakers', image_url: 'https://cdn.highrisegame.com/avatar/shoes-n_ghoststories2025set1ghostsneakers.png' },
    { name: 'Séance Boots', type: 'shoes', rarity: 'rare', description: 'Off-white spiritual boots', image_url: 'https://cdn.highrisegame.com/avatar/shoes-n_ghoststories2025set2offwhiteboots.png' },
    { name: 'Dark Dream Heels', type: 'shoes', rarity: 'rare', description: 'Purple heels', image_url: 'https://cdn.highrisegame.com/avatar/shoes-n_ghoststories2025set7purpleheels.png' },

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
    { item_name: 'Potion Shop Background', price: 1000, item_type: 'background' },
    { item_name: 'Madison Charm Hair', price: 100, item_type: 'legendary_item', stock_limit: 100 },
    { item_name: 'Beautiful Blowout', price: 100, item_type: 'legendary_item', stock_limit: 100 },
    { item_name: 'Gothic Doll Dress', price: 70, item_type: 'epic_item' },
    { item_name: 'The Guiding Flame', price: 70, item_type: 'epic_item' },
    { item_name: 'Purrpuff', price: 70, item_type: 'epic_item' },
    { item_id: null, price: 5, item_type: 'spin_token' },
    { item_id: null, price: 5, item_type: 'boost_token' },
    { item_id: null, price: 5, item_type: 'live_token' }
  ];

  for (const shopItem of goldShopItems) {
    const itemId = shopItem.item_name ? itemIds[shopItem.item_name] : null;
    await dbRun(
      'INSERT INTO shop_items (item_id, shop_type, price, item_type, stock_limit) VALUES (?, ?, ?, ?, ?)',
      [itemId, 'gold', shopItem.price, shopItem.item_type, shopItem.stock_limit || null]
    );
  }

  console.log(`✅ Created ${goldShopItems.length} gold shop items`);

  // Create shop items - Silver Shop
  const silverShopItems = [
    { item_id: null, price: 75, item_type: 'spin_token', stock_limit: 5, is_featured: true },
    { item_id: null, price: 30, item_type: 'bubble_token', stock_limit: null, quantity: 500 },
    { item_name: 'Séance Boots', price: 75, item_type: 'rare_item' },
    { item_name: 'Grave Dandy Shorts', price: 75, item_type: 'rare_item' },
    { item_name: 'Wraith Drape', price: 75, item_type: 'rare_item' },
    { item_name: 'Haunted Pleats', price: 75, item_type: 'rare_item' },
    { item_name: 'Holy Mourner', price: 75, item_type: 'rare_item' },
    { item_name: 'The Eternal Bride', price: 75, item_type: 'rare_item' }
  ];

  for (const shopItem of silverShopItems) {
    const itemId = shopItem.item_name ? itemIds[shopItem.item_name] : null;
    await dbRun(
      'INSERT INTO shop_items (item_id, shop_type, price, item_type, stock_limit, quantity, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [itemId, 'silver', shopItem.price, shopItem.item_type, shopItem.stock_limit || null, shopItem.quantity || 1, shopItem.is_featured ? 1 : 0]
    );
  }

  console.log(`✅ Created ${silverShopItems.length} silver shop items`);

  // Create gacha banner (Ghost Stories themed)
  const bannerResult = await dbRun(
    'INSERT INTO gacha_banners (name, featured_item_id, is_active) VALUES (?, ?, ?)',
    ['Ghost Stories', itemIds['Phantom Mist'], 1]
  );
  const bannerId = bannerResult.id;

  console.log('✅ Created gacha banner');

  // Add items to banner
  const legendaryBannerItems = [
    'Phantom Mist', 'Skeletal Terror', 'Poltergeist Pistol', 'Boo\'d Up', 'Chill To The Bone', 'Boo Booties'
  ];

  const epicBannerItems = [
    'Tide Cursed Tresses', 'Wailing Tide Eyes', 'Purrpuff', 'Muffled Boo',
    'Sealed In Sorrow', 'Levitating Tome Of Curses', 'Gothic Doll Dress', 'The Forgotten Bride',
    'The Guiding Flame', 'Phantom Purr Blanket', 'Last Breath Below', 'Coral Mourning Top',
    'Sea Of Echoes', 'Drowned Enchantress'
  ];

  const rareBannerItems = [
    'Gloom\'s Glare', 'The Last Glance', 'Shadowed Lips', 'Glow Of The Deep',
    'Haunted Glow', 'Boo Kitty Buddies', 'Silly Spirit', 'Anchor Of Regret',
    'Séance Blouse', 'Widow\'s Blouse', 'Haunted Pleats', 'Wraith Drape',
    'Grave Dandy Shorts', 'Gothic Benediction', 'Midnight Ministry', 'The Eternal Bride',
    'Holy Mourner', 'Spirit Starfish', 'Skelly Meowrmi Night Cap', 'Glisten Of The Deep',
    'Wraith Claws', 'Bootiful Socks', 'Phantom Kicks', 'Séance Boots', 'Dark Dream Heels'
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
    'INSERT INTO users (username, gold_swap_tokens, silver_swap_tokens) VALUES (?, ?, ?)',
    ['demo_user', 7833, 4]
  );
  const userId = userResult.id;

  console.log('✅ Created default user');

  // Add some items to user inventory
  const starterItems = [
    // Rare items
    { name: 'Séance Boots', quantity: 2, favorited: 0 },
    { name: 'Grave Dandy Shorts', quantity: 2, favorited: 0 },
    { name: 'Shadowed Lips', quantity: 2, favorited: 0 },
    { name: 'Wraith Drape', quantity: 1, favorited: 0 },
    { name: 'Holy Mourner', quantity: 1, favorited: 1 },

    // Epic items
    { name: 'The Guiding Flame', quantity: 2, favorited: 0 },
    { name: 'Wailing Tide Eyes', quantity: 2, favorited: 0 },
    { name: 'Gothic Doll Dress', quantity: 1, favorited: 1 },
    { name: 'Purrpuff', quantity: 2, favorited: 0 },
    { name: 'Drowned Enchantress', quantity: 1, favorited: 1 },

    // Additional items
    { name: 'Spirit Starfish', quantity: 2, favorited: 0 },
    { name: 'Anchor Of Regret', quantity: 1, favorited: 0 },
    { name: 'Silly Spirit', quantity: 1, favorited: 0 },
    { name: 'Tide Cursed Tresses', quantity: 1, favorited: 1 }
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
