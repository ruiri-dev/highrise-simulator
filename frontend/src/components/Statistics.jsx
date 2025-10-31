import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Statistics = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/stats/${user.id}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !stats) {
      loadStats();
    }
  }, [isOpen]);

  const styles = {
    container: {
      position: 'fixed',
      bottom: '80px',
      right: '180px',
      zIndex: 2000
    },
    toggleBtn: {
      padding: '12px 16px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: 'none',
      cursor: 'pointer'
    },
    panel: {
      position: 'absolute',
      bottom: '50px',
      right: '0',
      width: '340px',
      maxHeight: '500px',
      overflowY: 'auto',
      background: '#1a1a1a',
      border: '2px solid #3b82f6',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    section: {
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #2a2a2a'
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      fontSize: '14px'
    },
    statLabel: {
      color: '#d1d5db'
    },
    statValue: {
      fontWeight: '700',
      color: '#fff'
    },
    rarityBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '700',
      marginRight: '8px'
    },
    refreshBtn: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      background: '#2a2a2a',
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      marginTop: '12px'
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      legendary: '#f59e0b',
      epic: '#8b5cf6',
      rare: '#3b82f6',
      uncommon: '#6b7280',
      common: '#4b5563'
    };
    return colors[rarity] || '#6b7280';
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.toggleBtn}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadStats();
        }}
      >
        📊 Statistics
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.title}>
            <span>📈</span>
            Player Statistics
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
              Loading...
            </div>
          ) : stats ? (
            <>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Tokens Earned</div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>🟡 Gold Tokens Earned</span>
                  <span style={styles.statValue}>{stats.tokensEarned.gold.toLocaleString()}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>⚪ Silver Tokens Earned</span>
                  <span style={styles.statValue}>{stats.tokensEarned.silver.toLocaleString()}</span>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Items Disenchanted</div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('legendary')}}>
                      LEGEND
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.disenchanted.legendary}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('epic')}}>
                      EPIC
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.disenchanted.epic}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('rare')}}>
                      RARE
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.disenchanted.rare}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('uncommon')}}>
                      UNCOMM
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.disenchanted.uncommon}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('common')}}>
                      COMMON
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.disenchanted.common}</span>
                </div>
                <div style={{...styles.statRow, borderTop: '1px solid #2a2a2a', marginTop: '8px', paddingTop: '12px'}}>
                  <span style={styles.statLabel}>Total Disenchanted</span>
                  <span style={styles.statValue}>{stats.totalDisenchanted}</span>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Current Inventory</div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Total Items</span>
                  <span style={styles.statValue}>{stats.currentInventory}</span>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Gacha Pulls</div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('legendary')}}>
                      LEGEND
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.gachaPulls.legendary}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('epic')}}>
                      EPIC
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.gachaPulls.epic}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('rare')}}>
                      RARE
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.gachaPulls.rare}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('uncommon')}}>
                      UNCOMM
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.gachaPulls.uncommon}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>
                    <span style={{...styles.rarityBadge, background: getRarityColor('common')}}>
                      COMMON
                    </span>
                  </span>
                  <span style={styles.statValue}>{stats.gachaPulls.common}</span>
                </div>
                <div style={{...styles.statRow, borderTop: '1px solid #2a2a2a', marginTop: '8px', paddingTop: '12px'}}>
                  <span style={styles.statLabel}>Total Pulls</span>
                  <span style={styles.statValue}>{stats.totalGachaPulls}</span>
                </div>
              </div>

              <button style={styles.refreshBtn} onClick={loadStats}>
                Refresh Stats
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
              Failed to load stats
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;
