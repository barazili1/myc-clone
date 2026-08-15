
import React from 'react';
import { motion } from 'framer-motion';
import { Code, Send, ChevronLeft, Terminal, Cpu, Globe, Shield, Zap, Database, Award, UserCheck, Layers, Boxes, Server, Lock } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface AboutDevProps {
    onBack: () => void;
    language: Language;
}

export const AboutDev: React.FC<AboutDevProps> = ({ onBack, language }) => {
    const t = translations[language];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col p-4 pb-24 h-full overflow-y-auto bg-[#050505] font-mono custom-scrollbar"
        >
            {/* Navigation Header */}
            <div className="flex items-center gap-3 mb-6 bg-[#09090b]/80 backdrop-blur-xl -mx-4 px-6 py-2 sticky top-0 z-30 border-b border-white/5">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        System Architect
                    </h1>
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
                
                {/* ID Card Style Profile */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                    <div className="relative bg-[#0c0c0e] rounded-3xl border border-white/10 p-6 overflow-hidden shadow-2xl">
                        
                        {/* Header Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent opacity-50" />
                        
                        <div className="relative z-10 flex flex-col items-center pt-4">
                            <div className="relative w-24 h-24 mb-5">
                                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
                                <div className="w-full h-full rounded-2xl bg-[#09090b] border border-blue-500/30 flex items-center justify-center relative overflow-hidden shadow-2xl ring-1 ring-white/5">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                    <Terminal className="w-10 h-10 text-blue-400" />
                                    
                                    {/* Glitch Effect Lines */}
                                    <div className="absolute top-1/4 w-full h-[1px] bg-blue-500/50 animate-pulse" />
                                    <div className="absolute bottom-1/3 w-full h-[1px] bg-blue-500/30" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded border border-[#09090b] shadow-lg flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" /> VERIFIED
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-white tracking-tight mb-1">X6_i2</h2>
                            <p className="text-[10px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-4">{t.leadDev}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 mb-2">
                                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> Full Stack
                                </span>
                                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                    <Cpu className="w-3 h-3" /> Algorithm
                                </span>
                                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Security
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats / Skills Matrix */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0c0c0e] p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-blue-500/20 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Server className="w-12 h-12 text-white" />
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
                            <Cpu className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-white">99.9%</span>
                            <span className="text-[9px] font-bold uppercase text-zinc-500 block tracking-wider">{t.uptime}</span>
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-green-500/20 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Shield className="w-12 h-12 text-white" />
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg w-fit">
                            <Shield className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-white">AES-256</span>
                            <span className="text-[9px] font-bold uppercase text-zinc-500 block tracking-wider">{t.encryption}</span>
                        </div>
                    </div>
                </div>

                {/* Competency Bars */}
                <div className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/5 space-y-5">
                     <div className="flex items-center gap-2 mb-2">
                         <Boxes className="w-4 h-4 text-zinc-500" />
                         <h3 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{t.coreCompetencies}</h3>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                                <span>{t.neuralNet}</span>
                                <span className="text-blue-400">98%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                                <span>{t.realtimeData}</span>
                                <span className="text-purple-400">95%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "95%" }}
                                    transition={{ duration: 1, delay: 0.4 }}
                                    className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                                <span>{t.predictiveMod}</span>
                                <span className="text-green-400">92%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "92%" }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                                />
                            </div>
                        </div>
                     </div>
                </div>

                <div className="mt-auto pt-4">
                    <a 
                        href="https://t.me/falllconnnn" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group w-full relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all block"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:opacity-0 transition-opacity" />
                        <div className="relative bg-[#09090b] rounded-[11px] p-4 flex items-center justify-between group-hover:bg-transparent transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-500/20 rounded-lg group-hover:bg-white/20 transition-colors border border-blue-500/20">
                                    <Send className="w-5 h-5 text-blue-400 group-hover:text-white" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-black text-white text-xs tracking-wide uppercase">{t.contactDirect}</span>
                                    <span className="text-[9px] text-zinc-500 group-hover:text-blue-100 font-bold uppercase tracking-wider">{t.viaTelegram}</span>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-zinc-600 rotate-180 group-hover:text-white transition-colors" />
                        </div>
                    </a>
                </div>

                <div className="flex items-center justify-center gap-2 opacity-30 pb-4 pt-2">
                    <Globe className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Global Systems Inc. © 2025</span>
                </div>
            </div>
        </motion.div>
    );
};
