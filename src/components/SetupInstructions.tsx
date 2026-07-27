import React, { useState } from 'react';
import { Download, Terminal, Settings, FolderOpen, Puzzle, CheckCircle2 } from 'lucide-react';

export default function SetupInstructions() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Download & Extract",
      icon: Download,
      description: "Click the 'Download Complete Extension' ZIP button above. Extract this ZIP file into a permanent folder on your machine (e.g., inside Documents or a Projects directory).",
    },
    {
      title: "Open Extension Controls",
      icon: Terminal,
      description: "Open Google Chrome (or any Chromium browser like Edge/Brave) and visit 'chrome://extensions/' in a premium tab. Or reveal the Extensions menu and select 'Manage extensions'.",
    },
    {
      title: "Enable Developer Mode",
      icon: Settings,
      description: "In the top-right margins of the chrome://extensions page, switch the 'Developer mode' toggle to ON. This enables the installation of custom offline directory files.",
    },
    {
      title: "Click 'Load Unpacked'",
      icon: FolderOpen,
      description: "Click the prominent 'Load unpacked' button that appeared in the top-left corner. A local directory selection box will launch on your desktop.",
    },
    {
      title: "Select Extracted Folder",
      icon: Puzzle,
      description: "Find and select the unzipped directory containing manifest.json, background.js, popup.html, content.js, and style assets. Press Select/Open.",
    },
    {
      title: "Pin & Distraction-Free",
      icon: CheckCircle2,
      description: "The 'Any Full Screen' Card in Chrome is active! Click the small puzzle piece on your browser title bar to Pin the logo, then load any website to try your custom floating trigger!",
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm shadow-zinc-100">
      <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
        <span>Chrome Developer Setup Guide</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-inner'
                  : isCompleted
                  ? 'border-indigo-200 bg-zinc-50'
                  : 'border-zinc-200/80 hover:bg-zinc-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`}>0{idx + 1}</span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : isCompleted ? 'text-indigo-400' : 'text-zinc-400'}`} />
              </div>
              <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>{step.title}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200/60 flex gap-4 items-start min-h-[110px] transition-all">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
          {(() => {
            const CurrentIcon = steps[activeStep].icon;
            return <CurrentIcon className="w-5 h-5" />;
          })()}
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Step {activeStep + 1} of 6</span>
          <h4 className="font-semibold text-zinc-900 text-base mb-1">{steps[activeStep].title}</h4>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-4xl">{steps[activeStep].description}</p>
        </div>
      </div>
    </div>
  );
}
