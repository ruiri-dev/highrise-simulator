import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Inventory = ({ user, refreshUser }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disenchantMode, setDisenchantMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filter, setFilter] = useState('all');

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

  const disenchantSelected = async () => {
    if (selectedItems.size === 0) {
      alert('No items selected');
      return;
    }

    if (!confirm(`Disenchant ${selectedItems.size} items?`)) return;

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
        alert(`Earned ${result.goldEarned} gold and ${result.silverEarned} silver tokens!`);
        setSelectedItems(new Set());
        setDisenchantMode(false);
        await refreshUser();
        await loadInventory();
      } else {
        alert(result.error || 'Disenchant failed');
      }
    } catch (error) {
      console.error('Error disenchanting:', error);
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
          alert(`Disenchanted ${result.itemsDisenchanted} items! Earned ${result.goldEarned} gold and ${result.silverEarned} silver tokens!`);
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
    const unfavorited = inventory.filter(item => !item.is_favorited);
    if (unfavorited.length === 0) {
      alert('No unfavorited items!');
      return;
    }

    if (!confirm(`Disenchant all ${unfavorited.length} unfavorited items?`)) return;

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
        alert(`Earned ${result.goldEarned} gold and ${result.silverEarned} silver tokens!`);
        await refreshUser();
        await loadInventory();
      } else {
        alert(result.error || 'Disenchant failed');
      }
    } catch (error) {
      console.error('Error disenchanting:', error);
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
    </div>
  );
};

export default Inventory;
