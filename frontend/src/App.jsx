import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import DevTools from './components/DevTools';
import Statistics from './components/Statistics';
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';
import Gacha from './pages/Gacha';
import SwapCollection from './pages/SwapCollection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [currentPage, setCurrentPage] = useState('shop');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initUser();
  }, []);

  const initUser = async () => {
    try {
      // Create or get default user
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo_user' })
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="mobile-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-view">
      <div style={{ paddingBottom: '80px' }}>
        {currentPage === 'shop' && <Shop user={user} refreshUser={refreshUser} />}
        {currentPage === 'inventory' && <Inventory user={user} refreshUser={refreshUser} />}
        {currentPage === 'gacha' && <Gacha user={user} refreshUser={refreshUser} />}
        {currentPage === 'swap' && <SwapCollection user={user} refreshUser={refreshUser} />}
      </div>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />
      <Statistics user={user} />
      <DevTools user={user} refreshUser={refreshUser} />
    </div>
  );
}

export default App;
