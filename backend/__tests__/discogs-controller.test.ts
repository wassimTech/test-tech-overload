import type { Core } from '@strapi/strapi';
import discogsControllerFactory, {
  DiscogsController,
  type StrapiContext,
} from '@/api/discogs/controllers/discogs';
import type { DiscogsService } from '@/api/discogs/services/discogs';

describe('DiscogsController (T-13)', () => {
  let mockStrapi: Core.Strapi;
  let mockService: jest.Mocked<Partial<DiscogsService>>;
  let controller: DiscogsController;
  let mockContext: Partial<StrapiContext> & { throw: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      searchReleases: jest.fn().mockResolvedValue([
        {
          id: '123456',
          title: 'Discovery',
          artist: 'Daft Punk',
          year: 2001,
        },
      ]),
      attachDiscogsRelease: jest.fn().mockResolvedValue({
        documentId: 'prod-01',
        title: 'Discovery',
        artist: 'Daft Punk',
        discogsReleaseId: '123456',
      }),
      checkDiscogsCompleteness: jest.fn().mockResolvedValue({
        complete: true,
        missingFields: [],
      }),
      publishListing: jest.fn().mockResolvedValue({
        channelListing: { documentId: 'listing-01', status: 'published' },
        discogsResult: {
          externalListingId: 'discogs-listing-0001',
          externalUrl: 'https://www.discogs.com/sell/item/discogs-listing-0001',
        },
      }),
      simulateDiscogsSale: jest.fn().mockResolvedValue({
        sellableUnit: { documentId: 'unit-01', status: 'sold' },
        channelListing: { documentId: 'listing-01', status: 'removed' },
      }),
    };

    mockStrapi = {
      service: jest.fn((uid: string) => {
        if (uid === 'api::discogs.discogs') {
          return mockService;
        }
        return undefined;
      }),
    } as unknown as Core.Strapi;

    controller = new DiscogsController(mockStrapi, mockService as unknown as DiscogsService);
    mockContext = {
      throw: jest.fn((status: number, msg?: string) => {
        const err = new Error(msg || `HTTP ${status}`);
        (err as unknown as { status: number }).status = status;
        throw err;
      }),
    };
  });

  describe('search', () => {
    it('should validate missing tenantId and call ctx.throw(400)', async () => {
      mockContext.query = { q: 'Daft Punk' };

      await expect(controller.search(mockContext as StrapiContext)).rejects.toThrow(
        'tenantId query parameter is required'
      );
      expect(mockContext.throw).toHaveBeenCalledWith(400, 'tenantId query parameter is required');
    });

    it('should validate missing q and call ctx.throw(400)', async () => {
      mockContext.query = { tenantId: 'tenant-123' };

      await expect(controller.search(mockContext as StrapiContext)).rejects.toThrow(
        "Query parameter 'q' is required"
      );
      expect(mockContext.throw).toHaveBeenCalledWith(400, "Query parameter 'q' is required");
    });

    it('should return search results when parameters are valid', async () => {
      mockContext.query = { tenantId: 'tenant-123', q: 'Discovery' };

      await controller.search(mockContext as StrapiContext);

      expect(mockContext.body).toBeDefined();
      const body = mockContext.body as { data: Array<{ title: string }> };
      expect(body.data).toBeDefined();
      expect(body.data[0].title).toBe('Discovery');
      expect(mockService.searchReleases).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        query: 'Discovery',
        token: undefined,
      });
    });

    it('should handle service errors with ctx.throw(400)', async () => {
      mockContext.query = { tenantId: 'tenant-123', q: 'ErrorQuery' };
      mockService.searchReleases = jest.fn().mockRejectedValueOnce(new Error('Search failed'));

      await expect(controller.search(mockContext as StrapiContext)).rejects.toThrow('Search failed');
      expect(mockContext.throw).toHaveBeenCalledWith(400, 'Search failed');
    });
  });

  describe('attachDiscogsRelease', () => {
    it('should validate missing parameters and throw 400', async () => {
      mockContext.params = { id: '' };
      mockContext.request = { body: { tenantId: '', releaseId: '' } };

      await expect(
        controller.attachDiscogsRelease(mockContext as StrapiContext)
      ).rejects.toThrow('Product id is required');
      expect(mockContext.throw).toHaveBeenCalledWith(400, 'Product id is required');
    });

    it('should validate missing releaseId', async () => {
      mockContext.params = { id: 'prod-01' };
      mockContext.request = { body: { tenantId: 'tenant-123', releaseId: '' } };

      await expect(
        controller.attachDiscogsRelease(mockContext as StrapiContext)
      ).rejects.toThrow('releaseId is required');
      expect(mockContext.throw).toHaveBeenCalledWith(400, 'releaseId is required');
    });

    it('should call service and attach release when params are valid', async () => {
      mockContext.params = { id: 'prod-01' };
      mockContext.request = { body: { tenantId: 'tenant-123', releaseId: '123456' } };

      await controller.attachDiscogsRelease(mockContext as StrapiContext);

      expect(mockService.attachDiscogsRelease).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        productId: 'prod-01',
        releaseId: '123456',
        token: undefined,
      });
      expect(mockContext.body).toBeDefined();
    });

    it('should throw 404 when product is not found', async () => {
      mockContext.params = { id: 'prod-nonexistent' };
      mockContext.request = { body: { tenantId: 'tenant-123', releaseId: '123456' } };
      mockService.attachDiscogsRelease = jest
        .fn()
        .mockRejectedValueOnce(new Error('Product not found for the specified tenant'));

      await expect(
        controller.attachDiscogsRelease(mockContext as StrapiContext)
      ).rejects.toThrow('Product not found for the specified tenant');
      expect(mockContext.throw).toHaveBeenCalledWith(
        404,
        'Product not found for the specified tenant'
      );
    });
  });

  describe('checkDiscogsCompleteness', () => {
    it('should validate missing sellableUnit id', async () => {
      mockContext.params = { id: '' };
      mockContext.request = { body: { tenantId: 'tenant-123' } };

      await expect(
        controller.checkDiscogsCompleteness(mockContext as StrapiContext)
      ).rejects.toThrow('SellableUnit id is required');
    });

    it('should validate missing tenantId', async () => {
      mockContext.params = { id: 'unit-01' };
      mockContext.request = { body: {} };
      mockContext.query = {};

      await expect(
        controller.checkDiscogsCompleteness(mockContext as StrapiContext)
      ).rejects.toThrow('tenantId is required');
    });

    it('should return completeness validation result', async () => {
      mockContext.params = { id: 'unit-01' };
      mockContext.request = { body: { tenantId: 'tenant-123' } };

      await controller.checkDiscogsCompleteness(mockContext as StrapiContext);

      expect(mockService.checkDiscogsCompleteness).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-01',
      });
      expect(mockContext.body).toEqual({
        data: { complete: true, missingFields: [] },
      });
    });
  });

  describe('publishDiscogs', () => {
    it('should validate missing sellableUnit id', async () => {
      mockContext.params = { id: '' };
      mockContext.request = { body: { tenantId: 'tenant-123' } };

      await expect(controller.publishDiscogs(mockContext as StrapiContext)).rejects.toThrow(
        'SellableUnit id is required'
      );
    });

    it('should publish listing when params are valid', async () => {
      mockContext.params = { id: 'unit-01' };
      mockContext.request = { body: { tenantId: 'tenant-123' } };

      await controller.publishDiscogs(mockContext as StrapiContext);

      expect(mockService.publishListing).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-01',
        token: undefined,
      });
      expect(mockContext.body).toBeDefined();
    });
  });

  describe('simulateDiscogsSale', () => {
    it('should validate missing tenantId', async () => {
      mockContext.params = { id: 'unit-01' };
      mockContext.request = { body: {} };
      mockContext.query = {};

      await expect(controller.simulateDiscogsSale(mockContext as StrapiContext)).rejects.toThrow(
        'tenantId is required'
      );
    });

    it('should simulate sale when params are valid', async () => {
      mockContext.params = { id: 'unit-01' };
      mockContext.request = { body: { tenantId: 'tenant-123' } };

      await controller.simulateDiscogsSale(mockContext as StrapiContext);

      expect(mockService.simulateDiscogsSale).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-01',
      });
      expect(mockContext.body).toBeDefined();
    });
  });

  describe('Strapi Controller Factory Export', () => {
    it('should return controller object with 5 actions', () => {
      const exported = discogsControllerFactory({ strapi: mockStrapi });
      expect(typeof exported.search).toBe('function');
      expect(typeof exported.attachDiscogsRelease).toBe('function');
      expect(typeof exported.checkDiscogsCompleteness).toBe('function');
      expect(typeof exported.publishDiscogs).toBe('function');
      expect(typeof exported.simulateDiscogsSale).toBe('function');
    });
  });
});
