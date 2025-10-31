import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'highrise.db'));

// Initialize database schema
export function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        gold_swap_tokens INTEGER DEFAULT 0,
        silver_swap_tokens INTEGER DEFAULT 0,
        spin_tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Items table (catalog of all possible items)
    db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- closet, consumable, emote, pet, background, furniture
        rarity TEXT NOT NULL, -- legendary, epic, rare, uncommon, common
        image_url TEXT,
        description TEXT
      )
    `);

    // User inventory
    db.run(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        is_favorited BOOLEAN DEFAULT 0,
        acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    // Shop items (gold and silver shops)
    db.run(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        shop_type TEXT NOT NULL, -- gold, silver
        price INTEGER NOT NULL,
        stock_limit INTEGER DEFAULT NULL, -- per-user limit (NULL means unlimited)
        global_stock_limit INTEGER DEFAULT NULL, -- global limit for all users (NULL means unlimited)
        global_stock_purchased INTEGER DEFAULT 0, -- track global purchases
        quantity INTEGER DEFAULT 1, -- quantity per purchase
        item_type TEXT, -- background, epic_item, spin_token, boost_token, live_token, rare_item
        is_featured BOOLEAN DEFAULT 0, -- featured deals show at top
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    // User shop purchases (to track limits)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_shop_purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        shop_item_id INTEGER NOT NULL,
        quantity_purchased INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (shop_item_id) REFERENCES shop_items(id)
      )
    `);

    // Gacha banners
    db.run(`
      CREATE TABLE IF NOT EXISTS gacha_banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        featured_item_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        start_date DATETIME,
        end_date DATETIME,
        FOREIGN KEY (featured_item_id) REFERENCES items(id)
      )
    `);

    // Gacha banner items (items available in each banner)
    db.run(`
      CREATE TABLE IF NOT EXISTS gacha_banner_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        banner_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        rarity TEXT NOT NULL,
        FOREIGN KEY (banner_id) REFERENCES gacha_banners(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    // User gacha state (pity tracking)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_gacha_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        banner_id INTEGER NOT NULL,
        pulls_since_5star INTEGER DEFAULT 0,
        pulls_since_4star INTEGER DEFAULT 0,
        guaranteed_featured BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (banner_id) REFERENCES gacha_banners(id),
        UNIQUE(user_id, banner_id)
      )
    `);

    // Gacha pull history
    db.run(`
      CREATE TABLE IF NOT EXISTS gacha_pulls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        banner_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        rarity TEXT NOT NULL,
        was_featured BOOLEAN DEFAULT 0,
        pull_number INTEGER NOT NULL,
        pulled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (banner_id) REFERENCES gacha_banners(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    // Disenchant history
    db.run(`
      CREATE TABLE IF NOT EXISTS disenchant_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        rarity TEXT NOT NULL,
        gold_earned INTEGER DEFAULT 0,
        silver_earned INTEGER DEFAULT 0,
        disenchanted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);
  });

  return db;
}

export default db;
