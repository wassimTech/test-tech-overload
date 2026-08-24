import channelListingSchema from '../src/api/channel-listing/content-types/channel-listing/schema.json';
import channelListingController from '../src/api/channel-listing/controllers/channel-listing';
import channelListingService from '../src/api/channel-listing/services/channel-listing';
import channelListingRoutes from '../src/api/channel-listing/routes/channel-listing';
import { ChannelType, ChannelListingStatus } from '../src/common/enums';

describe('ChannelListing Content Type', () => {
  describe('Schema Definition', () => {
    it('should have correct kind, collectionName, and info', () => {
      expect(channelListingSchema.kind).toBe('collectionType');
      expect(channelListingSchema.collectionName).toBe('channel_listings');
      expect(channelListingSchema.info.singularName).toBe('channel-listing');
      expect(channelListingSchema.info.pluralName).toBe('channel-listings');
      expect(channelListingSchema.info.displayName).toBe('Channel Listing');
    });

    it('should have draftAndPublish disabled', () => {
      expect(channelListingSchema.options.draftAndPublish).toBe(false);
    });

    it('should define "tenant" as a required manyToOne relation to api::tenant.tenant', () => {
      const tenantAttr = channelListingSchema.attributes.tenant;
      expect(tenantAttr).toBeDefined();
      expect(tenantAttr.type).toBe('relation');
      expect(tenantAttr.relation).toBe('manyToOne');
      expect(tenantAttr.target).toBe('api::tenant.tenant');
      expect(tenantAttr.required).toBe(true);
    });

    it('should define "sellableUnit" as a required manyToOne relation to api::sellable-unit.sellable-unit', () => {
      const sellableUnitAttr = channelListingSchema.attributes.sellableUnit;
      expect(sellableUnitAttr).toBeDefined();
      expect(sellableUnitAttr.type).toBe('relation');
      expect(sellableUnitAttr.relation).toBe('manyToOne');
      expect(sellableUnitAttr.target).toBe('api::sellable-unit.sellable-unit');
      expect(sellableUnitAttr.required).toBe(true);
    });

    it('should define "channel" as a required enum fixed to "discogs" with default "discogs"', () => {
      const channelAttr = channelListingSchema.attributes.channel;
      expect(channelAttr).toBeDefined();
      expect(channelAttr.type).toBe('enumeration');
      expect(channelAttr.enum).toEqual(Object.values(ChannelType));
      expect(channelAttr.default).toBe(ChannelType.DISCOGS);
      expect(channelAttr.required).toBe(true);
    });

    it('should define "externalListingId" as optional string', () => {
      const externalListingIdAttr = channelListingSchema.attributes.externalListingId;
      expect(externalListingIdAttr).toBeDefined();
      expect(externalListingIdAttr.type).toBe('string');
      expect((externalListingIdAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "externalUrl" as optional string', () => {
      const externalUrlAttr = channelListingSchema.attributes.externalUrl;
      expect(externalUrlAttr).toBeDefined();
      expect(externalUrlAttr.type).toBe('string');
      expect((externalUrlAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "status" as a required enum with default "not_published"', () => {
      const statusAttr = channelListingSchema.attributes.status;
      expect(statusAttr).toBeDefined();
      expect(statusAttr.type).toBe('enumeration');
      expect(statusAttr.enum).toEqual(Object.values(ChannelListingStatus));
      expect(statusAttr.default).toBe(ChannelListingStatus.NOT_PUBLISHED);
      expect(statusAttr.required).toBe(true);
    });

    it('should define "publishedPrice" as optional decimal', () => {
      const publishedPriceAttr = channelListingSchema.attributes.publishedPrice;
      expect(publishedPriceAttr).toBeDefined();
      expect(publishedPriceAttr.type).toBe('decimal');
      expect((publishedPriceAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "lastSyncedAt" as optional datetime', () => {
      const lastSyncedAtAttr = channelListingSchema.attributes.lastSyncedAt;
      expect(lastSyncedAtAttr).toBeDefined();
      expect(lastSyncedAtAttr.type).toBe('datetime');
      expect((lastSyncedAtAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "lastErrorMessage" as optional text', () => {
      const lastErrorMessageAttr = channelListingSchema.attributes.lastErrorMessage;
      expect(lastErrorMessageAttr).toBeDefined();
      expect(lastErrorMessageAttr.type).toBe('text');
      expect((lastErrorMessageAttr as { required?: boolean }).required).toBeUndefined();
    });
  });

  describe('API Controllers, Services, and Routes', () => {
    it('should export Strapi core controller factory wrapper', () => {
      expect(channelListingController).toBeDefined();
    });

    it('should export Strapi core service factory wrapper', () => {
      expect(channelListingService).toBeDefined();
    });

    it('should export Strapi core router factory wrapper', () => {
      expect(channelListingRoutes).toBeDefined();
    });
  });
});
