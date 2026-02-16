"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getAnalysisById, AnalysisRecord } from "@/lib/analysisService";

import ChatInterface from "@/components/ChatInterface";

export default function AnalysisClient({ id }: { id: string }) {
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeContextId, setActiveContextId] = useState<string>("main-error");

  useEffect(() => {
    async function fetchAnalysis() {
      if (id) {
        try {
          const data = await getAnalysisById(id);
          if (data) {
            setAnalysis(data);
            if (data.context && data.context.length > 0) {
               const main = data.context.find(f => f.isMainError);
               if (main) setActiveContextId(main.id);
               else setActiveContextId(data.context[0].id);
            }
          }
        } catch (error) {
          console.error("Error fetching analysis:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-[#0B0F14] flex items-center justify-center font-mono">
        <p className="text-primary text-xs uppercase tracking-[0.5em] animate-pulse">Accessing Neural Record...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-screen bg-[#0B0F14] flex flex-col items-center justify-center font-mono space-y-4">
        <p className="text-red-500 text-xs uppercase tracking-[0.5em]">Record Corrupted or Not Found</p>
        <Link href="/history" className="text-slate-500 hover:text-white transition-colors text-[10px] uppercase border border-white/10 px-4 py-2 rounded">Back to Archive</Link>
      </div>
    );
  }

  const activeContextFile = analysis.context?.find(f => f.id === activeContextId);

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      <nav className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-background z-50">
        <div className="flex items-center gap-6">
          <Link href="/history" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
            <span className="material-icons-round text-lg">arrow_back</span>
            <span className="text-[10px] font-mono uppercase tracking-widest">Back to History</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-3">
             <span className="text-white font-bold text-sm tracking-tight">{analysis.title}</span>
             <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary uppercase">{analysis.framework}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-white transition-colors" title="Download Report">
            <span className="material-icons-round text-lg">download</span>
          </button>
          <button className="text-slate-500 hover:text-white transition-colors" title="Share fix">
            <span className="material-icons-round text-lg">share</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <section className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-background">
          <div className="h-10 border-b border-white/5 flex items-center px-4 bg-muted/20">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Neural Context Record</span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {analysis.context && analysis.context.length > 1 && (
              <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
                {analysis.context.map((file) => (
                  <button 
                    key={file.id}
                    onClick={() => setActiveContextId(file.id)}
                    className={`px-4 py-2 text-[10px] font-mono border-b-2 transition-all whitespace-nowrap ${
                      activeContextId === file.id 
                      ? "border-primary text-primary bg-primary/5" 
                      : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    {activeContextFile?.isMainError ? "Primary Error Buffer" : `Source: ${activeContextFile?.name || "Original Error"}`}
                  </h4>
                  <div className={`rounded-lg bg-black p-5 border border-white/5 font-mono text-xs leading-relaxed whitespace-pre-wrap ${activeContextFile?.isMainError ? "text-red-400/80" : "text-slate-400"}`}>
                    {activeContextFile ? activeContextFile.content : analysis.originalError}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mb-2 uppercase">
                    <span>Incident Timestamp</span>
                    <span className="text-slate-400">
                      {analysis.createdAt?.toDate ? analysis.createdAt.toDate().toLocaleString() : "Live Stream"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mb-2 uppercase">
                    <span>Session ID</span>
                    <span className="text-slate-400">#8F-2A-{id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 uppercase">
                    <span>Context Weight</span>
                    <span className="text-slate-400">{analysis.context?.length || 1} file(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col bg-[#0d1117] relative overflow-y-auto custom-scrollbar">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-50"></div>
          
          <div className="p-8 lg:p-12 relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <motion.div 
                key={analysis.id + "_broke"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/[0.02] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2">
                  <span className="material-icons-round text-red-500 text-sm">warning</span>
                  <h4 className="font-mono text-[11px] font-black text-red-400 uppercase tracking-widest">What Broke</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-[13px] leading-relaxed">
                    {analysis.whatBroke}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                key={analysis.id + "_why"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.02] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2">
                  <span className="material-icons-round text-yellow-500 text-sm">psychology</span>
                  <h4 className="font-mono text-[11px] font-black text-yellow-400 uppercase tracking-widest">Why It Happened</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-[13px] leading-relaxed">
                    {analysis.whyHappened}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                key={analysis.id + "_fix"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-primary/[0.02] overflow-hidden shadow-2xl shadow-black/40"
              >
                <div className="px-5 py-3 border-b border-primary/20 bg-primary/5 flex items-center gap-3">
                  <span className="material-icons-round text-primary text-sm">auto_fix_high</span>
                  <h4 className="font-mono text-[11px] font-black text-primary uppercase tracking-widest">Resolution Steps</h4>
                </div>
                <div className="p-6 space-y-8">
                  <div className="grid gap-4">
                    {analysis.fixSteps.map((step: any) => (
                      <div key={step.id} className="flex items-start gap-4">
                        <span className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">{step.id}</span>
                        <p className="text-slate-300 text-[13px] leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-black border border-white/10 overflow-hidden font-mono">
                    <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Patched Implementation</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(analysis.codePatch.code)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <span className="material-icons-round text-sm">content_copy</span>
                      </button>
                    </div>
                    <pre className="p-6 text-xs text-slate-400 leading-relaxed overflow-x-auto">
                      <span className="token-comment">{analysis.codePatch.comment}</span>&#10;&#10;
                      {analysis.codePatch.code.split('\n').map((line: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-slate-700 w-4 text-right select-none">{i+1}</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                key={analysis.id + "_prevention"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden opacity-80"
              >
                <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                  <span className="material-icons-round text-slate-400 text-sm">shield</span>
                  <h4 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">Future Prevention</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-[12px] leading-relaxed italic">
                    "{analysis.prevention}"
                  </p>
                </div>
              </motion.div>

              {/* Iterative Debugging Chat */}
              <ChatInterface 
                analysisId={id}
                initialMessages={analysis.messages}
                errorContext={analysis.originalError}
                onNewAnalysis={(refined) => setAnalysis(prev => ({ ...prev, ...refined }))}
              />
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
