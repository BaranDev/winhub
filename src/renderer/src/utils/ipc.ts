import { SearchResult, SearchResponse, PackageSource } from '../types';

// renderer ipc helpers

// search via backend
export async function searchApp(query: string, page: number = 0, limit: number = 20, sources: PackageSource[] = ['winget']): Promise<SearchResponse> {
  try {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    if (!query || query.trim().length === 0) {
      return { results: [], total: 0 };
    }

    const response = await window.electronAPI.searchApp(query.trim(), page, limit, sources);
    return response || { results: [], total: 0 };
  } catch (error) {
    console.error('IPC searchApp error:', error);
    throw new Error('Failed to search for applications');
  }
}

// system copy
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    if (!text || typeof text !== 'string') {
      return false;
    }

    const success = await window.electronAPI.copyToClipboard(text);
    return success;
  } catch (error) {
    console.error('IPC copyToClipboard error:', error);
    return false;
  }
}

// build command via backend
export async function generateWingetCommand(packageId: string, version?: string): Promise<string> {
  try {
    if (!window.electronAPI || !window.electronAPI.generateWingetCommand) {
      throw new Error('Electron API not available');
    }

    if (!packageId || packageId.trim().length === 0) {
      throw new Error('Package ID is required');
    }

    const command = await window.electronAPI.generateWingetCommand(packageId.trim(), version);
    return command;
  } catch (error) {
    console.error('IPC generateWingetCommand error:', error);
    throw error;
  }
}

// run winget via backend
export async function executeWingetInstall(command: string): Promise<{success: boolean; message: string; needsElevation?: boolean}> {
  try {
    if (!window.electronAPI || !window.electronAPI.executeWingetInstall) {
      throw new Error('Electron API not available');
    }

    if (!command || command.trim().length === 0) {
      return { success: false, message: 'Invalid command provided' };
    }

    const result = await window.electronAPI.executeWingetInstall(command.trim());
    return result;
  } catch (error) {
    console.error('IPC executeWingetInstall error:', error);
    return { success: false, message: 'Failed to execute installation command' };
  }
}

// check api state
export function isElectronAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined' &&
         typeof window.electronAPI.searchApp === 'function' &&
         typeof window.electronAPI.copyToClipboard === 'function';
}

// validate query
export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== 'string') {
    return false;
  }

  const trimmed = query.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

// clean query
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // remove tags/extra space
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100); // Limit length
}

// open web link
export function openExternalURL(url: string): void {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided to openExternalURL');
    return;
  }

  try {
    // main process handles this
    // fallback if dev
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Failed to open external URL:', error);
  }
}

// format error for ui
export function formatErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  if (error instanceof Error) {
    // user friendly errors
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to search services. Please check your internet connection.';
    }
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'Search request timed out. Please try again.';
    }
    
    if (error.message.includes('Electron API not available')) {
      return 'Application services are not available. Please restart the app.';
    }

    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

// debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
