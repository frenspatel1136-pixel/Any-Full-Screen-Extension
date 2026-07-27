export interface ExtensionSettings {
  floatingButtonEnabled: boolean;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonSize: 'small' | 'medium' | 'large';
  buttonColor: string;
  buttonOpacity: number;
  autoFullscreenOnLoad: boolean;
  rememberDomainSettings: boolean;
  standaloneShortcut: boolean;
  keyboardShortcut: string; // e.g. "Ctrl+Shift+F"
  popupTheme: 'light' | 'dark';
}

export interface Website {
  id: string;
  name: string;
  url: string;
  category: 'Writing' | 'Video' | 'Dashboard' | 'Editor';
  primaryColor: string;
  bgClass: string;
}

export interface PinnedDomain {
  domain: string;
  pinnedAt: string;
}
