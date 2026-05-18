import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function StorePreviewCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      style={{
        marginTop: '20px',
        borderRadius: '32px',
        position: 'relative',
        overflow: 'hidden',
        background: `
          linear-gradient(
            145deg,
            #111827 0%,
            #0f172a 35%,
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
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 100% 0%, rgba(59,130,246,0.15) 0%, transparent 50%)' }} />
      
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '-0.5px' }}>
              Discipline Store
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', marginTop: '4px' }}>
              Premium intentional spending
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontSize: '20px', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
            🛍️
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {/* Mini preview chips */}
          {['Tea Pass', 'Cold Drink', 'Restore Token'].map((item, i) => (
            <div key={i} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans', whiteSpace: 'nowrap' }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/store')}
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          border: 'none',
          borderRadius: '16px',
          color: '#fff',
          fontFamily: 'Sora',
          fontWeight: 700,
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Enter Store
      </motion.button>
    </motion.div>
  );
}
