import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Shop = ({ user, refreshUser }) => {
  const [allShopItems, setAllShopItems] = useState([]);
  const [purchases, setPurchases] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseError, setPurchaseError] = useState('');

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

      // Combine both shops
      setAllShopItems([...gold, ...silver]);

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

  const openPurchaseModal = (shopItem) => {
    setSelectedItem(shopItem);
    setPurchaseQuantity(1);
    setPurchaseError('');
    setShowPurchaseModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;

    const totalCost = selectedItem.price * purchaseQuantity;

    // Check if user has enough tokens
    const tokenField = selectedItem.shop_type === 'gold' ? 'gold_swap_tokens' : 'silver_swap_tokens';
    const tokenName = selectedItem.shop_type === 'gold' ? 'Gold Swap Tokens' : 'Silver Swap Tokens';
    if (user[tokenField] < totalCost) {
      setPurchaseError(`Not enough ${tokenName}! You need ${totalCost} but only have ${user[tokenField]}.`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          shopItemId: selectedItem.id,
          quantity: purchaseQuantity
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowPurchaseModal(false);
        setSelectedItem(null);
        await refreshUser();
        await loadShopData();
        alert('Purchase successful!');
      } else {
        setPurchaseError(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      setPurchaseError('Purchase failed. Please try again.');
    }
  };

  const canPurchase = (item) => {
    if (!user) return false;

    const tokenField = item.shop_type === 'gold' ? 'gold_swap_tokens' : 'silver_swap_tokens';
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
      background: 'linear-gradient(180deg, #854d0e 0%, #475569 20%, #0a0a0a 50%)',
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
      flexDirection: 'column',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '700',
      color: '#fff',
      border: '2px solid #f59e0b',
      zIndex: 10
    },
    tokenRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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

  const getRarityColor = (rarity) => {
    const colors = {
      legendary: '#f59e0b',
      epic: '#8b5cf6',
      rare: '#3b82f6'
    };
    return colors[rarity] || '#3b82f6';
  };

  const getRarityOrder = (rarity) => {
    const order = { legendary: 1, epic: 2, rare: 3 };
    return order[rarity] || 4;
  };

  // Organize items
  const limitedStockItems = allShopItems.filter(item =>
    item.global_stock_limit !== null || item.stock_limit !== null
  );

  const regularItems = allShopItems.filter(item =>
    item.global_stock_limit === null && item.stock_limit === null
  );

  // Sort limited items by rarity
  limitedStockItems.sort((a, b) => {
    const rarityDiff = getRarityOrder(a.rarity) - getRarityOrder(b.rarity);
    if (rarityDiff !== 0) return rarityDiff;
    return a.price - b.price;
  });

  // Group regular items by currency type (gold first, then silver), except spin tokens
  const goldItems = regularItems.filter(item =>
    item.shop_type === 'gold' && item.item_type !== 'spin_token'
  );
  const silverItems = regularItems.filter(item =>
    item.shop_type === 'silver' && item.item_type !== 'spin_token'
  );
  const spinTokens = regularItems.filter(item =>
    item.item_type === 'spin_token'
  );

  // Sort each group by rarity
  goldItems.sort((a, b) => {
    const rarityDiff = getRarityOrder(a.rarity) - getRarityOrder(b.rarity);
    if (rarityDiff !== 0) return rarityDiff;
    return a.price - b.price;
  });

  silverItems.sort((a, b) => {
    const rarityDiff = getRarityOrder(a.rarity) - getRarityOrder(b.rarity);
    if (rarityDiff !== 0) return rarityDiff;
    return a.price - b.price;
  });

  spinTokens.sort((a, b) => a.price - b.price);

  // Organize final item order
  const organizedRegularItems = [...goldItems, ...silverItems, ...spinTokens];

  return (
    <div style={styles.container}>
      <div style={styles.tokenDisplay}>
        <div style={styles.tokenRow}>
          <span>🟡</span>
          <span>{user?.gold_swap_tokens || 0}</span>
        </div>
        <div style={styles.tokenRow}>
          <span>⚪</span>
          <span>{user?.silver_swap_tokens || 0}</span>
        </div>
      </div>

      <div style={styles.header}>
        <div style={styles.icon}>🪙</div>
        <div style={styles.title}>Swap Shop</div>
      </div>

      <div style={styles.infoCard}>
        <div style={styles.infoIcon}>💡</div>
        <div style={styles.infoText}>
          Use your gold and silver swap tokens to purchase exclusive items, spin tokens, and more!
        </div>
      </div>

      {limitedStockItems.length > 0 && (
        <>
          <div style={styles.sectionTitle}>⭐ Limited Stock Items</div>
          <div style={{...styles.itemsGrid, paddingBottom: '20px', paddingTop: '0'}}>
            {limitedStockItems.map(item => {
              const purchased = purchases[item.id] || 0;
              const canBuy = canPurchase(item);
              const soldOut = (item.global_stock_limit && item.global_stock_purchased >= item.global_stock_limit) ||
                             (item.stock_limit && purchased >= item.stock_limit);

              return (
                <div
                  key={item.id}
                  style={styles.itemCard}
                  onClick={() => openPurchaseModal(item)}
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
                      <span>{item.shop_type === 'gold' ? '🟡' : '⚪'}</span>
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

      {goldItems.length > 0 && (
        <>
          <div style={{...styles.sectionTitle, color: '#f59e0b'}}>🟡 Gold Token Items</div>
          <div style={{...styles.itemsGrid, paddingBottom: '20px'}}>
            {goldItems.map(item => {
              const purchased = purchases[item.id] || 0;
              const canBuy = canPurchase(item);
              const soldOut = (item.global_stock_limit && item.global_stock_purchased >= item.global_stock_limit) ||
                             (item.stock_limit && purchased >= item.stock_limit);

              return (
                <div
                  key={item.id}
                  style={styles.itemCard}
                  onClick={() => openPurchaseModal(item)}
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
                      <span>{item.shop_type === 'gold' ? '🟡' : '⚪'}</span>
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

      {silverItems.length > 0 && (
        <>
          <div style={{...styles.sectionTitle, color: '#9ca3af'}}>⚪ Silver Token Items</div>
          <div style={{...styles.itemsGrid, paddingBottom: '20px'}}>
            {silverItems.map(item => {
              const purchased = purchases[item.id] || 0;
              const canBuy = canPurchase(item);
              const soldOut = (item.global_stock_limit && item.global_stock_purchased >= item.global_stock_limit) ||
                             (item.stock_limit && purchased >= item.stock_limit);

              return (
                <div
                  key={item.id}
                  style={styles.itemCard}
                  onClick={() => openPurchaseModal(item)}
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
                      <span>{item.shop_type === 'gold' ? '🟡' : '⚪'}</span>
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

      {spinTokens.length > 0 && (
        <>
          <div style={styles.sectionTitle}>🎰 Spin Tokens</div>
          <div style={styles.itemsGrid}>
            {spinTokens.map(item => {
              const purchased = purchases[item.id] || 0;
              const canBuy = canPurchase(item);
              const soldOut = (item.global_stock_limit && item.global_stock_purchased >= item.global_stock_limit) ||
                             (item.stock_limit && purchased >= item.stock_limit);

              return (
                <div
                  key={item.id}
                  style={styles.itemCard}
                  onClick={() => openPurchaseModal(item)}
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
                      <span>{item.shop_type === 'gold' ? '🟡' : '⚪'}</span>
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

      {showPurchaseModal && selectedItem && (
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
            maxWidth: '400px',
            width: '100%',
            padding: '20px'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: '700' }}>
              Confirm Purchase
            </h2>

            <div style={{
              padding: '16px',
              background: '#2a2a2a',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: selectedItem.rarity ? getRarityColor(selectedItem.rarity) : '#3b82f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedItem.image_url ? (
                    <img src={selectedItem.image_url} alt={getItemName(selectedItem)} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  ) : selectedItem.item_type === 'spin_token' ? (
                    <img src="/spin-token.png" alt="Spin Token" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  ) : selectedItem.item_type === 'boost_token' ? (
                    <img src="/boost-token.png" alt="Boost Token" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  ) : selectedItem.item_type === 'live_token' ? (
                    <img src="/voice-token.png" alt="Voice Token" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  ) : selectedItem.item_type === 'bubble_token' ? (
                    <img src="/bubble-token.png" alt="Bubble Token" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '32px' }}>✨</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {getItemName(selectedItem)}
                  </div>
                  {selectedItem.quantity && selectedItem.quantity > 1 && (
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      x{selectedItem.quantity}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {(() => {
                const tokenField = selectedItem.shop_type === 'gold' ? 'gold_swap_tokens' : 'silver_swap_tokens';
                const maxAffordable = Math.floor(user[tokenField] / selectedItem.price);
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#2a2a2a',
                          color: '#fff',
                          fontSize: '18px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: purchaseQuantity <= 1 ? 0.5 : 1
                        }}
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        disabled={purchaseQuantity <= 1}
                      >
                        −
                      </button>
                      <span style={{ fontSize: '18px', fontWeight: '700', minWidth: '40px', textAlign: 'center' }}>
                        {purchaseQuantity}
                      </span>
                      <button
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#2a2a2a',
                          color: '#fff',
                          fontSize: '18px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: purchaseQuantity >= maxAffordable ? 0.5 : 1
                        }}
                        onClick={() => setPurchaseQuantity(Math.min(maxAffordable, purchaseQuantity + 1))}
                        disabled={purchaseQuantity >= maxAffordable}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#1a1a1a',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>Total Price:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>{selectedItem.shop_type === 'gold' ? '🟡' : '⚪'}</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: selectedItem.shop_type === 'gold' ? '#f59e0b' : '#9ca3af' }}>
                    {selectedItem.price * purchaseQuantity}
                  </span>
                </div>
              </div>
            </div>

            {purchaseError && (
              <div style={{
                padding: '12px',
                background: '#7f1d1d',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#fca5a5'
              }}>
                {purchaseError}
              </div>
            )}

            <div style={{
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
                  setShowPurchaseModal(false);
                  setSelectedItem(null);
                  setPurchaseError('');
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedItem.shop_type === 'gold' ? '#f59e0b' : '#9ca3af',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={handlePurchase}
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
