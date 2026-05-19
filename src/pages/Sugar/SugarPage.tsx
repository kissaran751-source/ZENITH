import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../../components/GlassCard";
import { useToast } from "../../components/Toast";
import { Coffee, ChevronRight, Loader2, Sparkles, Activity } from "lucide-react";
import { getTodayStr, saveGuestUser } from "../../utils/guestLogic";

export default function SugarPage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingLog, setPendingLog] = useState<{ grams: number, explanation: string } | null>(null);

  const [analytics, setAnalytics] = useState({ sevenDays: 0, thirtyDays: 0, lastMonth: 0 });
  const [monthlyImprovement, setMonthlyImprovement] = useState<null | number>(null);

  // Onboarding state
  const isSetup = user?.sugarInfo?.onboardingDone;
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState("");
  const [dailyItems, setDailyItems] = useState("");

  const today = new Date().toISOString().split('T')[0];
  const logChecked = user?.streaks?.noSugar?.lastChecked === today;

  useEffect(() => {
    if (isSetup && user) {
      loadAnalytics();
    }
  }, [isSetup, user]);

  const loadAnalytics = async () => {
    try {
      const logsStr = localStorage.getItem('sugar_logs_v2') || '[]';
      const logs = JSON.parse(logsStr);
      
      const now = new Date();
      let sevenD = 0;
      let thirtyD = 0;
      let lastM = 0;

      logs.forEach((data: any) => {
        if (!data.createdAt) return;
        const date = new Date(data.createdAt);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
        
        if (diffDays <= 7) sevenD += data.grams || 0;
        if (diffDays <= 30) thirtyD += data.grams || 0;
        if (diffDays > 30 && diffDays <= 60) lastM += data.grams || 0;
      });

      setAnalytics({ sevenDays: sevenD, thirtyDays: thirtyD, lastMonth: lastM });
      
      if (lastM > 0) {
        const diff = thirtyD - lastM;
        const pct = (diff / lastM) * 100;
        setMonthlyImprovement(pct);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        sugarInfo: {
          onboardingDone: true,
          level,
          dailyConsumption: dailyItems
        }
      };
      saveGuestUser(updatedUser);
      setUser(updatedUser);
      showToast("Sugar tracking ready!", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const handleSendMessage = async (text: string, inlineData?: { data: string, mimeType: string }) => {
    if (!text.trim() && !inlineData) return;
    if (!user) return;
    
    setAnalyzing(true);
    setPendingLog(null);

    const parts = [];
    if (text) parts.push({ text });
    if (inlineData) parts.push({ inlineData });

    const newUserMsg = { role: "user", parts };
    const newHistory = [...messages, newUserMsg];
    setMessages(newHistory);
    setAiInput("");

    try {
      const res = await fetch("/api/sugar-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      const result = data.result; // schema: { reply, isComplete, estimatedGrams }

      const newModelMsg = { role: "model", parts: [{ text: result.reply }] };
      setMessages([...newHistory, newModelMsg]);

      if (result.isComplete) {
        setPendingLog({
          grams: result.estimatedGrams || 0,
          explanation: result.reply
        });
      }
    } catch (e: any) {
      showToast(e.message, "error");
      setMessages(messages); // revert
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (base64Data) {
          handleSendMessage("Analyze this image for sugar content.", { data: base64Data, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmLog = async () => {
    if (!pendingLog || !user) return;
    setAnalyzing(true);
    try {
      const logsStr = localStorage.getItem('sugar_logs_v2') || '[]';
      const logs = JSON.parse(logsStr);
      
      logs.push({
        text: pendingLog.explanation,
        grams: pendingLog.grams,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('sugar_logs_v2', JSON.stringify(logs));

      showToast(`Logged ${pendingLog.grams}g sugar.`, "success");
      setMessages([]);
      setPendingLog(null);
      loadAnalytics();

      // Ensure total daily sugar < 10g
      const now = new Date();
      let todayGrams = 0;
      logs.forEach((d: any) => {
         if (d.createdAt) {
            const date = new Date(d.createdAt);
            if (date.toDateString() === now.toDateString()) {
               todayGrams += d.grams || 0;
            }
         }
      });

      if (todayGrams > 10) {
        const updatedUser = { ...user, streaks: { ...user.streaks } };
        updatedUser.streaks.noSugar.broken = true;
        updatedUser.streaks.noSugar.brokenAt = new Date().toISOString();
        updatedUser.streaks.noSugar.count = 0;
        saveGuestUser(updatedUser);
        setUser(updatedUser);
        showToast("Streak broken! > 10g sugar today.", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const markNoSugarToday = async () => {
    if (!user) return;
    try {
      const updatedUser = { ...user, streaks: { ...user.streaks } };
      
      if (updatedUser.streaks.noSugar.broken) {
        updatedUser.streaks.noSugar.broken = false;
        updatedUser.streaks.noSugar.brokenAt = null;
        updatedUser.streaks.noSugar.count = 1;
      } else {
        updatedUser.streaks.noSugar.count = (updatedUser.streaks.noSugar.count || 0) + 1;
      }
      updatedUser.streaks.noSugar.lastChecked = today;

      saveGuestUser(updatedUser);
      setUser(updatedUser);
      showToast("Awesome! No sugar today.", "success");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  if (!user) return null;

  if (!isSetup) {
    return (
      <div className="pt-20 px-6 max-w-lg mx-auto pb-32 overflow-x-hidden relative min-h-screen">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
         
         <div className="text-center mb-8 relative z-10">
           <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Coffee className="text-purple-400" size={32} />
           </div>
           <h1 className="text-2xl font-sora font-bold text-white">Sugar Tracking</h1>
           <p className="text-white/50 text-sm mt-2">Let's set up your baseline.</p>
         </div>

         <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <GlassCard className="!p-6 relative z-10">
                  <h2 className="font-sora font-semibold text-white mb-4">What is your current sugar consumption level?</h2>
                  <div className="flex flex-col gap-3">
                    {["Low (Rarely eat sweets)", "Medium (Daily tea/coffee with sugar)", "High (Daily sweets, cold drinks)"].map(opt => (
                      <button key={opt} onClick={() => { setLevel(opt); setStep(2); }} className="p-4 rounded-xl border border-white/10 bg-white/5 text-left text-white text-sm hover:bg-white/10 transition">
                        {opt}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <GlassCard className="!p-6 relative z-10">
                  <h2 className="font-sora font-semibold text-white mb-4">What do you typically consume?</h2>
                  <p className="text-xs text-white/50 mb-4 tracking-wide">E.g., 2 cups tea, 1 cold drink, cookies</p>
                  <textarea
                    value={dailyItems}
                    onChange={(e) => setDailyItems(e.target.value)}
                    placeholder="Type your daily habits here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 mb-4 min-h-[100px]"
                  />
                  <button onClick={handleFinishOnboarding} disabled={!dailyItems || loading} className="w-full bg-purple-600 text-white font-sora font-semibold text-[14px] p-4 rounded-[14px] disabled:opacity-50">
                    {loading ? "Saving..." : "Start Tracking"}
                  </button>
                </GlassCard>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-4 max-w-lg mx-auto relative min-h-screen">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Hero Streak Section */}
      <div style={{ textAlign: 'center', padding: '10px 24px 20px', position: 'relative' }}>
         <div style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
            width: '180px', height: '180px', borderRadius: '50%', pointerEvents: 'none',
            background: user.streaks?.noSugar?.broken 
               ? 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' 
               : 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)'
         }} />
         
         <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <motion.img 
               initial={{ y: 20, scale: 0 }}
               animate={!user.streaks?.noSugar?.broken ? { y: [0, -6, 0], scale: 1 } : { scale: 1 }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", scale: { type: "spring", bounce: 0.5 } }}
               src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Candy/3D/candy_3d.png" 
               alt="Candy"
               style={{ 
                  width: '120px', height: '120px', objectFit: 'contain',
                  filter: !user.streaks?.noSugar?.broken ? 'hue-rotate(-20deg) saturate(1.5) brightness(1.1) drop-shadow(0 0 15px rgba(217,70,239,0.6)) drop-shadow(0 0 30px rgba(217,70,239,0.3))' : 'grayscale(1) opacity(0.4)',
                  position: 'relative', zIndex: 2
               }}
            />
            
            {!user.streaks?.noSugar?.broken && (
              <>
                <motion.div
                  animate={{ y: [-10, -50], x: [-5, -15], opacity: [0, 1.5, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
                  style={{ position: 'absolute', top: '30%', left: '35%', width: '8px', height: '18px', background: '#F0ABFC', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px) drop-shadow(0 0 6px #D946EF)', zIndex: 1, transform: 'rotate(-20deg)' }}
                />
                <motion.div
                  animate={{ y: [-5, -60], x: [5, 10], opacity: [0, 1.5, 0], scale: [0.5, 1.5, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                  style={{ position: 'absolute', top: '25%', left: '60%', width: '10px', height: '20px', background: '#E879F9', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px) drop-shadow(0 0 6px #D946EF)', zIndex: 1, transform: 'rotate(15deg)' }}
                />
                <motion.div
                  animate={{ y: [0, -45], x: [0, -5], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                  style={{ position: 'absolute', top: '20%', left: '48%', width: '6px', height: '14px', background: '#F5D0FE', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px) drop-shadow(0 0 4px #D946EF)', zIndex: 1, transform: 'rotate(-5deg)' }}
                />
              </>
            )}
         </div>
         
         <motion.div initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '64px', color: '#fff', lineHeight: 1, letterSpacing: '-2px', textShadow: '0 0 30px rgba(168,85,247,0.5)' }}>
            {user.streaks?.noSugar?.broken ? 0 : user.streaks?.noSugar?.count}
         </motion.div>
         
         <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.45)', marginTop: '8px', textTransform: 'uppercase' }}>
            Sugar-Free Days
         </div>
      </div>

      {logChecked ? (
         <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-[18px] p-5 flex items-center gap-4">
            <span className="text-[28px]">✅</span>
            <div>
               <div className="font-sora text-[15px] font-bold text-white">Log Complete</div>
               <div className="text-[12px] text-green-400 mt-1">Excellent discipline today.</div>
            </div>
         </div>
      ) : (
         <motion.button onClick={markNoSugarToday} whileTap={{ scale: 0.97 }} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #9333ea, #7e22ce)', boxShadow: '0 6px 20px rgba(147, 51, 234, 0.4)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={20} /> Mark Today As Clean
         </motion.button>
      )}

      {/* AI Log Input / Chat */}
      <GlassCard className="mt-6 !p-5 relative z-10 flex flex-col max-h-[500px]">
         <h2 className="font-sora font-semibold text-white text-[15px] flex items-center gap-2 mb-3 shrink-0">
            <Coffee size={18} className="text-purple-400" /> AI Sugar Analysis
         </h2>
         
         <div className="flex-1 overflow-y-auto mb-3 space-y-3 min-h-[150px] max-h-[300px] pr-2 custom-scrollbar">
            {messages.length === 0 ? (
               <p className="text-[12px] text-white/50 leading-relaxed text-center mt-8">
                  Let AI analyze your food. E.g. "I had a can of Coke". <br/>
                  Or upload a picture of a nutritional label.
               </p>
            ) : (
               messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`p-3 rounded-xl max-w-[85%] text-[13px] leading-relaxed ${
                        msg.role === 'user' 
                           ? 'bg-purple-600/40 border border-purple-500/30 text-white rounded-tr-sm' 
                           : 'bg-white/10 border border-white/5 text-white/90 rounded-tl-sm'
                     }`}>
                        {msg.parts[0]?.text || (msg.parts[0]?.inlineData ? "📷 Image uploaded" : "")}
                     </div>
                  </div>
               ))
            )}
            {analyzing && (
               <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 rounded-tl-sm">
                     <Loader2 className="animate-spin text-white/50" size={16} />
                  </div>
               </div>
            )}
            
            {pendingLog && !analyzing && (
               <div className="flex justify-start mt-2">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 w-full flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-[16px] text-green-400 font-bold">
                           Target: {pendingLog.grams}g Sugar
                        </span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={handleConfirmLog} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-[14px] font-bold transition shadow-lg shadow-green-500/20">
                           + Log {pendingLog.grams}g
                        </button>
                        <button onClick={() => { setPendingLog(null); setMessages([]); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg text-[14px] font-semibold transition">
                           Dismiss
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="mt-2 shrink-0 flex w-full">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleImageUpload} />
            
            <div className="flex flex-1 items-center gap-1 sm:gap-2 bg-white/5 border border-white/10 rounded-xl p-1 min-w-0">
               <button type="button" 
                  onClick={() => cameraInputRef.current?.click()} 
                  className="hover:bg-white/10 transition text-white w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                  title="Camera"
               >
                  📸
               </button>
               <button type="button" 
                  onClick={() => galleryInputRef.current?.click()} 
                  className="hover:bg-white/10 transition text-white w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                  title="Gallery"
               >
                  🖼️
               </button>
               <input 
                  value={aiInput} 
                  onChange={e => setAiInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage(aiInput)}
                  placeholder="What did you consume?" 
                  className="flex-1 bg-transparent px-2 min-w-0 text-[13px] sm:text-[14px] text-white focus:outline-none"
               />
               <button onClick={() => handleSendMessage(aiInput)} disabled={analyzing || !aiInput} className="bg-purple-600 disabled:opacity-50 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0">
                  <ChevronRight size={18} />
               </button>
            </div>
         </div>
      </GlassCard>

      {/* Analytics Display */}
      <GlassCard className="mt-4 !p-5 relative z-10">
         <h2 className="font-sora font-semibold text-white text-[15px] flex items-center gap-2 mb-4">
            <Activity size={18} className="text-blue-400" /> Sugar Analytics
         </h2>
         <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
               <div className="text-[11px] font-semibold text-white/40 tracking-wider mb-1">LAST 7 DAYS</div>
               <div className="font-sora text-[20px] font-bold text-white">{analytics.sevenDays.toFixed(1)}g</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
               <div className="text-[11px] font-semibold text-white/40 tracking-wider mb-1">LAST 30 DAYS</div>
               <div className="font-sora text-[20px] font-bold text-white">{analytics.thirtyDays.toFixed(1)}g</div>
            </div>
         </div>

         {monthlyImprovement !== null && (
            <div className={`p-3 rounded-xl border ${monthlyImprovement <= 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-[13px] flex items-center gap-2`}>
               {monthlyImprovement <= 0 ? "📉 Great job! You decreased sugar." : "📈 Careful, you consumed more sugar."}
               <span className="font-bold ml-auto">{Math.abs(monthlyImprovement).toFixed(1)}%</span>
            </div>
         )}
      </GlassCard>

    </div>
  );
}
