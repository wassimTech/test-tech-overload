import { MockDiscogsConnector } from '@/api/discogs/services/mock-discogs-connector';
import { IDiscogsConnector, PublishListingParams } from '@/api/discogs/types';
import { DiscCondition, SleeveCondition } from '@/common/enums';

describe('MockDiscogsConnector (T-10)', () => {
  let connector: IDiscogsConnector;

  beforeEach(() => {
    connector = new MockDiscogsConnector();
  });

  describe('searchReleases', () => {
    it('should find Discovery when querying "Daft Punk"', async () => {
      const results = await connector.searchReleases('Daft Punk');

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThanOrEqual(1);

      const discovery = results.find((r) => r.id === '123456');
      expect(discovery).toBeDefined();
      expect(discovery?.title).toBe('Discovery');
      expect(discovery?.artist).toBe('Daft Punk');
      expect(discovery?.year).toBe(2001);
      expect(discovery?.country).toBe('France');
      expect(discovery?.format).toBe('2xLP');
      expect(discovery?.label).toBe('Virgin');
    });

    it('should be case-insensitive when searching', async () => {
      const results = await connector.searchReleases('daft punk');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].title).toBe('Discovery');
    });

    it('should find release by title query "Discovery"', async () => {
      const results = await connector.searchReleases('Discovery');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe('123456');
    });

    it('should return empty array when no release matches query', async () => {
      const results = await connector.searchReleases('NonExistentArtistOrAlbumXYZ999');
      expect(results).toEqual([]);
    });

    it('should return all mock releases if query is empty or whitespace', async () => {
      const results = await connector.searchReleases('');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getRelease', () => {
    it('should return complete release metadata for known release ID "123456"', async () => {
      const release = await connector.getRelease('123456');

      expect(release).toBeDefined();
      expect(release.id).toBe('123456');
      expect(release.title).toBe('Discovery');
      expect(release.artist).toBe('Daft Punk');
      expect(release.year).toBe(2001);
      expect(release.country).toBe('France');
      expect(release.format).toBe('2xLP');
      expect(release.label).toBe('Virgin');
      expect(release.masterId).toBe('26647');
      expect(release.barcode).toBe('724384960612');
      expect(release.genres).toContain('Electronic');
      expect(release.styles).toEqual(expect.arrayContaining(['House', 'Disco']));
      expect(release.tracklist).toBeDefined();
      expect(release.tracklist?.length).toBeGreaterThan(0);
      expect(release.tracklist?.[0]).toMatchObject({
        position: 'A1',
        title: 'One More Time',
      });
      expect(release.images).toBeDefined();
      expect(release.images?.length).toBeGreaterThan(0);
      expect(release.uri).toBe('https://www.discogs.com/release/123456');
    });

    it('should throw an error when release ID is not found', async () => {
      await expect(connector.getRelease('unknown-999999')).rejects.toThrow(
        /Release with ID "unknown-999999" not found/i
      );
    });
  });

  describe('publishListing', () => {
    it('should return externalListingId and externalUrl upon successful publication', async () => {
      const params: PublishListingParams = {
        releaseId: '123456',
        condition: DiscCondition.MINT,
        sleeveCondition: SleeveCondition.NEAR_MINT,
        price: 39.99,
        sellerNotes: 'Brand new copy sealed',
      };

      const result = await connector.publishListing(params);

      expect(result).toBeDefined();
      expect(result.externalListingId).toBe('discogs-listing-0001');
      expect(result.externalUrl).toBe(
        'https://www.discogs.com/sell/item/discogs-listing-0001'
      );
    });

    it('should generate incrementing listing IDs for successive publications', async () => {
      const firstResult = await connector.publishListing({
        releaseId: '123456',
        condition: DiscCondition.VERY_GOOD_PLUS,
        price: 25.0,
      });

      const secondResult = await connector.publishListing({
        releaseId: '123456',
        condition: DiscCondition.GOOD,
        price: 15.0,
      });

      expect(firstResult.externalListingId).toBe('discogs-listing-0001');
      expect(secondResult.externalListingId).toBe('discogs-listing-0002');
      expect(secondResult.externalUrl).toBe(
        'https://www.discogs.com/sell/item/discogs-listing-0002'
      );
    });
  });
});
