"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseStackTrace, TraceFrame } from "@/lib/ai/traceParser";

interface TraceVisualizerProps {
  stackTrace: string;
}

export default function TraceVisualizer({ stackTrace }: TraceVisualizerProps) {
  const [showInternal, setShowInternal] = useState(false);
  const frames = parseStackTrace(stackTrace);
  
  const displayedFrames = showInternal ? frames : frames.filter(f => !f.isInternal);

  if (frames.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden font-mono mt-4">
      <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-primary text-xs animate-spin-slow">hub</span>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Execution Path</h4>
        </div>
        <button 
          onClick={() => setShowInternal(!showInternal)}
          className={`text-[9px] px-2 py-1 rounded border transition-all ${
            showInternal 
              ? "bg-primary/20 border-primary/40 text-primary" 
              : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
          }`}
        >
          {showInternal ? "HIDE INTERNAL" : "SHOW INTERNAL"}
        </button>
      </div>

      <div className="p-6 relative">
        {/* The Connection Line */}
        <div className="absolute left-[33px] top-8 bottom-8 w-[1px] bg-gradient-to-b from-red-500 via-primary/20 to-transparent"></div>

        <div className="space-y-8 relative z-10">
          <AnimatePresence mode="popLayout">
            {displayedFrames.map((frame, idx) => (
              <motion.div 
                key={`${frame.file}-${frame.line}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-4 group"
              >
                {/* Visual Node */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${
                    idx === 0 
                      ? "bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110" 
                      : "bg-[#0d1117] border-slate-700 group-hover:border-primary/50"
                  }`}>
                    {idx === 0 && <div className="w-1 h-1 rounded-full bg-white animate-ping"></div>}
                  </div>
                  <span className="text-[8px] text-slate-600 mt-2 font-bold">{idx === 0 ? "CRASH" : idx}</span>
                </div>

                {/* Frame Content */}
                <div className={`flex-1 min-w-0 transition-all duration-300 ${
                  frame.isInternal ? "opacity-40 grayscale" : "opacity-100"
                }`}>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-bold truncate ${
                      idx === 0 ? "text-red-400" : "text-slate-300 group-hover:text-primary transition-colors"
                    }`}>
                      {frame.functionName}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-500 truncate max-w-[250px]">
                        {frame.file.split('/').pop()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-slate-600">
                        L{frame.line}:{frame.column}
                      </span>
                      {frame.isInternal && (
                        <span className="text-[8px] text-slate-700 italic">internal</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Action */}
                <button 
                  onClick={() => navigator.clipboard.writeText(`${frame.file}:${frame.line}`)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-primary transition-all active:scale-95"
                  title="Copy path"
                >
                  <span className="material-icons-round text-xs">content_copy</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-5 py-2 border-t border-white/5 bg-black/20">
        <p className="text-[8px] text-slate-700 italic">
          * Total of {frames.length} frames detected in execution context. {frames.filter(f => f.isInternal).length} internal frames suppressed.
        </p>
      </div>
    </div>
  );
}
