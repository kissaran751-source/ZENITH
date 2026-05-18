import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ZenithCoin from '../../components/ZenithCoin';

// Premium SVG badge per rank — like gaming rank badges
// Each has a unique shield/emblem shape with gradient fills
function RankBadge({ rank, size = 52, claimed, active }: any) {
  const configs: any = {
    novice: {
      outerColor: ['#6B7280','#4B5563'],
      innerColor: ['#9CA3AF','#6B7280'],
      symbol: '🌱', border: '#9CA3AF',
    },
    iron_will: {
      outerColor: ['#94A3B8','#64748B'],
      innerColor: ['#CBD5E1','#94A3B8'],
      symbol: '🛡️', border: '#CBD5E1',
    },
    mind: {
      outerColor: ['#3B82F6','#1D4ED8'],
      innerColor: ['#60A5FA','#3B82F6'],
      symbol: '🔱', border: '#60A5FA',
    },
    aura: {
      outerColor: ['#F97316','#EA580C'],
      innerColor: ['#FB923C','#F97316'],
      symbol: '🔥', border: '#FB923C',
    },
    alchemist: {
      outerColor: ['#8B5CF6','#6D28D9'],
      innerColor: ['#A78BFA','#8B5CF6'],
      symbol: '🦅', border: '#A78BFA',
    },
    sovereign: {
      outerColor: ['#DC2626','#991B1B'],
      innerColor: ['#F87171','#DC2626'],
      symbol: '👑', border: '#FCA5A5',
    },
    monk: {
      outerColor: ['#E2E8F0','#CBD5E1'],
      innerColor: ['#F8FAFC','#E2E8F0'],
      symbol: '🪷', border: '#F8FAFC',
    },
  };

  const cfg = configs[rank.id] || configs.novice;
  const opacity = !claimed && !active ? 0.35 : 1;

  return (
    <div style={{
      width: size, height: size,
      flexShrink: 0,
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity,
      filter: claimed ? 'none' : active ? 'none' : 'grayscale(0.7)',
    }}>
      {/* Outer shield (pentagon shape via clip-path) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${cfg.outerColor[0]}, ${cfg.outerColor[1]})`,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        boxShadow: active ? `0 0 20px ${cfg.border}66` : 'none',
      }} />
      {/* Inner shield (slightly smaller) */}
      <div style={{
        position: 'absolute',
        inset: '18%',
        background: `linear-gradient(160deg, ${cfg.innerColor[0]}40, ${cfg.innerColor[1]}20)`,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        border: `1.5px solid ${cfg.border}60`,
      }} />
      {/* Icon */}
      <span style={{
        fontSize: size * 0.38 + 'px',
        position: 'relative', zIndex: 1,
        filter: active ? `drop-shadow(0 0 6px ${cfg.border}99)` : 'none',
        animation: active ? 'floatUp 3s ease-in-out infinite' : 'none',
        display: 'inline-block'
      }}>
        {cfg.symbol}
      </span>
      {/* Claimed checkmark overlay */}
      {claimed && (
        <div style={{
          position: 'absolute', bottom: '-4px', right: '-4px',
          width: '18px', height: '18px',
          background: '#22C55E',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px',
          border: '2px solid #05080F',
          boxShadow: '0 2px 8px rgba(34,197,94,0.6)',
          zIndex: 2,
        }}>✓</div>
      )}
    </div>
  );
}

const RANKS = [
  { id:'novice',    label:'The Novice',    minDay:1,   maxDay:7,        coins:500,   color:'#9CA3AF' },
  { id:'iron_will', label:'Iron Will',     minDay:8,   maxDay:15,       coins:1000,  color:'#CBD5E1' },
  { id:'mind',      label:'Mind Master',   minDay:16,  maxDay:30,       coins:1500,  color:'#60A5FA' },
  { id:'aura',      label:'Aura Awakened', minDay:31,  maxDay:60,       coins:2000,  color:'#FB923C' },
  { id:'alchemist', label:'The Alchemist', minDay:61,  maxDay:90,       coins:5000,  color:'#A78BFA' },
  { id:'sovereign', label:'Sovereign',     minDay:91,  maxDay:150,      coins:10000, color:'#F87171' },
  { id:'monk',      label:'The Monk',      minDay:151, maxDay:Infinity, coins:50000, color:'#F8FAFC' },
];

function formatNum(n: number) {
  if (n>=1000) return (n/1000).toFixed(0)+'K';
  return String(n);
}

