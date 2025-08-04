import React from "react";
import { ErrorMessageProps } from "../types";

/**
 * Error message component with optional retry functionality
 */
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
      {/* Error Icon */}
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

      {/* Error Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>

      <p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>

      {/* Retry Button */}
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

/**
 * Compact error message for inline display
 */
export const InlineErrorMessage: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className = "" }) => (
  <div
    className={`flex items-center p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg ${className}`}
    role="alert"
  >
    <svg
      className="w-4 h-4 mr-2 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
    <span>{message}</span>
  </div>
);

/**
 * Network error specific message
 */
export const NetworkErrorMessage: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className = "" }) => (
  <ErrorMessage
    message="Unable to connect to search services. Please check your internet connection and try again."
    onRetry={onRetry}
    className={className}
  />
);

/**
 * No results message (not technically an error, but similar styling)
 */
export const NoResultsMessage: React.FC<{
  query?: string;
  className?: string;
}> = ({ query, className = "" }) => (
  <div
    className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
  >
    {/* Search Icon */}
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
