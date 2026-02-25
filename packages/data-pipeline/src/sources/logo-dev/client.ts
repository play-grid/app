import type { LogoDevSearchResult } from './types';
import { ExternalAPIBase } from '@guess-logo/data-provider/fetchers';

export class LogoDevClient extends ExternalAPIBase {
  protected buildHeaders(inputHeaders?: HeadersInit): Headers {
    const headers = super.buildHeaders(inputHeaders);

    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }

    return headers;
  }

  async searchCompany(companyName: string): Promise<LogoDevSearchResult[]> {
    const isDomain = companyName.includes('.') && /^[a-z0-9.-]+$/i.test(companyName);
    const searchQuery = isDomain
      ? companyName.toLowerCase()
      : companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const results = await this.get<LogoDevSearchResult[]>(
      `/search?q=${encodeURIComponent(searchQuery)}`,
    );

    return results || [];
  }

  async getLogoUrl(companyName: string): Promise<string | null> {
    const results = await this.searchCompany(companyName);
    if (!results || results.length === 0) return null;

    const isDomain = companyName.includes('.');
    const target = isDomain
      ? results.find(r => r.domain.toLowerCase() === companyName.toLowerCase())
      : results.find(r => r.logo_url) || results[0];

    return target?.logo_url || null;
  }
}
