"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  createOrganization, 
  getUserOrganizations, 
  Organization 
} from "@/lib/teamService";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TeamsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user && loading) {
      loadOrgs();
    }
  }, [user]);

  const loadOrgs = async () => {
    try {
      setLoading(true);
      const orgs = await getUserOrganizations(user!.uid);
      // Since getUserOrganizations returns membership data, we map to displayable orgs
      setOrganizations(orgs as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      setMessage({ text: "Creating organization...", type: "info" });
      await createOrganization(user!.uid, newOrgName);
      setNewOrgName("");
      setIsCreating(false);
      setMessage({ text: "Organization created successfully!", type: "success" });
      loadOrgs();
    } catch (err) {
      setMessage({ text: "Failed to create organization.", type: "error" });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Collaborative Debugging</h1>
        <p className="text-slate-400 max-w-md">Scale your neural fixes across your entire engineering team. Please login to access Team Workspaces.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Team Workspaces</h1>
          <p className="text-slate-400">Manage your organizations and shared debug clusters.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={loadOrgs}
            className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded font-mono text-xs hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-sm">sync</span>
            SYNC
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary text-black px-6 py-2.5 rounded font-bold text-sm tracking-wide hover:shadow-glow transition-all whitespace-nowrap"
          >
            CREATE ORGANIZATION
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] animate-pulse">Retrieving Neural Workspaces...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <span className="material-icons-round text-slate-700 text-5xl mb-4">group_add</span>
          <h3 className="text-xl font-bold text-white mb-2">No Organizations Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">You aren't a member of any organizations yet. Create one to start collaborating with your team.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="text-primary font-mono text-sm border-b border-primary/30 hover:border-primary transition-all"
          >
            + New Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org: any) => (
            <motion.div 
              key={org.orgId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-black transition-all">
                  {org.orgName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{org.orgName}</h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{org.role}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Link 
                  href={`/teams/${org.orgId}/clusters`}
                  className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-xs font-mono text-slate-300 transition-all text-left px-4 flex items-center justify-between"
                >
                  <span>View Clusters</span>
                  <span className="material-icons-round text-sm">arrow_forward</span>
                </Link>
                <Link 
                  href={`/teams/${org.orgId}/members`}
                  className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-xs font-mono text-slate-300 transition-all text-left px-4 flex items-center justify-between"
                >
                  <span>Manage Members</span>
                  <span className="material-icons-round text-sm">person_add</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Org Modal */}
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
              <h2 className="text-2xl font-bold text-white mb-2">New Organization</h2>
              <p className="text-slate-400 text-sm mb-8">Create a shared workspace for your development team.</p>

              <form onSubmit={handleCreateOrg} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Organization Name</label>
                  <input 
                    type="text" 
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. Acme Engineering"
                    className="w-full bg-black/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                    required
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
                    CREATE
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
