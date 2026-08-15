
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Gamepad2, Zap, Trophy, Globe, User, Languages, TrendingUp, TrendingDown, Minus, X, Flame, Snowflake, ShieldCheck, Wifi, Activity, Server, Radio, Fingerprint, Lock, Eye, Clock, Smartphone, Monitor, Laptop } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface UsersOnlineProps {
    onBack: () => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    activeUserCount: number;
}

// Arabic & Gaming Name Mix
const BASE_NAMES = [
    "Ahmed_Pro", "Mohamed_King", "Ali_Sniper", "Omar_X", "Sayed_Gamer", 
    "Hassan_VIP", "Mahmoud_Fox", "Mustafa_Top", "Youssef_Win", "Ibrahim_Bet", 
    "Khaled_Boss", "Tarek_Eagle", "Amr_Shadow", "Sherif_Lion", "Karim_Joker",
    "El_Gendy", "Masr_Boy", "Cairo_Prince", "Alex_King", "Sa3edy_Hero",
    "Mido_Star", "Ziad_Master", "Hazem_Strike", "Fares_Knight", "Nader_Ghost",
    "Sameh_Rock", "Walid_Tiger", "Hady_Storm", "Ramy_Blaze", "Hesham_Hawk",
    "Tamer_Wolf", "Essam_Bear", "Magdy_Falcon", "Shawky_Viper", "Reda_Cobra"
];

const REGIONS = ["Cairo", "Giza", "Alex", "Mansoura", "Tanta", "Suez", "Luxor", "Aswan", "Global", "Dubai", "Riyadh", "London"];
const GAMES = ["Apple Fortune", "Crash Pro", "Mines AI", "Wild West", "Lobby"];
const RANKS = ["Elite", "Pro", "Rookie", "VIP", "Master", "Legend"];
const COLORS = ["text-red-500", "text-blue-500", "text-purple-500", "text-purple-500", "text-orange-500", "text-pink-500", "text-cyan-500"];
const PLATFORMS = ["Mobile", "Desktop", "Tablet"];

interface OnlineUser {
    id: number;
    name: string;
    region: string;
    game: string;
    rank: string;
    color: string;
    winRate: number;
    trend: 'up' | 'down' | 'stable';
    streak: number;
    latency: number;
    ip: string;
    sessionTime: string;
    platform: 'Mobile' | 'Desktop' | 'Tablet';
}

const generateIP = () => `192.168.${Math.floor(Math.random()*255)}.***`;

