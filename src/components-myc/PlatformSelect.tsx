import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Zap } from 'lucide-react';
import { playSound } from '../services/audio';
import ultrapariLogo from '../assets/ultrapari.jpg';
import greenbetLogo from '../assets/greenbet.jpg';

const MotionDiv = motion.div as any;

interface PlatformSelectProps {
  onSelect: (platform: string) => void;
  activeUserCount: number;
}

const PLATFORMS = [
  { name: 'ULTRAPARI', logo: ultrapariLogo, tag: 'HIGH ACCURACY' },
  { name: 'GreenBet', logo: greenbetLogo, tag: 'FAST SIGNALS' },
];

export const PlatformSelect: React.FC<PlatformSelectProps> = ({ onSelect, activeUserCount }) => {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-black">
      {/* Top Bar */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/30 via-black to-purple-900/30 border border-purple-500/40 rounded-2xl px-4 py-3 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
          <span className="text-sm font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500 uppercase">
            Ultra VIP
          </span>
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-200 tracking-wider">
              {activeUserCount.toLocaleString()} <span className="text-purple-400/70">Users online</span>
            </span>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-700/20 blur-[110px] rounded-full" />

      {/* Title */}
      <div className="relative px-4 mt-12 text-center">
        <span className="inline-block text-[9px] font-black uppercase tracking-[0.4em] text-purple-400/70">Select</span>
        <h1 className="mt-2 text-2xl font-black text-white tracking-tight">الرجاء اختيار المنصة</h1>
        <div className="mx-auto mt-4 h-[2px] w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      </div>

      {/* Platforms */}
      <div dir="rtl" className="relative px-4 mt-10 flex flex-col gap-5">
        {PLATFORMS.map((p, i) => (
          <MotionDiv
            key={p.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', bounce: 0.25 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playSound('click'); onSelect(p.name); }}
            className="group relative cursor-pointer rounded-[28px] p-[1px] bg-gradient-to-br from-purple-500/50 via-purple-500/10 to-transparent transition-all hover:from-purple-400/80"
          >
            <div className="relative flex items-center gap-4 rounded-[27px] bg-gradient-to-l from-[#120c1c] to-[#050506] p-4 overflow-hidden shadow-[0_10px_40px_-15px_rgba(168,85,247,0.5)]">
              {/* sheen */}
              <div className="pointer-events-none absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Logo (right side in RTL) */}
              <div className="relative w-[74px] h-[74px] shrink-0 rounded-[25px] overflow-hidden border border-purple-400/30 bg-black shadow-[0_0_25px_rgba(168,85,247,0.25)]">
                <img src={p.logo} alt={p.name} loading="lazy" width={512} height={512} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[25px]" />
              </div>

              <div className="flex-1 min-w-0 text-right">
                <h2 className="text-xl font-black text-white tracking-tight truncate">{p.name}</h2>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1">
                  <Zap className="w-3 h-3 text-purple-300" />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-purple-200">{p.tag}</span>
                </div>
              </div>

              <div className="w-9 h-9 shrink-0 rounded-full border border-purple-500/30 bg-purple-500/5 flex items-center justify-center text-purple-300 transition-all group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-400">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
};
