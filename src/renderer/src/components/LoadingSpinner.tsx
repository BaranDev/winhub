import React from "react";
import { LoadingSpinnerProps } from "../types";

// generic spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinnerClass = `
    ${sizeClasses[size]}
    animate-spin
    border-2
    border-gray-300
    border-t-primary-500
    rounded-full
    ${className}
  `.trim();

  return (
    <div
      className="flex items-center justify-center p-4"
      role="status"
      aria-label="Loading"
    >
      <div className={spinnerClass}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// spinner with label
export const LoadingSpinnerWithText: React.FC<{
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ text = "Searching...", size = "md", className = "" }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <LoadingSpinner size={size} />
    <p className="mt-3 text-sm text-gray-600 font-medium">{text}</p>
  </div>
);

export default LoadingSpinner;
