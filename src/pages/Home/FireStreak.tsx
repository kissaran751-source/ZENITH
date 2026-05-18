import { motion } from "motion/react";
import React from "react";
import { getRankById } from "../../utils/rankLogic";

interface FireStreakProps {
  noMastStreak: { count: number; broken: boolean };
  noSexStreak: { count: number; broken: boolean };
  currentRankId: string;
}

export default function FireStreak({
  noMastStreak,
  noSexStreak,
  currentRankId,
}: FireStreakProps) {
  const mainStreak = Math.min(
    noMastStreak.broken ? 0 : noMastStreak.count,
    noSexStreak.broken ? 0 : noSexStreak.count,
  );

  const bothIntact = !noMastStreak.broken && !noSexStreak.broken;
  const oneBroken = (!noMastStreak.broken && noSexStreak.broken) || (noMastStreak.broken && !noSexStreak.broken);
  
  const currentRank = getRankById(currentRankId);

  return (
    <div style={{ textAlign: 'center', padding: '36px 24px 24px', position: 'relative' }}>

      {/* Background radial glow behind fire */}
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        width: '180px', height: '180px',
        background: bothIntact
          ? 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)'
          : oneBroken
            ? 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)'
            : 'none',
        borderRadius: '50%',
        pointerEvents: 'none',
        transition: 'background 1s ease',
      }} />

      {/* 3D Premium Fire Image */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <motion.img 
          initial={{ y: 20, scale: 0 }}
          animate={bothIntact ? { y: [0, -6, 0], scale: 1 } : { scale: 1 }}
          transition={{ 
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            scale: { type: "spring", bounce: 0.5 }
          }}
          src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/3D/fire_3d.png" 
          alt="Fire"
          style={{ 
            width: '120px', height: '120px', objectFit: 'contain',
            filter: bothIntact ? 'hue-rotate(200deg) saturate(2.5) brightness(1.2) drop-shadow(0 0 15px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(59,130,246,0.3))' : 'grayscale(1) opacity(0.4)',
            position: 'relative', zIndex: 2
          }}
        />

        {bothIntact && (
          <>
            <motion.div
              animate={{ y: [-10, -50], x: [-5, -15], opacity: [0, 1.5, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
              style={{ position: 'absolute', top: '30%', left: '35%', width: '8px', height: '18px', background: '#93C5FD', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px) drop-shadow(0 0 6px #3B82F6)', zIndex: 1, transform: 'rotate(-20deg)' }}
            />
            <motion.div
              animate={{ y: [-5, -60], x: [5, 10], opacity: [0, 1.5, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              style={{ position: 'absolute', top: '25%', left: '60%', width: '10px', height: '20px', background: '#BFDBFE', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px) drop-shadow(0 0 6px #3B82F6)', zIndex: 1, transform: 'rotate(15deg)' }}
            />
            <motion.div
              animate={{ y: [0, -45], x: [0, -5], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
              style={{ position: 'absolute', top: '20%', left: '48%', width: '6px', height: '14px', background: '#DBEAFE', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px) drop-shadow(0 0 4px #3B82F6)', zIndex: 1, transform: 'rotate(-5deg)' }}
            />
          </>
        )}
      </div>

      {/* Streak number — animated count */}
      <motion.div
        key={mainStreak}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '72px',
          color: '#fff', lineHeight: 1, letterSpacing: '-3px',
          textShadow: bothIntact ? '0 0 40px rgba(59,130,246,0.6)' : 'none',
        }}
      >
        {mainStreak}
      </motion.div>

      <div style={{
        fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '12px',
        letterSpacing: '4px', color: 'rgba(255,255,255,0.45)',
        marginTop: '6px', textTransform: 'uppercase',
      }}>
        Days Streak
      </div>

      {/* Rank badge below streak */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        marginTop: '12px', padding: '6px 16px',
        background: 'rgba(59,130,246,0.12)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '999px',
      }}>
        <span style={{ fontSize: '14px' }}>{currentRank?.icon}</span>
        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '13px',
          color: '#60A5FA' }}>{currentRank?.label}</span>
      </div>
    </div>
  );
}
