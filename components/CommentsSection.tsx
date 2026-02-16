"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  addAnalysisComment, 
  getAnalysisComments, 
  AnalysisComment 
} from "@/lib/analysisService";
import { motion, AnimatePresence } from "framer-motion";

interface CommentsSectionProps {
  analysisId: string;
}

export default function CommentsSection({ analysisId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<AnalysisComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (analysisId) {
      loadComments();
    }
  }, [analysisId]);

  const loadComments = async () => {
    try {
      const items = await getAnalysisComments(analysisId);
      setComments(items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setIsSubmitting(true);
      await addAnalysisComment(analysisId, {
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        userPhoto: user.photoURL || undefined,
        content: newComment
      });
      setNewComment("");
      loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-800">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="material-icons-round text-slate-500">forum</span>
        Discussion Thread
      </h3>

      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          <p className="text-slate-500 italic text-sm">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <motion.div 
              key={comment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full rounded-full" />
                ) : (
                  comment.userName[0]
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{comment.userName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="relative">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or technical insight..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none pr-20"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="absolute bottom-3 right-3 bg-primary text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:shadow-glow transition-all disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'POST'}
          </button>
        </form>
      )}
    </div>
  );
}
