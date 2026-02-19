import React, { useState } from "react";
import { FileBuffer } from "@/lib/analysisService";
import { motion, AnimatePresence } from "framer-motion";
import { indexWorkspace } from "@/lib/ai/workspaceService";
import { db } from "@/lib/ai/vectorStore";

const MODELS = [
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Speed)", detail: "Hyper-fast baseline analysis" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Depth)", detail: "High-fidelity architectural mapping" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Context)", detail: "Deep multivariable context (1M tokens)" },
];

interface TerminalProps {
  files: FileBuffer[];
  onFilesChange: (files: FileBuffer[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  selectedLocale: string;
  onLocaleChange: (locale: string) => void;
  locales: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function Terminal({
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
  selectedLocale,
  onLocaleChange,
  locales,
  selectedModel,
  onModelChange,
}: TerminalProps) {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || "error");
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingFile, setIndexingFile] = useState("");
  const [workspaceLinked, setWorkspaceLinked] = useState(false);

  // Check if we have vectors on load
  React.useEffect(() => {
    db.chunks.count().then(count => setWorkspaceLinked(count > 0));
  }, []);

  const handleSyncWorkspace = async () => {
    try {
      // @ts-ignore - showDirectoryPicker is a modern API
      if (!window.showDirectoryPicker) {
        alert("Your browser does not support the File System Access API. Please use Chrome/Edge.");
        return;
      }

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      setIsIndexing(true);
      
      const workspaceFiles: { path: string; content: string }[] = [];
      
      async function scan(handle: any, path: string = "") {
        for await (const entry of handle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          if (entry.kind === 'file') {
            // Only index code files
            if (/\.(ts|tsx|js|jsx|py|go|rs|c|cpp|h|java)$/.test(entry.name)) {
              const file = await entry.getFile();
              const content = await file.text();
              workspaceFiles.push({ path: entryPath, content });
            }
          } else if (entry.kind === 'directory' && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await scan(entry, entryPath);
          }
        }
      }

      await scan(dirHandle);
      await db.chunks.clear(); // Fresh index
      
      await indexWorkspace(workspaceFiles, (progress) => {
        setIndexingFile(`${progress.processedFiles}/${progress.totalFiles}: ${progress.currentFile}`);
      });

      setWorkspaceLinked(true);
    } catch (err) {
      console.error("Workspace sync failed:", err);
    } finally {
      setIsIndexing(false);
      setIndexingFile("");
    }
  };

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleContentChange = (content: string) => {
    onFilesChange(files.map(f => f.id === activeFileId ? { ...f, content } : f));
  };

  const handleAddFile = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newFile: FileBuffer = {
      id: newId,
      name: `Untitled-${files.length}.tsx`,
      content: "",
    };
    onFilesChange([...files, newFile]);
    setActiveFileId(newId);
  };

  const handleRemoveFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.find(f => f.id === id)?.isMainError) return;
    const newFiles = files.filter(f => f.id !== id);
    onFilesChange(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const handleRenameFile = (id: string, newName: string) => {
    onFilesChange(files.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  return (
    <section className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-border bg-background relative z-10 transition-all duration-500">
      {/* Panel Header */}
      <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Neural Context Hub</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-white/5">
            <span className="text-[9px] font-mono text-slate-600 uppercase">Model:</span>
            <select 
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] font-mono text-primary focus:outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900" title={m.detail}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pr-4 border-r border-white/5">
            <span className="text-[9px] font-mono text-slate-600 uppercase">Response:</span>
            <select 
              value={selectedLocale}
              onChange={(e) => onLocaleChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] font-mono text-primary focus:outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
            >
              {locales.map(loc => <option key={loc} value={loc} className="bg-slate-900">{loc}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
            {isIndexing ? (
              <span className="flex items-center gap-2 text-primary animate-pulse">
                <span className="material-icons-round text-xs spin">sync</span>
                Indexing: {indexingFile}
              </span>
            ) : (
              <button 
                onClick={handleSyncWorkspace}
                className="flex items-center gap-1.5 hover:text-primary transition-all group"
                title="Index local workspace for semantic mapping"
              >
                <span className="material-icons-round text-xs group-hover:rotate-180 transition-all duration-500">hub</span>
                {workspaceLinked ? "Workspace Active" : "Connect Workspace"}
              </button>
            )}
            <span className="flex items-center gap-1.5 border-l border-white/5 pl-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 active-pulse"></span>
              Context Mode: {workspaceLinked ? "Semantic" : "Multi-File"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex bg-black/40 border-b border-white/5 px-2 overflow-x-auto custom-scrollbar no-scrollbar">
        {files.map((file) => (
          <div 
            key={file.id}
            onClick={() => setActiveFileId(file.id)}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-t-2 transition-all min-w-[120px] max-w-[200px] relative group ${
              activeFileId === file.id 
              ? "bg-[#0B0F14] border-primary text-slate-200" 
              : "bg-transparent border-transparent text-slate-500 hover:bg-white/5"
            }`}
          >
            <span className="material-icons-round text-xs opacity-50">
              {file.isMainError ? "terminal" : "description"}
            </span>
            <input 
              className="bg-transparent border-none p-0 text-[11px] font-mono focus:ring-0 w-full cursor-pointer truncate"
              value={file.name}
              readOnly={file.isMainError}
              onChange={(e) => handleRenameFile(file.id, e.target.value)}
            />
            {!file.isMainError && (
              <button 
                onClick={(e) => handleRemoveFile(e, file.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              >
                <span className="material-icons-round text-[14px]">close</span>
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={handleAddFile}
          className="px-4 text-slate-500 hover:text-primary transition-colors flex items-center"
          title="Add context file"
        >
          <span className="material-icons-round text-sm">add</span>
        </button>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex flex-col bg-[#0B0F14] relative group">
        {/* Line Numbers Decor */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-black/20 border-r border-white/5 pt-4 pr-3 text-right select-none pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="text-[10px] font-mono text-slate-700 leading-6">{i + 1}</div>
          ))}
        </div>

        {/* Terminal Textarea */}
        <textarea 
          value={activeFile?.content || ""}
          onChange={(e) => handleContentChange(e.target.value)}
          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-300 pl-16 pt-4 leading-6 font-mono text-sm placeholder-slate-700 outline-none resize-none custom-scrollbar"
          placeholder={activeFile?.isMainError 
            ? "Paste your main error trace or log output here..." 
            : `Paste content of ${activeFile?.name} here to provide context...`}
          spellCheck="false"
        ></textarea>

        {/* Input Overlay Actions */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
           <button 
            onClick={() => handleContentChange("")}
            className="p-2.5 rounded bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95" 
            title="Clear active buffer"
           >
             <span className="material-icons-round text-sm">delete_sweep</span>
           </button>
           <button 
            onClick={onAnalyze}
            disabled={isAnalyzing || !files.some(f => f.content.trim())}
            className="bg-primary hover:bg-white text-black font-mono font-black text-[10px] uppercase tracking-[0.2em] py-3.5 px-8 rounded-lg shadow-glow disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2 group active:scale-95"
           >
             {isAnalyzing ? (
               <span className="material-icons-round text-sm animate-spin">sync</span>
             ) : (
               <span className="material-icons-round text-sm group-hover:rotate-12 transition-transform">bolt</span>
             )}
             {isAnalyzing ? "Deep Analysis..." : "Analyze Context"}
           </button>
        </div>
      </div>
    </section>
  );
}
