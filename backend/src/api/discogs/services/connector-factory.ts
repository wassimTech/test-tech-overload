import type {
  IDiscogsConnector,
  DiscogsSearchResult,
  DiscogsRelease,
  PublishListingParams,
  PublishListingResult,
} from '@/api/discogs/types';
import { MockDiscogsConnector } from './mock-discogs-connector';

/**
 * Placeholder implementation for the Real Discogs connector.
 * Throws "Not implemented" errors on all methods until real API integration is added.
 */
export class RealDiscogsConnector implements IDiscogsConnector {
  private readonly token: string;

  constructor(token?: string) {
    this.token = token || process.env.DISCOGS_API_TOKEN || '';
    if (!this.token.trim()) {
      throw new Error('DISCOGS_API_TOKEN is required for RealDiscogsConnector');
    }
  }

  async searchReleases(_query: string): Promise<DiscogsSearchResult[]> {
    throw new Error('RealDiscogsConnector is not implemented');
  }

  async getRelease(_releaseId: string): Promise<DiscogsRelease> {
    throw new Error('RealDiscogsConnector is not implemented');
  }

  async publishListing(_params: PublishListingParams): Promise<PublishListingResult> {
    throw new Error('RealDiscogsConnector is not implemented');
  }
}

/**
 * Factory function returning the appropriate IDiscogsConnector implementation
 * based on environment variables or explicit token configuration.
 *
 * @param token Optional token override. If omitted, uses process.env.DISCOGS_API_TOKEN.
 * @returns An instance implementing IDiscogsConnector (MockDiscogsConnector or RealDiscogsConnector).
 */
export function getConnector(token?: string): IDiscogsConnector {
  const apiToken = token !== undefined ? token : process.env.DISCOGS_API_TOKEN;

  if (typeof apiToken === 'string' && apiToken.trim() !== '') {
    return new RealDiscogsConnector(apiToken.trim());
  }

  return new MockDiscogsConnector();
}
