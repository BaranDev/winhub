import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  /**
   * Search for applications using various services
   * @param query - The search query string
   * @param page - The page number (0-based)
   * @param limit - Number of results per page
   * @returns Promise with search results
   */
  searchApp: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const result = await ipcRenderer.invoke('search-app', query, page, limit);
      return result;
    } catch (error) {
      console.error('Search IPC error:', error);
      throw error;
    }
  },

  /**
   * Copy text to system clipboard
   * @param text - The text to copy
   * @returns Promise<boolean> - Success status
   */
  copyToClipboard: async (text: string) => {
    try {
      const result = await ipcRenderer.invoke('copy-to-clipboard', text);
      return result;
    } catch (error) {
      console.error('Clipboard IPC error:', error);
      return false;
    }
  },

  /**
   * Execute a winget install command
   * @param command - The winget command to execute
   * @returns Promise with installation result
   */
  executeWingetInstall: async (command: string) => {
    try {
      const result = await ipcRenderer.invoke('execute-winget-install', command);
      return result;
    } catch (error) {
      console.error('WinGet install IPC error:', error);
      return { success: false, message: 'Failed to execute installation command' };
    }
  },

  /**
   * Export installed applications list
   * @returns Promise with export data
   */
  exportInstalledApps: async () => {
    try {
      const result = await ipcRenderer.invoke('export-installed-apps');
      return result;
    } catch (error) {
      console.error('Export apps IPC error:', error);
      return { success: false, message: 'Failed to export installed apps' };
    }
  },

  /**
   * Save export data to file
   * @param exportData - The export data to save
   * @returns Promise with save result
   */
  saveExportFile: async (exportData: any) => {
    try {
      const result = await ipcRenderer.invoke('save-export-file', exportData);
      return result;
    } catch (error) {
      console.error('Save export IPC error:', error);
      return { success: false, message: 'Failed to save export file' };
    }
  },

  /**
   * Load import file
   * @returns Promise with import data
   */
  loadImportFile: async () => {
    try {
      const result = await ipcRenderer.invoke('load-import-file');
      return result;
    } catch (error) {
      console.error('Load import IPC error:', error);
      return { success: false, message: 'Failed to load import file' };
    }
  },

  /**
   * Execute bulk install from import
   * @param wingetCommand - The bulk winget command to execute
   * @returns Promise with installation result
   */
  executeBulkInstall: async (wingetCommand: string) => {
    try {
      const result = await ipcRenderer.invoke('execute-bulk-install', wingetCommand);
      return result;
    } catch (error) {
      console.error('Bulk install IPC error:', error);
      return { success: false, message: 'Failed to execute bulk installation' };
    }
  },

  /**
   * Check if WinGet is available on the system
   * @returns Promise with availability status
   */
  checkWingetAvailability: async () => {
    try {
      const result = await ipcRenderer.invoke('check-winget-availability');
      return result;
    } catch (error) {
      console.error('WinGet availability check IPC error:', error);
      return { available: false, message: 'Failed to check WinGet availability' };
    }
  },

  /**
   * Install WinGet using PowerShell
   * @returns Promise with installation result
   */
  installWinget: async () => {
    try {
      const result = await ipcRenderer.invoke('install-winget');
      return result;
    } catch (error) {
      console.error('WinGet installation IPC error:', error);
      return { success: false, message: 'Failed to install WinGet' };
    }
  },

  /**
   * Generate a winget command for a specific package and version
   * @param packageId - The package ID
   * @param version - Optional version to install
   * @returns Promise with the winget command string
   */
  generateWingetCommand: async (packageId: string, version?: string) => {
    try {
      const result = await ipcRenderer.invoke('generate-winget-command', packageId, version);
      return result;
    } catch (error) {
      console.error('Generate WinGet command IPC error:', error);
      return '';
    }
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Context bridge error:', error);
  }
} else {
  // @ts-ignore (define in dts file)
  (window as any).electronAPI = electronAPI;
}

// Add event listeners for window events that might be useful
contextBridge.exposeInMainWorld('windowEvents', {
  onDOMReady: (callback: () => void) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },
  
  onError: (callback: (error: ErrorEvent) => void) => {
    window.addEventListener('error', callback);
  },
  
  onUnhandledRejection: (callback: (event: PromiseRejectionEvent) => void) => {
    window.addEventListener('unhandledrejection', callback);
  }
});

// Expose version info
try {
  contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    app: () => ipcRenderer.invoke('get-app-version')
  });
} catch (error) {
  console.error('Failed to expose versions:', error);
}
