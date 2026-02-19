import React, { useState, useEffect } from "react";
import type { AppListExport } from "../../../shared/types";
import { WingetInstaller } from "./WingetInstaller";
import {
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Package,
  Search,
  DownloadCloud,
  FileUp,
  FolderOpen,
  Rocket,
  XCircle,
  FileOutput,
  RefreshCw,
} from "lucide-react";

interface AppMigrationProps {
  onClose: () => void;
}

export const AppMigration: React.FC<AppMigrationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportData, setExportData] = useState<AppListExport | null>(null);
  const [importData, setImportData] = useState<AppListExport | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [wingetAvailable, setWingetAvailable] = useState<boolean | null>(null);
  const [showWingetInstaller, setShowWingetInstaller] = useState(false);

  // verify winget on mount
  useEffect(() => {
    checkWingetAvailability();
  }, []);

  const checkWingetAvailability = async () => {
    try {
      const result = await (
        window as any
      ).electronAPI.checkWingetAvailability();
      setWingetAvailable(result.available);

      if (result.available) {
        setStatusMessage(`WinGet Ready: ${result.message}`);
      } else {
        setStatusMessage(`Warning: ${result.message}`);
      }
    } catch (error) {
      setWingetAvailable(false);
      setStatusMessage("Warning: Unable to check WinGet availability");
    }
  };

  const handleExport = async () => {
    if (!wingetAvailable) {
      setShowWingetInstaller(true);
      return;
    }

    setIsExporting(true);
    setStatusMessage("Scanning installed applications...");

    try {
      const result = await (window as any).electronAPI.exportInstalledApps();

      if (result.success) {
        setExportData(result.data);
        setStatusMessage(
          `Found ${result.data.totalApps} installed applications`,
        );
      } else {
        setStatusMessage(`Export failed: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage("Export failed: Unable to scan applications");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveExport = async () => {
    if (!exportData) return;

    try {
      const result = await (window as any).electronAPI.saveExportFile(
        exportData,
      );

      if (result.success) {
        setStatusMessage(`Export saved successfully to: ${result.filePath}`);
      } else {
        setStatusMessage(`Save failed: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage("Save failed: Unable to save file");
    }
  };

  const handleLoadImport = async () => {
    try {
      const result = await (window as any).electronAPI.loadImportFile();

      if (result.success) {
        setImportData(result.data);
        setStatusMessage(
          `Loaded ${result.data.totalApps} applications from ${result.data.computerName}`,
        );
      } else {
        setStatusMessage(`Import failed: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage("Import failed: Unable to load file");
    }
  };

  const handleBulkInstall = async () => {
    if (!importData) return;

    if (!wingetAvailable) {
      setShowWingetInstaller(true);
      return;
    }

    setIsImporting(true);
    setStatusMessage(
      "Installing applications... This may take several minutes.",
    );

    try {
      const result = await (window as any).electronAPI.executeBulkInstall(
        importData.wingetCommand,
      );

      if (result.success) {
        setStatusMessage("All applications installed successfully!");
      } else {
        setStatusMessage(
          `Installation completed with issues: ${result.message}`,
        );
      }
    } catch (error) {
      setStatusMessage("Installation failed: Unable to execute bulk install");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              PC Migration Tool
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transfer your app collection between computers
              </p>
              {/* winget status */}
              <div className="flex items-center space-x-1">
                {wingetAvailable === null ? (
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                ) : wingetAvailable ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {wingetAvailable === null
                    ? "Checking..."
                    : wingetAvailable
                      ? "WinGet Ready"
                      : "WinGet Missing"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="w-6 h-6"
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

        {/* navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === "export"
                ? "text-ubuntu-orange border-b-2 border-ubuntu-orange bg-ubuntu-orange/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Export Apps (From This PC)
            </span>
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === "import"
                ? "text-ubuntu-orange border-b-2 border-ubuntu-orange bg-ubuntu-orange/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Import Apps (To This PC)
            </span>
          </button>
        </div>

        {/* tab body */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === "export" ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Export Your Apps
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create a list of all WinGet-compatible apps currently
                  installed on this computer
                </p>

                {!exportData ? (
                  <div className="space-y-4">
                    {!wingetAvailable && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span className="font-medium text-red-800 dark:text-red-300">
                            WinGet Required
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                          WinGet is required to scan installed applications.
                          Click the button below to install it.
                        </p>
                        <button
                          onClick={() => setShowWingetInstaller(true)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Package className="w-4 h-4" /> Install WinGet
                          </span>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleExport}
                      disabled={isExporting || !wingetAvailable}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {isExporting ? (
                        <span className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Scanning Apps...
                        </span>
                      ) : (
                        "Scan Installed Apps"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <svg
                          className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="font-medium text-green-800 dark:text-green-300">
                          Export Ready: {exportData.totalApps} Apps Found
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                        From: {exportData.computerName} •{" "}
                        {new Date(exportData.exportedAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveExport}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <FileOutput className="w-4 h-4" /> Save Export File
                          </span>
                        </button>
                        <button
                          onClick={() => setExportData(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Scan Again
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* app preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Apps Preview ({Math.min(exportData.apps.length, 5)} of{" "}
                        {exportData.totalApps})
                      </h4>
                      <div className="space-y-2 text-sm">
                        {exportData.apps.slice(0, 5).map((app, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                              {app.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                              {app.packageId}
                            </span>
                          </div>
                        ))}
                        {exportData.apps.length > 5 && (
                          <div className="text-gray-500 dark:text-gray-400 text-center pt-2">
                            ... and {exportData.apps.length - 5} more apps
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-ubuntu-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-ubuntu-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Import Apps
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Load an export file and install all the apps from another
                  computer
                </p>

                {!importData ? (
                  <button
                    onClick={handleLoadImport}
                    className="px-6 py-3 bg-ubuntu-orange hover:bg-ubuntu-orange/90 text-white font-medium rounded-lg transition-colors"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FolderOpen className="w-5 h-5" /> Select Import File
                    </span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    {!wingetAvailable && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span className="font-medium text-red-800 dark:text-red-300">
                            WinGet Required
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                          WinGet is required to install applications. Click the
                          button below to install it.
                        </p>
                        <button
                          onClick={() => setShowWingetInstaller(true)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Package className="w-4 h-4" /> Install WinGet
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="bg-ubuntu-orange/10 border border-ubuntu-orange/30 rounded-lg p-4">
                      {/* import details */}
                      <div className="flex items-center mb-3">
                        <svg
                          className="w-5 h-5 text-ubuntu-orange mr-2"
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
                        <span className="font-medium text-ubuntu-orange">
                          Ready to Install: {importData.totalApps} Apps
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        From: {importData.computerName} •{" "}
                        {new Date(importData.exportedAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleBulkInstall}
                          disabled={isImporting}
                          className="px-4 py-2 bg-ubuntu-orange hover:bg-ubuntu-orange/90 disabled:bg-ubuntu-orange/50 text-white text-sm font-medium rounded-lg"
                        >
                          {isImporting ? (
                            <span className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Installing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Rocket className="w-4 h-4" /> Install All Apps
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setImportData(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <FolderOpen className="w-4 h-4" /> Choose Different
                            File
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* install preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Apps to Install ({Math.min(importData.apps.length, 5)}{" "}
                        of {importData.totalApps})
                      </h4>
                      <div className="space-y-2 text-sm">
                        {importData.apps.slice(0, 5).map((app, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                              {app.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                              {app.packageId}
                            </span>
                          </div>
                        ))}
                        {importData.apps.length > 5 && (
                          <div className="text-gray-500 dark:text-gray-400 text-center pt-2">
                            ... and {importData.apps.length - 5} more apps
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* logs */}
        {statusMessage && (
          <div className="px-6 pb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* footer tip */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Tip: Export
              creates a portable file you can share between computers
            </span>
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Import will
              install apps using WinGet - make sure it's available
            </span>
          </div>
        </div>
      </div>

      {/* winget setup */}
      {showWingetInstaller && (
        <WingetInstaller
          onClose={() => setShowWingetInstaller(false)}
          onInstallComplete={() => {
            checkWingetAvailability();
            setShowWingetInstaller(false);
          }}
        />
      )}
    </div>
  );
};
