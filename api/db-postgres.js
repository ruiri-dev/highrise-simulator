import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        gold_swap_tokens INTEGER DEFAULT 0,
        silver_swap_tokens INTEGER DEFAULT 0,
        spin_tokens INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create items table
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        rarity TEXT NOT NULL,
        image_url TEXT,
        description TEXT
      )
    `;

    // Create user_inventory table
    await sql`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        is_favorited BOOLEAN DEFAULT FALSE,
        acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `;

    // Create shop_items table
    await sql`
      CREATE TABLE IF NOT EXISTS shop_items (
        id SERIAL PRIMARY KEY,
        item_id INTEGER,
        shop_type TEXT NOT NULL,
        price INTEGER NOT NULL,
        stock_limit INTEGER DEFAULT NULL,
        quantity INTEGER DEFAULT 1,
        item_type TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `;

    // Create user_shop_purchases table
    await sql`
      CREATE TABLE IF NOT EXISTS user_shop_purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        shop_item_id INTEGER NOT NULL,
        quantity_purchased INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (shop_item_id) REFERENCES shop_items(id)
      )
    `;

    // Create gacha_banners table
    await sql`
      CREATE TABLE IF NOT EXISTS gacha_banners (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        featured_item_id INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        FOREIGN KEY (featured_item_id) REFERENCES items(id)
      )
    `;

    // Create gacha_banner_items table
    await sql`
      CREATE TABLE IF NOT EXISTS gacha_banner_items (
        id SERIAL PRIMARY KEY,
        banner_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        rarity TEXT NOT NULL,
        FOREIGN KEY (banner_id) REFERENCES gacha_banners(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `;

    // Create user_gacha_state table
    await sql`
      CREATE TABLE IF NOT EXISTS user_gacha_state (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        banner_id INTEGER NOT NULL,
        pulls_since_5star INTEGER DEFAULT 0,
        pulls_since_4star INTEGER DEFAULT 0,
        guaranteed_featured BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (banner_id) REFERENCES gacha_banners(id),
        UNIQUE(user_id, banner_id)
      )
    `;

    // Create gacha_pulls table
    await sql`
      CREATE TABLE IF NOT EXISTS gacha_pulls (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        banner_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        rarity TEXT NOT NULL,
        was_featured BOOLEAN DEFAULT FALSE,
        pull_number INTEGER NOT NULL,
        pulled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (banner_id) REFERENCES gacha_banners(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `;

    // Create disenchant_history table
    await sql`
      CREATE TABLE IF NOT EXISTS disenchant_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        rarity TEXT NOT NULL,
        gold_earned INTEGER DEFAULT 0,
        silver_earned INTEGER DEFAULT 0,
        disenchanted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `;

    console.log('✅ Database schema initialized');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export { sql };
