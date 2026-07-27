import { ExtensionSettings } from '../types';

export function getManifestCode(settings: ExtensionSettings): string {
  const shortcutKeys = settings.keyboardShortcut.split('+');
  let defaultKey = 'Ctrl+Shift+F';
  let macKey = 'Command+Shift+F';
  
  if (shortcutKeys.includes('Ctrl') || shortcutKeys.includes('Cmd')) {
    const mainKey = shortcutKeys[shortcutKeys.length - 1];
    defaultKey = `Ctrl+Shift+${mainKey}`;
    macKey = `Command+Shift+${mainKey}`;
  }

  return `{
  "manifest_version": 3,
  "name": "Any Full Screen",
  "version": "1.1.0",
  "description": "Transform any website into a distraction-free fullscreen web app with a single click.",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ],
      "css": [
        "styles.css"
      ],
      "run_at": "document_end"
    }
  ],
  "commands": {
    "toggle-fullscreen": {
      "suggested_key": {
        "default": "${defaultKey}",
        "mac": "${macKey}"
      },
      "description": "Toggle fullscreen mode for current page"
    },
    "open-standalone-window": {
      "suggested_key": {
        "default": "Alt+Shift+S",
        "mac": "Alt+Shift+S"
      },
      "description": "Open current page in a standalone popup window"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`;
}

export function getBackgroundCode(): string {
  return `/**
 * Any Full Screen - Background Service Worker
 * Manages native keyboards, commands, and standalone app-window creation.
 */

// Listen for global command triggers
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-fullscreen") {
    triggerActiveTabFullscreen();
  } else if (command === "open-standalone-window") {
    triggerActiveTabStandalone();
  }
});

// Broadcast full-screen switch to active tab
function triggerActiveTabFullscreen() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleFullscreen" });
    }
  });
}

// Clone active tab into a distraction-free, app-like Standalone Window
function triggerActiveTabStandalone() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) {
      chrome.windows.create({
        url: activeTab.url,
        type: "popup",
        state: "maximized"
      });
    }
  });
}

// Setup service worker messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openStandalone") {
    chrome.windows.create({
      url: message.url,
      type: "popup",
      state: "maximized"
    });
    sendResponse({ success: true });
  }
});
`;
}

