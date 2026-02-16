"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnalysisRecord } from "@/lib/analysisService";

interface HistoryCardProps {
  item: AnalysisRecord;
  index: number;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onTogglePin: (e: React.MouseEvent, id: string, status: string) => void;
}

export default function HistoryCard({
  item,
  index,
  onDelete,
  onTogglePin,
}: HistoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link href={`/analysis/${item.id}`}>
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
                  {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
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
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => onTogglePin(e, item.id!, item.status || '')}
              className={`w-8 h-8 rounded border border-white/5 flex items-center justify-center transition-all ${
                item.status === 'Pinned' 
                ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' 
                : 'text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/5'
              }`}
              title={item.status === 'Pinned' ? 'Unpin' : 'Pin to top'}
            >
              <span className="material-icons-round text-sm">push_pin</span>
            </button>
            
            <button 
              onClick={(e) => onDelete(e, item.id!)}
              className="w-8 h-8 rounded border border-white/5 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
              title="Delete Session"
            >
              <span className="material-icons-round text-sm">delete</span>
            </button>

            <div className="w-8 h-8 rounded border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-primary group-hover:border-primary/30 transition-all ml-2">
              <span className="material-icons-round text-lg">chevron_right</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
