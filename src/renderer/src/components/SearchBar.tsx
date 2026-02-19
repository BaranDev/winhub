import React, { useState, useEffect, useRef, useCallback } from "react";
import { SearchBarProps } from "../types";

// app search input
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  loading = false,
  placeholder = "What Windows program do you need?",
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // focus on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // debounced query
  const debouncedSearch = useCallback(
    (value: string) => {
      // reset timer
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // start timer
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, 800); // 800ms debounce delay
    },
    [onSearch],
  );

  // abort timer on exit
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

    // clear results instantly if empty
    if (value.trim() === "") {
      onSearch(value);
    } else {
      // wait for typing to stop
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
      {/* search field */}
      <div className="relative">
        {/* icon */}
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

        {/* input */}
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

        {/* x button */}
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

      {/* helpful tips */}
      {query && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 dark:text-gray-400 px-4">
          Type to search • Press Escape to clear
        </div>
      )}
    </div>
  );
};

export default SearchBar;