export function getContentJsCode(settings: ExtensionSettings): string {
  // Convert button size labels to pixels
  let sizePx = 40;
  if (settings.buttonSize === 'small') sizePx = 32;
  if (settings.buttonSize === 'large') sizePx = 48;

  // Resolve positions
  let posStyles = { bottom: '20px', right: '20px', top: 'auto', left: 'auto' };
  if (settings.buttonPosition === 'bottom-left') {
    posStyles = { bottom: '20px', left: '20px', top: 'auto', right: 'auto' };
  } else if (settings.buttonPosition === 'top-right') {
    posStyles = { top: '20px', right: '20px', bottom: 'auto', left: 'auto' };
  } else if (settings.buttonPosition === 'top-left') {
    posStyles = { top: '20px', left: '20px', bottom: 'auto', right: 'auto' };
  }

  return `/**
 * Any Full Screen - Content Script
 * Injects floating button, processes triggers, handles keystrokes and session behaviors.
 */

(function () {
  const domain = window.location.hostname;
  let state = {
    enabled: ${settings.floatingButtonEnabled},
    autoFullscreen: ${settings.autoFullscreenOnLoad},
    rememberSettings: ${settings.rememberDomainSettings},
    buttonPosition: "${settings.buttonPosition}",
    buttonSize: ${sizePx},
    buttonColor: "${settings.buttonColor}",
    buttonOpacity: ${settings.buttonOpacity / 100}
  };

  let floatBtn = null;
  let exitTooltip = null;

  // Initialize and load site-specific overrides
  function initialize() {
    chrome.storage.local.get(["globalSettings", domain], (result) => {
      const globalConfig = result.globalSettings || {};
      const domainConfig = result[domain] || {};

      // Merge defaults, global preferences, and domain-specific settings
      state.enabled = domainConfig.floatingButtonEnabled !== undefined 
        ? domainConfig.floatingButtonEnabled 
        : (globalConfig.floatingButtonEnabled !== undefined ? globalConfig.floatingButtonEnabled : state.enabled);
        
      state.autoFullscreen = domainConfig.autoFullscreenOnLoad !== undefined 
        ? domainConfig.autoFullscreenOnLoad 
        : (globalConfig.autoFullscreenOnLoad !== undefined ? globalConfig.autoFullscreenOnLoad : state.autoFullscreen);

      state.buttonPosition = globalConfig.buttonPosition || state.buttonPosition;
      state.buttonSize = globalConfig.buttonSize === 'small' ? 32 : (globalConfig.buttonSize === 'large' ? 48 : 40);
      state.buttonColor = globalConfig.buttonColor || state.buttonColor;
      state.buttonOpacity = (globalConfig.buttonOpacity !== undefined ? globalConfig.buttonOpacity : ${settings.buttonOpacity}) / 100;

      // Create buttons
      updateFloatingButtonVisibility();
      setupFullscreenListeners();
      setupKeyboardListeners();

      // Execute auto-fullscreen if enabled (requires interaction on first load depending on browser rules)
      if (state.autoFullscreen) {
        // We attempt auto fullscreen. Some browsers block immediate launch without gesture,
        // so we also bind a one-time mouseover/click listener to capture active interaction.
        const enterAuto = () => {
          if (!document.fullscreenElement) {
            requestFullscreenSafe();
          }
          document.removeEventListener("click", enterAuto);
          document.removeEventListener("keydown", enterAuto);
        };
        document.addEventListener("click", enterAuto);
        document.addEventListener("keydown", enterAuto);
      }
    });
  }

  // Handle Fullscreen Requests safely with user compatibility checks
  function requestFullscreenSafe() {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen(); // Safari
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen(); // IE/Edge
      }
    } catch (e) {
      console.warn("Fullscreen request blocked or not supported on this view:", e);
    }
  }

  function exitFullscreenSafe() {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen exit failed:", e);
    }
  }

  // Toggle Action
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      exitFullscreenSafe();
    } else {
      requestFullscreenSafe();
    }
  }

  // Show or clean up floating switch
  function updateFloatingButtonVisibility() {
    if (state.enabled) {
      if (!floatBtn) {
        createFloatingButton();
      } else {
        styleButton(floatBtn);
      }
    } else {
      if (floatBtn) {
        floatBtn.remove();
        floatBtn = null;
      }
    }
  }

  // Instantiate standard HTML element injection
  function createFloatingButton() {
    if (document.getElementById("any-fullscreen-float-trigger")) return;

    floatBtn = document.createElement("div");
    floatBtn.id = "any-fullscreen-float-trigger";
    floatBtn.title = "Click to Toggle Full Screen (Double-click to hide temporarily)";
    
    // SVG icon pattern
    floatBtn.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 3h6v6"></path>
      <path d="M9 21H3v-6"></path>
      <path d="M21 3l-7 7"></path>
      <path d="M3 21l7-7"></path>
    </svg>\`;

    styleButton(floatBtn);

    // Click handler with click/double-click dispatch
    let clickTimeout;
    floatBtn.addEventListener("click", () => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        toggleFullscreen();
      }, 250);
    });

    floatBtn.addEventListener("dblclick", () => {
      clearTimeout(clickTimeout);
      // Double click hides the button for the duration of this page session
      floatBtn.style.transform = "scale(0)";
      setTimeout(() => {
        if (floatBtn) floatBtn.remove();
        floatBtn = null;
      }, 300);
    });

    document.body.appendChild(floatBtn);
  }

  // Apply visual specifications
  function styleButton(btn) {
    btn.style.position = "fixed";
    btn.style.zIndex = "999999";
    btn.style.cursor = "pointer";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.backgroundColor = state.buttonColor;
    btn.style.color = "#ffffff";
    btn.style.borderRadius = "50%";
    btn.style.width = state.buttonSize + "px";
    btn.style.height = state.buttonSize + "px";
    btn.style.opacity = state.buttonOpacity;
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
    btn.style.transition = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
    btn.style.userSelect = "none";

    // Set layout based on custom settings
    const offset = "20px";
    btn.style.top = "auto";
    btn.style.bottom = "auto";
    btn.style.left = "auto";
    btn.style.right = "auto";

    if (state.buttonPosition.includes("right")) btn.style.right = offset;
    else btn.style.left = offset;

    if (state.buttonPosition.includes("top")) btn.style.top = offset;
    else btn.style.bottom = offset;

    // Smooth Interactive Transitions
    btn.addEventListener("mouseenter", () => {
      btn.style.opacity = "1";
      btn.style.transform = "scale(1.15) translateY(-2px)";
      btn.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.opacity = state.buttonOpacity;
      btn.style.transform = "scale(1) translateY(0)";
      btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
    });
  }

  // Manage custom full-screen indicators and exits
  function setupFullscreenListeners() {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      
      // Toggle custom exit indicator or styling
      if (isFullscreen) {
        if (floatBtn) {
          floatBtn.style.opacity = "0.15"; // Dim when full screen to prevent media occlusion
        }
        createExitTooltip();
      } else {
        if (floatBtn) {
          floatBtn.style.opacity = state.buttonOpacity;
        }
        removeExitTooltip();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  }

  // Keyboard binding for customizable toggle
  function setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      // Catch Ctrl+Shift+F default or Custom matches (F11 is natively handled but we override gracefully)
      const shortcut = "${settings.keyboardShortcut.toUpperCase()}";
      
      const requiresCtrl = shortcut.includes("CTRL");
      const requiresShift = shortcut.includes("SHIFT");
      const requiresAlt = shortcut.includes("ALT");
      const splitKeys = shortcut.split("+");
      const mainKey = splitKeys[splitKeys.length - 1];

      const matchesCtrl = requiresCtrl ? (e.ctrlKey || e.metaKey) : true;
      const matchesShift = requiresShift ? e.shiftKey : true;
      const matchesAlt = requiresAlt ? e.altKey : true;
      const matchesMainKey = e.key.toUpperCase() === mainKey || e.code.toUpperCase() === "KEY" + mainKey;

      if (matchesCtrl && matchesShift && matchesAlt && matchesMainKey) {
        e.preventDefault();
        toggleFullscreen();
      }
    });
  }

  // Inject a small, ultra-clean exit banner that is revealed when mouse hover at top
  function createExitTooltip() {
    if (document.getElementById("any-fullscreen-exit-tooltip")) return;

    exitTooltip = document.createElement("div");
    exitTooltip.id = "any-fullscreen-exit-tooltip";
    exitTooltip.innerHTML = \`<div class="any-exit-text">Fullscreen Mode Active. Click to Exit</div>\`;
    
    // Style directly to shield from domain CSS pollution
    Object.assign(exitTooltip.style, {
      position: "fixed",
      top: "-50px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "9999999",
      background: "rgba(15, 23, 42, 0.95)",
      color: "#f8fafc",
      padding: "8px 18px",
      borderRadius: "0 0 8px 8px",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "12px",
      fontWeight: "500",
      letterSpacing: "0.5px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderTop: "none"
    });

    // Detect mouse move in upper bounds to bring down the prompt
    const handleMouseMove = (e) => {
      if (e.clientY <= 15) {
        exitTooltip.style.top = "0";
      } else if (e.clientY > 50) {
        exitTooltip.style.top = "-50px";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    exitTooltip.addEventListener("click", () => {
      exitFullscreenSafe();
    });

    document.body.appendChild(exitTooltip);
    exitTooltip._mouseMoveHandler = handleMouseMove;
  }

  function removeExitTooltip() {
    const tooltip = document.getElementById("any-fullscreen-exit-tooltip");
    if (tooltip) {
      if (tooltip._mouseMoveHandler) {
        document.removeEventListener("mousemove", tooltip._mouseMoveHandler);
      }
      tooltip.remove();
    }
  }

  // Listen to chrome messages (from popup, coordinates options changes)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleFullscreen") {
      toggleFullscreen();
      sendResponse({ isFullscreen: !!document.fullscreenElement });
    } else if (message.action === "updateSettings") {
      // Hot reload settings without manual page refresh
      const { settings } = message;
      if (settings.floatingButtonEnabled !== undefined) state.enabled = settings.floatingButtonEnabled;
      if (settings.autoFullscreenOnLoad !== undefined) state.autoFullscreen = settings.autoFullscreenOnLoad;
      updateFloatingButtonVisibility();
      sendResponse({ status: "updated" });
    }
  });

  // Execute on boot
  initialize();
})();
`;
}

