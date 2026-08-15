import React from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronLeft } from 'lucide-react';
import { playSound } from '../services/audio';
import ultrapariLogo from '../assets/ultrapari.jpg';
import greenbetLogo from '../assets/greenbet.jpg';

const MotionDiv = motion.div as any;

interface PlatformSelectProps {
  onSelect: (platform: string) => void;
  activeUserCount: number;
}

const PLATFORMS = [
  { name: 'ULTRAPARI', logo: ultrapariLogo },
  { name: 'GreenBet', logo: greenbetLogo },
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

      {/* Title */}
      <div className="px-4 mt-10 text-center">
        <h1 className="text-xl font-black text-white tracking-tight">الرجاء اختيار المنصة</h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      </div>

      {/* Platforms */}
      <div className="px-4 mt-8 flex flex-col gap-4">
        {PLATFORMS.map((p, i) => (
          <MotionDiv
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { playSound('click'); onSelect(p.name); }}
            className="cursor-pointer flex items-center gap-4 bg-[#0a0a0c] border border-purple-500/25 hover:border-purple-500/60 rounded-3xl p-4 transition-all shadow-[0_0_20px_rgba(168,85,247,0.08)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          >
            <div className="w-20 h-20 shrink-0 rounded-[25px] overflow-hidden border border-purple-500/30 bg-black">
              <img src={p.logo} alt={p.name} loading="lazy" width={512} height={512} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white tracking-wide truncate">{p.name}</h2>
              <p className="text-[10px] text-purple-400/70 font-bold uppercase tracking-[0.2em] mt-1">Platform</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-purple-500/60" />
          </MotionDiv>
        ))}
      </div>
    </div>
  );
};
