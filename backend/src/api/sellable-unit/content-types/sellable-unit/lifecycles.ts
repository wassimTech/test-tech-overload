import { generateSku } from '@/api/sellable-unit/services/sku-generator';

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
    const sku = await generateSku();
    event.params.data.sku = sku;
  },
};
