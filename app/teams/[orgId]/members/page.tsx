"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  inviteMember, 
  getUserOrganizations, 
  getOrgInvitations,
  Organization,
  Invitation
} from "@/lib/teamService";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

export default function ManageMembersPage() {
  const { user } = useAuth();
  const { orgId } = useParams();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [message, setMessage] = useState({ text: "", type: "" });
  const [orgName, setOrgName] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orgId) {
      loadData();
    }
  }, [user, orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Find the org name from the user's orgs
      const orgs: any = await getUserOrganizations(user!.uid);
      const currentOrg = orgs.find((o: any) => o.orgId === orgId);
      if (currentOrg) setOrgName(currentOrg.orgName);

      const invites = await getOrgInvitations(orgId as string);
      setInvitations(invites);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orgId) return;

    try {
      setMessage({ text: "Sending invitation...", type: "info" });
      await inviteMember(orgId as string, orgName, email, role, user!.uid);
      setEmail("");
      setMessage({ text: `Invitation sent to ${email}`, type: "success" });
      loadData();
    } catch (err) {
      setMessage({ text: "Failed to send invitation.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Members</h1>
        <p className="text-slate-400">Invite new members to <span className="text-primary font-bold">{orgName}</span></p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Invite Member</h2>
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@company.com"
              className="w-full bg-black/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-black/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono text-sm appearance-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="md:col-span-3 flex items-end">
            <button 
              type="submit"
              className="w-full py-2.5 bg-primary text-black rounded-lg font-bold text-sm hover:shadow-glow transition-all whitespace-nowrap"
            >
              SEND INVITE
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Pending Invitations</h2>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-500">Loading...</td></tr>
              ) : invitations.length === 0 ? (
                <tr className="border-b border-slate-800/50 last:border-0">
                  <td className="px-6 py-4 text-sm text-slate-300">No pending invitations</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              ) : (
                invitations.map((invite) => (
                  <tr key={invite.id} className="border-b border-slate-800/50 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">{invite.email}</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">{invite.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold rounded-full uppercase tracking-tighter">
                        {invite.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
