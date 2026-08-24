import { DiscCondition, SleeveCondition } from '@/common/enums';

/**
 * Discogs Search Result item DTO.
 */
export interface DiscogsSearchResult {
  id: string;
  title: string;
  artist: string;
  year?: number;
  country?: string;
  format?: string;
  label?: string;
  masterId?: string | null;
  coverImage?: string;
  thumb?: string;
  uri?: string;
  barcode?: string;
}

/**
 * Discogs Track detail item.
 */
export interface DiscogsTrack {
  position?: string;
  title: string;
  duration?: string;
}

/**
 * Discogs Image resource.
 */
export interface DiscogsImage {
  type?: string;
  uri?: string;
}

/**
 * Discogs Release full detailed metadata DTO.
 */
export interface DiscogsRelease {
  id: string;
  title: string;
  artist: string;
  year?: number;
  country?: string;
  format?: string;
  label?: string;
  masterId?: string | null;
  barcode?: string;
  description?: string;
  genres?: string[];
  styles?: string[];
  tracklist?: DiscogsTrack[];
  images?: DiscogsImage[];
  uri?: string;
}

/**
 * Parameters required to publish a listing on Discogs.
 */
export interface PublishListingParams {
  releaseId: string;
  condition: DiscCondition | string;
  sleeveCondition?: SleeveCondition | string;
  price: number;
  status?: string;
  sellerNotes?: string;
  location?: string;
}

/**
 * Result returned after publishing a listing on Discogs.
 */
export interface PublishListingResult {
  externalListingId: string;
  externalUrl: string;
}

/**
 * Validation result for Discogs completeness verification.
 */
export interface ValidationResult {
  complete: boolean;
  missingFields: string[];
}

/**
 * Common interface contract for Discogs connectors (Mock and Real).
 */
export interface IDiscogsConnector {
  searchReleases(query: string): Promise<DiscogsSearchResult[]>;
  getRelease(releaseId: string): Promise<DiscogsRelease>;
  publishListing(params: PublishListingParams): Promise<PublishListingResult>;
}
