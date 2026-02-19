import { WingetApiResponse, WingetPackage, ServiceResult } from '../../shared/types';
const fetch = require('node-fetch');

// cache winget results in memory
class WingetCache {
  private cache = new Map<string, { data: WingetPackage[]; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(query: string): WingetPackage[] | null {
    const entry = this.cache.get(query.toLowerCase());
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(query.toLowerCase());
      return null;
    }
    
    return entry.data;
  }

  set(query: string, data: WingetPackage[]): void {
    this.cache.set(query.toLowerCase(), {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const wingetCache = new WingetCache();

// search winget repo
export async function searchWingetPackages(query: string, page: number = 0, limit: number = 20): Promise<ServiceResult<WingetPackage[]>> {
  if (!query || query.trim().length === 0) {
    return {
      success: false,
      error: { message: 'Search query cannot be empty' }
    };
  }

  const trimmedQuery = query.trim();
  const cacheKey = `${trimmedQuery}_${page}_${limit}`;
  
  // query cache
  const cachedResult = wingetCache.get(cacheKey);
  if (cachedResult) {
    return {
      success: true,
      data: cachedResult
    };
  }

  try {
    console.log(`Starting WinGet search for: ${trimmedQuery} (page: ${page}, limit: ${limit})`);
    const apiUrl = `https://api.winget.run/v2/packages`;
    
    // take/page for paging
    const take = Math.min(limit, 24);
    const searchParams = new URLSearchParams({
      query: trimmedQuery,
      take: take.toString(),
      page: page.toString()
    });

    console.log(`WinGet API URL: ${apiUrl}?${searchParams}`);

    const response = await fetch(`${apiUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'WinHub/1.0.0',
        'Accept': 'application/json'
      }
      // Removed timeout for now to test
    });

    console.log(`WinGet API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`WinGet API error: ${response.status} ${response.statusText}`);
    }

    const apiResponse = await response.json() as WingetApiResponse;
    console.log(`WinGet API response:`, JSON.stringify(apiResponse, null, 2).substring(0, 500));
    
    if (!apiResponse.Packages || !Array.isArray(apiResponse.Packages)) {
      return {
        success: true,
        data: []
      };
    }

    // map to local type
    const packages: WingetPackage[] = apiResponse.Packages.map(pkg => ({
      Id: pkg.Id || '',
      Versions: pkg.Versions || [],
      Latest: {
        Name: pkg.Latest?.Name || 'Unknown Package',
        Publisher: pkg.Latest?.Publisher || 'Unknown Publisher',
        Tags: pkg.Latest?.Tags || [],
        Description: pkg.Latest?.Description,
        Homepage: pkg.Latest?.Homepage,
        License: pkg.Latest?.License,
        LicenseUrl: pkg.Latest?.LicenseUrl
      },
      Featured: pkg.Featured || false,
      IconUrl: pkg.IconUrl,
      Banner: pkg.Banner,
      Logo: pkg.Logo,
      UpdatedAt: pkg.UpdatedAt || '',
      CreatedAt: pkg.CreatedAt || '',
      SearchScore: pkg.SearchScore || 0
    }));

    console.log(`WinGet search returned ${packages.length} results for page ${page}`);
    
    // save to cache
    wingetCache.set(cacheKey, packages);

    console.log(`Returning WinGet results: ${packages.length}`);
    return {
      success: true,
      data: packages,
      total: apiResponse.Total || packages.length
    };

  } catch (error) {
    console.error('WinGet search error:', error);
    console.error('Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message
    });
    
    let errorMessage = 'Failed to search WinGet packages';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Search request timed out';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - check your internet connection';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        code: 'WINGET_API_ERROR'
      }
    };
  }
}

// build install string
export function generateWingetCommand(packageId: string, version?: string): string {
  if (!packageId || packageId.trim().length === 0) {
    return '';
  }
  
  const baseCommand = `winget install --id=${packageId.trim()} --accept-source-agreements --accept-package-agreements`;
  
  if (version && version.trim().length > 0) {
    return `${baseCommand} --version=${version.trim()}`;
  }
  
  return baseCommand;
}

// validate package id format
export function isValidPackageId(packageId: string): boolean {
  if (!packageId || typeof packageId !== 'string') {
    return false;
  }
  
  // regex for dots/alphanum
  const packageIdRegex = /^[a-zA-Z0-9\.\-_]+$/;
  return packageIdRegex.test(packageId) && packageId.length > 2;
}

// empty cache
export function clearWingetCache(): void {
  wingetCache.clear();
}
