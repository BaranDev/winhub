import React, { useState, useCallback } from "react";
import { ResultItemProps } from "../types";
import { LargeCopyButton, CopyButton } from "./CopyButton";
import {
  openExternalURL,
  executeWingetInstall,
  generateWingetCommand,
} from "../utils/ipc";
import { PackageModal } from "./PackageModal";

// result card component
export const ResultItem: React.FC<ResultItemProps> = ({ result }) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState<boolean | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>(
    result.latestVersion || result.versions?.[0] || "",
  );
  const [currentCommand, setCurrentCommand] = useState<string>(
    result.wingetCommand || result.chocoCommand || "",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateCommand = useCallback(
    async (version: string) => {
      if (!result.packageId) return;

      try {
        const command = await generateWingetCommand(
          result.packageId,
          version === result.latestVersion ? undefined : version,
        );
        setCurrentCommand(command);
      } catch (error) {
        console.error("Failed to generate command:", error);
      }
    },
    [result.packageId, result.latestVersion],
  );

  const handleVersionChange = useCallback(
    async (version: string) => {
      setSelectedVersion(version);
      await updateCommand(version);
    },
    [updateCommand],
  );

  const handleOpenUrl = (url: string) => {
    openExternalURL(url);
  };

  const handleInstallNow = async () => {
    if (!currentCommand || isInstalling) return;

    setIsInstalling(true);
    setInstallMessage(null);
    setInstallSuccess(null);

    try {
      const installResult = await executeWingetInstall(currentCommand);
      setInstallSuccess(installResult.success);
      setInstallMessage(installResult.message);

      if (installResult.needsElevation) {
        setInstallMessage(
          "Please allow administrator privileges to continue installation.",
        );
      }
    } catch (error) {
      setInstallSuccess(false);
      setInstallMessage("Failed to start installation. Please try again.");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* app title & info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-left hover:text-ubuntu-orange transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-ubuntu-orange">
              {result.name}
            </h3>
          </button>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {result.publisher}
            </p>
            {result.latestVersion && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                Latest: {result.latestVersion}
              </span>
            )}
          </div>
        </div>

        {/* source badge */}
        <div className="ml-4 flex-shrink-0">
          {result.source === "winget" ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
              WinGet
            </span>
          ) : result.source === "chocolatey" ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
              Chocolatey
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ubuntu-orange/10 text-ubuntu-orange">
              Web
            </span>
          )}
        </div>
      </div>

      {/* description */}
      {result.description && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            About this app
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {result.description}
          </p>
        </div>
      )}

      {/* install options */}
      <div className="space-y-4">
        {/* install command */}
        {(result.wingetCommand || result.chocoCommand) && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Install via{" "}
                {result.source === "chocolatey" ? "Chocolatey" : "WinGet"}
              </h4>
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* version picker */}
            {result.versions && result.versions.length > 1 && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Version:
                </label>
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ubuntu-orange focus:border-transparent text-gray-900 dark:text-white"
                >
                  {result.versions.map((version) => (
                    <option key={version} value={version}>
                      {version} {version === result.latestVersion && "(Latest)"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-gray-900 dark:bg-gray-800 rounded-md p-3 mb-3">
              <code className="text-sm text-green-400 font-mono break-all">
                {currentCommand}
              </code>
            </div>

            <LargeCopyButton
              text={currentCommand}
              label="Copy WinGet Command"
              fullWidth
            />

            {/* actions */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleInstallNow}
                disabled={isInstalling}
                className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isInstalling
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-ubuntu-orange hover:bg-ubuntu-orange/90 text-white shadow-sm"
                }`}
              >
                {isInstalling ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"
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
                    Installing...
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Now
                  </>
                )}
              </button>

              {/* license link */}
              {result.licenseUrl && (
                <button
                  onClick={() => openExternalURL(result.licenseUrl!)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 border border-gray-300 dark:border-gray-600"
                  title="Read software license"
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  License
                </button>
              )}
            </div>

            {/* install status */}
            {installMessage && (
              <div
                className={`mt-2 p-2 rounded-md text-xs ${
                  installSuccess === true
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                    : installSuccess === false
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                }`}
              >
                {installMessage}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Click "Download Now" to install automatically, or copy the command
              to run manually as Administrator
              {result.licenseUrl && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                  📄 Please review the software license before installation
                </span>
              )}
            </p>
          </div>
        )}

        {/* official site */}
        {result.officialUrl && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Official Download
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Download directly from the official website
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CopyButton text={result.officialUrl} label="Copy URL" />
                <button
                  onClick={() => handleOpenUrl(result.officialUrl!)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-ubuntu-orange hover:bg-ubuntu-orange/90 rounded-md transition-colors duration-200"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open Site
                </button>
              </div>
            </div>
          </div>
        )}

        {/* web searches */}
        {result.searchUrls && result.searchUrls.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Search for Download Links
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {result.searchUrls.slice(0, 4).map((searchLink, index) => (
                <button
                  key={index}
                  onClick={() => handleOpenUrl(searchLink.url)}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                >
                  <SearchEngineIcon
                    engine={searchLink.engine}
                    className="w-3 h-3 mr-1"
                  />
                  {searchLink.engine}
                </button>
              ))}
            </div>

            {result.searchUrls.length > 4 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                +{result.searchUrls.length - 4} more search options available
              </p>
            )}
          </div>
        )}
      </div>

      {/* safety note */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-start space-x-2">
          <svg
            className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Always download software from official sources or trusted
            repositories to ensure security.
          </p>
        </div>
      </div>

      {/* detail modal */}
      <PackageModal
        package={result}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// engine icon helper
const SearchEngineIcon: React.FC<{ engine: string; className?: string }> = ({
  engine,
  className = "",
}) => {
  const engineLower = engine.toLowerCase();

  // get engine icon
  if (engineLower.includes("google")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    );
  }

  // fallback icon
  return (
    <svg
      className={className}
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
  );
};

// dense result card
export const CompactResultItem: React.FC<ResultItemProps> = ({ result }) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>(
    result.latestVersion || result.versions?.[0] || "",
  );
  const [currentCommand, setCurrentCommand] = useState<string>(
    result.wingetCommand || result.chocoCommand || "",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateCommand = useCallback(
    async (version: string) => {
      if (!result.packageId) return;

      try {
        const command = await generateWingetCommand(
          result.packageId,
          version === result.latestVersion ? undefined : version,
        );
        setCurrentCommand(command);
      } catch (error) {
        console.error("Failed to generate command:", error);
      }
    },
    [result.packageId, result.latestVersion],
  );

  const handleVersionChange = useCallback(
    async (version: string) => {
      setSelectedVersion(version);
      await updateCommand(version);
    },
    [updateCommand],
  );

  const handleInstallNow = async () => {
    if (!currentCommand || isInstalling) return;

    setIsInstalling(true);
    setInstallMessage(null);

    try {
      const installResult = await executeWingetInstall(currentCommand);
      setInstallMessage(
        installResult.success ? "Installing..." : installResult.message,
      );
    } catch (error) {
      setInstallMessage("Failed to start installation");
    } finally {
      setIsInstalling(false);
      // reset message timer
      setTimeout(() => setInstallMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-left hover:text-ubuntu-orange transition-colors"
            >
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-ubuntu-orange m-1">
                {result.name.length > 25
                  ? `${result.name.slice(0, 25)}...`
                  : result.name}
              </h3>
            </button>
            {result.source === "winget" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                WinGet
              </span>
            )}
            {result.source === "chocolatey" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                Choco
              </span>
            )}
            {result.latestVersion && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                v{selectedVersion}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {result.publisher}
            </p>
            {/* compact version selector */}
            {result.versions && result.versions.length > 1 && (
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="text-xs px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-ubuntu-orange text-gray-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {result.versions.map((version) => (
                  <option key={version} value={version}>
                    {version} {version === result.latestVersion && "(Latest)"}
                  </option>
                ))}
              </select>
            )}
          </div>
          {installMessage && (
            <p className="text-xs text-ubuntu-orange mt-0.5">
              {installMessage}
            </p>
          )}
        </div>

        <div className="ml-3 flex items-center space-x-1.5 flex-shrink-0">
          {(result.wingetCommand || result.chocoCommand) && (
            <>
              {result.officialUrl && (
                <button
                  onClick={() => openExternalURL(result.officialUrl!)}
                  className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-ubuntu-orange hover:text-ubuntu-orange/80 hover:bg-ubuntu-orange/10 dark:hover:bg-ubuntu-orange/20 rounded transition-colors duration-200"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Site
                </button>
              )}
              <button
                onClick={handleInstallNow}
                disabled={isInstalling}
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded transition-colors duration-200 ${
                  isInstalling
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-ubuntu-orange hover:bg-ubuntu-orange/90 text-white"
                }`}
              >
                {isInstalling ? (
                  <>
                    <svg
                      className="animate-spin w-3 h-3 mr-1"
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
                    Installing
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 mr-1"
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
                    Install
                  </>
                )}
              </button>
              <CopyButton text={currentCommand} label="Copy" />
            </>
          )}
        </div>
      </div>

      {/* detail modal */}
      <PackageModal
        package={result}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ResultItem;
