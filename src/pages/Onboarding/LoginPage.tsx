import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
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
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid  = await getNextUid();
      await createUserDoc(cred.user.uid, uid, form.name, form.email);
      showToast("Profile created! Welcome to Zenith.", "success");
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

  // ─── Google Login ────────────────────────────────────────────
  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const firebaseUid = cred.user.uid;

      const userSnap = await getDoc(doc(db, 'users', firebaseUid));
      const email = cred.user.email || "";
      const isAdminEmail = email === ADMIN_EMAIL;
      
      if (!userSnap.exists()) {
        const uid  = await getNextUid();
        await createUserDoc(
          firebaseUid, uid,
          cred.user.displayName || 'Zenith User',
          email
        );
        showToast("Profile created! Welcome to Zenith.", "success");
      } else {
        // Force upgrade existing account to super admin if it matches admin email
        if (isAdminEmail && (!userSnap.data().role || userSnap.data().role !== 'SUPER_ADMIN')) {
          await updateDoc(doc(db, 'users', firebaseUid), {
            role: 'SUPER_ADMIN',
            adminAccess: true
          });
        }
        showToast("Welcome back!", "success");
      }
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

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Google Button */}
              <GoogleButton onClick={handleGoogle} loading={loading} />

            </motion.div>
          ) : (
            <motion.div key="login"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <input style={inputStyle} placeholder="🔢 Your UID (e.g. 1042) or Email"
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <GoogleButton onClick={handleGoogle} loading={loading} />

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

function GoogleButton({ onClick, loading }: any) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={loading}
      type="button"
      style={{
        width: '100%', padding: '16px', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px', background: 'rgba(255,255,255,0.05)',
        color: '#fff', fontFamily: 'Sora,sans-serif', fontWeight: 600, fontSize: '15px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        backdropFilter: 'blur(12px)',
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </motion.button>
  );
}



