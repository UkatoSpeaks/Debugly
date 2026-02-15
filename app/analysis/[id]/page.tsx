"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock database for the single analysis view
const ANALYSIS_DB: Record<string, any> = {
  "hist_1": {
    title: "Uncaught TypeError: map of undefined",
    framework: "React",
    timestamp: "2024-02-15 14:22",
    originalError: "Uncaught TypeError: Cannot read properties of undefined (reading 'map')\n    at renderDashboard (main.js:142:24)\n    at async initApp (main.js:12:1)",
    whatBroke: "A critical TypeError was triggered at runtime. Your application attempted to invoke the .map() prototype on a variable that returned undefined.",
    whyHappened: "The asynchronous data fetch in your fetchUsers() method is returning an empty response because the Authorization header is missing from the request lifecycle.",
    fixSteps: [
      { id: "01", text: "Initialize your state with an empty array [] to prevent initial null-pointer mapping." },
      { id: "02", text: "Implement Optional Chaining to safeguard against unexpected API structures." }
    ],
    codePatch: {
      comment: "// Proposed Fix",
      code: "const users = data?.map(u => u.id) || [];\n\n// Adding validation guard\nif (!users.length) return <EmptyState />;"
    },
    prevention: "Enable strict null checks in your tsconfig.json to catch these inconsistencies during synthesis rather than at runtime."
  },
  "hist_2": {
    title: "Segmentation fault: pointer dereference",
    framework: "Kernel",
    timestamp: "2024-02-14 09:15",
    originalError: "kernel: [ 124.5218] segfault at 0 ip 00007f3a2b7f sp 00007ffe34\nkernel: error 4 in libc-2.31.so[7f3a2b6e+178000]",
    whatBroke: "Direct null pointer dereference in the memory allocator. The kernel attempted to read address 0x0 resulting in immediate process termination.",
    whyHappened: "A boundary condition in the slab allocator was met where the buffer pointer was not validated after an OOM (Out Of Memory) event during high-pressure IO.",
    fixSteps: [
      { id: "01", text: "Add mandatory null-pointer verification post-allocation." },
      { id: "02", text: "Implement a fallback allocation strategy for low-memory environments." }
    ],
    codePatch: {
      comment: "// Kernel space patch",
      code: "void *ptr = kmalloc(size, GFP_KERNEL);\nif (unlikely(!ptr)) {\n    pr_err(\"Allocator failure: OOM\\n\");\n    return -ENOMEM;\n}"
    },
    prevention: "Always use the 'unlikely()' macro for memory allocation checks to hint the branch predictor in performance-critical paths."
  }
};

export default function SingleAnalysisPage() {
  const params = useParams();
  const id = params?.id as string;
  const analysis = ANALYSIS_DB[id] || ANALYSIS_DB["hist_1"]; // Fallback to first item if not found

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      {/* Navbar */}
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

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: The "Case" file (Original Error) */}
        <section className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-background">
          <div className="h-10 border-b border-white/5 flex items-center px-4 bg-muted/20">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Incident Record</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Logged At</h4>
                <p className="text-sm font-mono text-slate-500">{analysis.timestamp}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Raw Error Buffer</h4>
                <div className="rounded-lg bg-black p-5 border border-white/5 font-mono text-xs text-red-400/80 leading-relaxed whitespace-pre-wrap">
                  {analysis.originalError}
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mb-2 uppercase">
                  <span>Session ID</span>
                  <span className="text-slate-400">#8F-2A-{id.split('_')[1]}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 uppercase">
                  <span>Reasoning Model</span>
                  <span className="text-slate-400">v4.2-Stable</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: The AI Fix (Reuse components from home) */}
        <section className="flex-1 flex flex-col bg-[#0d1117] relative overflow-y-auto custom-scrollbar">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-50"></div>
          
          <div className="p-8 lg:p-12 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              {/* Card: What Broke */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2">
                  <span className="material-icons-round text-red-500 text-sm">warning</span>
                  <h4 className="font-mono text-[11px] font-black text-red-400 uppercase tracking-widest">What Broke</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-[13px] leading-relaxed">
                    {analysis.whatBroke}
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
                  <p className="text-slate-300 text-[13px] leading-relaxed">
                    {analysis.whyHappened}
                  </p>
                </div>
              </div>

              {/* Card: The Fix & Code */}
              <div className="rounded-xl border border-primary/20 bg-primary/[0.02] overflow-hidden shadow-2xl shadow-black/40">
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
                      <button className="text-slate-500 hover:text-white transition-colors">
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
              </div>

              {/* Card: Prevention Tip */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden opacity-80">
                <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                  <span className="material-icons-round text-slate-400 text-sm">shield</span>
                  <h4 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">Future Prevention</h4>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-[12px] leading-relaxed italic">
                    "{analysis.prevention}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
