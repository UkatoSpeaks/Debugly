"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, addAnalysisMessage } from "@/lib/analysisService";

interface ChatInterfaceProps {
  analysisId: string;
  initialMessages?: ChatMessage[];
  onNewAnalysis: (newAnalysis: any) => void;
  errorContext: string;
}

export default function ChatInterface({ analysisId, initialMessages = [], onNewAnalysis, errorContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Omit<ChatMessage, "createdAt"> = {
      role: "user",
      content: input,
    };

    const newMessages = [...messages, { ...userMessage, createdAt: new Date() } as ChatMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Save user message to Firestore
      await addAnalysisMessage(analysisId, userMessage);

      // 2. Call AI for refinement
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: errorContext, 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })) 
        }),
      });

      if (!response.ok) throw new Error("AI refinement failed");

      const refinedAnalysis = await response.json();
      
      const assistantMessage: Omit<ChatMessage, "createdAt"> = {
        role: "assistant",
        content: "I've refined the resolution based on your input. See the updated steps and code patch above.",
      };

      // 3. Save assistant response to Firestore
      await addAnalysisMessage(analysisId, assistantMessage);

      setMessages(prev => [...prev, { ...assistantMessage, createdAt: new Date() } as ChatMessage]);
      onNewAnalysis(refinedAnalysis);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "An error occurred during neural refinement. Please retry.", 
        createdAt: new Date() 
      } as ChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 border-t border-white/5 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-2 h-2 rounded-full bg-primary shadow-glow"></span>
        <h4 className="font-mono text-[11px] font-black text-white uppercase tracking-[0.2em]">Neural Refinement Thread</h4>
      </div>

      <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden flex flex-col h-[400px]">
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
              <span className="material-icons-round text-4xl mb-3 text-primary">psychology</span>
              <p className="font-mono text-[10px] uppercase tracking-widest max-w-[200px] leading-relaxed">
                Ask a follow-up question to refine the fix
              </p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === "user" 
                  ? "bg-primary/10 border border-primary/20 text-primary-foreground" 
                  : "bg-white/5 border border-white/5 text-slate-300"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150"></span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
          <input 
            type="text" 
            placeholder="How do I implement this with Tailwind CSS?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-mono"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-lg bg-primary text-black flex items-center justify-center hover:shadow-glow active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            <span className="material-icons-round text-lg">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
