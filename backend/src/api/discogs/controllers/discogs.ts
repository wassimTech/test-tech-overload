import type { Core } from '@strapi/strapi';
import type { DiscogsService } from '@/api/discogs/services/discogs';

export interface StrapiContext {
  query?: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  request?: {
    body?: Record<string, unknown>;
  };
  body?: unknown;
  status?: number;
  throw: (status: number, message?: string) => never;
  badRequest?: (message?: string, details?: unknown) => void;
  notFound?: (message?: string, details?: unknown) => void;
}

/**
 * Thin HTTP controller for Discogs marketplace operations adhering strictly to SRP.
 * Handles request parsing, input validation, and maps responses/errors.
 */
export class DiscogsController {
  private readonly service: DiscogsService;

  constructor(strapi: Core.Strapi, service?: DiscogsService) {
    this.service = service || (strapi.service('api::discogs.discogs') as unknown as DiscogsService);
  }

  /**
   * GET /api/discogs/search?tenantId=...&q=...
   */
  async search(ctx: StrapiContext): Promise<void> {
    const tenantId = ctx.query?.tenantId;
    const query = ctx.query?.q;
    const token = ctx.query?.token;

    if (!tenantId || !tenantId.trim()) {
      ctx.throw(400, 'tenantId query parameter is required');
    }
    if (!query || !query.trim()) {
      ctx.throw(400, "Query parameter 'q' is required");
    }

    try {
      const results = await this.service.searchReleases({
        tenantId: tenantId.trim(),
        query: query.trim(),
        token: token?.trim(),
      });

      ctx.body = { data: results };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search Discogs releases';
      ctx.throw(400, message);
    }
  }

  /**
   * POST /api/products/:id/attach-discogs-release
   */
  async attachDiscogsRelease(ctx: StrapiContext): Promise<void> {
    const productId = ctx.params?.id;
    const body = ctx.request?.body;
    const tenantId =
      (typeof body?.tenantId === 'string' ? body.tenantId : undefined) || ctx.query?.tenantId;
    const releaseId =
      (typeof body?.releaseId === 'string' ? body.releaseId : undefined) ||
      (typeof body?.release_id === 'string' ? body.release_id : undefined) ||
      ctx.query?.releaseId;
    const token = (typeof body?.token === 'string' ? body.token : undefined) || ctx.query?.token;

    if (!productId || !productId.trim()) {
      ctx.throw(400, 'Product id is required');
    }
    if (!tenantId || !tenantId.trim()) {
      ctx.throw(400, 'tenantId is required');
    }
    if (!releaseId || !releaseId.trim()) {
      ctx.throw(400, 'releaseId is required');
    }

    try {
      const updatedProduct = await this.service.attachDiscogsRelease({
        tenantId: tenantId.trim(),
        productId: productId.trim(),
        releaseId: releaseId.trim(),
        token: token?.trim(),
      });

      ctx.body = { data: updatedProduct };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to attach Discogs release';
      if (message.includes('not found')) {
        ctx.throw(404, message);
      }
      ctx.throw(400, message);
    }
  }

  /**
   * POST /api/sellable-units/:id/check-discogs-completeness
   */
  async checkDiscogsCompleteness(ctx: StrapiContext): Promise<void> {
    const sellableUnitId = ctx.params?.id;
    const body = ctx.request?.body;
    const tenantId =
      (typeof body?.tenantId === 'string' ? body.tenantId : undefined) || ctx.query?.tenantId;

    if (!sellableUnitId || !sellableUnitId.trim()) {
      ctx.throw(400, 'SellableUnit id is required');
    }
    if (!tenantId || !tenantId.trim()) {
      ctx.throw(400, 'tenantId is required');
    }

    try {
      const result = await this.service.checkDiscogsCompleteness({
        tenantId: tenantId.trim(),
        sellableUnitId: sellableUnitId.trim(),
      });

      ctx.body = { data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to check completeness for SellableUnit';
      if (message.includes('not found')) {
        ctx.throw(404, message);
      }
      ctx.throw(400, message);
    }
  }

  /**
   * POST /api/sellable-units/:id/publish-discogs
   */
  async publishDiscogs(ctx: StrapiContext): Promise<void> {
    const sellableUnitId = ctx.params?.id;
    const body = ctx.request?.body;
    const tenantId =
      (typeof body?.tenantId === 'string' ? body.tenantId : undefined) || ctx.query?.tenantId;
    const token = (typeof body?.token === 'string' ? body.token : undefined) || ctx.query?.token;

    if (!sellableUnitId || !sellableUnitId.trim()) {
      ctx.throw(400, 'SellableUnit id is required');
    }
    if (!tenantId || !tenantId.trim()) {
      ctx.throw(400, 'tenantId is required');
    }

    try {
      const result = await this.service.publishListing({
        tenantId: tenantId.trim(),
        sellableUnitId: sellableUnitId.trim(),
        token: token?.trim(),
      });

      ctx.body = { data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to publish SellableUnit to Discogs';
      if (message.includes('not found')) {
        ctx.throw(404, message);
      }
      ctx.throw(400, message);
    }
  }

  /**
   * POST /api/sellable-units/:id/simulate-discogs-sale
   */
  async simulateDiscogsSale(ctx: StrapiContext): Promise<void> {
    const sellableUnitId = ctx.params?.id;
    const body = ctx.request?.body;
    const tenantId =
      (typeof body?.tenantId === 'string' ? body.tenantId : undefined) || ctx.query?.tenantId;

    if (!sellableUnitId || !sellableUnitId.trim()) {
      ctx.throw(400, 'SellableUnit id is required');
    }
    if (!tenantId || !tenantId.trim()) {
      ctx.throw(400, 'tenantId is required');
    }

    try {
      const result = await this.service.simulateDiscogsSale({
        tenantId: tenantId.trim(),
        sellableUnitId: sellableUnitId.trim(),
      });

      ctx.body = { data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to simulate Discogs sale';
      if (message.includes('not found')) {
        ctx.throw(404, message);
      }
      ctx.throw(400, message);
    }
  }
}

/**
 * Strapi controller factory export for Discogs API.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => {
  const controller = new DiscogsController(strapi);

  return {
    search: (ctx: StrapiContext) => controller.search(ctx),
    attachDiscogsRelease: (ctx: StrapiContext) => controller.attachDiscogsRelease(ctx),
    checkDiscogsCompleteness: (ctx: StrapiContext) => controller.checkDiscogsCompleteness(ctx),
    publishDiscogs: (ctx: StrapiContext) => controller.publishDiscogs(ctx),
    simulateDiscogsSale: (ctx: StrapiContext) => controller.simulateDiscogsSale(ctx),
  };
};
