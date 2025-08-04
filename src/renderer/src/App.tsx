import React, { useEffect, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { ResultsList } from "./components/ResultsList";
import { AppMigration } from "./components/AppMigration";
import { useSearch } from "./hooks/useSearch";
import { isElectronAPIAvailable } from "./utils/ipc";
import iconImage from "./assets/icon.png";
import "./App.css";

/**
 * Main WinHub application component with Ubuntu Software Center inspired design
 */
const App: React.FC = () => {
  const { searchState, search, loadMore, clearSearch } = useSearch();
  const [isReady, setIsReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("compact"); // Default to compact
  const [showMigration, setShowMigration] = useState(false);

  // Initialize dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Check if Electron API is available on mount
  useEffect(() => {
    const checkAPI = () => {
      if (isElectronAPIAvailable()) {
        setIsReady(true);
        setApiError(null);
      } else {
        setApiError(
          "WinHub services are not available. Please restart the application."
        );
      }
    };

    // Check immediately
    checkAPI();

    // Also check after a short delay in case API loads asynchronously
    const timeout = setTimeout(checkAPI, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Handle search input
  const handleSearch = (query: string) => {
    if (!isReady) return;
    search(query);
  };

  // Handle clear search
  const handleClearSearch = () => {
    clearSearch();
  };

  // Handle retry for errors
  const handleRetry = () => {
    if (searchState.query) {
      search(searchState.query);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "compact" ? "detailed" : "compact");
  };

  // Show API error if not ready
  if (!isReady && apiError) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              WinHub - Service Error
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {apiError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-ubuntu-orange hover:bg-ubuntu-orange/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Restart Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking API
  if (!isReady) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 animate-spin border-2 border-gray-300 border-t-ubuntu-orange rounded-full"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading WinHub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with Ubuntu-inspired design */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  src={iconImage}
                  alt="WinHub"
                  className="w-10 h-10 rounded-lg"
                />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  WinHub
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Software Center
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* PC Migration Button */}
              <button
                onClick={() => setShowMigration(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="PC Migration Tool"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={toggleViewMode}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "compact"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={toggleViewMode}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "detailed"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Status Indicator */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Ready
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Section - Ubuntu-inspired */}
        <div className="mb-6">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              loading={searchState.loading}
              placeholder="Search for applications..."
            />
          </div>
        </div>

        {/* Results Section */}
        <ResultsList
          results={searchState.results}
          loading={searchState.loading}
          error={searchState.error}
          hasMore={searchState.hasMore}
          loadingMore={searchState.loadingMore}
          onRetry={handleRetry}
          onLoadMore={loadMore}
          viewMode={viewMode}
          total={searchState.total}
        />

        {/* Quick Start Guide (shown when no search is active) */}
        {!searchState.query &&
          !searchState.loading &&
          searchState.results.length === 0 &&
          !searchState.error && (
            <div className="mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-ubuntu-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-ubuntu-orange"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 0a10 10 0 110 20A10 10 0 0110 0z" />
                      <path d="M10 4.5L7.5 8.5h5L10 4.5z" />
                      <path d="M10 15.5l2.5-4h-5l2.5 4z" />
                      <path d="M4.5 10L8.5 7.5v5L4.5 10z" />
                      <path d="M15.5 10L11.5 12.5v-5L15.5 10z" />
                      <circle cx="10" cy="10" r="1.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Discover Applications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Search for any Windows application and get instant
                    installation commands or download links.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Step 1 */}
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Search
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Type the name of any Windows program you want to install
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Copy
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get the WinGet command and copy it with one click
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-ubuntu-orange/10 dark:bg-ubuntu-orange/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <svg
                        className="w-6 h-6 text-ubuntu-orange"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Install
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Paste the command in PowerShell and press Enter
                    </p>
                  </div>
                </div>

                {/* OR Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                    OR
                  </span>
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                {/* Quick Install Route */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Install Route
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                    Search for any Windows application and instantly install it
                    by selecting Quick Install.
                  </p>

                  {/* Main Flow Steps */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Search App
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-ubuntu-orange/10 dark:bg-ubuntu-orange/20 rounded-lg">
                      <svg
                        className="w-4 h-4 text-ubuntu-orange"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span className="text-sm font-medium text-ubuntu-orange">
                        Select Quick Install
                      </span>
                    </div>
                  </div>

                  {/* OR Separator */}
                  <div className="flex items-center justify-center my-6">
                    <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                      OR
                    </span>
                    <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                  </div>

                  {/* Advanced Option - Compact */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-w-lg mx-auto my-6">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Know the exact package ID?
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Publisher.ApplicationName"
                        className="flex-1 px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-ubuntu-orange"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              handleSearch(target.value.trim());
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (
                            e.target as HTMLElement
                          ).parentElement?.querySelector(
                            "input"
                          ) as HTMLInputElement;
                          if (input?.value.trim()) {
                            handleSearch(input.value.trim());
                          }
                        }}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                      >
                        Go
                      </button>
                    </div>
                  </div>
                </div>
                {/* Popular Applications */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    Popular Applications
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Chrome",
                      "Firefox",
                      "VSCode",
                      "Spotify",
                      "Discord",
                      "Zoom",
                      "Steam",
                      "VLC",
                      "Git",
                      "Node.js",
                    ].map((app) => (
                      <button
                        key={app}
                        onClick={() => handleSearch(app)}
                        className="px-4 py-2 text-sm text-ubuntu-orange bg-ubuntu-orange/10 hover:bg-ubuntu-orange/20 dark:bg-ubuntu-orange/20 dark:hover:bg-ubuntu-orange/30 rounded-full transition-colors duration-200 font-medium"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              WinHub v1.0.0 - Software Center for Windows
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Powered by WinGet API</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>Fast & Secure</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Migration Modal */}
      {showMigration && (
        <AppMigration onClose={() => setShowMigration(false)} />
      )}
    </div>
  );
};

export default App;
