import discogsRoutes from '@/api/discogs/routes/discogs';

describe('Discogs Custom Routes (T-13)', () => {
  it('should export a routes object with 5 endpoints', () => {
    expect(discogsRoutes).toBeDefined();
    expect(discogsRoutes.routes).toBeDefined();
    expect(Array.isArray(discogsRoutes.routes)).toBe(true);
    expect(discogsRoutes.routes.length).toBe(5);
  });

  it('should define GET /discogs/search route with auth disabled', () => {
    const route = discogsRoutes.routes.find((r) => r.path === '/discogs/search');
    expect(route).toBeDefined();
    expect(route?.method).toBe('GET');
    expect(route?.handler).toBe('discogs.search');
    expect(route?.config?.auth).toBe(false);
  });

  it('should define POST /products/:id/attach-discogs-release route', () => {
    const route = discogsRoutes.routes.find(
      (r) => r.path === '/products/:id/attach-discogs-release'
    );
    expect(route).toBeDefined();
    expect(route?.method).toBe('POST');
    expect(route?.handler).toBe('discogs.attachDiscogsRelease');
    expect(route?.config?.auth).toBe(false);
  });

  it('should define POST /sellable-units/:id/check-discogs-completeness route', () => {
    const route = discogsRoutes.routes.find(
      (r) => r.path === '/sellable-units/:id/check-discogs-completeness'
    );
    expect(route).toBeDefined();
    expect(route?.method).toBe('POST');
    expect(route?.handler).toBe('discogs.checkDiscogsCompleteness');
    expect(route?.config?.auth).toBe(false);
  });

  it('should define POST /sellable-units/:id/publish-discogs route', () => {
    const route = discogsRoutes.routes.find(
      (r) => r.path === '/sellable-units/:id/publish-discogs'
    );
    expect(route).toBeDefined();
    expect(route?.method).toBe('POST');
    expect(route?.handler).toBe('discogs.publishDiscogs');
    expect(route?.config?.auth).toBe(false);
  });

  it('should define POST /sellable-units/:id/simulate-discogs-sale route', () => {
    const route = discogsRoutes.routes.find(
      (r) => r.path === '/sellable-units/:id/simulate-discogs-sale'
    );
    expect(route).toBeDefined();
    expect(route?.method).toBe('POST');
    expect(route?.handler).toBe('discogs.simulateDiscogsSale');
    expect(route?.config?.auth).toBe(false);
  });
});
