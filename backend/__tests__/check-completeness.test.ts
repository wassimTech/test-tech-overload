import type { Core } from '@strapi/strapi';
import {
  ChannelType,
  DiscCondition,
  SellableUnitStatus,
  SleeveCondition,
  SyncAction,
  SyncStatus,
} from '@/common/enums';
import { DiscogsService } from '@/api/discogs/services/discogs';
import type { ValidationResult } from '@/api/discogs/types';

interface MockProduct {
  documentId?: string;
  title?: string;
  artist?: string;
  discogsReleaseId?: string;
}

interface MockSellableUnit {
  documentId: string;
  price?: number | string | null;
  discCondition?: string | DiscCondition;
  sleeveCondition?: string | SleeveCondition;
  status: string | SellableUnitStatus;
  tenant: {
    documentId: string;
    slug?: string;
  };
  product?: MockProduct;
}

describe('Discogs Completeness Verification (T-14 / T-13)', () => {
  let mockFindOne: jest.Mock;
  let mockCreate: jest.Mock;
  let mockDocuments: jest.Mock;
  let mockStrapi: Core.Strapi;
  let service: DiscogsService;

  const validTenantId = 'tenant-test-123';
  const validUnitId = 'unit-doc-001';

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindOne = jest.fn();
    mockCreate = jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({
        id: 1,
        documentId: 'event-doc-001',
        ...args.data,
      })
    );

    mockDocuments = jest.fn((uid: string) => {
      if (uid === 'api::sellable-unit.sellable-unit') {
        return {
          findOne: mockFindOne,
        };
      }
      if (uid === 'api::marketplace-sync-event.marketplace-sync-event') {
        return {
          create: mockCreate,
        };
      }
      return {
        findOne: mockFindOne,
        create: mockCreate,
      };
    });

    mockStrapi = {
      documents: mockDocuments,
    } as unknown as Core.Strapi;

    service = new DiscogsService(mockStrapi);
  });

  const createCompleteUnit = (): MockSellableUnit => ({
    documentId: validUnitId,
    price: 34.99,
    discCondition: DiscCondition.MINT,
    sleeveCondition: SleeveCondition.NEAR_MINT,
    status: SellableUnitStatus.AVAILABLE,
    tenant: {
      documentId: validTenantId,
      slug: 'my-store',
    },
    product: {
      documentId: 'prod-doc-123',
      title: 'Discovery',
      artist: 'Daft Punk',
      discogsReleaseId: '123456',
    },
  });

  describe('Complete SellableUnit', () => {
    it('should return { complete: true, missingFields: [] } when all required fields are present', async () => {
      mockFindOne.mockResolvedValueOnce(createCompleteUnit());

      const result: ValidationResult = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result).toEqual({
        complete: true,
        missingFields: [],
      });

      expect(mockDocuments).toHaveBeenCalledWith(
        'api::marketplace-sync-event.marketplace-sync-event'
      );
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant: validTenantId,
            channel: ChannelType.DISCOGS,
            action: SyncAction.CHECK_COMPLETENESS,
            status: SyncStatus.SUCCESS,
            sellableUnit: validUnitId,
            product: 'prod-doc-123',
            payload: {
              complete: true,
              missingFields: [],
            },
          }),
        })
      );
    });
  });

  describe('Missing or Invalid Price', () => {
    it('should report price missing when price is null', async () => {
      const unit = createCompleteUnit();
      unit.price = null;
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('price');
    });

    it('should report price missing when price is undefined', async () => {
      const unit = createCompleteUnit();
      delete unit.price;
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('price');
    });

    it('should report price missing when price is 0 or negative', async () => {
      const unit = createCompleteUnit();
      unit.price = 0;
      mockFindOne.mockResolvedValueOnce(unit);

      const resultZero = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });
      expect(resultZero.complete).toBe(false);
      expect(resultZero.missingFields).toContain('price');

      unit.price = -15.5;
      mockFindOne.mockResolvedValueOnce(unit);
      const resultNeg = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });
      expect(resultNeg.complete).toBe(false);
      expect(resultNeg.missingFields).toContain('price');
    });

    it('should accept valid numeric string price', async () => {
      const unit = createCompleteUnit();
      unit.price = '29.99';
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(true);
      expect(result.missingFields).toEqual([]);
    });
  });

  describe('Missing Disc / Sleeve Conditions', () => {
    it('should report discCondition missing when blank or missing', async () => {
      const unit = createCompleteUnit();
      unit.discCondition = '';
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('discCondition');
    });

    it('should report sleeveCondition missing when blank or missing', async () => {
      const unit = createCompleteUnit();
      unit.sleeveCondition = '   ';
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('sleeveCondition');
    });
  });

  describe('Missing Product Catalog or Discogs Release Link', () => {
    it('should report product.discogsReleaseId missing when product.discogsReleaseId is absent', async () => {
      const unit = createCompleteUnit();
      unit.product!.discogsReleaseId = '';
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('product.discogsReleaseId');
    });

    it('should report product.discogsReleaseId missing when product relation is null or undefined', async () => {
      const unit = createCompleteUnit();
      delete unit.product;
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('product.discogsReleaseId');
    });
  });

  describe('SellableUnit Inventory Status', () => {
    it('should report status missing when unit status is not "available" (e.g. "sold")', async () => {
      const unit = createCompleteUnit();
      unit.status = SellableUnitStatus.SOLD;
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('status');
    });

    it('should report status missing when unit status is "reserved"', async () => {
      const unit = createCompleteUnit();
      unit.status = SellableUnitStatus.RESERVED;
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('status');
    });
  });

  describe('Multiple Missing Fields', () => {
    it('should list all missing fields when multiple validation criteria fail simultaneously', async () => {
      const unit = createCompleteUnit();
      unit.price = 0;
      unit.discCondition = '';
      unit.sleeveCondition = '';
      unit.product!.discogsReleaseId = '';
      unit.status = SellableUnitStatus.OUT_OF_STOCK;
      mockFindOne.mockResolvedValueOnce(unit);

      const result = await service.checkDiscogsCompleteness({
        tenantId: validTenantId,
        sellableUnitId: validUnitId,
      });

      expect(result.complete).toBe(false);
      expect(result.missingFields).toEqual(
        expect.arrayContaining([
          'price',
          'discCondition',
          'sleeveCondition',
          'product.discogsReleaseId',
          'status',
        ])
      );
      expect(result.missingFields.length).toBe(5);

      // Audit event logged as failed
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SyncAction.CHECK_COMPLETENESS,
            status: SyncStatus.FAILED,
            payload: expect.objectContaining({
              complete: false,
              missingFields: expect.arrayContaining([
                'price',
                'discCondition',
                'sleeveCondition',
                'product.discogsReleaseId',
                'status',
              ]),
            }),
          }),
        })
      );
    });
  });

  describe('Tenant Scoping & Error Handling', () => {
    it('should throw an error if tenantId is missing or empty', async () => {
      await expect(
        service.checkDiscogsCompleteness({
          tenantId: '  ',
          sellableUnitId: validUnitId,
        })
      ).rejects.toThrow('tenantId is required');
    });

    it('should throw an error if sellableUnitId is missing or empty', async () => {
      await expect(
        service.checkDiscogsCompleteness({
          tenantId: validTenantId,
          sellableUnitId: '',
        })
      ).rejects.toThrow('sellableUnitId is required');
    });

    it('should throw an error if unit is not found for the requested tenant', async () => {
      mockFindOne.mockResolvedValueOnce(null);

      await expect(
        service.checkDiscogsCompleteness({
          tenantId: validTenantId,
          sellableUnitId: 'non-existent-unit',
        })
      ).rejects.toThrow(/not found for the specified tenant/i);
    });

    it('should throw an error if unit belongs to a different tenant (tenant leakage protection)', async () => {
      const unit = createCompleteUnit();
      unit.tenant.documentId = 'other-tenant-999';
      unit.tenant.slug = 'other-slug';
      mockFindOne.mockResolvedValueOnce(unit);

      await expect(
        service.checkDiscogsCompleteness({
          tenantId: validTenantId,
          sellableUnitId: validUnitId,
        })
      ).rejects.toThrow(/not found for the specified tenant/i);
    });
  });
});
