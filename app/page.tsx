"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { saveAnalysis, FileBuffer } from "@/lib/analysisService";
import { analyzeError } from "@/lib/ai/provider";
import Navbar from "@/components/Navbar";
import Terminal from "@/components/Terminal";
import AnalysisPanel from "@/components/AnalysisPanel";

const LOCALES = ["English", "Spanish", "French", "German", "Hindi", "Japanese"];

const INITIAL_FILES: FileBuffer[] = [
  { id: "main-error", name: "Main Error", content: "", isMainError: true }
];

export default function LandingPage() {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<FileBuffer[]>(INITIAL_FILES);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState("English");
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const trigger = localStorage.getItem("debugly_test_trigger");
    if (trigger) {
      setFiles([{ ...INITIAL_FILES[0], content: trigger }]);
      localStorage.removeItem("debugly_test_trigger");
      // Small delay to ensure state and components are ready
      setTimeout(() => {
        const btn = document.querySelector('button[disabled*="false"]');
        if (btn instanceof HTMLButtonElement) btn.click();
      }, 500);
    }
  }, []);

  const handleAnalyze = async () => {
    const mainError = files.find(f => f.isMainError)?.content || "";
    if (!mainError.trim() && !files.some(f => f.content.trim())) return;
    
    setIsAnalyzing(true);
    setShowAnalysis(false);
    setAnalysisError(null);
    setAnalysisId(null);
    
    try {
      const result = await analyzeError(files, selectedLocale, selectedModel);
      setCurrentAnalysis(result);
      setIsAnalyzing(false);
      setShowAnalysis(true);

      if (user) {
        setIsSaving(true);
        try {
          const id = await saveAnalysis({
            ...result,
            userId: user.uid,
            originalError: mainError, // Legacy field for history preview
            context: files, // Full multi-file context
            modelId: selectedModel
          });
          setAnalysisId(id);
        } catch (err: any) {
          console.error("CRITICAL: Auto-save failed.", err);
          // If you see a link in the browser console, click it to create the required Firestore index
          if (err.message?.includes("index")) {
            console.warn("Firestore index missing. Check console for creation link.");
          }
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError("Neural processing failed. Please check your connection or try a different error trace.");
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <Terminal 
          files={files}
          onFilesChange={setFiles}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          selectedLocale={selectedLocale}
          onLocaleChange={setSelectedLocale}
          locales={LOCALES}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        <AnalysisPanel 
          showAnalysis={showAnalysis}
          isAnalyzing={isAnalyzing}
          currentAnalysis={currentAnalysis}
          analysisId={analysisId}
          isSaving={isSaving}
          analysisError={analysisError}
          copied={copied}
          onCopy={handleCopy}
          onNewAnalysis={(refined) => setCurrentAnalysis((prev: any) => ({ ...prev, ...refined }))}
        />
      </main>

      <div className="fixed inset-0 pointer-events-none opacity-20 z-[-1] bg-grid"></div>
    </div>
  );
}
