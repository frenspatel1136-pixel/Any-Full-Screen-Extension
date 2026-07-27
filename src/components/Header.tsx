import React from 'react';
import { Maximize2, Shield, Flame, Chrome } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Any Full Screen</h1>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Manifest V3</span>
            </div>
            <p className="text-xs text-zinc-500">Chrome Extension Customizer & Live Interactive Sandbox</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200/60 font-medium">
            <Chrome className="w-3.5 h-3.5 text-zinc-600" />
            <span>Works on all websites</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200/60 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unpacked Developer Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
}
