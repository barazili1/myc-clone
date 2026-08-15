
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Diamond, RotateCcw, Clock, MapPin, Grip, Shield, Crosshair, Cpu, Scan } from 'lucide-react';
import { generateMinesPrediction } from '../services/gemini';
import { playSound } from '../services/audio';
import { GameState, MinesPredictionResult, AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface MinesGameProps {
    onBack: () => void;
    accessKeyData: AccessKey | null;
    language: Language;
}

export const MinesGame: React.FC<MinesGameProps> = ({ onBack, accessKeyData, language }) => {
    const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
    const [mineCount, setMineCount] = useState(3);
    const [safeSteps, setSafeSteps] = useState(5); // New state for Easy mode steps
    const [difficulty, setDifficulty] = useState<'Easy' | 'Hard'>('Hard');
    const [prediction, setPrediction] = useState<MinesPredictionResult | null>(null);
    const [userRegion, setUserRegion] = useState('Unknown');
    const [timeLeft, setTimeLeft] = useState('');
    const t = translations[language];

    useEffect(() => {
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const regionName = timeZone.split('/')[1] || timeZone;
            setUserRegion(regionName.replace(/_/g, ' '));
        } catch (e) { setUserRegion('Global'); }
    }, []);

    // Ensure safeSteps is valid when mineCount changes
    useEffect(() => {
        const maxSteps = 25 - mineCount;
        if (safeSteps > maxSteps) setSafeSteps(maxSteps);
        if (safeSteps < 1) setSafeSteps(1);
    }, [mineCount]);

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

    const handlePredict = async () => {
        if (gameState === GameState.ANALYZING) return;
        playSound('predict');
        setGameState(GameState.ANALYZING);
        setPrediction(null);

        await new Promise(r => setTimeout(r, 2000));

        // Determine number of steps to request
        // Easy mode: Use user selected safeSteps
        // Hard mode: Use undefined (service will pick a random realistic pattern)
        const stepsToRequest = difficulty === 'Easy' ? safeSteps : undefined;

        // Generate prediction
        const result = await generateMinesPrediction(mineCount, stepsToRequest);
        
        if (difficulty === 'Easy') {
            result.confidence = Math.min(99, result.confidence + 8); // Higher confidence for fewer spots
        }

        setPrediction(result);
        setGameState(GameState.PREDICTED);
        playSound('success');
    };

    const handleMineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setMineCount(val);
        if (gameState !== GameState.IDLE) {
            setGameState(GameState.IDLE);
            setPrediction(null);
        }
    };

    const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setSafeSteps(val);
        if (gameState !== GameState.IDLE) {
            setGameState(GameState.IDLE);
            setPrediction(null);
        }
    };
    
    const cells = Array.from({ length: 25 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full relative pt-2">
            
            {/* Top Info Bar */}
            <div className="flex justify-center mb-6">
                <div className="bg-[#151518]/90 backdrop-blur border border-white/5 rounded-full px-5 py-2 flex items-center gap-6 shadow-xl z-50">
                    <div className="flex flex-col items-center leading-none">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-cyan-500" />
                            <span className="text-[10px] font-bold text-cyan-400 tracking-wider">
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
                        MINES <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">PRO</span>
                    </h1>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                        <Grip className="w-3 h-3" />
                        {t.gridPattern}
                    </span>
                </div>
                <button 
                    onClick={onBack}
                    className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider hover:bg-zinc-800"
                >
                    {t.back}
                </button>
            </div>

            {/* Main Tactical Grid */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center mb-4 relative z-10">
                 <div className="p-1 rounded-3xl bg-gradient-to-b from-zinc-800/50 to-black/50 border border-white/5 relative shadow-2xl backdrop-blur-sm">
                    {/* Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg" />

                    <div className="grid grid-cols-5 gap-2 p-4 bg-[#050505] rounded-[1.2rem]">
                        {cells.map((idx) => {
                            const isSafe = prediction?.safeSpots.includes(idx);
                            
                            return (
                                <div
                                    key={idx}
                                    className={`
                                        w-11 h-11 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center relative overflow-hidden transition-all duration-300
                                        ${isSafe 
                                            ? 'bg-cyan-500/10 border-cyan-500/30 scale-[1.02] shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                            : 'bg-[#0e0e11] border-white/5 scale-100'}
                                    `}
                                >
                                    {isSafe ? (
                                        <div className="animate-[zoomIn_0.3s_ease-out]">
                                            {difficulty === 'Easy' ? (
                                                <Shield className="w-5 h-5 text-green-400 fill-green-400/20" />
                                            ) : (
                                                <Diamond className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${gameState === GameState.ANALYZING ? 'bg-cyan-500/30' : 'bg-zinc-800'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                 </div>
            </div>

            {/* Tactical Controls */}
            <div className="space-y-4 relative z-20">
                
                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2 bg-[#0c0c0e] p-1.5 rounded-xl border border-white/5">
                    <button
                        onClick={() => { playSound('toggle'); setDifficulty('Easy'); setGameState(GameState.IDLE); }}
                        className={`
                            relative py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 overflow-hidden
                            ${difficulty === 'Easy' ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}
                        `}
                    >
                        {difficulty === 'Easy' && (
                            <MotionDiv layoutId="mode-bg" className="absolute inset-0 bg-green-500 rounded-lg" />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            <Shield className="w-3 h-3" />
                            {t.easy}
                        </span>
                    </button>

                    <button
                        onClick={() => { playSound('toggle'); setDifficulty('Hard'); setGameState(GameState.IDLE); }}
                        className={`
                            relative py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 overflow-hidden
                            ${difficulty === 'Hard' ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}
                        `}
                    >
                        {difficulty === 'Hard' && (
                            <MotionDiv layoutId="mode-bg" className="absolute inset-0 bg-cyan-500 rounded-lg" />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            <Crosshair className="w-3 h-3" />
                            {t.hard}
                        </span>
                    </button>
                </div>

                {/* Sliders Module */}
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 space-y-4 shadow-lg">
                    {/* Mines Count */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Bomb className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.totalMines}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{mineCount}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="24" 
                            value={mineCount} 
                            onChange={handleMineChange}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                        />
                        <div className="flex justify-between mt-1 text-[8px] font-mono text-zinc-600">
                             <span>MIN: 1</span>
                             <span>MAX: 24</span>
                        </div>
                    </div>

                    {/* Safe Steps (Easy Mode Only) */}
                    <AnimatePresence>
                        {difficulty === 'Easy' && (
                            <MotionDiv 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="border-t border-white/5 pt-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.safeSpots}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{safeSteps}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max={Math.max(1, 25 - mineCount)} 
                                    value={safeSteps} 
                                    onChange={handleStepsChange}
                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
                                />
                                <div className="flex justify-between mt-1 text-[8px] font-mono text-zinc-600">
                                     <span>1 SPOT</span>
                                     <span className="text-green-500">SAFE MODE</span>
                                     <span>{25 - mineCount} SPOTS</span>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>

                {/* AI Console */}
                <div className="glass-panel p-3 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-center min-h-[70px]">
                     <div className="absolute top-0 right-0 p-2 opacity-5">
                         <Cpu className="w-8 h-8 text-white" />
                     </div>
                     <div className="flex items-center gap-2 mb-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${gameState === GameState.ANALYZING ? 'bg-cyan-500 animate-pulse' : 'bg-zinc-600'}`} />
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{t.aiAnalysis}</span>
                         {prediction && (
                            <span className="ml-auto text-[9px] font-mono text-cyan-400">{prediction.confidence}% CONFIDENCE</span>
                         )}
                     </div>
                     <p className="text-[10px] font-mono text-zinc-300 leading-tight">
                        {gameState === GameState.ANALYZING ? (
                            <span className="text-cyan-400 animate-pulse">{t.decryptingSeed}</span>
                        ) : prediction ? (
                            prediction.analysis
                        ) : (
                            <span className="text-zinc-600 italic">... AWAITING TARGET PARAMETERS ...</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto pb-4 pt-2">
                <button 
                    onClick={handlePredict}
                    disabled={gameState === GameState.ANALYZING}
                    className={`
                    w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 shadow-xl
                    ${gameState === GameState.ANALYZING 
                        ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
                        : difficulty === 'Easy'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/20'
                            : 'bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-800 hover:from-cyan-600 hover:to-blue-600 text-white shadow-cyan-900/20'
                    }
                    `}
                >
                    <div className="relative flex items-center justify-center gap-3">
                        {gameState === GameState.ANALYZING ? (
                            <>
                                <RotateCcw className="w-5 h-5 animate-spin text-white/50" />
                                <span className="font-bold tracking-widest text-sm">{t.scanning}</span>
                            </>
                        ) : (
                            <>
                                <Scan className="w-5 h-5 fill-current text-cyan-200" />
                                <span className="font-black tracking-widest text-sm">
                                    {t.identify} {difficulty === 'Easy' ? `${safeSteps} STEPS` : `SAFE ZONES`}
                                </span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};
