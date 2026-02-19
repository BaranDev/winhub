import React, { useState } from "react";
import { ResultsListProps } from "../types";
import { ResultItem, CompactResultItem } from "./ResultItem";
import { LoadingSpinnerWithText } from "./LoadingSpinner";
import { ErrorMessage, NoResultsMessage } from "./ErrorMessage";

// list of search results
export const ResultsList: React.FC<
  ResultsListProps & { viewMode?: "compact" | "detailed"; total?: number }
> = ({
  results,
  loading,
  error,
  hasMore = false,
  loadingMore = false,
  onRetry,
  onLoadMore,
  viewMode = "compact",
  total,
}) => {
  // searching
  if (loading) {
    return (
      <div className="mt-8">
        <LoadingSpinnerWithText text="Searching for programs..." size="md" />
      </div>
    );
  }

  // error view
  if (error) {
    return (
      <div className="mt-8">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  // empty state
  if (!results || results.length === 0) {
    return (
      <div className="mt-8">
        <NoResultsMessage />
      </div>
    );
  }

  // result view
  return (
    <div className="mt-8">
      {/* result count */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
            {total && total > results.length && (
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                of {total.toLocaleString()} total
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose your preferred installation method below
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              {results.filter((r) => r.wingetCommand).length} WinGet
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-ubuntu-orange rounded-full mr-1"></div>
              {results.filter((r) => r.officialUrl).length} Official
            </span>
          </div>
        </div>
      </div>

      {/* items */}
      <div
        className={
          viewMode === "compact"
            ? "grid grid-cols-1 lg:grid-cols-2 gap-1"
            : "space-y-4"
        }
      >
        {results.map((result, index) =>
          viewMode === "compact" ? (
            <CompactResultItem
              key={`${result.name}-${result.publisher}-${index}`}
              result={result}
            />
          ) : (
            <ResultItem
              key={`${result.name}-${result.publisher}-${index}`}
              result={result}
            />
          ),
        )}
      </div>

      {/* load more */}
      {hasMore && onLoadMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
              loadingMore
                ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-ubuntu-orange hover:bg-ubuntu-orange/90 text-white shadow-sm"
            }`}
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading more...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                Load More Results
              </>
            )}
          </button>
        </div>
      )}

      {/* footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center text-center">
          <div className="max-w-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Can't find what you're looking for?
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Try:</span>
              <span className="text-ubuntu-orange">Different keywords</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-ubuntu-orange">Exact app name</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-ubuntu-orange">Publisher name</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsList;
