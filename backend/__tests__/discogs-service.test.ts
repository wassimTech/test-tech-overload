import type { Core } from '@strapi/strapi';
import {
  ChannelType,
  ChannelListingStatus,
  SellableUnitStatus,
  SyncAction,
  SyncStatus,
  DiscCondition,
  SleeveCondition,
} from '@/common/enums';
import { DiscogsService } from '@/api/discogs/services/discogs';

describe('DiscogsService (T-13)', () => {
  let mockFindOne: jest.Mock;
  let mockFindFirst: jest.Mock;
  let mockCreate: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDocuments: jest.Mock;
  let mockStrapi: Core.Strapi;
  let service: DiscogsService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindOne = jest.fn();
    mockFindFirst = jest.fn();
    mockCreate = jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({
        id: 1,
        documentId: 'created-doc-id',
        ...args.data,
      })
    );
    mockUpdate = jest.fn().mockImplementation((args: { documentId: string; data: Record<string, unknown> }) =>
      Promise.resolve({
        id: 1,
        documentId: args.documentId,
        ...args.data,
      })
    );

    mockDocuments = jest.fn((_uid: string) => ({
      findOne: mockFindOne,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
    }));

    mockStrapi = {
      documents: mockDocuments,
    } as unknown as Core.Strapi;

    service = new DiscogsService(mockStrapi);
  });

  describe('searchReleases', () => {
    it('should search releases using mock connector and log successful sync event', async () => {
      const results = await service.searchReleases({
        tenantId: 'tenant-123',
        query: 'Daft Punk',
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Discovery');
      expect(results[0].artist).toBe('Daft Punk');

      // Check sync event creation
      expect(mockDocuments).toHaveBeenCalledWith(
        'api::marketplace-sync-event.marketplace-sync-event'
      );
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant: 'tenant-123',
            channel: ChannelType.DISCOGS,
            action: SyncAction.SEARCH_RELEASE,
            status: SyncStatus.SUCCESS,
          }),
        })
      );
    });

    it('should throw error when tenantId is missing', async () => {
      await expect(
        service.searchReleases({
          tenantId: '',
          query: 'Daft Punk',
        })
      ).rejects.toThrow('tenantId is required');
    });

    it('should throw error when query is missing', async () => {
      await expect(
        service.searchReleases({
          tenantId: 'tenant-123',
          query: '   ',
        })
      ).rejects.toThrow("Query parameter 'q' is required");
    });
  });

  describe('attachDiscogsRelease', () => {
    it('should attach Discogs release metadata to product and log sync event', async () => {
      const existingProduct = {
        id: 1,
        documentId: 'prod-doc-01',
        title: 'Old Title',
        artist: 'Old Artist',
        tenant: { documentId: 'tenant-123', slug: 'tenant-slug' },
      };

      const updatedProductMock = {
        ...existingProduct,
        discogsReleaseId: '123456',
        discogsMasterId: '26647',
        artist: 'Daft Punk',
        title: 'Discovery',
        year: 2001,
        country: 'France',
        format: '2xLP',
        label: 'Virgin',
      };

      mockFindOne.mockResolvedValueOnce(existingProduct);
      mockUpdate.mockResolvedValueOnce(updatedProductMock);

      const result = await service.attachDiscogsRelease({
        tenantId: 'tenant-123',
        productId: 'prod-doc-01',
        releaseId: '123456',
      });

      expect(result).toEqual(updatedProductMock);
      expect(mockFindOne).toHaveBeenCalledWith({
        documentId: 'prod-doc-01',
        populate: ['tenant'],
      });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'prod-doc-01',
          data: expect.objectContaining({
            discogsReleaseId: '123456',
            discogsMasterId: '26647',
            artist: 'Daft Punk',
            title: 'Discovery',
          }),
        })
      );

      // Verify sync event
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant: 'tenant-123',
            channel: ChannelType.DISCOGS,
            action: SyncAction.SEARCH_RELEASE,
            status: SyncStatus.SUCCESS,
            product: 'prod-doc-01',
          }),
        })
      );
    });

    it('should reject and log failure when product does not belong to the tenant', async () => {
      const foreignProduct = {
        documentId: 'prod-foreign',
        tenant: { documentId: 'other-tenant', slug: 'other-slug' },
      };

      mockFindOne.mockResolvedValueOnce(foreignProduct);

      await expect(
        service.attachDiscogsRelease({
          tenantId: 'tenant-123',
          productId: 'prod-foreign',
          releaseId: '123456',
        })
      ).rejects.toThrow('Product prod-foreign not found for the specified tenant');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant: 'tenant-123',
            status: SyncStatus.FAILED,
          }),
        })
      );
    });
  });

  describe('checkDiscogsCompleteness', () => {
    it('should return complete: true when all required fields are present and valid', async () => {
      const validUnit = {
        documentId: 'unit-01',
        price: 25.5,
        discCondition: DiscCondition.MINT,
        sleeveCondition: SleeveCondition.NEAR_MINT,
        status: SellableUnitStatus.AVAILABLE,
        tenant: { documentId: 'tenant-123' },
        product: { documentId: 'prod-01', discogsReleaseId: '123456' },
      };

      mockFindOne.mockResolvedValueOnce(validUnit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-01',
      });

      expect(result.complete).toBe(true);
      expect(result.missingFields).toEqual([]);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SyncAction.CHECK_COMPLETENESS,
            status: SyncStatus.SUCCESS,
            sellableUnit: 'unit-01',
          }),
        })
      );
    });

    it('should return complete: false and report missing fields when price, condition, or releaseId are missing', async () => {
      const incompleteUnit = {
        documentId: 'unit-02',
        price: 0,
        discCondition: '',
        sleeveCondition: undefined,
        status: SellableUnitStatus.SOLD,
        tenant: { documentId: 'tenant-123' },
        product: { documentId: 'prod-01', discogsReleaseId: '' },
      };

      mockFindOne.mockResolvedValueOnce(incompleteUnit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-02',
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('price');
      expect(result.missingFields).toContain('discCondition');
      expect(result.missingFields).toContain('sleeveCondition');
      expect(result.missingFields).toContain('product.discogsReleaseId');
      expect(result.missingFields).toContain('status');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SyncAction.CHECK_COMPLETENESS,
            status: SyncStatus.FAILED,
          }),
        })
      );
    });
  });

  describe('publishListing', () => {
    it('should publish a valid unit, create ChannelListing, and log sync event', async () => {
      const completeUnit = {
        documentId: 'unit-valid',
        price: 30.0,
        discCondition: DiscCondition.NEAR_MINT,
        sleeveCondition: SleeveCondition.VERY_GOOD_PLUS,
        status: SellableUnitStatus.AVAILABLE,
        tenant: { documentId: 'tenant-123' },
        product: { documentId: 'prod-01', discogsReleaseId: '123456' },
      };

      // 1. findOne for publishListing, 2. findOne for checkDiscogsCompleteness
      mockFindOne
        .mockResolvedValueOnce(completeUnit)
        .mockResolvedValueOnce(completeUnit);

      // findFirst for existing listing
      mockFindFirst.mockResolvedValueOnce(null);

      const result = await service.publishListing({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-valid',
      });

      expect(result.discogsResult).toBeDefined();
      expect(result.discogsResult.externalListingId).toBe('discogs-listing-0001');
      expect(result.channelListing).toBeDefined();

      // Check publish sync event
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SyncAction.PUBLISH_LISTING,
            status: SyncStatus.SUCCESS,
            sellableUnit: 'unit-valid',
          }),
        })
      );
    });

    it('should reject publishing if unit is incomplete', async () => {
      const incompleteUnit = {
        documentId: 'unit-incomplete',
        price: null,
        status: SellableUnitStatus.AVAILABLE,
        tenant: { documentId: 'tenant-123' },
        product: { documentId: 'prod-01', discogsReleaseId: '' },
      };

      mockFindOne
        .mockResolvedValueOnce(incompleteUnit)
        .mockResolvedValueOnce(incompleteUnit);

      await expect(
        service.publishListing({
          tenantId: 'tenant-123',
          sellableUnitId: 'unit-incomplete',
        })
      ).rejects.toThrow('Cannot publish: SellableUnit is incomplete');
    });
  });

  describe('simulateDiscogsSale', () => {
    it('should update SellableUnit to sold (qty 0) and ChannelListing to removed', async () => {
      const activeUnit = {
        documentId: 'unit-sold',
        status: SellableUnitStatus.AVAILABLE,
        quantity: 1,
        tenant: { documentId: 'tenant-123' },
        product: { documentId: 'prod-01' },
      };

      const publishedListing = {
        documentId: 'listing-pub',
        status: ChannelListingStatus.PUBLISHED,
        channel: ChannelType.DISCOGS,
      };

      const updatedUnitMock = {
        ...activeUnit,
        status: SellableUnitStatus.SOLD,
        quantity: 0,
      };

      const updatedListingMock = {
        ...publishedListing,
        status: ChannelListingStatus.REMOVED,
      };

      mockFindOne.mockResolvedValueOnce(activeUnit);
      mockFindFirst.mockResolvedValueOnce(publishedListing);
      mockUpdate
        .mockResolvedValueOnce(updatedUnitMock)
        .mockResolvedValueOnce(updatedListingMock);

      const result = await service.simulateDiscogsSale({
        tenantId: 'tenant-123',
        sellableUnitId: 'unit-sold',
      });

      expect(result.sellableUnit).toEqual(updatedUnitMock);
      expect(result.channelListing).toEqual(updatedListingMock);

      // Verify SellableUnit updated to sold
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'unit-sold',
          data: { status: SellableUnitStatus.SOLD, quantity: 0 },
        })
      );

      // Verify ChannelListing updated to removed
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'listing-pub',
          data: expect.objectContaining({
            status: ChannelListingStatus.REMOVED,
          }),
        })
      );

      // Verify sync event logged
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SyncAction.MARK_OUT_OF_STOCK,
            status: SyncStatus.SUCCESS,
          }),
        })
      );
    });

    it('should throw error when no active published listing exists for the unit', async () => {
      const activeUnit = {
        documentId: 'unit-no-listing',
        status: SellableUnitStatus.AVAILABLE,
        tenant: { documentId: 'tenant-123' },
      };

      mockFindOne.mockResolvedValueOnce(activeUnit);
      mockFindFirst.mockResolvedValueOnce(null);

      await expect(
        service.simulateDiscogsSale({
          tenantId: 'tenant-123',
          sellableUnitId: 'unit-no-listing',
        })
      ).rejects.toThrow('No active published Discogs listing found');
    });
  });
});
