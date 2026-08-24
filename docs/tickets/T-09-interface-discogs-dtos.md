# T-09 · Interface Discogs + DTOs

## Description

Définir l'interface `IDiscogsConnector` et tous les DTOs TypeScript.

## Fichiers

- [NEW] `backend/src/api/discogs/types.ts`

## Interfaces à définir

### IDiscogsConnector

```typescript
interface IDiscogsConnector {
  searchReleases(query: string): Promise<DiscogsSearchResult[]>;
  getRelease(releaseId: string): Promise<DiscogsRelease>;
  publishListing(params: PublishListingParams): Promise<PublishListingResult>;
}
```

### DTOs

- `DiscogsSearchResult` : `id`, `title`, `artist`, `year`, `country`, `format`, `label`, `masterId`
- `DiscogsRelease` : détail complet d'une release
- `PublishListingParams` : `releaseId`, `condition`, `sleeveCondition`, `price`, `status`
- `PublishListingResult` : `externalListingId`, `externalUrl`
- `ValidationResult` : `complete: boolean`, `missingFields: string[]`

## Critères d'acceptation

- [ ] Aucun `any` type
- [ ] `tsc --noEmit` passe
- [ ] Chaque DTO a des types stricts

## Dépendances

T-01

## Temps estimé

20 min
