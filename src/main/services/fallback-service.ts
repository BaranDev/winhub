import { GoogleSearchResponse, GoogleSearchItem, ServiceResult } from '../../shared/types';
const fetch = require('node-fetch');

// simple website result cache
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

// find official site via ddg html scraper
export async function findOfficialWebsite(appName: string): Promise<ServiceResult<string | null>> {
  if (!appName || appName.trim().length === 0) {
    return {
      success: false,
      error: { message: 'Application name cannot be empty' }
    };
  }

  const trimmedAppName = appName.trim();
  
  // check cache
  const cachedResult = websiteCache.get(trimmedAppName);
  if (cachedResult !== undefined) {
    return {
      success: true,
      data: cachedResult
    };
  }

  try {
    const searchQuery = encodeURIComponent(`official site ${trimmedAppName} download`);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo Search error: ${response.status}`);
    }

    const htmlText = await response.text();
    const officialUrl = extractUrlFromDDGHtml(htmlText, trimmedAppName);

    // cache result
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

// extract urls from html
function extractUrlFromDDGHtml(html: string, appName: string): string | null {
  // match result links
  const urlParamsRegex = /uddg=([^&'"]+)/g;
  
  const extractedUrls: string[] = [];
  let match;
  
  while ((match = urlParamsRegex.exec(html)) !== null) {
    try {
      // decode url
      const decodedUrl = decodeURIComponent(match[1]);
      extractedUrls.push(decodedUrl);
    } catch {
      continue;
    }
  }

  if (extractedUrls.length === 0) {
    return null;
  }

  // mock for scoring
  const mockItems: GoogleSearchItem[] = extractedUrls.map(url => {
    let hostname = '';
    try { hostname = new URL(url).hostname; } catch {}
    return {
      title: hostname,
      link: url,
      displayLink: hostname,
      snippet: ''
    };
  });

  return findOfficialFromResults(appName, mockItems);
}

// find most likely official site by scoring
function findOfficialFromResults(appName: string, items: GoogleSearchItem[]): string | null {
  const appNameLower = appName.toLowerCase();
  
  // score the results
  const scoredResults = items.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const linkLower = item.link.toLowerCase();
    const displayLinkLower = item.displayLink.toLowerCase();
    
    // boost exact name matches
    if (titleLower.includes(appNameLower)) score += 3;
    if (linkLower.includes(appNameLower.replace(/\s+/g, ''))) score += 2;
    if (displayLinkLower.includes(appNameLower.replace(/\s+/g, ''))) score += 2;
    
    // boost official domains
    if (linkLower.includes('official') || titleLower.includes('official')) score += 2;
    if (linkLower.includes('download') || titleLower.includes('download')) score += 1;
    
    // prefer .com/.org/.io
    if (linkLower.match(/\.(com|org|net|io)$/)) score += 1;
    
    // skip aggregate sites like softonic
    if (linkLower.includes('wikipedia') || 
        linkLower.includes('github.com') ||
        linkLower.includes('sourceforge') ||
        linkLower.includes('softonic') ||
        linkLower.includes('cnet') ||
        linkLower.includes('filehippo') ||
        linkLower.includes('uptodown') ||
        linkLower.includes('alternativeto')) {
      score -= 5;
    }
    
    return { item, score };
  });
  
  // sort and return best
  scoredResults.sort((a, b) => b.score - a.score);
  
  return scoredResults.length > 0 && scoredResults[0].score > -3
    ? scoredResults[0].item.link 
    : null;
}

// check if url looks official
export function isOfficialDownloadUrl(url: string, appName: string): boolean {
  if (!url || !appName) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    const appNameClean = appName.toLowerCase().replace(/\s+/g, '');
    
    // domain match
    const domainContainsApp = hostname.includes(appNameClean);
    
    // download paths
    const hasDownloadPath = pathname.includes('download') || 
                           pathname.includes('get') || 
                           pathname.includes('install');
    
    // filter non-official domains
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

// clear cache
export function clearWebsiteCache(): void {
  websiteCache.clear();
}
