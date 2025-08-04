import React from "react";
import { CopyButtonProps } from "../types";
import { useClipboard } from "../hooks/useClipboard";

/**
 * Copy button component with visual feedback
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = "Copy",
  className = "",
}) => {
  const { isCopied, error, copyText } = useClipboard();

  const handleCopy = async () => {
    await copyText(text);
  };

  const buttonClass = `
    inline-flex items-center px-3 py-1.5 text-xs font-medium
    border rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ubuntu-orange dark:focus:ring-offset-gray-800
    ${
      isCopied
        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
        : error
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
    }
    ${className}
  `.trim();

  return (
    <button
      onClick={handleCopy}
      className={buttonClass}
      disabled={!text || text.trim().length === 0}
      type="button"
      title={
        isCopied
          ? "Copied!"
          : error
          ? "Failed to copy"
          : `Copy ${label.toLowerCase()}`
      }
    >
      {/* Icon */}
      <span className="mr-1.5">
        {isCopied ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : error ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3"
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
        )}
      </span>

      {/* Text */}
      <span>{isCopied ? "Copied!" : error ? "Failed" : label}</span>
    </button>
  );
};

/**
 * Large copy button for prominent display
 */
export const LargeCopyButton: React.FC<
  CopyButtonProps & {
    fullWidth?: boolean;
  }
> = ({ text, label = "Copy Command", className = "", fullWidth = false }) => {
  const { isCopied, error, copyText } = useClipboard();

  const handleCopy = async () => {
    await copyText(text);
  };

  const buttonClass = `
    inline-flex items-center justify-center px-4 py-2 text-sm font-medium
    border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ubuntu-orange dark:focus:ring-offset-gray-800
    ${fullWidth ? "w-full" : ""}
    ${
      isCopied
        ? "bg-green-600 border-green-600 text-white hover:bg-green-700"
        : error
        ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
        : "bg-ubuntu-orange border-ubuntu-orange text-white hover:bg-ubuntu-orange/90 shadow-sm"
    }
    ${className}
  `.trim();

  return (
    <button
      onClick={handleCopy}
      className={buttonClass}
      disabled={!text || text.trim().length === 0}
      type="button"
    >
      {/* Icon */}
      <span className="mr-2">
        {isCopied ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : error ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </span>

      {/* Text */}
      <span>
        {isCopied ? "Copied to Clipboard!" : error ? "Copy Failed" : label}
      </span>
    </button>
  );
};

/**
 * Icon-only copy button for compact spaces
 */
export const IconCopyButton: React.FC<{
  text: string;
  className?: string;
  size?: "sm" | "md";
}> = ({ text, className = "", size = "md" }) => {
  const { isCopied, error, copyText } = useClipboard();

  const handleCopy = async () => {
    await copyText(text);
  };

  const sizeClass = size === "sm" ? "w-6 h-6 p-1" : "w-8 h-8 p-1.5";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  const buttonClass = `
    ${sizeClass}
    inline-flex items-center justify-center
    rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ubuntu-orange dark:focus:ring-offset-gray-800
    ${
      isCopied
        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
        : error
        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40"
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
    }
    ${className}
  `.trim();

  return (
    <button
      onClick={handleCopy}
      className={buttonClass}
      disabled={!text || text.trim().length === 0}
      type="button"
      title={
        isCopied ? "Copied!" : error ? "Failed to copy" : "Copy to clipboard"
      }
    >
      {isCopied ? (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : error ? (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className={iconSize}
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
      )}
    </button>
  );
};

export default CopyButton;
