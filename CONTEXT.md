# Vinyl Backoffice

A multi-tenant backoffice for managing vinyl record inventory and synchronizing listings with the Discogs marketplace.

## Language

### Catalog & Inventory

**Tenant**:
An isolated business entity that owns all domain objects. Every query is scoped to exactly one tenant.
_Avoid_: Organization, account, workspace

**Product**:
A catalog entry describing a vinyl record (artist, title, label, year). A Product is not sellable on its own — it is a reference card.
_Avoid_: Item, article, listing, record (ambiguous with database record)

**SellableUnit**:
A specific physical copy of a Product that can be priced and sold. Carries its own condition grading, price, and SKU.
_Avoid_: Variant, stock item, inventory item, offer

**SKU**:
An auto-generated, sequential, unique identifier for a SellableUnit. Format: `VIN-000001`. Never manually input.
_Avoid_: Reference, code, barcode

**Disc Condition**:
The physical grading of the vinyl disc itself (Mint, Near Mint, Very Good Plus, etc.).
_Avoid_: Media grading, disc state

**Sleeve Condition**:
The physical grading of the vinyl sleeve/cover.
_Avoid_: Cover condition, jacket grading

### Marketplace Integration

**ChannelListing**:
The representation of a SellableUnit on an external marketplace (Discogs). Created only when a unit is published. Holds the external listing ID and sync status.
_Avoid_: Publication, marketplace entry, offer

**DiscogsConnector**:
A service abstraction (behind `IDiscogsConnector`) that handles communication with the Discogs API. Swappable between mock and real implementations via a factory function.
_Avoid_: Discogs client, Discogs API, adapter

**MarketplaceSyncEvent**:
A persistent log entry recording every action performed against a marketplace channel (search, validate, publish, mark sold). Used for audit and debugging.
_Avoid_: Sync log, event log, activity log
