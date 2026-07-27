import React from 'react';
import { ExtensionSettings } from '../types';
import { ToggleLeft, ToggleRight, Layout, Eye, Sun, Moon, Keyboard, Sparkles } from 'lucide-react';

interface ExtensionCustomizerProps {
  settings: ExtensionSettings;
  onChange: (newSettings: ExtensionSettings) => void;
}

export default function ExtensionCustomizer({ settings, onChange }: ExtensionCustomizerProps) {
  const updateSetting = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const presetColors = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Crimson', value: '#ef4444' },
    { name: 'Amethyst', value: '#8b5cf6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Coal', value: '#1e293b' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm shadow-zinc-100 flex flex-col gap-6">
      <div>
        <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <span>1. Extension Configuration</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-1">Configure default behaviors and design parameters for the exported files</p>
      </div>

      {/* Floating Button Config */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Floating Button</span>
            </label>
            <p className="text-[11px] text-zinc-500">Inject dynamic circular button into web elements</p>
          </div>
          <button
            onClick={() => updateSetting('floatingButtonEnabled', !settings.floatingButtonEnabled)}
            className="focus:outline-none transition-colors"
          >
            {settings.floatingButtonEnabled ? (
              <ToggleRight className="w-11 h-11 text-indigo-600 fill-indigo-50" />
            ) : (
              <ToggleLeft className="w-11 h-11 text-zinc-300" />
            )}
          </button>
        </div>

        {/* Dynamic button styling only if button is active */}
        {settings.floatingButtonEnabled && (
          <div className="pl-4 border-l-2 border-indigo-100 flex flex-col gap-4 py-1 animate-fade-in">
            {/* Position */}
            <div>
              <span className="text-xs font-semibold text-zinc-700 block mb-2 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-zinc-500" />
                Screen Alignment
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Bottom Right', value: 'bottom-right' },
                  { label: 'Bottom Left', value: 'bottom-left' },
                  { label: 'Top Right', value: 'top-right' },
                  { label: 'Top Left', value: 'top-left' },
                ].map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => updateSetting('buttonPosition', pos.value as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      settings.buttonPosition === pos.value
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Preset */}
            <div>
              <span className="text-xs font-semibold text-zinc-700 block mb-2">Accent Hotspot Color</span>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting('buttonColor', color.value)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative ${
                      settings.buttonColor === color.value
                        ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {settings.buttonColor === color.value && (
                      <span className="w-2 h-2 rounded-full bg-white block shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Size */}
            <div>
              <span className="text-xs font-semibold text-zinc-700 block mb-2">Hotspot Dimensions</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 'small', desc: '32px' },
                  { size: 'medium', desc: '40px' },
                  { size: 'large', desc: '48px' },
                ].map((s) => (
                  <button
                    key={s.size}
                    onClick={() => updateSetting('buttonSize', s.size as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all capitalize ${
                      settings.buttonSize === s.size
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {s.size} <span className="opacity-60 text-[10px] block font-mono">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  Idle Fluid Opacity
                </span>
                <span className="text-xs font-mono font-semibold text-zinc-900">{settings.buttonOpacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={settings.buttonOpacity}
                onChange={(e) => updateSetting('buttonOpacity', parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-zinc-400 mt-1">Dims automatically to prevent obstruction during screen focus. Amplifies to 100% on hover.</p>
            </div>
          </div>
        )}
      </div>

      {/* Domain default rules */}
      <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
        <div>
          <span className="text-xs font-semibold text-zinc-900 block mb-1">Global Load State Preferences</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Auto Enter Fullscreen</label>
            <p className="text-[10px] text-zinc-500">Initiate screen stretch on immediate url connection load</p>
          </div>
          <button
            onClick={() => updateSetting('autoFullscreenOnLoad', !settings.autoFullscreenOnLoad)}
            className="focus:outline-none transition-colors"
          >
            {settings.autoFullscreenOnLoad ? (
              <ToggleRight className="w-10 h-10 text-indigo-600 fill-indigo-50" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-200" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Remember Site Preferences</label>
            <p className="text-[10px] text-zinc-500">Enable/disable button state separately per webpage</p>
          </div>
          <button
            onClick={() => updateSetting('rememberDomainSettings', !settings.rememberDomainSettings)}
            className="focus:outline-none transition-colors"
          >
            {settings.rememberDomainSettings ? (
              <ToggleRight className="w-10 h-10 text-indigo-600 fill-indigo-50" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-200" />
            )}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut & Pop Theme */}
      <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
        <div>
          <span className="text-xs font-semibold text-zinc-900 block">Preferences & Popup Panel Design</span>
        </div>

        {/* Keyboard shortcut */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5 mb-1.5">
            <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
            Default Keyboard Shortcut
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Ctrl+Shift+F', value: 'Ctrl+Shift+F' },
              { label: 'Ctrl+Shift+A', value: 'Ctrl+Shift+A' },
              { label: 'Alt+Shift+F', value: 'Alt+Shift+F' },
              { label: 'Ctrl+Shift+E', value: 'Ctrl+Shift+E' },
            ].map((shortcut) => (
              <button
                key={shortcut.value}
                onClick={() => updateSetting('keyboardShortcut', shortcut.value)}
                className={`py-1.5 px-2 text-xs font-mono font-medium rounded-lg border text-center transition-all ${
                  settings.keyboardShortcut === shortcut.value
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>

        {/* Popup theme preference default */}
        <div>
          <span className="text-xs font-semibold text-zinc-700 block mb-2">Extension Popup Theme</span>
          <div className="flex gap-2">
            <button
              onClick={() => updateSetting('popupTheme', 'light')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-semibold transition-all ${
                settings.popupTheme === 'light'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Sun className="w-4 h-4" />
              Light Theme
            </button>
            <button
              onClick={() => updateSetting('popupTheme', 'dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-semibold transition-all ${
                settings.popupTheme === 'dark'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Moon className="w-4 h-4" />
              Dark Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
