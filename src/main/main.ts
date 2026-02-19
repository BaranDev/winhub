import { app, BrowserWindow, ipcMain, clipboard, shell, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawn } from 'child_process';
import { searchWingetPackages, generateWingetCommand } from './services/winget-service';
import { searchChocolateyPackages, generateChocoCommand } from './services/chocolatey-service';
import { findOfficialWebsite } from './services/fallback-service';
import { generateSearchLinks } from './services/search-service';
import { SearchResult, SearchResponse, PackageSource, WingetApiResponse, AppListExport, InstalledApp } from '../shared/types';

// window ref
let mainWindow: BrowserWindow | null = null;

// create the window
function createMainWindow(): void {
  // window config
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    title: 'WinHub',
    icon: path.join(__dirname, '../../assets/icon.ico'), // Optional: add app icon
    show: false, // Don't show until ready-to-show
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation
      preload: path.join(__dirname, 'preload.js'), // Preload script path
      webSecurity: true, // Keep web security enabled
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: 'default',
    frame: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    autoHideMenuBar: true, // Hide menu bar by default
    backgroundColor: '#ffffff' // White background while loading
  });

  // load app content
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // dev mode
    mainWindow.loadURL('http://localhost:4000');
    // open tools
    mainWindow.webContents.openDevTools();
  } else {
    // prod mode
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // show when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Focus the window
      if (process.platform === 'darwin') {
        mainWindow.focus();
      } else {
        mainWindow.focus();
      }
    }
  });

  // cleanup on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // external links help
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // nav security
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:4000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });

  // Set window subtitle
  mainWindow.setTitle('WinHub - Find and install any Windows program instantly');
}

/**
 * App event handlers
 */
