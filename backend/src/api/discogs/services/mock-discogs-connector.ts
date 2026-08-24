import type {
  IDiscogsConnector,
  DiscogsSearchResult,
  DiscogsRelease,
  PublishListingParams,
  PublishListingResult,
} from '@/api/discogs/types';

/**
 * Default mock catalog containing plausible releases for local simulation.
 */
const MOCK_RELEASES_CATALOG: DiscogsRelease[] = [
  {
    id: '123456',
    title: 'Discovery',
    artist: 'Daft Punk',
    year: 2001,
    country: 'France',
    format: '2xLP',
    label: 'Virgin',
    masterId: '26647',
    barcode: '724384960612',
    description:
      'Discovery is the second studio album by French electronic music duo Daft Punk, released on 12 March 2001 by Virgin Records.',
    genres: ['Electronic'],
    styles: ['House', 'Disco'],
    tracklist: [
      { position: 'A1', title: 'One More Time', duration: '5:20' },
      { position: 'A2', title: 'Aerodynamic', duration: '3:27' },
      { position: 'A3', title: 'Digital Love', duration: '4:58' },
      { position: 'B1', title: 'Harder, Better, Faster, Stronger', duration: '3:45' },
    ],
    images: [
      {
        type: 'primary',
        uri: 'https://i.discogs.com/mock-discovery-front.jpg',
      },
    ],
    uri: 'https://www.discogs.com/release/123456',
  },
];

/**
 * Mock implementation of Discogs marketplace connector.
 * Provides deterministic simulation without any network calls.
 */
export class MockDiscogsConnector implements IDiscogsConnector {
  private listingCounter = 0;
  private readonly releases: Map<string, DiscogsRelease>;

  constructor(initialCatalog: DiscogsRelease[] = MOCK_RELEASES_CATALOG) {
    this.releases = new Map(initialCatalog.map((release) => [release.id, release]));
  }

  /**
   * Searches releases from the mock catalog.
   */
  async searchReleases(query: string): Promise<DiscogsSearchResult[]> {
    const trimmed = (query || '').trim().toLowerCase();

    const allReleases = Array.from(this.releases.values());

    const filtered =
      trimmed === ''
        ? allReleases
        : allReleases.filter((release) => {
            const artist = release.artist.toLowerCase();
            const title = release.title.toLowerCase();
            const label = (release.label || '').toLowerCase();
            const id = release.id.toLowerCase();
            return (
              artist.includes(trimmed) ||
              title.includes(trimmed) ||
              label.includes(trimmed) ||
              id.includes(trimmed)
            );
          });

    return filtered.map((release) => ({
      id: release.id,
      title: release.title,
      artist: release.artist,
      year: release.year,
      country: release.country,
      format: release.format,
      label: release.label,
      masterId: release.masterId,
      barcode: release.barcode,
      uri: release.uri,
    }));
  }

  /**
   * Retrieves full release metadata by release ID.
   */
  async getRelease(releaseId: string): Promise<DiscogsRelease> {
    const release = this.releases.get(releaseId);

    if (!release) {
      throw new Error(`Release with ID "${releaseId}" not found in mock catalog`);
    }

    return { ...release };
  }

  /**
   * Simulates publishing a listing to Discogs.
   */
  async publishListing(_params: PublishListingParams): Promise<PublishListingResult> {
    this.listingCounter += 1;
    const paddedIndex = this.listingCounter.toString().padStart(4, '0');
    const externalListingId = `discogs-listing-${paddedIndex}`;
    const externalUrl = `https://www.discogs.com/sell/item/${externalListingId}`;

    return {
      externalListingId,
      externalUrl,
    };
  }
}
