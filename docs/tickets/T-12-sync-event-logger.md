# T-12 · Sync Event Logger

## Description

Créer le service `syncEventLogger` qui centralise la création des `MarketplaceSyncEvent`.

## Fichiers

- [NEW] `backend/src/api/discogs/services/sync-event-logger.ts`

## Interface

```typescript
log(params: {
  strapi: Core.Strapi;
  tenantId: string;
  channel: ChannelType;
  action: SyncAction;
  status: SyncStatus;
  message: string;
  productId?: string;
  sellableUnitId?: string;
  channelListingId?: string;
  payload?: Record<string, unknown>;
}): Promise<void>
```

## Logique

Crée un `MarketplaceSyncEvent` via `strapi.documents('api::marketplace-sync-event.marketplace-sync-event').create(...)` avec `timestamp: new Date()`.

## Critères d'acceptation

- [ ] Appeler `syncEventLogger.log(...)` crée un enregistrement en base
- [ ] Le timestamp est automatique
- [ ] Les relations optionnelles (product, sellableUnit, channelListing) fonctionnent
- [ ] `tsc --noEmit` passe

## Dépendances

T-06

## Temps estimé

20 min
