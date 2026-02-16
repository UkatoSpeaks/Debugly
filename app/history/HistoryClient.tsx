"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getUserAnalysesPaginated, deleteAnalysis, updateAnalysisStatus, AnalysisRecord } from "@/lib/analysisService";
import { QueryDocumentSnapshot } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import HistoryCard from "@/components/HistoryCard";

const PAGE_SIZE = 12;

export default function HistoryClient() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [historyData, setHistoryData] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      loadHistory();
    }
  }, [user, authLoading, activeFilter]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);
    try {
      const { data, lastVisible } = await getUserAnalysesPaginated(user.uid, PAGE_SIZE, null, activeFilter);
      setHistoryData(data);
      setLastVisibleDoc(lastVisible);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error: any) {
      console.error("Failed to load history:", error);
      setFetchError(error.message || "Archive decryption failed. Please check your neural link.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !user) return;
    
    setIsLoadingMore(true);
    try {
      const { data, lastVisible } = await getUserAnalysesPaginated(user.uid, PAGE_SIZE, lastVisibleDoc, activeFilter);
      setHistoryData(prev => [...prev, ...data]);
      setLastVisibleDoc(lastVisible);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteAnalysis(id);
      setHistoryData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = currentStatus === "Pinned" ? "Resolved" : "Pinned";
    try {
      await updateAnalysisStatus(id, newStatus);
      setHistoryData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const filteredHistory = historyData.filter(item => {
    return item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.framework.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      <Navbar />

      <main className="flex-1 overflow-y-auto px-6 py-10 relative">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 italic">Debug Archive</h1>
              <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
                Retrieve Fixes from <span className="text-primary italic">{historyData.length}</span> total sessions
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <button 
                onClick={loadHistory}
                className="bg-slate-900/50 border border-white/5 text-slate-400 px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round text-sm">sync</span>
                Sync Archive
              </button>
              <div className="relative w-full md:w-72">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Filter signatures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "React", "Next.js", "Node.js", "Python", "TypeScript", "Other"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-all ${
                  activeFilter === filter 
                  ? "bg-primary border-primary text-black font-bold shadow-glow" 
                  : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center gap-6">
               <div className="w-12 h-12 rounded-full border-2 border-primary/10 border-t-primary animate-spin"></div>
               <div className="text-center space-y-2">
                 <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary animate-pulse">Retrieving Neural Archive...</p>
                 <p className="text-slate-600 text-[9px] font-mono">Verifying authentication hashes...</p>
               </div>
             </div>
          ) : fetchError ? (
            <div className="py-20 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
              <span className="material-icons-round text-5xl mb-4 text-red-500/50">error_outline</span>
              <h3 className="text-red-500 font-bold text-lg mb-2">Neural Link Failure</h3>
              <p className="text-slate-400 text-sm mb-6">{fetchError}</p>
              <button onClick={() => window.location.reload()} className="bg-white/10 text-white px-6 py-2 rounded font-mono text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Retry Decryption</button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-20 text-center opacity-30 select-none border border-dashed border-white/5 rounded-2xl">
              <span className="material-icons-round text-5xl mb-4">search_off</span>
              <p className="font-mono text-xs uppercase tracking-widest">No matching sessions found in this cluster</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 mb-10">
                <AnimatePresence mode="popLayout">
                  {filteredHistory.map((item, index) => (
                    <HistoryCard 
                      key={item.id}
                      item={item}
                      index={index}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4 pb-20">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white px-8 py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="material-icons-round text-sm animate-spin text-primary">sync</span>
                        Refetching Buffer...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-sm group-hover:translate-y-0.5 transition-transform">expand_more</span>
                        Load More History
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
