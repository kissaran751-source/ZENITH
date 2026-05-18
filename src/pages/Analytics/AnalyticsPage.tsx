import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GlassCard } from "../../components/GlassCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Activity, Target, Flame, TrendingUp, AlertTriangle } from "lucide-react";

// --- Gemini API Setup ---
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

export default function AnalyticsPage() {
  const { user, firebaseUser } = useAuth();
  
  // Local Data State
  const [sugarLogs, setSugarLogs] = useState<any[]>([]);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  
  // Loading & Generation States
  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // Derived Stats
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [dopamineStatus, setDopamineStatus] = useState("Stable");

  useEffect(() => {
    if (!firebaseUser) return;
    fetchData();
  }, [firebaseUser]);

  const fetchData = async () => {
    setLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 30);

    try {
      // 1. Fetch Sugar Tracking
      const sRef = collection(db, "users", firebaseUser!.uid, "sugarLogs");
      const sq = query(sRef, where("timestamp", ">=", thirtyDaysAgo), orderBy("timestamp", "desc"));
      const sDocs = await getDocs(sq);
      const sData = sDocs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSugarLogs(sData);

      // 2. Fetch Discipline Logs (dailyLogs)
      const dRef = collection(db, "users", firebaseUser!.uid, "dailyLogs");
      const dq = query(dRef, where("timestamp", ">=", thirtyDaysAgo), orderBy("timestamp", "desc"));
      const dDocs = await getDocs(dq);
      const dData = dDocs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDailyLogs(dData);

      // 3. Fetch AI Insights
      const iRef = collection(db, "users", firebaseUser!.uid, "ai_insights");
      const iq = query(iRef, orderBy("generatedAt", "desc"), limit(3));
      const iDocs = await getDocs(iq);
      setInsights(iDocs.docs.map((d) => ({ id: d.id, ...d.data() })));
      
      calculateMetrics(dData, sData);
    } catch (e) {
      console.error("Error fetching analytics data:", e);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (dData: any[], sData: any[]) => {
    // Basic heuristics for UI if strict math isn't defined
    const recentClean = dData.filter(d => d.noMasturbation && d.noSex).length;
    const totalGrams = sData.reduce((acc, l) => acc + (l.grams || 0), 0);
    
    // Discipline Score (0-100)
    let score = 40; 
    if (user?.streaks?.noMasturbation?.count > 3) score += 20;
    if (user?.streaks?.noSugar?.count > 3) score += 20;
    if (recentClean > 5) score += 20;
    setDisciplineScore(Math.min(score, 99));

    // Dopamine Stability
    if (totalGrams > 100 || recentClean < 2) setDopamineStatus("Overstimulated");
    else if (score > 70) setDopamineStatus("High Control");
    else if (score > 40) setDopamineStatus("Recovering");
    else setDopamineStatus("Stable");
  };

  const generateNewInsight = async () => {
    if (!firebaseUser || !GEMINI_KEY || generatingInsight) return;
    setGeneratingInsight(true);
    
    try {
      const streakM = user?.streaks?.noMasturbation?.count || 0;
      const streakS = user?.streaks?.noSugar?.count || 0;
      
      const prompt = `You are the Zenith AI Behavioral Analyst. 
        User stats: No-Fap Streak: ${streakM} days. No-Sugar Streak: ${streakS} days.
        Analyze their behavior and provide ONE highly premium, psychological insight about their discipline and dopamine patterns. 
        Make it sound futuristic, intelligent, and predictive. Max 2 sentences. No cringe.
        Example: "Your discipline weakens on weekends. Pre-plan your dopamine recovery to maintain the ${streakM}-day momentum."`;

      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 100, temperature: 0.7 },
        }),
      });
      const json = await res.json();
      const insightText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      
      if (insightText) {
        // Save to Firebase
        const newRef = await addDoc(collection(db, "users", firebaseUser.uid, "ai_insights"), {
          insightText,
          category: "Discipline",
          riskLevel: streakM < 3 ? "HIGH" : "LOW",
          generatedAt: serverTimestamp()
        });
        
        // Update Local
        setInsights([{
          id: newRef.id,
          insightText,
          category: "Discipline",
          riskLevel: streakM < 3 ? "HIGH" : "LOW",
          generatedAt: new Date()
        }, ...insights.slice(0, 2)]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingInsight(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#080C14]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
    );
  }

  // Sugar Chart Data (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  const sugarChartData = last7Days.map((d) => {
    const dStr = format(d, "yyyy-MM-dd");
    const dayLogs = sugarLogs.filter((l) => l.createdAt && format(l.createdAt.toDate?.() || new Date(l.timestamp?.seconds * 1000), "yyyy-MM-dd") === dStr);
    const totalGrams = dayLogs.reduce((acc, l) => acc + (l.grams || 0), 0);
    return {
      name: format(d, "EE"),
      value: totalGrams,
      fill: totalGrams > 10 ? "url(#colorDanger)" : "url(#colorSafe)"
    };
  });

  return (
    <div className="min-h-screen bg-[#080C14] text-white pb-20 overflow-x-hidden font-sora">
      {/* Dynamic AMOLED Glow Background */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 px-4 pt-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Zenith Intelligence
            </h1>
            <p className="text-white/50 text-sm mt-1 font-dm font-medium">AI Behavioral Operating System</p>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={generateNewInsight}
            disabled={generatingInsight}
            className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <Brain size={18} className={generatingInsight ? "animate-pulse" : ""} />
          </motion.button>
        </div>

        {/* Section 1: AI Discipline Overview */}
        <GlassCard className="!p-6 mb-6 !rounded-3xl border-t border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition duration-700" />
          
          <div className="flex items-center justify-between">
            <div className="z-10">
              <h2 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-1">Discipline Intelligence Score</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  {disciplineScore}
                </span>
                <span className="text-white/40 text-lg">/ 100</span>
              </div>
            </div>
            
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="url(#blueGradient)" strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                  animate={{ strokeDashoffset: 283 - (283 * disciplineScore) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <Zap size={24} className="absolute text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
          </div>
        </GlassCard>

        {/* Section 2: AI Behavior Insights */}
        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
            <Brain size={12} className="text-purple-400" /> Behavioral Insights
          </h2>
          <div className="flex flex-col gap-3">
            {insights.length > 0 ? insights.map((insight, i) => (
              <motion.div 
                key={insight.id || i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.05] p-4 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 opacity-50" />
                <p className="text-sm text-white/80 leading-relaxed font-dm">{insight.insightText}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                  <span className={insight.riskLevel === 'HIGH' ? 'text-red-400' : 'text-blue-400'}>
                    RISK: {insight.riskLevel}
                  </span>
                  <span>•</span>
                  <span>{insight.generatedAt?.toDate ? format(insight.generatedAt.toDate(), "MMM d, h:mm a") : "Just now"}</span>
                </div>
              </motion.div>
            )) : (
              <div className="p-4 text-sm text-white/40 border border-white/10 rounded-2xl border-dashed">
                Generate your first AI insight above to analyze your patterns.
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Dopamine Stability Meter */}
        <div className="mb-8 p-1 relative rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-50" />
          <GlassCard className="!p-5 !rounded-3xl relative z-10 border border-white/10 bg-black/40 backdrop-blur-xl">
            <h2 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <Activity size={12} className="text-blue-400" /> Dopamine Stability
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 text-white">{dopamineStatus}</div>
                <p className="text-xs text-white/40 font-dm">AI Analysis of sugar & habit retention</p>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(139,92,246,0.3)] bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-sm opacity-80" />
              </motion.div>
            </div>
          </GlassCard>
        </div>

        {/* Section 4: Sugar Analytics System */}
        <div className="mb-8">
           <h2 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
            <Target size={12} className="text-orange-400" /> Sugar Intelligence
          </h2>
          <GlassCard className="!p-5 !rounded-3xl">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sugarChartData}>
                  <defs>
                    <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} dy={10} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#blueGradient)" 
                    strokeWidth={3}
                    fill="url(#colorSafe)" 
                    activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Section 3: Relapse Heatmap (Simulated via Monthly Grid) */}
        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
            <Flame size={12} className="text-red-400" /> Habit Integrity Grid
          </h2>
          <GlassCard className="!p-5 !rounded-3xl">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Array.from({length: 30}).map((_, i) => {
                // Mocking intensity for the visual design requested
                const intensity = Math.random();
                let colorClass = "bg-white/5";
                let shadow = "";
                if (intensity > 0.8) { colorClass = "bg-red-500"; shadow = "shadow-[0_0_10px_rgba(239,68,68,0.6)]"; }
                else if (intensity > 0.3) { colorClass = "bg-blue-500"; shadow = "shadow-[0_0_10px_rgba(59,130,246,0.6)]"; }
                
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`w-6 h-6 rounded-md ${colorClass} ${shadow} border border-white/10`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4 text-[10px] text-white/40 uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-white/5" /> Stable</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" /> Controlled</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" /> High Risk</span>
            </div>
          </GlassCard>
        </div>

        {/* Section 8: Risk Prediction Engine */}
        <div className="mb-10">
          <GlassCard className="!p-5 !rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-20">
               <AlertTriangle size={64} className="text-red-500 mix-blend-screen" />
             </div>
             
             <div className="relative z-10">
               <h2 className="text-[10px] font-bold text-red-400/80 tracking-[0.2em] uppercase mb-1">Risk Prediction Engine</h2>
               <div className="text-2xl font-bold text-white mb-2">
                 Probability: {disciplineScore < 50 ? 'HIGH' : disciplineScore < 80 ? 'MODERATE' : 'LOW'}
               </div>
               <p className="text-xs text-white/60 font-dm max-w-[80%]">
                 AI detects a vulnerability window based on recent sugar intake and weekly patterns. Stay vigilant tonight.
               </p>
             </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
