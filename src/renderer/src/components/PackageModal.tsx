import React from "react";
import { SearchResult } from "../types";
import { openExternalURL } from "../utils/ipc";

interface PackageModalProps {
  package: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  package: pkg,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !pkg) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {pkg.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              by {pkg.publisher}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="p-6 space-y-6">
          {/* package id */}
          {pkg.packageId && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Package ID
              </h3>
              <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                {pkg.packageId}
              </code>
            </div>
          )}

          {/* details */}
          {pkg.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {pkg.description}
              </p>
            </div>
          )}

          {/* version list */}
          {pkg.versions && pkg.versions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Available Versions ({pkg.versions.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {pkg.versions.slice(0, 12).map((version, index) => (
                  <span
                    key={version}
                    className={`text-xs px-2 py-1 rounded ${
                      version === pkg.latestVersion
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-medium"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {version}
                    {version === pkg.latestVersion && " (Latest)"}
                  </span>
                ))}
                {pkg.versions.length > 12 && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    +{pkg.versions.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* tags */}
          {pkg.tags && pkg.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {pkg.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* license */}
          {pkg.license && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                License
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {pkg.license}
                </span>
                {pkg.licenseUrl && (
                  <button
                    onClick={() => openExternalURL(pkg.licenseUrl!)}
                    className="text-xs text-ubuntu-orange hover:text-ubuntu-orange/80 underline"
                  >
                    View License
                  </button>
                )}
              </div>
            </div>
          )}

          {/* urls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pkg.homepage && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Homepage
                </h3>
                <button
                  onClick={() => openExternalURL(pkg.homepage!)}
                  className="text-sm text-ubuntu-orange hover:text-ubuntu-orange/80 underline break-all"
                >
                  {pkg.homepage}
                </button>
              </div>
            )}

            {pkg.officialUrl && pkg.officialUrl !== pkg.homepage && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Official URL
                </h3>
                <button
                  onClick={() => openExternalURL(pkg.officialUrl!)}
                  className="text-sm text-ubuntu-orange hover:text-ubuntu-orange/80 underline break-all"
                >
                  {pkg.officialUrl}
                </button>
              </div>
            )}
          </div>

          {/* install command */}
          {(pkg.wingetCommand || pkg.chocoCommand) && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Install Command (
                {pkg.source === "chocolatey" ? "Chocolatey" : "WinGet"})
              </h3>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-md p-3">
                <code className="text-sm text-green-400 font-mono break-all">
                  {pkg.wingetCommand || pkg.chocoCommand}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
