import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import {
  doc, getDoc, getDocs, collection,
  query, where, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';

const ADMIN_EMAIL = 'kissaran751@gmail.com';

export default function LoginPage() {
  const [tab, setTab] = useState<'create' | 'login'>('create');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', uid: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const state = (location.state as any) || {};
  const { score = 0, answers = {} } = state;

  // ─── Helpers ───────────────────────────────────────────────
  async function getNextUid() {
    const metaRef = doc(db, 'meta', 'config');
    const snap = await getDoc(metaRef);
    let current = 1000;
    if (snap.exists()) {
      current = snap.data().lastUid ?? 1000;
    }
    const next = current + 1;
    await setDoc(metaRef, { lastUid: next, adminUid: "1000" }, { merge: true });
    return String(next);
  }

  async function createUserDoc(firebaseUid: string, uid: string, name: string, email: string) {
  const isAdminEmail = email === ADMIN_EMAIL;

  await setDoc(doc(db, 'users', firebaseUid), {
      uid, name, email,
      role: isAdminEmail ? 'SUPER_ADMIN' : 'USER',
      adminAccess: isAdminEmail,
      createdAt: serverTimestamp(),
      theme: 'dark',
      coins: 0,
      onboardingDone: true,
      onboardingScore: score,
      onboardingAnswers: answers,
      streaks: {
        noMasturbation: { count: 0, lastChecked: "", broken: false, brokenAt: null },
        noSex:          { count: 0, lastChecked: "", broken: false, brokenAt: null },
        noSugar:        { count: 0, lastChecked: "", broken: false, brokenAt: null },
      },
      loginStreak:  { count: 0, lastLogin: "", claimedDays: [] },
      rankHistory:  { currentRank: 'novice', claimedRanks: ['novice'] },
      streakFreezes: 0,
      auraLevel: 0,
    });
  }

  // ─── Create Profile ─────────────────────────────────────────
  async function handleCreate() {
    setError('');
    if (!form.name.trim())                      return setError('Enter your name');
    if (!form.email.trim())                     return setError('Enter your email');
    if (form.password.length < 6)               return setError('Password must be 6+ characters');

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user && user.isAnonymous) {
        const credential = EmailAuthProvider.credential(form.email, form.password);
        await linkWithCredential(user, credential);
        await updateDoc(doc(db, 'users', user.uid), {
          name: form.name,
          email: form.email,
          role: form.email === ADMIN_EMAIL ? 'SUPER_ADMIN' : 'USER',
          adminAccess: form.email === ADMIN_EMAIL
        });
        showToast("Account protected successfully!", "success");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const uid  = await getNextUid();
        await createUserDoc(cred.user.uid, uid, form.name, form.email);
        showToast("Profile created! Welcome to Zenith.", "success");
      }
      navigate("/");
    } catch (e: any) {
      setError(e.message.replace('Firebase: ', ''));
    } finally { setLoading(false); }
  }

  // ─── Login with UID ─────────────────────────────────────────
  async function handleLogin() {
    setError('');
    if (!form.uid || !form.password) return setError('Enter UID and password');

    setLoading(true);
    try {
      if (form.uid === "kissaran751@gmail.com" || form.uid.includes("@")) {
          // fallback to email login if they typed email instead of UID
          await signInWithEmailAndPassword(auth, form.uid, form.password);
      } else {
        const q = query(collection(db, 'users'), where('uid', '==', form.uid));
        const snap = await getDocs(q);
        if (snap.empty) return setError('No account found with this UID');
        const email = snap.docs[0].data().email;
        await signInWithEmailAndPassword(auth, email, form.password);
      }
      showToast("Welcome back!", "success");
      navigate("/");
    } catch (e: any) {
      setError(e.message.replace('Firebase: ', ''));
    } finally { setLoading(false); }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    padding: '16px 18px',
    color: '#fff',
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-16 flex flex-col relative text-white" style={{ fontFamily: 'inherit' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-20 cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10, maxWidth: '400px', margin: '0 auto', width: '100%' }}>

        {/* Tab Switch */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '4px', marginBottom: '4px',
        }}>
          {(['create','login'] as const).map(t => (
            <motion.button key={t} onClick={() => { setTab(t); setError(''); }}
              whileTap={{ scale: 0.97 }}
              type="button"
              style={{
                border: 'none', borderRadius: '11px', padding: '12px',
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', transition: 'all 0.25s',
                background: tab === t ? '#3B82F6' : 'transparent',
                color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: tab === t ? '0 4px 16px rgba(59,130,246,0.4)' : 'none',
              }}>
              {t === 'create' ? 'Create Profile' : 'Login'}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'create' ? (
            <motion.div key="create"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <input style={inputStyle} placeholder="👤 Full Name"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input style={inputStyle} placeholder="📧 Email Address" type="email"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />

              <div style={{ position: 'relative' }}>
                <input style={inputStyle} placeholder="🔒 Password (min 6 chars)"
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>

              <input style={inputStyle} placeholder="🔒 Confirm Password"
                type="password"
                value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />

              {error && <div style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center', padding: '4px 0' }}>{error}</div>}

              <PremiumButton onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Profile →'}
              </PremiumButton>

            </motion.div>
          ) : (
            <motion.div key="login"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <input style={inputStyle} placeholder="📧 Your Email Address" type="email"
                value={form.uid} onChange={e => setForm(f => ({ ...f, uid: e.target.value }))} />

              <div style={{ position: 'relative' }}>
                <input style={inputStyle} placeholder="🔒 Password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>

              {error && <div style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

              <PremiumButton onClick={handleLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Login →'}
              </PremiumButton>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PremiumButton({ children, onClick, disabled }: any) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
      type="button"
      style={{
        width: '100%', padding: '18px', border: 'none', borderRadius: '14px',
        background: disabled ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
        fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 6px 24px rgba(59,130,246,0.45)',
      }}>
      {children}
    </motion.button>
  );
}



