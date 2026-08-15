import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Activity, Server, Globe, Wifi, Database, TrendingUp, Lock, Radio } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface LiveAnalyticsProps {
    onBack: () => void;
    language: Language;
    activeUserCount: number;
}

const REGIONS = [
    { name: 'NA East', code: 'US-VA', lat: 30, long: 25, color: 'text-blue-500' },
    { name: 'EU West', code: 'DE-FR', lat: 35, long: 55, color: 'text-green-500' },
    { name: 'Asia Pac', code: 'SG-JP', lat: 45, long: 85, color: 'text-purple-500' },
    { name: 'Mid East', code: 'AE-SA', lat: 40, long: 65, color: 'text-orange-500' }
];

const GAMES = ['Apple', 'Crash', 'Mines', 'Wild West'];

export const LiveAnalytics: React.FC<LiveAnalyticsProps> = ({ onBack, language, activeUserCount }) => {
    const t = translations[language];
    
    // Real-time Data States
    const [serverLoad, setServerLoad] = useState(42);
    const [latency, setLatency] = useState(24);
    const [dbOps, setDbOps] = useState(842);
    
    // Graph Data
    const [graphPoints, setGraphPoints] = useState<number[]>(Array(20).fill(50));
    
    // Payout Feed
    const [payouts, setPayouts] = useState([
        { id: 1, user: 'Ghost_Rider', amount: 4200.50, game: 'Apple', time: 'Just now' },
        { id: 2, user: 'Ahmed_VIP', amount: 1250.00, game: 'Crash', time: '2s ago' },
        { id: 3, user: 'Crypto_K', amount: 890.25, game: 'Mines', time: '5s ago' },
    ]);

    // Simulation Effect
    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuations
            setServerLoad(prev => Math.min(98, Math.max(25, prev + (Math.random() * 10 - 5))));
            setLatency(prev => Math.min(120, Math.max(15, prev + (Math.random() * 8 - 4))));
            setDbOps(prev => Math.floor(prev + (Math.random() * 40 - 20)));

            // Graph Update (Signal Stability)
            setGraphPoints(prev => {
                const last = prev[prev.length - 1];
                // Smooth random walk
                let next = last + (Math.random() * 20 - 10);
                next = Math.max(20, Math.min(95, next));
                return [...prev.slice(1), next];
            });

            // Random Payout
            if (Math.random() > 0.6) {
                const newPayout = {
                    id: Date.now(),
                    user: `User_${Math.floor(Math.random() * 999)}`,
                    amount: Math.random() * 5000 + 100,
                    game: GAMES[Math.floor(Math.random() * GAMES.length)],
                    time: 'Just now'
                };
                setPayouts(prev => [newPayout, ...prev.slice(0, 4)]);
            }

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // SVG Path Generator for Graph
    const getGraphPath = () => {
        const width = 100;
        const height = 40;
        const points = graphPoints.map((val, i) => {
            const x = (i / (graphPoints.length - 1)) * width;
            const y = height - (val / 100) * height;
            return `${x},${y}`;
        });
        return `M ${points[0]} L ${points.join(' L ')}`;
    };

    return (
        <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative font-mono"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            {t.liveAnalytics}
                        </h1>
                        <span className="text-[9px] text-green-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            System Monitor Active
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Session ID</div>
                    <div className="text-xs font-mono text-zinc-300">#8X2-99L</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10">
                
                {/* 1. Main Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Server Load Card */}
                    <div className="bg-[#0c0c0e] p-4 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                             <div className="p-2 bg-purple-500/10 rounded-lg">
                                 <Server className="w-4 h-4 text-purple-500" />
                             </div>
                             <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{t.serverLoad}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">{Math.round(serverLoad)}<span className="text-sm text-zinc-500">%</span></span>
                                <span className="text-[9px] text-purple-400 font-bold">OPTIMAL</span>
                            </div>
                            {/* Circular Progress Simulator */}
                            <div className="w-12 h-12 relative flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                                    <MotionDiv 
                                        initial={{ strokeDashoffset: 113 }}
                                        animate={{ strokeDashoffset: 113 - (113 * serverLoad) / 100 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <circle 
                                            cx="24" cy="24" r="18" 
                                            stroke="#a855f7" strokeWidth="4" fill="none" 
                                            strokeDasharray="113"
                                            strokeLinecap="round"
                                        />
                                    </MotionDiv>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Latency Card */}
                    <div className="bg-[#0c0c0e] p-4 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                             <div className="p-2 bg-blue-500/10 rounded-lg">
                                 <Wifi className="w-4 h-4 text-blue-500" />
                             </div>
                             <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{t.networkLatency}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className={`text-2xl font-black ${latency < 50 ? 'text-green-400' : latency < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {Math.round(latency)}<span className="text-sm text-zinc-500">ms</span>
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold">PING</span>
                            </div>
                            <div className="flex gap-1 items-end h-8">
                                <motion.div animate={{ height: latency > 20 ? '30%' : '10%' }} className="w-1.5 bg-blue-500/30 rounded-t-sm" />
                                <motion.div animate={{ height: latency > 50 ? '60%' : '10%' }} className="w-1.5 bg-blue-500/50 rounded-t-sm" />
                                <motion.div animate={{ height: latency > 100 ? '100%' : '10%' }} className="w-1.5 bg-blue-500 rounded-t-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Signal Stability Graph */}
                <div className="glass-panel p-5 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{t.signal} Stability</span>
                        </div>
                        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">99.98% UPTIME</span>
                    </div>

                    <div className="h-28 w-full relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 border-l border-b border-white/5">
                            {Array.from({length: 24}).map((_, i) => (
                                <div key={i} className="border-r border-t border-white/5" />
                            ))}
                        </div>
                        
                        {/* Dynamic SVG Graph */}
                        <svg className="w-full h-full overflow-visible relative z-10" preserveAspectRatio="none" viewBox="0 0 100 40">
                             <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(34, 197, 94, 0.5)" />
                                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                                </linearGradient>
                             </defs>
                             <motion.path 
                                d={`${getGraphPath()} L 100,40 L 0,40 Z`} 
                                fill="url(#lineGradient)"
                                animate={{ d: `${getGraphPath()} L 100,40 L 0,40 Z` }}
                                transition={{ ease: "linear", duration: 0.5 }}
                             />
                             <motion.path 
                                d={getGraphPath()} 
                                fill="none" 
                                stroke="#22c55e" 
                                strokeWidth="2" 
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                                animate={{ d: getGraphPath() }}
                                transition={{ ease: "linear", duration: 0.5 }}
                             />
                        </svg>
                    </div>
                </div>

                {/* 3. Global Traffic Map (Stylized) */}
                <div className="bg-[#0c0c0e] p-5 rounded-3xl border border-white/5 relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{t.globalTraffic}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{activeUserCount.toLocaleString()} CONN</span>
                    </div>

                    <div className="relative h-40 w-full bg-[#050505] rounded-xl border border-white/5 overflow-hidden shadow-inner">
                        {/* Abstract World Map Dots */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                        
                        {/* Active Regions */}
                        {REGIONS.map((region, i) => (
                            <div 
                                key={i}
                                className="absolute flex items-center justify-center"
                                style={{ top: `${region.lat}%`, left: `${region.long}%` }}
                            >
                                <div className={`relative w-2 h-2 rounded-full ${region.color.replace('text-', 'bg-')}`}>
                                    <div className={`absolute inset-0 rounded-full ${region.color.replace('text-', 'bg-')} animate-ping opacity-75`} />
                                </div>
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded border border-white/10 text-[7px] font-bold text-zinc-300 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity z-20">
                                    {region.name}
                                </div>
                            </div>
                        ))}

                        {/* Connection Lines Animation */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                            <motion.path 
                                d="M 25,30 Q 55,10 85,45" 
                                fill="none" 
                                stroke="white" 
                                strokeDasharray="4 4" 
                                strokeWidth="1"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            />
                            <motion.path 
                                d="M 55,35 Q 65,60 85,45" 
                                fill="none" 
                                stroke="white" 
                                strokeDasharray="4 4" 
                                strokeWidth="1"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            />
                        </svg>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {REGIONS.map((r, i) => (
                             <div key={i} className="text-center bg-white/5 rounded-lg py-1.5 border border-white/5">
                                 <div className={`text-[8px] font-bold ${r.color}`}>{r.code}</div>
                                 <div className="text-[9px] text-white font-mono">{Math.floor(activeUserCount / 4) + (i * 12)}</div>
                             </div>
                        ))}
                    </div>
                </div>

                {/* 4. Detailed Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                     <div className="bg-[#121214] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
                             <Database className="w-3 h-3 text-orange-500" />
                             {t.databaseOps || "DB Ops/Sec"}
                         </div>
                         <div className="text-xl font-black text-white tabular-nums">{dbOps}</div>
                     </div>
                     <div className="bg-[#121214] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
                             <Lock className="w-3 h-3 text-green-500" />
                             {t.encryption || "Security"}
                         </div>
                         <div className="text-sm font-bold text-green-400 mt-1">AES-256 <span className="text-zinc-600">/</span> TLS</div>
                     </div>
                </div>

                {/* 5. Recent Payouts Feed */}
                <div className="bg-gradient-to-b from-zinc-900 to-black p-5 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{t.recentPayouts}</span>
                        </div>
                        <div className="text-[9px] text-zinc-600 font-bold uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            Live Feed
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <AnimatePresence initial={false}>
                            {payouts.map((p) => (
                                <MotionDiv 
                                    key={p.id}
                                    initial={{ opacity: 0, height: 0, x: -20 }}
                                    animate={{ opacity: 1, height: 'auto', x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.game === 'Crash' ? 'bg-orange-500' : p.game === 'Mines' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-300">{p.user}</span>
                                            <span className="text-[9px] text-zinc-600 font-mono uppercase">{p.game} • {p.time}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-green-400 font-mono">
                                        ${p.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                </MotionDiv>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </MotionDiv>
    );
};