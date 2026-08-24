/**
 * product controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request?.body?.data || ctx.request?.body || {};
    const { tenant: tenantInput, ...rest } = body;

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

    if (!tenantDocumentId) {
      return ctx.badRequest('Tenant is required and could not be resolved.');
    }

    const createdProduct = await strapi.documents('api::product.product').create({
      data: {
        ...rest,
        tenant: tenantDocumentId,
      },
    });

    ctx.body = { data: createdProduct };
    return ctx.body;
  },
}));
