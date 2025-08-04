import React, { useState, useEffect, useRef, useCallback } from "react";
import { SearchBarProps } from "../types";

/**
 * Search bar component for application search input
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  loading = false,
  placeholder = "What Windows program do you need?",
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (value: string) => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, 800); // 800ms debounce delay
    },
    [onSearch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // If query is empty, search immediately (to clear results)
    if (value.trim() === "") {
      onSearch(value);
    } else {
      // Otherwise, use debounced search
      debouncedSearch(value);
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-5 h-5 animate-spin border-2 border-gray-300 dark:border-gray-600 border-t-ubuntu-orange rounded-full"></div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl shadow-sm 
                     placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-ubuntu-orange focus:border-ubuntu-orange
                     transition-all duration-200"
          disabled={loading}
          maxLength={100}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {query && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ubuntu-orange"
              type="button"
              title="Clear search"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Search Suggestions (Optional Enhancement) */}
      {query && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 dark:text-gray-400 px-4">
          Type to search • Press Escape to clear
        </div>
      )}
    </div>
  );
};

/**
 * Compact search bar for smaller spaces
 */
export const CompactSearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  loading = false,
  placeholder = "Search programs...",
}) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 animate-spin border-2 border-gray-300 dark:border-gray-600 border-t-ubuntu-orange rounded-full"></div>
          ) : (
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg 
                     placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-ubuntu-orange focus:border-ubuntu-orange transition-all duration-200"
          disabled={loading}
          maxLength={100}
        />

        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              type="button"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Search bar with recent searches dropdown
 */
export const SearchBarWithHistory: React.FC<
  SearchBarProps & {
    recentSearches?: string[];
    onSelectRecent?: (query: string) => void;
  }
> = ({
  onSearch,
  onClear,
  loading = false,
  placeholder = "What Windows program do you need?",
  recentSearches = [],
  onSelectRecent,
}) => {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    setShowHistory(false);
  };

  const handleFocus = () => {
    if (recentSearches.length > 0 && !query) {
      setShowHistory(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow clicking on recent items
    setTimeout(() => setShowHistory(false), 200);
  };

  const handleSelectRecent = (recentQuery: string) => {
    setQuery(recentQuery);
    onSearch(recentQuery);
    setShowHistory(false);
    if (onSelectRecent) {
      onSelectRecent(recentQuery);
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    setShowHistory(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <SearchBar
        onSearch={onSearch}
        onClear={handleClear}
        loading={loading}
        placeholder={placeholder}
      />

      {/* Recent Searches Dropdown */}
      {showHistory && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Recent searches
            </p>
            {recentSearches.slice(0, 5).map((recent, index) => (
              <button
                key={index}
                onClick={() => handleSelectRecent(recent)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {recent}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
