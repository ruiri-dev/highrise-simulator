import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, user }) => {
  const styles = {
    nav: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      background: '#1a1a1a',
      borderTop: '1px solid #2a2a2a',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      zIndex: 1000
    },
    navItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      background: 'none',
      color: '#9ca3af',
      fontSize: '11px',
      padding: '4px 0'
    },
    navItemActive: {
      color: '#fff'
    },
    icon: {
      fontSize: '24px'
    },
    header: {
      position: 'sticky',
      top: 0,
      background: '#0a0a0a',
      padding: '16px 20px',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100
    },
    tokens: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: '600'
    },
    tokenBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#2a2a2a',
      padding: '6px 12px',
      borderRadius: '20px'
    }
  };

  return (
    <>
      <div style={styles.header}>
        <div style={{ fontSize: '20px', fontWeight: '700' }}>
          {currentPage === 'shop' && 'Shop'}
          {currentPage === 'inventory' && 'My Items'}
          {currentPage === 'gacha' && 'Coven Call'}
          {currentPage === 'swap' && 'Swap Collection'}
        </div>
        <div style={styles.tokens}>
          <div style={styles.tokenBadge}>
            <span style={{ color: '#f59e0b' }}>●</span>
            {user?.gold_swap_tokens || 0}
          </div>
          <div style={styles.tokenBadge}>
            <span style={{ color: '#9ca3af' }}>●</span>
            {user?.silver_swap_tokens || 0}
          </div>
        </div>
      </div>

      <nav style={styles.nav}>
        <button
          style={{...styles.navItem, ...(currentPage === 'shop' ? styles.navItemActive : {})}}
          onClick={() => setCurrentPage('shop')}
        >
          <span style={styles.icon}>🛍️</span>
          <span>Shop</span>
        </button>
        <button
          style={{...styles.navItem, ...(currentPage === 'inventory' ? styles.navItemActive : {})}}
          onClick={() => setCurrentPage('inventory')}
        >
          <span style={styles.icon}>👔</span>
          <span>Closet</span>
        </button>
        <button
          style={{...styles.navItem, ...(currentPage === 'gacha' ? styles.navItemActive : {})}}
          onClick={() => setCurrentPage('gacha')}
        >
          <span style={styles.icon}>🎰</span>
          <span>Grabs</span>
        </button>
        <button
          style={{...styles.navItem, ...(currentPage === 'swap' ? styles.navItemActive : {})}}
          onClick={() => setCurrentPage('swap')}
        >
          <span style={styles.icon}>♻️</span>
          <span>Swap</span>
        </button>
      </nav>
    </>
  );
};

export default Navigation;
