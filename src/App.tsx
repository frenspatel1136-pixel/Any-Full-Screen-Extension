import React, { useState } from 'react';
import { ExtensionSettings } from './types';
import Header from './components/Header';
import SetupInstructions from './components/SetupInstructions';
import ExtensionCustomizer from './components/ExtensionCustomizer';
import BrowserPreview from './components/BrowserPreview';
import CodeExporter from './components/CodeExporter';

export default function App() {
  const [settings, setSettings] = useState<ExtensionSettings>({
    floatingButtonEnabled: true,
    buttonPosition: 'bottom-right',
    buttonSize: 'medium',
    buttonColor: '#4f46e5', // Indigo default
    buttonOpacity: 80,
    autoFullscreenOnLoad: false,
    rememberDomainSettings: true,
    standaloneShortcut: true,
    keyboardShortcut: 'Ctrl+Shift+F',
    popupTheme: 'dark',
  });

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-zinc-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8">
        
        {/* Intro Hero Board */}
        <div className="bg-gradient-to-r from-zinc-900 via-[#1a1b2e] to-zinc-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg select-none">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
              <rect x="35" y="35" width="30" height="30" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          
          <div className="max-w-3xl relative z-10 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Immersive Standalone Manifest V3 Creator</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-300 bg-clip-text text-transparent">
              Immerse Any Website in Pure Distraction‑Free Canvas
            </h2>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-light font-sans max-w-2xl">
              Construct, customized, test, and package your own premium Chromium Extension. This utility injects customizable floating escape button hotspots, handles system keystrokes, and enables standalone app-like detached windows across the entire web.
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Segment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Controls Segment Panel */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-24">
            <ExtensionCustomizer 
              settings={settings} 
              onChange={setSettings} 
            />
          </div>

          {/* Sandboxed Sim and Output Repository Segment */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 md:gap-8">
            {/* 1. Sandboxed Webpage testing preview */}
            <BrowserPreview 
              settings={settings} 
            />

            {/* 2. Repositories tabbed view */}
            <CodeExporter 
              settings={settings} 
            />
          </div>

        </div>

        {/* 3. Illustrated Install Wizard block */}
        <div className="border-t border-zinc-200/60 pt-6">
          <SetupInstructions />
        </div>

      </main>

      {/* Corporate human-literal footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-6 text-center select-none text-xs text-zinc-400 mt-12 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p>© 2026 Any Full Screen Extension Utility. Created in clean client-side React sandbox.</p>
          <div className="flex items-center justify-center gap-4">
            <span className="hover:text-zinc-600 transition-colors">Manifest V3 Compliant</span>
            <span>•</span>
            <span className="hover:text-zinc-600 transition-colors font-medium">Chromium 124+ Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
