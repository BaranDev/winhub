import { useState, useCallback } from 'react';
import { copyToClipboard as ipcCopyToClipboard } from '../utils/ipc';

interface UseClipboardReturn {
  isCopied: boolean;
  error: string | null;
  copyText: (text: string) => Promise<void>;
  reset: () => void;
}

// clipboard state helper
export function useClipboard(resetDelay: number = 2000): UseClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyText = useCallback(async (text: string): Promise<void> => {
    // clear state
    setError(null);
    setIsCopied(false);

    // check input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      setError('No text provided to copy');
      return;
    }

    try {
      const success = await ipcCopyToClipboard(text);
      
      if (success) {
        setIsCopied(true);
        
        // cleanup after delay
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

