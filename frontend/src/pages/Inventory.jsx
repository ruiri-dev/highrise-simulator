import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Inventory = ({ user, refreshUser }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disenchantMode, setDisenchantMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemsToDisenchant, setItemsToDisenchant] = useState([]);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/${user.id}`);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (item) => {
    try {
      await fetch(`${API_URL}/inventory/${item.id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorited: !item.is_favorited })
      });
      await loadInventory();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const sortByRarity = (items) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return items.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  };

  const calculateDisenchantRewards = (items) => {
    const rarityValues = {
      legendary: { gold: 20, silver: 0 },
      epic: { gold: 5, silver: 0 },
      rare: { gold: 0, silver: 15 },
      uncommon: { gold: 0, silver: 1 },
      common: { gold: 0, silver: 0 }
    };

    let totalGold = 0;
    let totalSilver = 0;

    items.forEach(item => {
      const values = rarityValues[item.rarity] || { gold: 0, silver: 0 };
      totalGold += values.gold;
      totalSilver += values.silver;
    });

    return { gold: totalGold, silver: totalSilver };
  };

  const disenchantSelected = async () => {
    if (selectedItems.size === 0) {
      alert('No items selected');
      return;
    }

    const items = inventory.filter(item => selectedItems.has(item.id));
    setItemsToDisenchant(sortByRarity(items));
    setShowConfirmModal(true);
  };

  const confirmDisenchant = async () => {

    try {
      const response = await fetch(`${API_URL}/inventory/disenchant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          inventoryIds: Array.from(selectedItems)
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowConfirmModal(false);
        alert(`Earned ${result.goldEarned} Gold Swap Tokens and ${result.silverEarned} Silver Swap Tokens!`);
        setSelectedItems(new Set());
        setDisenchantMode(false);
        await refreshUser();
        await loadInventory();
      } else {
        setShowConfirmModal(false);
        alert(result.error || 'Disenchant failed');
      }
    } catch (error) {
      console.error('Error disenchanting:', error);
      setShowConfirmModal(false);
      alert('Disenchant failed');
    }
  };

  const disenchantAllDuplicates = async () => {
    if (!confirm('Disenchant all duplicate items (keeping favorited ones)?')) return;

    try {
      const response = await fetch(`${API_URL}/inventory/disenchant/duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          keepFavorited: true
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.itemsDisenchanted === 0) {
          alert('No duplicates found!');
        } else {
          alert(`Disenchanted ${result.itemsDisenchanted} items! Earned ${result.goldEarned} Gold Swap Tokens and ${result.silverEarned} Silver Swap Tokens!`);
        }
        await refreshUser();
        await loadInventory();
      } else {
        alert(result.error || 'Disenchant failed');
      }
    } catch (error) {
      console.error('Error disenchanting duplicates:', error);
      alert('Disenchant failed');
    }
  };

  const disenchantAllUnfavorited = async () => {
    // Get filtered inventory first
    const currentFiltered = filter === 'all'
      ? inventory
      : inventory.filter(item => item.rarity === filter);

    // Then filter for unfavorited items
    const unfavorited = currentFiltered.filter(item => !item.is_favorited);
    if (unfavorited.length === 0) {
      alert('No unfavorited items in this filter!');
      return;
    }

    setItemsToDisenchant(sortByRarity(unfavorited));
    setShowConfirmModal(true);
  };

  const confirmDisenchantAllUnfavorited = async () => {
    const unfavorited = itemsToDisenchant;

    try {
      const response = await fetch(`${API_URL}/inventory/disenchant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          inventoryIds: unfavorited.map(item => item.id)
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowConfirmModal(false);
        alert(`Earned ${result.goldEarned} Gold Swap Tokens and ${result.silverEarned} Silver Swap Tokens!`);
        await refreshUser();
        await loadInventory();
      } else {
        setShowConfirmModal(false);
        alert(result.error || 'Disenchant failed');
      }
    } catch (error) {
      console.error('Error disenchanting:', error);
      setShowConfirmModal(false);
      alert('Disenchant failed');
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
    return colors[rarity] || '#4b5563';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0a0a0a',
      paddingTop: '70px'
    },
    filters: {
      display: 'flex',
      gap: '8px',
      padding: '12px 20px',
      overflowX: 'auto',
      background: '#0a0a0a'
    },
    filterBtn: {
      padding: '8px 16px',
      borderRadius: '20px',
      background: '#2a2a2a',
      color: '#9ca3af',
      fontSize: '13px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    filterBtnActive: {
      background: '#7c3aed',
      color: '#fff'
    },
    toolbar: {
      padding: '12px 20px',
      background: '#1a1a1a',
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    toolbarBtn: {
      padding: '10px 16px',
      borderRadius: '8px',
      background: '#2a2a2a',
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600'
    },
    itemsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      padding: '16px 20px'
    },
    itemCard: {
      background: '#1a1a1a',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '2px solid transparent',
      position: 'relative'
    },
    itemCardSelected: {
      border: '2px solid #7c3aed'
    },
    itemImage: {
      width: '100%',
      aspectRatio: '1',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      position: 'relative'
    },
    itemName: {
      padding: '8px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    favoriteBtn: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      background: 'rgba(0, 0, 0, 0.7)',
      border: 'none',
      fontSize: '18px',
      padding: '4px 8px',
      borderRadius: '12px',
      cursor: 'pointer',
      zIndex: 10
    },
    quantityBadge: {
      position: 'absolute',
      top: '4px',
      left: '4px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '700'
    },
    rarityBadge: {
      position: 'absolute',
      bottom: '4px',
      left: '4px',
      right: '4px',
      padding: '4px',
      borderRadius: '8px',
      fontSize: '10px',
      fontWeight: '700',
      textAlign: 'center',
      textTransform: 'uppercase'
    }
  };

  if (loading) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading inventory...</div>;
  }

  const filteredInventory = filter === 'all'
    ? inventory
    : inventory.filter(item => item.rarity === filter);

  return (
    <div style={styles.container}>
      <div style={styles.filters}>
        {['all', 'legendary', 'epic', 'rare', 'uncommon', 'common'].map(f => (
          <button
            key={f}
            style={{...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {})}}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.toolbar}>
        <button
          style={{...styles.toolbarBtn, background: disenchantMode ? '#7c3aed' : '#2a2a2a'}}
          onClick={() => {
            setDisenchantMode(!disenchantMode);
            setSelectedItems(new Set());
          }}
        >
          {disenchantMode ? 'Cancel' : 'Disenchant Mode'}
        </button>

        {disenchantMode && (
          <>
            <button style={styles.toolbarBtn} onClick={disenchantSelected}>
              Disenchant Selected ({selectedItems.size})
            </button>
            <button style={styles.toolbarBtn} onClick={disenchantAllDuplicates}>
              All Duplicates
            </button>
            <button style={styles.toolbarBtn} onClick={disenchantAllUnfavorited}>
              All Unfavorited
            </button>
          </>
        )}
      </div>

      <div style={styles.itemsGrid}>
        {filteredInventory.map(item => {
          const isSelected = selectedItems.has(item.id);
          const rarityColor = getRarityColor(item.rarity);

          return (
            <div
              key={item.id}
              style={{...styles.itemCard, ...(isSelected ? styles.itemCardSelected : {})}}
              onClick={() => disenchantMode && toggleSelectItem(item.id)}
            >
              <div style={styles.itemImage}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <span style={{ display: item.image_url ? 'none' : 'flex' }}>👕</span>
                <button
                  style={styles.favoriteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disenchantMode) {
                      toggleFavorite(item);
                    }
                  }}
                >
                  {item.is_favorited ? '⭐' : '☆'}
                </button>
                <div style={{...styles.rarityBadge, background: rarityColor}}>
                  {item.rarity}
                </div>
              </div>
              <div style={styles.itemName}>{item.name}</div>
            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
          No items found
        </div>
      )}

      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #2a2a2a'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Confirm Disenchant
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#9ca3af' }}>
                Are you sure you want to disenchant these {itemsToDisenchant.length} items?
              </p>
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#2a2a2a',
                borderRadius: '8px',
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              }}>
                {(() => {
                  const rewards = calculateDisenchantRewards(itemsToDisenchant);
                  return (
                    <>
                      {rewards.gold > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>🟡</span>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>
                            +{rewards.gold}
                          </span>
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>Gold Swap Tokens</span>
                        </div>
                      )}
                      {rewards.silver > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>⚪</span>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#9ca3af' }}>
                            +{rewards.silver}
                          </span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Silver Swap Tokens</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px'
            }}>
              {itemsToDisenchant.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#2a2a2a',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: `2px solid ${getRarityColor(item.rarity)}`
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: getRarityColor(item.rarity),
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>👕</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: getRarityColor(item.rarity)
                    }}>
                      {item.rarity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #2a2a2a',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#2a2a2a',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowConfirmModal(false);
                  setHoldProgress(0);
                  setIsHolding(false);
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseDown={() => {
                  setIsHolding(true);
                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 2;
                    setHoldProgress(progress);
                    if (progress >= 100) {
                      clearInterval(interval);
                      setIsHolding(false);
                      setHoldProgress(0);
                      if (selectedItems.size > 0) {
                        confirmDisenchant();
                      } else {
                        confirmDisenchantAllUnfavorited();
                      }
                    }
                  }, 20);

                  const handleMouseUp = () => {
                    clearInterval(interval);
                    setIsHolding(false);
                    setHoldProgress(0);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.removeEventListener('mouseleave', handleMouseUp);
                  };

                  document.addEventListener('mouseup', handleMouseUp);
                  document.addEventListener('mouseleave', handleMouseUp);
                }}
                onTouchStart={() => {
                  setIsHolding(true);
                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 2;
                    setHoldProgress(progress);
                    if (progress >= 100) {
                      clearInterval(interval);
                      setIsHolding(false);
                      setHoldProgress(0);
                      if (selectedItems.size > 0) {
                        confirmDisenchant();
                      } else {
                        confirmDisenchantAllUnfavorited();
                      }
                    }
                  }, 20);

                  const handleTouchEnd = () => {
                    clearInterval(interval);
                    setIsHolding(false);
                    setHoldProgress(0);
                    document.removeEventListener('touchend', handleTouchEnd);
                    document.removeEventListener('touchcancel', handleTouchEnd);
                  };

                  document.addEventListener('touchend', handleTouchEnd);
                  document.addEventListener('touchcancel', handleTouchEnd);
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${holdProgress}%`,
                  background: '#dc2626',
                  transition: 'width 0.02s linear',
                  zIndex: 0
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {isHolding ? 'Hold to Confirm...' : 'Hold to Disenchant'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
