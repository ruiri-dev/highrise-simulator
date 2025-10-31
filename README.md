# Highrise Simulator

A full-stack web application that simulates the Highrise game with inventory management, shops, and gacha system. Features a complete backend API with SQLite database and a React frontend matching the Highrise mobile UI.

## Features

### 📦 Item Inventory System
- **Disenchant Mode**: Mass disenchant items for swap tokens
  - Disenchant specific selected items
  - Auto-disenchant all duplicates (keeps first/favorited)
  - Disenchant all unfavorited items
- **Auto-favorite**: Legendaries and epics automatically favorited
- **Duplicate detection**: Duplicate items auto-unfavorited
- **Swap token rewards**:
  - Legendary: 20 gold tokens
  - Epic: 5 gold tokens
  - Rare: 15 silver tokens
  - Uncommon: 1 silver token
  - Common: 0 tokens (declutter only)

### 🛍️ Swap Token Shops
**Gold Swap Shop**:
- Background: 1,000 tokens
- 5 Epic items: 70 tokens each
- Spin tokens: 5 tokens
- Boost tokens: 5 tokens
- Live tokens: 5 tokens

**Silver Swap Shop**:
- Spin tokens (limit 5): 75 tokens each
- Epic item (limit 1): 525 tokens

### 🎰 Gacha System (Grab)
**Rarity Distribution**:
- 5★ (Legendary): 0.6%
- 4★ (Epic): 5.1%
- 3★ (Rare): 94.3%

**Pity System**:
- Soft pity: Starts at pull 76, ramps linearly to 100% by pull 90
- Hard pity: Guaranteed 5★ at pull 90
- 4★ guarantee: At least one 4★ every 10 pulls
- Pity resets after any 5★ or 4★ pull

**Featured/50-50 Rule**:
- Each 5★ pull has 50% chance to be featured item
- If non-featured 5★ received, next 5★ is guaranteed featured
- Featured flag carries over between sessions

## Tech Stack
- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite
- **Database**: SQLite with comprehensive schema
- **API**: RESTful API with full CRUD operations

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### 1. Fix npm permissions (if needed)
If you encounter permission errors:
```bash
sudo chown -R 501:20 "/Users/ruijia/.npm"
# Or use the user ID from the error message
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install express cors body-parser sqlite3

# Seed the database with placeholder data
npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install vite react react-dom @vitejs/plugin-react

# Start the frontend dev server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Access the Application
Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
highrise-simulator/
├── backend/
│   ├── server.js           # Express API server
│   ├── database.js         # SQLite database schema
│   ├── gacha.js           # Gacha system logic
│   ├── seed.js            # Database seeding script
│   ├── package.json
│   └── highrise.db        # SQLite database (created on first run)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # React entry point
│   │   ├── index.css      # Global styles
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   └── pages/
│   │       ├── Shop.jsx          # Shop page
│   │       ├── Inventory.jsx     # Inventory/disenchant page
│   │       ├── Gacha.jsx         # Gacha pull page
│   │       └── SwapCollection.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API Endpoints

### Users
- `POST /api/users` - Create or get user
- `GET /api/users/:id` - Get user by ID

### Inventory
- `GET /api/inventory/:userId` - Get user inventory
- `PATCH /api/inventory/:inventoryId/favorite` - Toggle favorite
- `POST /api/inventory/disenchant` - Disenchant selected items
- `POST /api/inventory/disenchant/duplicates` - Mass disenchant duplicates

### Shop
- `GET /api/shop/:shopType` - Get shop items (gold/silver)
- `POST /api/shop/purchase` - Purchase shop item
- `GET /api/shop/purchases/:userId` - Get user purchase limits

### Gacha
- `GET /api/gacha/banner` - Get active banner
- `GET /api/gacha/state/:userId/:bannerId` - Get user gacha state
- `POST /api/gacha/pull` - Perform gacha pull(s)

### Items
- `GET /api/items` - Get all items

## Database Schema

**Tables**:
- `users` - User accounts and swap token balances
- `items` - Item catalog
- `user_inventory` - User's owned items
- `shop_items` - Items available in shops
- `user_shop_purchases` - Purchase limit tracking
- `gacha_banners` - Gacha banner configurations
- `gacha_banner_items` - Items in each banner
- `user_gacha_state` - Pity tracking per user/banner
- `gacha_pulls` - Pull history

## Default Data

The seed script creates:
- 40+ placeholder items (legendary to common)
- Gold and silver shop inventories
- Active gacha banner "Coven Call"
- Demo user with 7,833 gold and 4 silver tokens
- 20+ starter items in demo user inventory

## Usage

### Inventory Management
1. Navigate to "Closet" tab
2. Click "Disenchant Mode" to enter disenchant mode
3. Select items individually OR use quick actions:
   - "All Duplicates" - Keeps one copy of each item
   - "All Unfavorited" - Disenchants everything not favorited
4. Click "Disenchant Selected" to confirm
5. Earn gold/silver swap tokens based on rarity

### Shopping
1. Navigate to "Shop" tab
2. Toggle between Gold and Silver shops
3. Purchase items with your swap tokens
4. Limited items show purchase progress (e.g., 2/5)

### Gacha Pulls
1. Navigate to "Grabs" tab
2. View current pity counters and featured status
3. Click "Spin x1" (200 coins) or "Spin x10" (2,000 coins)
4. View pull results
5. Items automatically added to inventory
6. Legendaries and epics auto-favorited

## Development Notes

- Frontend uses mobile-first responsive design
- UI closely matches Highrise screenshots provided
- All gacha mechanics follow exact specifications
- Pity system persists across sessions
- Featured guarantee flag carries over
- Database transactions ensure data consistency

## Troubleshooting

**Port already in use**:
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

**Database issues**:
```bash
cd backend
rm highrise.db
npm run seed
```

**Module errors**:
- Ensure `"type": "module"` is in both package.json files
- Verify all imports use `.js` extensions
