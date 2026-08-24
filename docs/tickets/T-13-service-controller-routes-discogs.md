# T-13 · Service + Controller + Routes Discogs

## Description

Le ticket principal — créer le service d'orchestration Discogs, le controller HTTP, et les 5 routes custom.

## Fichiers

- [NEW] `backend/src/api/discogs/services/discogs.ts` — service d'orchestration
- [NEW] `backend/src/api/discogs/controllers/discogs.ts` — controller HTTP (thin)
- [NEW] `backend/src/api/discogs/routes/discogs.ts` — 5 routes publiques

## 5 endpoints

| Méthode | URL                                                  | Action                                      |
| ------- | ---------------------------------------------------- | ------------------------------------------- |
| `GET`   | `/api/discogs/search`                                | Rechercher releases (`?tenantId=...&q=...`) |
| `POST`  | `/api/products/:id/attach-discogs-release`           | Associer une release à un Product           |
| `POST`  | `/api/sellable-units/:id/check-discogs-completeness` | Vérifier la complétude                      |
| `POST`  | `/api/sellable-units/:id/publish-discogs`            | Publier sur Discogs (mock)                  |
| `POST`  | `/api/sellable-units/:id/simulate-discogs-sale`      | Simuler une vente                           |

## Logique par endpoint

### 1. search

- Valider `tenantId` et `q` présents
- Appeler `connector.searchReleases(q)`
- Log `MarketplaceSyncEvent` (action: `search_release`)
- Retourner les résultats

### 2. attach-discogs-release

- Valider tenant scope sur le Product (le product appartient au tenant)
- Appeler `connector.getRelease(releaseId)`
- Mettre à jour le Product : `discogsReleaseId`, `discogsMasterId`, `artist`, `title`, `label`, `year`, `country`, `format`
- Log `MarketplaceSyncEvent` (action: `search_release`)

### 3. check-discogs-completeness

- Charger SellableUnit avec populate Product
- Vérifier : price > 0, discCondition, sleeveCondition, product.discogsReleaseId, status === 'available'
- Retourner `{ complete: boolean, missingFields: string[] }`
- Log `MarketplaceSyncEvent` (action: `check_completeness`)

### 4. publish-discogs

- Vérifier complétude (réutiliser la logique de check)
- Appeler `connector.publishListing(...)`
- Créer `ChannelListing` avec `status: 'published'`, `externalListingId`, `externalUrl`
- Log `MarketplaceSyncEvent` (action: `publish_listing`)

### 5. simulate-discogs-sale

- Vérifier qu'un ChannelListing `published` existe
- Mettre à jour SellableUnit : `status: 'sold'`, `quantity: 0`
- Mettre à jour ChannelListing : `status: 'removed'`
- Log `MarketplaceSyncEvent` (action: `mark_out_of_stock`)

## Critères d'acceptation

- [x] Chaque endpoint filtre par `tenantId` (multi-tenant scoping)
- [x] Chaque endpoint produit un `MarketplaceSyncEvent` (succès ou échec)
- [x] Erreurs standard : format Strapi (`ctx.throw`)
- [x] Réponses métier : JSON structuré
- [x] Le workflow complet search → attach → check → publish → sell fonctionne avec curl
- [x] `tsc --noEmit` passe
- [x] Controller ne contient aucune logique métier (SRP)

## Dépendances

T-01 à T-12 (tous les tickets précédents)

## Temps estimé

1h30
