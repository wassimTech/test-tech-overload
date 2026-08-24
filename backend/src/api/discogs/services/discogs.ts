import type { Core } from '@strapi/strapi';
import type {
  ChannelType,
  ChannelListingStatus,
  SellableUnitStatus,
  SyncAction,
  SyncStatus,
} from '@/common/enums';
import type {
  DiscogsSearchResult,
  ValidationResult,
  SearchReleasesServiceParams,
  AttachReleaseServiceParams,
  CheckCompletenessServiceParams,
  PublishDiscogsServiceParams,
  PublishDiscogsServiceResult,
  SimulateSaleServiceParams,
  SimulateSaleResult,
} from '@/api/discogs/types';
import { getConnector } from './connector-factory';
import { syncEventLogger } from './sync-event-logger';

const DISCOGS_CHANNEL = 'discogs' as ChannelType;
const ACTION_SEARCH_RELEASE = 'search_release' as SyncAction;
const ACTION_CHECK_COMPLETENESS = 'check_completeness' as SyncAction;
const ACTION_PUBLISH_LISTING = 'publish_listing' as SyncAction;
const ACTION_MARK_OUT_OF_STOCK = 'mark_out_of_stock' as SyncAction;
const STATUS_SUCCESS = 'success' as SyncStatus;
const STATUS_FAILED = 'failed' as SyncStatus;
const LISTING_STATUS_PUBLISHED = 'published' as ChannelListingStatus;
const LISTING_STATUS_REMOVED = 'removed' as ChannelListingStatus;
const UNIT_STATUS_AVAILABLE = 'available' as SellableUnitStatus;
const UNIT_STATUS_SOLD = 'sold' as SellableUnitStatus;

interface TenantRelation {
  id?: number | string;
  documentId?: string;
  slug?: string;
}

interface ProductDocument {
  id?: number | string;
  documentId: string;
  title: string;
  artist: string;
  label?: string;
  year?: number;
  country?: string;
  format?: string;
  discogsReleaseId?: string;
  discogsMasterId?: string;
  tenant?: TenantRelation;
}

interface SellableUnitDocument {
  id?: number | string;
  documentId: string;
  price?: number | string | null;
  discCondition?: string;
  sleeveCondition?: string;
  sellerNotes?: string;
  status: string;
  quantity?: number;
  location?: string;
  product?: ProductDocument;
  tenant?: TenantRelation;
}

interface ChannelListingDocument {
  id?: number | string;
  documentId: string;
  status: string;
  channel: string;
  externalListingId?: string;
  externalUrl?: string;
  publishedPrice?: number;
  tenant?: TenantRelation;
  sellableUnit?: SellableUnitDocument;
}

/**
 * Checks if an entity's tenant relation matches the requested tenantId.
 */
function isMatchingTenant(tenantRelation: TenantRelation | undefined, tenantId: string): boolean {
  if (!tenantRelation) {
    return false;
  }
  if (tenantRelation.documentId && tenantRelation.documentId === tenantId) {
    return true;
  }
  if (tenantRelation.slug && tenantRelation.slug === tenantId) {
    return true;
  }
  if (tenantRelation.id !== undefined && String(tenantRelation.id) === tenantId) {
    return true;
  }
  return false;
}

/**
 * Orchestration service class handling all Discogs domain workflows.
 */
export class DiscogsService {
  private readonly strapi: Core.Strapi;

  constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  /**
   * Searches releases on Discogs marketplace via connector and logs sync event.
   */
  async searchReleases(params: SearchReleasesServiceParams): Promise<DiscogsSearchResult[]> {
    const { tenantId, query, token } = params;

    if (!tenantId || !tenantId.trim()) {
      throw new Error('tenantId is required');
    }
    if (!query || !query.trim()) {
      throw new Error("Query parameter 'q' is required");
    }

    const connector = getConnector(token);

    try {
      const results = await connector.searchReleases(query.trim());

      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_SEARCH_RELEASE,
        status: STATUS_SUCCESS,
        message: `Found ${results.length} Discogs release(s) for query "${query.trim()}"`,
        payload: { query: query.trim(), resultsCount: results.length },
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_SEARCH_RELEASE,
        status: STATUS_FAILED,
        message: `Search releases failed for query "${query.trim()}": ${errorMessage}`,
        payload: { query: query.trim(), error: errorMessage },
      });
      throw error;
    }
  }

  /**
   * Fetches metadata for a Discogs release and attaches it to the specified product.
   */
  async attachDiscogsRelease(params: AttachReleaseServiceParams): Promise<ProductDocument> {
    const { tenantId, productId, releaseId, token } = params;

    if (!tenantId || !tenantId.trim()) {
      throw new Error('tenantId is required');
    }
    if (!productId || !productId.trim()) {
      throw new Error('productId is required');
    }
    if (!releaseId || !releaseId.trim()) {
      throw new Error('releaseId is required');
    }

    // 1. Fetch and verify Product belongs to the specified tenant
    const product = (await this.strapi.documents('api::product.product').findOne({
      documentId: productId,
      populate: ['tenant'],
    })) as ProductDocument | null;

    if (!product || !isMatchingTenant(product.tenant, tenantId)) {
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_SEARCH_RELEASE,
        status: STATUS_FAILED,
        message: `Product ${productId} not found for tenant ${tenantId}`,
        payload: { productId, releaseId },
      });
      throw new Error(`Product ${productId} not found for the specified tenant`);
    }

    const connector = getConnector(token);

    try {
      // 2. Fetch full release metadata
      const release = await connector.getRelease(releaseId.trim());

      // 3. Update Product catalog metadata
      const updatedProduct = (await this.strapi.documents('api::product.product').update({
        documentId: product.documentId,
        data: {
          discogsReleaseId: release.id,
          ...(release.masterId !== undefined && release.masterId !== null
            ? { discogsMasterId: release.masterId }
            : {}),
          artist: release.artist,
          title: release.title,
          ...(release.label ? { label: release.label } : {}),
          ...(release.year !== undefined ? { year: release.year } : {}),
          ...(release.country ? { country: release.country } : {}),
          ...(release.format ? { format: release.format } : {}),
        },
      })) as ProductDocument;

      // 4. Log successful attachment
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_SEARCH_RELEASE,
        status: STATUS_SUCCESS,
        message: `Attached Discogs release ${releaseId} (${release.artist} - ${release.title}) to product ${productId}`,
        productId: product.documentId,
        payload: {
          releaseId: release.id,
          artist: release.artist,
          title: release.title,
          masterId: release.masterId,
        },
      });

      return updatedProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown attach error';
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_SEARCH_RELEASE,
        status: STATUS_FAILED,
        message: `Failed to attach release ${releaseId} to product ${productId}: ${errorMessage}`,
        productId: product.documentId,
        payload: { releaseId, error: errorMessage },
      });
      throw error;
    }
  }

  /**
   * Evaluates if a SellableUnit satisfies all prerequisites for Discogs publication.
   */
  async checkDiscogsCompleteness(
    params: CheckCompletenessServiceParams
  ): Promise<ValidationResult> {
    const { tenantId, sellableUnitId } = params;

    if (!tenantId || !tenantId.trim()) {
      throw new Error('tenantId is required');
    }
    if (!sellableUnitId || !sellableUnitId.trim()) {
      throw new Error('sellableUnitId is required');
    }

    const unit = (await this.strapi.documents('api::sellable-unit.sellable-unit').findOne({
      documentId: sellableUnitId,
      populate: ['product', 'tenant'],
    })) as SellableUnitDocument | null;

    if (!unit || !isMatchingTenant(unit.tenant, tenantId)) {
      throw new Error(`SellableUnit ${sellableUnitId} not found for the specified tenant`);
    }

    const missingFields: string[] = [];

    // 1. Price validation: must be a positive number
    const priceNum = typeof unit.price === 'string' ? parseFloat(unit.price) : unit.price;
    if (priceNum === undefined || priceNum === null || isNaN(priceNum) || priceNum <= 0) {
      missingFields.push('price');
    }

    // 2. Conditions validation
    if (!unit.discCondition || !unit.discCondition.trim()) {
      missingFields.push('discCondition');
    }
    if (!unit.sleeveCondition || !unit.sleeveCondition.trim()) {
      missingFields.push('sleeveCondition');
    }

    // 3. Product catalog Discogs release link validation
    if (!unit.product || !unit.product.discogsReleaseId || !unit.product.discogsReleaseId.trim()) {
      missingFields.push('product.discogsReleaseId');
    }

    // 4. SellableUnit inventory status validation
    if (unit.status !== UNIT_STATUS_AVAILABLE) {
      missingFields.push('status');
    }

    const complete = missingFields.length === 0;

    await syncEventLogger.log({
      strapi: this.strapi,
      tenantId,
      channel: DISCOGS_CHANNEL,
      action: ACTION_CHECK_COMPLETENESS,
      status: complete ? STATUS_SUCCESS : STATUS_FAILED,
      message: complete
        ? `Completeness check passed for SellableUnit ${sellableUnitId}`
        : `Completeness check failed for SellableUnit ${sellableUnitId}: missing ${missingFields.join(', ')}`,
      sellableUnitId: unit.documentId,
      productId: unit.product?.documentId,
      payload: { complete, missingFields },
    });

    return { complete, missingFields };
  }

  /**
   * Publishes a SellableUnit to Discogs marketplace (or mock) and updates/creates ChannelListing.
   */
  async publishListing(params: PublishDiscogsServiceParams): Promise<PublishDiscogsServiceResult> {
    const { tenantId, sellableUnitId, token } = params;

    if (!tenantId || !tenantId.trim()) {
      throw new Error('tenantId is required');
    }
    if (!sellableUnitId || !sellableUnitId.trim()) {
      throw new Error('sellableUnitId is required');
    }

    const unit = (await this.strapi.documents('api::sellable-unit.sellable-unit').findOne({
      documentId: sellableUnitId,
      populate: ['product', 'tenant'],
    })) as SellableUnitDocument | null;

    if (!unit || !isMatchingTenant(unit.tenant, tenantId)) {
      throw new Error(`SellableUnit ${sellableUnitId} not found for the specified tenant`);
    }

    // Validate completeness
    const validation = await this.checkDiscogsCompleteness({ tenantId, sellableUnitId });
    if (!validation.complete) {
      const errorMsg = `Cannot publish: SellableUnit is incomplete (missing: ${validation.missingFields.join(', ')})`;
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_PUBLISH_LISTING,
        status: STATUS_FAILED,
        message: errorMsg,
        sellableUnitId: unit.documentId,
        productId: unit.product?.documentId,
        payload: { missingFields: validation.missingFields },
      });
      throw new Error(errorMsg);
    }

    const connector = getConnector(token);
    const priceNum =
      typeof unit.price === 'string' ? parseFloat(unit.price) : (unit.price as number);

    try {
      const publishResult = await connector.publishListing({
        releaseId: unit.product!.discogsReleaseId!,
        condition: unit.discCondition!,
        sleeveCondition: unit.sleeveCondition,
        price: priceNum,
        status: unit.status,
        sellerNotes: unit.sellerNotes,
        location: unit.location,
      });

      // Upsert ChannelListing
      const existingListing = (await this.strapi
        .documents('api::channel-listing.channel-listing')
        .findFirst({
          filters: {
            sellableUnit: { documentId: unit.documentId },
            channel: DISCOGS_CHANNEL,
          },
        })) as ChannelListingDocument | null;

      let channelListing: ChannelListingDocument;

      if (existingListing) {
        channelListing = (await this.strapi
          .documents('api::channel-listing.channel-listing')
          .update({
            documentId: existingListing.documentId,
            data: {
              status: LISTING_STATUS_PUBLISHED,
              externalListingId: publishResult.externalListingId,
              externalUrl: publishResult.externalUrl,
              publishedPrice: priceNum,
              lastSyncedAt: new Date(),
              lastErrorMessage: undefined,
            },
          })) as ChannelListingDocument;
      } else {
        channelListing = (await this.strapi
          .documents('api::channel-listing.channel-listing')
          .create({
            data: {
              tenant: unit.tenant?.documentId || tenantId,
              sellableUnit: unit.documentId,
              channel: DISCOGS_CHANNEL,
              status: LISTING_STATUS_PUBLISHED,
              externalListingId: publishResult.externalListingId,
              externalUrl: publishResult.externalUrl,
              publishedPrice: priceNum,
              lastSyncedAt: new Date(),
            },
          })) as ChannelListingDocument;
      }

      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_PUBLISH_LISTING,
        status: STATUS_SUCCESS,
        message: `Successfully published SellableUnit ${sellableUnitId} to Discogs as listing ${publishResult.externalListingId}`,
        sellableUnitId: unit.documentId,
        productId: unit.product?.documentId,
        channelListingId: channelListing.documentId,
        payload: {
          externalListingId: publishResult.externalListingId,
          externalUrl: publishResult.externalUrl,
          publishedPrice: priceNum,
        },
      });

      return {
        channelListing: channelListing as unknown as Record<string, unknown>,
        discogsResult: publishResult,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown publish error';
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_PUBLISH_LISTING,
        status: STATUS_FAILED,
        message: `Failed to publish SellableUnit ${sellableUnitId} to Discogs: ${errorMessage}`,
        sellableUnitId: unit.documentId,
        productId: unit.product?.documentId,
        payload: { error: errorMessage },
      });
      throw error;
    }
  }

  /**
   * Simulates a Discogs marketplace sale by marking the SellableUnit as sold and ChannelListing as removed.
   */
  async simulateDiscogsSale(params: SimulateSaleServiceParams): Promise<SimulateSaleResult> {
    const { tenantId, sellableUnitId } = params;

    if (!tenantId || !tenantId.trim()) {
      throw new Error('tenantId is required');
    }
    if (!sellableUnitId || !sellableUnitId.trim()) {
      throw new Error('sellableUnitId is required');
    }

    const unit = (await this.strapi.documents('api::sellable-unit.sellable-unit').findOne({
      documentId: sellableUnitId,
      populate: ['product', 'tenant'],
    })) as SellableUnitDocument | null;

    if (!unit || !isMatchingTenant(unit.tenant, tenantId)) {
      throw new Error(`SellableUnit ${sellableUnitId} not found for the specified tenant`);
    }

    // Locate active published ChannelListing for this unit
    const listing = (await this.strapi.documents('api::channel-listing.channel-listing').findFirst({
      filters: {
        sellableUnit: { documentId: unit.documentId },
        channel: DISCOGS_CHANNEL,
        status: LISTING_STATUS_PUBLISHED,
      },
    })) as ChannelListingDocument | null;

    if (!listing) {
      const errorMsg = `No active published Discogs listing found for SellableUnit ${sellableUnitId}`;
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_MARK_OUT_OF_STOCK,
        status: STATUS_FAILED,
        message: errorMsg,
        sellableUnitId: unit.documentId,
        productId: unit.product?.documentId,
        payload: { unitStatus: unit.status },
      });
      throw new Error(errorMsg);
    }

    try {
      // 1. Mark unit as sold with 0 quantity
      const updatedUnit = (await this.strapi.documents('api::sellable-unit.sellable-unit').update({
        documentId: unit.documentId,
        data: {
          status: UNIT_STATUS_SOLD,
          quantity: 0,
        },
      })) as SellableUnitDocument;

      // 2. Mark listing as removed
      const updatedListing = (await this.strapi
        .documents('api::channel-listing.channel-listing')
        .update({
          documentId: listing.documentId,
          data: {
            status: LISTING_STATUS_REMOVED,
            lastSyncedAt: new Date(),
          },
        })) as ChannelListingDocument;

      // 3. Log out of stock / sold event
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_MARK_OUT_OF_STOCK,
        status: STATUS_SUCCESS,
        message: `Simulated Discogs sale for SellableUnit ${sellableUnitId}: unit marked sold, listing marked removed`,
        sellableUnitId: unit.documentId,
        productId: unit.product?.documentId,
        channelListingId: listing.documentId,
        payload: {
          previousUnitStatus: unit.status,
          newUnitStatus: UNIT_STATUS_SOLD,
          previousListingStatus: listing.status,
          newListingStatus: LISTING_STATUS_REMOVED,
        },
      });

      return {
        sellableUnit: updatedUnit as unknown as Record<string, unknown>,
        channelListing: updatedListing as unknown as Record<string, unknown>,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sale simulation error';
      await syncEventLogger.log({
        strapi: this.strapi,
        tenantId,
        channel: DISCOGS_CHANNEL,
        action: ACTION_MARK_OUT_OF_STOCK,
        status: STATUS_FAILED,
        message: `Failed to simulate Discogs sale for SellableUnit ${sellableUnitId}: ${errorMessage}`,
        sellableUnitId: unit.documentId,
        productId: unit.product?.documentId,
        channelListingId: listing.documentId,
        payload: { error: errorMessage },
      });
      throw error;
    }
  }
}

/**
 * Strapi service factory export for Discogs API.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => new DiscogsService(strapi);
