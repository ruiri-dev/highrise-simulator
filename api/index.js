import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db, { initDatabase } from './database.js';
import { performPull, performMultiPull, getDisenchantValue } from './gacha.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initDatabase();

// Helper function to promisify db methods
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// ==================== USER ROUTES ====================

// Get or create user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;

    let user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      const result = await dbRun('INSERT INTO users (username) VALUES (?)', [username]);
      user = await dbGet('SELECT * FROM users WHERE id = ?', [result.id]);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== INVENTORY ROUTES ====================

// Get user inventory
app.get('/api/inventory/:userId', async (req, res) => {
  try {
    const inventory = await dbAll(`
      SELECT ui.*, i.name, i.type, i.rarity, i.image_url, i.description
      FROM user_inventory ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.user_id = ?
      ORDER BY i.rarity DESC, i.name ASC
    `, [req.params.userId]);

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite status
app.patch('/api/inventory/:inventoryId/favorite', async (req, res) => {
  try {
    const { is_favorited } = req.body;
    await dbRun(
      'UPDATE user_inventory SET is_favorited = ? WHERE id = ?',
      [is_favorited ? 1 : 0, req.params.inventoryId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disenchant items
app.post('/api/inventory/disenchant', async (req, res) => {
  try {
    const { userId, inventoryIds } = req.body;

    // Get items to disenchant
    const items = await dbAll(`
      SELECT ui.id, ui.item_id, i.rarity
      FROM user_inventory ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.id IN (${inventoryIds.map(() => '?').join(',')})
      AND ui.user_id = ?
    `, [...inventoryIds, userId]);

    // Calculate total swap tokens (each item counts as 1)
    let totalGold = 0;
    let totalSilver = 0;

    for (const item of items) {
      const value = getDisenchantValue(item.rarity);
      totalGold += value.gold;
      totalSilver += value.silver;

      // Log to disenchant history
      await dbRun(`
        INSERT INTO disenchant_history (user_id, item_id, rarity, gold_earned, silver_earned)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, item.item_id, item.rarity, value.gold, value.silver]);
    }

    // Update user tokens
    await dbRun(`
      UPDATE users
      SET gold_swap_tokens = gold_swap_tokens + ?,
          silver_swap_tokens = silver_swap_tokens + ?
      WHERE id = ?
    `, [totalGold, totalSilver, userId]);

    // Delete items from inventory
    await dbRun(`
      DELETE FROM user_inventory
      WHERE id IN (${inventoryIds.map(() => '?').join(',')})
    `, inventoryIds);

    // Get updated user
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      goldEarned: totalGold,
      silverEarned: totalSilver,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mass disenchant duplicates
app.post('/api/inventory/disenchant/duplicates', async (req, res) => {
  try {
    const { userId, keepFavorited } = req.body;

    // Get all inventory items grouped by item_id
    const inventory = await dbAll(`
      SELECT ui.id, ui.item_id, ui.quantity, ui.is_favorited, i.rarity
      FROM user_inventory ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.user_id = ?
    `, [userId]);

    // Group by item_id
    const itemGroups = {};
    for (const item of inventory) {
      if (!itemGroups[item.item_id]) {
        itemGroups[item.item_id] = [];
      }
      itemGroups[item.item_id].push(item);
    }

    // Find duplicates to disenchant
    const toDisenchant = [];
    for (const itemId in itemGroups) {
      const items = itemGroups[itemId];
      if (items.length > 1) {
        // Keep first item (or favorited one), disenchant the rest
        const sorted = items.sort((a, b) => {
          if (keepFavorited) {
            if (a.is_favorited && !b.is_favorited) return -1;
            if (!a.is_favorited && b.is_favorited) return 1;
          }
          return a.id - b.id;
        });

        toDisenchant.push(...sorted.slice(1).map(item => item.id));
      }
    }

    if (toDisenchant.length === 0) {
      return res.json({
        success: true,
        goldEarned: 0,
        silverEarned: 0,
        itemsDisenchanted: 0
      });
    }

    // Disenchant the duplicates
    const result = await fetch(`http://localhost:${PORT}/api/inventory/disenchant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, inventoryIds: toDisenchant })
    }).then(r => r.json());

    res.json({
      ...result,
      itemsDisenchanted: toDisenchant.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SHOP ROUTES ====================

// Get shop items
app.get('/api/shop/:shopType', async (req, res) => {
  try {
    const { shopType } = req.params; // 'gold' or 'silver'

    const items = await dbAll(`
      SELECT si.*, i.name, i.type, i.rarity, i.image_url, i.description
      FROM shop_items si
      LEFT JOIN items i ON si.item_id = i.id
      WHERE si.shop_type = ?
    `, [shopType]);

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase shop item
app.post('/api/shop/purchase', async (req, res) => {
  try {
    const { userId, shopItemId, quantity = 1 } = req.body;

    // Get shop item
    const shopItem = await dbGet('SELECT * FROM shop_items WHERE id = ?', [shopItemId]);
    if (!shopItem) {
      return res.status(404).json({ error: 'Shop item not found' });
    }

    // Get user
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough tokens
    const totalCost = shopItem.price * quantity;
    const tokenField = shopItem.shop_type === 'gold' ? 'gold_swap_tokens' : 'silver_swap_tokens';

    if (user[tokenField] < totalCost) {
      return res.status(400).json({ error: 'Insufficient tokens' });
    }

    // Check stock limit
    if (shopItem.stock_limit !== null) {
      const purchased = await dbGet(`
        SELECT COALESCE(quantity_purchased, 0) as quantity_purchased
        FROM user_shop_purchases
        WHERE user_id = ? AND shop_item_id = ?
      `, [userId, shopItemId]);

      const currentPurchased = purchased ? purchased.quantity_purchased : 0;
      if (currentPurchased + quantity > shopItem.stock_limit) {
        return res.status(400).json({ error: 'Stock limit exceeded' });
      }

      // Update or insert purchase record
      if (purchased) {
        await dbRun(`
          UPDATE user_shop_purchases
          SET quantity_purchased = quantity_purchased + ?
          WHERE user_id = ? AND shop_item_id = ?
        `, [quantity, userId, shopItemId]);
      } else {
        await dbRun(`
          INSERT INTO user_shop_purchases (user_id, shop_item_id, quantity_purchased)
          VALUES (?, ?, ?)
        `, [userId, shopItemId, quantity]);
      }
    }

    // Deduct tokens
    await dbRun(`
      UPDATE users
      SET ${tokenField} = ${tokenField} - ?
      WHERE id = ?
    `, [totalCost, userId]);

    // Add item to inventory (if it's an actual item)
    if (shopItem.item_id) {
      // Get item details to check rarity
      const item = await dbGet(`SELECT * FROM items WHERE id = ?`, [shopItem.item_id]);

      const existing = await dbGet(`
        SELECT * FROM user_inventory
        WHERE user_id = ? AND item_id = ?
      `, [userId, shopItem.item_id]);

      const shouldFavorite = !existing && (item.rarity === 'legendary' || item.rarity === 'epic');

      if (existing) {
        // Add as new entry (no stacking), duplicate is NOT favorited
        await dbRun(`
          INSERT INTO user_inventory (user_id, item_id, quantity, is_favorited)
          VALUES (?, ?, 1, 0)
        `, [userId, shopItem.item_id]);
      } else {
        // First time getting this item, favorite if epic/legendary
        await dbRun(`
          INSERT INTO user_inventory (user_id, item_id, quantity, is_favorited)
          VALUES (?, ?, 1, ?)
        `, [userId, shopItem.item_id, shouldFavorite ? 1 : 0]);
      }
    }

    // Give spin tokens if purchasing spin_token item
    if (shopItem.item_type === 'spin_token') {
      const tokensToGive = (shopItem.quantity || 1) * quantity;
      await dbRun(`
        UPDATE users
        SET spin_tokens = spin_tokens + ?
        WHERE id = ?
      `, [tokensToGive, userId]);
    }

    // Get updated user
    const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user shop purchase limits
app.get('/api/shop/purchases/:userId', async (req, res) => {
  try {
    const purchases = await dbAll(`
      SELECT shop_item_id, quantity_purchased
      FROM user_shop_purchases
      WHERE user_id = ?
    `, [req.params.userId]);

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GACHA ROUTES ====================

// Get active banner
app.get('/api/gacha/banner', async (req, res) => {
  try {
    const banner = await dbGet(`
      SELECT b.*, i.name as featured_name, i.rarity, i.image_url
      FROM gacha_banners b
      LEFT JOIN items i ON b.featured_item_id = i.id
      WHERE b.is_active = 1
      ORDER BY b.id DESC
      LIMIT 1
    `);

    if (!banner) {
      return res.status(404).json({ error: 'No active banner' });
    }

    // Get banner items
    const items = await dbAll(`
      SELECT gbi.*, i.name, i.type, i.image_url, i.description
      FROM gacha_banner_items gbi
      JOIN items i ON gbi.item_id = i.id
      WHERE gbi.banner_id = ?
    `, [banner.id]);

    res.json({
      banner,
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user gacha state
app.get('/api/gacha/state/:userId/:bannerId', async (req, res) => {
  try {
    const { userId, bannerId } = req.params;

    let state = await dbGet(`
      SELECT * FROM user_gacha_state
      WHERE user_id = ? AND banner_id = ?
    `, [userId, bannerId]);

    if (!state) {
      // Initialize state
      await dbRun(`
        INSERT INTO user_gacha_state (user_id, banner_id)
        VALUES (?, ?)
      `, [userId, bannerId]);

      state = await dbGet(`
        SELECT * FROM user_gacha_state
        WHERE user_id = ? AND banner_id = ?
      `, [userId, bannerId]);
    }

    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Perform gacha pull
app.post('/api/gacha/pull', async (req, res) => {
  try {
    const { userId, bannerId, count = 1 } = req.body;

    // Get user
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough spin tokens (1 spin token = 1 pull)
    if (user.spin_tokens < count) {
      return res.status(400).json({ error: `Not enough spin tokens. Need ${count}, have ${user.spin_tokens}` });
    }

    // Deduct spin tokens
    await dbRun(`
      UPDATE users
      SET spin_tokens = spin_tokens - ?
      WHERE id = ?
    `, [count, userId]);

    // Get banner and items
    const banner = await dbGet('SELECT * FROM gacha_banners WHERE id = ?', [bannerId]);
    const bannerItems = await dbAll(`
      SELECT gbi.*, i.*
      FROM gacha_banner_items gbi
      JOIN items i ON gbi.item_id = i.id
      WHERE gbi.banner_id = ?
    `, [bannerId]);

    // Get user gacha state
    let gachaState = await dbGet(`
      SELECT * FROM user_gacha_state
      WHERE user_id = ? AND banner_id = ?
    `, [userId, bannerId]);

    if (!gachaState) {
      await dbRun(`
        INSERT INTO user_gacha_state (user_id, banner_id)
        VALUES (?, ?)
      `, [userId, bannerId]);

      gachaState = await dbGet(`
        SELECT * FROM user_gacha_state
        WHERE user_id = ? AND banner_id = ?
      `, [userId, bannerId]);
    }

    // Perform pulls
    let results;
    if (count === 1) {
      const result = performPull(gachaState, bannerItems, banner.featured_item_id);
      results = { results: [result], newState: result.newState };
    } else {
      results = performMultiPull(gachaState, bannerItems, banner.featured_item_id, count);
    }

    // Update gacha state
    await dbRun(`
      UPDATE user_gacha_state
      SET pulls_since_5star = ?,
          pulls_since_4star = ?,
          guaranteed_featured = ?
      WHERE user_id = ? AND banner_id = ?
    `, [
      results.newState.pulls_since_5star,
      results.newState.pulls_since_4star,
      results.newState.guaranteed_featured ? 1 : 0,
      userId,
      bannerId
    ]);

    // Add items to inventory and record pulls
    for (let i = 0; i < results.results.length; i++) {
      const result = results.results[i];

      // Add to inventory
      const existing = await dbGet(`
        SELECT * FROM user_inventory
        WHERE user_id = ? AND item_id = ?
      `, [userId, result.item.id]);

      const shouldFavorite = !existing && (result.rarity === 'legendary' || result.rarity === 'epic');

      if (existing) {
        // Add as new entry (no stacking), duplicate is NOT favorited
        await dbRun(`
          INSERT INTO user_inventory (user_id, item_id, quantity, is_favorited)
          VALUES (?, ?, 1, 0)
        `, [userId, result.item.id]);
      } else {
        // First time getting this item, favorite if epic/legendary
        await dbRun(`
          INSERT INTO user_inventory (user_id, item_id, quantity, is_favorited)
          VALUES (?, ?, 1, ?)
        `, [userId, result.item.id, shouldFavorite ? 1 : 0]);
      }

      // Record pull
      await dbRun(`
        INSERT INTO gacha_pulls (user_id, banner_id, item_id, rarity, was_featured, pull_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, bannerId, result.item.id, result.rarity, result.isFeatured ? 1 : 0, i + 1]);
    }

    res.json({
      success: true,
      results: results.results,
      newState: results.newState
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ITEMS ROUTES ====================

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await dbAll('SELECT * FROM items ORDER BY rarity DESC, name ASC');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEV TOOLS ROUTES ====================

// Add tokens (dev only)
app.post('/api/dev/add-tokens', async (req, res) => {
  try {
    const { userId, goldTokens = 0, silverTokens = 0 } = req.body;

    await dbRun(`
      UPDATE users
      SET gold_swap_tokens = gold_swap_tokens + ?,
          silver_swap_tokens = silver_swap_tokens + ?
      WHERE id = ?
    `, [goldTokens, silverTokens, userId]);

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset inventory (dev only)
app.post('/api/dev/reset-inventory', async (req, res) => {
  try {
    const { userId } = req.body;

    // Delete all inventory
    await dbRun('DELETE FROM user_inventory WHERE user_id = ?', [userId]);

    // Get starter items from seed data
    const starterItems = [
      { name: 'Rogue\'s Halo', quantity: 4, favorited: 0 },
      { name: 'VL Courtesy', quantity: 4, favorited: 0 },
      { name: 'Séance Boots', quantity: 2, favorited: 0 },
      { name: 'Grave Dandy Shorts', quantity: 2, favorited: 0 },
      { name: 'Shadowed Lips', quantity: 2, favorited: 0 },
      { name: 'Last Offering', quantity: 1, favorited: 0 },
      { name: 'Wraith Drape', quantity: 1, favorited: 0 },
      { name: 'Holy Mourner', quantity: 1, favorited: 1 },
      { name: 'Haunting Stare', quantity: 1, favorited: 1 },
      { name: 'The Guiding Flame', quantity: 2, favorited: 0 },
      { name: 'Weeping Veil', quantity: 2, favorited: 0 },
      { name: 'Whispers In My Hair', quantity: 1, favorited: 1 },
      { name: 'Wailing Tide Eyes', quantity: 2, favorited: 0 },
      { name: 'Gothic Doll Dress', quantity: 1, favorited: 1 },
      { name: 'Purrpuff', quantity: 2, favorited: 0 },
      { name: 'Drowned Enchantress', quantity: 1, favorited: 1 },
      { name: 'Spirit Starfish', quantity: 2, favorited: 0 },
      { name: 'Anchor Of Regret', quantity: 1, favorited: 0 },
      { name: 'Silly Spirit', quantity: 1, favorited: 0 },
      { name: 'Tide Cursed Tresses', quantity: 1, favorited: 1 }
    ];

    // Re-add starter items as separate entries
    for (const starter of starterItems) {
      const item = await dbGet('SELECT id FROM items WHERE name = ?', [starter.name]);
      if (item) {
        // Create separate entries for each duplicate
        for (let i = 0; i < starter.quantity; i++) {
          // Only the first item of duplicates gets favorited (if specified)
          const shouldFavorite = i === 0 ? starter.favorited : 0;
          await dbRun(`
            INSERT INTO user_inventory (user_id, item_id, quantity, is_favorited)
            VALUES (?, ?, 1, ?)
          `, [userId, item.id, shouldFavorite]);
        }
      }
    }

    res.json({ success: true, message: 'Inventory reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset pity counters (dev only)
app.post('/api/dev/reset-pity', async (req, res) => {
  try {
    const { userId } = req.body;

    await dbRun(`
      UPDATE user_gacha_state
      SET pulls_since_5star = 0,
          pulls_since_4star = 0,
          guaranteed_featured = 0
      WHERE user_id = ?
    `, [userId]);

    res.json({ success: true, message: 'Pity counters reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATISTICS ROUTES ====================

// Get user statistics
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get tokens earned from disenchant history
    const tokensResult = await dbGet(`
      SELECT
        COALESCE(SUM(gold_earned), 0) as gold,
        COALESCE(SUM(silver_earned), 0) as silver
      FROM disenchant_history
      WHERE user_id = ?
    `, [userId]);

    // Get items disenchanted by rarity
    const disenchantedByRarity = await dbAll(`
      SELECT rarity, COUNT(*) as count
      FROM disenchant_history
      WHERE user_id = ?
      GROUP BY rarity
    `, [userId]);

    const disenchanted = {
      legendary: 0,
      epic: 0,
      rare: 0,
      uncommon: 0,
      common: 0
    };

    disenchantedByRarity.forEach(row => {
      disenchanted[row.rarity] = row.count;
    });

    const totalDisenchanted = Object.values(disenchanted).reduce((sum, count) => sum + count, 0);

    // Get current inventory count
    const inventoryResult = await dbGet(`
      SELECT COUNT(*) as count
      FROM user_inventory
      WHERE user_id = ?
    `, [userId]);

    // Get gacha pull statistics
    const gachaPullsResult = await dbGet(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN rarity = 'legendary' THEN 1 ELSE 0 END) as legendary,
        SUM(CASE WHEN rarity = 'epic' THEN 1 ELSE 0 END) as epic
      FROM gacha_pulls
      WHERE user_id = ?
    `, [userId]);

    res.json({
      tokensEarned: {
        gold: tokensResult.gold,
        silver: tokensResult.silver
      },
      disenchanted,
      totalDisenchanted,
      currentInventory: inventoryResult.count,
      gachaPulls: {
        total: gachaPullsResult.total || 0,
        legendary: gachaPullsResult.legendary || 0,
        epic: gachaPullsResult.epic || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel serverless
export default app;
