import React, { useState } from "react";

interface WingetInstallerProps {
  onClose: () => void;
  onInstallComplete: () => void;
}

export const WingetInstaller: React.FC<WingetInstallerProps> = ({
  onClose,
  onInstallComplete,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [installationStep, setInstallationStep] = useState<
    "info" | "installing" | "complete" | "error"
  >("info");

  const handleInstallWinget = async () => {
    setIsInstalling(true);
    setInstallationStep("installing");
    setStatusMessage(
      "Starting WinGet installation... This may take a few minutes."
    );

    try {
      const result = await (window as any).electronAPI.installWinget();

      if (result.success) {
        setInstallationStep("complete");
        setStatusMessage(result.message);
        // Auto-close after successful installation
        setTimeout(() => {
          onInstallComplete();
          onClose();
        }, 3000);
      } else {
        setInstallationStep("error");
        setStatusMessage(result.message);
      }
    } catch (error) {
      setInstallationStep("error");
      setStatusMessage("Installation failed: Unable to install WinGet");
    } finally {
      setIsInstalling(false);
    }
  };

  const copyManualCommand = async () => {
    const command = `# Run this in an Administrator PowerShell window:
# Method 1: Install from Microsoft Store (Recommended)
Add-AppxPackage -Path "https://aka.ms/getwinget"

# Method 2: If above fails, download and install manually
$url = "https://github.com/microsoft/winget-cli/releases/latest/download/Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
$output = "$env:TEMP\\winget.msixbundle"
Invoke-WebRequest -Uri $url -OutFile $output
Add-AppxPackage -Path $output
Remove-Item $output`;

    try {
      await (window as any).electronAPI.copyToClipboard(command);
      setStatusMessage("Manual installation commands copied to clipboard!");
    } catch (error) {
      setStatusMessage("Failed to copy commands to clipboard");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Install WinGet
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Windows Package Manager is required for WinHub to work
            </p>
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

        {/* Content */}
        <div className="p-6">
          {installationStep === "info" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
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
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  WinGet Not Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  WinGet (Windows Package Manager) is not installed on your
                  system. WinHub requires WinGet to search for and install
                  applications safely.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  📦 What is WinGet?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  WinGet is Microsoft's official package manager for Windows. It
                  allows you to discover, install, upgrade, remove and configure
                  applications from a curated set of trusted sources.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Installation Options:
                </h4>

                {/* Automatic Installation */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                        1
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        🚀 Automatic Installation (Recommended)
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Let WinHub install WinGet automatically. This requires
                        administrator privileges.
                      </p>
                      <button
                        onClick={handleInstallWinget}
                        disabled={isInstalling}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {isInstalling ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Installing...
                          </span>
                        ) : (
                          "⚡ Install WinGet Now"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Manual Installation */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        2
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        🛠️ Manual Installation
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Copy PowerShell commands to install WinGet manually in
                        an Administrator terminal.
                      </p>
                      <button
                        onClick={copyManualCommand}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        📋 Copy Installation Commands
                      </button>
                    </div>
                  </div>
                </div>

                {/* Microsoft Store Installation */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-ubuntu-orange/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-ubuntu-orange font-bold text-sm">
                        3
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        🏪 Microsoft Store Installation
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Install "App Installer" from the Microsoft Store, which
                        includes WinGet.
                      </p>
                      <a
                        href="ms-windows-store://pdp/?productid=9nblggh4nns1"
                        className="inline-block px-4 py-2 bg-ubuntu-orange hover:bg-ubuntu-orange/90 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        🏪 Open Microsoft Store
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {installationStep === "installing" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Installing WinGet...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we install the Windows Package Manager. This
                  process may take a few minutes.
                </p>
              </div>
            </div>
          )}

          {installationStep === "complete" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ✅ Installation Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  WinGet has been installed successfully. WinHub will now be
                  able to search and install applications.
                </p>
              </div>
            </div>
          )}

          {installationStep === "error" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Installation Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The automatic installation failed. Please try one of the
                  manual methods above.
                </p>
                <button
                  onClick={() => setInstallationStep("info")}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg"
                >
                  🔙 Back to Options
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="px-6 pb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 rounded-b-xl">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              💡 <strong>Tip:</strong> WinGet requires Windows 10 1809 or later
            </p>
            <p>
              ⚠️ <strong>Note:</strong> Administrator privileges are required
              for automatic installation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
