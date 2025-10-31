import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Gacha = ({ user, refreshUser }) => {
  const [banner, setBanner] = useState(null);
  const [bannerItems, setBannerItems] = useState([]);
  const [gachaState, setGachaState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadGachaData();
  }, [user]);

  const loadGachaData = async () => {
    try {
      const bannerRes = await fetch(`${API_URL}/gacha/banner`);
      const bannerData = await bannerRes.json();

      setBanner(bannerData.banner);
      setBannerItems(bannerData.items);

      if (user && bannerData.banner) {
        const stateRes = await fetch(`${API_URL}/gacha/state/${user.id}/${bannerData.banner.id}`);
        const stateData = await stateRes.json();
        setGachaState(stateData);
      }
    } catch (error) {
      console.error('Error loading gacha:', error);
    } finally {
      setLoading(false);
    }
  };

  const performPull = async (count) => {
    if (!user || !banner) return;

    setPulling(true);
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/gacha/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bannerId: banner.id,
          count
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setGachaState(data.newState);
        await refreshUser();
        await loadGachaData();
      } else {
        alert(data.error || 'Pull failed');
      }
    } catch (error) {
      console.error('Error pulling:', error);
      alert('Pull failed');
    } finally {
      setPulling(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      legendary: '#f59e0b',
      epic: '#8b5cf6',
      rare: '#3b82f6'
    };
    return colors[rarity] || '#3b82f6';
  };

  const getRarityStars = (rarity) => {
    if (rarity === 'legendary') return '★★★★★';
    if (rarity === 'epic') return '★★★★';
    return '★★★';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 50%)',
      paddingTop: '70px'
    },
    bannerCard: {
      margin: '20px',
      borderRadius: '20px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #2a1a4a 0%, #1a1a3a 100%)',
      border: '2px solid #7c3aed'
    },
    bannerImage: {
      width: '100%',
      aspectRatio: '16/9',
      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '64px',
      position: 'relative'
    },
    bannerInfo: {
      padding: '20px'
    },
    bannerTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '12px',
      textAlign: 'center'
    },
    pityInfo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '16px'
    },
    pityCard: {
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '12px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    pityLabel: {
      fontSize: '11px',
      color: '#9ca3af',
      marginBottom: '4px'
    },
    pityValue: {
      fontSize: '20px',
      fontWeight: '700'
    },
    rewardsSection: {
      padding: '20px',
      background: '#0a0a0a'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '16px',
      textTransform: 'uppercase',
      fontStyle: 'italic'
    },
    progressBar: {
      background: '#2a2a2a',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    },
    progressLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      marginBottom: '8px',
      fontStyle: 'italic'
    },
    progressBarFill: {
      height: '8px',
      background: '#2a2a2a',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #3b82f6 0%, #7c3aed 100%)',
      transition: 'width 0.3s ease'
    },
    itemsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginTop: '12px'
    },
    itemCard: {
      aspectRatio: '1',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative'
    },
    itemImage: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px'
    },
    itemStars: {
      position: 'absolute',
      bottom: '4px',
      left: '4px',
      right: '4px',
      textAlign: 'center',
      fontSize: '8px',
      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
    },
    pullButtons: {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 80px)',
      maxWidth: '360px',
      padding: '0',
      display: 'flex',
      gap: '8px'
    },
    pullButton: {
      flex: 1,
      padding: '10px 8px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px'
    },
    pullButtonSingle: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    pullButtonMulti: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
    },
    pullButtonCost: {
      fontSize: '10px',
      opacity: 0.9,
      display: 'flex',
      alignItems: 'center',
      gap: '2px'
    },
    resultsModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      maxWidth: '400px',
      marginBottom: '20px'
    },
    resultCard: {
      borderRadius: '16px',
      overflow: 'hidden',
      border: '3px solid'
    },
    resultImage: {
      width: '100%',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '64px'
    },
    resultInfo: {
      padding: '12px',
      textAlign: 'center'
    },
    resultName: {
      fontSize: '14px',
      fontWeight: '700',
      marginBottom: '4px'
    },
    resultStars: {
      fontSize: '12px',
      marginTop: '4px'
    },
    closeButton: {
      padding: '16px 48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '700'
    }
  };

  if (loading) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!banner) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>No active banner</div>;
  }

  const legendaryItems = bannerItems.filter(i => i.rarity === 'legendary');
  const epicItems = bannerItems.filter(i => i.rarity === 'epic');

  return (
    <div style={styles.container}>
      <div style={styles.bannerCard}>
        <div style={styles.bannerImage}>
          <img
            src="https://cdn.highrisegame.com/releases/2025/9/gachas/ghost-stories/GhostStories2025_SmallGrabBanner_Event@2x.webp"
            alt="Ghost Stories Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
            Swappable
          </div>
        </div>
        <div style={styles.bannerInfo}>
          <div style={styles.bannerTitle}>{banner.name || 'Coven Call'}</div>

          {gachaState && (
            <div style={styles.pityInfo}>
              <div style={styles.pityCard}>
                <div style={styles.pityLabel}>5★ Pity</div>
                <div style={styles.pityValue}>{gachaState.pulls_since_5star}/90</div>
              </div>
              <div style={styles.pityCard}>
                <div style={styles.pityLabel}>4★ Pity</div>
                <div style={styles.pityValue}>{gachaState.pulls_since_4star}/10</div>
              </div>
              <div style={{...styles.pityCard, gridColumn: '1 / -1'}}>
                <div style={styles.pityLabel}>Next 5★</div>
                <div style={{...styles.pityValue, fontSize: '16px', color: gachaState.guaranteed_featured ? '#f59e0b' : '#9ca3af'}}>
                  {gachaState.guaranteed_featured ? 'Guaranteed Featured' : '50/50'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.rewardsSection}>
        <div style={styles.progressBar}>
          <div style={styles.progressLabel}>
            <span style={styles.sectionTitle}>Completion Reward</span>
            <span>17 / 46 Items</span>
          </div>
          <div style={styles.progressBarFill}>
            <div style={{...styles.progressFill, width: '37%'}} />
          </div>
        </div>

        <div style={styles.sectionTitle}>Legendary guaranteed within 60 Spins</div>
        <div style={styles.itemsGrid}>
          {legendaryItems.slice(0, 8).map((item, i) => (
            <div key={i} style={{...styles.itemCard, background: getRarityColor('legendary')}}>
              <div style={styles.itemImage}>
                <span>✨</span>
              </div>
              <div style={styles.itemStars}>{getRarityStars('legendary')}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.pullButtons}>
        <button
          style={{...styles.pullButton, ...styles.pullButtonSingle}}
          onClick={() => performPull(1)}
          disabled={pulling}
        >
          <span>Spin x1</span>
          <span style={styles.pullButtonCost}>
            <img src="/spin-token.png" alt="Spin Token" style={{width: '12px', height: '12px'}} />
            1
          </span>
        </button>
        <button
          style={{...styles.pullButton, ...styles.pullButtonMulti}}
          onClick={() => performPull(10)}
          disabled={pulling}
        >
          <span>Spin x10</span>
          <span style={styles.pullButtonCost}>
            <img src="/spin-token.png" alt="Spin Token" style={{width: '12px', height: '12px'}} />
            10
          </span>
          <span style={{fontSize: '9px', opacity: 0.8}}>Guaranteed Epic</span>
        </button>
      </div>

      {results && (
        <div style={styles.resultsModal}>
          <div style={styles.resultsGrid}>
            {results.map((result, i) => (
              <div key={i} style={{...styles.resultCard, borderColor: getRarityColor(result.rarity)}}>
                <div style={{...styles.resultImage, background: getRarityColor(result.rarity)}}>
                  <span>✨</span>
                </div>
                <div style={styles.resultInfo}>
                  <div style={styles.resultName}>{result.item.name}</div>
                  <div style={styles.resultStars}>{getRarityStars(result.rarity)}</div>
                  {result.isFeatured && <div style={{fontSize: '11px', color: '#f59e0b', marginTop: '4px'}}>FEATURED</div>}
                </div>
              </div>
            ))}
          </div>
          <button style={styles.closeButton} onClick={() => setResults(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Gacha;
