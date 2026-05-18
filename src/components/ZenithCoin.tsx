import React from 'react';

// A premium 3D-style coin with depth, inner glow, shine highlight
// Like a real metal coin — not flat, not emoji
export default function ZenithCoin({ size = 28, animate = false }: { size?: number, animate?: boolean }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        flexShrink: 0,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // 3-layer gradient for 3D metal coin feel
        background: `
          radial-gradient(ellipse at 35% 30%, #FDE68A 0%, #F59E0B 35%, #D97706 65%, #92400E 100%)
        `,
        boxShadow: `
          0 ${size*0.07}px ${size*0.35}px rgba(245,158,11,0.70),
          0 ${size*0.03}px ${size*0.12}px rgba(245,158,11,0.45),
          inset 0 ${size*0.07}px ${size*0.18}px rgba(255,255,255,0.30),
          inset 0 -${size*0.07}px ${size*0.14}px rgba(0,0,0,0.25),
          inset 0 0 0 ${size*0.04}px rgba(255,255,255,0.10)
        `,
        animation: animate ? 'coinPulse 2.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Top-left specular highlight */}
      <div style={{
        position: 'absolute',
        top: '8%', left: '12%',
        width: '42%', height: '36%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'rotate(-30deg)',
        filter: 'blur(1.5px)',
      }} />
      {/* Bottom shadow */}
      <div style={{
        position: 'absolute',
        bottom: '8%', right: '10%',
        width: '30%', height: '25%',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '50%',
        filter: 'blur(2px)',
      }} />
      {/* Z symbol */}
      <span style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 900,
        fontSize: size * 0.42 + 'px',
        color: '#fff',
        textShadow: `
          0 ${size*0.04}px ${size*0.1}px rgba(0,0,0,0.6),
          0 0 ${size*0.08}px rgba(255,255,255,0.3)
        `,
        position: 'relative', zIndex: 1,
        letterSpacing: '-0.5px', lineHeight: 1,
        userSelect: 'none',
      }}>
        Z
      </span>
    </div>
  );
}
