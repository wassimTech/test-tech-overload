import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // 1. Create PostgreSQL sequence for SKU auto-generation if not exists
    await strapi.db.connection.raw('CREATE SEQUENCE IF NOT EXISTS sku_seq START 1;');

    // 2. Check and seed default test tenant
    const existingTenant = await strapi.documents('api::tenant.tenant').findFirst({
      filters: { slug: 'vinyl-store' },
    });

    if (!existingTenant) {
      await strapi.documents('api::tenant.tenant').create({
        data: {
          name: 'Vinyl Store',
          slug: 'vinyl-store',
          isActive: true,
        },
      });
    }
  },
};
