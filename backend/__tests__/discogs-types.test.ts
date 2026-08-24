import {
  IDiscogsConnector,
  DiscogsSearchResult,
  DiscogsRelease,
  PublishListingParams,
  PublishListingResult,
  ValidationResult,
} from '@/api/discogs/types';
import { DiscCondition, SleeveCondition } from '@/common/enums';

describe('Discogs Types & DTOs (T-09)', () => {
  it('should allow valid DiscogsSearchResult structure', () => {
    const searchResult: DiscogsSearchResult = {
      id: '123456',
      title: 'Discovery',
      artist: 'Daft Punk',
      year: 2001,
      country: 'France',
      format: '2xLP',
      label: 'Virgin',
      masterId: '26647',
    };

    expect(searchResult.id).toBe('123456');
    expect(searchResult.title).toBe('Discovery');
    expect(searchResult.artist).toBe('Daft Punk');
    expect(searchResult.year).toBe(2001);
    expect(searchResult.country).toBe('France');
    expect(searchResult.format).toBe('2xLP');
    expect(searchResult.label).toBe('Virgin');
    expect(searchResult.masterId).toBe('26647');
  });

  it('should allow valid DiscogsRelease structure with detailed metadata', () => {
    const release: DiscogsRelease = {
      id: '123456',
      title: 'Discovery',
      artist: 'Daft Punk',
      year: 2001,
      country: 'France',
      format: '2xLP',
      label: 'Virgin',
      masterId: '26647',
      barcode: '724384960612',
      description: 'Classic electronic album',
      genres: ['Electronic'],
      styles: ['House', 'Disco'],
      tracklist: [
        { position: 'A1', title: 'One More Time', duration: '5:20' },
        { position: 'A2', title: 'Aerodynamic', duration: '3:27' },
      ],
      images: [
        { type: 'primary', uri: 'https://img.discogs.com/primary.jpg' },
      ],
      uri: 'https://www.discogs.com/release/123456',
    };

    expect(release.id).toBe('123456');
    expect(release.tracklist?.length).toBe(2);
    expect(release.barcode).toBe('724384960612');
  });

  it('should allow valid PublishListingParams with domain condition enums', () => {
    const params: PublishListingParams = {
      releaseId: '123456',
      condition: DiscCondition.NEAR_MINT,
      sleeveCondition: SleeveCondition.VERY_GOOD_PLUS,
      price: 49.99,
      status: 'For Sale',
      sellerNotes: 'Original pressing in great condition',
      location: 'Bin A-12',
    };

    expect(params.releaseId).toBe('123456');
    expect(params.condition).toBe(DiscCondition.NEAR_MINT);
    expect(params.sleeveCondition).toBe(SleeveCondition.VERY_GOOD_PLUS);
    expect(params.price).toBe(49.99);
    expect(params.status).toBe('For Sale');
  });

  it('should allow valid PublishListingResult structure', () => {
    const result: PublishListingResult = {
      externalListingId: 'discogs-listing-0001',
      externalUrl: 'https://www.discogs.com/sell/item/discogs-listing-0001',
    };

    expect(result.externalListingId).toBe('discogs-listing-0001');
    expect(result.externalUrl).toBe(
      'https://www.discogs.com/sell/item/discogs-listing-0001'
    );
  });

  it('should allow valid ValidationResult structure for completeness', () => {
    const validResult: ValidationResult = {
      complete: true,
      missingFields: [],
    };

    const invalidResult: ValidationResult = {
      complete: false,
      missingFields: ['price', 'discCondition', 'product.discogsReleaseId'],
    };

    expect(validResult.complete).toBe(true);
    expect(validResult.missingFields).toHaveLength(0);
    expect(invalidResult.complete).toBe(false);
    expect(invalidResult.missingFields).toContain('price');
  });

  it('should enforce IDiscogsConnector contract for implementing classes', async () => {
    class DummyDiscogsConnector implements IDiscogsConnector {
      async searchReleases(query: string): Promise<DiscogsSearchResult[]> {
        return [
          {
            id: '123456',
            title: `Release for ${query}`,
            artist: 'Test Artist',
          },
        ];
      }

      async getRelease(releaseId: string): Promise<DiscogsRelease> {
        return {
          id: releaseId,
          title: 'Discovery',
          artist: 'Daft Punk',
        };
      }

      async publishListing(
        params: PublishListingParams
      ): Promise<PublishListingResult> {
        return {
          externalListingId: `listing-${params.releaseId}`,
          externalUrl: `https://www.discogs.com/sell/item/listing-${params.releaseId}`,
        };
      }
    }

    const connector: IDiscogsConnector = new DummyDiscogsConnector();
    const searchRes = await connector.searchReleases('Daft Punk');
    const releaseRes = await connector.getRelease('123456');
    const publishRes = await connector.publishListing({
      releaseId: '123456',
      condition: DiscCondition.MINT,
      price: 25.0,
    });

    expect(searchRes[0].title).toBe('Release for Daft Punk');
    expect(releaseRes.artist).toBe('Daft Punk');
    expect(publishRes.externalListingId).toBe('listing-123456');
  });
});
