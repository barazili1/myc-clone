
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, XCircle } from 'lucide-react';
import { playSound } from '../services/audio';

const MotionDiv = motion.div as any;

interface GridProps {
  path: number[]; // Array of column indices. index 0 = row 1 (bottom), index 9 = row 10 (top)
  isAnalyzing: boolean;
  predictionId?: string;
  onCellClick?: (rowIndex: number, colIndex: number) => void;
  rowCount: number;
  difficulty: string;
  revealRotten?: boolean;
  gridData?: boolean[][]; // Real data for the grid (true=good, false=bad)
}

const COLS = 5;

// Extended odds for dynamic row counts
const ODDS_MAP = [
  "1.23", "1.54", "1.93", "2.41", "4.02", 
  "6.71", "11.18", "27.96", "69.91", "349.54",
  "x500", "x1k", "x2.5k", "x5k", "MAX"
];

export const Grid: React.FC<GridProps> = ({ 
  path, 
  isAnalyzing, 
  predictionId, 
  onCellClick,
  rowCount,
  difficulty,
  revealRotten = false,
  gridData
}) => {
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  
  // Helper to reverse index for visual rendering (Row N at top, Row 0 at bottom)
  const renderRowIndices = useMemo(() => {
    return Array.from({ length: rowCount }, (_, i) => rowCount - 1 - i);
  }, [rowCount]);

  // Determine if we have a failed/empty path
  const isFailure = !isAnalyzing && predictionId && (path.length === 0 || path.every(v => v === -1));
  const isSuccess = !isAnalyzing && predictionId && !isFailure;

  // Trigger success flash when a new valid prediction arrives
  useEffect(() => {
      if (isSuccess) {
          setShowSuccessFlash(true);
          const timer = setTimeout(() => setShowSuccessFlash(false), 2000);
          return () => clearTimeout(timer);
      }
  }, [predictionId, isSuccess]);

  // Dynamic bad apple calculation based on standard Apple of Fortune rules (Fallback if no real data)
  const badAppleCounts = useMemo(() => {
    return Array.from({ length: rowCount }, (_, rowIndex) => {
        const level = rowIndex + 1;
        if (level <= 4) return 1;
        if (level <= 7) return 2;
        if (level <= 9) return 3;
        return 4;
    });
  }, [rowCount]);

  // Deterministically generate the board layout based on predictionId
  const boardLayout = useMemo(() => {
    if (!predictionId) return null;

    return Array.from({ length: rowCount }).map((_, rowIndex) => {
        const safeColIndex = path[rowIndex] !== undefined ? path[rowIndex] : -1;
        
        if (safeColIndex === -1 && !gridData) {
             return Array(COLS).fill('unknown');
        }

        // Use real grid data if available
        if (gridData && gridData[rowIndex]) {
            const realRow = gridData[rowIndex];
            return realRow.map((isSafe, colIndex) => {
                if (colIndex === safeColIndex) return 'path';
                return isSafe ? 'good' : 'bad';
            });
        }

        // Fallback simulation logic
        const numBad = badAppleCounts[rowIndex];
        const indices = Array.from({ length: COLS }, (_, i) => i);
        const potentialBadIndices = indices.filter(i => i !== safeColIndex);
        
        // Fisher-Yates shuffle
        for (let i = potentialBadIndices.length - 1; i > 0; i--) {
             const j = Math.floor(Math.random() * (i + 1));
             [potentialBadIndices[i], potentialBadIndices[j]] = [potentialBadIndices[j], potentialBadIndices[i]];
        }

        const badIndices = potentialBadIndices.slice(0, numBad);
        
        return indices.map(colIndex => {
            if (colIndex === safeColIndex) return 'path';
            if (badIndices.includes(colIndex)) return 'bad';
            return 'good'; // Safe but not on path
        });
    });
  }, [predictionId, path, rowCount, badAppleCounts, gridData]);

  const getExtraVisibleIndex = (rowIndex: number, layoutRow: string[]) => {
      const goodIndices = layoutRow
        .map((type, idx) => type === 'good' ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (goodIndices.length === 0) return -1;
      const indexToPick = (rowIndex * 7 + 3) % goodIndices.length;
      return goodIndices[indexToPick];
  };

  return (
    <div className="relative w-full max-w-md mx-auto my-0">
      <div className={`
          flex flex-col gap-1 p-3 glass-panel rounded-2xl border shadow-2xl relative z-10 transition-all duration-500 overflow-visible
          ${showSuccessFlash ? 'border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]' : 'border-white/10'}
          ${isFailure ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}
      `}>
        
        {/* Success Flash Overlay */}
        <AnimatePresence>
          {showSuccessFlash && (
             <MotionDiv
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-0 pointer-events-none rounded-2xl overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent mix-blend-overlay" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] animate-pulse" />
             </MotionDiv>
          )}
        </AnimatePresence>

        {/* Failure Overlay */}
        <AnimatePresence>
            {isFailure && (
              <MotionDiv 
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 rounded-2xl p-6 text-center"
              >
                  <MotionDiv 
                    initial={{ scale: 0.8, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                      <div className="relative">
                          <XCircle className="w-16 h-16 text-red-500 relative z-10" />
                          <div className="absolute inset-0 bg-red-500/30 blur-xl animate-pulse" />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-widest uppercase">No Path Found</h3>
                      <p className="text-zinc-400 text-xs max-w-[200px] leading-relaxed">
                        The AI could not identify a high-probability path for this configuration.
                      </p>
                  </MotionDiv>
              </MotionDiv>
            )}
        </AnimatePresence>

        {/* Column Headers (1-5) */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 relative z-10">
            <div className="w-12 text-right">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Odds</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 flex-1">
                {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="text-center">
                        <span className="text-xs font-bold text-zinc-400 font-mono">{num}</span>
                    </div>
                ))}
            </div>
        </div>

        {renderRowIndices.map((rowIndex) => {
          const currentOdd = ODDS_MAP[rowIndex] || "MAX";
          const hasSelection = path[rowIndex] !== undefined && path[rowIndex] !== -1;
          const showResult = (hasSelection || (path.length > 0 && path[0] !== -1)) && !isAnalyzing && boardLayout;
          
          let layoutRow: string[] = [];
          let extraVisibleIndex = -1;

          if (showResult && boardLayout && boardLayout[rowIndex]) {
              layoutRow = boardLayout[rowIndex];
              if (difficulty === 'Medium') {
                  extraVisibleIndex = getExtraVisibleIndex(rowIndex, layoutRow);
              }
          }

          return (
            <div key={`row-${rowIndex}`} className="flex items-center gap-2 relative z-10">
               <div className="w-12 text-right">
                  <span className={`font-mono text-[11px] font-bold tracking-tighter transition-colors duration-300 ${showResult ? 'text-zinc-500' : 'text-zinc-600'}`}>
                    {currentOdd}
                  </span>
               </div>

              <div className="grid grid-cols-5 gap-1.5 flex-1">
                {Array.from({ length: COLS }).map((_, colIndex) => {
                  
                  let cellType = 'unknown';
                  if (showResult && layoutRow.length > 0) {
                      cellType = layoutRow[colIndex];
                  }

                  const isPath = cellType === 'path';
                  const isBad = cellType === 'bad';
                  const isGood = cellType === 'good';
                  
                  let isVisible = false;

                  if (showResult && layoutRow.length > 0) {
                      let baseVisible = false;
                      
                      if (difficulty === 'Hard') {
                          // Show ALL (Good, Bad, Path)
                          baseVisible = true;
                      } else if (difficulty === 'Medium') {
                          // Show Path AND Extra Good (Total 2 safe apples if possible)
                          baseVisible = isPath || (cellType === 'good' && colIndex === extraVisibleIndex);
                      } else {
                          // Easy: Show Path Only
                          baseVisible = isPath;
                      }

                      isVisible = baseVisible || (revealRotten && isBad);
                  }

                  const isInteractive = !isAnalyzing && onCellClick;

                  // Determine hover style class based on type
                  let hoverClass = '';
                  if (isVisible && showResult) {
                      if (isPath) hoverClass = 'hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]';
                      else if (isBad) hoverClass = 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]';
                      else hoverClass = 'hover:border-violet-300/50 hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]';
                  } else {
                      hoverClass = 'hover:border-zinc-500';
                  }

                  return (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      onClick={() => isInteractive && onCellClick && onCellClick(rowIndex, colIndex)}
                      onMouseEnter={() => {
                          if (!isAnalyzing) {
                              playSound('hover');
                          }
                      }}
                      className={`
                        aspect-square rounded-md flex items-center justify-center
                        transition-all duration-200 relative overflow-hidden border
                        ${isInteractive || (isVisible && showResult) ? 'cursor-pointer' : ''}
                        ${(isVisible && showResult)
                          ? (isPath
                              ? 'bg-purple-500/20 border-purple-500/50'
                              : isBad 
                                ? 'bg-[#2a0b0b] border-red-900/40' 
                                : 'bg-violet-900/10 border-violet-500/10')
                          : 'bg-[#1c1c1f] border-white/5'}
                        ${!isAnalyzing && (isVisible || isInteractive) ? hoverClass : ''}
                      `}
                      style={{
                        boxShadow: isVisible && isPath && showResult ? '0 0 10px rgba(168, 85, 247, 0.2)' : 'none'
                      }}
                    >
                      {(isVisible && showResult) ? (
                         <MotionDiv
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: [1.2, 1] }}
                          transition={{ duration: 0.4, ease: "backOut" }}
                          className="w-full h-full flex items-center justify-center relative"
                         >
                           {/* PREDICTED SAFE APPLE (Hero) */}
                           {isPath && (
                               <Apple className="w-8 h-8 text-purple-400 fill-purple-500/40" />
                           )}
                           
                           {/* OTHER SAFE APPLES (Ghosted) */}
                           {isGood && (
                               <Apple className="w-6 h-6 text-violet-800/50 fill-violet-900/20 opacity-70" />
                           )}

                           {/* ROTTEN APPLES */}
                           {isBad && (
                               <div className="relative flex items-center justify-center w-full h-full">
                                   <Apple className="w-7 h-7 text-[#691e1e] fill-[#2b0a0a]" />
                               </div>
                           )}
                         </MotionDiv>
                      ) : (
                        // Empty state dot
                        <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-purple-500/40' : 'bg-zinc-800'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
