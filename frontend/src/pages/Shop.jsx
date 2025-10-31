import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Shop = ({ user, refreshUser }) => {
  const [activeTab, setActiveTab] = useState('gold');
  const [goldShopItems, setGoldShopItems] = useState([]);
  const [silverShopItems, setSilverShopItems] = useState([]);
  const [purchases, setPurchases] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopData();
  }, [user]);

  const loadShopData = async () => {
    try {
      const [goldRes, silverRes, purchasesRes] = await Promise.all([
        fetch(`${API_URL}/shop/gold`),
        fetch(`${API_URL}/shop/silver`),
        user ? fetch(`${API_URL}/shop/purchases/${user.id}`) : Promise.resolve({ json: () => [] })
      ]);

      const gold = await goldRes.json();
      const silver = await silverRes.json();
      const purchasesData = await purchasesRes.json();

      setGoldShopItems(gold);
      setSilverShopItems(silver);

      const purchasesMap = {};
      purchasesData.forEach(p => {
        purchasesMap[p.shop_item_id] = p.quantity_purchased;
      });
      setPurchases(purchasesMap);
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (shopItem) => {
    try {
      const response = await fetch(`${API_URL}/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          shopItemId: shopItem.id,
          quantity: 1
        })
      });

      const result = await response.json();

      if (response.ok) {
        await refreshUser();
        await loadShopData();
        alert('Purchase successful!');
      } else {
        alert(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert('Purchase failed');
    }
  };

  const canPurchase = (item) => {
    if (!user) return false;

    const tokenField = activeTab === 'gold' ? 'gold_swap_tokens' : 'silver_swap_tokens';
    if (user[tokenField] < item.price) return false;

    // Check global stock limit
    if (item.global_stock_limit !== null) {
      if (item.global_stock_purchased >= item.global_stock_limit) return false;
    }

    // Check per-user stock limit
    if (item.stock_limit !== null) {
      const purchased = purchases[item.id] || 0;
      if (purchased >= item.stock_limit) return false;
    }

    return true;
  };

  const getItemName = (item) => {
    if (item.name) return item.name;
    if (item.item_type === 'spin_token') return 'Spin Token';
    if (item.item_type === 'boost_token') return 'Boost Token';
    if (item.item_type === 'live_token') return 'Live Token';
    if (item.item_type === 'bubble_token') return 'Bubble Token';
    return 'Unknown Item';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: activeTab === 'gold'
        ? 'linear-gradient(180deg, #854d0e 0%, #0a0a0a 40%)'
        : 'linear-gradient(180deg, #475569 0%, #0a0a0a 40%)',
      paddingTop: '70px',
      position: 'relative'
    },
    tokenDisplay: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '700',
      color: '#fff',
      border: '2px solid',
      borderColor: activeTab === 'gold' ? '#f59e0b' : '#9ca3af',
      zIndex: 10
    },
    header: {
      padding: '20px',
      textAlign: 'center'
    },
    icon: {
      fontSize: '64px',
      marginBottom: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '12px'
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
    tabs: {
      display: 'flex',
      gap: '8px',
      padding: '0 20px 16px',
      background: 'transparent'
    },
    tab: {
      flex: 1,
      padding: '12px',
      borderRadius: '12px',
      background: 'rgba(42, 42, 42, 0.5)',
      color: '#9ca3af',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s',
      border: '1px solid transparent'
    },
    tabActive: {
      background: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      border: activeTab === 'gold' ? '1px solid #f59e0b' : '1px solid #9ca3af'
    },
    sectionTitle: {
      padding: '8px 20px 12px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
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
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      border: '2px solid transparent',
      background: '#1a1a1a'
    },
    itemImage: {
      width: '100%',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      position: 'relative',
      padding: '8px'
    },
    itemName: {
      padding: '8px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      background: '#0a0a0a'
    },
    costBadge: {
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      right: '8px',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '10px',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      fontSize: '11px',
      fontWeight: '700'
    },
    limitBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '2px 6px',
      borderRadius: '8px',
      fontSize: '9px',
      fontWeight: '600',
      color: '#fff'
    },
    rarityBadge: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      borderRadius: '8px',
      padding: '4px 8px',
      fontSize: '10px',
      fontWeight: '700',
      textAlign: 'center'
    },
    soldOutOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '700',
      color: '#ef4444'
    }
  };

  if (loading) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading shop...</div>;
  }

  const items = activeTab === 'gold' ? goldShopItems : silverShopItems;
  const tokenColor = activeTab === 'gold' ? '#f59e0b' : '#9ca3af';
  const tokenIcon = activeTab === 'gold' ? '🟡' : '⚪';

  // Separate featured and regular items
  const featuredItems = items.filter(item => item.is_featured);
  const regularItems = items.filter(item => !item.is_featured);

  const getRarityColor = (rarity) => {
    const colors = {
      legendary: '#f59e0b',
      epic: '#8b5cf6',
      rare: '#3b82f6'
    };
    return colors[rarity] || '#3b82f6';
  };

  return (
    <div style={styles.container}>
      <div style={styles.tokenDisplay}>
        <span>{tokenIcon}</span>
        <span>{user?.[activeTab === 'gold' ? 'gold_swap_tokens' : 'silver_swap_tokens'] || 0}</span>
      </div>

      <div style={styles.header}>
        <div style={styles.icon}>{activeTab === 'gold' ? '🪙' : '⚪'}</div>
        <div style={styles.title}>{activeTab === 'gold' ? 'Gold Swap Shop' : 'Silver Swap Shop'}</div>
      </div>

      <div style={styles.infoCard}>
        <div style={styles.infoIcon}>💡</div>
        <div style={styles.infoText}>
          {activeTab === 'gold'
            ? 'Use your gold swap tokens to purchase exclusive items, spin tokens, and more!'
            : 'Use your silver swap tokens to get limited items and spin tokens!'}
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'gold' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('gold')}
        >
          Gold Swap Shop
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'silver' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('silver')}
        >
          Silver Swap Shop
        </button>
      </div>

      {featuredItems.length > 0 && (
        <>
          <div style={{
            margin: '0 20px 12px',
            padding: '12px 16px',
            background: activeTab === 'gold'
              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: activeTab === 'gold'
              ? '0 4px 16px rgba(251, 191, 36, 0.5)'
              : '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            {activeTab === 'gold' ? '🌟 Limited Edition - Global Stock 🌟' : '⭐ Limited Deal ⭐'}
          </div>
          <div style={{...styles.itemsGrid, paddingBottom: '8px'}}>
            {featuredItems.map(item => {
              const purchased = purchases[item.id] || 0;
              const canBuy = canPurchase(item);
              const soldOut = (item.global_stock_limit && item.global_stock_purchased >= item.global_stock_limit) ||
                             (item.stock_limit && purchased >= item.stock_limit);

              return (
                <div
                  key={item.id}
                  style={styles.itemCard}
                  onClick={() => canBuy && handlePurchase(item)}
                >
                  <div style={{
                    ...styles.itemImage,
                    background: item.rarity ? getRarityColor(item.rarity) : '#3b82f6'
                  }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={getItemName(item)}
                        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                      />
                    ) : item.item_type === 'spin_token' ? (
                      <img
                        src="/spin-token.png"
                        alt="Spin Token"
                        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                      />
                    ) : item.item_type === 'boost_token' ? (
                      <img
                        src="/boost-token.png"
                        alt="Boost Token"
                        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                      />
                    ) : item.item_type === 'live_token' ? (
                      <img
                        src="/voice-token.png"
                        alt="Voice Token"
                        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                      />
                    ) : item.item_type === 'bubble_token' ? (
                      <img
                        src="/bubble-token.png"
                        alt="Bubble Token"
                        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        {item.item_type === 'background' && '🖼️'}
                        {item.item_type === 'epic_item' && '✨'}
                      </>
                    )}

                    {item.global_stock_limit && (
                      <div style={{
                        ...styles.limitBadge,
                        background: 'rgba(251, 191, 36, 0.95)',
                        color: '#000',
                        fontWeight: '700',
                        fontSize: '10px'
                      }}>
                        {item.global_stock_limit - item.global_stock_purchased} left globally
                      </div>
                    )}

                    {item.stock_limit && !item.global_stock_limit && (
                      <div style={styles.limitBadge}>
                        {purchased}/{item.stock_limit}
                      </div>
                    )}

                    {item.quantity && item.quantity > 1 && (
                      <div style={{...styles.limitBadge, left: '4px', right: 'auto'}}>
                        x{item.quantity}
                      </div>
                    )}

                    {item.rarity && (
                      <div style={{...styles.rarityBadge, background: getRarityColor(item.rarity)}}>
                        {item.rarity === 'legendary' && 'LEGENDARY'}
                        {item.rarity === 'epic' && 'EPIC'}
                        {item.rarity === 'rare' && 'RARE'}
                      </div>
                    )}

                    <div style={styles.costBadge}>
                      <span>{tokenIcon}</span>
                      <span>{item.price}</span>
                    </div>

                    {soldOut && (
                      <div style={styles.soldOutOverlay}>
                        SOLD OUT
                      </div>
                    )}
                  </div>
                  <div style={styles.itemName}>{getItemName(item)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={styles.sectionTitle}>Available Items</div>

      <div style={styles.itemsGrid}>
        {regularItems.map(item => {
          const purchased = purchases[item.id] || 0;
          const canBuy = canPurchase(item);
          const soldOut = (item.global_stock_limit && item.global_stock_purchased >= item.global_stock_limit) ||
                         (item.stock_limit && purchased >= item.stock_limit);

          return (
            <div
              key={item.id}
              style={styles.itemCard}
              onClick={() => canBuy && handlePurchase(item)}
            >
              <div style={{
                ...styles.itemImage,
                background: item.rarity ? getRarityColor(item.rarity) : '#3b82f6'
              }}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={getItemName(item)}
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                  />
                ) : item.item_type === 'spin_token' ? (
                  <img
                    src="/spin-token.png"
                    alt="Spin Token"
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                  />
                ) : item.item_type === 'boost_token' ? (
                  <img
                    src="/boost-token.png"
                    alt="Boost Token"
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                  />
                ) : item.item_type === 'live_token' ? (
                  <img
                    src="/voice-token.png"
                    alt="Voice Token"
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                  />
                ) : item.item_type === 'bubble_token' ? (
                  <img
                    src="/bubble-token.png"
                    alt="Bubble Token"
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    {item.item_type === 'background' && '🖼️'}
                    {item.item_type === 'epic_item' && '✨'}
                  </>
                )}

                {item.global_stock_limit && (
                  <div style={{
                    ...styles.limitBadge,
                    background: 'rgba(251, 191, 36, 0.95)',
                    color: '#000',
                    fontWeight: '700',
                    fontSize: '10px'
                  }}>
                    {item.global_stock_limit - item.global_stock_purchased} left globally
                  </div>
                )}

                {item.stock_limit && !item.global_stock_limit && (
                  <div style={styles.limitBadge}>
                    {purchased}/{item.stock_limit}
                  </div>
                )}

                {item.quantity && item.quantity > 1 && (
                  <div style={{...styles.limitBadge, left: '4px', right: 'auto'}}>
                    x{item.quantity}
                  </div>
                )}

                {item.rarity && (
                  <div style={{...styles.rarityBadge, background: getRarityColor(item.rarity)}}>
                    {item.rarity === 'legendary' && 'LEGENDARY'}
                    {item.rarity === 'epic' && 'EPIC'}
                    {item.rarity === 'rare' && 'RARE'}
                  </div>
                )}

                <div style={styles.costBadge}>
                  <span>{tokenIcon}</span>
                  <span>{item.price}</span>
                </div>

                {soldOut && (
                  <div style={styles.soldOutOverlay}>
                    SOLD OUT
                  </div>
                )}
              </div>
              <div style={styles.itemName}>{getItemName(item)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
