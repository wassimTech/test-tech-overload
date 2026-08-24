import type { Core } from '@strapi/strapi';
import { ChannelType, SyncAction, SyncStatus } from '@/common/enums';
import {
  syncEventLogger,
  logSyncEvent,
  type LogSyncEventParams,
} from '@/api/discogs/services/sync-event-logger';

describe('SyncEventLogger Service (T-12)', () => {
  let mockCreate: jest.Mock;
  let mockDocuments: jest.Mock;
  let mockStrapi: { documents: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate = jest.fn().mockResolvedValue({ id: 1, documentId: 'event-doc-01' });
    mockDocuments = jest.fn((uid?: string) => {
      if (uid === 'api::tenant.tenant') {
        return {
          findFirst: jest.fn(
            ({
              filters,
            }: {
              filters?: { $or?: Array<{ slug?: string; documentId?: string }> };
            } = {}) => {
              const requested =
                filters?.$or?.[0]?.slug || filters?.$or?.[0]?.documentId || 'tenant-123';
              return Promise.resolve({ documentId: requested, slug: requested });
            }
          ),
        };
      }
      return {
        create: mockCreate,
      };
    });
    mockStrapi = {
      documents: mockDocuments,
    };
  });

  describe('logSyncEvent / syncEventLogger.log', () => {
    it('should create a MarketplaceSyncEvent with mandatory fields and automated Date timestamp', async () => {
      const beforeTime = new Date().getTime();

      const params: LogSyncEventParams = {
        strapi: mockStrapi as unknown as Core.Strapi,
        tenantId: 'tenant-123',
        channel: ChannelType.DISCOGS,
        action: SyncAction.SEARCH_RELEASE,
        status: SyncStatus.SUCCESS,
        message: 'Successfully searched releases for query Daft Punk',
      };

      await logSyncEvent(params);

      expect(mockDocuments).toHaveBeenCalledWith(
        'api::marketplace-sync-event.marketplace-sync-event'
      );

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const callArg = mockCreate.mock.calls[0][0];
      expect(callArg).toBeDefined();
      expect(callArg.data).toBeDefined();

      const { data } = callArg;
      expect(data.tenant).toBe('tenant-123');
      expect(data.channel).toBe(ChannelType.DISCOGS);
      expect(data.action).toBe(SyncAction.SEARCH_RELEASE);
      expect(data.status).toBe(SyncStatus.SUCCESS);
      expect(data.message).toBe('Successfully searched releases for query Daft Punk');
      expect(data.timestamp).toBeInstanceOf(Date);
      expect(data.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(data.timestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());

      // Optional fields not provided should not be set
      expect(data.product).toBeUndefined();
      expect(data.sellableUnit).toBeUndefined();
      expect(data.channelListing).toBeUndefined();
      expect(data.payload).toBeUndefined();
    });

    it('should include optional product, sellableUnit, channelListing relations, and technical payload when provided', async () => {
      const payloadObj = {
        query: 'Daft Punk',
        resultsCount: 5,
        filters: { format: 'LP' },
      };

      const params: LogSyncEventParams = {
        strapi: mockStrapi as unknown as Core.Strapi,
        tenantId: 'tenant-456',
        channel: ChannelType.DISCOGS,
        action: SyncAction.PUBLISH_LISTING,
        status: SyncStatus.PENDING,
        message: 'Publishing unit to Discogs marketplace',
        productId: 'product-doc-789',
        sellableUnitId: 'unit-doc-101',
        channelListingId: 'listing-doc-202',
        payload: payloadObj,
      };

      await syncEventLogger.log(params);

      expect(mockDocuments).toHaveBeenCalledWith(
        'api::marketplace-sync-event.marketplace-sync-event'
      );
      expect(mockCreate).toHaveBeenCalledTimes(1);

      const { data } = mockCreate.mock.calls[0][0];
      expect(data.tenant).toBe('tenant-456');
      expect(data.channel).toBe(ChannelType.DISCOGS);
      expect(data.action).toBe(SyncAction.PUBLISH_LISTING);
      expect(data.status).toBe(SyncStatus.PENDING);
      expect(data.message).toBe('Publishing unit to Discogs marketplace');
      expect(data.product).toBe('product-doc-789');
      expect(data.sellableUnit).toBe('unit-doc-101');
      expect(data.channelListing).toBe('listing-doc-202');
      expect(data.payload).toEqual(payloadObj);
      expect(data.timestamp).toBeInstanceOf(Date);
    });

    it('should support logging error events with error details in message and payload', async () => {
      const errorPayload = {
        error: 'Missing required field: price',
        code: 'VALIDATION_ERROR',
      };

      const params: LogSyncEventParams = {
        strapi: mockStrapi as unknown as Core.Strapi,
        tenantId: 'tenant-123',
        channel: ChannelType.DISCOGS,
        action: SyncAction.CHECK_COMPLETENESS,
        status: SyncStatus.FAILED,
        message: 'Completeness check failed: Missing required field: price',
        sellableUnitId: 'unit-doc-999',
        payload: errorPayload,
      };

      await syncEventLogger.log(params);

      const { data } = mockCreate.mock.calls[0][0];
      expect(data.action).toBe(SyncAction.CHECK_COMPLETENESS);
      expect(data.status).toBe(SyncStatus.FAILED);
      expect(data.sellableUnit).toBe('unit-doc-999');
      expect(data.payload).toEqual(errorPayload);
    });

    it('should propagate errors if strapi document creation fails', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Database write error'));

      const params: LogSyncEventParams = {
        strapi: mockStrapi as unknown as Core.Strapi,
        tenantId: 'tenant-123',
        channel: ChannelType.DISCOGS,
        action: SyncAction.MARK_OUT_OF_STOCK,
        status: SyncStatus.SUCCESS,
        message: 'Marked out of stock',
      };

      await expect(syncEventLogger.log(params)).rejects.toThrow('Database write error');
    });

    it('should export syncEventLogger object with log method and default export', () => {
      expect(syncEventLogger).toBeDefined();
      expect(typeof syncEventLogger.log).toBe('function');
    });
  });
});
