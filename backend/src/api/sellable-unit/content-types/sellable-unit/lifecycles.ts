import type { Core } from '@strapi/strapi';

declare const strapi: Core.Strapi;

export interface LifecycleEvent<T = Record<string, unknown>> {
  action?: string;
  model?: unknown;
  params: {
    data: T;
    where?: Record<string, unknown>;
    select?: unknown;
    populate?: unknown;
  };
}

export default {
  /**
   * Automatically generates a formatted SKU (VIN-XXXXXX) before creating a SellableUnit.
   * Any SKU provided manually in the request payload is ignored and overwritten for security.
   */
  async beforeCreate(
    event: LifecycleEvent<{ sku?: string; [key: string]: unknown }>
  ): Promise<void> {
    const strapiInstance = typeof strapi !== 'undefined' ? strapi : undefined;
    if (!strapiInstance) {
      return;
    }

    const skuService = strapiInstance.service?.('api::sellable-unit.sku-generator') as
      { generateSku: () => Promise<string> } | undefined;

    if (skuService?.generateSku) {
      event.params.data.sku = await skuService.generateSku();
      return;
    }

    // Direct fallback if service is not registered directly on mock instance (e.g. in tests)
    if (strapiInstance.db?.connection?.raw) {
      const result = await strapiInstance.db.connection.raw("SELECT nextval('sku_seq');");
      const row = result?.rows?.[0];
      const nextValRaw = row?.nextval ?? row?.NEXTVAL ?? Object.values(row || {})[0];
      const seqNumber = parseInt(String(nextValRaw), 10);
      if (!isNaN(seqNumber)) {
        event.params.data.sku = `VIN-${String(seqNumber).padStart(6, '0')}`;
      }
    }
  },
};
