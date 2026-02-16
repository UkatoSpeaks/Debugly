"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getOrgClusters, 
  getUserOrganizations, 
  createDebugCluster,
  DebugCluster 
} from "@/lib/teamService";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ClustersPage() {
  const { user } = useAuth();
  const { orgId } = useParams();
  const [clusters, setClusters] = useState<DebugCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCluster, setNewCluster] = useState({ name: "", description: "" });
  const [orgName, setOrgName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user && orgId) {
      loadData();
    }
  }, [user, orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const orgs: any = await getUserOrganizations(user!.uid);
      const currentOrg = orgs.find((o: any) => o.orgId === orgId);
      if (currentOrg) setOrgName(currentOrg.orgName);

      const items = await getOrgClusters(orgId as string);
      setClusters(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCluster.name.trim()) return;

    try {
      setMessage({ text: "Creating cluster...", type: "info" });
      await createDebugCluster(orgId as string, newCluster.name, newCluster.description);
      setNewCluster({ name: "", description: "" });
      setIsCreating(false);
      setMessage({ text: "Cluster created successfully!", type: "success" });
      loadData();
    } catch (err) {
      setMessage({ text: "Failed to create cluster.", type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] mb-2">
            <Link href="/teams" className="hover:text-white transition-colors">Organizations</Link>
            <span className="text-slate-700">/</span>
            <span>{orgName}</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Debug Clusters</h1>
          <p className="text-slate-400">Shared repositories for collaborative error analysis.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary text-black px-6 py-2.5 rounded font-bold text-sm tracking-wide hover:shadow-glow transition-all whitespace-nowrap"
        >
          NEW CLUSTER
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : clusters.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-20 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700">
            <span className="material-icons-round text-slate-500 text-3xl">folder_zip</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Clusters Active</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">Create shared folders to organize your team's analyses by project, environment, or severity.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="text-primary font-mono text-sm border-b border-primary/30 hover:border-primary transition-all"
          >
            + Initialize First Cluster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((cluster) => (
            <motion.div 
              key={cluster.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-primary/50 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-icons-round text-slate-600 text-sm">settings</span>
              </div>
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-primary transition-all">
                <span className="material-icons-round text-slate-400 group-hover:text-black transition-all">folder</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{cluster.name}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{cluster.description || "No description provided."}</p>
              
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Active Cluster</span>
                <button className="text-primary text-xs font-bold hover:underline">EXPLORE</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Cluster Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2">New Debug Cluster</h2>
              <p className="text-slate-400 text-sm mb-8">Group shared analyses into a collaborative folder.</p>

              <form onSubmit={handleCreateCluster} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Cluster Name</label>
                  <input 
                    type="text" 
                    value={newCluster.name}
                    onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                    placeholder="e.g. Production Incidents"
                    className="w-full bg-black/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={newCluster.description}
                    onChange={(e) => setNewCluster({ ...newCluster, description: e.target.value })}
                    placeholder="Shared space for team debugging..."
                    className="w-full bg-black/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 border border-slate-800 rounded-lg text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-black rounded-lg font-bold text-sm hover:shadow-glow transition-all"
                  >
                    INITIALIZE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full border text-sm font-bold shadow-2xl backdrop-blur-md ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 
              message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 
              'bg-blue-500/10 border-blue-500/50 text-blue-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
