import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchState, SearchResult, UseSearchReturn } from '../types';
import { searchApp, sanitizeSearchQuery, isValidSearchQuery, formatErrorMessage, debounce } from '../utils/ipc';

const INITIAL_STATE: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  loadingMore: false
};

const DEBOUNCE_DELAY = 800; // 800ms debounce for search input
const MIN_QUERY_LENGTH = 2; // Minimum characters before searching
const RESULTS_PER_PAGE = 24; // Results per page (API maximum)

/**
 * Custom hook for managing search state and operations
 * @returns UseSearchReturn
 */
export function useSearch(): UseSearchReturn {
  const [searchState, setSearchState] = useState<SearchState>(INITIAL_STATE);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>('');
  const currentPageRef = useRef<number>(0);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Performs the actual search operation
   */
  const performSearch = useCallback(async (query: string, isLoadMore: boolean = false): Promise<void> => {
    const sanitizedQuery = sanitizeSearchQuery(query);
    
    // Don't search if query is too short or invalid
    if (!isLoadMore && (!isValidSearchQuery(sanitizedQuery) || sanitizedQuery.length < MIN_QUERY_LENGTH)) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null,
        hasMore: true,
        currentPage: 0
      }));
      currentPageRef.current = 0;
      return;
    }

    // Don't search if query hasn't changed (unless loading more)
    if (!isLoadMore && sanitizedQuery === lastSearchQueryRef.current) {
      return;
    }

    if (!isLoadMore) {
      lastSearchQueryRef.current = sanitizedQuery;
      currentPageRef.current = 0;
    }

    const currentPage = isLoadMore ? currentPageRef.current + 1 : 0;
    currentPageRef.current = currentPage;

    setSearchState(prev => ({
      ...prev,
      loading: !isLoadMore,
      loadingMore: isLoadMore,
      error: null,
      query: sanitizedQuery,
      currentPage: currentPage,
      ...(isLoadMore ? {} : { results: [], hasMore: true })
    }));

    try {
      console.log(`Searching for: ${sanitizedQuery} (page: ${currentPage})`);
      const response = await searchApp(sanitizedQuery, currentPage, RESULTS_PER_PAGE);
      
      // Determine if there are more results available:
      // - If we get exactly 24 results, there might be more on the next page
      // - If we get fewer than 24 results, we've reached the end
      const hasMore = response.results.length === RESULTS_PER_PAGE;
      
      setSearchState(prev => ({
        ...prev,
        results: isLoadMore ? [...prev.results, ...response.results] : response.results,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: hasMore,
        total: response.total
      }));

      console.log(`Search completed: ${response.results?.length || 0} results found for page ${currentPage}, total: ${response.total}`);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = formatErrorMessage(error);
      
      setSearchState(prev => ({
        ...prev,
        results: isLoadMore ? prev.results : [],
        loading: false,
        loadingMore: false,
        error: errorMessage
      }));
    }
  }, []);

  // Debounced search function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce(performSearch, DEBOUNCE_DELAY),
    [performSearch]
  );

  /**
   * Initiates a search with the given query
   */
  const search = useCallback((query: string): void => {
    const sanitizedQuery = sanitizeSearchQuery(query);
    
    // Update query immediately for UI responsiveness
    setSearchState(prev => ({
      ...prev,
      query: sanitizedQuery
    }));

    // If query is empty, clear results immediately
    if (!sanitizedQuery || sanitizedQuery.length === 0) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null
      }));
      return;
    }

    // If query is too short, don't search but show loading state
    if (sanitizedQuery.length < MIN_QUERY_LENGTH) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null
      }));
      return;
    }

    // Start loading state immediately for better UX
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    // Perform debounced search
    debouncedSearch(sanitizedQuery);
  }, [debouncedSearch]);

  /**
   * Clears the search state and results
   */
  const clearSearch = useCallback((): void => {
    // Cancel any ongoing search
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    lastSearchQueryRef.current = '';
    currentPageRef.current = 0;
    
    setSearchState(INITIAL_STATE);
  }, []);

  /**
   * Retry the last search (useful for error recovery)
   */
  const retrySearch = useCallback((): void => {
    if (searchState.query) {
      performSearch(searchState.query);
    }
  }, [searchState.query, performSearch]);

  /**
   * Load more results for the current query
   */
  const loadMore = useCallback((): void => {
    if (searchState.query && searchState.hasMore && !searchState.loading && !searchState.loadingMore) {
      performSearch(searchState.query, true);
    }
  }, [searchState.query, searchState.hasMore, searchState.loading, searchState.loadingMore, performSearch]);

  return {
    searchState,
    search,
    loadMore,
    clearSearch
  };
}

/**
 * Hook for managing search history (optional enhancement)
 * @param maxHistoryItems - Maximum number of history items to keep
 * @returns Search history functions
 */
export function useSearchHistory(maxHistoryItems: number = 10) {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = useCallback((query: string): void => {
    if (!query || query.trim().length < MIN_QUERY_LENGTH) return;

    const sanitizedQuery = sanitizeSearchQuery(query);
    
    setHistory(prev => {
      // Remove existing entry if present
      const filtered = prev.filter(item => item !== sanitizedQuery);
      // Add to beginning and limit size
      return [sanitizedQuery, ...filtered].slice(0, maxHistoryItems);
    });
  }, [maxHistoryItems]);

  const clearHistory = useCallback((): void => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((query: string): void => {
    setHistory(prev => prev.filter(item => item !== query));
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
}

/**
 * Enhanced search hook with history and caching
 * @returns Enhanced search functionality
 */
export function useEnhancedSearch() {
  const search = useSearch();
  const history = useSearchHistory();
  const [searchCache, setSearchCache] = useState<Map<string, SearchResult[]>>(new Map());

  const searchWithHistory = useCallback((query: string): void => {
    search.search(query);
    
    if (query && query.trim().length >= MIN_QUERY_LENGTH) {
      history.addToHistory(query);
    }
  }, [search, history]);

  // Cache successful search results
  useEffect(() => {
    if (search.searchState.results.length > 0 && !search.searchState.loading && !search.searchState.error) {
      setSearchCache(prev => {
        const newCache = new Map(prev);
        newCache.set(search.searchState.query, search.searchState.results);
        
        // Limit cache size
        if (newCache.size > 20) {
          const firstKey = newCache.keys().next().value;
          if (firstKey) {
            newCache.delete(firstKey);
          }
        }
        
        return newCache;
      });
    }
  }, [search.searchState]);

  const getCachedResults = useCallback((query: string): SearchResult[] | null => {
    return searchCache.get(sanitizeSearchQuery(query)) || null;
  }, [searchCache]);

  return {
    ...search,
    search: searchWithHistory,
    history: history.history,
    clearHistory: history.clearHistory,
    getCachedResults
  };
}
