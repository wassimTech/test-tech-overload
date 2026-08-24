import {
  getConnector,
  RealDiscogsConnector,
} from '@/api/discogs/services/connector-factory';
import { MockDiscogsConnector } from '@/api/discogs/services/mock-discogs-connector';
import { IDiscogsConnector, PublishListingParams } from '@/api/discogs/types';
import { DiscCondition } from '@/common/enums';

describe('Connector Factory (T-11)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.DISCOGS_API_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getConnector', () => {
    it('should return MockDiscogsConnector when DISCOGS_API_TOKEN is undefined', () => {
      delete process.env.DISCOGS_API_TOKEN;

      const connector: IDiscogsConnector = getConnector();

      expect(connector).toBeInstanceOf(MockDiscogsConnector);
    });

    it('should return MockDiscogsConnector when DISCOGS_API_TOKEN is an empty string', () => {
      process.env.DISCOGS_API_TOKEN = '';

      const connector: IDiscogsConnector = getConnector();

      expect(connector).toBeInstanceOf(MockDiscogsConnector);
    });

    it('should return MockDiscogsConnector when DISCOGS_API_TOKEN contains only whitespace', () => {
      process.env.DISCOGS_API_TOKEN = '   ';

      const connector: IDiscogsConnector = getConnector();

      expect(connector).toBeInstanceOf(MockDiscogsConnector);
    });

    it('should return RealDiscogsConnector when DISCOGS_API_TOKEN is provided in environment', () => {
      process.env.DISCOGS_API_TOKEN = 'test-token-12345';

      const connector: IDiscogsConnector = getConnector();

      expect(connector).toBeInstanceOf(RealDiscogsConnector);
    });

    it('should respect explicit token parameter over environment variable', () => {
      process.env.DISCOGS_API_TOKEN = 'env-token';

      const explicitMockConnector = getConnector('');
      expect(explicitMockConnector).toBeInstanceOf(MockDiscogsConnector);

      const explicitRealConnector = getConnector('custom-token');
      expect(explicitRealConnector).toBeInstanceOf(RealDiscogsConnector);
    });
  });

  describe('RealDiscogsConnector (Placeholder stub)', () => {
    it('should throw error if instantiated without token and without env var', () => {
      delete process.env.DISCOGS_API_TOKEN;

      expect(() => new RealDiscogsConnector('')).toThrow(
        /DISCOGS_API_TOKEN is required/i
      );
    });

    it('should instantiate successfully when token is provided', () => {
      const connector = new RealDiscogsConnector('valid-token');
      expect(connector).toBeDefined();
    });

    it('should throw "Not implemented" when calling searchReleases', async () => {
      const connector = new RealDiscogsConnector('valid-token');

      await expect(connector.searchReleases('Daft Punk')).rejects.toThrow(
        /RealDiscogsConnector is not implemented/i
      );
    });

    it('should throw "Not implemented" when calling getRelease', async () => {
      const connector = new RealDiscogsConnector('valid-token');

      await expect(connector.getRelease('123456')).rejects.toThrow(
        /RealDiscogsConnector is not implemented/i
      );
    });

    it('should throw "Not implemented" when calling publishListing', async () => {
      const connector = new RealDiscogsConnector('valid-token');
      const params: PublishListingParams = {
        releaseId: '123456',
        condition: DiscCondition.MINT,
        price: 50,
      };

      await expect(connector.publishListing(params)).rejects.toThrow(
        /RealDiscogsConnector is not implemented/i
      );
    });
  });
});