export default function RankJourney({ user }: any) {
  const [expanded, setExpanded] = useState(false);
  const mainStreak   = user?.streaks?.noSugar?.count ?? 0;
  const claimedRanks = user?.rankHistory?.claimedRanks ?? [];

  // Current active rank
  const currentRank = RANKS.slice().reverse().find(r => mainStreak >= r.minDay) || RANKS[0];

  return (
    <div style={{ margin:'8px 16px 0' }}>
      {/* ── Collapsed header / tap to expand ─── */}
      <motion.div
        whileTap={{ scale:0.98 }}
        onClick={() => setExpanded(e => !e)}
        style={{
          background:'rgba(255,255,255,0.04)',
          backdropFilter:'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          border:'1px solid rgba(255,255,255,0.09)',
          borderRadius: expanded ? '24px 24px 0 0' : '24px',
          padding:'18px 20px',
          cursor:'pointer',
          display:'flex', alignItems:'center', gap:'16px',
          transition:'border-radius 0.3s ease',
        }}
      >
        {/* Current rank badge */}
        <RankBadge rank={currentRank} size={52} claimed={claimedRanks.includes(currentRank.id)} active={true} />

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize:'10px', fontWeight:700, letterSpacing:'2.5px',
            color:'rgba(255,255,255,0.35)', textTransform:'uppercase',
            fontFamily:'DM Sans', marginBottom:'4px',
          }}>YOUR RANK</div>
          <div style={{
            fontFamily:'Sora', fontWeight:800, fontSize:'20px', color:'#fff',
            lineHeight:1,
          }}>{currentRank.label}</div>
          <div style={{
            fontSize:'12px', color:currentRank.color,
            fontFamily:'DM Sans', marginTop:'4px', fontWeight:600,
          }}>
            Day {mainStreak} · {claimedRanks.length}/{RANKS.length} ranks claimed
          </div>
        </div>

        {/* Expand arrow */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration:0.3 }}
          style={{
            width:'30px', height:'30px',
            background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'rgba(255,255,255,0.5)', fontSize:'14px',
            flexShrink:0,
          }}
        >▾</motion.div>
      </motion.div>

      {/* ── Expanded rank list ─────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
            style={{ overflow:'hidden' }}
          >
            <div style={{
              background:'rgba(255,255,255,0.03)',
              backdropFilter:'blur(28px)',
              WebkitBackdropFilter:'blur(28px)',
              border:'1px solid rgba(255,255,255,0.09)',
              borderTop:'none',
              borderRadius:'0 0 24px 24px',
              padding:'12px 16px 20px',
              display:'flex', flexDirection:'column', gap:'10px',
            }}>
              {RANKS.map((rank, i) => {
                const isClaimed = claimedRanks.includes(rank.id);
                const isActive  = mainStreak >= rank.minDay && mainStreak <= rank.maxDay;
                const isLocked  = !isClaimed && !isActive;

                // Progress within active rank
                const pct = isActive
                  ? Math.round(((mainStreak-rank.minDay)/(rank.maxDay===Infinity ? mainStreak+5 : rank.maxDay-rank.minDay+1))*100)
                  : isClaimed ? 100 : 0;

                return (
                  <motion.div
                    key={rank.id}
                    initial={{ opacity:0, x:-16 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay:i*0.06, duration:0.4, ease:[0.22,1,0.36,1] }}
                    style={{
                      display:'flex', alignItems:'center', gap:'14px',
                      padding:'14px 14px',
                      borderRadius:'18px',
                      background: isActive
                        ? `rgba(59,130,246,0.08)`
                        : isClaimed
                        ? `rgba(34,197,94,0.05)`
                        : 'rgba(255,255,255,0.025)',
                      border: isActive
                        ? '1px solid rgba(59,130,246,0.30)'
                        : isClaimed
                        ? '1px solid rgba(34,197,94,0.20)'
                        : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: isActive
                        ? '0 4px 20px rgba(59,130,246,0.12)'
                        : 'none',
                      opacity: isLocked ? 0.50 : 1,
                    }}
                  >
                    {/* Badge */}
                    <RankBadge rank={rank} size={46} claimed={isClaimed} active={isActive} />

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontFamily:'Sora', fontWeight:700,
                        fontSize:'14px',
                        color: isClaimed||isActive ? '#fff' : 'rgba(255,255,255,0.40)',
                      }}>{rank.label}</div>
                      <div style={{
                        fontSize:'11px',
                        color: isActive ? rank.color : 'rgba(255,255,255,0.28)',
                        fontFamily:'DM Sans', marginTop:'2px',
                      }}>
                        Day {rank.minDay}–{rank.maxDay===Infinity?'∞':rank.maxDay}
                      </div>

                      {/* Progress bar (active rank only) */}
                      {isActive && (
                        <div style={{ marginTop:'8px' }}>
                          <div style={{
                            height:'4px', background:'rgba(255,255,255,0.08)',
                            borderRadius:'999px', overflow:'hidden',
                          }}>
                            <motion.div
                              initial={{ width:0 }}
                              animate={{ width:`${pct}%` }}
                              transition={{ duration:1.0, ease:'easeOut', delay:0.3 }}
                              style={{
                                height:'100%', borderRadius:'999px',
                                background:`linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
                                boxShadow:`0 0 8px ${rank.color}66`,
                              }}
                            />
                          </div>
                          <div style={{
                            fontSize:'10px', color:'rgba(255,255,255,0.28)',
                            marginTop:'4px', fontFamily:'DM Sans',
                          }}>Day {mainStreak} · {pct}% to next rank</div>
                        </div>
                      )}
                    </div>

                    {/* Coins + status */}
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{
                        display:'flex', alignItems:'center', gap:'5px',
                        justifyContent:'flex-end',
                      }}>
                        <ZenithCoin size={15} />
                        <span style={{
                          fontFamily:'Sora', fontWeight:700, fontSize:'14px',
                          color: isClaimed||isActive ? '#FBBF24' : 'rgba(255,255,255,0.20)',
                        }}>{formatNum(rank.coins)}</span>
                      </div>
                      <div style={{
                        fontSize:'10px', marginTop:'4px', fontFamily:'DM Sans', fontWeight:600,
                        color: isClaimed ? '#22C55E' : isActive ? rank.color : 'rgba(255,255,255,0.20)',
                      }}>
                        {isClaimed ? '✅ Claimed' : isActive ? '⚡ Active' : '🔒 Locked'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
