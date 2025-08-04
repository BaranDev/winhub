import { SearchEngineLink, ServiceResult } from '../../shared/types';

/**
 * Generates search engine links for finding and downloading an application
 * @param appName - The name of the application to search for
 * @returns Promise<ServiceResult<SearchEngineLink[]>>
 */
export async function generateSearchLinks(appName: string): Promise<ServiceResult<SearchEngineLink[]>> {
  if (!appName || appName.trim().length === 0) {
    return {
      success: false,
      error: { message: 'Application name cannot be empty' }
    };
  }

  try {
    const trimmedAppName = appName.trim();
    const encodedAppName = encodeURIComponent(`download ${trimmedAppName} official`);
    
    const searchLinks: SearchEngineLink[] = [
      {
        engine: 'Google',
        url: `https://www.google.com/search?q=${encodedAppName}&safe=active`
      },
      {
        engine: 'DuckDuckGo',
        url: `https://duckduckgo.com/?q=${encodedAppName}&safe-search=moderate`
      },
      {
        engine: 'Bing',
        url: `https://www.bing.com/search?q=${encodedAppName}&setlang=en`
      },
      {
        engine: 'Yandex',
        url: `https://yandex.com/search/?text=${encodedAppName}&lr=10418`
      }
    ];

    // Add specialized search links for software
    const softwareSearchLinks: SearchEngineLink[] = [
      {
        engine: 'AlternativeTo',
        url: `https://alternativeto.net/browse/search/?q=${encodeURIComponent(trimmedAppName)}`
      },
      {
        engine: 'Softpedia',
        url: `https://www.softpedia.com/dyn-search.php?search_term=${encodeURIComponent(trimmedAppName)}`
      }
    ];

    // Combine all search links
    const allSearchLinks = [...searchLinks, ...softwareSearchLinks];

    return {
      success: true,
      data: allSearchLinks
    };

  } catch (error) {
    console.error('Search links generation error:', error);
    
    let errorMessage = 'Failed to generate search links';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        code: 'SEARCH_LINKS_ERROR'
      }
    };
  }
}

/**
 * Generates a direct search URL for a specific search engine
 * @param engine - The search engine name
 * @param appName - The application name to search for
 * @returns string | null
 */
export function generateDirectSearchUrl(engine: string, appName: string): string | null {
  if (!engine || !appName) return null;

  const trimmedAppName = appName.trim();
  const searchQuery = `download ${trimmedAppName} official`;
  
  switch (engine.toLowerCase()) {
    case 'google':
      return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&safe=active`;
    
    case 'duckduckgo':
    case 'ddg':
      return `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&safe-search=moderate`;
    
    case 'bing':
      return `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&setlang=en`;
    
    case 'yandex':
      return `https://yandex.com/search/?text=${encodeURIComponent(searchQuery)}&lr=10418`;
    
    case 'alternativeto':
      return `https://alternativeto.net/browse/search/?q=${encodeURIComponent(trimmedAppName)}`;
    
    case 'softpedia':
      return `https://www.softpedia.com/dyn-search.php?search_term=${encodeURIComponent(trimmedAppName)}`;
    
    default:
      return null;
  }
}

/**
 * Gets a user-friendly search engine name
 * @param engine - The search engine identifier
 * @returns string
 */
export function getSearchEngineName(engine: string): string {
  const engineNames: Record<string, string> = {
    'google': 'Google',
    'duckduckgo': 'DuckDuckGo',
    'ddg': 'DuckDuckGo',
    'bing': 'Bing',
    'yandex': 'Yandex',
    'alternativeto': 'AlternativeTo',
    'softpedia': 'Softpedia'
  };

  return engineNames[engine.toLowerCase()] || engine;
}

/**
 * Validates if a search engine is supported
 * @param engine - The search engine to validate
 * @returns boolean
 */
export function isSupportedSearchEngine(engine: string): boolean {
  const supportedEngines = [
    'google', 'duckduckgo', 'ddg', 'bing', 'yandex', 
    'alternativeto', 'softpedia'
  ];
  
  return supportedEngines.includes(engine.toLowerCase());
}

/**
 * Creates a Windows search query that can be used with the system's default search
 * @param appName - The application name
 * @returns string
 */
export function createWindowsSearchQuery(appName: string): string {
  if (!appName || appName.trim().length === 0) {
    return '';
  }
  
  // Windows search query format
  return `search-ms:displayname=Search%20Results%20in%20Apps&query=${encodeURIComponent(appName)}`;
}

/**
 * Generates specialized download site searches
 * @param appName - The application name
 * @returns SearchEngineLink[]
 */
export function generateDownloadSiteLinks(appName: string): SearchEngineLink[] {
  if (!appName || appName.trim().length === 0) {
    return [];
  }

  const trimmedAppName = appName.trim();
  
  return [
    {
      engine: 'GitHub',
      url: `https://github.com/search?q=${encodeURIComponent(trimmedAppName)}&type=repositories`
    },
    {
      engine: 'SourceForge',
      url: `https://sourceforge.net/directory/?q=${encodeURIComponent(trimmedAppName)}`
    },
    {
      engine: 'FossHub',
      url: `https://www.fosshub.com/search?q=${encodeURIComponent(trimmedAppName)}`
    },
    {
      engine: 'FileHorse',
      url: `https://www.filehorse.com/search?q=${encodeURIComponent(trimmedAppName)}`
    }
  ];
}

/**
 * Creates search links specifically for open source software
 * @param appName - The application name
 * @returns SearchEngineLink[]
 */
export function generateOpenSourceLinks(appName: string): SearchEngineLink[] {
  if (!appName || appName.trim().length === 0) {
    return [];
  }

  const trimmedAppName = appName.trim();
  
  return [
    {
      engine: 'GitHub',
      url: `https://github.com/search?q=${encodeURIComponent(trimmedAppName)}&type=repositories&s=stars&o=desc`
    },
    {
      engine: 'GitLab',
      url: `https://gitlab.com/search?search=${encodeURIComponent(trimmedAppName)}&nav_source=navbar`
    },
    {
      engine: 'Open Source Alternative',
      url: `https://www.opensourcealternative.to/search?q=${encodeURIComponent(trimmedAppName)}`
    },
    {
      engine: 'F-Droid (Android)',
      url: `https://search.f-droid.org/?q=${encodeURIComponent(trimmedAppName)}`
    }
  ];
}