export function getPopupHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Any Full Screen Config</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="extension-container">
    <!-- Header -->
    <header class="header">
      <div class="logo-area">
        <div class="logo-circle">
          <svg class="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6"></path>
            <path d="M9 21H3v-6"></path>
            <path d="M21 3l-7 7"></path>
            <path d="M3 21l7-7"></path>
          </svg>
        </div>
        <div class="title-meta">
          <h1 class="main-title">Any Full Screen</h1>
          <p class="sub-title">Distraction-Free Workspace</p>
        </div>
      </div>
      <button class="theme-toggle-btn" id="theme-toggle" title="Toggle Popup Theme">
        <svg class="sun" viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      </button>
    </header>

    <!-- Main Workspace -->
    <main class="main-content">
      <!-- Quick Action Fullscreen Toggle -->
      <section class="quick-toggle-section">
        <button class="action-btn-main" id="quick-fullscreen-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
          </svg>
          <span>Toggle Fullscreen Now</span>
        </button>
      </section>

      <!-- Active Website Coordinates Section -->
      <section class="domain-card">
        <div class="card-title-row">
          <span class="badge" id="website-active-badge">Active Website</span>
          <span class="url-label" id="current-domain-txt">loading...</span>
        </div>

        <div class="settings-list">
          <!-- Switch 1 -->
          <div class="setting-row">
            <div class="setting-info">
              <label class="setting-name">Floating Button</label>
              <span class="setting-desc">Inject circular hot-button</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="site-floating-btn-toggle" checked>
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Switch 2 -->
          <div class="setting-row">
            <div class="setting-info">
              <label class="setting-name">Auto Fullscreen</label>
              <span class="setting-desc">Enter automatically on join</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="site-auto-fullscreen-toggle">
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <!-- Standalone Mode Creator Button -->
        <button class="standalone-btn" id="launch-standalone-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6"></path>
            <path d="M10 14L21 3"></path>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          </svg>
          Open as Standalone App Window
        </button>
      </section>

      <!-- Pinned & Favorites list -->
      <section class="favorites-section">
        <h2 class="section-title">Pinned Websites</h2>
        <div class="favorites-list" id="favorites-list-container">
          <!-- Dynamically populated or empty state -->
          <p class="empty-state" id="favorites-empty">No workspace pins yet. Click Pin Site to save favorites here.</p>
        </div>
        <button class="pin-site-btn" id="pin-current-domain-btn">
          📍 Pin Current Website
        </button>
      </section>
    </main>

    <!-- Footer Settings & Keys -->
    <footer class="footer">
      <div class="shortcut-info">
        <span class="key-label">Shortcut:</span>
        <kbd class="kbd-element" id="shortcut-display">Ctrl+Shift+F</kbd>
      </div>
      <div class="links-row">
        <a href="#" id="configure-shortcut-link" class="footer-link">Configure Keys</a>
        <span class="separator">•</span>
        <span class="status-indicator">v1.1 Active</span>
      </div>
    </footer>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;
}

