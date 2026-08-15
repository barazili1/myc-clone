
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, ChevronLeft, Sparkles, Copy, Loader2, Terminal, ArrowUp, Shield, Zap, Ghost, Skull, Crown, Bot, Smile, Cpu, Activity, Signal, Wifi, Search, AlertCircle, CornerDownLeft, Gamepad2, Rocket, Flame, Star, Target, Fingerprint, Eye } from 'lucide-react';
import { AccessKey, Language, ChatMessage } from '../types';
import { translations } from '../translations';
import { getChatResponse } from '../services/gemini';
import { playSound } from '../services/audio';

const MotionDiv = motion.div as any;

interface ChatSupportProps {
  onBack: () => void;
  accessKeyData: AccessKey | null;
  language: Language;
  userAvatarId: number;
}

const SUGGESTIONS = [
    "Predict Apple pattern",
    "Crash strategy 2.0x",
    "Mines safe spots",
    "Wild West tips",
    "System status",
    "Account upgrade",
    "Risk management",
    "Algorithm details",
    "Connection latency",
    "Reset RNG seed"
];

// Full Avatar Configuration matching Profile.tsx
const AVATARS = [
    { id: 0, icon: User, color: 'text-zinc-400', bg: 'bg-zinc-800' },
    { id: 1, icon: Ghost, color: 'text-purple-400', bg: 'bg-purple-900/40' },
    { id: 2, icon: Skull, color: 'text-red-400', bg: 'bg-red-900/40' },
    { id: 3, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
    { id: 4, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-900/40' },
    { id: 5, icon: Bot, color: 'text-green-400', bg: 'bg-green-900/40' },
    { id: 6, icon: Smile, color: 'text-pink-400', bg: 'bg-pink-900/40' },
    { id: 7, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
    { id: 8, icon: Gamepad2, color: 'text-orange-400', bg: 'bg-orange-900/40' },
    { id: 9, icon: Rocket, color: 'text-red-500', bg: 'bg-red-900/40' },
    { id: 10, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-900/40' },
    { id: 11, icon: Star, color: 'text-yellow-300', bg: 'bg-yellow-900/40' },
    { id: 12, icon: Target, color: 'text-red-400', bg: 'bg-red-900/40' },
    { id: 13, icon: Cpu, color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
    { id: 14, icon: Fingerprint, color: 'text-violet-400', bg: 'bg-violet-900/40' },
    { id: 15, icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
];

export const ChatSupport: React.FC<ChatSupportProps> = ({ onBack, accessKeyData, language, userAvatarId }) => {
  const t = translations[language];
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
      if (!accessKeyData) return [];
      try {
          const saved = localStorage.getItem(`local_chat_history_${accessKeyData.key}`);
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Randomize suggestions for the empty state on mount
  const emptyStateSuggestions = useMemo(() => {
    return [...SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, []);

  useEffect(() => {
      if (accessKeyData) {
          localStorage.setItem(`local_chat_history_${accessKeyData.key}`, JSON.stringify(messages));
      }
  }, [messages, accessKeyData]);

  useEffect(() => {
      scrollToBottom();
  }, [messages.length, isAiTyping]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickReplies = useMemo(() => {
      const rotation = messages.length % SUGGESTIONS.length;
      const rotated = [...SUGGESTIONS.slice(rotation), ...SUGGESTIONS.slice(0, rotation)];
      return rotated.slice(0, 3);
  }, [messages.length]);

  const handleSend = async (textOverride?: string) => {
      const textToSend = textOverride || inputText.trim();
      if (!textToSend || !accessKeyData) return;

      setInputText('');
      setIsSending(true);
      playSound('click');

      const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          sender: accessKeyData.name || 'User',
          text: textToSend,
          timestamp: Date.now(),
          avatarId: userAvatarId,
          isAdmin: false,
          isAi: false
      };

      setMessages(prev => [...prev, userMsg]);

      setIsSending(false);
      setIsAiTyping(true);
      playSound('predict');

      try {
          const delay = Math.min(3000, Math.max(1500, textToSend.length * 30));
          await new Promise(r => setTimeout(r, delay));
          
          const aiResponseText = await getChatResponse(textToSend, language);
          
          const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: "EL HETAN AI",
              text: aiResponseText,
              timestamp: Date.now(),
              avatarId: 99,
              isAdmin: true,
              isAi: true
          };

          setMessages(prev => [...prev, aiMsg]);
          playSound('success');

      } catch (e) {
          console.error("AI Error", e);
      } finally {
          setIsAiTyping(false);
      }
  };

  const handleClearHistory = () => {
      setMessages([]);
      if (accessKeyData) {
          localStorage.removeItem(`local_chat_history_${accessKeyData.key}`);
      }
      setSelectedMessage(null);
      playSound('toggle');
  };

  const handleCopy = () => {
      if (!selectedMessage) return;
      navigator.clipboard.writeText(selectedMessage.text);
      setSelectedMessage(null);
      playSound('click');
  };

  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get current user avatar style
  const currentUserAvatar = AVATARS.find(a => a.id === userAvatarId) || AVATARS[0];
  const UserIconComponent = currentUserAvatar.icon;

  return (
    <div className="flex flex-col h-full relative bg-[#050505] overflow-hidden font-mono selection:bg-green-500/30">
        
        {/* HUD Header */}
        <div className="absolute top-0 left-0 right-0 z-50 p-2">
            <div className="glass-panel border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl rounded-2xl mx-2 mt-2 px-4 py-3 flex items-center justify-between shadow-lg">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-black text-white tracking-widest uppercase">
                            AI CORE
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-green-500/80 uppercase tracking-[0.2em] mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Online • 14ms
                    </div>
                </div>

                <button
                   onClick={handleClearHistory}
                   className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                   title="Clear Console"
                >
                   <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            {/* Status Line */}
            <div className="flex justify-between px-6 py-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                <span>Secure Connection</span>
                <span>Encrypted: SHA-256</span>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pt-28 pb-32 space-y-6 relative z-10 px-4 custom-scrollbar">
            <div className="max-w-2xl mx-auto w-full pb-4 min-h-[calc(100vh-200px)] flex flex-col justify-end">
                {messages.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center h-full mb-12"
                    >
                        {/* Central AI Orb */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-green-500/20 blur-[50px] animate-pulse" />
                            <div className="w-32 h-32 rounded-full border border-green-500/30 flex items-center justify-center relative bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                <div className="absolute inset-2 border border-dashed border-green-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-6 border border-dotted border-green-500/40 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
                                <Cpu className="w-12 h-12 text-green-400 relative z-10 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2 tracking-widest uppercase font-mono">
                            System Ready
                        </h2>
                        <p className="text-[10px] text-zinc-500 text-center max-w-[240px] leading-relaxed mb-8 uppercase tracking-wide">
                            Neural network initialized. Awaiting command input for predictive analysis.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                             {emptyStateSuggestions.map((s, i) => (
                                 <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleSend(s)}
                                    className="px-3 py-3 rounded-lg bg-[#0c0c0e] border border-white/5 text-[10px] font-bold text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all text-left flex items-center gap-2 group"
                                 >
                                    <Terminal className="w-3 h-3 text-zinc-600 group-hover:text-green-500 transition-colors" />
                                    {s}
                                 </motion.button>
                             ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender !== "EL HETAN AI";
                            
                            // Retrieve avatar style for this message
                            const avatarStyle = AVATARS.find(a => a.id === msg.avatarId) || AVATARS[0];
                            const AvatarIcon = avatarStyle.icon;

                            return (
                                <MotionDiv 
                                    key={msg.id} 
                                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`
                                        w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-1
                                        ${isMe 
                                            ? `bg-zinc-900 border-zinc-700` 
                                            : `bg-green-900/20 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]`}
                                    `}>
                                        {isMe ? (
                                            <AvatarIcon className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Cpu className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                        {/* Name Label */}
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1 px-1">
                                            {isMe ? 'Commander' : 'System AI'}
                                        </span>
                                        
                                        {/* Message Bubble */}
                                        <div 
                                            onClick={() => setSelectedMessage(msg)}
                                            className={`
                                                relative p-3 rounded-2xl text-xs leading-relaxed border cursor-pointer group transition-all
                                                ${isMe 
                                                    ? 'bg-[#121214] border-white/10 text-zinc-200 rounded-tr-sm hover:border-white/20' 
                                                    : 'bg-[#0c0c0e] border-green-500/20 text-green-100 rounded-tl-sm shadow-[0_0_20px_rgba(34,197,94,0.05)] hover:border-green-500/40'}
                                            `}
                                        >
                                            {msg.text}
                                            
                                            {/* Time & Copy Overlay */}
                                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-mono">{formatTime(msg.timestamp)}</span>
                                                {selectedMessage?.id === msg.id && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="hover:text-white">
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </MotionDiv>
                            );
                        })}

                        {isAiTyping && (
                            <MotionDiv 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-lg bg-green-900/20 border border-green-500/30 flex items-center justify-center shrink-0">
                                    <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1 px-1">
                                        System AI
                                    </span>
                                    <div className="bg-[#0c0c0e] border border-green-500/20 px-4 py-3 rounded-2xl rounded-tl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-75" />
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            </MotionDiv>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
        </div>

        {/* Input Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-40">
            {/* Quick Suggestions (if messages exist) */}
            {messages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar no-scrollbar mask-gradient">
                    {quickReplies.map((qr, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(qr)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#121214] border border-white/10 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/20 transition-all shadow-lg"
                        >
                            {qr}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isAiTyping ? "System processing..." : "Enter system command..."}
                        disabled={isAiTyping}
                        className="w-full bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/30 transition-colors font-mono shadow-xl"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {inputText.length > 0 && (
                            <span className="text-[9px] font-bold text-zinc-600">{inputText.length}</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || isAiTyping}
                    className={`
                        p-3.5 rounded-xl border transition-all shadow-lg flex items-center justify-center
                        ${!inputText.trim() || isAiTyping 
                            ? 'bg-zinc-900 border-white/5 text-zinc-600' 
                            : 'bg-green-600 border-green-500 text-white hover:bg-green-500 active:scale-95'}
                    `}
                >
                    {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CornerDownLeft className="w-5 h-5" />
                    )}
                </button>
            </div>
            
            <div className="text-center mt-2">
                 <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-[0.3em]">AI Prediction Protocol v2.5</span>
            </div>
        </div>
    </div>
  );
};
