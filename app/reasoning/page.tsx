"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ReasoningPage() {
  const steps = [
    { title: "Analyzing stack trace", desc: "Extracted error type and location from raw logs.", time: "420ms", completed: true },
    { title: "Scanning dependency tree", desc: "Parsed 452 packages. No known vulnerabilities found in 'auth.js' context.", time: "1.2s", completed: true },
    { title: "IDENTIFYING ROOT CAUSE", desc: "Tracing variable state at auth.js:12...", active: true },
    { title: "Synthesizing Fix", desc: "Drafting patched code snippet...", pending: true },
    { title: "Final Verification", pending: true },
  ];

  return (
    <div className="flex flex-col h-screen bg-grid-pattern text-slate-300 overflow-hidden font-sans selection:bg-primary/30 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-border bg-[#0B0F14]/90 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary/20 rounded flex-shrink-0 flex items-center justify-center border border-primary/40 group-hover:bg-primary transition-all">
              <span className="material-icons text-primary text-[20px] group-hover:text-background">bug_report</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">Debugly <span className="text-xs font-normal text-slate-500 ml-1 font-mono">v2.4.0-beta</span></h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Processing Request #882-XJ
          </div>
          <div className="h-8 w-[1px] bg-border"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-border bg-muted flex items-center justify-center text-xs font-mono">DU</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Input Context */}
        <section className="flex-1 lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-background/50 backdrop-blur-sm">
          <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-[#0e1217]">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="material-icons text-[14px] text-slate-500 text-sm">terminal</span>
              <span>console_output.log</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors">
                <span className="material-icons text-[16px] text-sm">content_copy</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed bg-[#0B0F14]">
            <div className="flex">
              <div className="flex flex-col text-right pr-4 select-none text-slate-700 border-r border-slate-800 mr-4">
                {[...Array(16)].map((_, i) => <span key={i}>{i + 1}</span>)}
              </div>
              <div className="flex-1 whitespace-pre-wrap break-all text-sm">
                <span className="token-comment">// Server Initialization Sequence</span>&#10;
                <span className="text-white">INFO: Starting worker process...</span>&#10;
                <span className="text-white">INFO: Connected to Redis @ 127.0.0.1:6379</span>&#10;
                <span className="text-white font-serif">WARN: Deprecated API usage in middleware/logger.js</span>&#10;
                <span className="text-white">INFO: Database connection established (32ms)</span>&#10;
                <span className="token-error font-bold text-red-500">[ERROR] 14:02:32 Critical Exception in module: auth.js</span>&#10;
                <span className="text-red-400">TypeError: Cannot read properties of undefined (reading 'token')</span>&#10;
                <span className="token-comment">at verifyUser</span> (<span className="text-blue-400">/src/lib/auth.js:12:34</span>)&#10;
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="token-comment">at async handleRequest</span> (<span className="text-blue-400">/src/routes/api.js:45:12</span>)&#10;&#10;
                <span className="text-orange-400">req.headers:</span> {"{"}&#10;
                &nbsp;&nbsp;<span className="text-green-400">"content-type"</span>: <span className="text-green-400">"application/json"</span>,&#10;
                &nbsp;&nbsp;<span className="text-green-400">"authorization"</span>: <span className="token-comment">undefined</span>&#10;
                {"}"}&#10;
                <span className="bg-red-500/10 text-red-400 block border-l-2 border-red-500 pl-2 mt-2 py-1">Process exited with code 1</span>
              </div>
            </div>
          </div>

          <div className="h-8 border-t border-border bg-[#0e1217] flex items-center px-4 gap-4 text-xs font-mono text-slate-500">
            <span>Ln 12, Col 34</span><span>UTF-8</span><span>JavaScript</span>
          </div>
        </section>

        {/* Right Panel: AI Reasoning Engine */}
        <section className="flex-1 lg:w-1/2 flex flex-col bg-background/30 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                <div className="relative w-3 h-3 bg-primary rounded-full"></div>
              </div>
              <h2 className="text-white text-xl font-bold tracking-tight font-display">AI Analysis in Progress</h2>
            </div>
            <p className="text-slate-500 text-xs ml-6 font-mono">Model: Debugly-Code-L v4.2 • Est. time: ~4s</p>
          </div>

          <div className="flex-1 overflow-auto px-8 py-4">
            <div className="relative border-l border-slate-800 ml-3 space-y-8 pb-12">
              {steps.map((step, idx) => (
                <div key={idx} className={`relative pl-8 group ${step.pending ? "opacity-50" : ""}`}>
                  {step.completed && (
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background/50 shadow-[0_0_10px_rgba(13,242,89,0.5)]"></div>
                  )}
                  {step.active && (
                    <>
                      <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full bg-primary/20 animate-ping"></div>
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/30 z-10"></div>
                    </>
                  )}
                  {step.pending && (
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-background"></div>
                  )}

                  <div className="flex flex-col gap-1">
                    <h3 className={`font-mono text-sm font-medium ${step.active ? "text-primary" : "text-slate-300"}`}>
                      {step.completed && <span className="text-primary font-bold mr-2">✓</span>}
                      {step.title}
                      {step.time && <span className="text-xs text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded ml-2">{step.time}</span>}
                    </h3>
                    
                    {step.active ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-surface-dark border border-primary/30 rounded-lg p-5 shadow-[0_0_30px_-5px_rgba(13,242,89,0.15)] mt-2"
                      >
                         <div className="space-y-3 font-mono text-sm">
                          <p className="text-white">Tracing variable state at <span className="text-primary bg-primary/10 px-1 rounded">auth.js:12</span>...</p>
                          <div className="pl-3 border-l-2 border-slate-700 space-y-1 text-slate-400">
                            <p>&gt; Headers parsed successfully</p>
                            <p>&gt; Auth token extraction failed</p>
                            <p className="text-slate-200">&gt; Detected undefined &apos;authorization&apos; header pattern</p>
                          </div>
                          <p className="text-slate-300 mt-2">
                            Hypothesis: Client request is missing &apos;Bearer&apos; token format.
                            <span className="inline-block w-2 h-4 bg-primary align-middle ml-1 animate-pulse"></span>
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-slate-500 text-sm pl-0">{step.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-border bg-[#0B0F14]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="material-icons text-sm">shield</span>
                Debugly Secure Sandbox
              </div>
              <button className="bg-border text-slate-500 px-6 py-2.5 rounded font-mono text-sm font-medium flex items-center gap-2 cursor-not-allowed opacity-70" disabled>
                <span>View Solution</span>
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
