"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const DOCS_NAV = [
  { id: "intro", label: "Introduction", icon: "rocket_launch" },
  { id: "mechanics", label: "How it Works", icon: "settings_input_component" },
  { id: "stacks", label: "Supported Stacks", icon: "layers" },
  { id: "inputs", label: "Input Examples", icon: "terminal" },
  { id: "faq", label: "FAQ", icon: "help_center" }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("intro");

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      {/* Navbar */}
      <nav className="h-14 border-b border-border flex items-center justify-between px-6 bg-background z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:text-black transition-all">
              <span className="material-icons-round text-primary group-hover:text-black text-[20px]">bug_report</span>
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Debugly</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Analyzer
            </Link>
            <Link href="/history" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              History
            </Link>
            <Link href="/docs" className="text-primary flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-100 transition-opacity"></span>
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-primary hover:text-black transition-all">
            Back to App
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-border bg-background overflow-y-auto hidden lg:block">
          <div className="p-6">
            <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Documentation</h4>
            <nav className="space-y-1">
              {DOCS_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === item.id 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="material-icons-round text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Docs Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B0F14]/30">
          <div className="max-w-4xl mx-auto px-8 py-16 space-y-24 pb-32">
            
            {/* Introduction */}
            <section id="intro" className="scroll-mt-20">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest mb-6">
                v4.2 stable
              </div>
              <h1 className="text-5xl font-bold tracking-tighter text-white mb-6">The Autonomous Debugging Engine.</h1>
              <p className="text-lg text-slate-400 leading-relaxed font-light max-w-2xl">
                Debugly is a cross-stack diagnostic tool that utilizes deep-reasoning neural models to identify, explain, and resolve technical regressions in mission-critical software.
              </p>
            </section>

            {/* Mechanics */}
            <section id="mechanics" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">settings_input_component</span>
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl border border-white/5 bg-background shadow-glass">
                  <h4 className="text-white font-bold mb-3">Trace Analysis</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Debugly parses raw terminal buffers to extract exit codes, stack references, and memory pointer leaks across 20+ low-level languages.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-white/5 bg-background shadow-glass">
                  <h4 className="text-white font-bold mb-3">Deep Reasoning</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Unlike standard LLMs, our reasoning core simulates execution paths to confirm root causes before proposing patches.
                  </p>
                </div>
              </div>
            </section>

            {/* Supported Stacks */}
            <section id="stacks" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">layers</span>
                Supported Stacks
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { name: "React / Next.js", color: "blue" },
                  { name: "Rust / WASM", color: "orange" },
                  { name: "C / C++ Kernel", color: "slate" },
                  { name: "Python / FastAPI", color: "yellow" },
                  { name: "Go / Microservices", color: "cyan" },
                  { name: "TypeScript / Node", color: "blue" },
                  { name: "Zig", color: "orange" },
                  { name: "Zig", color: "orange" },
                  { name: "Swift / iOS", color: "red" }
                ].map((stack, i) => (
                  <div key={i} className="px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] text-center">
                    <span className="text-xs font-mono text-slate-400">{stack.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Best Inputs */}
            <section id="inputs" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">terminal</span>
                Best Input Examples
              </h2>
              <div className="space-y-6">
                <div className="rounded-xl border border-white/5 bg-black overflow-hidden font-mono">
                  <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[9px] uppercase tracking-widest text-slate-500">✅ Recommended: Full Stack Trace</div>
                  <pre className="p-5 text-xs text-emerald-500/80 leading-relaxed overflow-x-auto">
                    Uncaught TypeError: Cannot read properties of undefined (reading &apos;map&apos;)&#10;
                    at Dashboard.tsx:42:15&#10;
                    at Array.forEach (&lt;anonymous&gt;)&#10;
                    at renderApp (index.tsx:12:1)
                  </pre>
                </div>
                <div className="rounded-xl border border-white/5 bg-black overflow-hidden font-mono">
                  <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-bold">❌ Bad: Vague Description</div>
                  <pre className="p-5 text-xs text-red-500/80 leading-relaxed">
                    The app is crashing when I click the button. Please fix.
                  </pre>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20 pb-20">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">help_center</span>
                FAQ
              </h2>
              <div className="space-y-12">
                <div>
                  <h4 className="text-white font-bold mb-3">Is my code data stored?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    No. We utilize strictly ephemeral processing. Once the analysis is generated and stored in your account, the raw input is purged from our reasoning buffers.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-3">Does it work with private libraries?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    Yes. By providing the relevant code snippet along with the error, Debugly's contextual model understands internal architecture even without access to the full repository.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
