"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import ChatInterface from "./ChatInterface";
import { useAuth } from "@/context/AuthContext";
import CommentsSection from "./CommentsSection";

interface AnalysisPanelProps {
  showAnalysis: boolean;
  isAnalyzing: boolean;
  currentAnalysis: any;
  analysisId?: string | null;
  analysisError: string | null;
  copied: boolean;
  onCopy: (code: string) => void;
  onNewAnalysis?: (refined: any) => void;
}

export default function AnalysisPanel({
  showAnalysis,
  isAnalyzing,
  currentAnalysis,
  analysisId,
  analysisError,
  copied,
  onCopy,
  onNewAnalysis
}: AnalysisPanelProps) {
  const { user } = useAuth();
  return (
    <section className="flex-1 flex flex-col min-w-0 bg-[#0d1117] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-50"></div>
      
      {/* Panel Header */}
      <div className="h-10 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 relative z-10">
        <h2 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <span className="material-icons-round text-xs animate-pulse">auto_awesome</span>
          AI Insight Engine
        </h2>
        <div className="flex gap-4">
          <div className="text-[9px] font-mono text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            Model: Llama 3.1 8B
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-8 py-10">
        <AnimatePresence mode="wait">
          {!showAnalysis && !isAnalyzing && (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none"
            >
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-6">
                <span className="material-icons-round text-3xl text-slate-700">insights</span>
              </div>
              <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">Awaiting Input Stream</h3>
              <p className="max-w-xs text-slate-600 text-[11px] leading-relaxed">
                Paste an error trace in the left panel to begin a structural analysis of your code state.
              </p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-4 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-y-0 left-0 bg-primary shadow-glow"
                ></motion.div>
              </div>
              <p className="text-[10px] font-mono text-primary animate-pulse tracking-widest">Simulating Execution Paths...</p>
            </motion.div>
          )}

          {showAnalysis && currentAnalysis && (
            <div className="max-w-3xl mx-auto space-y-6">
              <motion.div 
                key={analysisId + "_broke"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/[0.02] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2">
                  <span className="material-icons-round text-red-500 text-sm">warning</span>
                  <h4 className="font-mono text-[11px] font-black text-red-400 uppercase tracking-widest">What Broke</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {currentAnalysis.whatBroke}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                key={analysisId + "_why"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.02] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2">
                  <span className="material-icons-round text-yellow-500 text-sm">psychology</span>
                  <h4 className="font-mono text-[11px] font-black text-yellow-400 uppercase tracking-widest">Why It Happened</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {currentAnalysis.whyHappened}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-mono text-yellow-300 uppercase">{currentAnalysis.framework}</span>
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-mono text-yellow-300 uppercase">{currentAnalysis.language}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                key={analysisId + "_fix"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-primary/[0.02] overflow-hidden shadow-2xl shadow-black/40"
              >
                <div className="px-5 py-3 border-b border-primary/20 bg-primary/5 flex items-center gap-2">
                  <span className="material-icons-round text-primary text-sm">auto_fix_high</span>
                  <h4 className="font-mono text-[11px] font-black text-primary uppercase tracking-widest">Recommended Fix</h4>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {currentAnalysis.fixSteps?.map((step: any, idx: number) => (
                      <div key={`step-${step.id || idx}`} className="flex items-start gap-4">
                        <span className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">{step.id || `0${idx + 1}`}</span>
                        <p className="text-slate-300 text-[13px]">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-black/40 border border-white/5 overflow-hidden font-mono">
                    <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Patched Code</span>
                      <button 
                        onClick={() => onCopy(currentAnalysis.codePatch?.code || "")}
                        className={`flex items-center gap-1.5 transition-all ${copied ? "text-emerald-400" : "text-slate-500 hover:text-white"}`}
                        title="Copy Patch"
                      >
                        <span className="text-[9px] font-mono leading-none">{copied ? "COPIED" : "COPY"}</span>
                        <span className="material-icons-round text-sm">{copied ? "done" : "content_copy"}</span>
                      </button>
                    </div>
                    <pre className="p-5 text-xs text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      <span className="token-comment">{currentAnalysis.codePatch?.comment}</span>&#10;
                      {currentAnalysis.codePatch?.code}
                    </pre>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                key={analysisId + "_prevent"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                  <span className="material-icons-round text-slate-400 text-sm">shield</span>
                  <h4 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">Prevention Tip</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-[12px] leading-relaxed italic">
                    "{currentAnalysis.prevention}"
                  </p>
                </div>
              </motion.div>

              {/* Iterative Debugging Chat - Only if saved/authenticated */}
              {analysisId && onNewAnalysis && (
                <ChatInterface 
                  analysisId={analysisId}
                  initialMessages={currentAnalysis.messages || []}
                  errorContext={currentAnalysis.originalError}
                  onNewAnalysis={onNewAnalysis}
                />
              )}

              {/* Footnote */}
              <div className="text-center pt-10 opacity-30">
                <p className="text-[9px] font-mono uppercase tracking-[0.3em]">Analysis complete • Model-Hash #llama-3.1-8b</p>
              </div>

              {/* Collaborative Comments */}
              {user && analysisId && (
                <CommentsSection analysisId={analysisId} />
              )}
            </div>
          )}

          {/* Analysis Error Message */}
          {analysisError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono text-center mt-6"
            >
              {analysisError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
