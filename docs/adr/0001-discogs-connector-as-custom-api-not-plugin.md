# Discogs connector lives in src/api/discogs, not a Strapi plugin

The Discogs integration is implemented as a custom API (`src/api/discogs/`) with routes, controllers, services, and types — not as a local Strapi plugin (`src/plugins/discogs/`).

A plugin would give us admin panel hooks and a cleaner boundary, but it adds boilerplate (plugin registration, server/content-type nesting, separate build step) that is disproportionate for an 8-hour MVP with a single marketplace. The custom API approach keeps the connector isolated in one directory while staying within Strapi's auto-loading conventions. If a second marketplace is added later, extracting to a plugin is straightforward.

## Considered Options

- **Local Strapi plugin**: cleaner encapsulation, admin UI hooks. Rejected: too much ceremony for a single-marketplace MVP.
- **Standalone service directory** (`src/services/discogs/`): not auto-loaded by Strapi, would require manual registration.
