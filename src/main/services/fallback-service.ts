import { GoogleSearchResponse, GoogleSearchItem, ServiceResult } from '../../shared/types';
const fetch = require('node-fetch');

// Simple cache for website search results
class WebsiteCache {
  private cache = new Map<string, { url: string | null; timestamp: number }>();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  get(appName: string): string | null | undefined {
    const entry = this.cache.get(appName.toLowerCase());
    if (!entry) return undefined;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(appName.toLowerCase());
      return undefined;
    }
    
    return entry.url;
  }

  set(appName: string, url: string | null): void {
    this.cache.set(appName.toLowerCase(), {
      url,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const websiteCache = new WebsiteCache();

/**
 * Finds the official website for an application using Google Custom Search
 * @param appName - The name of the application
 * @returns Promise<ServiceResult<string | null>>
 */
export async function findOfficialWebsite(appName: string): Promise<ServiceResult<string | null>> {
  if (!appName || appName.trim().length === 0) {
    return {
      success: false,
      error: { message: 'Application name cannot be empty' }
    };
  }

  const trimmedAppName = appName.trim();
  
  // Check cache first
  const cachedResult = websiteCache.get(trimmedAppName);
  if (cachedResult !== undefined) {
    return {
      success: true,
      data: cachedResult
    };
  }

  try {
    // Use Google Custom Search API if available, otherwise fallback to direct search
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    let officialUrl: string | null = null;

    if (googleApiKey && searchEngineId) {
      officialUrl = await searchWithGoogleAPI(trimmedAppName, googleApiKey, searchEngineId);
    } else {
      // Fallback: try to construct common official website patterns
      officialUrl = await guessOfficialWebsite(trimmedAppName);
    }

    // Cache the result
    websiteCache.set(trimmedAppName, officialUrl);

    return {
      success: true,
      data: officialUrl
    };

  } catch (error) {
    console.error('Website search error:', error);
    
    let errorMessage = 'Failed to find official website';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        code: 'WEBSITE_SEARCH_ERROR'
      }
    };
  }
}

/**
 * Search for official website using Google Custom Search API
 */
async function searchWithGoogleAPI(appName: string, apiKey: string, searchEngineId: string): Promise<string | null> {
  const searchQuery = `${appName} official website download`;
  const apiUrl = 'https://customsearch.googleapis.com/customsearch/v1';
  
  const searchParams = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: searchQuery,
    num: '5',
    safe: 'active'
  });

  const response = await fetch(`${apiUrl}?${searchParams}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'WinHub/1.0.0'
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Google Search API error: ${response.status}`);
  }

  const searchResponse = await response.json() as GoogleSearchResponse;
  
  if (!searchResponse.items || searchResponse.items.length === 0) {
    return null;
  }

  // Find the most likely official website
  return findOfficialFromResults(appName, searchResponse.items);
}

/**
 * Analyzes search results to find the most likely official website
 */
function findOfficialFromResults(appName: string, items: GoogleSearchItem[]): string | null {
  const appNameLower = appName.toLowerCase();
  
  // Scoring system for results
  const scoredResults = items.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const linkLower = item.link.toLowerCase();
    const displayLinkLower = item.displayLink.toLowerCase();
    
    // Higher score for exact name matches
    if (titleLower.includes(appNameLower)) score += 3;
    if (linkLower.includes(appNameLower.replace(/\s+/g, ''))) score += 2;
    if (displayLinkLower.includes(appNameLower.replace(/\s+/g, ''))) score += 2;
    
    // Higher score for official-looking domains
    if (linkLower.includes('official') || titleLower.includes('official')) score += 2;
    if (linkLower.includes('download') || titleLower.includes('download')) score += 1;
    
    // Prefer common official patterns
    if (linkLower.match(/\.(com|org|net|io)$/)) score += 1;
    
    // Avoid obviously non-official sites
    if (linkLower.includes('wikipedia') || 
        linkLower.includes('github.com') ||
        linkLower.includes('sourceforge') ||
        linkLower.includes('softonic') ||
        linkLower.includes('cnet') ||
        linkLower.includes('filehippo')) {
      score -= 2;
    }
    
    return { item, score };
  });
  
  // Sort by score and return the highest scoring result
  scoredResults.sort((a, b) => b.score - a.score);
  
  return scoredResults.length > 0 && scoredResults[0].score > 0 
    ? scoredResults[0].item.link 
    : null;
}

/**
 * Attempts to guess official website patterns when API is not available
 */
async function guessOfficialWebsite(appName: string): Promise<string | null> {
  const nameForUrl = appName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  
  // Common patterns for official websites
  const patterns = [
    `https://${nameForUrl}.com`,
    `https://www.${nameForUrl}.com`,
    `https://${nameForUrl}.org`,
    `https://www.${nameForUrl}.org`,
    `https://${nameForUrl}.io`,
    `https://www.${nameForUrl}.io`,
    `https://${nameForUrl}.net`,
    `https://www.${nameForUrl}.net`
  ];
  
  // Test each pattern to see if it's accessible
  for (const url of patterns) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        return url;
      }
    } catch {
      // Continue to next pattern
    }
  }
  
  return null;
}

/**
 * Validates if a URL appears to be an official download page
 */
export function isOfficialDownloadUrl(url: string, appName: string): boolean {
  if (!url || !appName) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    const appNameClean = appName.toLowerCase().replace(/\s+/g, '');
    
    // Check if domain contains app name
    const domainContainsApp = hostname.includes(appNameClean);
    
    // Check for download-related paths
    const hasDownloadPath = pathname.includes('download') || 
                           pathname.includes('get') || 
                           pathname.includes('install');
    
    // Avoid known non-official domains
    const nonOfficialDomains = [
      'github.com', 'sourceforge.net', 'softonic.com', 
      'cnet.com', 'filehippo.com', 'wikipedia.org'
    ];
    
    const isNonOfficial = nonOfficialDomains.some(domain => 
      hostname.includes(domain)
    );
    
    return (domainContainsApp || hasDownloadPath) && !isNonOfficial;
  } catch {
    return false;
  }
}

/**
 * Clears the website search cache
 */
export function clearWebsiteCache(): void {
  websiteCache.clear();
}
