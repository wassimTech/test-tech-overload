# T-06 · Content Type — MarketplaceSyncEvent

## Description

Créer le content type MarketplaceSyncEvent (collection) pour les logs d'audit.

## Fichiers

- [NEW] `backend/src/api/marketplace-sync-event/content-types/marketplace-sync-event/schema.json`
- [NEW] `backend/src/api/marketplace-sync-event/controllers/marketplace-sync-event.ts`
- [NEW] `backend/src/api/marketplace-sync-event/services/marketplace-sync-event.ts`
- [NEW] `backend/src/api/marketplace-sync-event/routes/marketplace-sync-event.ts`

## Champs schema.json

| Champ            | Type                                  | Requis |
| ---------------- | ------------------------------------- | ------ |
| `tenant`         | relation `manyToOne` → Tenant         | ✅     |
| `channel`        | enumeration `['discogs']`             | ✅     |
| `action`         | enumeration (4 valeurs)               | ✅     |
| `status`         | enumeration (3 valeurs)               | ✅     |
| `product`        | relation `manyToOne` → Product        |        |
| `sellableUnit`   | relation `manyToOne` → SellableUnit   |        |
| `channelListing` | relation `manyToOne` → ChannelListing |        |
| `message`        | string                                | ✅     |
| `payload`        | json                                  |        |
| `timestamp`      | datetime                              | ✅     |

### Valeurs enum action

`search_release`, `check_completeness`, `publish_listing`, `mark_out_of_stock`

### Valeurs enum status

`success`, `failed`, `pending`

## Critères d'acceptation

- [x] Strapi démarre sans erreur
- [x] MarketplaceSyncEvent visible avec ses 3 relations optionnelles
- [x] Actions enum : `search_release`, `check_completeness`, `publish_listing`, `mark_out_of_stock`

## Dépendances

T-02, T-03, T-04, T-05

## Temps estimé

20 min
