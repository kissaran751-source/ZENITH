import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, addDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import ZenithCoin from '../../components/ZenithCoin';

const DEFAULT_ITEMS = [
  { itemId: 'tea_pass', title: 'Tea Pass', category: 'Beverage Passes', description: 'Intentional tea allowance.', price: 1000, icon: '🍵', enabled: true, glowColor: 'rgba(245,158,11,0.5)' },
  { itemId: 'cold_300', title: 'Cold Drink 300ml', category: 'Beverage Passes', description: 'Small intentional refreshment.', price: 1500, icon: '🥤', enabled: true, glowColor: 'rgba(59,130,246,0.5)' },
  { itemId: 'cold_500', title: 'Cold Drink 500ml', category: 'Beverage Passes', description: 'Medium intentional refreshment.', price: 2500, icon: '🥤', enabled: true, glowColor: 'rgba(59,130,246,0.5)' },
  { itemId: 'cold_1l', title: 'Cold Drink 1L', category: 'Beverage Passes', description: 'Large intentional refreshment.', price: 5000, icon: '🥤', enabled: true, glowColor: 'rgba(59,130,246,0.5)' },
  { itemId: 'intimacy_pass', title: 'Intimacy Pass', category: 'Controlled Pleasure', description: 'Partnered intimacy allowance.', price: 1000, icon: '❤️', enabled: true, glowColor: 'rgba(244,63,94,0.5)' },
  { itemId: 'controlled_reset', title: 'Controlled Reset', category: 'Controlled Pleasure', description: 'Intentional personal reset.', price: 10000, icon: '🧘', enabled: true, glowColor: 'rgba(168,85,247,0.5)' },
  { itemId: 'restore_token', title: 'Restore Token', category: 'Recovery', description: 'Restore one broken streak.', price: 15000, icon: '🛡️', enabled: true, glowColor: 'rgba(34,197,94,0.5)' },
];

export default function StorePage() {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);
    const q = query(collection(db, 'store_items'), where('enabled', '==', true));
    const unsubscribe = onSnapshot(q, async (snap) => {
      try {
        if (snap.empty) {
          // Seed defaults
          const batch = DEFAULT_ITEMS.map(item => setDoc(doc(db, 'store_items', item.itemId), item));
          await Promise.all(batch);
          // Wait for the next snapshot to fire for the newly seeded items
        } else {
          setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in store sync:', err);
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching store items realtime:', err);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [firebaseUser]);

  const handlePurchase = async () => {
    if (!selectedItem || !user || !firebaseUser) return;
    if (user.coins < selectedItem.price) {
      setToast('Insufficient Zenith Coins');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    setPurchaseLoading(true);
    try {
      // Deduct coins
      const newBalance = user.coins - selectedItem.price;
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        coins: newBalance
      });
      // Save transaction
      await addDoc(collection(db, 'transactions'), {
        userId: firebaseUser.uid,
        itemId: selectedItem.id || selectedItem.itemId,
        itemName: selectedItem.title,
        category: selectedItem.category,
        coinsSpent: selectedItem.price,
        icon: selectedItem.icon,
        timestamp: serverTimestamp(),
        status: 'completed'
      });

      setToast(`Successfully purchased ${selectedItem.title}`);
      setSelectedItem(null);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Purchase failed', err);
      setToast('Transaction failed');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div style={{ minHeight: '100vh', background: '#05080F', paddingBottom: '120px', color: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '16px 20px', background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: 0 }}>
            ←
          </button>
          <div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>Discipline Store</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans' }}>Premium Intentional Spending</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <ZenithCoin size={16} />
          <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '13px', color: '#FBBF24' }}>{(user?.coins || 0).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {[1, 2].map((group) => (
              <div key={group}>
                <div style={{ width: '120px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                  {[1, 2, 3].map((item) => (
                    <div key={item} style={{ height: '180px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))' }}>🛍️</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '8px' }}>No store items available</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', maxWidth: '240px' }}>Items will appear here once added by the admin.</div>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} style={{ marginBottom: '36px' }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {category}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {items.filter(i => i.category === category).map((item, index) => (
                  <motion.div
                    key={item.id || item.itemId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '24px',
                      padding: '24px 16px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                      position: 'relative', overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50%', background: `radial-gradient(circle, ${item.glowColor || 'rgba(59,130,246,0.3)'} 0%, transparent 70%)`, opacity: 0.4, pointerEvents: 'none' }} />
                    
                    {item.image ? (
                      <div style={{ width: '42px', height: '42px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ fontSize: '42px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', position: 'relative', zIndex: 1 }}>
                        {item.icon}
                      </div>
                    )}
                    <div style={{ fontFamily: 'Sora', fontWeight: 600, fontSize: '14px', color: '#fff', marginBottom: '8px', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '13px', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px', position: 'relative', zIndex: 1 }}>
                      <ZenithCoin size={12} /> {item.price.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              style={{
                position: 'fixed', bottom: 'env(safe-area-inset-bottom, 24px)', left: '16px', right: '16px',
                background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '32px', padding: '32px 24px', zIndex: 101,
                boxShadow: '0 24px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05) inset'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {selectedItem.image ? (
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: -20, background: `radial-gradient(circle, ${selectedItem.glowColor || 'rgba(59,130,246,0.5)'} 0%, transparent 70%)`, opacity: 0.8, filter: 'blur(10px)', zIndex: 0 }} />
                    <img src={selectedItem.image} alt={selectedItem.title} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                  </div>
                ) : (
                  <div style={{ fontSize: '64px', marginBottom: '16px', filter: `drop-shadow(0 0 30px ${selectedItem.glowColor || 'rgba(59,130,246,0.6)'})` }}>
                    {selectedItem.icon}
                  </div>
                )}
                <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '24px', color: '#fff', marginBottom: '8px' }}>
                  {selectedItem.title}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans', marginBottom: '24px' }}>
                  {selectedItem.description}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.1)', padding: '12px 24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <ZenithCoin size={20} />
                  <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '20px', color: '#FBBF24' }}>{selectedItem.price.toLocaleString()}</span>
                </div>
              </div>

              {((user?.coins || 0) < selectedItem.price) && (
                <div style={{ textAlign: 'center', color: '#EF4444', fontSize: '13px', fontFamily: 'DM Sans', marginBottom: '16px', fontWeight: 600 }}>
                  ⚠️ You need {(selectedItem.price - (user?.coins || 0)).toLocaleString()} more coins
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontFamily: 'Sora', fontWeight: 600, fontSize: '15px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchaseLoading || (user?.coins || 0) < selectedItem.price}
                  style={{
                    flex: 1, padding: '16px',
                    background: (user?.coins || 0) < selectedItem.price ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    color: (user?.coins || 0) < selectedItem.price ? 'rgba(255,255,255,0.3)' : '#fff',
                    border: 'none', borderRadius: '16px', fontFamily: 'Sora', fontWeight: 600, fontSize: '15px',
                    boxShadow: (user?.coins || 0) < selectedItem.price ? 'none' : '0 8px 24px rgba(59,130,246,0.4)',
                    cursor: (user?.coins || 0) < selectedItem.price ? 'not-allowed' : 'pointer'
                  }}
                >
                  {purchaseLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            style={{ position: 'fixed', bottom: '88px', left: '50%', background: 'rgba(13,20,32,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '16px', padding: '12px 24px', fontFamily: 'Sora', fontWeight: 600, fontSize: '14px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200, whiteSpace: 'nowrap' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
