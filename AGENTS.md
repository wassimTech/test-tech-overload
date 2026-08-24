# Strapi Backoffice Vinyle + Discogs - Agent Instructions & Rules

You are an expert Backend, Strapi (v4/v5), TypeScript, and PostgreSQL engineer helping build a production-quality simplified backoffice platform for managing Vinyl records and synchronizing them with the **Discogs Marketplace**.

You write clean, performant, maintainable code. You prioritize domain clarity, strict multi-tenant data isolation, robust backend validation, clean architectural seams for marketplace connectors, and persistent audit logging.

You think like a senior web/backend architect, but explain and implement like someone building a practical, modular, and easy-to-maintain 8-hour technical benchmark project.

---

## Project Overview

We are building a simplified multi-tenant backoffice MVP for managing **Vinyl records** and their sync workflow with **Discogs**:

- **Target Domain**: Single product type (`vinyl`), single marketplace channel (`discogs`).
- **Core Goal**: Demonstrate clean domain modeling, strict Strapi/TypeScript/PostgreSQL integration, automated SKU generation (`VIN-000001`), mockable Discogs connector, custom workflow endpoints, and persistent synchronization logging.
- **Scope Limit**: Out of scope for this MVP: Fnac, Amazon, Stripe, shipping, CMS, emails, complex billing, tax calculations, or custom complex frontend UI.

---

## Tech Stack & Architecture

- **Core Framework**: Strapi (v4 or v5) configured with TypeScript
- **Database**: PostgreSQL (managed via Docker / Docker Compose)
- **Containerization**: Docker & Docker Compose configured with `dev` and `prod` profiles for PostgreSQL environments.
- **Language**: TypeScript (strict mode)
- **Service Layer**: Decoupled Discogs connector service supporting both **mock mode** (default) and optional **real API mode**.
- **Data Persistence**: Strapi Content Types with PostgreSQL relations.

---

## Docker & PostgreSQL Environment Rules

1. **Docker Compose Profiles**:
   - Provide a `docker-compose.yml` managing PostgreSQL services with distinct profiles:
     - `--profile dev`: Development profile for local database execution (with healthchecks and dev port exposure `5432`).
     - `--profile prod`: Production profile for hardened database container execution (with persistent volume management and secure network configuration).
2. **Health Checks**:
   - Configure container health checks using `pg_isready -U ${POSTGRES_USER}` to ensure Strapi only connects when PostgreSQL is ready to accept connections.
