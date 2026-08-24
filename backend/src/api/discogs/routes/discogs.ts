/**
 * Discogs custom router configuration exposing 5 workflow endpoints.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/discogs/search',
      handler: 'discogs.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/products/:id/attach-discogs-release',
      handler: 'discogs.attachDiscogsRelease',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sellable-units/:id/check-discogs-completeness',
      handler: 'discogs.checkDiscogsCompleteness',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sellable-units/:id/publish-discogs',
      handler: 'discogs.publishDiscogs',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sellable-units/:id/simulate-discogs-sale',
      handler: 'discogs.simulateDiscogsSale',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
