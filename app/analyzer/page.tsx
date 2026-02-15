"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AnalyzerPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Navbar */}
      <nav className="h-16 border-b border-border flex items-center justify-between px-6 bg-background z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all duration-300">
              <span className="material-icons text-[20px]">bug_report</span>
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Debugly</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/analyzer" className="text-primary">Analyze</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">History</Link>
            <Link href="/reasoning" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <span className="material-icons">help_outline</span>
          </button>
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-2.132 1.055-2.954-.106-.253-.455-1.398.1-2.916 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.558 1.518.206 2.663.1 2.916.669.822 1.055 1.861 1.055 2.954 0 3.847-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd" />
            </svg>
            Sign in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Input */}
        <section className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-border bg-background">
          <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/50 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="ml-3 text-xs font-mono text-muted-foreground uppercase">console.log</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground uppercase">JavaScript / TypeScript</span>
            </div>
          </div>
          <div className="flex-1 relative group font-mono text-sm overflow-hidden bg-background">
            {/* Line Numbers Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r border-border text-muted-foreground text-right pt-4 pr-3 select-none z-10 font-mono text-xs leading-6">
              {[...Array(15)].map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Editor Input */}
            <textarea 
              className="w-full h-full resize-none bg-transparent border-none focus:ring-0 text-foreground pl-16 pt-4 leading-6 placeholder-muted-foreground outline-none" 
              placeholder="// Paste your error, stack trace, or buggy code here...&#10;&#10;TypeError: Cannot read properties of undefined (reading 'map')&#10;    at renderList (App.js:24:15)&#10;    at Component (App.js:12:5)"
              spellCheck="false"
            ></textarea>
          </div>
          {/* Action Bar */}
          <div className="h-20 border-t border-border flex items-center justify-between px-6 bg-background">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="material-icons text-sm">info</span>
              <span>Supports stack traces & snippets</span>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-primary hover:bg-primary/90 text-background font-bold py-2.5 px-6 rounded-lg shadow-[0_0_15px_-3px_rgba(13,242,242,0.2)] flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              <span className={`material-icons text-sm ${isAnalyzing ? "animate-spin" : ""}`}>
                {isAnalyzing ? "sync" : "auto_fix_high"}
              </span>
              {isAnalyzing ? "Analyzing..." : "Analyze & Fix"}
            </button>
          </div>
        </section>

        {/* Right Panel: Output */}
        <section className="flex-1 flex flex-col min-w-0 bg-muted/30 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-icons text-primary text-xl">analytics</span>
                Analysis Report
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                AI Confidence: 98%
              </span>
            </div>

            <div className="grid gap-6">
              {/* Card 1: What Broke */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background rounded-xl border border-red-900/30 overflow-hidden shadow-sm"
              >
                <div className="px-5 py-3 border-b border-red-900/30 bg-red-900/10 flex items-center gap-2">
                  <span className="material-icons text-red-500 text-sm">error_outline</span>
                  <h3 className="font-semibold text-red-400 text-sm uppercase tracking-wide">What Broke</h3>
                </div>
                <div className="p-5">
                  <p className="text-slate-300 leading-relaxed text-sm">
                    A <code className="bg-red-900/20 px-1.5 py-0.5 rounded text-red-300 font-mono text-xs">TypeError</code> occurred because the application attempted to access the <code>.map()</code> method on an <code>undefined</code> variable named <code className="font-mono text-primary text-xs">userList</code>.
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Root Cause */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-background rounded-xl border border-yellow-900/30 overflow-hidden shadow-sm"
              >
                <div className="px-5 py-3 border-b border-yellow-900/30 bg-yellow-900/10 flex items-center gap-2 text-sm">
                  <span className="material-icons text-yellow-500 text-sm">psychology</span>
                  <h3 className="font-semibold text-yellow-400 text-xs uppercase tracking-wide">Root Cause</h3>
                </div>
                <div className="p-5">
                  <p className="text-slate-300 leading-relaxed mb-3 text-sm">
                    The API response for the users list is asynchronous. The component tried to render and map over <code>userList</code> before the data fetch was complete, resulting in the variable being <code>undefined</code> during the initial render cycle.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-yellow-900/20 text-yellow-300 text-xs rounded border border-yellow-900/30 text-xs">Race Condition</span>
                    <span className="px-2 py-1 bg-yellow-900/20 text-yellow-300 text-xs rounded border border-yellow-900/30 text-xs text-sm">Async/Await</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Fix */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-background rounded-xl border border-primary/20 overflow-hidden shadow-sm"
              >
                <div className="px-5 py-3 border-b border-primary/10 bg-primary/5 flex items-center gap-2">
                  <span className="material-icons text-primary text-sm">fact_check</span>
                  <h3 className="font-semibold text-primary text-sm uppercase tracking-wide">Recommended Fix</h3>
                </div>
                <div className="p-5 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span className="text-slate-300 text-sm">Initialize <code className="font-mono text-xs text-primary/80">userList</code> as an empty array instead of null/undefined.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span className="text-slate-300 text-sm">Alternatively, add optional chaining <code className="font-mono text-xs text-primary/80">?.</code> before the map function.</span>
                    </li>
                  </ul>
                  
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-muted flex items-center justify-between border-b border-border">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Patched Code</span>
                      <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                        <span className="material-icons text-sm">content_copy</span>
                        Copy
                      </button>
                    </div>
                    <pre className="font-mono text-xs p-4 bg-[#0B1414] overflow-x-auto text-slate-300 leading-relaxed">
                      <span className="text-purple-400">const</span> <span className="text-blue-400">UserList</span> = ({ "{" } <span className="text-orange-300">users</span> { "}" }) =&gt; {"{"}&#10;{"  "}<span className="text-slate-500">// FIX: Add optional chaining or default value</span>&#10;{"  "}<span className="text-purple-400">if</span> (!<span className="text-orange-300">users</span>) <span className="text-purple-400">return</span> <span className="text-green-400">&lt;div&gt;</span>Loading...<span className="text-green-400">&lt;/div&gt;</span>;&#10;&#10;{"  "}<span className="text-purple-400">return</span> (&#10;{"    "}<span className="text-green-400">&lt;ul&gt;</span>&#10;{"      "}{"{"}<span className="text-orange-300">users</span><span className="text-primary font-bold">?.</span><span className="text-blue-300">map</span>(<span className="text-orange-300">user</span> =&gt; (&#10;{"        "}<span className="text-green-400">&lt;li</span> <span className="text-purple-300">key</span>={"{"}<span className="text-orange-300">user</span>.id{"}"}<span className="text-green-400">&gt;</span>&#10;{"          "}{"{"}<span className="text-orange-300">user</span>.name{"}"}&#10;{"        "}<span className="text-green-400">&lt;/li&gt;</span>&#10;{"      "})){"}"}&#10;{"    "}<span className="text-green-400">&lt;/ul&gt;</span>&#10;{"  "});&#10;{"}"};
                    </pre>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
