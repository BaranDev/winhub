import { SearchEngineLink, ServiceResult } from '../../shared/types';

// generate external search engine links
export async function generateSearchLinks(appName: string): Promise<ServiceResult<SearchEngineLink[]>> {
  if (!appName || appName.trim().length === 0) {
    return {
      success: false,
      error: { message: 'Application name cannot be empty' }
    };
  }

  try {
    const trimmedAppName = appName.trim();
    const encodedAppName = encodeURIComponent(`download ${trimmedAppName} official site`);
    
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

    // specialized software search
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

    // combine all links
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

// build direct url
export function generateDirectSearchUrl(engine: string, appName: string): string | null {
  if (!engine || !appName) return null;

  const trimmedAppName = appName.trim();
  const searchQuery = `download ${trimmedAppName} official site`;
  
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

// friendly engine names
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

// support check
export function isSupportedSearchEngine(engine: string): boolean {
  const supportedEngines = [
    'google', 'duckduckgo', 'ddg', 'bing', 'yandex', 
    'alternativeto', 'softpedia'
  ];
  
  return supportedEngines.includes(engine.toLowerCase());
}

// system search link
export function createWindowsSearchQuery(appName: string): string {
  if (!appName || appName.trim().length === 0) {
    return '';
  }
  
  // windows search syntax
  return `search-ms:displayname=Search%20Results%20in%20Apps&query=${encodeURIComponent(appName)}`;
}

// github/sourceforge etc.
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

// open source specific links
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
