
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Loader2, ShieldCheck, AlertCircle, Lock, Globe, ChevronDown, Send, FileText, X, ScanFace, Binary, Shield, Ticket, Copy, Check } from 'lucide-react';
import { verifyAccessKey } from '../services/auth';
import { playSound } from '../services/audio';
import { AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface LoginProps {
  onLoginSuccess: (keyData: AccessKey) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onGetCode: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, language, onLanguageChange, onGetCode }) => {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [isPromoCopied, setIsPromoCopied] = useState(false);
  const t = translations[language];
  const [loadingText, setLoadingText] = useState(t.authenticating);
  const [keyNameFound, setKeyNameFound] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for auto-login with temp key on mount
  useEffect(() => {
    try {
        const stored = localStorage.getItem('temp_access_key');
        if (stored) {
            const data = JSON.parse(stored);
            // Check if key is still valid
            if (data.key && data.expiresAt && data.expiresAt > Date.now()) {
                setInputKey(data.key);
            }
        }
    } catch (e) {
        // Ignore parsing errors
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputKey.trim()) return;

    playSound('click');
    setIsLoading(true);
    setLoadingText(t.connecting);
    setKeyNameFound(null);
    setError(null);

    await new Promise(r => setTimeout(r, 1500));
    setLoadingText(t.authenticating);

    const result = await verifyAccessKey(inputKey.trim());

    if (result.valid && result.data) {
        setLoadingText(t.accessGranted);
        setKeyNameFound(result.data.name || 'Unknown User');
        playSound('success');
        
        await new Promise(r => setTimeout(r, 2000));
        
        localStorage.setItem('access_key_data', JSON.stringify(result.data));
        onLoginSuccess(result.data);
    } else {
        playSound('crash'); 
        setError(result.error ? result.error : t.invalidKey);
        setIsLoading(false);
        setLoadingText(t.authenticating);
    }
  };

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('XKX11');
    setIsPromoCopied(true);
    playSound('click');
    setTimeout(() => setIsPromoCopied(false), 2000);
  };

  const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'ar', label: 'العربية', flag: '🇪🇬' },
    ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full min-h-screen px-4 relative overflow-hidden bg-[#030303]">
        
        {/* Language Pill */}
        <div className="absolute top-6 right-6 z-50">
             <div className="relative">
                <button 
                    onClick={() => {
                        playSound('click');
                        setIsLangMenuOpen(!isLangMenuOpen);
                    }}
                    className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg group"
                >
                    <Globe className="w-3.5 h-3.5 text-green-500 group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-wider">{language}</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isLangMenuOpen && (
                        <MotionDiv
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-40 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col py-1.5 z-50"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onLanguageChange(lang.code as Language);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all text-left relative
                                        ${language === lang.code ? 'bg-white/5 text-green-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <span className="text-sm shadow-sm grayscale">{lang.flag}</span>
                                    <span className="flex-1">{lang.label}</span>
                                    {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                </button>
                            ))}
                        </MotionDiv>
                    )}
                </AnimatePresence>
             </div>
        </div>

        {/* Main Card */}
        <MotionDiv 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 1, bounce: 0.2 }}
            className="w-full max-w-sm relative z-20"
        >
            <div className="relative group">
                
                <div className="relative bg-[#09090b]/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                    {/* Top Shine */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    {/* Header Logo Area */}
                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#151518] to-black border border-white/10 flex items-center justify-center shadow-lg relative z-10 overflow-hidden">
                                <img 
                                    src="https://image2url.com/images/1764758379533-1ae857ea-7b7e-4472-bbca-b12e4553cd7f.jpg" 
                                    alt="EL HETAN V1" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Glow behind logo */}
                            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
                            EL HETAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">V1</span>
                        </h2>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{t.systemOnline}</span>
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                <Binary className="w-3 h-3 text-green-500/50" />
                                {t.licenseKey}
                            </label>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-green-500 transition-colors duration-300">
                                    <Key className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={inputKey}
                                    onChange={(e) => {
                                        setInputKey(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="w-full bg-[#050505] border border-white/10 group-focus-within:border-green-500/30 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-800 focus:outline-none transition-all font-mono text-sm tracking-[0.15em] shadow-inner focus:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                    autoCapitalize="none"
                                    spellCheck="false"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-zinc-700 group-focus-within:text-zinc-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <MotionDiv 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                className="flex items-center gap-3 text-red-400 text-xs bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="font-bold tracking-wide">{error}</span>
                            </MotionDiv>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading || !inputKey}
                            className={`
                                w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg
                                ${isLoading || !inputKey 
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                                    : 'bg-white text-black hover:bg-zinc-200 shadow-white/5'}
                            `}
                        >
                             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanFace className="w-4 h-4" />}
                             <span>{t.authenticate}</span>
                        </motion.button>
                    </form>
                    
                    {/* Promocode Section */}
                    <div className="mt-6 w-full">
                        <button
                            onClick={handleCopyPromo}
                            className="w-full relative group overflow-hidden rounded-xl bg-zinc-900/30 border border-dashed border-zinc-700/50 hover:border-green-500/50 p-3 transition-all active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center group-hover:border-green-500/30 transition-colors">
                                        <Ticket className="w-5 h-5 text-zinc-400 group-hover:text-green-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Promocode</span>
                                        <span className="text-base font-black text-white font-mono tracking-widest group-hover:text-green-400 transition-colors">XKX11</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pr-2">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                                        {isPromoCopied ? 'COPIED' : 'COPY'}
                                    </span>
                                    {isPromoCopied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 flex flex-col items-center gap-6">
                        <button 
                            onClick={() => setShowTos(true)}
                            className="text-[10px] text-zinc-600 hover:text-white transition-colors border-b border-transparent hover:border-zinc-600 pb-0.5"
                        >
                            {t.terms}
                        </button>
                        
                        <div className="w-full pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                                {t.needHelp}
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { playSound('click'); onGetCode(); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-400 hover:text-white text-xs font-bold transition-all group"
                                >
                                    <Key className="w-3.5 h-3.5" />
                                    {t.getCode}
                                </button>
                                <a 
                                    href="https://t.me/falllconnnn" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-400 hover:text-white text-xs font-bold transition-all group"
                                >
                                    <Send className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    {t.contactDevBtn}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MotionDiv>

        {/* Loading Overlay */}
        <AnimatePresence>
            {isLoading && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl"
                >
                    <div className="flex flex-col items-center p-8 min-w-[280px]">
                        <div className="relative w-20 h-20 mb-8">
                            {/* Futuristic Spinner */}
                            <div className="absolute inset-0 rounded-full border border-zinc-800" />
                            <div className="absolute inset-0 rounded-full border border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            <div className="absolute inset-2 rounded-full border border-b-emerald-500 border-t-transparent border-l-transparent border-r-transparent animate-spin-reverse" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                                {keyNameFound ? (
                                    <ShieldCheck className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" />
                                ) : (
                                    <Shield className="w-8 h-8 text-zinc-700 animate-pulse" />
                                )}
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-black text-white tracking-[0.2em] mb-2 uppercase text-center">
                            {keyNameFound ? t.welcome : t.processing}
                        </h3>
                        
                        <p className={`text-xs font-mono transition-colors duration-300 ${keyNameFound ? 'text-green-500 font-bold' : 'text-zinc-500'}`}>
                            {keyNameFound ? 'ACCESS GRANTED' : loadingText}
                        </p>
                        
                        <AnimatePresence>
                            {keyNameFound && (
                                <MotionDiv 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-8 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full"
                                >
                                    <span className="text-xs font-bold text-green-400 tracking-wider">{keyNameFound}</span>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>

        {/* Terms of Service Modal */}
        <AnimatePresence>
            {showTos && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    onClick={() => setShowTos(false)}
                >
                    <MotionDiv 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-[#09090b] border border-white/10 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <FileText className="w-4 h-4 text-green-500" />
                                </div>
                                <h3 className="font-bold text-white uppercase tracking-wider text-sm">{t.tosTitle}</h3>
                            </div>
                            <button onClick={() => setShowTos(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto text-sm text-zinc-400 leading-relaxed font-mono">
                            <p>{t.tosBody}</p>
                            <br />
                            <div className="flex items-center gap-2 opacity-50 text-[10px] mt-4 pt-4 border-t border-dashed border-zinc-800">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Version 4.0.0 - Updated 2025</span>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#0c0c0e]">
                            <button 
                                onClick={() => setShowTos(false)}
                                className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-[0.15em] transition-colors hover:bg-zinc-200 shadow-lg"
                            >
                                {t.tosAgree}
                            </button>
                        </div>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    </div>
  );
};
