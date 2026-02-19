import React, { useEffect, useState, useCallback } from "react";
import { LayoutList, LayoutGrid } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { ResultsList } from "./components/ResultsList";
import { AppMigration } from "./components/AppMigration";
import { useSearch } from "./hooks/useSearch";
import { isElectronAPIAvailable } from "./utils/ipc";
import { PackageSource } from "./types";
import iconImage from "./assets/icon.png";
import "./App.css";

// main app entry
const App: React.FC = () => {
  const [activeSources, setActiveSources] = useState<PackageSource[]>(() => {
    const saved = localStorage.getItem("winhub-sources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ["winget"];
  });
  const { searchState, search, loadMore, clearSearch } =
    useSearch(activeSources);
  const [isReady, setIsReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("winhub-dark-mode");
    return saved !== null ? saved === "true" : true;
  });
  const [viewMode, setViewMode] = useState<"compact" | "detailed">(() => {
    const saved = localStorage.getItem("winhub-view-mode");
    return saved === "detailed" ? "detailed" : "compact";
  });
  const [showMigration, setShowMigration] = useState(false);

  // sync dark mode class & localstorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("winhub-dark-mode", String(isDarkMode));
  }, [isDarkMode]);

  // sync view mode localstorage
  useEffect(() => {
    localStorage.setItem("winhub-view-mode", viewMode);
  }, [viewMode]);

  // verify ipc bridge is active
  useEffect(() => {
    const checkAPI = () => {
      if (isElectronAPIAvailable()) {
        setIsReady(true);
        setApiError(null);
      } else {
        setApiError(
          "WinHub services are not available. Please restart the application.",
        );
      }
    };

    // check right away
    checkAPI();

    // retry after 1s if needed
    const timeout = setTimeout(checkAPI, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // handle search
  const handleSearch = (query: string) => {
    if (!isReady) return;
    search(query);
  };

  // handle reset
  const handleClearSearch = () => {
    clearSearch();
  };

  // handle retry
  const handleRetry = () => {
    if (searchState.query) {
      search(searchState.query);
    }
  };

  // toggle theme
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // toggle density
  const toggleViewMode = () => {
    setViewMode(viewMode === "compact" ? "detailed" : "compact");
  };

  // toggle winget/choco sources
  const toggleSource = useCallback((source: PackageSource) => {
    setActiveSources((prev) => {
      let next: PackageSource[];
      if (prev.includes(source)) {
        // keep at least one source
        next = prev.filter((s) => s !== source);
        if (next.length === 0) return prev;
      } else {
        next = [...prev, source];
      }
      localStorage.setItem("winhub-sources", JSON.stringify(next));
      return next;
    });
  }, []);

  // handle service error
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

  // initial load state
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
      {/* app header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* brand */}
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

            {/* header buttons */}
            <div className="flex items-center space-x-4">
              {/* migration tool */}
              <button
                onClick={() => setShowMigration(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ubuntu-orange border border-ubuntu-orange/40 rounded-lg hover:bg-ubuntu-orange/10 dark:hover:bg-ubuntu-orange/20 transition-colors"
                title="PC Migration Tool"
              >
                <svg
                  className="w-4 h-4"
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
                Migrate
              </button>

              {/* theme toggle */}
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

              {/* app state */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Ready
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* search area */}
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

        {/* filters area */}
        {(searchState.query || searchState.results.length > 0) && (
          <div className="mb-6 max-w-2xl mx-auto flex items-center justify-between">
            {/* source selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
                Sources:
              </span>
              <button
                onClick={() => toggleSource("winget")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                  activeSources.includes("winget")
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                }`}
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                </svg>
                WinGet
              </button>
              <button
                onClick={() => toggleSource("chocolatey")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                  activeSources.includes("chocolatey")
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-amber-400"
                }`}
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Chocolatey
              </button>
            </div>

            {/* density toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
                View:
              </span>
              <div
                className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1"
                title="Toggle View Mode"
              >
                <button
                  onClick={() => setViewMode("compact")}
                  className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                    viewMode === "compact"
                      ? "bg-white dark:bg-gray-600 text-ubuntu-orange shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Compact View"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                    viewMode === "detailed"
                      ? "bg-white dark:bg-gray-600 text-ubuntu-orange shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Detailed View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* results area */}
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

        {/* home view */}
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

                {/* guide steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                {/* divider */}
                <div className="flex items-center justify-center my-6">
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                    OR
                  </span>
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                {/* alternate route */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Install Route
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                    Search for any Windows application and instantly install it
                    by selecting Quick Install.
                  </p>

                  {/* quick steps */}
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

                  {/* divider */}
                  <div className="flex items-center justify-center my-6">
                    <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                      OR
                    </span>
                    <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                  </div>

                  {/* direct id search */}
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
                            "input",
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
                {/* suggestions */}
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

      {/* footer */}
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

      {/* migration modal */}
      {showMigration && (
        <AppMigration onClose={() => setShowMigration(false)} />
      )}
    </div>
  );
};

export default App;
