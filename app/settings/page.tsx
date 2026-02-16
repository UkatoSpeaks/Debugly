"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUserStats } from "@/lib/analysisService";
import { getUserProfile, generateApiToken, revokeApiToken, UserProfile } from "@/lib/userService";

export default function SettingsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalFixes: 0, timeSaved: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      if (user) {
        try {
          const s = await getUserStats(user.uid);
          setStats(s);
          const p = await getUserProfile(user.uid);
          setProfile(p);
        } catch (error) {
          console.error("Error fetching stats/profile:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    }
    fetchStats();
  }, [user]);

  const handleGenerateToken = async () => {
    if (!user) return;
    setIsGenerating(true);
    setMessage(null);
    try {
      const token = await generateApiToken(user.uid);
      setProfile(prev => prev ? { ...prev, apiToken: token } : null);
      setMessage({ text: "API Token generated successfully. Keep it secret!", type: "success" });
      setShowToken(true);
    } catch (error) {
      setMessage({ text: "Failed to generate token. Please try again.", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!user || !profile?.apiToken) return;
    if (!confirm("Are you sure? This will break any CLI or integrations using this token.")) return;
    
    setIsGenerating(true);
    try {
      await revokeApiToken(user.uid, profile.apiToken);
      setProfile(prev => prev ? { ...prev, apiToken: undefined } : null);
      setMessage({ text: "API Token revoked.", type: "success" });
      setShowToken(false);
    } catch (error) {
      setMessage({ text: "Failed to revoke token.", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!loading && !user) {
    router.push("/");
    return null;
  }

  const userInitials = user?.displayName?.[0] || user?.email?.[0] || "U";

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
            <Link href="/docs" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <Link href="/settings" className="w-8 h-8 rounded border border-primary/40 bg-primary/20 flex items-center justify-center text-[10px] font-mono text-primary shadow-glow shadow-primary/10">
            {userInitials}
          </Link>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto px-6 py-12 relative">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tighter text-white mb-2 italic">User Settings</h1>
            <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Manage your neural identity and usage</p>
          </div>

          <div className="space-y-4">
            {/* Account Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl border border-white/5 bg-[#0B0F14] shadow-glass"
            >
              <h3 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Profile Synthesis</h3>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-mono font-bold">
                  {userInitials}
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold">{user?.displayName || "Debug User"}</p>
                  <p className="text-slate-500 text-xs font-mono">{user?.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Plan/Usage Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl border border-white/5 bg-[#0B0F14] shadow-glass"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Usage Analysis</h3>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary uppercase">Pro Developer</span>
              </div>
              
                <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-500">MONTHLY CREDITS</span>
                    <span className="text-white">{Math.max(0, 2000 - stats.totalFixes * 10).toLocaleString()} / 2,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stats.totalFixes * 10 / 2000) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-primary shadow-glow shadow-primary/20"
                    ></motion.div>
                  </div>
                </div>

                <div className="flex gap-10">
                  <div>
                    <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">Total Cures</p>
                    <p className="text-xl font-bold text-white tracking-widest font-mono">
                      {statsLoading ? "---" : stats.totalFixes}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">Time Saved</p>
                    <p className="text-xl font-bold text-white tracking-widest font-mono">
                      {statsLoading ? "---" : 
                       stats.timeSaved >= 60 
                       ? `~${Math.round(stats.timeSaved / 60)}h` 
                       : `${stats.timeSaved}m`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Developer Access Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-xl border border-white/5 bg-[#0B0F14] shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                <span className="material-icons-round text-8xl">terminal</span>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Developer Access</h3>
                <div className="space-y-6">
                  <div className="max-w-xl">
                    <p className="text-slate-400 text-xs leading-relaxed mb-4 font-mono">
                      API tokens allow headless access to the neural engine. Use this with the Debugly CLI.
                    </p>
                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg flex items-start gap-3 mb-6">
                      <span className="material-icons-round text-yellow-500/50 text-sm">lock</span>
                      <p className="text-[9px] text-yellow-200/40 leading-relaxed font-mono uppercase tracking-tighter">
                        Keep your token secret. Sharing it provides full access to your neural history.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {profile?.apiToken ? (
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                          <div className="flex-1 bg-black/40 rounded-lg border border-white/10 p-3 font-mono text-xs flex items-center justify-between group">
                            <span className="text-primary truncate pr-4">
                              {showToken ? profile.apiToken : "••••••••••••••••••••••••••••••••"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setShowToken(!showToken)}
                                className="text-slate-600 hover:text-white transition-all"
                              >
                                <span className="material-icons-round text-base">{showToken ? "visibility_off" : "visibility"}</span>
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(profile.apiToken!);
                                  setMessage({ text: "Token copied to clipboard.", type: "success" });
                                  setTimeout(() => setMessage(null), 3000);
                                }}
                                className="text-slate-600 hover:text-white transition-all"
                              >
                                <span className="material-icons-round text-base">content_copy</span>
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={handleRevokeToken}
                            disabled={isGenerating}
                            className="px-4 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleGenerateToken}
                        disabled={isGenerating}
                        className="group relative px-6 py-3 bg-primary text-black rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-glow shadow-primary/20"
                      >
                        {isGenerating ? "Generating..." : "Generate Neural Key"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg text-[10px] font-mono uppercase tracking-widest border ${
                    message.type === 'success' ? 'bg-green-500/5 border-green-500/10 text-green-400' : 'bg-red-500/5 border-red-500/10 text-red-400'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Danger Zone */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl border border-red-500/10 bg-red-500/[0.02] shadow-glass"
            >
              <h3 className="text-[10px] font-mono font-black text-red-500/50 uppercase tracking-[0.3em] mb-6">Critical Actions</h3>
              <div className="flex flex-col gap-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] text-slate-300 text-sm hover:bg-white/5 hover:text-white transition-all flex items-center justify-between group">
                  <span className="flex items-center gap-3">
                    <span className="material-icons-round text-lg text-slate-500">shield</span>
                    Security & Credentials
                  </span>
                  <span className="material-icons-round text-slate-700 group-hover:text-slate-400">chevron_right</span>
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-sm hover:bg-red-500/10 transition-all flex items-center gap-3"
                >
                  <span className="material-icons-round text-lg">logout</span>
                  De-authenticate Session
                </button>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 text-center opacity-20">
             <p className="text-[9px] font-mono uppercase tracking-[0.4em]">Debugly Node #8F-2A-SETTINGS</p>
          </div>
        </div>
      </main>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-grid"></div>
    </div>
  );
}
