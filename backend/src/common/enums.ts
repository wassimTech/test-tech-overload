/**
 * Shared domain enums mirroring Strapi content-type schema definitions.
 */

export enum ProductType {
  VINYL = 'vinyl',
}

export enum DiscCondition {
  MINT = 'Mint',
  NEAR_MINT = 'Near Mint',
  VERY_GOOD_PLUS = 'Very Good Plus',
  VERY_GOOD = 'Very Good',
  GOOD_PLUS = 'Good Plus',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
}

export enum SleeveCondition {
  MINT = 'Mint',
  NEAR_MINT = 'Near Mint',
  VERY_GOOD_PLUS = 'Very Good Plus',
  VERY_GOOD = 'Very Good',
  GOOD_PLUS = 'Good Plus',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
}

export enum SellableUnitStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}

export enum ChannelType {
  DISCOGS = 'discogs',
}

export enum ChannelListingStatus {
  NOT_PUBLISHED = 'not_published',
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed',
  REMOVED = 'removed',
  SYNC_ERROR = 'sync_error',
}

export enum SyncAction {
  SEARCH_RELEASE = 'search_release',
  CHECK_COMPLETENESS = 'check_completeness',
  PUBLISH_LISTING = 'publish_listing',
  MARK_OUT_OF_STOCK = 'mark_out_of_stock',
}

export enum SyncStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}
