"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const HISTORY_DATA = [
  {
    id: "hist_1",
    title: "Uncaught TypeError: map of undefined",
    framework: "React",
    language: "JavaScript",
    date: "2024-02-15 14:22",
    status: "Resolved",
    severity: "Critical"
  },
  {
    id: "hist_2",
    title: "Segmentation fault: pointer dereference",
    framework: "Kernel",
    language: "C++",
    date: "2024-02-14 09:15",
    status: "Pinned",
    severity: "High"
  },
  {
    id: "hist_3",
    title: "RuntimeError: async loop closed",
    framework: "FastAPI",
    language: "Python",
    date: "2024-02-12 18:45",
    status: "Resolved",
    severity: "Medium"
  },
  {
    id: "hist_4",
    title: "Buffer overflow at 0x4A2B",
    framework: "Embedded",
    language: "Rust",
    date: "2024-02-10 11:30",
    status: "Resolved",
    severity: "High"
  },
  {
    id: "hist_5",
    title: "Hydration failed: mismatching HTML",
    framework: "Next.js",
    language: "TypeScript",
    date: "2024-02-08 16:20",
    status: "Resolved",
    severity: "Low"
  }
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredHistory = HISTORY_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.framework.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || item.framework === activeFilter;
    return matchesSearch && matchesFilter;
  });

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
            <Link href="/history" className="text-primary flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-100 transition-opacity"></span>
              History
            </Link>
            <Link href="/docs" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded border border-border bg-muted/50 flex items-center justify-center text-[10px] font-mono text-slate-500">
            DU
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-10 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 italic">Debug Archive</h1>
              <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
                Retrieve Fixes from <span className="text-primary italic">52</span> total sessions
              </p>
            </div>
            
            {/* Search Input Container */}
            <div className="relative w-full md:w-96">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-lg">search</span>
              <input 
                type="text" 
                placeholder="Search error signatures, tags, or frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "React", "Next.js", "FastAPI", "Kernel", "Embedded"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all border ${
                  activeFilter === filter 
                    ? "bg-primary/10 border-primary/50 text-primary shadow-glow shadow-primary/10" 
                    : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* History List Grid */}
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link href={`/analyzer?id=${item.id}`}>
                    <div className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-[#0B0F14] hover:bg-white/[0.02] hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-6 min-w-0">
                        {/* Status Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          item.status === 'Pinned' 
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' 
                          : 'bg-primary/10 border-primary/20 text-primary'
                        }`}>
                          <span className="material-icons-round text-xl">
                            {item.status === 'Pinned' ? 'push_pin' : 'task_alt'}
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="min-w-0">
                          <h3 className="text-white font-bold text-base tracking-tight mb-1 truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1 text-slate-400">
                              <span className="material-icons-round text-xs">category</span>
                              {item.framework}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-icons-round text-xs">history</span>
                              {item.date}
                            </span>
                            <span className={`flex items-center gap-1 ${
                              item.severity === 'Critical' ? 'text-red-500' : 
                              item.severity === 'High' ? 'text-orange-500' : 'text-slate-600'
                            }`}>
                              <span className="material-icons-round text-xs">priority_high</span>
                              {item.severity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Visual */}
                      <div className="flex items-center gap-4">
                        <span className="hidden md:block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Analysis
                        </span>
                        <div className="w-8 h-8 rounded border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-primary group-hover:border-primary/30 transition-all">
                          <span className="material-icons-round text-lg">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredHistory.length === 0 && (
              <div className="py-20 text-center opacity-30 select-none">
                <span className="material-icons-round text-5xl mb-4">search_off</span>
                <p className="font-mono text-xs uppercase tracking-widest">No matching sessions found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