app.whenReady().then(() => {
  createMainWindow();

  // mac reboot
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// quit on close
app.on('window-all-closed', () => {
  // mac keepalive
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// creation security
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

/**
 * IPC Handlers
 */

// search handler
ipcMain.handle('search-app', async (event, query: string, page: number = 0, limit: number = 20, sources: PackageSource[] = ['winget']): Promise<SearchResponse> => {
  console.log(`Main process received search query: "${query}" (page: ${page}, limit: ${limit}, sources: ${sources.join(',')})`);

  if (!query || query.trim().length === 0) {
    console.log('Empty query, returning empty response');
    return { results: [], total: 0 };
  }

  try {
    const allResults: SearchResult[] = [];
    let totalCount = 0;

    // source queue
    const sourcePromises: { source: PackageSource; promise: Promise<SearchResult[]> }[] = [];

    if (sources.includes('winget')) {
      sourcePromises.push({
        source: 'winget',
        promise: (async () => {
          const wingetResult = await searchWingetPackages(query, page, limit);
          if (!wingetResult.success || !wingetResult.data || wingetResult.data.length === 0) return [];
          totalCount += wingetResult.total || wingetResult.data.length;
          return wingetResult.data.map(pkg => ({
            name: pkg.Latest.Name,
            publisher: pkg.Latest.Publisher,
            source: 'winget' as const,
            wingetCommand: generateWingetCommand(pkg.Id),
            officialUrl: pkg.Latest.Homepage,
            versions: pkg.Versions || [],
            latestVersion: pkg.Versions && pkg.Versions.length > 0 ? pkg.Versions[0] : undefined,
            selectedVersion: pkg.Versions && pkg.Versions.length > 0 ? pkg.Versions[0] : undefined,
            packageId: pkg.Id,
            description: pkg.Latest.Description,
            license: pkg.Latest.License,
            licenseUrl: pkg.Latest.LicenseUrl,
            tags: pkg.Latest.Tags,
            homepage: pkg.Latest.Homepage
          }));
        })()
      });
    }

    if (sources.includes('chocolatey')) {
      sourcePromises.push({
        source: 'chocolatey',
        promise: (async () => {
          const chocoResult = await searchChocolateyPackages(query, page, limit);
          if (!chocoResult.success || !chocoResult.data || chocoResult.data.length === 0) return [];
          totalCount += chocoResult.total || chocoResult.data.length;
          return chocoResult.data.map(pkg => ({
            name: pkg.Title || pkg.Id,
            publisher: pkg.Authors || 'Unknown',
            source: 'chocolatey' as const,
            chocoCommand: generateChocoCommand(pkg.Id),
            officialUrl: pkg.ProjectUrl || undefined,
            homepage: pkg.ProjectUrl || undefined,
            versions: [pkg.Version],
            latestVersion: pkg.Version,
            selectedVersion: pkg.Version,
            packageId: pkg.Id,
            description: pkg.Description || pkg.Summary,
            tags: pkg.Tags ? pkg.Tags.split(' ').filter(Boolean) : undefined
          }));
        })()
      });
    }

    // parallel fetch
    const settled = await Promise.allSettled(sourcePromises.map(s => s.promise));

    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      const sourceName = sourcePromises[i].source;
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`${sourceName} returned ${result.value.length} results`);
        allResults.push(...result.value);
      } else if (result.status === 'rejected') {
        console.error(`${sourceName} search failed:`, result.reason);
      }
    }

    if (allResults.length > 0) {
      console.log(`Returning ${allResults.length} combined results`);
      return { results: allResults, total: totalCount || allResults.length };
    }

    // fallback to web
    console.log('No package results found, falling back to web search...');
    const searchLinksResult = await generateSearchLinks(query);
    const fallbackResults: SearchResult[] = [];

    if (searchLinksResult.success && searchLinksResult.data) {
      fallbackResults.push({
        name: `Search for "${query}" online`,
        publisher: 'Web Search',
        source: 'web',
        searchUrls: searchLinksResult.data
      });
    }

    try {
      const officialSite = await findOfficialWebsite(query);
      if (officialSite.success && officialSite.data) {
        fallbackResults.unshift({
          name: query,
          publisher: 'Official Website',
          source: 'web',
          officialUrl: officialSite.data
        });
      }
    } catch (websiteError) {
      console.log('Could not find official website:', websiteError);
    }

    return { results: fallbackResults, total: fallbackResults.length };

  } catch (error) {
    console.error('Search error:', error);

    const searchLinksResult = await generateSearchLinks(query);
    if (searchLinksResult.success && searchLinksResult.data) {
      return {
        results: [{
          name: `Search for "${query}" online`,
          publisher: 'Web Search',
          source: 'web',
          searchUrls: searchLinksResult.data
        }],
        total: 1
      };
    }

    return { results: [], total: 0 };
  }
});

// copy handler
ipcMain.handle('copy-to-clipboard', async (event, text: string): Promise<boolean> => {
  try {
    if (!text || typeof text !== 'string') {
      return false;
    }

    clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
    return true;
  } catch (error) {
    console.error('Clipboard error:', error);
    return false;
  }
});

// version info
ipcMain.handle('get-app-version', async (): Promise<string> => {
  return app.getVersion();
});

// versioned command handler
ipcMain.handle('generate-winget-command', async (event, packageId: string, version?: string): Promise<string> => {
  try {
    return generateWingetCommand(packageId, version);
  } catch (error) {
    console.error('Generate WinGet command error:', error);
    return '';
  }
});

// installer handler
ipcMain.handle('execute-winget-install', async (event, command: string): Promise<{ success: boolean; message: string; needsElevation?: boolean }> => {
  if (!command || typeof command !== 'string') {
    return { success: false, message: 'Invalid command provided' };
  }

  return new Promise((resolve) => {
    console.log('Executing winget command:', command);
    
    // Extract the package ID from the command (e.g., "winget install Discord.Discord")
    const packageId = command.replace('winget install ', '').trim();
    
    // admin powershell spawn
    const wingetProcess = spawn('powershell', [
      '-Command',
      `Start-Process -FilePath "winget" -ArgumentList "install","${packageId}","--silent","--accept-package-agreements","--accept-source-agreements" -Verb RunAs -Wait`
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    wingetProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    wingetProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    wingetProcess.on('close', (code) => {
      console.log('WinGet process exit code:', code);
      console.log('Output:', output);
      console.log('Error output:', errorOutput);

      if (code === 0) {
        resolve({ 
          success: true, 
          message: `Successfully started installation of ${packageId}` 
        });
      } else if (code === 1 && errorOutput.includes('elevation')) {
        resolve({ 
          success: false, 
          message: 'Installation requires administrator privileges. Please run as administrator.', 
          needsElevation: true 
        });
      } else {
        resolve({ 
          success: false, 
          message: `Installation failed: ${errorOutput || 'Unknown error'}` 
        });
      }
    });

    wingetProcess.on('error', (error) => {
      console.error('WinGet process error:', error);
      resolve({ 
        success: false, 
        message: `Failed to start installation: ${error.message}` 
      });
    });

    // 1min timeout
    setTimeout(() => {
      wingetProcess.kill();
      resolve({ 
        success: false, 
        message: 'Installation timed out. The process may still be running in the background.' 
      });
    }, 60000);
  });
});

// ready event
ipcMain.on('renderer-ready', () => {
  console.log('Renderer process is ready');
});

// error logging
ipcMain.on('renderer-error', (event, errorInfo) => {
  console.error('Renderer error received:', errorInfo);
});

// export handler
ipcMain.handle('export-installed-apps', async () => {
  try {
    console.log('Starting export of installed apps...');
    
    return new Promise<{ success: boolean; data?: AppListExport; message?: string }>((resolve) => {
      const wingetProcess = spawn('winget', ['list'], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      wingetProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      wingetProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      wingetProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('WinGet list failed:', errorOutput);
          resolve({
            success: false,
            message: 'Failed to get installed apps list. Make sure WinGet is installed and available.'
          });
          return;
        }

        try {
          // Parse winget list output
          const lines = output.split('\n').filter(line => line.trim());
          const apps: InstalledApp[] = [];
          const packageIds: string[] = [];

          // Skip header lines and parse package data
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('---') || line.includes('Name') || !line) continue;

            // Try to extract package ID (usually in the second column)
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
              // Look for package ID pattern (usually Publisher.AppName)
              for (const part of parts) {
                if (part.includes('.') && !part.startsWith('http') && part.length > 3) {
                  const packageId = part;
                  const name = parts[0] || packageId.split('.')[1] || packageId;
                  
                  apps.push({
                    name: name,
                    packageId: packageId
                  });
                  packageIds.push(packageId);
                  break;
                }
              }
            }
          }

          // bulk command
          const wingetCommand = packageIds.length > 0 
            ? `winget install --accept-package-agreements --accept-source-agreements ${packageIds.join(' ')}`
            : '';

          const exportData: AppListExport = {
            exportedAt: new Date().toISOString(),
            computerName: os.hostname(),
            apps: apps,
            wingetCommand: wingetCommand,
            totalApps: apps.length
          };

          console.log(`Exported ${apps.length} installed apps`);
          resolve({
            success: true,
            data: exportData
          });

        } catch (parseError) {
          console.error('Error parsing winget output:', parseError);
          resolve({
            success: false,
            message: 'Failed to parse installed apps list'
          });
        }
      });

      wingetProcess.on('error', (error) => {
        console.error('WinGet process error:', error);
        resolve({
          success: false,
          message: `Failed to access WinGet: ${error.message}`
        });
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});

// save to disk
ipcMain.handle('save-export-file', async (event, exportData: AppListExport) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Save App List Export',
      defaultPath: `WinHub-Apps-${exportData.computerName}-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf8');
      return {
        success: true,
        filePath: result.filePath
      };
    }

    return {
      success: false,
      message: 'Save cancelled by user'
    };
  } catch (error) {
    console.error('Save export error:', error);
    return {
      success: false,
      message: `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});

// load from disk
ipcMain.handle('load-import-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Import App List',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const importData: AppListExport = JSON.parse(fileContent);

      // validation
      if (!importData.apps || !Array.isArray(importData.apps) || !importData.wingetCommand) {
        return {
          success: false,
          message: 'Invalid import file format'
        };
      }

      return {
        success: true,
        data: importData
      };
    }

    return {
      success: false,
      message: 'Import cancelled by user'
    };
  } catch (error) {
    console.error('Load import error:', error);
    return {
      success: false,
      message: `Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});

// bulk installer
ipcMain.handle('execute-bulk-install', async (event, wingetCommand: string) => {
  try {
    console.log('Starting bulk installation...');
    
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      const wingetProcess = spawn('winget', wingetCommand.replace('winget ', '').split(' '), {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      wingetProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      wingetProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      wingetProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            message: 'Bulk installation completed successfully!'
          });
        } else {
          console.error('Bulk installation failed:', errorOutput);
          resolve({
            success: false,
            message: `Bulk installation failed. Some apps may have been installed. Error: ${errorOutput || 'Unknown error'}`
          });
        }
      });

      wingetProcess.on('error', (error) => {
        console.error('WinGet bulk install error:', error);
        resolve({
          success: false,
          message: `Failed to start bulk installation: ${error.message}`
        });
      });
    });
  } catch (error) {
    console.error('Bulk install error:', error);
    return {
      success: false,
      message: `Bulk installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});

// availability check
ipcMain.handle('check-winget-availability', async () => {
  try {
    console.log('Checking WinGet availability...');
    
    return new Promise<{ available: boolean; message: string; version?: string }>((resolve) => {
      const wingetProcess = spawn('winget', ['--version'], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      wingetProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      wingetProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      wingetProcess.on('close', (code) => {
        if (code === 0) {
          const version = output.trim();
          resolve({
            available: true,
            message: `WinGet is available (${version})`,
            version: version
          });
        } else {
          resolve({
            available: false,
            message: 'WinGet is not installed or not accessible'
          });
        }
      });

      wingetProcess.on('error', (error) => {
        console.error('WinGet check error:', error);
        resolve({
          available: false,
          message: 'WinGet is not installed on this system'
        });
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        wingetProcess.kill();
        resolve({
          available: false,
          message: 'WinGet check timed out'
        });
      }, 10000);
    });
  } catch (error) {
    console.error('WinGet availability check error:', error);
    return {
      available: false,
      message: 'Failed to check WinGet availability'
    };
  }
});

// installer helper
ipcMain.handle('install-winget', async () => {
  try {
    console.log('Starting WinGet installation...');
    
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      // PowerShell command to install WinGet from Microsoft Store
      const installCommand = `
        try {
          # Check if running as admin
          $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
          
          if (-not $isAdmin) {
            Write-Output "ERROR: Administrator privileges required for WinGet installation"
            exit 1
          }
          
          # Install WinGet via Microsoft Store or direct download
          Write-Output "Installing Microsoft App Installer (WinGet)..."
          
          # Method 1: Try installing via Microsoft Store
          try {
            $storeApp = Get-AppxPackage -Name Microsoft.DesktopAppInstaller
            if ($storeApp) {
              Write-Output "App Installer found, updating..."
              Add-AppxPackage -Path "https://aka.ms/getwinget" -ForceApplicationShutdown
            } else {
              Write-Output "Installing App Installer from Microsoft Store..."
              Add-AppxPackage -Path "https://aka.ms/getwinget"
            }
          } catch {
            Write-Output "Store installation failed, trying direct download..."
            
            # Method 2: Direct download and install
            $tempPath = "$env:TEMP\\Microsoft.DesktopAppInstaller.appxbundle"
            $downloadUrl = "https://github.com/microsoft/winget-cli/releases/latest/download/Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
            
            Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath
            Add-AppxPackage -Path $tempPath
            Remove-Item $tempPath -Force
          }
          
          Write-Output "WinGet installation completed successfully!"
          Write-Output "Please restart your terminal to use WinGet commands."
          
        } catch {
          Write-Output "ERROR: Failed to install WinGet - $($_.Exception.Message)"
          exit 1
        }
      `.trim();

      const powershellProcess = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-Command', installCommand], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      powershellProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      powershellProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      powershellProcess.on('close', (code) => {
        if (code === 0 && !output.includes('ERROR:')) {
          resolve({
            success: true,
            message: 'WinGet has been installed successfully! Please restart your terminal to use WinGet commands.'
          });
        } else {
          const errorMsg = output.includes('ERROR:') ? output : errorOutput;
          resolve({
            success: false,
            message: `WinGet installation failed: ${errorMsg || 'Unknown error'}`
          });
        }
      });

      powershellProcess.on('error', (error) => {
        console.error('PowerShell process error:', error);
        resolve({
          success: false,
          message: `Failed to run installation script: ${error.message}`
        });
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        powershellProcess.kill();
        resolve({
          success: false,
          message: 'WinGet installation timed out. Please try installing manually.'
        });
      }, 300000);
    });
  } catch (error) {
    console.error('WinGet installation error:', error);
    return {
      success: false,
      message: `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});

// protocol support
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('winhub', process.execPath, [path.resolve(process.argv[1])]);
  }
}