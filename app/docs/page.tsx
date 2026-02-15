"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DOCS_NAV = [
  { id: "intro", label: "Introduction", icon: "rocket_launch" },
  { id: "mechanics", label: "How it Works", icon: "settings_input_component" },
  { id: "stacks", label: "Supported Stacks", icon: "layers" },
  { id: "inputs", label: "Live Examples", icon: "terminal" },
  { id: "faq", label: "FAQ", icon: "help_center" }
];

const FAQS = [
  {
    q: "Is my code data stored in your training sets?",
    a: "Absolutely not. Debugly utilizes an ephemeral inference architecture. Your code and error traces are processed in-memory and never used to train our base models. Once the analysis is saved to your account, the source context is purged from our computational buffers."
  },
  {
    q: "How does Debugly differ from standard ChatGPT or Claude?",
    a: "While general LLMs are great for conversation, Debugly's reasoning core is specifically tuned for structural code analysis. It simulates execution paths and memory state to identify root causes that general models often miss, especially in complex hydration or pointer-based errors."
  },
  {
    q: "Does it work with proprietary or private libraries?",
    a: "Yes. By pasting the relevant context alongside the error, Debugly's contextual awareness logic builds a temporary mental model of your private architecture, allowing it to provide specific fixes without needing full repository access."
  },
  {
    q: "What platforms and languages are supported?",
    a: "We provide tier-1 support for the modern web stack (React, Next.js, Node, TypeScript), systems languages (Rust, C++, Zig, Go), and mobile (Swift, Kotlin). Our legacy engine also handles enterprise stacks like Java/Spring and PHP."
  },
  {
    q: "Can I export analysis reports for my team?",
    a: "Yes. Every analysis in your History has a unique, shareable URI. You can also export the 'Resolution Steps' as a markdown file to be attached to Jira tickets or GitHub Issues."
  },
  {
    q: "What if the AI provides an incorrect fix?",
    a: "While our accuracy is exceeding 94% on standard traces, some edge cases may vary. You can use the 'Regenerate' feature to adjust the context window or provide more specific code snippets to refine the reasoning."
  },
  {
    q: "Can I use Debugly offline?",
    a: "No. Debugly requires a secure connection to our high-performance reasoning engine (Llama 3.1) to process complex logic. This ensures you always get the latest security and architectural patterns without local resource strain."
  },
  {
    q: "How should I handle minified or obfuscated production logs?",
    a: "For the best results with production logs, providing the original un-minified code snippet where the error occurred is recommended. If you have sourcemaps, you can use them to identify the original file and line number before pasting the trace."
  },
  {
    q: "Does Debugly support multi-file error analysis?",
    a: "Yes. To analyze issues that span multiple files (like an interface mismatch), simply paste the relevant code blocks from both files into the input buffer. Our context window is large enough to build a relational map between them."
  },
  {
    q: "Is there a VS Code extension or CLI available?",
    a: "We are currently in the beta phase for our VS Code extension and command-line interface. These tools will allow you to stream terminal errors directly to Debugly without leaving your IDE. Stay tuned for version 5.0."
  },
  {
    q: "Is there a limit to how many errors I can analyze per day?",
    a: "Our standard plan operates on a fair-use policy designed for individual developers. High-volume enterprise users requiring hundreds of analyses per hour can contact our infrastructure team for dedicated node allocation."
  },
  {
    q: "How can I collaborate with my team on an analysis?",
    a: "You can share the unique URL of any analysis from your history. In the upcoming release, we'll support 'Shared Workspace' folders where teams can collectively tag and resolve common repository regressions."
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const router = useRouter();

  const handleCopyExample = (text: string) => {
    localStorage.setItem("debugly_test_trigger", text);
    router.push("/");
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return FAQS;
    return FAQS.filter(faq => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // 1. Check FAQs first (expand if match)
      const faqIndex = FAQS.findIndex(f => f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query));
      if (faqIndex !== -1) {
        setExpandedFaq(faqIndex);
        setActiveSection("faq");
        document.getElementById("faq")?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // 2. Check for specific keywords to navigate to sections
      if (query.includes("hydration") || query.includes("example") || query.includes("input")) {
        setActiveSection("inputs");
        document.getElementById("inputs")?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (query.includes("stack") || query.includes("react") || query.includes("rust")) {
        setActiveSection("stacks");
        document.getElementById("stacks")?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (query.includes("work") || query.includes("logic") || query.includes("reasoning")) {
        setActiveSection("mechanics");
        document.getElementById("mechanics")?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // 3. Fallback: Search for any text content in DOM
      // This is a simple heuristic for modern docs
      const sections = ["intro", "mechanics", "stacks", "inputs", "faq"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el?.textContent?.toLowerCase().includes(query)) {
          setActiveSection(id);
          el.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      {/* Navbar */}
      <nav className="h-14 border-b border-border flex items-center justify-between px-6 bg-background z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:text-black transition-all">
              <span className="material-icons-round text-primary group-hover:text-black text-[20px]">bug_report</span>
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap text-white">Debugly</span>
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
          <div className="relative group hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs font-mono focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all w-64"
            />
          </div>
          <Link href="/" className="bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-primary hover:text-black transition-all">
            Back to App
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-border bg-background overflow-y-auto hidden lg:block custom-scrollbar">
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

            <div className="mt-12 p-4 rounded-xl border border-primary/10 bg-primary/[0.02]">
              <p className="text-[9px] font-mono text-primary uppercase tracking-widest mb-2 font-black">Pro Tip</p>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">You can click on any code example to automatically launch it in the analyzer.</p>
            </div>
          </div>
        </aside>

        {/* Docs Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B0F14]/30 scroll-smooth">
          <div className="max-w-4xl mx-auto px-8 py-16 space-y-24 pb-32">
            
            {/* Introduction */}
            <motion.section 
              id="intro" 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-20"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest mb-6">
                v4.3 live
              </div>
              <h1 className="text-5xl font-bold tracking-tighter text-white mb-6 leading-tight">The Autonomous <br/><span className="text-primary">Debugging Engine.</span></h1>
              <p className="text-lg text-slate-400 leading-relaxed font-light max-w-2xl italic">
                Debugly is a cross-stack diagnostic tool that utilizes deep-reasoning neural models to identify, explain, and resolve technical regressions in mission-critical software.
              </p>
            </motion.section>

            {/* Mechanics */}
            <motion.section 
              id="mechanics" 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-20"
            >
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">settings_input_component</span>
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-xl border border-white/5 bg-[#0B0F14] hover:border-primary/20 transition-all group">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center mb-6 text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-icons-round">analytics</span>
                  </div>
                  <h4 className="text-white font-bold mb-3">Trace Analysis</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Debugly parses raw terminal buffers to extract exit codes, stack references, and memory pointer leaks across 20+ low-level languages.
                  </p>
                </div>
                <div className="p-8 rounded-xl border border-white/5 bg-[#0B0F14] hover:border-primary/20 transition-all group">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center mb-6 text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-icons-round">psychology</span>
                  </div>
                  <h4 className="text-white font-bold mb-3">Deep Reasoning</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Unlike standard LLMs, our reasoning core simulates execution paths to confirm root causes before proposing patches.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Supported Stacks */}
            <motion.section 
              id="stacks" 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-20"
            >
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">layers</span>
                Supported Stacks
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  "React / Next.js", "Rust / WASM", "C / C++ Kernel", "Python / FastAPI", 
                  "Go / Microservices", "TypeScript / Node", "Zig", "Swift / iOS", "Ruby on Rails", "Java / Spring"
                ].map((name, i) => (
                  <div key={i} className="px-5 py-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-default">
                    <span className="text-[11px] font-mono text-slate-400">{name}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Live Examples */}
            <motion.section 
              id="inputs" 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-20"
            >
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">terminal</span>
                Live Input Examples
              </h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Recommended: Clean Stack Trace",
                    label: "JAVASCRIPT / REACT",
                    trace: "Uncaught TypeError: Cannot read properties of undefined (reading 'map')\nat Dashboard.tsx:42:15\nat renderApp (index.tsx:12:1)",
                    color: "text-emerald-500/80"
                  },
                  {
                    title: "Next.js Hydration Mismatch",
                    label: "NEXT.JS / SSR",
                    trace: "Error: Hydration failed because the initial UI does not match what was rendered on the server.\nWarning: Expected server HTML to contain a matching <p> in <div>.",
                    color: "text-slate-400"
                  },
                  {
                    title: "React Hook Invariant",
                    label: "REACT / HOOKS",
                    trace: "Error: Rendered more hooks than during the previous render.\nat HomePage (app/page.tsx:28:11)\nat div\nat App (app/layout.tsx:15:20)",
                    color: "text-blue-400/80"
                  },
                  {
                    title: "Database Connection Failure",
                    label: "NODE.JS / BACKEND",
                    trace: "Error: connect ECONNREFUSED 127.0.0.1:5432\nat TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16)\nat Protocol._enqueue (node_modules/pg/lib/protocol.js:144:48)",
                    color: "text-orange-400/80"
                  },
                  {
                    title: "Python Dictionary Access",
                    label: "PYTHON / DJANGO",
                    trace: "Traceback (most recent call last):\n  File \"views.py\", line 45, in get_context\n    user_profile = data['profile']\nKeyError: 'profile'",
                    color: "text-yellow-400/80"
                  }
                ].map((ex, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCopyExample(ex.trace)}
                        className="bg-primary text-black font-mono font-black text-[9px] uppercase px-3 py-1.5 rounded shadow-glow active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span className="material-icons-round text-xs">bolt</span>
                        Inject into Analyzer
                      </button>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black overflow-hidden font-mono group-hover:border-primary/30 transition-colors">
                      <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-bold flex items-center justify-between">
                        <span>{ex.title}</span>
                        <span className="opacity-40">{ex.label}</span>
                      </div>
                      <pre className={`p-6 text-xs ${ex.color} leading-relaxed overflow-x-auto whitespace-pre-wrap`}>
                        {ex.trace}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* FAQ Accordion */}
            <motion.section 
              id="faq" 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-20 pb-20"
            >
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-primary text-base material-icons-round">help_center</span>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {filteredFaqs.map((faq, i) => (
                  <div 
                    key={i}
                    className={`rounded-xl border transition-all duration-300 ${
                      expandedFaq === i 
                      ? "border-primary/30 bg-primary/[0.03]" 
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <button 
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="text-sm font-bold text-white">{faq.q}</span>
                      <span className={`material-icons-round transition-transform duration-300 ${
                        expandedFaq === i ? "rotate-180 text-primary" : "text-slate-600"
                      }`}>expand_more</span>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-white/5 pt-4">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

          </div>
        </div>
      </main>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
