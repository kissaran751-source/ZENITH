import React from 'react';

export default function ComingSoon() {
  return (
    <div style={{ margin: '14px 16px 0' }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '24px',
        padding: '30px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
        <div style={{
          fontFamily: 'Sora', fontWeight: 700, fontSize: '15px', color: '#fff',
        }}>
          More Tasks Coming Soon
        </div>
        <div style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: 'DM Sans',
        }}>
          New earn opportunities dropping soon
        </div>
      </div>
    </div>
  );
}