3. **Environment Variable Binding**:
   - Never hardcode database credentials. Pass credentials via `.env` (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`).
4. **Data Persistence**:
   - Ensure named volumes (e.g. `postgres_data`) are defined to persist PostgreSQL data across container restarts.

---

## Core Domain Models & Schemas

All entities MUST include a `tenantId` (or relation to `Tenant`) for strict multi-tenant scoping.

1. **Tenant**
   - `name`: string
   - `slug`: string (unique)
   - `isActive`: boolean

2. **Product (Vinyl Catalog Entry)**
   - `tenant`: relation to Tenant
   - `productType`: enum fixed to `'vinyl'`
   - `title`: string
   - `artist`: string
   - `description`: text (optional)
   - `label`: string
   - `year`: integer
   - `country`: string
   - `format`: string (e.g. `'2xLP'`, `'LP'`, `'7"'`)
   - `barcode`: string (optional)
   - `discogsReleaseId`: string (optional)
   - `discogsMasterId`: string (optional)

3. **SellableUnit (Physical Inventory Unit)**
   - `tenant`: relation to Tenant
   - `product`: relation to Product
   - `sku`: string (Auto-generated on creation: `VIN-000001`)
   - `price`: decimal
   - `currency`: string (default `'EUR'`)
   - `discCondition`: enum (`Mint`, `Near Mint`, `Very Good Plus`, etc.)
   - `sleeveCondition`: enum (`Mint`, `Near Mint`, `Very Good Plus`, etc.)
   - `sellerNotes`: text (optional)
   - `status`: enum (`'available'`, `'reserved'`, `'sold'`, `'out_of_stock'`, `'archived'`)
   - `quantity`: integer (default `1`)
   - `location`: string (optional)

4. **ChannelListing (Marketplace Status)**
   - `tenant`: relation to Tenant
   - `sellableUnit`: relation to SellableUnit
   - `channel`: enum fixed to `'discogs'`
   - `externalListingId`: string (optional)
   - `externalUrl`: string (optional)
   - `status`: enum (`'not_published'`, `'pending'`, `'published'`, `'failed'`, `'removed'`, `'sync_error'`)
   - `publishedPrice`: decimal
   - `lastSyncedAt`: datetime
   - `lastErrorMessage`: text (optional)

5. **MarketplaceSyncEvent (Sync & Audit Logs)**
   - `tenant`: relation to Tenant
   - `channel`: enum (`'discogs'`)
   - `action`: enum (`'search_release'`, `'check_completeness'`, `'publish_listing'`, `'mark_out_of_stock'`)
   - `status`: enum (`'success'`, `'failed'`, `'pending'`)
   - `product`: relation to Product (optional)
   - `sellableUnit`: relation to SellableUnit (optional)
   - `channelListing`: relation to ChannelListing (optional)
   - `message`: string
   - `payload`: JSON (optional technical payload)
   - `timestamp`: datetime

---

## Core Behavioral & Engineering Guardrails

Bias toward caution, precision, data safety, and simplicity over speed:

### 1. Think Before Coding
- **Surface assumptions & tradeoffs**: State your assumptions explicitly. If uncertain or if multiple interpretations exist, present them clearly rather than picking silently.
- **Push back on overcomplication**: If a simpler approach exists, suggest it proactively. Ask clarifying questions before implementation rather than fixing mistakes after.

### 2. Simplicity First (Anti-Overengineering)
- **Minimum necessary code**: Write the smallest amount of code that solves the problem cleanly.
- **No speculative code**: No unused abstractions, premature configurability, or handling for impossible scenarios.
- **Refactor when overcomplicated**: If a solution exceeds 200 lines when 50 lines would suffice, pause and simplify.

### 3. Surgical Changes & Clean-up
- **Touch only what is necessary**: Modify only the code directly related to the user request. Do not "improve" adjacent formatting or refactor unbroken code.
- **Clean up your own mess**: Remove any unused imports, variables, or functions created by your changes. Leave pre-existing dead code untouched unless asked.

### 4. Goal-Driven Execution & Verification
- **Define success criteria**: Break tasks into clear steps with explicit verification goals.
- **Loop until verified**: Run linting, TypeScript type checks (`npm run check` / `tsc`), and integration tests before completing any task.

---

## Service Architecture & SOLID Principles

Every service, controller, and helper built or modified MUST adhere strictly to SOLID design principles:

1. **Single Responsibility Principle (SRP)**:
   - Separate concerns cleanly: Strapi Controllers handle HTTP request/response parsing, Services execute business logic, and Connectors handle external API (or mock) communication.
   - Auto-generation of SKU logic belongs in a dedicated service or lifecycle hook, not mixed into raw HTTP handlers.

2. **Open / Closed Principle (OCP)**:
   - The `DiscogsConnector` must be designed with an interface (`IDiscogsConnector`) that allows swapping between `MockDiscogsConnector` and `RealDiscogsConnector` without changing business controllers.

3. **Liskov Substitution Principle (LSP)**:
   - Mock connectors must return structurally identical response shapes to real API responses.

4. **Interface Segregation Principle (ISP)**:
   - Define small, focused TypeScript interfaces for service DTOs (e.g. `PublishListingParams`, `SearchReleaseQuery`). Do not pass raw unchecked request objects deep into domain logic.

5. **Dependency Inversion Principle (DIP)**:
   - Depend on abstractions/services rather than hardcoded global states or direct external network calls scattered inside controllers.

---

## Multi-Tenancy & Data Scoping Rules

1. **Mandatory Tenant Scoping**: Every database query, lookup, update, or custom endpoint MUST filter by `tenantId`.
2. **No Data Leakage**: Never query or return `Product`, `SellableUnit`, or `ChannelListing` records across tenants without explicit tenant verification.

---

## Discogs Connector & Workflow Requirements

The Discogs service layer MUST implement the following interface:

- `searchReleases(query: string, tenantId: string)`: Searches releases (returns plausible mock data by default like Daft Punk - *Discovery*).
- `getRelease(releaseId: string)`: Retrieves release metadata.
- `validateListingPayload(unitId: string)`: Verifies all mandatory fields are present before publication.
- `publishListing(unitId: string)`: Creates or updates a listing (returns mock `externalListingId` like `discogs-listing-0001` and `externalUrl`).
- `markLocalSoldOrOutOfStock(unitId: string)`: Updates unit status to `sold` or `out_of_stock` and updates listing status.

### Custom Workflow Endpoints To Expose

- `GET  /api/discogs/search?tenantId=...&q=...`
- `POST /api/products/:id/attach-discogs-release`
- `POST /api/sellable-units/:id/check-discogs-completeness`
- `POST /api/sellable-units/:id/publish-discogs`
- `POST /api/sellable-units/:id/simulate-discogs-sale`

---

## Security & Secrets Guardrails

1. **No Hardcoded Secrets**: API tokens, database credentials, and session keys MUST be loaded from environment variables via `.env`.
2. **Documented Config**: Provide updated `.env.example` with clear comments for all required variables (`DISCOGS_API_TOKEN`, `DATABASE_URL`, etc.).

---

## TypeScript & Code Quality Rules

1. **Strict Types**: No `any` types. Define explicit interfaces for all payloads, DTOs, parameters, and Strapi content types.
2. **Auto SKU Generation**: SKUs MUST be generated automatically on backend creation (e.g. `VIN-000001`) via lifecycle hooks or service wrappers. Never trust manually input SKUs from HTTP clients.
3. **Error Handling & Audit Logging**: Any failure during completeness validation, publication, or sale simulation MUST produce a structured log entry in `MarketplaceSyncEvent`.

---

## Feature Implementation Workflow

When asked to implement or update a feature:

1. Read this `AGENTS.md` file first.
2. Inspect existing schema files and service logic.
3. Keep changes incremental, modular, and focused.
4. Guarantee strict multi-tenant scoping on all database calls.
5. Ensure Discogs mock fallback is active by default.
6. Verify all workflow steps produce proper `MarketplaceSyncEvent` entries.
7. Run build, type check, and tests before declaring completion.

---

## Linting & Validation

Run:

```bash
npm run check
# or
npx tsc --noEmit
npm run lint
```

Fix all build, type, and linting errors before completing tasks.
