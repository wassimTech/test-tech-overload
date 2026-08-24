import marketplaceSyncEventSchema from '../src/api/marketplace-sync-event/content-types/marketplace-sync-event/schema.json';
import marketplaceSyncEventController from '../src/api/marketplace-sync-event/controllers/marketplace-sync-event';
import marketplaceSyncEventService from '../src/api/marketplace-sync-event/services/marketplace-sync-event';
import marketplaceSyncEventRoutes from '../src/api/marketplace-sync-event/routes/marketplace-sync-event';
import { ChannelType, SyncAction, SyncStatus } from '../src/common/enums';

describe('MarketplaceSyncEvent Content Type', () => {
  describe('Schema Definition', () => {
    it('should have correct kind, collectionName, and info', () => {
      expect(marketplaceSyncEventSchema.kind).toBe('collectionType');
      expect(marketplaceSyncEventSchema.collectionName).toBe('marketplace_sync_events');
      expect(marketplaceSyncEventSchema.info.singularName).toBe('marketplace-sync-event');
      expect(marketplaceSyncEventSchema.info.pluralName).toBe('marketplace-sync-events');
      expect(marketplaceSyncEventSchema.info.displayName).toBe('Marketplace Sync Event');
    });

    it('should have draftAndPublish disabled', () => {
      expect(marketplaceSyncEventSchema.options.draftAndPublish).toBe(false);
    });

    it('should define "tenant" as a required manyToOne relation to api::tenant.tenant', () => {
      const tenantAttr = marketplaceSyncEventSchema.attributes.tenant;
      expect(tenantAttr).toBeDefined();
      expect(tenantAttr.type).toBe('relation');
      expect(tenantAttr.relation).toBe('manyToOne');
      expect(tenantAttr.target).toBe('api::tenant.tenant');
      expect(tenantAttr.required).toBe(true);
    });

    it('should define "channel" as a required enum fixed to "discogs" with default "discogs"', () => {
      const channelAttr = marketplaceSyncEventSchema.attributes.channel;
      expect(channelAttr).toBeDefined();
      expect(channelAttr.type).toBe('enumeration');
      expect(channelAttr.enum).toEqual(Object.values(ChannelType));
      expect(channelAttr.default).toBe(ChannelType.DISCOGS);
      expect(channelAttr.required).toBe(true);
    });

    it('should define "action" as a required enum matching SyncAction values', () => {
      const actionAttr = marketplaceSyncEventSchema.attributes.action;
      expect(actionAttr).toBeDefined();
      expect(actionAttr.type).toBe('enumeration');
      expect(actionAttr.enum).toEqual(Object.values(SyncAction));
      expect(actionAttr.required).toBe(true);
    });

    it('should define "status" as a required enum matching SyncStatus values', () => {
      const statusAttr = marketplaceSyncEventSchema.attributes.status;
      expect(statusAttr).toBeDefined();
      expect(statusAttr.type).toBe('enumeration');
      expect(statusAttr.enum).toEqual(Object.values(SyncStatus));
      expect(statusAttr.required).toBe(true);
    });

    it('should define "product" as an optional manyToOne relation to api::product.product', () => {
      const productAttr = marketplaceSyncEventSchema.attributes.product;
      expect(productAttr).toBeDefined();
      expect(productAttr.type).toBe('relation');
      expect(productAttr.relation).toBe('manyToOne');
      expect(productAttr.target).toBe('api::product.product');
      expect((productAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "sellableUnit" as an optional manyToOne relation to api::sellable-unit.sellable-unit', () => {
      const sellableUnitAttr = marketplaceSyncEventSchema.attributes.sellableUnit;
      expect(sellableUnitAttr).toBeDefined();
      expect(sellableUnitAttr.type).toBe('relation');
      expect(sellableUnitAttr.relation).toBe('manyToOne');
      expect(sellableUnitAttr.target).toBe('api::sellable-unit.sellable-unit');
      expect((sellableUnitAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "channelListing" as an optional manyToOne relation to api::channel-listing.channel-listing', () => {
      const channelListingAttr = marketplaceSyncEventSchema.attributes.channelListing;
      expect(channelListingAttr).toBeDefined();
      expect(channelListingAttr.type).toBe('relation');
      expect(channelListingAttr.relation).toBe('manyToOne');
      expect(channelListingAttr.target).toBe('api::channel-listing.channel-listing');
      expect((channelListingAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "message" as a required string', () => {
      const messageAttr = marketplaceSyncEventSchema.attributes.message;
      expect(messageAttr).toBeDefined();
      expect(messageAttr.type).toBe('string');
      expect(messageAttr.required).toBe(true);
    });

    it('should define "payload" as an optional json', () => {
      const payloadAttr = marketplaceSyncEventSchema.attributes.payload;
      expect(payloadAttr).toBeDefined();
      expect(payloadAttr.type).toBe('json');
      expect((payloadAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "timestamp" as a required datetime', () => {
      const timestampAttr = marketplaceSyncEventSchema.attributes.timestamp;
      expect(timestampAttr).toBeDefined();
      expect(timestampAttr.type).toBe('datetime');
      expect(timestampAttr.required).toBe(true);
    });
  });

  describe('API Controllers, Services, and Routes', () => {
    it('should export Strapi core controller factory wrapper', () => {
      expect(marketplaceSyncEventController).toBeDefined();
    });

    it('should export Strapi core service factory wrapper', () => {
      expect(marketplaceSyncEventService).toBeDefined();
    });

    it('should export Strapi core router factory wrapper', () => {
      expect(marketplaceSyncEventRoutes).toBeDefined();
    });
  });
});
