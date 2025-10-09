import env from '@/env';

export interface SearchResult {
  name: string;
  domain: string;
  logo_url?: string;
}

// Detect if a string is a domain (contains a dot and looks like domain.com)
function isDomain(str: string): boolean {
  return str.includes('.') && /^[a-z0-9.-]+$/i.test(str);
}

export async function fetchCompanyLogo(
  companyName: string,
): Promise<{ logo: string | null; name: string | null; domain: string | null }> {
  try {
    const trimmedName = companyName.trim();
    const isInputDomain = isDomain(trimmedName);

    // Build the search query
    let searchQuery: string;
    if (isInputDomain) {
      // For domains like "x.com" or "stc.com.sa", use as-is
      searchQuery = trimmedName.toLowerCase();
    }
    else {
      // For company names like "Apple", sanitize to lowercase alphanumeric
      searchQuery = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    const url = `https://api.logo.dev/search?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.LOGO_DEV_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Logo.dev API returned ${response.status}`);
    }

    const searchData = await response.json() as SearchResult[];

    if (!searchData || searchData.length === 0) {
      console.warn(`No results for: ${companyName}`);
      return { logo: null, name: null, domain: null };
    }

    let targetResult: SearchResult | null = null;

    // If input was a domain, try to find exact domain match first
    if (isInputDomain) {
      const inputDomainLower = trimmedName.toLowerCase();
      targetResult = searchData.find(r =>
        r.domain.toLowerCase() === inputDomainLower,
      ) || null;
    }

    // Fallback: First result with a logo_url, or just first result
    if (!targetResult) {
      targetResult = searchData.find(r => r.logo_url) || searchData[0];
    }

    const result = {
      logo: targetResult.logo_url || null,
      name: targetResult.name || null,
      domain: targetResult.domain || null,
    };

    return result;
  }
  catch (error) {
    console.error(`Error fetching logo for ${companyName}:`, error);
    return { logo: null, name: null, domain: null };
  }
}
