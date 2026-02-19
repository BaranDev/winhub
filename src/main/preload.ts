import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, PackageSource } from '../shared/types';

// expose safe ipc calls to renderer
// keeps ipcrenderer hidden
const electronAPI: ElectronAPI = {
  // search apps via ipc
  searchApp: async (query: string, page: number = 0, limit: number = 20, sources: PackageSource[] = ['winget']) => {
    try {
      const result = await ipcRenderer.invoke('search-app', query, page, limit, sources);
      return result;
    } catch (error) {
      console.error('Search IPC error:', error);
      throw error;
    }
  },

  // copy to clipboard via ipc
  copyToClipboard: async (text: string) => {
    try {
      const result = await ipcRenderer.invoke('copy-to-clipboard', text);
      return result;
    } catch (error) {
      console.error('Clipboard IPC error:', error);
      return false;
    }
  },

  // exec winget install via ipc
  executeWingetInstall: async (command: string) => {
    try {
      const result = await ipcRenderer.invoke('execute-winget-install', command);
      return result;
    } catch (error) {
      console.error('WinGet install IPC error:', error);
      return { success: false, message: 'Failed to execute installation command' };
    }
  },

  // export app list via ipc
  exportInstalledApps: async () => {
    try {
      const result = await ipcRenderer.invoke('export-installed-apps');
      return result;
    } catch (error) {
      console.error('Export apps IPC error:', error);
      return { success: false, message: 'Failed to export installed apps' };
    }
  },

  // save export to file via ipc
  saveExportFile: async (exportData: any) => {
    try {
      const result = await ipcRenderer.invoke('save-export-file', exportData);
      return result;
    } catch (error) {
      console.error('Save export IPC error:', error);
      return { success: false, message: 'Failed to save export file' };
    }
  },

  // load import from file via ipc
  loadImportFile: async () => {
    try {
      const result = await ipcRenderer.invoke('load-import-file');
      return result;
    } catch (error) {
      console.error('Load import IPC error:', error);
      return { success: false, message: 'Failed to load import file' };
    }
  },

  // bulk install via ipc
  executeBulkInstall: async (wingetCommand: string) => {
    try {
      const result = await ipcRenderer.invoke('execute-bulk-install', wingetCommand);
      return result;
    } catch (error) {
      console.error('Bulk install IPC error:', error);
      return { success: false, message: 'Failed to execute bulk installation' };
    }
  },

  // check if winget exists via ipc
  checkWingetAvailability: async () => {
    try {
      const result = await ipcRenderer.invoke('check-winget-availability');
      return result;
    } catch (error) {
      console.error('WinGet availability check IPC error:', error);
      return { available: false, message: 'Failed to check WinGet availability' };
    }
  },

  // install winget helper via ipc
  installWinget: async () => {
    try {
      const result = await ipcRenderer.invoke('install-winget');
      return result;
    } catch (error) {
      console.error('WinGet installation IPC error:', error);
      return { success: false, message: 'Failed to install WinGet' };
    }
  },

  // generate winget command string via ipc
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

// bridge apis to window.electronapi
// handle potential isolation disable
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

// window event helpers
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

// expose versions
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
