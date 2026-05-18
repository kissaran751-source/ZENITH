import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import CoinCard from './CoinCard';
import StorePreviewCard from './StorePreviewCard';
import TransactionHistoryCard from './TransactionHistoryCard';
import { AppUser } from '../../contexts/AuthContext';

export default function RewardsCarousel({ user }: { user: AppUser }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', paddingBottom: '16px' }}>
      <div 
        ref={containerRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          padding: '0 16px',
          gap: '16px',
        }}
        className="hide-scrollbar"
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Card 1: Zenith Wallet */}
        <div style={{ scrollSnapAlign: 'center', flex: '0 0 calc(100vw - 32px)', maxWidth: '400px' }}>
          {/* Note: CoinCard has margin: '20px 16px 0' inside it. We should modify CoinCard or wrap it tightly */}
          <div style={{ marginTop: '-20px', marginLeft: '-16px', marginRight: '-16px' }}>
            <CoinCard user={user} />
          </div>
        </div>

        {/* Card 2: Discipline Store Preview */}
        <div style={{ scrollSnapAlign: 'center', flex: '0 0 calc(100vw - 32px)', maxWidth: '400px' }}>
          <StorePreviewCard />
        </div>

        {/* Card 3: Transaction History Preview */}
        <div style={{ scrollSnapAlign: 'center', flex: '0 0 calc(100vw - 32px)', maxWidth: '400px' }}>
          <TransactionHistoryCard />
        </div>

      </div>

      {/* Pagination dots (visual cue) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)'
          }} />
        ))}
      </div>
    </div>
  );
}
