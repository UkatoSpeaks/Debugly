"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { saveAnalysis } from "@/lib/analysisService";
import { analyzeError } from "@/lib/ai/provider";

export default function LandingPage() {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorInput, setErrorInput] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!errorInput.trim()) return;
    setIsAnalyzing(true);
    setShowAnalysis(false);
    setAnalysisError(null);
    
    try {
      const result = await analyzeError(errorInput);
      setCurrentAnalysis(result);
      setIsAnalyzing(false);
      setShowAnalysis(true);

      // Save to Firebase if user is logged in
      if (user) {
        setIsSaving(true);
        try {
          await saveAnalysis({
            ...result,
            userId: user.uid,
          });
        } catch (err) {
          console.error("Auto-save failed:", err);
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError("Neural processing failed. Please check your connection or try a different error trace.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      {/* Navbar - Signature Debugly Style */}
      <nav className="h-14 border-b border-border flex items-center justify-between px-6 bg-background z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:text-black transition-all">
              <span className="material-icons-round text-primary group-hover:text-black text-[20px]">bug_report</span>
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Debugly</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
            <Link href="/history" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              History
            </Link>
            <Link href="/docs" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/settings" className="w-8 h-8 rounded border border-primary/40 bg-primary/20 flex items-center justify-center text-[10px] font-mono text-primary hover:bg-primary hover:text-black transition-all shadow-glow">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </Link>
              <button 
                onClick={logout}
                className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={loginWithGoogle}
                className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Login
              </button>
              <button 
                onClick={loginWithGoogle}
                className="bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded text-[11px] font-mono uppercase tracking-widest font-bold hover:bg-primary hover:text-black transition-all shadow-glow hover:shadow-primary/40"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Product Interface */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: Input Section */}
        <section className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-border bg-background relative z-10 transition-all duration-500">
          {/* Panel Header */}
          <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Input Debug Buffer</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 active-pulse"></span>
                Autodetect: ON
              </span>
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 flex flex-col bg-[#0B0F14] relative group">
            {/* Line Numbers Decor */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-black/20 border-r border-white/5 pt-4 pr-3 text-right select-none pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-700 leading-6">{i + 1}</div>
              ))}
            </div>

            {/* Terminal Textarea */}
            <textarea 
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
              className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-300 pl-16 pt-4 leading-6 font-mono text-sm placeholder-slate-700 outline-none resize-none custom-scrollbar"
              placeholder="// Paste your stack trace, log file, or raw error here...&#10;&#10;Uncaught TypeError: Cannot read properties of undefined (reading 'map')&#10;    at renderDashboard (main.js:142:24)&#10;    at async initApp (main.js:12:1)"
              spellCheck="false"
            ></textarea>

            {/* Input Overlay Actions */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
               <button className="p-2 rounded bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-colors" title="Upload Log File">
                 <span className="material-icons-round text-sm">upload_file</span>
               </button>
               <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !errorInput.trim()}
                className="bg-primary hover:bg-white text-black font-mono font-black text-xs uppercase tracking-[0.2em] py-3 px-8 rounded shadow-glow disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2 group active:scale-95"
               >
                 {isAnalyzing ? (
                   <span className="material-icons-round text-sm animate-spin">sync</span>
                 ) : (
                   <span className="material-icons-round text-sm group-hover:rotate-12 transition-transform">bolt</span>
                 )}
                 {isAnalyzing ? "Processing..." : "Analyze Context"}
               </button>
            </div>
          </div>
        </section>

        {/* Right Panel: AI Analysis Output Section */}
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
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl mx-auto space-y-6"
                >
                  {/* Card: What Broke */}
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] overflow-hidden">
                    <div className="px-5 py-3 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2">
                      <span className="material-icons-round text-red-500 text-sm">warning</span>
                      <h4 className="font-mono text-[11px] font-black text-red-400 uppercase tracking-widest">What Broke</h4>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {currentAnalysis.whatBroke}
                      </p>
                    </div>
                  </div>

                  {/* Card: Why Happened */}
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.02] overflow-hidden">
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
                  </div>

                  {/* Card: The Fix & Code */}
                  <div className="rounded-xl border border-primary/20 bg-primary/[0.02] overflow-hidden shadow-2xl shadow-black/40">
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
                            onClick={() => navigator.clipboard.writeText(currentAnalysis.codePatch?.code || "")}
                            className="text-slate-500 hover:text-white transition-colors" 
                            title="Copy Patch"
                          >
                            <span className="material-icons-round text-sm">content_copy</span>
                          </button>
                        </div>
                        <pre className="p-5 text-xs text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          <span className="token-comment">{currentAnalysis.codePatch?.comment}</span>&#10;
                          {currentAnalysis.codePatch?.code}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Card: Prevention Tip */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                      <span className="material-icons-round text-slate-400 text-sm">shield</span>
                      <h4 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">Prevention Tip</h4>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-500 text-[12px] leading-relaxed italic">
                        "{currentAnalysis.prevention}"
                      </p>
                    </div>
                  </div>

                  {/* Analysis Error Message */}
                  {analysisError && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono text-center">
                      {analysisError}
                    </div>
                  )}

                  {/* Footnote */}
                  <div className="text-center pt-10 opacity-30">
                    <p className="text-[9px] font-mono uppercase tracking-[0.3em]">Analysis complete • Model-Hash #llama-3.1-8b</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Global Background Grid Overlays */}
      <div className="fixed inset-0 pointer-events-none opacity-20 pointer-events-none z-[-1] bg-grid"></div>
    </div>
  );
}
