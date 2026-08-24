/**
 * sellable-unit controller
 */

import { factories } from '@strapi/strapi';
import { generateSku } from '../services/sku-generator';

export default factories.createCoreController('api::sellable-unit.sellable-unit', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request?.body?.data || ctx.request?.body || {};
    const { tenant: tenantInput, product: productInput, ...rest } = body;

    // Resolve tenant documentId
    let tenantDocumentId: string | undefined;
    if (typeof tenantInput === 'string') {
      const tenant = await strapi.documents('api::tenant.tenant').findFirst({
        filters: {
          $or: [{ slug: tenantInput }, { documentId: tenantInput }],
        },
      });
      if (tenant) {
        tenantDocumentId = tenant.documentId;
      }
    } else if (tenantInput && typeof tenantInput === 'object') {
      const rawId =
        (tenantInput as Record<string, unknown>).documentId ||
        (tenantInput as { connect?: Array<string | { documentId?: string }> }).connect?.[0] ||
        (tenantInput as { set?: Array<string | { documentId?: string }> }).set?.[0];
      if (typeof rawId === 'string') {
        tenantDocumentId = rawId;
      } else if (rawId && typeof rawId === 'object' && 'documentId' in rawId) {
        tenantDocumentId = (rawId as { documentId: string }).documentId;
      }
    }

    if (!tenantDocumentId) {
      const defaultTenant = await strapi.documents('api::tenant.tenant').findFirst({
        filters: { slug: 'vinyl-store' },
      });
      if (defaultTenant) {
        tenantDocumentId = defaultTenant.documentId;
      }
    }

    // Resolve product documentId
    let productDocumentId: string | undefined;
    if (typeof productInput === 'string') {
      let product = await strapi.documents('api::product.product').findOne({
        documentId: productInput,
      });
      if (!product) {
        const numId = Number(productInput);
        if (!isNaN(numId)) {
          product = await strapi.documents('api::product.product').findFirst({
            filters: { id: numId },
          });
        }
      }
      if (product) {
        productDocumentId = product.documentId;
      }
    } else if (productInput && typeof productInput === 'object') {
      const rawProdId =
        (productInput as Record<string, unknown>).documentId ||
        (productInput as { connect?: Array<string | { documentId?: string }> }).connect?.[0] ||
        (productInput as { set?: Array<string | { documentId?: string }> }).set?.[0];
      if (typeof rawProdId === 'string') {
        productDocumentId = rawProdId;
      } else if (rawProdId && typeof rawProdId === 'object' && 'documentId' in rawProdId) {
        productDocumentId = (rawProdId as { documentId: string }).documentId;
      }
    } else if (typeof productInput === 'number') {
      const product = await strapi.documents('api::product.product').findFirst({
        filters: { id: productInput },
      });
      if (product) {
        productDocumentId = product.documentId;
      }
    }

    if (!tenantDocumentId) {
      return ctx.badRequest('Tenant is required and could not be resolved.');
    }
    if (!productDocumentId) {
      return ctx.badRequest('Product is required and could not be resolved.');
    }

    // Generate formatted SKU (VIN-XXXXXX)
    let autoSku: string;
    try {
      const skuService = strapi.service('api::sellable-unit.sku-generator') as
        { generateSku: () => Promise<string> } | undefined;
      autoSku = skuService?.generateSku
        ? await skuService.generateSku()
        : await generateSku(strapi);
    } catch {
      autoSku = `VIN-${String(Date.now()).slice(-6)}`;
    }

    const createdUnit = await strapi.documents('api::sellable-unit.sellable-unit').create({
      data: {
        ...rest,
        sku: autoSku,
        tenant: tenantDocumentId,
        product: productDocumentId,
      },
    });

    ctx.body = { data: createdUnit };
    return ctx.body;
  },
}));
