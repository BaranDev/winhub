// Shared types for both main and renderer processes
export interface SearchResult {
  name: string;
  publisher: string;
  wingetCommand?: string;
  officialUrl?: string;
  searchUrls?: SearchEngineLink[];
  versions?: string[];
  latestVersion?: string;
  selectedVersion?: string;
  packageId?: string;
  description?: string;
  license?: string;
  licenseUrl?: string;
  tags?: string[];
  homepage?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface SearchEngineLink {
  engine: string;
  url: string;
}

// PC Migration Types
export interface InstalledApp {
  name: string;
  packageId: string;
  version?: string;
}

export interface AppListExport {
  exportedAt: string;
  computerName: string;
  apps: InstalledApp[];
  wingetCommand: string;
  totalApps: number;
}

// WinGet API Response Types
export interface WingetPackage {
  Id: string;
  Versions: string[];
  Latest: {
    Name: string;
    Publisher: string;
    Tags?: string[];
    Description?: string;
    Homepage?: string;
    License?: string;
    LicenseUrl?: string;
  };
  Featured: boolean;
  IconUrl?: string;
  Banner?: string;
  Logo?: string;
  UpdatedAt: string;
  CreatedAt: string;
  SearchScore: number;
}

export interface WingetVersion {
  version: string;
  packageUrl?: string;
  installerType?: string;
  scope?: string;
}

export interface WingetApiResponse {
  Packages: WingetPackage[];
  Total: number;
}

// Google Custom Search API Types
export interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

// Service Response Types
export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  total?: number;
}

// IPC Communication Types
export interface ElectronAPI {
  searchApp: (query: string, page?: number, limit?: number) => Promise<SearchResponse>;
  copyToClipboard: (text: string) => Promise<boolean>;
  executeWingetInstall: (command: string) => Promise<{success: boolean; message: string; needsElevation?: boolean}>;
  generateWingetCommand: (packageId: string, version?: string) => Promise<string>;
  exportInstalledApps: () => Promise<{success: boolean; data?: AppListExport; message?: string}>;
  saveExportFile: (exportData: AppListExport) => Promise<{success: boolean; filePath?: string; message?: string}>;
  loadImportFile: () => Promise<{success: boolean; data?: AppListExport; message?: string}>;
  executeBulkInstall: (wingetCommand: string) => Promise<{success: boolean; message: string}>;
  checkWingetAvailability: () => Promise<{available: boolean; message: string; version?: string}>;
  installWinget: () => Promise<{success: boolean; message: string}>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
