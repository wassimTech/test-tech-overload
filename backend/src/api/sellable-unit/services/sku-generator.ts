import type { Core } from '@strapi/strapi';

declare const strapi: Core.Strapi;

/**
 * Generates an auto-incrementing SKU formatted as VIN-XXXXXX (e.g., VIN-000001)
 * using the dedicated PostgreSQL sequence 'sku_seq'.
 *
 * @param strapiInstance Optional Strapi instance (defaults to global strapi)
 * @returns Formatted SKU string
 */
export async function generateSku(strapiInstance?: Core.Strapi): Promise<string> {
  const instance = strapiInstance || (typeof strapi !== 'undefined' ? strapi : undefined);

  if (!instance) {
    throw new Error('Strapi instance is not available for SKU generation');
  }

  const result = await instance.db.connection.raw("SELECT nextval('sku_seq');");

  const row = result?.rows?.[0];
  if (!row) {
    throw new Error('Failed to retrieve next sequence value from sku_seq');
  }

  const nextValRaw = row.nextval ?? row.NEXTVAL ?? Object.values(row)[0];
  if (nextValRaw === undefined || nextValRaw === null || nextValRaw === '') {
    throw new Error('Failed to retrieve next sequence value from sku_seq');
  }

  const seqNumber = parseInt(String(nextValRaw), 10);
  if (isNaN(seqNumber)) {
    throw new Error(`Invalid sequence value received from sku_seq: ${String(nextValRaw)}`);
  }

  return `VIN-${String(seqNumber).padStart(6, '0')}`;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  generateSku: () => generateSku(strapi),
});
