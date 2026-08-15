
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
    User, LogOut, Shield, Activity, Edit2, Ghost, Skull, Crown, Zap, Bot, Smile, 
    Timer, Copy, Check, Settings, Volume2, Bell, Server, 
    Smartphone, MapPin, Monitor, Globe, Gamepad2, Rocket, 
    Flame, Star, Target, Cpu, Fingerprint, Eye, Power, Wifi, CreditCard, Layers, Clock, Award
} from 'lucide-react';
import { AccessKey, ViewState, Language, UserProfile } from '../types';
import { translations } from '../translations';
import { playSound } from '../services/audio';

const MotionDiv = motion.div as any;

interface ProfileProps {
    accessKeyData: AccessKey | null;
    userProfile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
    onSignOut: () => void;
    onNavigate: (view: ViewState) => void;
    currentAvatarId: number;
    onAvatarChange: (id: number) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const AVATARS = [
    { id: 0, icon: User, color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-600' },
    { id: 1, icon: Ghost, color: 'text-purple-400', bg: 'bg-purple-900/40', border: 'border-purple-500/50' },
    { id: 2, icon: Skull, color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/50' },
    { id: 3, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-yellow-500/50' },
    { id: 4, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-900/40', border: 'border-blue-500/50' },
    { id: 5, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-900/40', border: 'border-purple-500/50' },
    { id: 6, icon: Smile, color: 'text-pink-400', bg: 'bg-pink-900/40', border: 'border-pink-500/50' },
    { id: 7, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-900/40', border: 'border-cyan-500/50' },
    { id: 8, icon: Gamepad2, color: 'text-orange-400', bg: 'bg-orange-900/40', border: 'border-orange-500/50' },
    { id: 9, icon: Rocket, color: 'text-red-500', bg: 'bg-red-900/40', border: 'border-red-500/50' },
    { id: 10, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-900/40', border: 'border-amber-500/50' },
    { id: 11, icon: Star, color: 'text-yellow-300', bg: 'bg-yellow-900/40', border: 'border-yellow-500/50' },
    { id: 12, icon: Target, color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/50' },
    { id: 13, icon: Cpu, color: 'text-cyan-400', bg: 'bg-cyan-900/40', border: 'border-cyan-500/50' },
    { id: 14, icon: Fingerprint, color: 'text-violet-400', bg: 'bg-violet-900/40', border: 'border-violet-500/50' },
    { id: 15, icon: Eye, color: 'text-violet-400', bg: 'bg-violet-900/40', border: 'border-violet-500/50' },
];

export const Profile: React.FC<ProfileProps> = ({ 
    accessKeyData, 
    userProfile, 
    onUpdateProfile, 
    onSignOut, 
    onNavigate, 
    currentAvatarId, 
    onAvatarChange, 
    language, 
    onLanguageChange 
}) => {
    const [deviceType, setDeviceType] = useState('Unknown Device');
    const [userRegion, setUserRegion] = useState('Unknown');
    const [onlineTime, setOnlineTime] = useState(0);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [keyTimeLeft, setKeyTimeLeft] = useState('CALCULATING...');
    const t = translations[language];

    useEffect(() => {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) setDeviceType('Android');
        else if (/iPad|iPhone|iPod/.test(ua)) setDeviceType('iOS Device');
        else if (/windows/i.test(ua)) setDeviceType('Windows PC');
        else if (/macintosh/i.test(ua)) setDeviceType('Macintosh');
        else setDeviceType('Web Client');

        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const regionName = timeZone.split('/')[1] || timeZone;
            setUserRegion(regionName.replace(/_/g, ' '));
        } catch (e) { setUserRegion('Global'); }

        const interval = setInterval(() => {
            setOnlineTime(prev => prev + 1);
        }, 60000); 

        return () => clearInterval(interval);
    }, []);

    // Access Key Countdown Logic
    useEffect(() => {
        if (!accessKeyData) return;
        
        if (accessKeyData.type === 'PERMANENT') {
            setKeyTimeLeft(language === 'ar' ? 'وصول مدى الحياة' : 'LIFETIME ACCESS');
            return;
        }

        const updateTimer = () => {
            if (!accessKeyData.expiresAt) {
                setKeyTimeLeft('UNKNOWN');
                return;
            }
            
            const now = Date.now();
            const diff = accessKeyData.expiresAt - now;

            if (diff <= 0) {
                setKeyTimeLeft(t.expired);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Digital clock format
            const pad = (n: number) => n.toString().padStart(2, '0');
            setKeyTimeLeft(`${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [accessKeyData, language, t]);

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    const handleCopyKey = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (accessKeyData?.key) {
            navigator.clipboard.writeText(accessKeyData.key);
            setCopiedKey(true);
            playSound('click');
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const togglePreference = (key: keyof typeof userProfile.preferences) => {
        playSound('toggle');
        const newPrefs = { ...userProfile.preferences, [key]: !userProfile.preferences[key] };
        onUpdateProfile({ ...userProfile, preferences: newPrefs });
    };

    const getDeviceIcon = () => {
        const lower = deviceType.toLowerCase();
        if (lower.includes('android') || lower.includes('ios') || lower.includes('iphone')) return Smartphone;
        if (lower.includes('windows') || lower.includes('mac') || lower.includes('linux')) return Monitor;
        return Globe;
    };

    const DeviceIcon = getDeviceIcon();
    const currentAvatar = AVATARS.find(a => a.id === currentAvatarId) || AVATARS[0];
    const CurrentAvatarIcon = currentAvatar.icon;
    const isVip = accessKeyData?.type === 'PERMANENT';

    // XP Logic
    const xpLevel = Math.min(100, Math.floor(userProfile.stats.gamesPlayed * 5));
    const xpProgress = (userProfile.stats.gamesPlayed % 20) * 5; 

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        },
        exit: { opacity: 0 }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.95 },
        visible: { 
            y: 0, opacity: 1, scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 20 }
        }
    };

    // Component for Cyber Toggle Switch
    const CyberToggle = ({ 
        label, 
        icon: Icon, 
        isActive, 
        onToggle, 
        activeColorClass, 
        activeBorderClass, 
        activeTextClass, 
        activeBgClass 
    }: any) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggle}
            className={`
                relative w-full p-3 rounded-2xl border flex items-center justify-between overflow-hidden transition-all duration-300 group
                ${isActive 
                    ? `${activeBgClass} ${activeBorderClass} shadow-lg` 
                    : 'bg-[#121214] border-white/5 hover:border-white/10'}
            `}
        >
            <div className="flex items-center gap-3 relative z-10">
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300
                    ${isActive ? 'bg-white/10 text-white' : 'bg-black/40 text-zinc-500'}
                `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-md' : ''}`} />
                </div>
                <div className="flex flex-col items-start">
                    <span className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                        {label}
                    </span>
                    <span className={`text-[9px] font-mono transition-colors ${isActive ? activeTextClass : 'text-zinc-600'}`}>
                        {isActive ? 'ENABLED' : 'DISABLED'}
                    </span>
                </div>
            </div>

            {/* Switch Graphic */}
            <div className={`
                w-12 h-6 rounded-full relative transition-colors duration-300 border
                ${isActive ? `bg-black/20 ${activeBorderClass}` : 'bg-black/40 border-zinc-700'}
            `}>
                <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    className={`
                        absolute top-1 bottom-1 w-4 rounded-full shadow-lg
                        ${isActive ? `right-1 bg-white ${activeTextClass.replace('text-', 'shadow-')}` : 'left-1 bg-zinc-600'}
                    `}
                    style={{
                        boxShadow: isActive ? '0 0 10px currentColor' : 'none'
                    }}
                />
            </div>
            
            {/* Active Glow Gradient */}
            {isActive && (
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${activeColorClass} to-transparent`} />
            )}
        </motion.button>
    );

    return (
        <MotionDiv 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex-1 flex flex-col h-full overflow-y-auto pb-24 bg-[#050505] relative custom-scrollbar font-sans selection:bg-purple-500/30"
        >
            <div className="relative z-10 px-5 pt-6 max-w-md mx-auto w-full space-y-6">
                
                {/* 1. Header */}
                <MotionDiv variants={itemVariants} className="flex justify-between items-center bg-[#0c0c0e]/80 backdrop-blur-xl p-3 rounded-2xl border border-white/5 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />
                            <Fingerprint className="w-5 h-5 text-purple-500 relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white tracking-widest uppercase">
                                COMMAND <span className="text-purple-500">DECK</span>
                            </h1>
                            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                ONLINE
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onSignOut}
                        className="group w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 hover:border-red-500/30 transition-all active:scale-95"
                    >
                        <Power className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all" />
                    </button>
                </MotionDiv>

                {/* 2. Flat 2D ID Card (Removed 3D) */}
                <MotionDiv 
                    variants={itemVariants} 
                    className="w-full relative group"
                >
                     <div 
                        className="relative w-full aspect-[1.65] rounded-[24px] shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                     >
                        {/* Metallic / Glass Texture Layer */}
                        <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#1a1a1d] to-[#08080a] border border-white/10 overflow-hidden">
                            
                            {/* Noise Texture */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-0" />
                            
                            {/* Accent Glows */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />

                            {/* Card Content */}
                            <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                                
                                {/* Header Row */}
                                <div className="flex justify-between items-start">
                                    {/* Chip */}
                                    <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-200/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center relative overflow-hidden shadow-inner">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
                                        <Cpu className="w-5 h-5 text-amber-400/80 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                        {/* Chip Lines */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                            <div className="w-[1px] h-full bg-amber-500/50 mx-1" />
                                            <div className="h-[1px] w-full bg-amber-500/50 my-1" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">ACCESS PASS</div>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                            <span className="text-[8px] font-mono text-purple-500/80 tracking-widest">SECURE</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Block */}
                                <div className="flex items-center gap-5 mt-2">
                                    <div 
                                        className="relative group/avatar cursor-pointer" 
                                        onClick={(e) => { e.stopPropagation(); playSound('click'); setIsEditingAvatar(true); }}
                                    >
                                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                                        <div className={`relative w-16 h-16 rounded-2xl bg-zinc-900 border ${currentAvatar.border} flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover/avatar:scale-105`}>
                                            <CurrentAvatarIcon className={`w-8 h-8 ${currentAvatar.color}`} />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                <Edit2 className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        {/* Rank Badge */}
                                        <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shadow-md flex items-center gap-1 ${isVip ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                                            {isVip ? <Crown className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                                            {isVip ? "VIP" : "STD"}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <h2 className="text-xl font-black text-white tracking-tight truncate drop-shadow-md">{userProfile.username}</h2>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
                                                Level {Math.floor(xpLevel / 20) + 1}
                                            </span>
                                        </div>
                                        
                                        {/* XP Progress Bar */}
                                        <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5 mb-3 shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${xpProgress}%` }} 
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" 
                                            />
                                        </div>

                                        {/* License Key Display */}
                                        <button 
                                            onClick={handleCopyKey}
                                            className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 group/key hover:border-purple-500/30 transition-all active:scale-95"
                                        >
                                            <code className="text-[10px] font-mono text-zinc-300 tracking-[0.15em] truncate group-hover/key:text-purple-400 transition-colors">
                                                {accessKeyData?.key.slice(0, 4)}••••{accessKeyData?.key.slice(-4)}
                                            </code>
                                            {copiedKey ? <Check className="w-3 h-3 text-purple-500" /> : <Copy className="w-3 h-3 text-zinc-600 group-hover/key:text-white" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Row */}
                                <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{t.expiresIn}</span>
                                    <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                                        <Clock className="w-3 h-3 text-purple-500 animate-pulse" />
                                        <span className={`text-[10px] font-mono font-bold tracking-wider ${accessKeyData?.type === 'PERMANENT' ? 'text-yellow-500' : 'text-white'}`}>
                                            {keyTimeLeft}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </MotionDiv>

                {/* 3. Performance Dashboard */}
                <MotionDiv variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Performance Metrics</h3>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-3">
                        {/* Primary Stat: Games Played (Large) */}
                        <div className="col-span-12 bg-[#121214] p-4 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                    <Gamepad2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white tracking-tight leading-none">{userProfile.stats.gamesPlayed}</div>
                                    <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-1">{t.totalGames}</div>
                                </div>
                            </div>
                            <div className="relative z-10 h-10 w-24 opacity-50">
                                {/* Simulated mini graph */}
                                <svg className="w-full h-full text-blue-500" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <path d="M0 30 Q 20 35, 40 20 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path d="M0 30 Q 20 35, 40 20 T 100 10 V 40 H 0 Z" fill="currentColor" fillOpacity="0.2" />
                                </svg>
                            </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="col-span-6 bg-[#121214] p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-purple-500/30 transition-colors relative overflow-hidden">
                            <div className="relative w-14 h-14 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                                    <motion.circle 
                                        cx="28" cy="28" r="22" 
                                        stroke="#a855f7" strokeWidth="4" fill="none" 
                                        strokeDasharray="138"
                                        strokeDashoffset={138 - (138 * userProfile.stats.trustScore) / 100}
                                        initial={{ strokeDashoffset: 138 }}
                                        animate={{ strokeDashoffset: 138 - (138 * userProfile.stats.trustScore) / 100 }}
                                        transition={{ duration: 1.5, delay: 0.2 }}
                                        strokeLinecap="round"
                                        className="filter drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]"
                                    />
                                </svg>
                                <span className="absolute text-xs font-black text-white">{userProfile.stats.trustScore}</span>
                            </div>
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">{t.trustScore}</span>
                        </div>

                        {/* Session Time */}
                        <div className="col-span-6 bg-[#121214] p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-orange-500/30 transition-colors">
                            <div className="p-2.5 bg-orange-500/10 rounded-full text-orange-500 mb-1 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                                <Timer className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-white font-mono">{formatTime(onlineTime)}</span>
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Session</span>
                        </div>
                    </div>
                </MotionDiv>

                {/* 4. Settings Control Center (REDESIGNED) */}
                <MotionDiv variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Settings className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t.settings}</h3>
                    </div>

                    <div className="space-y-3">
                        {/* Language Segmented Control - REDESIGNED */}
                        <div className="bg-[#121214] p-1.5 rounded-2xl border border-white/5 flex relative overflow-hidden">
                            <motion.div 
                                layout
                                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-zinc-800 rounded-xl shadow-lg border border-white/10 z-0"
                                animate={{ 
                                    x: language === 'en' ? 0 : '100%',
                                    left: language === 'en' ? '4px' : '2px'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button 
                                onClick={() => onLanguageChange('en')}
                                className={`flex-1 py-3 relative z-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-colors ${language === 'en' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                            >
                                <span className="text-sm">🇺🇸</span> English
                            </button>
                            <button 
                                onClick={() => onLanguageChange('ar')}
                                className={`flex-1 py-3 relative z-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-colors ${language === 'ar' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                            >
                                <span className="text-sm">🇪🇬</span> العربية
                            </button>
                        </div>

                        {/* Cyber Switches - REDESIGNED */}
                        <div className="grid gap-2">
                            <CyberToggle 
                                label={t.soundEffects} 
                                icon={Volume2} 
                                isActive={userProfile.preferences.sound} 
                                onToggle={() => togglePreference('sound')}
                                activeColorClass="from-blue-500/30"
                                activeBorderClass="border-blue-500/50"
                                activeTextClass="text-blue-400"
                                activeBgClass="bg-blue-900/10"
                            />
                            <CyberToggle 
                                label={t.hapticFeedback} 
                                icon={Smartphone} 
                                isActive={userProfile.preferences.haptics} 
                                onToggle={() => togglePreference('haptics')}
                                activeColorClass="from-purple-500/30"
                                activeBorderClass="border-purple-500/50"
                                activeTextClass="text-purple-400"
                                activeBgClass="bg-purple-900/10"
                            />
                            <CyberToggle 
                                label={t.notifications} 
                                icon={Bell} 
                                isActive={userProfile.preferences.notifications} 
                                onToggle={() => togglePreference('notifications')}
                                activeColorClass="from-purple-500/30"
                                activeBorderClass="border-purple-500/50"
                                activeTextClass="text-purple-400"
                                activeBgClass="bg-purple-900/10"
                            />
                        </div>
                    </div>
                </MotionDiv>

                {/* 5. System Diagnostics (Terminal Style) */}
                <MotionDiv variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Server className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System Diagnostics</h3>
                    </div>

                    <div className="bg-[#050505] border border-white/10 rounded-xl p-4 font-mono text-[10px] relative overflow-hidden">
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]" />
                        
                        <div className="relative z-10 space-y-2">
                            <div className="flex justify-between items-center border-b border-dashed border-zinc-800 pb-2">
                                <span className="text-zinc-500 flex items-center gap-2"><DeviceIcon className="w-3 h-3" /> HW_ID</span>
                                <span className="text-purple-500">{deviceType.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed border-zinc-800 pb-2">
                                <span className="text-zinc-500 flex items-center gap-2"><MapPin className="w-3 h-3" /> REGION_LOC</span>
                                <span className="text-blue-500">{userRegion.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 flex items-center gap-2"><Wifi className="w-3 h-3" /> NET_STATUS</span>
                                <span className="text-purple-500 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    SECURE_TUNNEL
                                </span>
                            </div>
                        </div>
                    </div>
                </MotionDiv>

                {/* Footer Buttons (REDESIGNED) */}
                <MotionDiv variants={itemVariants} className="grid grid-cols-2 gap-4 pt-2">
                    {[
                        { id: 'dev', icon: Ghost, label: t.aboutDev, color: 'text-blue-400', border: 'hover:border-blue-500/50', bg: 'hover:bg-blue-500/10', onClick: () => onNavigate('ABOUT_DEV') },
                        { id: 'contact', icon: Globe, label: t.contactDevBtn, color: 'text-purple-400', border: 'hover:border-purple-500/50', bg: 'hover:bg-purple-500/10', link: "https://t.me/falllconnnn" }
                    ].map((btn) => (
                        <motion.div
                            key={btn.id}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative group"
                        >
                            {/* Glow Effect behind */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${btn.id === 'dev' ? 'from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:via-blue-500/20' : 'from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:via-purple-500/20'} rounded-2xl blur-xl transition-all duration-500`} />
                            
                            {btn.link ? (
                                <a 
                                    href={btn.link}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`
                                        relative flex flex-col items-center justify-center p-5 rounded-2xl bg-[#121214] border border-white/5 transition-all duration-300
                                        ${btn.border} ${btn.bg} h-full shadow-lg
                                    `}
                                >
                                    <btn.icon className={`w-6 h-6 ${btn.color} mb-3 group-hover:scale-110 transition-transform duration-300`} />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors text-center">{btn.label}</span>
                                </a>
                            ) : (
                                <button 
                                    onClick={btn.onClick}
                                    className={`
                                        relative w-full flex flex-col items-center justify-center p-5 rounded-2xl bg-[#121214] border border-white/5 transition-all duration-300
                                        ${btn.border} ${btn.bg} h-full shadow-lg
                                    `}
                                >
                                    <btn.icon className={`w-6 h-6 ${btn.color} mb-3 group-hover:scale-110 transition-transform duration-300`} />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors text-center">{btn.label}</span>
                                </button>
                            )}
                        </motion.div>
                    ))}
                </MotionDiv>

            </div>

            {/* Avatar Selection Modal (Futuristic Grid) */}
            <AnimatePresence>
                {isEditingAvatar && (
                    <MotionDiv 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                        onClick={() => setIsEditingAvatar(false)}
                    >
                        <MotionDiv 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0c0c0e] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 opacity-50" />
                            
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                                    <Fingerprint className="w-4 h-4 text-purple-500" />
                                    {t.selectIdentity}
                                </h3>
                                <p className="text-[10px] text-zinc-500">CHOOSE YOUR AVATAR SIGNATURE</p>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => {
                                            onAvatarChange(avatar.id);
                                            setIsEditingAvatar(false);
                                            playSound('toggle');
                                        }}
                                        className={`
                                            aspect-square rounded-xl flex items-center justify-center border transition-all relative group
                                            ${currentAvatarId === avatar.id 
                                                ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                                : 'bg-zinc-900 border-white/5 hover:bg-zinc-800 hover:border-white/20'}
                                        `}
                                    >
                                        <avatar.icon className={`w-6 h-6 ${avatar.color} transition-transform group-hover:scale-110`} />
                                        {currentAvatarId === avatar.id && (
                                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 rounded-full border-2 border-[#0c0c0e] flex items-center justify-center shadow-sm">
                                                <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => setIsEditingAvatar(false)}
                                className="mt-6 w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest transition-colors border border-white/5"
                            >
                                {t.cancel}
                            </button>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </MotionDiv>
    );
};
