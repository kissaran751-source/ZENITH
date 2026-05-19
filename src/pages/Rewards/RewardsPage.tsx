import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

import RewardsCarousel  from './RewardsCarousel';
import DailyLoginReward from './DailyLoginReward';
import TaskCard         from './TaskCard';
import ComingSoon       from './ComingSoon';
import RankJourney      from './RankJourney';
import AICoachCard      from './AICoachCard';
import ZenithCoin       from '../../components/ZenithCoin';

const DEFAULT_TASKS = [
  { id: '1', title: 'Complete a workout', description: 'At least 30 minutes of exercise.', reward: 100, icon: '🏋️' },
  { id: '2', title: 'Read 10 pages', description: 'Read a non-fiction book.', reward: 50, icon: '📚' },
  { id: '3', title: 'Meditate', description: '10 mins of mindfulness.', reward: 50, icon: '🧘' }
];

export default function RewardsPage() {
  const { user } = useAuth();
  const [tasks, setTasks]     = useState<any[]>(DEFAULT_TASKS);
  const [toast, setToast]     = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'#05080F',
      paddingBottom:'110px',
      overflowX:'hidden',
      color: '#fff',
    }}>

      {/* ── Sticky header ──────────────────── */}
      <div style={{
        position:'sticky', top:0, zIndex:50,
        padding:'16px 20px 14px',
        background:'rgba(5,8,15,0.90)',
        backdropFilter:'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div style={{
          fontFamily:'Sora', fontWeight:800, fontSize:'22px',
          color:'#fff', letterSpacing:'-0.5px',
        }}>Rewards</div>
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          background:'rgba(245,158,11,0.10)',
          border:'1px solid rgba(245,158,11,0.22)',
          borderRadius:'999px', padding:'7px 14px',
        }}>
          <ZenithCoin size={18} />
          <span style={{
            fontFamily:'Sora', fontWeight:700,
            fontSize:'14px', color:'#FBBF24',
          }}>{(user?.coins??0).toLocaleString()}</span>
        </div>
      </div>

      {/* ── Swipeable Top Section ───────────── */}
      <RewardsCarousel user={user as any} />

      {/* ── AI Coin Coach ──────────────────── */}
      <AICoachCard user={user as any} />

      {/* ── Daily Login ────────────────────── */}
      <DailyLoginReward
        user={user as any}
        onClaimed={(r: number) => showToast(`⚡ +${r} Zenith Coins credited!`)}
      />

      {/* ── Earn More ──────────────────────── */}
      <div style={{ padding:'26px 20px 14px' }}>
        <div style={{ fontFamily:'Sora', fontWeight:800, fontSize:'18px', color:'#fff' }}>
          Earn More Coins
        </div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'3px', fontFamily:'DM Sans' }}>
          Complete tasks · Coins credited instantly
        </div>
      </div>

      {tasks.length > 0 ? tasks.map(t => (
        <TaskCard key={t.id} task={t} user={user} showToast={showToast} />
      )) : <ComingSoon />}

      {/* ── Rank Journey ───────────────────── */}
      <div style={{ padding:'24px 0 12px 0' }}>
        <div style={{ padding:'0 20px 14px' }}>
          <div style={{ fontFamily:'Sora', fontWeight:800, fontSize:'18px', color:'#fff' }}>
            Rank Journey
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'3px', fontFamily:'DM Sans' }}>
            Tap to expand · Unlock ranks by maintaining your streak
          </div>
        </div>
        <RankJourney user={user as any} />
      </div>

      {/* ── Toast ──────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:24, x:'-50%' }}
            animate={{ opacity:1, y:0,  x:'-50%' }}
            exit={{ opacity:0, y:16, x:'-50%' }}
            style={{
              position:'fixed', bottom:'88px', left:'50%',
              background:'rgba(13,20,32,0.97)',
              backdropFilter:'blur(20px)',
              border:'1px solid rgba(59,130,246,0.30)',
              borderRadius:'16px', padding:'12px 24px',
              fontFamily:'Sora', fontWeight:600, fontSize:'14px', color:'#fff',
              boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
              zIndex:300, whiteSpace:'nowrap',
            }}
          >{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
