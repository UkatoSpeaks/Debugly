"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar({ children }: { children?: React.ReactNode }) {
  const { user, loginWithGoogle, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: "Analyzer", href: "/", icon: "analytics" },
    { name: "History", href: "/history", icon: "history" },
    { name: "Teams", href: "/teams", icon: "groups" },
    { name: "Docs", href: "/docs", icon: "description" },
  ];

  return (
    <nav className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-50 sticky top-0">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:text-black transition-all">
            <span className="material-icons-round text-primary group-hover:text-black text-[20px]">bug_report</span>
          </div>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap text-white">Debugly</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors flex items-center gap-2 group ${isActive ? 'text-primary' : 'hover:text-primary'}`}
              >
                <span className={`w-1 h-1 rounded-full bg-primary transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {children}
        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              href="/settings" 
              className="w-8 h-8 rounded border border-primary/40 bg-primary/20 flex items-center justify-center text-[10px] font-mono text-primary hover:bg-primary hover:text-black transition-all shadow-glow"
              title="Settings"
            >
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </Link>
            <button 
              onClick={logout}
              className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={loginWithGoogle}
              className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={loginWithGoogle}
              className="bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded text-[11px] font-mono uppercase tracking-widest font-bold hover:bg-primary hover:text-black transition-all shadow-glow hover:shadow-primary/40"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
