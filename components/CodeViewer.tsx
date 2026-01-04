
import React, { useState } from 'react';

interface CodeViewerProps {
  code: string;
  title: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#050807] rounded-2xl overflow-hidden border border-emerald-900/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d1310] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-2">{title}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
        >
          {copied ? 'Copied' : 'Copy Logic'}
        </button>
      </div>
      <div className="p-8 overflow-auto max-h-[700px] custom-scrollbar">
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
        `}} />
        <pre className="text-emerald-500/90 text-sm font-mono whitespace-pre leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;
