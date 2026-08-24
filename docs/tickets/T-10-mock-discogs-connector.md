# T-10 · Mock Discogs Connector

## Description

Implémenter `MockDiscogsConnector` qui satisfait `IDiscogsConnector` avec des données plausibles.

## Fichiers

- [NEW] `backend/src/api/discogs/services/mock-discogs-connector.ts`

## Données mock

- `searchReleases("Daft Punk")` → retourne 1 résultat : Discovery, 2001, France, 2xLP, Virgin, releaseId `123456`
- `getRelease("123456")` → retourne le détail complet
- `publishListing(...)` → retourne `{ externalListingId: "discogs-listing-0001", externalUrl: "https://www.discogs.com/sell/item/discogs-listing-0001" }`

## Critères d'acceptation

- [ ] Implémente `IDiscogsConnector` (vérifiable par TypeScript)
- [ ] Retourne des données structurellement identiques au format Discogs réel (LSP)
- [ ] Pas d'appel réseau
- [ ] `tsc --noEmit` passe

## Dépendances

T-09

## Temps estimé

25 min
