import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchState, SearchResult, UseSearchReturn, PackageSource } from '../types';
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

const DEBOUNCE_DELAY = 800; // input debounce
const MIN_QUERY_LENGTH = 2; // min search length
const RESULTS_PER_PAGE = 24; // items per page

// hook to manage search state
export function useSearch(activeSources: PackageSource[] = ['winget']): UseSearchReturn {
  const [searchState, setSearchState] = useState<SearchState>(INITIAL_STATE);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>('');
  const currentPageRef = useRef<number>(0);
  const activeSourcesRef = useRef<PackageSource[]>(activeSources);
  activeSourcesRef.current = activeSources;

  // abort on unmount
  useEffect(() => {
    return () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  // run the search
  const performSearch = useCallback(async (query: string, isLoadMore: boolean = false): Promise<void> => {
    const sanitizedQuery = sanitizeSearchQuery(query);
    
    // skip if invalid or short
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

    // skip if same query
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
      console.log(`Searching for: ${sanitizedQuery} (page: ${currentPage}, sources: ${activeSourcesRef.current.join(',')})`);
      const response = await searchApp(sanitizedQuery, currentPage, RESULTS_PER_PAGE, activeSourcesRef.current);
      
      // check if more results exist
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

  // debounced search to save api hits
  const debouncedSearch = useCallback(
    debounce(performSearch, DEBOUNCE_DELAY),
    [performSearch]
  );

  // start search
  const search = useCallback((query: string): void => {
    const sanitizedQuery = sanitizeSearchQuery(query);
    
    // immediate ui query update
    setSearchState(prev => ({
      ...prev,
      query: sanitizedQuery
    }));

    // clear if empty
    if (!sanitizedQuery || sanitizedQuery.length === 0) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null
      }));
      return;
    }

    // stop if too short
    if (sanitizedQuery.length < MIN_QUERY_LENGTH) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null
      }));
      return;
    }

    // show loading early
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    // debounced search
    debouncedSearch(sanitizedQuery);
  }, [debouncedSearch]);

  // reset search
  const clearSearch = useCallback((): void => {
    // abort existing search
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    lastSearchQueryRef.current = '';
    currentPageRef.current = 0;
    
    setSearchState(INITIAL_STATE);
  }, []);

  // retry last query
  const retrySearch = useCallback((): void => {
    if (searchState.query) {
      performSearch(searchState.query);
    }
  }, [searchState.query, performSearch]);

  // fetch next page
  const loadMore = useCallback((): void => {
    if (searchState.query && searchState.hasMore && !searchState.loading && !searchState.loadingMore) {
      performSearch(searchState.query, true);
    }
  }, [searchState.query, searchState.hasMore, searchState.loading, searchState.loadingMore, performSearch]);

  // refresh on source change
  useEffect(() => {
    if (searchState.query && searchState.query.length >= MIN_QUERY_LENGTH) {
      lastSearchQueryRef.current = ''; // Force re-search
      performSearch(searchState.query);
    }
  // trigger on join changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSources.join(',')]);

  return {
    searchState,
    search,
    loadMore,
    clearSearch
  };
}