export function getPopupJs(): string {
  return `/**
 * Any Full Screen - Extension Popup Logic
 * Controls parameters per active domain, enables standalone mode, and manages favorite anchors.
 */

document.addEventListener("DOMContentLoaded", () => {
  let activeTab = null;
  let activeDomain = "";
  
  // Cache DOM nodes
  const currentDomainText = document.getElementById("current-domain-txt");
  const quickFullscreenBtn = document.getElementById("quick-fullscreen-btn");
  const siteFloatToggle = document.getElementById("site-floating-btn-toggle");
  const siteAutoToggle = document.getElementById("site-auto-fullscreen-toggle");
  const launchStandaloneBtn = document.getElementById("launch-standalone-btn");
  const pinsContainer = document.getElementById("favorites-list-container");
  const pinCurrentBtn = document.getElementById("pin-current-domain-btn");
  const emptyStateText = document.getElementById("favorites-empty");
  const shortcutDisplay = document.getElementById("shortcut-display");
  const configureShortcuts = document.getElementById("configure-shortcut-link");
  const themeToggle = document.getElementById("theme-toggle");

  // Load and configure theme
  chrome.storage.local.get(["popupTheme", "pinnedDomains"], (result) => {
    if (result.popupTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
    renderPins(result.pinnedDomains || []);
  });

  // Toggle local extension panel themes
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    chrome.storage.local.set({ popupTheme: isDark ? "dark" : "light" });
  });

  // Retrieve current active tab parameters
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      activeTab = tabs[0];
      if (activeTab.url) {
        try {
          const urlObj = new URL(activeTab.url);
          activeDomain = urlObj.hostname;
          currentDomainText.textContent = activeDomain;
          
          if (activeTab.url.startsWith("chrome://") || activeTab.url.startsWith("edge://")) {
            // Disabled on system pages
            currentDomainText.textContent = "System Page Locked";
            disableActionButtons();
            return;
          }

          // Read options specific to this domain or standard settings
          loadDomainSettings();
        } catch (err) {
          currentDomainText.textContent = "Web Browser UI";
          disableActionButtons();
        }
      }
    }
  });

  // Action: Fast Fullscreen message dispatch
  quickFullscreenBtn.addEventListener("click", () => {
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: "toggleFullscreen" });
    }
  });

  // Action: Launch Standalone Window
  launchStandaloneBtn.addEventListener("click", () => {
    if (activeTab && activeTab.url) {
      chrome.runtime.sendMessage({ action: "openStandalone", url: activeTab.url });
    }
  });

  // Load configuration details
  function loadDomainSettings() {
    chrome.storage.local.get(["globalSettings", activeDomain], (result) => {
      const globalConfig = result.globalSettings || {};
      const domainConfig = result[activeDomain] || {};

      // Sync checkbox state
      siteFloatToggle.checked = domainConfig.floatingButtonEnabled !== undefined 
        ? domainConfig.floatingButtonEnabled 
        : (globalConfig.floatingButtonEnabled !== undefined ? globalConfig.floatingButtonEnabled : true);

      siteAutoToggle.checked = domainConfig.autoFullscreenOnLoad !== undefined 
        ? domainConfig.autoFullscreenOnLoad 
        : (globalConfig.autoFullscreenOnLoad !== undefined ? globalConfig.autoFullscreenOnLoad : false);
    });
  }

  // Update Settings in local storage and notify content scripts
  function saveSettings() {
    if (!activeDomain) return;

    const payload = {
      floatingButtonEnabled: siteFloatToggle.checked,
      autoFullscreenOnLoad: siteAutoToggle.checked
    };

    const storageObj = {};
    storageObj[activeDomain] = payload;

    chrome.storage.local.set(storageObj, () => {
      // Notify current script of dynamic changes
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { 
          action: "updateSettings", 
          settings: payload 
        });
      }
    });
  }

  siteFloatToggle.addEventListener("change", saveSettings);
  siteAutoToggle.addEventListener("change", saveSettings);

  // Link to shortcuts panel in Chrome
  configureShortcuts.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });

  // Pin Site handler
  pinCurrentBtn.addEventListener("click", () => {
    if (!activeDomain || activeDomain === "System Page Locked") return;

    chrome.storage.local.get(["pinnedDomains"], (result) => {
      const pins = result.pinnedDomains || [];
      if (!pins.some(p => p.domain === activeDomain)) {
        pins.push({
          domain: activeDomain,
          url: activeTab.url,
          pinnedAt: new Date().toLocaleDateString()
        });
        chrome.storage.local.set({ pinnedDomains: pins }, () => {
          renderPins(pins);
        });
      }
    });
  });

  // Render Pin rows
  function renderPins(pins) {
    pinsContainer.innerHTML = "";
    
    if (pins.length === 0) {
      if (emptyStateText) pinsContainer.appendChild(emptyStateText);
      return;
    }

    pins.forEach((pin, index) => {
      const row = document.createElement("div");
      row.className = "favorite-item";
      row.innerHTML = \`
        <div class="favorite-info" title="\${pin.url}">
          <span class="fav-domain">\${pin.domain}</span>
          <span class="fav-date">\${pin.pinnedAt}</span>
        </div>
        <div class="fav-actions">
          <button class="fav-go-btn" data-url="\${pin.url}" title="Launch Standalone App">🚀</button>
          <button class="fav-del-btn" data-index="\${index}" title="Remove Pin">🗑️</button>
        </div>
      \`;
      pinsContainer.appendChild(row);
    });

    // Attach click events to pins list
    pinsContainer.querySelectorAll(".fav-go-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const destUrl = e.currentTarget.getAttribute("data-url");
        chrome.runtime.sendMessage({ action: "openStandalone", url: destUrl });
      });
    });

    pinsContainer.querySelectorAll(".fav-del-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        const updatedPins = [...pins];
        updatedPins.splice(idx, 1);
        chrome.storage.local.set({ pinnedDomains: updatedPins }, () => {
          renderPins(updatedPins);
        });
      });
    });
  }

  function disableActionButtons() {
    siteFloatToggle.disabled = true;
    siteAutoToggle.disabled = true;
    launchStandaloneBtn.disabled = true;
    pinCurrentBtn.disabled = true;
    quickFullscreenBtn.style.opacity = "0.5";
    quickFullscreenBtn.style.pointerEvents = "none";
  }
});
`;
}

