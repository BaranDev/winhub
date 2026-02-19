import React from "react";
import { ErrorMessageProps } from "../types";

// error view with retry
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
      aria-live="polite"
    >
      {/* icon */}
      <div className="w-12 h-12 mx-auto mb-4 text-red-500">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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

      {/* message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>

      <p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>

      {/* retry item */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          type="button"
        >
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};

// empty state view
export const NoResultsMessage: React.FC<{
  query?: string;
  className?: string;
}> = ({ query, className = "" }) => (
  <div
    className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
  >
    {/* icon */}
    <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No results found
    </h3>

    <p className="text-sm text-gray-600 max-w-md">
      {query
        ? `We couldn't find any programs matching "${query}". Try searching with different keywords or check the spelling.`
        : "We couldn't find any programs. Try searching with different keywords."}
    </p>
  </div>
);

export default ErrorMessage;
