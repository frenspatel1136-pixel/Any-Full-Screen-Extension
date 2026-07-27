import React, { useState, useEffect, useRef } from 'react';
import { ExtensionSettings, Website } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Video, 
  FileText, 
  Terminal as TermIcon, 
  BarChart3, 
  Chrome, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Maximize, 
  Minimize, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BrowserPreviewProps {
  settings: ExtensionSettings;
}

export default function BrowserPreview({ settings }: BrowserPreviewProps) {
  const [activeSiteId, setActiveSiteId] = useState('writer');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [siteFloatingButtonVisible, setSiteFloatingButtonVisible] = useState(true);
  const [inputText, setInputText] = useState('Type your thoughts here... Any Full Screen lets you experience this simple markdown text area in full browser canvas, stripping away tab clutter and bookmarks. Perfect for writers.');
  const [playbackTime, setPlaybackTime] = useState(124); // mock video seconds
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showExitGuide, setShowExitGuide] = useState(false);
  
  const browserContainerRef = useRef<HTMLDivElement>(null);

  // List of simulated websites
  const websites: Website[] = [
    { id: 'writer', name: 'ZenWriter', url: 'https://zenwriter.io/editor', category: 'Writing', primaryColor: '#4f46e5', bgClass: 'bg-stone-50 text-stone-800 font-serif' },
    { id: 'video', name: 'TubeStream', url: 'https://tubestream.net/v/937190', category: 'Video', primaryColor: '#ef4444', bgClass: 'bg-zinc-950 text-zinc-100' },
    { id: 'dashboard', name: 'SaaSMetrics', url: 'https://analytics.saasmetrics.dev/v3', category: 'Dashboard', primaryColor: '#10b981', bgClass: 'bg-slate-50 text-slate-800' },
    { id: 'editor', name: 'CloudTerm', url: 'https://shell.cloudterm.com/sandbox', category: 'Editor', primaryColor: '#f59e0b', bgClass: 'bg-zinc-900 text-amber-500 font-mono' },
  ];

  const activeSite = websites.find(w => w.id === activeSiteId) || websites[0];

  // Hotkey listener for F11 or customized hotkey inside the preview sandbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keysPressed = [];
      if (e.ctrlKey || e.metaKey) keysPressed.push('CTRL');
      if (e.shiftKey) keysPressed.push('SHIFT');
      if (e.altKey) keysPressed.push('ALT');
      
      const keyUpper = e.key.toUpperCase();
      // Only capture standard characters
      if (keyUpper !== 'CONTROL' && keyUpper !== 'SHIFT' && keyUpper !== 'ALT' && keyUpper !== 'META') {
        keysPressed.push(keyUpper);
      }

      const matchShortcut = settings.keyboardShortcut.toUpperCase();
      const actualTriggerStr = keysPressed.join('+');

      if (matchShortcut === actualTriggerStr || (e.key === 'F11' && !e.ctrlKey)) {
        // Prevent default standard browser F11 fullscreen to prioritize our custom sandbox fullscreen simulation
        e.preventDefault();
        toggleSandboxFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardShortcut]);

  // Video timer effect
  useEffect(() => {
    let interval: any;
    if (isVideoPlaying && activeSiteId === 'video') {
      interval = setInterval(() => {
        setPlaybackTime(p => {
          if (p >= 332) return 0;
          return p + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, activeSiteId]);

  const toggleSandboxFullscreen = () => {
    setIsFullscreen(f => {
      const targetState = !f;
      if (targetState) {
        // Just entered simulated fullscreen, flash exit tooltip briefly
        setShowExitGuide(true);
        setTimeout(() => setShowExitGuide(false), 3000);
      }
      return targetState;
    });
  };

  const handleFloatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSandboxFullscreen();
  };

  // Convert settings properties to styling styles
  const getButtonPositionClass = () => {
    switch (settings.buttonPosition) {
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      default: return 'bottom-4 right-4';
    }
  };

  const getButtonSizeClass = () => {
    switch (settings.buttonSize) {
      case 'small': return 'w-8 h-8';
      case 'large': return 'w-12 h-12';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Chrome className="w-4 h-4 text-zinc-600" />
            <span>2. Extension Live Sandbox Sandbox</span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Interactive</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-1">Interact with the Chrome workspace wrapper below to test floating handlers, shortcuts, and standalone views.</p>
      </div>

      {/* Main simulated browser box */}
      <div 
        ref={browserContainerRef}
        className={`relative rounded-2xl border ${
          isFullscreen ? 'border-zinc-900 shadow-2xl h-[560px]' : 'border-zinc-200 h-[480px]'
        } bg-zinc-900 shadow-lg overflow-hidden flex flex-col transition-all duration-500`}
      >
        
        {/* Top Browser Tab & URL frame - Hides during Fullscreen simulation */}
        <AnimatePresence initial={false}>
          {!isFullscreen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 68, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-zinc-800 select-none flex flex-col justify-end overflow-hidden border-b border-zinc-700/50 shrink-0"
            >
              {/* Tab Header row */}
              <div className="flex items-center justify-between px-3 h-8 text-[11px] font-medium text-zinc-400">
                <div className="flex items-center gap-1">
                  {websites.map(site => (
                    <button
                      key={site.id}
                      onClick={() => setActiveSiteId(site.id)}
                      className={`h-7 px-3 rounded-t-lg flex items-center gap-1.5 transition-colors ${
                        activeSiteId === site.id 
                          ? 'bg-zinc-900 text-zinc-200 border-t-2' 
                          : 'hover:bg-zinc-700/40 text-zinc-400'
                      }`}
                      style={{ borderTopColor: activeSiteId === site.id ? activeSite.primaryColor : 'transparent' }}
                    >
                      {site.id === 'writer' && <FileText className="w-3.5 h-3.5" />}
                      {site.id === 'video' && <Video className="w-3.5 h-3.5" />}
                      {site.id === 'dashboard' && <BarChart3 className="w-3.5 h-3.5" />}
                      {site.id === 'editor' && <TermIcon className="w-3.5 h-3.5" />}
                      <span>{site.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                </div>
              </div>

              {/* Navigation and URL controls */}
              <div className="bg-zinc-900 h-9 px-3 flex items-center justify-between gap-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 text-zinc-500">
                  <ArrowLeft className="w-4 h-4 cursor-not-allowed text-zinc-700" />
                  <ArrowRight className="w-4 h-4 cursor-not-allowed text-zinc-700" />
                  <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300" onClick={() => {
                    setInputText(it => it); if (activeSiteId === 'video') setPlaybackTime(0);
                  }} />
                </div>
                
                {/* URL container */}
                <div className="bg-zinc-800 flex-1 h-6 rounded-md flex items-center px-3 justify-between text-xs text-zinc-400 border border-zinc-700/30">
                  <div className="flex items-center gap-1.5 truncate">
                    <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="font-mono text-zinc-400 select-text overflow-hidden">{activeSite.url}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-sans tracking-wide">Secure (SSL)</span>
                </div>

                {/* Simulated Extension Trigger */}
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button 
                      onClick={toggleSandboxFullscreen}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Quick Fullscreen from extension card"
                    >
                      <span className="w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 bg-indigo-500 animate-ping" />
                      <span className="w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 bg-indigo-500" />
                      <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white font-bold select-none cursor-pointer">
                        <Maximize className="w-3 h-3" />
                      </div>
                    </button>
                    <div className="pointer-events-none absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-52 bg-zinc-950 text-white text-[10px] p-2 rounded-md shadow-xl border border-zinc-800">
                      Toggle standard browser full screen right from the simulation extension anchor!
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Custom Overlay Exit Controller (revealed when mouse moves to top center in Simulated Full Screen) */}
        {isFullscreen && (
          <div 
            className="absolute top-0 left-0 right-0 h-4 bg-transparent z-40"
            onMouseEnter={() => setShowExitGuide(true)}
          />
        )}
        <AnimatePresence>
          {isFullscreen && showExitGuide && (
            <motion.div
              initial={{ y: -45, x: '-50%' }}
              animate={{ y: 0, x: '-50%' }}
              exit={{ y: -45, x: '-50%' }}
              onMouseLeave={() => setShowExitGuide(false)}
              className="absolute left-1/2 -translate-x-1/2 top-0 bg-zinc-950 text-zinc-200 px-6 py-2 rounded-b-xl shadow-2xl border-x border-b border-zinc-800 text-xs font-semibold flex items-center gap-3 z-50 cursor-pointer select-none"
              onClick={toggleSandboxFullscreen}
              title="Click to Exit Simulated Full Screen"
            >
              <span>Immersive Workspace Active. Press Escape or Click to Exit</span>
              <Minimize className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Website Simulator Frame Area */}
        <div className={`flex-1 relative overflow-auto shadow-inner ${activeSite.bgClass}`}>
          {/* Simulated Floating Fullscreen Trigger */}
          {settings.floatingButtonEnabled && siteFloatingButtonVisible && (
            <motion.button
              id="fullscreen-floating-sandbox-trigger"
              layoutId="sandboxFloatingButton"
              className={`absolute z-30 flex items-center justify-center rounded-full text-white shadow-lg cursor-pointer transform select-none hover:scale-110 active:scale-95 transition-all outline-none ${getButtonSizeClass()} ${getButtonPositionClass()}`}
              style={{ 
                backgroundColor: settings.buttonColor,
                opacity: isFullscreen ? 0.15 : (settings.buttonOpacity / 100),
              }}
              whileHover={{ opacity: 1, scale: 1.12 }}
              onClick={handleFloatingClick}
              title="Click to enter fullscreen (Double-click to remove button)"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setSiteFloatingButtonVisible(false);
                setTimeout(() => {
                  alert("You dismissed the simulated floating button for this tab. Click the 'Reset' reload icon on top right in simulated URL to recover it.");
                }, 100);
              }}
            >
              <Maximize className="w-[50%] h-[50%] text-white shrink-0 stroke-[2.5]" />
            </motion.button>
          )}

          {/* SIMULATED WEBSITE 1: WriterZen Editor */}
          {activeSiteId === 'writer' && (
            <div className="p-8 md:p-12 max-w-2xl mx-auto h-full flex flex-col select-text font-serif">
              <input 
                type="text" 
                defaultValue="Whispers from the Wilderness" 
                className="text-2xl md:text-3xl font-serif text-stone-900 border-none outline-none font-semibold mb-3 tracking-tight bg-transparent" 
              />
              <div className="w-16 h-0.5 bg-stone-300 mb-6" />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full flex-1 bg-transparent border-none outline-none text-stone-700 text-sm md:text-base leading-relaxed resize-none font-serif font-light focus:ring-0"
              />
              <div className="flex items-center justify-between text-[11px] font-sans font-medium text-stone-400 mt-4 pt-4 border-t border-stone-200 select-none">
                <span>ZenWriter v2.2</span>
                <span className="font-mono">{inputText.length} Characters • {inputText.split(/\s+/).filter(Boolean).length} Words</span>
              </div>
            </div>
          )}

          {/* SIMULATED WEBSITE 2: TubeStream Video */}
          {activeSiteId === 'video' && (
            <div className="h-full flex flex-col md:flex-row gap-4 p-4 select-none">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {/* Main TV Frame */}
                <div className="relative aspect-video rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800 flex items-center justify-center group shadow-md shadow-black/10">
                  <div className="absolute inset-0 bg-radial-gradient from-zinc-800/20 to-zinc-950" />
                  
                  {/* Dynamic canvas circle representation */}
                  <div className="absolute w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                    {isVideoPlaying ? <Pause className="w-8 h-8 font-bold text-red-500" /> : <Play className="w-8 h-8 font-bold fill-red-500 text-red-500 ml-1" />}
                  </div>

                  <p className="absolute bottom-12 text-center text-xs text-zinc-500 font-mono">Simulated Broadcaster Feed</p>

                  {/* Video playback slider */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                    <div 
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${(playbackTime / 332) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Under controls */}
                <div className="flex items-center justify-between py-1 px-1">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="p-1 px-3 bg-zinc-800 text-white rounded text-xs hover:bg-zinc-700 font-semibold"
                    >
                      {isVideoPlaying ? 'Pause Video' : 'Play Live Feed'}
                    </button>
                    <button 
                      onClick={() => setPlaybackTime(0)}
                      className="p-1 bg-zinc-800 text-white rounded text-xs hover:bg-zinc-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-mono text-zinc-400 text-xs text-right">
                    {Math.floor(playbackTime / 60)}:{(playbackTime % 60).toString().padStart(2, '0')} / 5:32
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-100 text-sm md:text-base tracking-tight leading-tight">Relaxing Wilderness Streams: Cozy cabin in dense green forests (Rain Sounds)</h4>
                  <p className="text-zinc-500 text-xs mt-1">112,408 Views • Live Broadcasters 24/7</p>
                </div>
              </div>

              {/* Sidebar Videos */}
              <div className="w-full md:w-56 shrink-0 flex flex-col gap-3">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Recommended Next</p>
                {[
                  { title: "Calm coding chill beats", channel: "DevSessions", views: "4.2M views" },
                  { title: "Unpacking the extension", channel: "TechSaga", views: "32K views" },
                  { title: "Ditching tab distraction", channel: "ZenMind", views: "190K views" },
                ].map((rec, k) => (
                  <div key={k} className="flex gap-2 p-1.5 rounded bg-zinc-900 border border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                    <div className="w-16 h-10 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-zinc-500 font-semibold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-zinc-100 leading-tight truncate">{rec.title}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">{rec.channel}</p>
                      <p className="text-[9px] text-zinc-500">{rec.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIMULATED WEBSITE 3: SaaS Analytics Metrics */}
          {activeSiteId === 'dashboard' && (
            <div className="p-6 h-full overflow-auto flex flex-col gap-4 select-none">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h4 className="font-bold text-zinc-900 text-base">Analytical Board</h4>
                  <p className="text-[11px] text-zinc-500">Live Workspace Conversion Metrics</p>
                </div>
                <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-3 rounded-md transition-colors">
                  Refresh Records
                </button>
              </div>

              {/* Mini bento card statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Active Connections", num: "42,109", rate: "+12.4% vs last week", color: "text-emerald-600" },
                  { label: "Extension Conversions", num: "94.8%", rate: "100% standard delivery", color: "text-indigo-600" },
                  { label: "Offline Sandbox Load", num: "1.2ms avg", rate: "Fastest client side delivery", color: "text-amber-500" }
                ].map((col, c) => (
                  <div key={c} className="bg-white p-3 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{col.label}</span>
                    <span className={`text-xl font-bold ${col.color} mt-1`}>{col.num}</span>
                    <span className="text-[10px] text-zinc-500 font-medium mt-1 leading-none">{col.rate}</span>
                  </div>
                ))}
              </div>

              {/* Chart Grid */}
              <div className="flex-1 bg-white p-4 rounded-xl border border-zinc-200/60 flex flex-col min-h-[140px] items-center justify-center text-center">
                <div className="flex items-end gap-3 h-28 w-full max-w-sm justify-between mb-2">
                  <div className="bg-emerald-100 hover:bg-emerald-200 rounded-t-md w-full h-8 transition-all" />
                  <div className="bg-emerald-200 hover:bg-emerald-300 rounded-t-md w-full h-14 transition-all" />
                  <div className="bg-emerald-300 hover:bg-emerald-400 rounded-t-md w-full h-20 transition-all" />
                  <div className="bg-emerald-400 hover:bg-emerald-500 rounded-t-md w-full h-24 transition-all" />
                  <div className="bg-emerald-500 hover:bg-emerald-600 rounded-t-md w-full h-28 transition-all" />
                </div>
                <p className="text-xs font-semibold text-zinc-700">Workflow distractions diminished by 89% using distraction-free viewport.</p>
              </div>
            </div>
          )}

          {/* SIMULATED WEBSITE 4: Terminal Editor */}
          {activeSiteId === 'editor' && (
            <div className="p-5 h-full font-mono text-[11px] md:text-xs text-amber-500 bg-zinc-950 flex flex-col leading-relaxed justify-between">
              <div>
                <div className="flex items-center justify-between opacity-50 border-b border-zinc-800 pb-2 mb-3">
                  <span>SANDBOX KERNEL v4.11.0</span>
                  <span>ONLINE UTC 2026-06-18</span>
                </div>
                <p className="text-zinc-400"># To test our Chrome Extension commands in this terminal shell:</p>
                <p className="text-zinc-500 font-semibold">$ npx load-unpacked --verbose any-fullscreen</p>
                <p className="text-amber-400 mt-1">✓ Loading manifest.json verified: any_fullscreen_extension (v1.1.0)</p>
                <p className="text-amber-400">✓ Injected content script listeners (F11 + customizable shortcuts active)</p>
                <p className="text-zinc-500 mt-3">$ watch -n 1 check-active-fullscreen-element</p>
                <p className="text-zinc-300">Active screen bounds: 1920x1080 (Non-scale view)</p>
                <p className={isFullscreen ? "text-emerald-400 font-bold" : "text-amber-500 font-medium"}>
                  Simulated Fullscreen Selector status: {isFullscreen ? "ACTIVE [DOM_ELEMENT_CONTAINER]" : "INACTIVE [STANDARD_VIEWPORT]"}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 opacity-60 flex justify-between text-[10px]">
                <span>CloudTerm Sandbox</span>
                <span>Type of sandbox: React-Sim</span>
              </div>
            </div>
          )}
        </div>

        {/* Browser indicator bar if in fullscreen */}
        {isFullscreen && (
          <div className="absolute top-1 left-3 text-[10px] text-zinc-400 bg-zinc-950/70 py-0.5 px-2 rounded backdrop-blur">
            Simulated Fullscreen Active. Hover at top to exit, or press <kbd className="font-bold text-white">ESC</kbd> / <kbd className="font-bold text-white">{settings.keyboardShortcut}</kbd>
          </div>
        )}

        {/* Reload button to recover Floating Button if dismissed */}
        {!siteFloatingButtonVisible && (
          <button
            onClick={() => setSiteFloatingButtonVisible(true)}
            className="absolute z-20 bottom-4 left-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-md p-1.5 flex items-center gap-1 shadow"
            title="Reset simulated button"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px]">Recover Button</span>
          </button>
        )}
      </div>
    </div>
  );
}
