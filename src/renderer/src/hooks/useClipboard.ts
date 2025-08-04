import { useState, useCallback } from 'react';
import { copyToClipboard as ipcCopyToClipboard } from '../utils/ipc';

interface UseClipboardReturn {
  isCopied: boolean;
  error: string | null;
  copyText: (text: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for clipboard operations with feedback state
 * @param resetDelay - Time in milliseconds before resetting the copied state (default: 2000)
 * @returns UseClipboardReturn
 */
export function useClipboard(resetDelay: number = 2000): UseClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyText = useCallback(async (text: string): Promise<void> => {
    // Reset previous state
    setError(null);
    setIsCopied(false);

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      setError('No text provided to copy');
      return;
    }

    try {
      const success = await ipcCopyToClipboard(text);
      
      if (success) {
        setIsCopied(true);
        
        // Reset the copied state after delay
        setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
      } else {
        setError('Failed to copy to clipboard');
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
      setError(err instanceof Error ? err.message : 'Clipboard operation failed');
    }
  }, [resetDelay]);

  const reset = useCallback(() => {
    setIsCopied(false);
    setError(null);
  }, []);

  return {
    isCopied,
    error,
    copyText,
    reset
  };
}

/**
 * Hook specifically for copying WinGet commands with appropriate formatting
 * @returns UseClipboardReturn with enhanced command copying
 */
export function useWingetClipboard(): UseClipboardReturn {
  const clipboard = useClipboard(3000); // Longer delay for commands

  const copyWingetCommand = useCallback(async (command: string): Promise<void> => {
    if (!command || !command.trim().startsWith('winget')) {
      clipboard.copyText('Invalid WinGet command');
      return;
    }

    // Format the command nicely
    const formattedCommand = command.trim();
    await clipboard.copyText(formattedCommand);
  }, [clipboard]);

  return {
    ...clipboard,
    copyText: copyWingetCommand
  };
}

/**
 * Hook for copying URLs with validation
 * @returns UseClipboardReturn with URL validation
 */
export function useUrlClipboard(): UseClipboardReturn {
  const clipboard = useClipboard(2000);

  const copyUrl = useCallback(async (url: string): Promise<void> => {
    if (!url || typeof url !== 'string') {
      clipboard.reset();
      return;
    }

    try {
      // Basic URL validation
      new URL(url);
      await clipboard.copyText(url);
    } catch {
      clipboard.copyText(url); // Copy anyway, might be a local path
    }
  }, [clipboard]);

  return {
    ...clipboard,
    copyText: copyUrl
  };
}
