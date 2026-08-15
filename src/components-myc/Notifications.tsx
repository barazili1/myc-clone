import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Clock, Shield, AlertTriangle, Zap, Info, ChevronDown, ChevronUp, Check, Pin, Terminal, Sparkles, MessageSquare, Cpu, Code2, Activity } from 'lucide-react';
import { Notification, Language } from '../types';
import { translations } from '../translations';

interface NotificationsProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    language: Language;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkRead, onMarkAllRead, language }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const t = translations[language];

    // Separate Pinned (Administrator/Firebase) from Recent
    const pinnedNotifications = notifications.filter(n => n.sender === 'Administrator');
    const recentNotifications = notifications.filter(n => n.sender !== 'Administrator');

    const toggleExpand = (id: string, read: boolean) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            if (!read) {
                onMarkRead(id);
            }
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
            case 'success': return <Zap className="w-4 h-4 text-purple-400" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden font-mono"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-xl z-20 sticky top-0">
                <div>
                    <h1 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-5 h-5 text-white" />
                        {t.alerts}
                    </h1>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Command Center Feed</span>
                </div>
                
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={onMarkAllRead}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-[9px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all uppercase tracking-wider hover:border-white/20"
                    >
                        <CheckCheck className="w-3.5 h-3.5 group-hover:text-purple-500 transition-colors" />
                        <span>Read All</span>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 relative z-10 pb-24">
                
                {/* 1. PINNED SECTION (Dev/Firebase) */}
                <AnimatePresence>
                    {pinnedNotifications.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2 px-1">
                                <Pin className="w-3 h-3 text-purple-500 rotate-45" />
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Pinned Broadcasts</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
                            </div>

                            {pinnedNotifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    onClick={() => toggleExpand(notif.id, notif.read)}
                                    className={`
                                        relative rounded-2xl p-4 cursor-pointer transition-all duration-300 overflow-hidden group border
                                        ${notif.read 
                                            ? 'bg-[#0f0f11] border-purple-500/10 hover:border-purple-500/30' 
                                            : 'bg-gradient-to-r from-[#120f1f] to-[#0c0c0e] border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}
                                    `}
                                >
                                    {/* Unread Glow Pulse */}
                                    {!notif.read && <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />}
                                    
                                    <div className="relative z-10 flex gap-4">
                                        {/* Custom Dev Logo */}
                                        <div className="shrink-0 flex flex-col items-center gap-1">
                                            <div className="w-12 h-12 rounded-xl bg-[#09090b] border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden relative">
                                                <img 
                                                    src="https://image2url.com/images/1764758379533-1ae857ea-7b7e-4472-bbca-b12e4553cd7f.jpg" 
                                                    alt="System"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center gap-1">
                                                <span className="text-[8px] font-black text-purple-400 uppercase">SYS</span>
                                                <Check className="w-2 h-2 text-purple-500" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`text-sm font-bold truncate pr-2 ${notif.read ? 'text-zinc-400' : 'text-white'}`}>
                                                        {notif.titleKey && (t as any)[notif.titleKey] ? (t as any)[notif.titleKey] : notif.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wide">Official</span>
                                                    </div>
                                                </div>
                                                {expandedId === notif.id ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                                            </div>
                                            
                                            <p className={`text-xs mt-2 leading-relaxed ${notif.read ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                                {notif.messageKey && (t as any)[notif.messageKey] ? (t as any)[notif.messageKey] : notif.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expandable Details */}
                                    <AnimatePresence>
                                        {expandedId === notif.id && notif.description && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-4 pt-4 border-t border-white/5 relative z-10"
                                            >
                                                <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-[10px] text-purple-200/80 leading-relaxed shadow-inner">
                                                    {notif.description}
                                                </div>
                                                <div className="mt-2 flex justify-end">
                                                    <span className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold">
                                                        ID: {notif.id.split('-')[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. RECENT SECTION (Timeline) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Activity className="w-3 h-3 text-zinc-600" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">System Activity</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                    </div>

                    {recentNotifications.length === 0 && pinnedNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-zinc-600" />
                            </div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.noNotifications}</span>
                        </div>
                    ) : (
                        <div className="relative pl-3 border-l border-zinc-800 space-y-6">
                            {recentNotifications.map((notif, index) => {
                                const icon = getIcon(notif.type);
                                
                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative group"
                                    >
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[17px] top-4 w-2 h-2 rounded-full border-2 border-[#050505] transition-colors ${notif.read ? 'bg-zinc-700' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />
                                        
                                        <div 
                                            onClick={() => toggleExpand(notif.id, notif.read)}
                                            className={`
                                                ml-2 rounded-xl p-3 cursor-pointer transition-all duration-200 border
                                                ${notif.read 
                                                    ? 'bg-[#0a0a0c] border-white/5' 
                                                    : 'bg-[#121214] border-white/10 hover:border-white/20 hover:bg-[#151518]'}
                                            `}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5 ${notif.read ? 'bg-zinc-900/50' : 'bg-zinc-900'}`}>
                                                    {icon}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-zinc-500' : 'text-zinc-200'}`}>
                                                            {notif.titleKey && (t as any)[notif.titleKey] ? (t as any)[notif.titleKey] : notif.title}
                                                        </h4>
                                                        <span className="text-[9px] text-zinc-600 font-mono shrink-0 ml-2">
                                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className={`text-[10px] mt-1 line-clamp-2 ${notif.read ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                        {notif.messageKey && (t as any)[notif.messageKey] ? (t as any)[notif.messageKey] : notif.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedId === notif.id && notif.description && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="mt-3 pt-3 border-t border-white/5 pl-11"
                                                    >
                                                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                                                            {notif.description}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};