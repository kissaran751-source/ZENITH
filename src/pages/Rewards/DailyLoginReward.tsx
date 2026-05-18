import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import ZenithCoin from '../../components/ZenithCoin';

const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');
const getYesterdayStr = () => format(new Date(Date.now()-86400000), 'yyyy-MM-dd');

function getRewardForDay(day: number) {
  if (day >= 90) return 500;
  if (day >= 30) return 200;
  if (day >= 15) return 100;
  return 50;
}

// Which tier is the user in?
function getTierInfo(dayCount: number) {
  if (dayCount < 15)  return { label: 'Tier I',   color: '#60A5FA', nextAt: 15,  icon: '🌱', max: 14 };
  if (dayCount < 30)  return { label: 'Tier II',  color: '#34D399', nextAt: 30,  icon: '💪', max: 29 };
  if (dayCount < 90)  return { label: 'Tier III', color: '#FBBF24', nextAt: 90,  icon: '🔥', max: 89 };
  return               { label: 'Tier IV',  color: '#F472B6', nextAt: '∞', icon: '👑', max: dayCount + 30 };
}

export default function DailyLoginReward({ user, firebaseUid, onClaimed }: any) {
  const [loading, setLoading]       = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [showBurst, setShowBurst]   = useState(false);

  const today        = getTodayStr();
  const loginStreak  = user?.loginStreak || { count: 0, lastLogin: null, claimedDays: [] };
  const dayCount     = loginStreak.count || 0;
  const alreadyClaimed = (loginStreak.claimedDays || []).includes(today);
  const todayReward  = getRewardForDay(dayCount + 1);
  const tier         = getTierInfo(dayCount);

  async function handleClaim() {
    if (alreadyClaimed || loading || justClaimed) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', firebaseUid);
      const snap    = await getDoc(userRef);
      const data    = snap.data();
      const lastLogin = data?.loginStreak?.lastLogin;
      const yesterday = getYesterdayStr();
      const newCount  = (lastLogin === yesterday || lastLogin === today)
        ? (data?.loginStreak?.count || 0) + 1
        : 1;
      const reward = getRewardForDay(newCount);

      await updateDoc(userRef, {
        coins: increment(reward),
        'loginStreak.count':       newCount,
        'loginStreak.lastLogin':   today,
        'loginStreak.claimedDays': arrayUnion(today),
      });

      setJustClaimed(true);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1800);
      onClaimed && onClaimed(reward);
    } finally { setLoading(false); }
  }

  const pct = Math.min(((dayCount) / tier.max) * 100, 100);

  return (
    <div style={{ margin: '14px 16px 0', position: 'relative' }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '24px',
        padding: '20px 20px 18px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle top-right glow */}
        <div style={{
          position:'absolute', top:'-30px', right:'-30px',
          width:'100px', height:'100px',
          background: `radial-gradient(circle, ${tier.color}30 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'8px' }}>
              <span style={{ fontSize:'14px' }}>📅</span>
              <span style={{
                fontSize:'10px', fontWeight:700, letterSpacing:'2.5px',
                color: tier.color, textTransform:'uppercase',
                fontFamily:'DM Sans',
              }}>Daily Login Reward</span>
            </div>
            <div style={{
              fontFamily:'Sora', fontWeight:800, fontSize:'28px',
              color:'#fff', lineHeight:1,
            }}>Day {alreadyClaimed || justClaimed ? dayCount : dayCount+1}</div>
            <div style={{
              display:'flex', alignItems:'center', gap:'6px',
              marginTop:'6px', fontSize:'13px', color:'rgba(255,255,255,0.5)',
              fontFamily:'DM Sans',
            }}>
              Today's reward:
              <ZenithCoin size={15} />
              <span style={{ color:'#FBBF24', fontWeight:700, fontFamily:'Sora' }}>
                +{todayReward}
              </span>
            </div>
          </div>

          {/* Claim button */}
          <AnimatePresence mode="wait">
            {alreadyClaimed || justClaimed ? (
              <motion.div key="claimed"
                initial={{ scale:0.6, opacity:0 }}
                animate={{ scale:1, opacity:1 }}
                style={{
                  padding:'10px 18px',
                  background:'rgba(34,197,94,0.12)',
                  border:'1px solid rgba(34,197,94,0.35)',
                  borderRadius:'14px',
                  fontFamily:'Sora', fontWeight:700, fontSize:'13px',
                  color:'#22C55E',
                }}>✅ Claimed</motion.div>
            ) : (
              <motion.button key="btn"
                whileTap={{ scale:0.90 }}
                whileHover={{ scale:1.04 }}
                onClick={handleClaim}
                disabled={loading}
                style={{
                  background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                  border:'none', borderRadius:'14px',
                  padding:'13px 22px',
                  fontFamily:'Sora', fontWeight:700, fontSize:'14px', color:'#fff',
                  cursor:'pointer',
                  boxShadow:'0 6px 22px rgba(59,130,246,0.55)',
                  position:'relative', overflow:'hidden',
                }}>
                {/* Shimmer on button */}
                <div style={{
                  position:'absolute', top:0, bottom:0, width:'40px',
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
                  animation:'cardShimmer 3s ease-in-out infinite',
                  pointerEvents:'none',
                }} />
                {loading ? '...' : 'Claim ⚡'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Tier grid */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:'8px', marginTop:'18px',
        }}>
          {[
            { label:'Day 1–14',  reward:'50',  color:'#60A5FA' },
            { label:'Day 15–29', reward:'100', color:'#34D399' },
            { label:'Day 30–89', reward:'200', color:'#FBBF24' },
            { label:'Day 90+',   reward:'500', color:'#F472B6' },
          ].map((t, i) => {
            const isCurrentTier = tier.label === `Tier ${['I','II','III','IV'][i]}`;
            return (
              <div key={i} style={{
                background: isCurrentTier ? `rgba(${hexToRgbStr(t.color)},0.12)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isCurrentTier ? t.color+'50' : 'rgba(255,255,255,0.06)'}`,
                borderRadius:'12px', padding:'10px 8px',
                textAlign:'center',
                boxShadow: isCurrentTier ? `0 4px 14px rgba(${hexToRgbStr(t.color)},0.2)` : 'none',
              }}>
                <div style={{
                  fontFamily:'Sora', fontWeight:800, fontSize:'14px',
                  color: isCurrentTier ? t.color : 'rgba(255,255,255,0.25)',
                }}>+{t.reward}</div>
                <div style={{
                  fontSize:'9px', color:'rgba(255,255,255,0.3)',
                  fontFamily:'DM Sans', marginTop:'2px', lineHeight:'1.3',
                }}>{t.label}</div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop:'14px' }}>
          <div style={{
            display:'flex', justifyContent:'space-between',
            fontSize:'11px', color:'rgba(255,255,255,0.30)',
            marginBottom:'6px', fontFamily:'DM Sans',
          }}>
            <span>{tier.label} {tier.icon}</span>
            <span>Next tier: Day {tier.nextAt}</span>
          </div>
          <div style={{ height:'5px', background:'rgba(255,255,255,0.07)', borderRadius:'999px', overflow:'hidden' }}>
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${pct}%` }}
              transition={{ duration:1.2, ease:'easeOut' }}
              style={{
                height:'100%', borderRadius:'999px',
                background:`linear-gradient(90deg, ${tier.color}cc, ${tier.color})`,
                boxShadow:`0 0 10px ${tier.color}88`,
                position:'relative', overflow:'hidden',
              }}
            >
              {/* Shimmer on bar */}
              <div style={{
                position:'absolute', top:0, bottom:0, width:'30px',
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)',
                animation:'shimmerBar 2s ease-in-out infinite',
              }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Coin burst animation on claim */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            initial={{ opacity:1 }}
            animate={{ opacity:0 }}
            exit={{ opacity:0 }}
            transition={{ duration:1.5 }}
            style={{
              position:'absolute', top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              pointerEvents:'none', zIndex:10,
              fontFamily:'Sora', fontWeight:800, fontSize:'28px',
              color:'#FBBF24',
              textShadow:'0 0 20px rgba(245,158,11,0.8)',
            }}
          >
            <motion.div
              initial={{ y:0, scale:0.5 }}
              animate={{ y:-60, scale:1.3 }}
              transition={{ duration:1.2, ease:'easeOut' }}
            >
              +{todayReward} ⚡
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper
function hexToRgbStr(hex: string) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
