"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const historySessions = [
  {
    status: "resolved",
    error: "Uncaught TypeError: Cannot read property 'map'",
    description: "React component render failure in DashboardList.tsx",
    language: "TypeScript",
    languageColor: "bg-blue-400",
    origin: "frontend-core",
    originIcon: "folder_open",
    date: "2h ago",
  },
  {
    status: "refined",
    error: "KeyError: 'user_id' not found in session_data",
    description: "Backend authentication middleware exception",
    language: "Python",
    languageColor: "bg-yellow-400",
    origin: "auth-service",
    originIcon: "dns",
    date: "5h ago",
  },
  {
    status: "pending",
    error: "RuntimeError: maximum recursion depth exceeded",
    description: "Complex recursive tree parsing function",
    language: "Python",
    languageColor: "bg-yellow-400",
    origin: "algo-lib",
    originIcon: "functions",
    date: "Yesterday",
  },
  {
    status: "resolved",
    error: "ActiveRecord::StatementInvalid: PG::UndefinedTable",
    description: "Migration sync issue in staging environment",
    language: "Ruby",
    languageColor: "bg-red-400",
    origin: "legacy-api",
    originIcon: "storage",
    date: "Yesterday",
  },
  {
    status: "failed",
    error: "NullPointerException: attempt to dereference a null object",
    description: "Android activity lifecycle crash",
    language: "Java",
    languageColor: "bg-orange-400",
    origin: "mobile-app",
    originIcon: "android",
    date: "Oct 24",
  },
  {
    status: "resolved",
    error: "panic: runtime error: index out of range [3] with length 3",
    description: "Go routine worker pool failure",
    language: "Go",
    languageColor: "bg-cyan-400",
    origin: "worker-service",
    originIcon: "cloud_queue",
    date: "Oct 23",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <span className="material-icons text-[#39e58c] text-lg">check_circle_outline</span>;
    case "refined":
      return <span className="material-icons text-yellow-500 text-lg">adjust</span>;
    case "pending":
      return <span className="material-icons text-slate-500 text-lg">hourglass_empty</span>;
    case "failed":
      return <span className="material-icons text-red-500 text-lg">error_outline</span>;
    default:
      return null;
  }
};

export default function HistoryDashboard() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Filters */}
      <aside className="w-64 border-r border-border bg-[#102222]/20 hidden md:flex flex-col overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Filters</h2>
            <button className="text-xs text-primary hover:text-primary/80 transition-colors">Reset</button>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Timeframe</h3>
            <div className="space-y-2">
              {["Last 7 Days", "Last 30 Days", "Custom Range"].map((option, i) => (
                <label key={option} className="flex items-center gap-3 p-2 rounded hover:bg-surface-dark cursor-pointer group transition-colors">
                  <input defaultChecked={i === 0} type="radio" name="timeframe" className="text-primary focus:ring-primary bg-transparent border-slate-500" />
                  <span className="text-sm group-hover:text-white transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Language</h3>
            <div className="space-y-1">
              {[
                { name: "Python", count: 14 },
                { name: "JavaScript", count: 32 },
                { name: "Go", count: 8 },
                { name: "Rust", count: 3 },
              ].map((lang) => (
                <label key={lang.name} className="flex items-center justify-between p-2 rounded hover:bg-surface-dark cursor-pointer group transition-colors">
                  <div className="flex items-center gap-3">
                    <input defaultChecked type="checkbox" className="rounded border-slate-600 text-primary focus:ring-primary focus:ring-offset-background bg-transparent" />
                    <span className="text-sm text-slate-300 group-hover:text-white">{lang.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-border px-1.5 py-0.5 rounded">{lang.count}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-border">
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <h4 className="text-primary text-sm font-semibold mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-slate-400 mb-3">Get unlimited history retention and team collaboration.</p>
            <button className="w-full bg-primary hover:bg-primary/90 text-background font-semibold text-xs py-2 rounded transition-colors">
              View Plans
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">History</h1>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">57 sessions</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-icons absolute left-3 top-2 text-muted-foreground text-sm">filter_list</span>
              <input 
                className="w-full bg-muted border border-transparent hover:border-slate-600 focus:border-primary focus:ring-0 rounded text-sm py-1.5 pl-9 pr-3 text-slate-300 transition-colors" 
                placeholder="Filter by message..." 
                type="text" 
              />
            </div>
            <button className="bg-primary hover:bg-primary/90 text-background font-semibold px-4 py-1.5 rounded text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
              <span className="material-icons text-sm">add</span> New Session
            </button>
          </div>
        </div>

        <div className="min-w-full">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <div className="col-span-6 md:col-span-5 flex items-center gap-2">
              Status / Error
              <span className="material-icons text-[14px] cursor-pointer hover:text-white">arrow_downward</span>
            </div>
            <div className="col-span-2 hidden md:block">Language</div>
            <div className="col-span-3 hidden md:block">Origin</div>
            <div className="col-span-2 md:col-span-2 text-right pr-8">Date</div>
          </div>

          <div className="divide-y divide-border">
            {historySessions.map((session, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-dark cursor-pointer transition-colors relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-primary transition-colors"></div>
                <div className="col-span-6 md:col-span-5 flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    {getStatusIcon(session.status)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-slate-200 truncate group-hover:text-primary transition-colors">{session.error}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{session.description}</div>
                  </div>
                </div>
                <div className="col-span-2 hidden md:flex items-center">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-opacity-10 border border-opacity-20 text-xs font-medium border-slate-500 text-slate-400`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${session.languageColor}`}></div>
                    {session.language}
                  </div>
                </div>
                <div className="col-span-3 hidden md:flex items-center gap-2 text-sm text-slate-400">
                  <span className="material-icons text-base opacity-50">{session.originIcon}</span>
                  {session.origin}
                </div>
                <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-4">
                  <span className="text-xs text-muted-foreground font-mono">{session.date}</span>
                  <button className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-icons text-lg">more_horiz</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Pagination */}
          <div className="p-6 flex items-center justify-between border-t border-border mt-4">
            <div className="text-xs text-muted-foreground">
              Showing <span className="text-slate-300">1</span> to <span className="text-slate-300">6</span> of <span className="text-slate-300">57</span> results
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-border text-sm text-muted-foreground hover:text-white hover:border-slate-500 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 rounded border border-border text-sm text-slate-300 hover:text-white hover:border-slate-500">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
