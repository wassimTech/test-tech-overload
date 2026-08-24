import type { Core } from '@strapi/strapi';
import type { Utils } from '@strapi/types';
import type { ChannelType, SyncAction, SyncStatus } from '@/common/enums';

/**
 * Parameter interface for logging marketplace synchronization events.
 */
export interface LogSyncEventParams {
  strapi: Core.Strapi;
  tenantId: string;
  channel: ChannelType;
  action: SyncAction;
  status: SyncStatus;
  message: string;
  productId?: string;
  sellableUnitId?: string;
  channelListingId?: string;
  payload?: Record<string, unknown>;
}

/**
 * Centralized logger function creating a MarketplaceSyncEvent entry in Strapi.
 *
 * @param params Log parameters including Strapi instance, tenantId, action, status, and optional relations/payload.
 */
export async function logSyncEvent(params: LogSyncEventParams): Promise<void> {
  const {
    strapi,
    tenantId,
    channel,
    action,
    status,
    message,
    productId,
    sellableUnitId,
    channelListingId,
    payload,
  } = params;

  let resolvedTenantDocId = tenantId;
  if (tenantId && strapi?.documents) {
    try {
      const tenant = await strapi.documents('api::tenant.tenant').findFirst({
        filters: {
          $or: [{ slug: tenantId }, { documentId: tenantId }],
        },
      });
      if (tenant) {
        resolvedTenantDocId = tenant.documentId;
      }
    } catch {
      // In test/mock environments where findFirst might not be available
    }
  }

  await strapi.documents('api::marketplace-sync-event.marketplace-sync-event').create({
    data: {
      tenant: resolvedTenantDocId,
      channel,
      action,
      status,
      message,
      timestamp: new Date(),
      ...(productId !== undefined ? { product: productId } : {}),
      ...(sellableUnitId !== undefined ? { sellableUnit: sellableUnitId } : {}),
      ...(channelListingId !== undefined ? { channelListing: channelListingId } : {}),
      ...(payload !== undefined ? { payload: payload as unknown as Utils.JSONValue } : {}),
    },
  });
}

/**
 * Sync Event Logger service object.
 */
export const syncEventLogger = {
  log: logSyncEvent,
};

export default syncEventLogger;
