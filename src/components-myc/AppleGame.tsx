
import React, { useState, useEffect } from 'react';
import { Grid } from './Grid';
import { generatePrediction } from '../services/gemini';
import { fetchAppleGridData, updateAppleGridData } from '../services/database';
import { playSound } from '../services/audio';
import { GameState, PredictionResult, AccessKey, Language } from '../types';
import { translations } from '../translations';
import { 
    History, 
    ChevronRight, 
    Activity,
    Minus,
    Plus,
    Target,
    Zap,
    Shield,
    Skull,
    Eye,
    EyeOff,
    X,
    Terminal,
    Clock,
    MapPin,
    RefreshCw,
    Cpu,
    Scan,
    Grid3X3,
    ArrowUp,
    Play,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

interface AppleGameProps {
    onBack: () => void;
    accessKeyData: AccessKey | null;
    language: Language;
}

export const AppleGame: React.FC<AppleGameProps> = ({ onBack, accessKeyData, language }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [userRegion, setUserRegion] = useState<string>('Unknown');
  const [timeLeft, setTimeLeft] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const t = translations[language];
  
  // Settings State with Local Storage Persistence
  const [rowCount, setRowCount] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fortune-ai-rows');
            if (saved) {
                const parsed = parseInt(saved, 10);
                return Math.min(10, Math.max(5, parsed)); // Max 10 rows
            }
        } catch (e) {
            console.warn('Failed to load settings', e);
        }
    }
    return 10;
  });

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fortune-ai-difficulty');
            if (saved === 'Easy' || saved === 'Medium' || saved === 'Hard') {
                return saved;
            }
        } catch (e) {
            console.warn('Failed to load settings', e);
        }
    }
    return 'Hard';
  });

  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fortune-ai-last-result');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation
                if (parsed && Array.isArray(parsed.path)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to load last result', e);
        }
    }
    return null;
  });

  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Streak State with Local Storage Persistence
  const [winStreak, setWinStreak] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            return parseInt(localStorage.getItem('fortune-ai-winstreak') || '0', 10);
        } catch (e) { return 0; }
    }
    return 0;
  });

  const [lossStreak, setLossStreak] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            return parseInt(localStorage.getItem('fortune-ai-lossstreak') || '0', 10);
        } catch (e) { return 0; }
    }
    return 0;
  });

  const [revealRotten, setRevealRotten] = useState(false);
  
  // Modal State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
      // Detect Region
      try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const regionName = timeZone.split('/')[1] || timeZone;
          setUserRegion(regionName.replace(/_/g, ' '));
      } catch (e) {
          setUserRegion('Global');
      }
  }, []);

  // Sync state with local storage
  useEffect(() => {
      localStorage.setItem('fortune-ai-rows', rowCount.toString());
  }, [rowCount]);

  useEffect(() => {
      localStorage.setItem('fortune-ai-difficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
      localStorage.setItem('fortune-ai-winstreak', winStreak.toString());
      localStorage.setItem('fortune-ai-lossstreak', lossStreak.toString());
  }, [winStreak, lossStreak]);

  useEffect(() => {
      if (currentResult) {
          localStorage.setItem('fortune-ai-last-result', JSON.stringify(currentResult));
          if (gameState === GameState.IDLE) {
              setGameState(GameState.PREDICTED);
          }
      } else {
          localStorage.removeItem('fortune-ai-last-result');
      }
  }, [currentResult, gameState]);

  // Countdown Logic
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

  // Handle the prediction logic
  const handlePredict = async () => {
    if (gameState === GameState.ANALYZING) return;
    
    playSound('predict');
    setGameState(GameState.ANALYZING);
    setRevealRotten(false);
    setCurrentResult(null);

    const startTime = Date.now();
    
    // Attempt to fetch real grid data first - ONLY for PERMANENT keys
    let realGridData: boolean[][] | null = null;
    
    if (accessKeyData?.type === 'PERMANENT') {
        realGridData = await fetchAppleGridData();
    }
    
    const minTime = 1500;
    
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
    }
    
    let result: PredictionResult;

    if (realGridData) {
        // Generate path from real data
        const path: number[] = [];
        for (let i = 0; i < rowCount; i++) {
            if (i < realGridData.length) {
                const row = realGridData[i];
                const safeIndices = row.map((isSafe, idx) => isSafe ? idx : -1).filter(idx => idx !== -1);
                
                if (safeIndices.length > 0) {
                    const picked = safeIndices[Math.floor(Math.random() * safeIndices.length)];
                    path.push(picked);
                } else {
                    path.push(-1);
                }
            } else {
                 path.push(Math.floor(Math.random() * 5));
            }
        }
        
        result = {
            path,
            confidence: 99, 
            analysis: "Real-time server data interception confirmed. Probability matrix updated.",
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            gridData: realGridData
        };
    } else {
        // Fallback to simulation (used for temporary keys)
        result = await generatePrediction(rowCount, difficulty);
    }

    if (result.confidence === 0) {
        setGameState(GameState.ERROR);
    } else {
        setGameState(GameState.PREDICTED);
        playSound('success');
    }
    
    setCurrentResult(result);
    setHistory(prev => [result, ...prev].slice(0, 10));
  };

  const handleNewGame = async () => {
      if (isUpdating) return;
      
      setIsUpdating(true);
      playSound('click');
      
      // Update Firebase Data - Only allow if permanent key (Admin feature really)
      if (accessKeyData?.type === 'PERMANENT') {
          await updateAppleGridData();
      } else {
          // Fake delay for non-admins
          await new Promise(r => setTimeout(r, 800));
      }
      
      // Small delay for UX and propagation
      await new Promise(r => setTimeout(r, 1000));
      
      // Reset local state
      setGameState(GameState.IDLE);
      setCurrentResult(null);
      setRevealRotten(false);
      
      setIsUpdating(false);
      playSound('success');
  };

  const adjustRows = (delta: number) => {
    playSound('click');
    setRevealRotten(false);
    if (gameState === GameState.PREDICTED || currentResult) {
        setGameState(GameState.IDLE);
        setCurrentResult(null);
    }
    setRowCount(prev => Math.min(10, Math.max(5, prev + delta)));
  };

  const handleDifficultyChange = (level: 'Easy' | 'Medium' | 'Hard') => {
      playSound('toggle');
      setDifficulty(level);
  };

  const toggleReveal = () => {
    if (!currentResult) return;
    playSound('toggle');
    setRevealRotten(prev => !prev);
  };

  const openAnalysis = () => {
      if (!currentResult && gameState !== GameState.ANALYZING) return;
      playSound('click');
      setIsAnalysisOpen(true);
  };

  const closeAnalysis = () => {
      playSound('click');
      setIsAnalysisOpen(false);
  };

  // Difficulty Config
  const difficultyModes = [
      { id: 'Easy', icon: Shield, color: 'text-green-500', bg: 'bg-green-500', shadow: 'shadow-green-500/20' },
      { id: 'Medium', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500', shadow: 'shadow-yellow-500/20' },
      { id: 'Hard', icon: Skull, color: 'text-red-500', bg: 'bg-red-500', shadow: 'shadow-red-500/20' },
  ];

  return (
    <div className="flex flex-col h-full relative pt-2">
        
        {/* Top Info Bar (Centered) */}
        <div className="flex justify-center mb-6">
            <div className="bg-[#151518]/90 backdrop-blur border border-white/5 rounded-full px-5 py-2 flex items-center gap-6 shadow-xl z-50">
                <div className="flex flex-col items-center leading-none">
                     <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-bold text-green-400 tracking-wider">
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

        {/* Header Area */}
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white leading-none tracking-tight flex items-center gap-2">
                    APPLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">FORTUNE</span>
                </h1>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                    <Grid3X3 className="w-3 h-3" />
                    {t.patternRec}
                </span>
            </div>
            
            <button 
                onClick={onBack}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider hover:bg-zinc-800"
            >
                {t.back}
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
            
            {/* Grid Container */}
            <div className="flex-1 min-h-0 flex flex-col justify-center mb-6 relative group">
                 {/* Decorative Background for Grid */}
                 <div className="absolute inset-0 bg-[#0c0c0e] rounded-3xl border border-white/5 shadow-2xl -z-10" />
                 
                 <div className="relative z-10 p-2">
                     <Grid 
                        path={currentResult?.path || []} 
                        isAnalyzing={gameState === GameState.ANALYZING}
                        predictionId={currentResult?.id}
                        onCellClick={() => {}} 
                        rowCount={rowCount}
                        difficulty={difficulty}
                        revealRotten={revealRotten}
                        gridData={currentResult?.gridData}
                     />
                 </div>
            </div>

            {/* Config & Controls Deck */}
            <div className="space-y-4">
                
                {/* Configuration Module */}
                <div className="grid grid-cols-12 gap-3">
                    
                    {/* Row Selector - Compact Vertical */}
                    <div className="col-span-4 bg-[#121214] rounded-xl border border-white/5 p-3 flex flex-col justify-between">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            {t.gridHeight}
                         </span>
                         <div className="flex items-center justify-between bg-black/20 rounded-lg p-1 border border-white/5">
                             <button 
                                onClick={() => adjustRows(-1)} 
                                disabled={rowCount <= 5}
                                className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                             >
                                <Minus className="w-4 h-4" />
                             </button>
                             <span className="text-lg font-black font-mono text-white">{rowCount}</span>
                             <button 
                                onClick={() => adjustRows(1)} 
                                disabled={rowCount >= 10}
                                className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                             >
                                <Plus className="w-4 h-4" />
                             </button>
                         </div>
                    </div>

                    {/* Difficulty Selector - Visual Icons */}
                    <div className="col-span-8 bg-[#121214] rounded-xl border border-white/5 p-3 flex flex-col">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Risk Level
                         </span>
                         <div className="grid grid-cols-3 gap-2 flex-1">
                             {difficultyModes.map((mode) => (
                                 <button
                                    key={mode.id}
                                    onClick={() => handleDifficultyChange(mode.id as any)}
                                    className={`
                                        relative rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300
                                        ${difficulty === mode.id 
                                            ? `bg-zinc-900 border-white/20 ${mode.shadow}` 
                                            : 'bg-black/20 border-white/5 hover:bg-white/5'}
                                    `}
                                 >
                                    <mode.icon className={`w-5 h-5 ${difficulty === mode.id ? mode.color : 'text-zinc-600'} transition-colors`} />
                                    <span className={`text-[9px] font-bold uppercase ${difficulty === mode.id ? 'text-white' : 'text-zinc-600'}`}>
                                        {(t as any)[mode.id.toLowerCase()] || mode.id}
                                    </span>
                                    
                                    {/* Active Glow */}
                                    {difficulty === mode.id && (
                                        <div className={`absolute inset-0 ${mode.bg} opacity-5 rounded-xl`} />
                                    )}
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>

                {/* AI Console */}
                <div 
                    onClick={openAnalysis}
                    className={`glass-panel p-3 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-center min-h-[70px] transition-all duration-300 group
                    ${(currentResult || gameState === GameState.ANALYZING) ? 'cursor-pointer hover:bg-white/5 hover:border-white/10' : 'opacity-70 cursor-default'}
                `}
                >
                     <div className="absolute top-0 right-0 p-2 opacity-5">
                         <Cpu className="w-8 h-8 text-white" />
                     </div>
                     <div className="flex items-center gap-2 mb-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${gameState === GameState.ANALYZING ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{t.aiAnalysis}</span>
                         {currentResult && (
                             <span className="ml-auto text-[9px] font-mono text-green-400">{currentResult.confidence}% CONFIDENCE</span>
                         )}
                     </div>
                     <p className="text-[10px] font-mono text-zinc-300 leading-tight line-clamp-2">
                        {gameState === GameState.ANALYZING ? (
                            <span className="text-green-400 animate-pulse">{t.processingMatrix}</span>
                        ) : currentResult ? (
                            currentResult.analysis
                        ) : (
                            <span className="text-zinc-600 italic">... AWAITING TARGET PARAMETERS ...</span>
                        )}
                    </p>
                </div>

                {/* Action Buttons - Control Deck Style */}
                <div className="flex flex-col gap-3">
                    {/* Primary Predict Button */}
                    <button 
                        onClick={handlePredict}
                        disabled={gameState === GameState.ANALYZING || isUpdating}
                        className={`
                            relative w-full h-14 rounded-xl overflow-hidden font-black tracking-[0.2em] uppercase text-sm transition-all duration-200 group flex items-center justify-center gap-3
                            ${gameState === GameState.ANALYZING 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5 opacity-80' 
                                : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-400 shadow-lg shadow-green-900/20 active:scale-[0.99]'}
                        `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center gap-3">
                            {gameState === GameState.ANALYZING ? (
                                 <>
                                    <Scan className="w-5 h-5 animate-spin" />
                                    <span>{t.calculatingPath}</span>
                                 </>
                            ) : (
                                 <>
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>{t.generatePrediction}</span>
                                 </>
                            )}
                        </div>
                    </button>
                    
                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={handleNewGame}
                            disabled={isUpdating || gameState === GameState.ANALYZING}
                            className={`
                                h-12 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider
                                ${isUpdating 
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-600' 
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'}
                            `}
                         >
                            <RotateCcw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : 'group-hover:-rotate-180 transition-transform duration-500'}`} />
                            <span>Reset Grid</span>
                         </button>

                         <button 
                            onClick={toggleReveal}
                            disabled={!currentResult}
                            className={`
                                h-12 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider
                                ${!currentResult 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                                    : revealRotten 
                                        ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'}
                            `}
                        >
                            {revealRotten ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>{revealRotten ? t.hideRotten : t.revealRotten}</span>
                        </button>
                    </div>
                </div>

                {/* History Toggle */}
                <div className="pt-2 border-t border-white/5">
                    <button 
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
                                <div className="space-y-2 pb-4 pt-2">
                                    {history.length === 0 ? (
                                        <div className="text-center py-4 text-zinc-700 text-[10px] italic border border-dashed border-zinc-800 rounded-lg">
                                            {t.noHistory}
                                        </div>
                                    ) : (
                                        history.map((h) => (
                                            <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-zinc-500 font-mono">
                                                        {new Date(h.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 uppercase font-bold">
                                                        Path: {h.path.length} Steps
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-1.5 py-0.5 bg-green-500/10 rounded border border-green-500/20">
                                                        <span className="text-xs font-bold text-green-500">{h.confidence}%</span>
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
        </div>

        {/* Analysis Detail Modal */}
        <AnimatePresence>
            {isAnalysisOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <MotionDiv 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-lg bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-green-500" />
                                <h3 className="text-sm font-bold text-white tracking-wide">AI ANALYSIS PROTOCOL</h3>
                            </div>
                            <button onClick={closeAnalysis} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="p-6 font-mono text-sm leading-relaxed text-zinc-300 min-h-[200px] max-h-[60vh] overflow-y-auto bg-[#0c0c0e]">
                            {gameState === GameState.ANALYZING ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-green-500">
                                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span className="animate-pulse">{t.decryptingPattern}</span>
                                </div>
                            ) : currentResult ? (
                                 <div className="space-y-4">
                                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 border-b border-dashed border-zinc-800 pb-4">
                                        <div className="flex flex-col">
                                            <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">Session ID</span>
                                            <span className="font-mono text-zinc-400">{currentResult.id.split('-')[0]}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">Timestamp</span>
                                            <span className="font-mono text-zinc-400">{new Date(currentResult.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">{t.confidence}</span>
                                            <span className="font-mono text-green-400">{currentResult.confidence}%</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-900/5 border border-green-900/20 p-4 rounded-lg">
                                        <p className="text-green-100/90 leading-7">
                                            <span className="text-green-500 font-bold mr-2">›</span>
                                            {currentResult.analysis}
                                        </p>
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">Path Sequence Vector</span>
                                        <div className="flex flex-wrap gap-1">
                                            {currentResult.path.map((col, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">
                                                    R{i+1}:{col+1}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                 </div>
                            ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                                    <Terminal className="w-8 h-8 opacity-20" />
                                    <p>System idle. Initiate prediction to generate analysis.</p>
                                 </div>
                            )}
                        </div>
                        
                        <div className="p-3 border-t border-white/5 bg-white/5 flex justify-end">
                            <button onClick={closeAnalysis} className="px-4 py-2 text-xs font-bold uppercase bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                                {t.closeConsole}
                            </button>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};
