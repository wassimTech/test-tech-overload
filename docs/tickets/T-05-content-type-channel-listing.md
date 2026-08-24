# T-05 · Content Type — ChannelListing

## Description

Créer le content type ChannelListing (collection).

## Fichiers

- [NEW] `backend/src/api/channel-listing/content-types/channel-listing/schema.json`
- [NEW] `backend/src/api/channel-listing/controllers/channel-listing.ts`
- [NEW] `backend/src/api/channel-listing/services/channel-listing.ts`
- [NEW] `backend/src/api/channel-listing/routes/channel-listing.ts`

## Champs schema.json

| Champ               | Type                                | Requis | Default         |
| ------------------- | ----------------------------------- | ------ | --------------- |
| `tenant`            | relation `manyToOne` → Tenant       | ✅     |                 |
| `sellableUnit`      | relation `manyToOne` → SellableUnit | ✅     |                 |
| `channel`           | enumeration `['discogs']`           | ✅     | `discogs`       |
| `externalListingId` | string                              |        |                 |
| `externalUrl`       | string                              |        |                 |
| `status`            | enumeration                         | ✅     | `not_published` |
| `publishedPrice`    | decimal                             |        |                 |
| `lastSyncedAt`      | datetime                            |        |                 |
| `lastErrorMessage`  | text                                |        |                 |

### Valeurs enum status

`not_published`, `pending`, `published`, `failed`, `removed`, `sync_error`

## Critères d'acceptation

- [ ] Strapi démarre sans erreur
- [ ] ChannelListing visible avec relation SellableUnit + Tenant
- [ ] Status enum contient les 6 valeurs attendues

## Dépendances

T-02, T-04

## Temps estimé

20 min
