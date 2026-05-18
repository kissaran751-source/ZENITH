import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import ZenithCoin from '../../components/ZenithCoin';

// Smooth animated number counter
function CountUp({ end, duration = 1400 }: { end: number, duration?: number }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.floor(end * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [end, duration]);
  return <>{val.toLocaleString()}</>;
}

// Generate a fake card-style number from UID
function generateCardNumber(uid = '1002') {
  const seed = Array.from(uid).reduce((acc, char) => acc + char.charCodeAt(0), 0) || 1002;
  const a = String(seed * 3 + 4471).padStart(4, '0').slice(-4);
  const b = String(seed * 7 + 8823).padStart(4, '0').slice(-4);
  const c = String(seed * 13 + 2214).padStart(4, '0').slice(-4);
  const d = String(seed * 19 + 5567).padStart(4, '0').slice(-4);
  return `${a}  ${b}  ${c}  ${d}`;
}

export default function CoinCard({ user }: any) {
  const coins  = user?.coins ?? 0;
  const name   = user?.name  ?? 'Zenith User';
  const uid    = user?.uid   ?? '1002';
  const cardNo = generateCardNumber(uid);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        margin: '20px 16px 0',
        // ── The key: very large border radius like Amex/Apple Card ──
        borderRadius: '32px',
        position: 'relative',
        overflow: 'hidden',
        // ── Near-black with very subtle cold blue — like Amex Black ──
        background: `
          linear-gradient(
            145deg,
            #0E1420 0%,
            #0A1128 35%,
            #060D1A 65%,
            #050810 100%
          )
        `,
        // ── Multi-layer box shadow for premium card depth ──
        boxShadow: `
          0 2px 0 rgba(255,255,255,0.07) inset,
          0 -1px 0 rgba(0,0,0,0.8) inset,
          0 1px 0 rgba(255,255,255,0.04) inset,
          0 32px 64px rgba(0,0,0,0.7),
          0 16px 32px rgba(0,0,0,0.5),
          0 0 0 1px rgba(255,255,255,0.08)
        `,
        padding: '28px 26px 26px',
        minHeight: '210px',
        // ── No border — card edge is purely shadow ──
        border: 'none',
      }}
    >

      {/* ── Very subtle texture overlay (noise grain like real card) ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: '150px',
        opacity: 0.6,
        borderRadius: '32px',
      }} />

      {/* ── Extremely subtle blue gradient at top edge — like light hitting card ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '40%', pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.07) 0%, transparent 100%)',
        borderRadius: '32px 32px 0 0',
      }} />

      {/* ── Shimmer sweep — very subtle, slow ── */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        borderRadius: '32px', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          width: '60px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          animation: 'cardShimmer 7s ease-in-out infinite',
        }} />
      </div>

      {/* ════════════════════════════════════════
          ROW 1: Brand name top-left + Chip top-left area
          (Chip is on LEFT side, like real cards)
          ════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Left: Z coin + ZENITH wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ZenithCoin size={22} />
          <span style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '5px',
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
          }}>ZENITH</span>
        </div>

        {/* Right: NFC/contactless icon — subtle, top right */}
        <div style={{ opacity: 0.30, paddingTop: '2px' }}>
          {/* Contactless payment waves — 3 arcs */}
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
            <path d="M3 11 C3 6.5 6.5 3 11 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M3 11 C3 15.5 6.5 19 11 19" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M8 11 C8 8 9.8 5.5 12.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M8 11 C8 14 9.8 16.5 12.5 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M13 11 C13 9.5 13.8 8.2 15 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M13 11 C13 12.5 13.8 13.8 15 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <circle cx="18" cy="11" r="1.5" fill="white"/>
          </svg>
        </div>
      </div>

      {/* ════════════════════════════════════════
          ROW 2: Chip (LEFT side, like real card)
          ════════════════════════════════════════ */}
      <div style={{
        marginBottom: '22px',
        position: 'relative', zIndex: 1,
      }}>
        {/* EMV Chip — left aligned, like real credit cards */}
        <div style={{
          width: '44px',
          height: '34px',
          borderRadius: '7px',
          background: `
            linear-gradient(
              135deg,
              rgba(251,191,36,0.85) 0%,
              rgba(245,158,11,0.65) 40%,
              rgba(217,119,6,0.55) 70%,
              rgba(180,90,0,0.45) 100%
            )
          `,
          border: '1px solid rgba(251,191,36,0.45)',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.35),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            0 2px 8px rgba(0,0,0,0.4)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Chip contact pad grid lines */}
          <div style={{
            position: 'absolute', inset: '4px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr',
            gap: '2px',
          }}>
            {Array(9).fill(0).map((_, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.18)',
                borderRadius: '1px',
              }} />
            ))}
          </div>
          {/* Center horizontal line on chip */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: '1px',
            background: 'rgba(0,0,0,0.25)',
            transform: 'translateY(-50%)',
          }} />
        </div>
      </div>

      {/* ════════════════════════════════════════
          ROW 3: Name + UID
          ════════════════════════════════════════ */}
      <div style={{ marginBottom: '18px', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          color: '#ffffff',
          letterSpacing: '0.3px',
          lineHeight: 1.2,
          textTransform: 'uppercase',
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.32)',
          marginTop: '3px',
          letterSpacing: '1.5px',
        }}>
          UID: {uid}
        </div>
      </div>

      {/* ════════════════════════════════════════
          ROW 4: Coin balance (primary info)
          ════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '22px',
        position: 'relative', zIndex: 1,
      }}>
        <ZenithCoin size={40} animate />
        <div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.28)',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            marginBottom: '5px',
          }}>
            ZENITH BALANCE
          </div>
          <div style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 800,
            fontSize: '38px',
            color: '#FBBF24',
            lineHeight: 1,
            letterSpacing: '-1.5px',
            textShadow: '0 0 32px rgba(245,158,11,0.45)',
          }}>
            <CountUp end={coins} duration={1200} />
          </div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.22)',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: '3px',
          }}>
            COINS
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          ROW 5: Card number (like credit card digits)
          — Monospace font, spaced groups
          ════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '3px',
          fontWeight: 600,
        }}>
          {cardNo}
        </div>
      </div>

    </motion.div>
  );
}

