import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

export default function AICoachCard({ user }: any) {
  const [tip, setTip]         = useState(localStorage.getItem('zenith_coin_tip') || '');
  const [loading, setLoading] = useState(false);
  const [canGen, setCanGen]   = useState(true);

  useEffect(() => {
    const last = localStorage.getItem('zenith_coin_tip_date');
    if (last && new Date(last).toDateString() === new Date().toDateString()) {
      setCanGen(false);
    }
  }, []);

  async function generate() {
    if (!canGen || loading) return;
    setLoading(true);
    try {
      const streak = Math.min(
        user?.streaks?.noMasturbation?.count ?? 0,
        user?.streaks?.noSex?.count ?? 0
      );
      const coins  = user?.coins ?? 0;
      const rank   = user?.rankHistory?.currentRank ?? 'novice';

      const prompt = `You are a coin rewards coach for Zenith, a discipline tracking app.
User stats: ${streak} day streak, ${coins} coins, rank: ${rank}.

Give a SHORT (2 sentences max), SPECIFIC, ACTIONABLE tip on:
1. How they can earn the most coins fastest based on their current streak
2. Which rank milestone they should target next and what coins they'll get

Be specific with numbers from this reward system:
- Daily login: 50-500 coins/day based on streak tier
- Rank coins: Novice(500), Iron Will(1K), Mind Master(1.5K), Aura(2K), Alchemist(5K), Sovereign(10K), Monk(50K)
- Streak freeze: can be bought with coins to protect streak

Max 2 sentences. Direct and motivating. No fluff.`;

      const res  = await fetch(GEMINI_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[{ parts:[{ text:prompt }] }],
          generationConfig:{ maxOutputTokens:100, temperature:0.8 },
        }),
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (text) {
        setTip(text);
        localStorage.setItem('zenith_coin_tip', text);
        localStorage.setItem('zenith_coin_tip_date', new Date().toISOString());
        setCanGen(false);
      }
    } catch(e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ margin:'14px 16px 0' }}>
      <div style={{
        background:'rgba(59,130,246,0.06)',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
        border:'1px solid rgba(59,130,246,0.20)',
        borderRadius:'22px',
        padding:'20px',
        position:'relative', overflow:'hidden',
      }}>
        {/* Glow bg */}
        <div style={{
          position:'absolute', top:'-20px', right:'-20px',
          width:'80px', height:'80px',
          background:'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />

        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
          <div style={{
            width:'36px', height:'36px',
            background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',
            borderRadius:'11px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'18px',
            boxShadow:'0 4px 14px rgba(59,130,246,0.45)',
            flexShrink:0,
          }}>🤖</div>
          <div>
            <div style={{ fontFamily:'Sora', fontWeight:700, fontSize:'14px', color:'#fff' }}>
              AI Coin Coach
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', fontFamily:'DM Sans' }}>
              Powered by Gemini · Daily tip
            </div>
          </div>
          {!canGen && (
            <div style={{
              marginLeft:'auto', fontSize:'10px',
              color:'rgba(255,255,255,0.25)',
              background:'rgba(255,255,255,0.05)',
              padding:'4px 10px', borderRadius:'999px',
              fontFamily:'DM Sans',
            }}>Today ✓</div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading"
              style={{ display:'flex', gap:'6px', justifyContent:'center', padding:'12px 0' }}>
              {[0,1,2].map(i => (
                <motion.div key={i}
                  animate={{ y:[-3,3,-3] }}
                  transition={{ duration:0.7, repeat:Infinity, delay:i*0.15 }}
                  style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#3B82F6' }}
                />
              ))}
            </motion.div>
          ) : tip ? (
            <motion.div key="tip"
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{
                fontSize:'13px', color:'rgba(255,255,255,0.70)',
                lineHeight:'1.7', fontFamily:'DM Sans',
                padding:'12px 14px',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:'12px',
                marginBottom:'14px',
              }}>
              💡 {tip}
            </motion.div>
          ) : (
            <motion.div key="placeholder"
              style={{
                fontSize:'13px', color:'rgba(255,255,255,0.30)',
                textAlign:'center', padding:'12px',
                fontFamily:'DM Sans',
                marginBottom:'14px',
              }}>
              Get a personalized tip on how to maximize your coin earnings today.
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale:0.95 }}
          onClick={generate}
          disabled={loading || !canGen}
          style={{
            width:'100%', padding:'12px',
            border:'none', borderRadius:'12px',
            background: loading||!canGen
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
            color: loading||!canGen ? 'rgba(255,255,255,0.25)' : '#fff',
            fontFamily:'Sora', fontWeight:700, fontSize:'13px',
            cursor: loading||!canGen ? 'not-allowed' : 'pointer',
            boxShadow: loading||!canGen ? 'none' : '0 4px 16px rgba(59,130,246,0.4)',
          }}>
          {loading ? 'Thinking...' : !canGen ? '✅ Come back tomorrow' : '✨ Get My Coin Strategy'}
        </motion.button>
      </div>
    </div>
  );
}