export function getPopupCssCode(): string {
  return `/**
 * Any Full Screen - Extension Popup Styles
 * Responsive, beautiful layout utilizing native details and system-ui vars
 */

:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --accent: #4f46e5;
  --accent-light: #e0e7ff;
  --accent-hover: #4338ca;
  --border: #e2e8f0;
  --card-bg: #ffffff;
  --card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --switch-track: #ccc;
  --kbd-bg: #e2e8f0;
}

body.dark-mode {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --accent: #6366f1;
  --accent-light: #1e1b4b;
  --accent-hover: #818cf8;
  --border: #334155;
  --card-bg: #1e293b;
  --card-shadow: 0 4px 12px rgba(0,0,0,0.5);
  --switch-track: #475569;
  --kbd-bg: #334155;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  width: 320px;
  font-family: var(--font-family);
  background-color: var(--bg-primary);
  color: var(--text-main);
  transition: background-color 0.25s, color 0.25s;
  overflow-x: hidden;
}

.extension-container {
  display: flex;
  flex-direction: column;
  min-height: 480px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-circle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.logo-svg {
  width: 16px;
  height: 16px;
}

.title-meta {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.sub-title {
  font-size: 10px;
  color: var(--text-muted);
}

.theme-toggle-btn {
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: var(--text-muted);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.theme-toggle-btn:hover {
  background-color: var(--border);
  color: var(--text-main);
}

.theme-toggle-btn svg {
  width: 15px;
  height: 15px;
}

/* Main Content */
.main-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-toggle-section {
  width: 100%;
}

.action-btn-main {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.action-btn-main:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(79, 70, 229, 0.3);
}

.domain-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  background-color: var(--accent-light);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
}

.url-label {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-muted);
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-size: 12px;
  font-weight: 600;
}

.setting-desc {
  font-size: 10px;
  color: var(--text-muted);
}

/* Switches */
.switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--switch-track);
  transition: .2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .2s;
}

input:checked + .slider {
  background-color: var(--accent);
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.standalone-btn {
  background: none;
  border: 1px dashed var(--accent);
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.15s;
}

.standalone-btn:hover {
  background-color: var(--accent-light);
}

/* Favorites Section */
.favorites-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 110px;
  overflow-y: auto;
}

.empty-state {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  padding: 10px;
  border: 1px dashed var(--border);
  border-radius: 6px;
}

.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.favorite-info {
  display: flex;
  flex-direction: column;
  max-width: 180px;
  overflow: hidden;
}

.fav-domain {
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-date {
  font-size: 8px;
  color: var(--text-muted);
}

.fav-actions {
  display: flex;
  gap: 4px;
}

.fav-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.15s;
}

.fav-actions button:hover {
  background-color: var(--border);
}

.pin-site-btn {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-main);
  border-radius: 6px;
  padding: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.pin-site-btn:hover {
  background-color: var(--border);
}

/* Footer style */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border);
  gap: 8px;
}

.shortcut-info {
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.key-label {
  color: var(--text-muted);
}

.kbd-element {
  background-color: var(--kbd-bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: monospace;
}

.links-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.footer-link {
  color: var(--accent);
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.separator {
  color: var(--text-muted);
}

.status-indicator {
  color: var(--text-muted);
}
`;
}

