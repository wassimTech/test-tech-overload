import {
  ProductType,
  DiscCondition,
  SleeveCondition,
  SellableUnitStatus,
  ChannelType,
  ChannelListingStatus,
  SyncAction,
  SyncStatus,
} from '../src/common/enums';

describe('Shared Domain Enums', () => {
  describe('ProductType', () => {
    it('should have VINYL with value "vinyl"', () => {
      expect(ProductType.VINYL).toBe('vinyl');
    });
  });

  describe('DiscCondition and SleeveCondition', () => {
    const expectedConditions = [
      ['MINT', 'Mint'],
      ['NEAR_MINT', 'Near Mint'],
      ['VERY_GOOD_PLUS', 'Very Good Plus'],
      ['VERY_GOOD', 'Very Good'],
      ['GOOD_PLUS', 'Good Plus'],
      ['GOOD', 'Good'],
      ['FAIR', 'Fair'],
      ['POOR', 'Poor'],
    ] as const;

    it.each(expectedConditions)('DiscCondition.%s should have value "%s"', (key, value) => {
      expect(DiscCondition[key as keyof typeof DiscCondition]).toBe(value);
    });

    it.each(expectedConditions)('SleeveCondition.%s should have value "%s"', (key, value) => {
      expect(SleeveCondition[key as keyof typeof SleeveCondition]).toBe(value);
    });
  });

  describe('SellableUnitStatus', () => {
    const expectedStatuses = [
      ['AVAILABLE', 'available'],
      ['RESERVED', 'reserved'],
      ['SOLD', 'sold'],
      ['OUT_OF_STOCK', 'out_of_stock'],
      ['ARCHIVED', 'archived'],
    ] as const;

    it.each(expectedStatuses)('SellableUnitStatus.%s should have value "%s"', (key, value) => {
      expect(SellableUnitStatus[key as keyof typeof SellableUnitStatus]).toBe(value);
    });
  });

  describe('ChannelType', () => {
    it('should have DISCOGS with value "discogs"', () => {
      expect(ChannelType.DISCOGS).toBe('discogs');
    });
  });

  describe('ChannelListingStatus', () => {
    const expectedStatuses = [
      ['NOT_PUBLISHED', 'not_published'],
      ['PENDING', 'pending'],
      ['PUBLISHED', 'published'],
      ['FAILED', 'failed'],
      ['REMOVED', 'removed'],
      ['SYNC_ERROR', 'sync_error'],
    ] as const;

    it.each(expectedStatuses)('ChannelListingStatus.%s should have value "%s"', (key, value) => {
      expect(ChannelListingStatus[key as keyof typeof ChannelListingStatus]).toBe(value);
    });
  });

  describe('SyncAction', () => {
    const expectedActions = [
      ['SEARCH_RELEASE', 'search_release'],
      ['CHECK_COMPLETENESS', 'check_completeness'],
      ['PUBLISH_LISTING', 'publish_listing'],
      ['MARK_OUT_OF_STOCK', 'mark_out_of_stock'],
    ] as const;

    it.each(expectedActions)('SyncAction.%s should have value "%s"', (key, value) => {
      expect(SyncAction[key as keyof typeof SyncAction]).toBe(value);
    });
  });

  describe('SyncStatus', () => {
    const expectedStatuses = [
      ['SUCCESS', 'success'],
      ['FAILED', 'failed'],
      ['PENDING', 'pending'],
    ] as const;

    it.each(expectedStatuses)('SyncStatus.%s should have value "%s"', (key, value) => {
      expect(SyncStatus[key as keyof typeof SyncStatus]).toBe(value);
    });
  });
});
