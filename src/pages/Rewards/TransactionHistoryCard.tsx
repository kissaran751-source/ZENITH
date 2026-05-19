import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function TransactionHistoryCard() {
  const { firebaseUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!firebaseUser || !firebaseUser.uid) return;
    
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    // Fetch recent transactions in realtime
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', firebaseUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      // Sort client-side to avoid needing a composite index
      data.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setTransactions(data.slice(0, 3));
    }, (err) => {
      console.error('Failed to fetch transactions', err);
    });
    
    return () => unsubscribe();
  }, [firebaseUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      style={{
        marginTop: '20px',
        borderRadius: '32px',
        position: 'relative',
        overflow: 'hidden',
        background: `
          linear-gradient(
            145deg,
            #1e1b4b 0%,
            #0f172a 50%,
            #020617 100%
          )
        `,
        boxShadow: `
          0 2px 0 rgba(255,255,255,0.07) inset,
          0 -1px 0 rgba(0,0,0,0.8) inset,
          0 1px 0 rgba(255,255,255,0.04) inset,
          0 32px 64px rgba(0,0,0,0.7),
          0 16px 32px rgba(0,0,0,0.5),
          0 0 0 1px rgba(255,255,255,0.08)
        `,
        padding: '28px 26px',
        minHeight: '210px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 100% 100%, rgba(139,92,246,0.1) 0%, transparent 60%)' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '18px', color: '#fff' }}>
            History
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', marginTop: '2px' }}>
            Recent store activity
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.2)' }}>
          📜
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
        {transactions.length > 0 ? transactions.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                {t.icon || '🛍️'}
              </div>
              <div>
                <div style={{ fontFamily: 'Sora', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{t.itemName}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans' }}>
                  {new Date(t.timestamp?.toMillis?.() || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '13px', color: '#F43F5E' }}>
              -{t.coinsSpent}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'DM Sans', margin: 'auto 0' }}>
            No recent transactions
          </div>
        )}
      </div>
    </motion.div>
  );
}
