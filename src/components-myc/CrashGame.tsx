
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Clock, MapPin, Activity, Shield, Target, Zap, History, BarChart3, Wifi } from 'lucide-react';
import { generateCrashPrediction } from '../services/gemini';
import { fetchCrashOdd } from '../services/database';
import { playSound } from '../services/audio';
import { CrashPredictionResult, GameState, AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface CrashGameProps {
  onBack: () => void;
  accessKeyData: AccessKey | null;
  language: Language;
}

export const CrashGame: React.FC<CrashGameProps> = ({ onBack, accessKeyData, language }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [result, setResult] = useState<CrashPredictionResult | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [userRegion, setUserRegion] = useState<string>('Unknown');
  const [timeLeft, setTimeLeft] = useState('');
  const [volatility, setVolatility] = useState(45);
  const t = translations[language];
  
  // Graph State
  const [graphPoints, setGraphPoints] = useState<{x: number, y: number}[]>([{x: 0, y: 1}]);
  
  const [history, setHistory] = useState<CrashPredictionResult[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('crash-ai-history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const regionName = timeZone.split('/')[1] || timeZone;
          setUserRegion(regionName.replace(/_/g, ' '));
      } catch (e) {
          setUserRegion('Global');
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('crash-ai-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!accessKeyData) return;
    if (accessKeyData.type === 'PERMANENT') {
        setTimeLeft('LIFETIME');
        return;
    }

    const updateTimer = () => {
        if (!accessKeyData.expiresAt) return;
        const now = Date.now();
        const diff = accessKeyData.expiresAt - now;

        if (diff <= 0) {
            setTimeLeft(t.expired);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${days}${t.days} ${hours}${t.hours} ${minutes}${t.minutes} ${seconds}${t.seconds}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [accessKeyData, language, t]);

  const animateValue = (time: number) => {
     if (!startTimeRef.current) startTimeRef.current = time;
     const progress = time - startTimeRef.current;
     
     // Simulation speed: 20 seconds scale
     const seconds = progress / 1000;
     const val = 1 + (0.15 * Math.pow(seconds, 2.2)); 
     
     setGraphPoints(prev => {
         const newX = seconds * 20;
         const newY = val;
         // Optimize: keep only last 50 points to prevent memory leak on long runs
         const newPoints = [...prev, { x: newX, y: newY }];
         if (newPoints.length > 200) return newPoints.slice(newPoints.length - 200);
         return newPoints;
     });

     if (val < 200) {
        setCurrentMultiplier(val);
        requestRef.current = requestAnimationFrame(animateValue);
     }
  };

  const handlePredict = async () => {
    if (gameState === GameState.ANALYZING) return;
    
    // Cleanup previous animation
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    startTimeRef.current = 0;

    playSound('plane-start');
    setGameState(GameState.ANALYZING);
    setResult(null);
    setCurrentMultiplier(1.00);
    setGraphPoints([{x: 0, y: 1}]);
    
    setVolatility(Math.floor(Math.random() * 60) + 20);

    // Start Animation Loop
    requestRef.current = requestAnimationFrame(animateValue);

    const apiStartTime = Date.now();
    
    // Initialize AI data promise
    const aiDataPromise = generateCrashPrediction();
    
    // Conditional Firebase Fetch: Only for PERMANENT keys
    let firebaseOdd: number | null = null;
    if (accessKeyData?.type === 'PERMANENT') {
        firebaseOdd = await fetchCrashOdd();
    }

    const aiData = await aiDataPromise;
    
    const elapsedTime = Date.now() - apiStartTime;
    const minTime = 3000;
    
    if (elapsedTime < minTime) {
        await new Promise(r => setTimeout(r, minTime - elapsedTime));
    }

    // Stop Animation
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    playSound('crash');
    
    // If we fetched a firebase odd successfully, use it. Otherwise use the AI generated one (random 1.00 - 3.00)
    const finalCrashPoint = firebaseOdd !== null ? firebaseOdd : aiData.predictedCrash;
    
    const finalData: CrashPredictionResult = {
        ...aiData,
        predictedCrash: finalCrashPoint,
        safeCashout: parseFloat((finalCrashPoint * 0.9).toFixed(2)) 
    };

    setResult(finalData);
    setCurrentMultiplier(finalData.predictedCrash);
    
    // Add the final crash point to the graph visually
    setGraphPoints(prev => {
        const lastX = prev.length > 0 ? prev[prev.length - 1].x : 0;
        return [...prev, { x: lastX + 10, y: finalData.predictedCrash }];
    });
    
    setGameState(GameState.PREDICTED);
    setHistory(prev => [finalData, ...prev].slice(0, 10));
  };

  useEffect(() => {
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const getGraphPath = () => {
      if (graphPoints.length < 2) return "";
      
      const maxX = Math.max(100, graphPoints[graphPoints.length - 1].x);
      const maxY = Math.max(2, currentMultiplier * 1.3);
      
      const width = 400;
      const height = 250;
      
      const points = graphPoints.map(p => {
          const x = (p.x / maxX) * width;
          const y = height - ((p.y - 1) / (maxY - 1)) * (height - 40) - 20; 
          // Guard against NaN
          if (isNaN(x) || isNaN(y)) return `0,${height}`;
          return `${x},${y}`;
      });

      return `M 0,${height} L ${points.join(' L ')}`;
  };

  const getRocketTransform = () => {
      if (graphPoints.length < 2) return { x: 0, y: 230, rot: 0 };
      
      const maxX = Math.max(100, graphPoints[graphPoints.length - 1].x);
      const maxY = Math.max(2, currentMultiplier * 1.3);
      const width = 400;
      const height = 250;
      
      const lastPoint = graphPoints[graphPoints.length - 1];
      const prevPoint = graphPoints[graphPoints.length - 5] || graphPoints[0];
      
      const x = (lastPoint.x / maxX) * width;
      const y = height - ((lastPoint.y - 1) / (maxY - 1)) * (height - 40) - 20;

      const px = (prevPoint.x / maxX) * width;
      const py = height - ((prevPoint.y - 1) / (maxY - 1)) * (height - 40) - 20;
      
      const angle = Math.atan2(y - py, x - px) * (180 / Math.PI);
      
      return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 230 : y, rot: isNaN(angle) ? 0 : angle };
  };

  const graphPath = getGraphPath();
  const rocket = getRocketTransform();
  const isCrashed = gameState === GameState.PREDICTED;

  return (
    <div className="flex flex-col h-full relative pt-2">
      
      {/* Top Info Bar */}
      <div className="flex justify-center mb-6">
          <div className="bg-[#151518]/90 backdrop-blur border border-white/5 rounded-full px-5 py-2 flex items-center gap-6 shadow-xl z-50">
              <div className="flex flex-col items-center leading-none">
                   <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-400 tracking-wider">
                          {timeLeft}
                      </span>
                   </div>
                   <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
                       {accessKeyData?.name || 'USER'}
                   </span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col items-center leading-none">
                  <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                          {userRegion}
                      </span>
                  </div>
                  <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{t.region.toUpperCase()}</span>
              </div>
          </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex flex-col">
            <h1 className="text-3xl font-black text-white leading-none tracking-tight flex items-center gap-2">
                CRASH <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">PRO</span>
            </h1>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3" />
                {t.marketTrend}
            </span>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider hover:bg-zinc-800"
        >
          {t.back}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        
        {/* HOLOGRAPHIC GRAPH CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden flex flex-col min-h-[280px] bg-[#0c0c0e] border border-white/5 shadow-2xl group" ref={containerRef}>
            
            {/* SVG Graph Layer */}
            <div className="absolute inset-0 z-10 p-0 flex items-end">
                <svg viewBox="0 0 400 250" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <defs>
                        <linearGradient id="crashGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isCrashed ? "rgba(239, 68, 68, 0.4)" : "rgba(249, 115, 22, 0.4)"} />
                            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                        </linearGradient>
                    </defs>
                    
                    {/* Fill Area */}
                    <path 
                        d={`${graphPath} L 400,250 L 0,250 Z`} 
                        fill="url(#crashGradient)" 
                        className="transition-all duration-300"
                    />
                    
                    {/* Line Stroke */}
                    <path 
                        d={graphPath} 
                        fill="none" 
                        stroke={isCrashed ? "#ef4444" : "#f97316"} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="transition-colors duration-300"
                    />
                </svg>

                {/* Rocket Icon following the path */}
                <MotionDiv 
                    className="absolute w-8 h-8 flex items-center justify-center text-white z-20"
                    style={{ 
                        left: 0, 
                        top: 0, 
                        x: rocket.x - 16, 
                        y: rocket.y - 16, 
                        rotate: rocket.rot 
                    }}
                >
                    <Rocket className={`w-6 h-6 ${isCrashed ? 'text-red-500' : 'text-white'} drop-shadow-md`} />
                    {/* Engine Plume */}
                    {!isCrashed && gameState === GameState.ANALYZING && (
                         <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-6 bg-orange-500 blur-sm rounded-full animate-pulse origin-top" />
                    )}
                </MotionDiv>
            </div>

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
                <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-2 py-1 rounded border border-white/10">
                         <Wifi className={`w-3 h-3 ${isCrashed ? 'text-red-500' : 'text-purple-500'}`} />
                         <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Signal: {isCrashed ? 'LOST' : 'GOOD'}</span>
                     </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                     <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-2 py-1 rounded border border-white/10">
                         <Activity className="w-3 h-3 text-orange-500" />
                         <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Vol: {volatility}%</span>
                     </div>
                </div>
            </div>

            {/* Central Multiplier Display */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center p-6 rounded-3xl">
                     <div className={`text-6xl sm:text-7xl font-black tabular-nums tracking-tighter flex items-baseline transition-all duration-100 drop-shadow-2xl ${isCrashed ? 'text-red-500 scale-110' : 'text-white'}`}>
                         <span>{currentMultiplier.toFixed(2)}</span>
                         <span className={`text-4xl ml-2 ${isCrashed ? 'text-red-600' : 'text-orange-500'}`}>x</span>
                     </div>
                     <AnimatePresence>
                         {isCrashed && (
                             <MotionDiv 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg mt-2"
                             >
                                 CRASHED
                             </MotionDiv>
                         )}
                     </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Prediction Stats & Controls */}
        <div className="grid grid-cols-12 gap-3">
            
            {/* Left Col: Prediction Stats */}
            <div className="col-span-8 grid grid-cols-2 gap-3">
                 <div className="bg-[#121214] border border-white/5 p-3 rounded-2xl flex flex-col relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Target className="w-8 h-8 text-purple-500" />
                     </div>
                     <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider mb-1 flex items-center gap-1">
                         <Shield className="w-3 h-3" />
                         {t.safeCashout}
                     </span>
                     <div className="flex items-baseline gap-1 mt-auto">
                         <span className={`text-2xl font-black ${result ? 'text-white' : 'text-zinc-700'}`}>
                             {result ? result.safeCashout.toFixed(2) : '--'}
                         </span>
                         <span className="text-xs font-bold text-purple-500">x</span>
                     </div>
                 </div>

                 <div className="bg-[#121214] border border-white/5 p-3 rounded-2xl flex flex-col relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Zap className="w-8 h-8 text-orange-500" />
                     </div>
                     <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider mb-1 flex items-center gap-1">
                         <Activity className="w-3 h-3" />
                         {t.confidence}
                     </span>
                     <div className="flex items-baseline gap-1 mt-auto">
                         <span className={`text-2xl font-black ${result ? 'text-orange-500' : 'text-zinc-700'}`}>
                             {result ? result.confidence : '--'}
                         </span>
                         <span className="text-xs font-bold text-zinc-600">%</span>
                     </div>
                 </div>

                 {/* AI Analysis Console */}
                 <div className="col-span-2 bg-[#121214] border border-white/5 p-3 rounded-2xl relative overflow-hidden min-h-[80px] flex flex-col justify-center">
                     <div className="flex items-center gap-2 mb-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${gameState === GameState.ANALYZING ? 'bg-orange-500 animate-pulse' : 'bg-purple-500'}`} />
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{t.aiAnalysis}</span>
                     </div>
                     <p className="text-[10px] font-mono text-zinc-300 leading-relaxed line-clamp-2">
                         {gameState === GameState.ANALYZING ? (
                             <span className="text-orange-400 animate-pulse">{t.decryptingPattern}</span>
                         ) : result ? (
                             result.analysis
                         ) : (
                             <span className="text-zinc-600 italic">{t.systemIdle}</span>
                         )}
                     </p>
                 </div>
            </div>

            {/* Right Col: Big Button */}
            <div className="col-span-4">
                <button 
                     onClick={handlePredict}
                     disabled={gameState === GameState.ANALYZING}
                     className={`
                        w-full h-full group relative overflow-hidden rounded-2xl p-2 transition-all duration-300 shadow-xl flex flex-col items-center justify-center gap-2
                        ${gameState === GameState.ANALYZING 
                           ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
                           : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98] shadow-white/5'}
                     `}
                  >
                     {gameState === GameState.ANALYZING ? (
                        <>
                             <div className="w-8 h-8 border-4 border-zinc-400 border-t-zinc-600 rounded-full animate-spin" />
                             <span className="font-bold tracking-widest text-[9px] uppercase">{t.processing}</span>
                        </>
                     ) : (
                        <>
                             <div className="p-2 bg-orange-500 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                <Rocket className="w-6 h-6" />
                             </div>
                             <span className="font-black tracking-widest text-[10px] uppercase text-center leading-tight">
                                 {t.predictNext}
                             </span>
                        </>
                                          )}
                                     </button>
                                 </div>
                             </div>
                           </div>
                     
                            {/* History Toggle */}
                            <div className="mt-2 pt-2 border-t border-white/5">            <button 
                onClick={() => {
                    playSound('click');
                    setShowHistory(!showHistory);
                }}
                className="flex items-center justify-center w-full gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-400 transition-colors py-2"
            >
                <History className="w-3 h-3" />
                {showHistory ? t.hideHistory : t.viewHistory}
            </button>

            <AnimatePresence>
                {showHistory && (
                    <MotionDiv 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 space-y-2 pb-4">
                             {history.length === 0 ? (
                                <div className="text-center py-4 text-zinc-700 text-[10px] italic">
                                    {t.noHistory}
                                </div>
                             ) : (
                                history.map((h) => (
                                    <div key={h.id} className="bg-zinc-900/50 rounded-lg p-2.5 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                                                {new Date(h.timestamp).toLocaleTimeString()}
                                            </span>
                                            <span className="text-[9px] text-zinc-500 font-mono">
                                                ID: {h.id.substring(0,6)}
                                            </span>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                             <div className="flex flex-col items-end">
                                                <span className="text-[8px] text-zinc-500 uppercase font-bold">Safe Exit</span>
                                                <span className="text-[10px] text-zinc-300 font-mono">{h.safeCashout}x</span>
                                             </div>
                                             <div className={`px-2 py-1 rounded font-black text-sm min-w-[3.5rem] text-center ${h.predictedCrash >= 2.0 ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                 {h.predictedCrash.toFixed(2)}x
                                             </div>
                                        </div>
                                    </div>
                                ))
                             )}
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
       </div>
    </div>
  );
};
