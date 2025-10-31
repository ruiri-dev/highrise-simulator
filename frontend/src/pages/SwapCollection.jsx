import React from 'react';

const SwapCollection = ({ user, refreshUser }) => {
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #065f46 0%, #0a0a0a 40%)',
      paddingTop: '70px'
    },
    header: {
      padding: '20px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '12px'
    },
    icon: {
      fontSize: '64px',
      marginBottom: '20px'
    },
    infoCard: {
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '16px',
      padding: '20px',
      margin: '0 20px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    },
    infoIcon: {
      fontSize: '32px',
      flexShrink: 0
    },
    infoText: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#d1d5db'
    },
    itemsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      padding: '0 20px 100px'
    },
    itemCard: {
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative'
    },
    itemImage: {
      width: '100%',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px'
    },
    costBadge: {
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      right: '8px',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      fontSize: '13px',
      fontWeight: '700'
    },
    tokenIcon: {
      fontSize: '16px'
    },
    legendaryBadge: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      right: '8px',
      background: 'rgba(168, 85, 247, 0.9)',
      borderRadius: '8px',
      padding: '4px',
      fontSize: '10px',
      fontWeight: '700',
      textAlign: 'center'
    },
    sectionTitle: {
      padding: '16px 20px 12px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  };

  const shopItems = [
    { emoji: '🎭', cost: 100, color: '#f59e0b', tokenColor: '🟡', rarity: 'legendary' },
    { emoji: '☁️', cost: 100, color: '#f59e0b', tokenColor: '🟡', rarity: 'legendary' },
    { emoji: '💀', cost: 100, color: '#f59e0b', tokenColor: '🟡', rarity: 'legendary' },
    { emoji: '🖼️', cost: 36, color: '#8b5cf6', tokenColor: '♻️', rarity: 'epic' },
    { emoji: '🦴', cost: 36, color: '#8b5cf6', tokenColor: '♻️', rarity: 'epic' },
    { emoji: '🦈', cost: 12, color: '#3b82f6', tokenColor: '♻️', rarity: 'rare' },
    { emoji: '🐊', cost: 12, color: '#3b82f6', tokenColor: '♻️', rarity: 'rare' },
    { emoji: '🦇', cost: 36, color: '#8b5cf6', tokenColor: '♻️', rarity: 'epic' },
    { emoji: '👢', cost: 36, color: '#8b5cf6', tokenColor: '♻️', rarity: 'epic' },
    { emoji: '👞', cost: 12, color: '#3b82f6', tokenColor: '♻️', rarity: 'rare' },
    { emoji: '👁️', cost: 36, color: '#8b5cf6', tokenColor: '♻️', rarity: 'epic' },
    { emoji: '🔮', cost: 36, color: '#8b5cf6', tokenColor: '♻️', rarity: 'epic' },
    { emoji: '🐋', cost: 12, color: '#3b82f6', tokenColor: '♻️', rarity: 'rare' },
    { emoji: '🦴', cost: 12, color: '#3b82f6', tokenColor: '♻️', rarity: 'rare' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon}>♻️</div>
        <div style={styles.title}>Swap Collection</div>
      </div>

      <div style={styles.infoCard}>
        <div style={styles.infoIcon}>💡</div>
        <div style={styles.infoText}>
          Earn Swap Tokens by swapping in Swappable Grabs, then use them to get these cool items!
        </div>
      </div>

      <div style={styles.sectionTitle}>Available Items</div>

      <div style={styles.itemsGrid}>
        {shopItems.map((item, i) => (
          <div key={i} style={styles.itemCard}>
            <div style={{...styles.itemImage, background: item.color}}>
              <span>{item.emoji}</span>
              {item.rarity === 'legendary' && (
                <div style={styles.legendaryBadge}>★★★★★</div>
              )}
              <div style={styles.costBadge}>
                <span style={styles.tokenIcon}>{item.tokenColor}</span>
                <span>{item.cost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwapCollection;
