import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DevTools = ({ user, refreshUser, onClose }) => {
  const [goldAmount, setGoldAmount] = useState(1000);
  const [silverAmount, setSilverAmount] = useState(100);
  const [spinAmount, setSpinAmount] = useState(10);
  const [isOpen, setIsOpen] = useState(false);

  const addGoldTokens = async () => {
    try {
      await fetch(`${API_URL}/dev/add-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goldTokens: goldAmount,
          silverTokens: 0
        })
      });
      await refreshUser();
      alert(`Added ${goldAmount} gold tokens!`);
    } catch (error) {
      console.error('Error adding gold tokens:', error);
    }
  };

  const addSilverTokens = async () => {
    try {
      await fetch(`${API_URL}/dev/add-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goldTokens: 0,
          silverTokens: silverAmount
        })
      });
      await refreshUser();
      alert(`Added ${silverAmount} silver tokens!`);
    } catch (error) {
      console.error('Error adding silver tokens:', error);
    }
  };

  const addSpinTokens = async () => {
    try {
      await fetch(`${API_URL}/dev/add-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goldTokens: 0,
          silverTokens: 0,
          spinTokens: spinAmount
        })
      });
      await refreshUser();
      alert(`Added ${spinAmount} spin tokens!`);
    } catch (error) {
      console.error('Error adding spin tokens:', error);
    }
  };

  const resetInventory = async () => {
    if (!confirm('Reset inventory to starter items? This cannot be undone.')) return;

    try {
      await fetch(`${API_URL}/dev/reset-inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      await refreshUser();
      alert('Inventory reset to starter items!');
    } catch (error) {
      console.error('Error resetting inventory:', error);
    }
  };

  const resetPity = async () => {
    if (!confirm('Reset gacha pity counters? This cannot be undone.')) return;

    try {
      await fetch(`${API_URL}/dev/reset-pity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      alert('Pity counters reset!');
    } catch (error) {
      console.error('Error resetting pity:', error);
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      zIndex: 2000
    },
    toggleBtn: {
      padding: '12px 16px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
      width: '320px',
      background: '#1a1a1a',
      border: '2px solid #ef4444',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#ef4444',
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
    inputGroup: {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px'
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '8px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      color: '#fff',
      fontSize: '14px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '8px',
      background: '#2a2a2a',
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
    },
    buttonDanger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    fullButton: {
      width: '100%',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        🛠️ Dev Tools
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.title}>
            <span>⚙️</span>
            Developer Tools
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Add Tokens</div>
            <div style={styles.inputGroup}>
              <input
                type="number"
                value={goldAmount}
                onChange={(e) => setGoldAmount(parseInt(e.target.value) || 0)}
                style={styles.input}
                placeholder="Gold amount"
              />
              <button
                style={{...styles.button, ...styles.buttonPrimary}}
                onClick={addGoldTokens}
              >
                + Gold
              </button>
            </div>
            <div style={styles.inputGroup}>
              <input
                type="number"
                value={silverAmount}
                onChange={(e) => setSilverAmount(parseInt(e.target.value) || 0)}
                style={styles.input}
                placeholder="Silver amount"
              />
              <button
                style={{...styles.button, ...styles.buttonPrimary}}
                onClick={addSilverTokens}
              >
                + Silver
              </button>
            </div>
            <div style={styles.inputGroup}>
              <input
                type="number"
                value={spinAmount}
                onChange={(e) => setSpinAmount(parseInt(e.target.value) || 0)}
                style={styles.input}
                placeholder="Spin amount"
              />
              <button
                style={{...styles.button, ...styles.buttonPrimary}}
                onClick={addSpinTokens}
              >
                + Spin
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Inventory</div>
            <button
              style={{...styles.button, ...styles.buttonDanger, ...styles.fullButton}}
              onClick={resetInventory}
            >
              Reset Inventory
            </button>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Gacha</div>
            <button
              style={{...styles.button, ...styles.buttonDanger, ...styles.fullButton}}
              onClick={resetPity}
            >
              Reset Pity Counters
            </button>
          </div>

          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '12px' }}>
            Current: {user?.gold_swap_tokens || 0} gold, {user?.silver_swap_tokens || 0} silver, {user?.spin_tokens || 0} spin
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;
