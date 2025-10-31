# Quick Start Guide

## Setup in 3 Steps

### Step 1: Install Backend Dependencies
```bash
cd /Users/ruijia/highrise-simulator/backend
npm install express cors body-parser sqlite3
```

### Step 2: Install Frontend Dependencies
```bash
cd /Users/ruijia/highrise-simulator/frontend
npm install vite react react-dom @vitejs/plugin-react
```

### Step 3: Run the Application

**Terminal 1 - Backend**:
```bash
cd /Users/ruijia/highrise-simulator/backend
npm run seed    # Seed database (first time only)
npm start       # Start backend server
```

**Terminal 2 - Frontend**:
```bash
cd /Users/ruijia/highrise-simulator/frontend
npm run dev     # Start frontend dev server
```

Then open http://localhost:3000 in your browser!

## If you get npm permission errors:

Run this first:
```bash
sudo chown -R 501:20 "/Users/ruijia/.npm"
```

Then retry the npm install commands above.

## Test the Features

1. **Shop Tab**: Buy items with your 7,833 gold tokens
2. **Closet Tab**: View your 20+ starter items, try disenchant mode
3. **Grabs Tab**: Pull gacha with the pity system (watch your pity counters!)
4. **Swap Tab**: View the swap collection items

## Need Help?

Check the full README.md for:
- Complete API documentation
- Database schema details
- Troubleshooting guide
- Project architecture
