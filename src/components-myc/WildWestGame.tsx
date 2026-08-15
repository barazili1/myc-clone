
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Target, RotateCcw, Clock, MapPin, Terminal, Activity, Skull, Coins, Star, Shield, Construction, Wrench, AlertTriangle } from 'lucide-react';
import { generateWildWestPrediction } from '../services/gemini';
import { playSound } from '../services/audio';
import { GameState, WildWestPredictionResult, AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface WildWestGameProps {
    onBack: () => void;
    accessKeyData: AccessKey | null;
    language: Language;
}

export const WildWestGame: React.FC<WildWestGameProps> = ({ onBack, accessKeyData, language }) => {
    const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
    const [prediction, setPrediction] = useState<WildWestPredictionResult | null>(null);
    const [userRegion, setUserRegion] = useState('Unknown');
    const [timeLeft, setTimeLeft] = useState('');
    const t = translations[language];

    // MAINTENANCE MODE FLAG
    const IS_MAINTENANCE = true;

    useEffect(() => {
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const regionName = timeZone.split('/')[1] || timeZone;
            setUserRegion(regionName.replace(/_/g, ' '));
        } catch (e) { setUserRegion('Global'); }
    }, []);

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
        
        playSound('plane-start'); // Use existing sound as placeholder
        setGameState(GameState.ANALYZING);
        setPrediction(null);

        // Simulated Delay for revolver spin effect
        await new Promise(r => setTimeout(r, 2500));

        const result = await generateWildWestPrediction();
        
        setPrediction(result);
        setGameState(GameState.PREDICTED);
        playSound('success');
    };

    // 5x3 Grid = 15 Cells
    const cells = Array.from({ length: 15 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full relative pt-2">
            
            {/* Top Info Bar */}
            <div className="flex justify-center mb-6">
                <div className="bg-[#151518]/90 backdrop-blur border border-white/5 rounded-full px-5 py-2 flex items-center gap-6 shadow-xl z-50">
                    <div className="flex flex-col items-center leading-none">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-400 tracking-wider">
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
                        WILD <span className="text-yellow-500">WEST</span>
                    </h1>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">{t.bountyHunter}</span>
                </div>
                <button 
                    onClick={onBack}
                    className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider hover:bg-zinc-800"
                >
                    {t.back}
                </button>
            </div>

            {IS_MAINTENANCE ? (
                /* MAINTENANCE UI */
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                    <MotionDiv 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-8 rounded-3xl border border-yellow-500/20 flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                    >
                         <div className="absolute inset-0 bg-yellow-500/5" />
                         
                         {/* Icon */}
                         <div className="relative mb-6">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl animate-pulse" />
                            <div className="w-20 h-20 bg-[#0c0c0e] border border-yellow-500/50 rounded-2xl flex items-center justify-center relative z-10 shadow-lg">
                                <Construction className="w-10 h-10 text-yellow-500" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-600 text-[#09090b] text-[10px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                System
                            </div>
                         </div>

                         <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
                             Maintenance
                         </h2>
                         <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-6">
                             The <span className="text-yellow-500 font-bold">Wild West</span> module is currently offline for critical probability matrix updates.
                         </p>

                         {/* Progress Bar Simulation */}
                         <div className="w-full bg-[#050505] rounded-lg p-3 border border-white/5 mb-6">
                            <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase mb-1.5">
                                <span>Optimization Status</span>
                                <span className="text-yellow-500 animate-pulse">84%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                                <MotionDiv 
                                    initial={{ width: "0%" }}
                                    animate={{ width: "84%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-yellow-500 relative"
                                />
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-2 text-[9px] font-mono text-zinc-600">
                                <Activity className="w-3 h-3 text-zinc-500" />
                                <span>EST. COMPLETION: 02:15:00</span>
                            </div>
                         </div>

                         <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-yellow-900/10 border border-yellow-500/10 rounded-lg text-[10px] text-yellow-600 font-bold uppercase tracking-wide">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Access Restricted</span>
                         </div>
                    </MotionDiv>
                </div>
            ) : (
                /* GAME UI */
                <>
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] mb-4 relative">
                        
                         {/* Decorative Frame */}
                         <div className="absolute inset-0 bg-[#0c0c0e] rounded-3xl border border-yellow-900/20 shadow-2xl z-0" />
                         <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-3xl" />
                         
                         <div className="grid grid-cols-5 gap-2 p-4 relative z-10 w-full max-w-sm">
                            {cells.map((idx) => {
                                const isSafe = prediction?.safeSpots.includes(idx);
                                // Find multiplier for this spot if safe
                                const multiplierIdx = prediction?.safeSpots.indexOf(idx);
                                const multiplier = isSafe && multiplierIdx !== undefined ? prediction?.bountyMultipliers[multiplierIdx] : null;

                                return (
                                    <MotionDiv
                                        key={idx}
                                        initial={false}
                                        animate={{
                                            scale: isSafe ? 1.05 : 1,
                                            backgroundColor: isSafe ? '#2a220a' : '#121214',
                                            borderColor: isSafe ? 'rgba(234, 179, 8, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                                            boxShadow: isSafe ? '0 0 15px rgba(234, 179, 8, 0.2)' : 'none'
                                        }}
                                        className={`aspect-[3/4] rounded-lg border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300`}
                                    >
                                        <AnimatePresence>
                                            {isSafe && (
                                                <MotionDiv
                                                    initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                                                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                                                    className="flex flex-col items-center"
                                                >
                                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)] mb-1" />
                                                    <span className="text-[10px] font-black text-yellow-200">{multiplier}x</span>
                                                </MotionDiv>
                                            )}
                                        </AnimatePresence>
                                        
                                        {/* Analyzing Effect */}
                                        {!isSafe && gameState === GameState.ANALYZING && (
                                            <MotionDiv 
                                                className="absolute inset-0 bg-yellow-500/10"
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: (idx % 5) * 0.1 }}
                                            />
                                        )}
                                        
                                        {/* Default State Icon */}
                                        {!isSafe && gameState !== GameState.ANALYZING && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                        )}
                                    </MotionDiv>
                                );
                            })}
                         </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="mb-4 space-y-3">
                         <div className="glass-panel p-4 rounded-xl border border-white/5 relative overflow-hidden min-h-[90px] flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                 <Shield className="w-12 h-12 text-yellow-500" />
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                                 <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${gameState === GameState.ANALYZING ? 'bg-orange-500 animate-pulse' : 'bg-yellow-500'}`} />
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                         {gameState === GameState.ANALYZING ? t.scouting : t.aiAnalysis}
                                     </span>
                                 </div>
                                 {prediction && (
                                    <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                        <Activity className="w-3 h-3 text-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-400">{prediction.confidence}% {t.confidence}</span>
                                    </div>
                                 )}
                            </div>

                            <p className="text-sm font-mono text-zinc-300 leading-relaxed line-clamp-2">
                                {gameState === GameState.ANALYZING ? (
                                    <span className="text-orange-400 animate-pulse">{t.decryptingPattern}</span>
                                ) : prediction ? (
                                    prediction.analysis
                                ) : (
                                    <span className="text-zinc-600 italic">{t.systemIdle}</span>
                                )}
                            </p>
                         </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pb-4">
                        <button 
                            onClick={handlePredict}
                            disabled={gameState === GameState.ANALYZING}
                            className={`
                            w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 shadow-xl
                            ${gameState === GameState.ANALYZING 
                                ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
                                : 'bg-gradient-to-r from-yellow-700 via-orange-700 to-yellow-800 hover:from-yellow-600 hover:to-orange-600 text-white shadow-orange-900/20'}
                            `}
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                            <div className="relative flex items-center justify-center gap-3">
                                {gameState === GameState.ANALYZING ? (
                                    <>
                                        <RotateCcw className="w-5 h-5 animate-spin text-white/50" />
                                        <span className="font-bold tracking-widest text-sm">{t.scouting}</span>
                                    </>
                                ) : (
                                    <>
                                        <Crosshair className="w-5 h-5 fill-current text-yellow-200" />
                                        <span className="font-black tracking-widest text-sm">{t.loadRevolver}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