export function getReadmeCode(): string {
  return `# Any Full Screen - Chrome Extension (Manifest V3)

Transform any website into a distraction-free, native fullscreen experience with a single click.

## Features Included
1. **Dynamic Floating Button**: Injects a customizable floating button in the corner of every webpage. Click once to toggle full screen; double click to temporarily hide.
2. **Auto-Fullscreen Mode**: Configures specific sites to launch straight into fullscreen context.
3. **Keyboard Shortcuts**: Supports \`Ctrl+Shift+F\` (Mac: \`Command+Shift+F\`) coordinates to toggle full screen even without a button click.
4. **Standalone App Windows**: Clone websites into detached, standalone application containers (Popup windows) to feel exactly like native applications.
5. **Pins and Pinned Sites**: Store preferred workflow cards right in the layout popup panel.

## Installation Tutorial

Follow these steps to load the unpacked extension in Google Chrome or any Chromium-compatible browser (Edge, Brave, Opera, Vivaldi):

### 1. Prepare Folder
1. Download the complete prepared archive folder \`any_fullscreen_extension.zip\` from this dashboard.
2. Unzip/extract the folder somewhere stable on your system (e.g. your Documents or Developer folder).

### 2. Open Extension Settings
1. Open Google Chrome.
2. Navigate to the extensions manager by typing **\`chrome://extensions/\`** directly into the address URL bar.
3. Keep this settings page open.

### 3. Activating Developer Mode
1. In the top-right corner of the Extensions dashboard, find the toggle switch labeled **Developer Mode**.
2. Click to toggle this on. The window will reveal several new action headers like "Load unpacked", "Pack extension", and "Update".

### 4. Load the Extracted Folder
1. Click the **Load unpacked** button located in the top-left area.
2. A file selection dialogue will prompt.
3. Highlight and choose the extracted folder (the parent directory containing \`manifest.json\`, \`content.js\`, \`background.js\`, and the \`icons/\` directory).
4. Click **Select Folder** (Mac) or **Open** (Windows).

### 5. Pin and Explore!
1. The "Any Full Screen" card is now loaded into your system.
2. Click the puzzle-piece icon in your Chrome top action rail to reveal extensions list.
3. Click the pin symbol next to **Any Full Screen** to pin the logo.
4. Visit any website (like Wikipedia or YouTube) and observe the interactive circular floating action button. Click to immerse yourself in full screen!
`;
}
