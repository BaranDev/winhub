// Re-export shared types
import type {
  SearchResult,
  SearchResponse,
  SearchEngineLink,
  WingetPackage,
  WingetVersion,
  WingetApiResponse,
  GoogleSearchItem,
  GoogleSearchResponse,
  ServiceError,
  ServiceResult,
  ElectronAPI
} from '../../../shared/types';

// Re-export for convenience
export type {
  SearchResult,
  SearchResponse,
  SearchEngineLink,
  WingetPackage,
  WingetVersion,
  WingetApiResponse,
  GoogleSearchItem,
  GoogleSearchResponse,
  ServiceError,
  ServiceResult,
  ElectronAPI
};

// Additional renderer-specific types
export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  loadingMore?: boolean;
  total?: number;
}

// Clipboard Hook Types
export interface ClipboardState {
  isCopied: boolean;
  error: string | null;
}

// Search Hook Types
export interface UseSearchReturn {
  searchState: SearchState;
  search: (query: string) => void;
  loadMore: () => void;
  clearSearch: () => void;
}

// Component Props Types
export interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  loading?: boolean;
  placeholder?: string;
}

export interface ResultsListProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  hasMore?: boolean;
  loadingMore?: boolean;
  onRetry?: () => void;
  onLoadMore?: () => void;
}

export interface ResultItemProps {
  result: SearchResult;
}

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

// Configuration Types
export interface AppConfig {
  wingetApiUrl: string;
  googleApiUrl: string;
  googleApiKey?: string;
  googleSearchEngineId?: string;
  searchDebounceMs: number;
  maxSearchResults: number;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface SearchCache {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, data: T, ttl?: number): void;
  clear(): void;
  delete(key: string): boolean;
}