import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, ArrowRight, ScrollText } from 'lucide-react';
import { playSound } from '../services/audio';

const MotionDiv = motion.div as any;

interface TermsProps {
  platform: string;
  onAccept: () => void;
  onBack: () => void;
}

const RULES = [
  'هذا التطبيق أداة تحليل إحصائي ولا يضمن أي أرباح.',
  'أنت وحدك المسؤول عن قراراتك المالية داخل المنصة.',
  'يمنع مشاركة حسابك أو مفتاح الدخول مع أي شخص آخر.',
  'يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام الخدمة.',
  'أي محاولة تلاعب بالنظام تؤدي لحظر دائم للحساب.',
];

export const Terms: React.FC<TermsProps> = ({ platform, onAccept, onBack }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div dir="rtl" className="flex-1 flex flex-col w-full min-h-screen bg-black px-4 py-6">
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-auto flex-1 flex flex-col"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-purple-600/30 to-black border border-purple-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.25)]">
            <ScrollText className="w-7 h-7 text-purple-300" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-white tracking-tight">الشروط والأحكام</h1>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-purple-400/70">{platform}</p>
        </div>

        <div className="relative rounded-[28px] border border-purple-500/25 bg-gradient-to-b from-[#0c0a12] to-black p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)]">
          <div className="flex flex-col gap-4">
            {RULES.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 shrink-0 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[10px] font-black text-purple-300">
                  {i + 1}
                </div>
                <p className="text-[13px] leading-relaxed text-zinc-300 font-medium">{r}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { playSound('click'); setAgreed(!agreed); }}
          className="mt-6 flex items-center gap-3 text-right"
        >
          <span className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${agreed ? 'bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-purple-500/40 bg-purple-500/5'}`}>
            {agreed && <Check className="w-4 h-4 text-white" />}
          </span>
          <span className="text-xs font-bold text-zinc-300">أوافق على جميع الشروط والأحكام</span>
        </button>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!agreed}
            onClick={() => { playSound('success'); onAccept(); }}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
              agreed
                ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)]'
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            متابعة
          </motion.button>
          <button
            onClick={() => { playSound('click'); onBack(); }}
            className="w-full py-3 rounded-2xl text-[11px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-2 transition-colors"
          >
            رجوع
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </MotionDiv>
    </div>
  );
};
