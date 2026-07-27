import React, { useState } from 'react';
import JSZip from 'jszip';
import { ExtensionSettings } from '../types';
import { 
  getManifestCode, 
  getBackgroundCode, 
  getContentJsCode, 
  getPopupHtml, 
  getPopupJs, 
  getPopupCssCode, 
  getReadmeCode 
} from '../utils/codeTemplates';
import { drawIconToCanvasBase64 } from '../utils/iconGenerator';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FolderLock, 
  Terminal, 
  BookOpen, 
  Cpu, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';

interface CodeExporterProps {
  settings: ExtensionSettings;
}

export default function CodeExporter({ settings }: CodeExporterProps) {
  const [activeTab, setActiveTab] = useState('manifest.json');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isBundling, setIsBundling] = useState(false);

  // Define files repository
  const files = [
    { name: 'manifest.json', lang: 'json', desc: 'Metadata & standard triggers definitions API', content: getManifestCode(settings) },
    { name: 'content.js', lang: 'javascript', desc: 'Active webpage context injector script', content: getContentJsCode(settings) },
    { name: 'background.js', lang: 'javascript', desc: 'Global keystrokes & standalone worker dispatch', content: getBackgroundCode() },
    { name: 'popup.html', lang: 'html', desc: 'Settings panel HTML body markup', content: getPopupHtml() },
    { name: 'popup.js', lang: 'javascript', desc: 'Popup UI switches and actions logic', content: getPopupJs() },
    { name: 'popup.css', lang: 'css', desc: 'Popup theme colors & switches styling', content: getPopupCssCode() },
    { name: 'styles.css', lang: 'css', desc: 'Floating button & Exit-Prompt injected CSS', content: `/* Injected styles for active full-screen indicators */\n#any-fullscreen-float-trigger {\n  user-select: none !important;\n}\n#any-fullscreen-exit-tooltip {\n  user-select: none !important;\n}` },
    { name: 'README.md', lang: 'markdown', desc: 'Simple instructions template', content: getReadmeCode() },
  ];

  const activeFile = files.find(f => f.name === activeTab) || files[0];

  const handleCopyCode = async (fileName: string, textContent: string) => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownloadZIP = async () => {
    setIsBundling(true);
    try {
      const zip = new JSZip();

      // Add simple flat text files
      zip.file('manifest.json', getManifestCode(settings));
      zip.file('content.js', getContentJsCode(settings));
      zip.file('background.js', getBackgroundCode());
      zip.file('popup.html', getPopupHtml());
      zip.file('popup.js', getPopupJs());
      zip.file('popup.css', getPopupCssCode());
      zip.file('styles.css', `/* Injected styles for active full-screen indicators */\n#any-fullscreen-float-trigger {\n  user-select: none !important;\n}\n#any-fullscreen-exit-tooltip {\n  user-select: none !important;\n}`);
      zip.file('README.md', getReadmeCode());

      // Bundle drawing assets folder dynamically using Canvas Converter helper
      const iconFolder = zip.folder('icons');
      if (iconFolder) {
        // Draw sizes standard
        const icon16Base64 = drawIconToCanvasBase64(16, settings.buttonColor);
        const icon48Base64 = drawIconToCanvasBase64(48, settings.buttonColor);
        const icon128Base64 = drawIconToCanvasBase64(128, settings.buttonColor);

        iconFolder.file('icon16.png', icon16Base64, { base64: true });
        iconFolder.file('icon48.png', icon48Base64, { base64: true });
        iconFolder.file('icon128.png', icon128Base64, { base64: true });
      }

      // Compile zip stream
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Save output
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'any_fullscreen_extension.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to bundle chrome extension archive:', err);
      alert('Zip download failed. Please copy files individually.');
    } finally {
      setIsBundling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm shadow-zinc-100 flex flex-col overflow-hidden h-[540px]">
      
      {/* Exporter Dashboard header */}
      <div className="bg-zinc-50 border-b border-zinc-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>3. Source Repository Builder</span>
          </h3>
          <p className="text-xs text-zinc-500">Live generated source logs tailored to your custom specifications</p>
        </div>

        {/* Master Export Trigger */}
        <button
          onClick={handleDownloadZIP}
          disabled={isBundling}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer select-none transition-all duration-155 transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>{isBundling ? 'Bundling Extension...' : 'Download Complete Extension (.zip)'}</span>
        </button>
      </div>

      {/* Code Editor body block */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side File Tabs */}
        <div className="w-full md:w-64 border-r border-zinc-200/60 bg-zinc-50/50 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 select-none">
          {files.map((file) => {
            const isSelected = activeTab === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setActiveTab(file.name)}
                className={`w-full text-left p-3.5 border-b border-zinc-100 flex md:flex-col gap-1 items-start transition-all transition-colors ${
                  isSelected 
                    ? 'bg-white border-l-2 border-l-indigo-600 text-zinc-950 font-semibold' 
                    : 'text-zinc-600 hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <FileCode className={`w-4 h-4 ${isSelected ? 'text-indigo-600 font-bold' : 'text-zinc-400'}`} />
                  <span className="text-xs font-mono truncate">{file.name}</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-normal leading-normal truncate hidden md:block w-full">{file.desc}</p>
              </button>
            );
          })}
          
          {/* Mock directory visualization details segment */}
          <div className="hidden md:flex flex-col gap-2 p-4 mt-auto border-t border-zinc-100 bg-zinc-50/20 select-none">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <FolderLock className="w-3 h-3 text-indigo-400" />
              <span>Assigned Directories</span>
            </span>
            <div className="pl-3 border-l border-zinc-200 flex flex-col gap-1 font-mono text-[10px] text-zinc-400">
              <p>📂 parent/</p>
              <p className="pl-3 text-indigo-600">📂 icons/</p>
              <p className="pl-6 text-zinc-500">⚪ icon16.png</p>
              <p className="pl-6 text-zinc-500">⚪ icon48.png</p>
              <p className="pl-6 text-zinc-500">⚪ icon128.png</p>
            </div>
          </div>
        </div>

        {/* Right Side Code View panel */}
        <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-mono text-[11px] md:text-xs">
          
          {/* File specific metadata block */}
          <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-zinc-300 font-mono text-xs">{activeFile.name}</span>
              <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-800 rounded px-1.5 uppercase font-medium tracking-wide">
                {activeFile.lang}
              </span>
            </div>

            {/* Local Copy feedback trigger */}
            <button
              onClick={() => handleCopyCode(activeFile.name, activeFile.content)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 active:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-semibold"
            >
              {copiedFile === activeFile.name ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Actual Code content window */}
          <div className="flex-1 overflow-auto p-5 select-text leading-relaxed">
            <pre className="text-zinc-300 font-mono focus:outline-none whitespace-pre select-text">
              <code>{activeFile.content}</code>
            </pre>
          </div>

          {/* Quick Notice bottom overlay banner */}
          <div className="bg-zinc-900/60 border-t border-zinc-800 px-5 py-2 flex items-center justify-between text-[11px] text-zinc-400 font-sans select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tailored dynamically to settings selected on the left panel!</span>
            </div>
            <span>{activeFile.content.split('\n').length} Lines</span>
          </div>

        </div>

      </div>

    </div>
  );
}
