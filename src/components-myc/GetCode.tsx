
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Download, Ticket, Wallet, Upload, Check, Copy, Loader2, Send, Image as ImageIcon, ShieldCheck, Key, Timer, AlertCircle, RefreshCw, X, Lock, User } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { playSound } from '../services/audio';

interface GetCodeProps {
    onBack: () => void;
    language: Language;
}

const MotionDiv = motion.div as any;

type ViewState = 'STEPS' | 'SUCCESS' | 'EXPIRED';

export const GetCode: React.FC<GetCodeProps> = ({ onBack, language }) => {
    const [viewState, setViewState] = useState<ViewState>('STEPS');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isKeyCopied, setIsKeyCopied] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expiryTime, setExpiryTime] = useState<number | null>(null);
    const [timeLeftDisplay, setTimeLeftDisplay] = useState("15:00");
    const [username, setUsername] = useState('');

    const steps = {
        en: [
            { icon: Download, title: "Install App", text: "Download & Install 1xbet application" },
            { icon: Ticket, title: "Use Promocode", text: "Register with code: XKX11", action: "copy", value: "XKX11" },
            { icon: Wallet, title: "Deposit", text: "Deposit at least $10 or 500 EGP" },
            { icon: Upload, title: "Verification", text: "Upload screenshot of your deposit" }
        ],
        ar: [
            { icon: Download, title: "تثبيت التطبيق", text: "قم بتحميل وتثبيت تطبيق 1xbet" },
            { icon: Ticket, title: "استخدم البروموكود", text: "سجل باستخدام الكود: XKX11", action: "copy", value: "XKX11" },
            { icon: Wallet, title: "عملية الإيداع", text: "إيداع ما لا يقل عن 10 دولار أو 500 جنيه" },
            { icon: Upload, title: "التحقق", text: "ارفع لقطة شاشة لعملية الإيداع" }
        ]
    };

    const currentSteps = language === 'ar' ? steps.ar : steps.en;

    // Check for existing valid or expired key on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('temp_access_key');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.key && data.expiresAt) {
                    setGeneratedKey(data.key);
                    setExpiryTime(data.expiresAt);
                    
                    if (Date.now() > data.expiresAt) {
                        setViewState('EXPIRED');
                    } else {
                        setViewState('SUCCESS');
                    }
                }
            } else {
                setViewState('STEPS');
            }
        } catch (e) {
            console.error("Failed to restore temp key", e);
            setViewState('STEPS');
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (viewState !== 'SUCCESS' || !expiryTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = expiryTime - now;
            
            if (diff <= 0) {
                setTimeLeftDisplay("00:00");
                setViewState('EXPIRED');
                clearInterval(interval);
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeftDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [viewState, expiryTime]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setSelectedImage(e.target.result as string);
                    playSound('click');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        playSound('click');
    };

    const handleCopy = (text: string, isKey = false) => {
        navigator.clipboard.writeText(text);
        if (isKey) {
            setIsKeyCopied(true);
            setTimeout(() => setIsKeyCopied(false), 2000);
        } else {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
        playSound('click');
    };

    const generateDeviceKey = async () => {
        // Collect device traits
        const { hardwareConcurrency, platform, language } = navigator;
        const { width, height, colorDepth } = screen;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Construct seed string
        const seed = `${width}x${height}-${colorDepth}-${hardwareConcurrency}-${platform}-${timeZone}-${language.split('-')[0]}`;
        
        // Simple hash generation
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const hashStr = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
        const p1 = hashStr.slice(0, 4);
        const p2 = hashStr.slice(4, 8);
        
        return `FREE-${p1}-${p2}-DEV1`;
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;
        
        setIsSubmitting(true);
        playSound('click');
        
        await new Promise(r => setTimeout(r, 2500));
        
        const newKey = await generateDeviceKey();
        // 15 Minutes Validity
        const expiresAt = Date.now() + 15 * 60 * 1000; 
        
        localStorage.setItem('temp_access_key', JSON.stringify({
            key: newKey,
            expiresAt: expiresAt
        }));

        setGeneratedKey(newKey);
        setExpiryTime(expiresAt);
        setIsSubmitting(false);
        setViewState('SUCCESS');
        playSound('success');
    };

    const handleContactDev = () => {
        if (!username.trim()) return;
        
        const msg = `Hello, my key ${generatedKey} has expired. My username is ${username}. I would like to request an extension or upgrade.`;
        window.open(`https://t.me/falllconnnn?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden font-mono selection:bg-purple-500/30">
            {/* Header */}
            <div className="relative z-10 px-6 py-4 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-xl flex items-center justify-between shadow-lg">
                <button 
                    onClick={onBack}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/10 transition-all active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {language === 'ar' ? "التحقق من الشروط" : "Verification"}
                    </h1>
                    <span className="text-[9px] font-bold text-purple-500 uppercase tracking-[0.2em] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {language === 'ar' ? "بوابة آمنة" : "Secure Gateway"}
                    </span>
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 relative z-10 pb-20">
                <div className="max-w-md mx-auto space-y-6">
                    
                    <AnimatePresence mode="wait">
                        {viewState === 'STEPS' && (
                            <MotionDiv 
                                key="steps"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                {/* Steps Card */}
                                <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-1 shadow-2xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
                                    
                                    <div className="relative bg-[#09090b]/80 backdrop-blur-3xl rounded-[1.8rem] p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                                                <span className="text-xs font-black text-white">1</span>
                                            </div>
                                            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                                                {language === 'ar' ? "أكمل الخطوات التالية" : "Complete Requirements"}
                                            </h2>
                                        </div>

                                        <div className="space-y-4">
                                            {currentSteps.map((step, index) => (
                                                <div key={index} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group/step">
                                                    <div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 group-hover/step:border-purple-500/30 group-hover/step:bg-purple-500/10 transition-colors shrink-0">
                                                        <step.icon className="w-4 h-4 text-zinc-500 group-hover/step:text-purple-500 transition-colors" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xs font-bold text-white mb-0.5">{step.title}</h3>
                                                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{step.text}</p>
                                                        
                                                        {step.action === 'copy' && step.value && (
                                                            <button 
                                                                onClick={() => handleCopy(step.value!, false)}
                                                                className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-purple-500/30 transition-colors w-fit group/copy active:scale-95"
                                                            >
                                                                <code className="text-[11px] font-mono font-bold text-purple-400">{step.value}</code>
                                                                {isCopied ? <Check className="w-3 h-3 text-purple-500" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover/copy:text-white" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Section */}
                                <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-1 shadow-2xl overflow-hidden relative">
                                    <div className="relative bg-[#09090b]/80 backdrop-blur-3xl rounded-[1.8rem] p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                                                <span className="text-xs font-black text-white">2</span>
                                            </div>
                                            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                                                {language === 'ar' ? "إثبات العملية" : "Proof of Action"}
                                            </h2>
                                        </div>

                                        <div 
                                            onClick={() => !selectedImage && fileInputRef.current?.click()}
                                            className={`
                                                relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group/upload
                                                ${selectedImage 
                                                    ? 'border-purple-500/30 bg-zinc-900' 
                                                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 cursor-pointer'}
                                            `}
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />

                                            {selectedImage ? (
                                                <div className="w-full h-full relative group/preview">
                                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                                        >
                                                            <RefreshCw className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={removeImage}
                                                            className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-300 shadow-lg">
                                                        <Upload className="w-5 h-5 text-zinc-500 group-hover/upload:text-white transition-colors" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 group-hover/upload:text-white transition-colors">
                                                            {language === 'ar' ? "اضغط لرفع الصورة" : "Click to Upload"}
                                                        </p>
                                                        <p className="text-[9px] text-zinc-600">JPG, PNG, WEBP</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={handleSubmit}
                                            disabled={!selectedImage || isSubmitting}
                                            className={`
                                                mt-6 w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg
                                                ${!selectedImage || isSubmitting
                                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                                                    : 'bg-purple-500 hover:bg-purple-400 text-black shadow-purple-500/20 active:scale-[0.98]'}
                                            `}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>{language === 'ar' ? "جاري التحقق..." : "Verifying..."}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>{language === 'ar' ? "تأكيد الطلب" : "Submit Request"}</span>
                                                </>
                                            )}
                                        </button>

                                        {!isSubmitting && !selectedImage && (
                                            <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-zinc-600 bg-zinc-900/50 py-2 rounded-lg border border-white/5">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{language === 'ar' ? "مطلوب إثبات الصورة للمتابعة" : "Image proof required to proceed"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </MotionDiv>
                        )}

                        {viewState === 'SUCCESS' && (
                            <MotionDiv 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-6"
                            >
                                {/* Success Ticket */}
                                <div className="w-full bg-[#0c0c0e] border border-purple-500/30 rounded-[2rem] p-1 shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                    
                                    <div className="relative bg-[#09090b]/90 backdrop-blur-xl rounded-[1.8rem] p-8 flex flex-col items-center text-center">
                                        
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900 to-[#09090b] border border-purple-500/50 flex items-center justify-center relative z-10 shadow-2xl">
                                                <ShieldCheck className="w-10 h-10 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[#09090b] z-20">
                                                <Check className="w-3 h-3 text-black stroke-[4]" />
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">
                                            {language === 'ar' ? "تمت الموافقة" : "Access Granted"}
                                        </h2>
                                        <p className="text-[10px] text-purple-400 font-mono uppercase tracking-wider mb-8">
                                            {language === 'ar' ? "هوية مؤقتة تم إنشاؤها" : "Temporary Identity Generated"}
                                        </p>

                                        <div 
                                            onClick={() => generatedKey && handleCopy(generatedKey, true)}
                                            className="w-full bg-[#050505] rounded-xl border border-purple-500/30 p-4 mb-6 cursor-pointer group/key hover:bg-purple-900/5 transition-colors relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                                            
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Access Key</span>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
                                                    {isKeyCopied ? <span className="text-purple-500">COPIED</span> : <span>TAP TO COPY</span>}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-center gap-3">
                                                <Key className="w-5 h-5 text-purple-600" />
                                                <code className="text-lg sm:text-2xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                                                    {generatedKey}
                                                </code>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 mb-8">
                                            <Timer className="w-4 h-4 text-orange-500 animate-pulse" />
                                            <span className="text-sm font-mono font-bold text-white tabular-nums">
                                                {timeLeftDisplay}
                                            </span>
                                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                                                {language === 'ar' ? "متبقي" : "Remaining"}
                                            </span>
                                        </div>

                                        <button 
                                            onClick={onBack}
                                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
                                        >
                                            {language === 'ar' ? "تسجيل الدخول الآن" : "Login Now"}
                                        </button>
                                    </div>
                                </div>
                            </MotionDiv>
                        )}

                        {viewState === 'EXPIRED' && (
                            <MotionDiv 
                                key="expired"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-6"
                            >
                                <div className="w-full bg-[#0c0c0e] border border-red-500/30 rounded-[2rem] p-1 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                    
                                    <div className="relative bg-[#09090b]/90 backdrop-blur-xl rounded-[1.8rem] p-8 flex flex-col items-center text-center">
                                        
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-900 to-[#09090b] border border-red-500/50 flex items-center justify-center relative z-10 shadow-2xl">
                                                <Lock className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">
                                            {language === 'ar' ? "انتهت الصلاحية" : "Key Expired"}
                                        </h2>
                                        <p className="text-[10px] text-red-400 font-mono uppercase tracking-wider mb-8">
                                            {language === 'ar' ? "انتهت الفترة التجريبية لجهازك" : "Device Trial Period Ended"}
                                        </p>

                                        <div className="w-full space-y-4 mb-6">
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-[10px] text-zinc-400 leading-relaxed">
                                                {language === 'ar' 
                                                    ? "لقد استنفدت مفتاح الوصول المجاني المخصص لهذا الجهاز. للمتابعة، يرجى التواصل مع المطور لترقية حسابك." 
                                                    : "You have exhausted the free access key assigned to this device. To continue, please contact the developer to upgrade your account."}
                                            </div>

                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="w-4 h-4 text-zinc-600" />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder={language === 'ar' ? "أدخل اسم المستخدم" : "Enter Username"}
                                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/30 transition-all font-mono"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleContactDev}
                                            disabled={!username.trim()}
                                            className={`
                                                w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-lg
                                                ${!username.trim() 
                                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                                                    : 'bg-white text-black hover:bg-zinc-200 active:scale-95'}
                                            `}
                                        >
                                            <Send className="w-4 h-4" />
                                            {language === 'ar' ? "تواصل مع المطور" : "Contact Developer"}
                                        </button>
                                    </div>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