const generateUser = (id: number): OnlineUser => ({
    id: id,
    name: BASE_NAMES[Math.floor(Math.random() * BASE_NAMES.length)] + "_" + Math.floor(Math.random() * 99),
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    winRate: Math.floor(Math.random() * 40) + 50, // 50-90%
    trend: 'stable',
    streak: Math.floor(Math.random() * 10) - 3,
    latency: Math.floor(Math.random() * 80) + 10,
    ip: generateIP(),
    sessionTime: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 59)}m`,
    platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)] as any
});

export const UsersOnline: React.FC<UsersOnlineProps> = ({ onBack, language, activeUserCount }) => {
    
    const t = translations[language];

    // Initial Population
    const [users, setUsers] = useState<OnlineUser[]>(() => {
        return Array.from({ length: 25 }).map((_, i) => generateUser(Date.now() + i));
    });

    // Selected User for Popover
    const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);

    // Radar Scanning Animation State
    const [radarRotation, setRadarRotation] = useState(0);

    // Real-time Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setRadarRotation(prev => (prev + 5) % 360);

            setUsers(currentUsers => {
                let newUsers = [...currentUsers];

                // 1. Sometimes add a new user
                if (Math.random() > 0.3) {
                    newUsers.unshift(generateUser(Date.now()));
                    if (newUsers.length > 40) newUsers.pop();
                }
                
                // 2. Update existing users
                newUsers = newUsers.map(user => {
                    // Randomly change game
                    if (Math.random() > 0.9) {
                        user.game = GAMES[Math.floor(Math.random() * GAMES.length)];
                    }

                    // Fluctuate Latency
                    user.latency = Math.max(5, Math.min(150, user.latency + (Math.random() * 10 - 5)));

                    // Randomly fluctuate win rate
                    if (Math.random() > 0.7) {
                        const delta = Math.floor(Math.random() * 5) - 2; 
                        if (delta !== 0) {
                            const newRate = Math.min(99, Math.max(40, user.winRate + delta));
                            let newStreak = user.streak;
                            if (delta > 0) newStreak = newStreak >= 0 ? newStreak + 1 : 1;
                            else newStreak = newStreak <= 0 ? newStreak - 1 : -1;

                            return { 
                                ...user, 
                                winRate: newRate,
                                trend: delta > 0 ? 'up' : 'down',
                                streak: newStreak
                            };
                        }
                    }
                    return { ...user, trend: 'stable' };
                });

                return newUsers;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const updated = users.find(u => u.id === selectedUser.id);
            if (updated) setSelectedUser(updated);
        }
    }, [users, selectedUser]);

    const getPlatformIcon = (platform: string) => {
        switch(platform) {
            case 'Mobile': return Smartphone;
            case 'Desktop': return Monitor;
            case 'Tablet': return Laptop; // Using laptop icon for tablet/generic
            default: return Globe;
        }
    }

    return (
        <MotionDiv 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] font-mono relative" 
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Radio className="w-4 h-4 text-purple-500 animate-pulse" />
                            {t.liveNet}
                        </h1>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{t.activeSquad}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-purple-900/10 px-2 py-1 rounded border border-purple-500/20">
                    <Wifi className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px] font-bold text-purple-400">SECURE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                
                {/* Radar / Stats Section */}
                <div className="p-4 grid grid-cols-2 gap-3 mb-2">
                    {/* Radar Card */}
                    <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-32">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
                         
                         {/* Radar Circles */}
                         <div className="absolute w-24 h-24 rounded-full border border-purple-500/20" />
                         <div className="absolute w-16 h-16 rounded-full border border-purple-500/20" />
                         <div className="absolute w-1 h-1 bg-purple-500 rounded-full" />
                         
                         {/* Scanning Line */}
                         <div 
                            className="absolute w-24 h-24 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.2)_30deg,transparent_30deg)]" 
                            style={{ transform: `rotate(${radarRotation}deg)` }}
                         />
                         
                         {/* Blips */}
                         {users.slice(0, 5).map((u, i) => (
                             <div 
                                key={u.id}
                                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                                style={{ 
                                    top: `${50 + Math.sin(i * 20) * 30}%`, 
                                    left: `${50 + Math.cos(i * 20) * 30}%`,
                                    opacity: Math.random() > 0.5 ? 1 : 0
                                }}
                             />
                         ))}

                         <div className="absolute bottom-2 right-2 text-[8px] text-purple-500 font-mono">SCANNING...</div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-col gap-3">
                        <div className="flex-1 bg-[#0c0c0e] border border-white/5 rounded-2xl p-3 flex flex-col justify-center relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-3 h-3 text-blue-500" />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">{t.onlineUsers}</span>
                            </div>
                            {/* Uses the passed activeUserCount prop for consistency */}
                            <span className="text-xl font-black text-white">{activeUserCount.toLocaleString()}</span>
                            <div className="absolute right-0 bottom-0 p-2 opacity-10">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 bg-[#0c0c0e] border border-white/5 rounded-2xl p-3 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <Server className="w-3 h-3 text-orange-500" />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">Nodes</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-black text-white">42</span>
                                <span className="text-[9px] text-purple-500 mb-1">● Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="px-4 pb-24 space-y-2">
                    <div className="flex items-center justify-between px-2 mb-1">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Connection Feed</span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Status</span>
                    </div>

                    <AnimatePresence initial={false}>
                        {users.map((user) => (
                            <MotionDiv 
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                layout
                                onClick={() => setSelectedUser(user)}
                                className="group bg-[#0c0c0e] hover:bg-[#121214] border border-white/5 hover:border-white/10 rounded-lg p-2.5 cursor-pointer transition-all relative overflow-hidden"
                            >
                                {/* Glitch Hover Effect */}
                                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors" />

                                <div className="flex items-center gap-3 relative z-10">
                                    {/* Avatar/Rank Indicator */}
                                    <div className={`
                                        w-10 h-10 rounded bg-zinc-900 border border-white/5 flex flex-col items-center justify-center shrink-0
                                        ${user.rank === 'VIP' || user.rank === 'Legend' ? 'border-yellow-500/30 shadow-[0_0_10px_rgba(2168,85,247,0.1)]' : ''}
                                    `}>
                                        <span className={`text-[10px] font-black uppercase ${user.color.replace('text-', 'text-')}`}>{user.rank.substring(0,3)}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${user.latency < 50 ? 'bg-purple-500' : 'bg-yellow-500'}`} />
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                                                {user.name}
                                            </h3>
                                            {user.streak > 2 && (
                                                <div className="flex items-center gap-0.5 px-1 py-0.5 bg-orange-500/10 rounded border border-orange-500/20">
                                                    <Flame className="w-2.5 h-2.5 text-orange-500" />
                                                    <span className="text-[8px] font-bold text-orange-500">{user.streak}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                                                <Globe className="w-2.5 h-2.5" /> {user.region}
                                            </span>
                                            <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                                                <Gamepad2 className="w-2.5 h-2.5" /> {user.game}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metrics Right */}
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className="flex items-center gap-1">
                                             <Activity className="w-3 h-3 text-zinc-600" />
                                             <span className={`text-xs font-black font-mono ${user.winRate > 70 ? 'text-purple-400' : 'text-zinc-400'}`}>
                                                 {user.winRate}%
                                             </span>
                                        </div>
                                        <span className="text-[9px] text-zinc-600 font-mono">{user.latency}ms</span>
                                    </div>
                                </div>
                            </MotionDiv>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Deep Scan Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <MotionDiv
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="bg-[#0c0c0e] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
                        >
                            {/* Decorative Lines */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-transparent to-purple-500 opacity-50" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-white/5 rounded-br-2xl" />

                            {/* Header */}
                            <div className="p-5 border-b border-white/5 flex items-start justify-between bg-white/5 relative">
                                <div className="flex items-center gap-4">
                                    <div className={`relative w-14 h-14 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner`}>
                                        <User className={`w-8 h-8 ${selectedUser.color}`} />
                                        
                                        {/* Platform Badge */}
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#121214] border border-white/10 rounded-full flex items-center justify-center shadow-lg">
                                            {React.createElement(getPlatformIcon(selectedUser.platform), { className: "w-3 h-3 text-zinc-400" })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-black text-white tracking-tight">{selectedUser.name}</h2>
                                            <ShieldCheck className="w-4 h-4 text-purple-500" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{selectedUser.rank}</span>
                                            <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                                            <span className="text-[10px] text-zinc-500 font-mono">{selectedUser.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            {/* Data Grid */}
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Current Session</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-bold text-white font-mono">{selectedUser.sessionTime}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Latency</span>
                                        <div className="flex items-center gap-2">
                                            <Wifi className={`w-4 h-4 ${selectedUser.latency < 50 ? 'text-purple-500' : 'text-yellow-500'}`} />
                                            <span className="text-sm font-bold text-white font-mono">{selectedUser.latency}ms</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#121214] p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Connection Telemetry</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                            <span className="text-[9px] font-bold text-purple-500">ENCRYPTED</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Fingerprint className="w-3.5 h-3.5" />
                                                <span>IP Address</span>
                                            </div>
                                            <span className="font-mono text-xs text-white blur-[2px] hover:blur-none transition-all cursor-pointer">{selectedUser.ip}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span>Location Node</span>
                                            </div>
                                            <span className="font-mono text-xs text-white">{selectedUser.region} Gateway</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Gamepad2 className="w-3.5 h-3.5" />
                                                <span>Activity</span>
                                            </div>
                                            <span className="font-mono text-xs text-purple-400">{selectedUser.game}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-3 rounded-lg bg-zinc-900 border border-white/10 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                                        <Eye className="w-3 h-3" /> Spectate
                                    </button>
                                    <button className="flex-1 py-3 rounded-lg bg-purple-900/10 border border-purple-500/20 text-[10px] font-bold uppercase text-purple-500 hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2">
                                        <Lock className="w-3 h-3" /> Trace Signal
                                    </button>
                                </div>
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </MotionDiv>
    );
};
