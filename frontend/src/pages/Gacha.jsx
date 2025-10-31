import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Gacha = ({ user, refreshUser }) => {
  const [banner, setBanner] = useState(null);
  const [bannerItems, setBannerItems] = useState([]);
  const [gachaState, setGachaState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [results, setResults] = useState(null);
  const [showWishModal, setShowWishModal] = useState(false);
  const [selectedFeatured, setSelectedFeatured] = useState(null);
  const [showConfirmWishModal, setShowConfirmWishModal] = useState(false);
  const [pendingFeaturedItem, setPendingFeaturedItem] = useState(null);

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

        // Set selected featured item (from state or default to first legendary)
        const legendaries = bannerData.items.filter(i => i.rarity === 'legendary');
        if (stateData.selected_featured_id) {
          const featured = bannerData.items.find(i => i.item_id === stateData.selected_featured_id);
          setSelectedFeatured(featured);
        } else if (legendaries.length > 0) {
          setSelectedFeatured(legendaries[0]);
        }
      }
    } catch (error) {
      console.error('Error loading gacha:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishItemClick = (item) => {
    setPendingFeaturedItem(item);
    setShowConfirmWishModal(true);
  };

  const confirmWish = async () => {
    if (!user || !banner || !pendingFeaturedItem) return;

    try {
      const response = await fetch(`${API_URL}/gacha/set-featured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bannerId: banner.id,
          featuredItemId: pendingFeaturedItem.item_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedFeatured(pendingFeaturedItem);
        setGachaState(data.state);
        setShowConfirmWishModal(false);
        setShowWishModal(false);
        setPendingFeaturedItem(null);
      } else {
        alert(data.error || 'Failed to set featured item');
      }
    } catch (error) {
      console.error('Error setting featured:', error);
      alert('Failed to set featured item');
    }
  };

  const cancelWish = () => {
    setShowConfirmWishModal(false);
    setPendingFeaturedItem(null);
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
      paddingTop: '70px',
      paddingBottom: '100px'
    },
    bannerCard: {
      margin: '20px 20px 16px',
      borderRadius: '16px',
      overflow: 'hidden'
    },
    bannerImage: {
      width: '100%',
      aspectRatio: '16/9',
      position: 'relative'
    },
    featuredSection: {
      margin: '0 20px 16px',
      padding: '16px',
      background: '#1a1a1a',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    wishButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#fff'
    },
    pityCounter: {
      margin: '0 20px 16px',
      padding: '12px',
      background: '#1a1a1a',
      borderRadius: '12px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      color: '#9ca3af'
    },
    pullButtonsNew: {
      margin: '0 20px 20px',
      display: 'flex',
      gap: '12px'
    },
    pullButtonNew: {
      flex: 1,
      padding: '16px',
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      borderRadius: '12px',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    legendaryPreview: {
      margin: '0 20px',
      padding: '16px',
      background: '#1a1a1a',
      borderRadius: '12px'
    },
    wishModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    wishModalContent: {
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    wishModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    wishItemsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    wishItem: {
      background: '#0a0a0a',
      borderRadius: '12px',
      overflow: 'hidden',
      padding: 0,
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    confirmModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 2100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    confirmModalContent: {
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '360px',
      width: '100%'
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
      {/* Banner Image */}
      <div style={styles.bannerCard}>
        <div style={styles.bannerImage}>
          <img
            src="https://cdn.highrisegame.com/releases/2025/9/gachas/prism-hex/Neonwitch_promoUINeonwitch2025_GrabBanner.webp"
            alt="Prism Hex Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Featured Item Display */}
      {selectedFeatured && (
        <div style={styles.featuredSection}>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b' }}>★</span>
            <span style={{ fontWeight: '600' }}>Featured: {selectedFeatured.name}</span>
          </div>
          <button
            style={styles.wishButton}
            onClick={() => setShowWishModal(true)}
          >
            <span style={{ fontSize: '20px' }}>❤️</span>
            <span>Wish</span>
          </button>
        </div>
      )}

      {/* Pity Counter */}
      {gachaState && (
        <div style={styles.pityCounter}>
          {90 - gachaState.pulls_since_5star} until guaranteed Legendary
        </div>
      )}

      {/* Pull Buttons */}
      <div style={styles.pullButtonsNew}>
        <button
          style={styles.pullButtonNew}
          onClick={() => performPull(1)}
          disabled={pulling}
        >
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Open x1</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <div style={{ width: '16px', height: '16px', background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🎫</div>
            <span>1 Spin Token</span>
          </div>
        </button>
        <button
          style={styles.pullButtonNew}
          onClick={() => performPull(10)}
          disabled={pulling}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>Open x11</span>
            <span style={{ background: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>+1 FREE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <div style={{ width: '16px', height: '16px', background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🎫</div>
            <span>10 Spin Tokens</span>
          </div>
        </button>
      </div>

      {/* Legendary Items Preview */}
      <div style={styles.legendaryPreview}>
        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', textAlign: 'center' }}>
          Legendary Items ({legendaryItems.length})
        </div>
        <div style={styles.itemsGrid}>
          {legendaryItems.map((item, i) => (
            <div key={i} style={{...styles.itemCard, background: getRarityColor('legendary')}}>
              <div style={styles.itemImage}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span>✨</span>
                )}
              </div>
              <div style={styles.itemStars}>{getRarityStars('legendary')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wish Modal */}
      {showWishModal && (
        <div style={styles.wishModal}>
          <div style={styles.wishModalContent}>
            <div style={styles.wishModalHeader}>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>Select Featured Item</div>
              <button
                style={{ background: 'none', fontSize: '24px', padding: '0' }}
                onClick={() => setShowWishModal(false)}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
              Your selected item will have a 50% chance when you win a 5★
            </div>
            <div style={styles.wishItemsGrid}>
              {legendaryItems.map((item, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.wishItem,
                    border: selectedFeatured?.item_id === item.item_id ? '3px solid #06b6d4' : '2px solid #2a2a2a'
                  }}
                  onClick={() => handleWishItemClick(item)}
                >
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: getRarityColor('legendary'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '48px' }}>✨</span>
                    )}
                  </div>
                  <div style={{ padding: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', color: '#fff' }}>
                    {item.name}
                  </div>
                  <div style={styles.itemStars}>{getRarityStars('legendary')}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Wish Modal */}
      {showConfirmWishModal && pendingFeaturedItem && (
        <div style={styles.confirmModal}>
          <div style={styles.confirmModalContent}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
              Confirm Wish
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px', textAlign: 'center' }}>
              Set <span style={{ color: '#06b6d4', fontWeight: '700' }}>{pendingFeaturedItem.name}</span> as your featured item?
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '120px',
                aspectRatio: '1',
                background: getRarityColor('legendary'),
                borderRadius: '12px',
                overflow: 'hidden',
                border: '3px solid #06b6d4'
              }}>
                {pendingFeaturedItem.image_url ? (
                  <img
                    src={pendingFeaturedItem.image_url}
                    alt={pendingFeaturedItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '48px' }}>✨</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#2a2a2a',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
                onClick={cancelWish}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
                onClick={confirmWish}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {results && (
        <div style={styles.resultsModal}>
          <div style={styles.resultsGrid}>
            {results.map((result, i) => (
              <div key={i} style={{...styles.resultCard, borderColor: getRarityColor(result.rarity)}}>
                <div style={{...styles.resultImage, background: getRarityColor(result.rarity)}}>
                  {result.item.image_url ? (
                    <img
                      src={result.item.image_url}
                      alt={result.item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span>✨</span>
                  )}
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
