# T-14 · Jest + Tests unitaires

## Description

Configurer Jest et écrire les tests unitaires critiques.

## Fichiers

- [NEW] `backend/jest.config.ts`
- [NEW] `backend/__tests__/sku-generator.test.ts`
- [NEW] `backend/__tests__/check-completeness.test.ts`
- [NEW] `backend/__tests__/mock-discogs-connector.test.ts`
- [MODIFY] `backend/package.json` — ajouter `jest`, `ts-jest`, `@types/jest` + script `test`

## Tests à écrire

### sku-generator.test.ts

- [ ] Formate `1` → `VIN-000001`
- [ ] Formate `999999` → `VIN-999999`
- [ ] Padding correct sur différentes valeurs

### check-completeness.test.ts

- [ ] Unit complète → `{ complete: true, missingFields: [] }`
- [ ] Prix manquant → `{ complete: false, missingFields: ['price'] }`
- [ ] `discogsReleaseId` manquant sur Product → incomplet
- [ ] Plusieurs champs manquants → tous listés

### mock-discogs-connector.test.ts

- [ ] `searchReleases` retourne un tableau non vide
- [ ] `getRelease` retourne un objet avec les champs attendus
- [ ] `publishListing` retourne `externalListingId` + `externalUrl`
- [ ] Implémente `IDiscogsConnector` (type check)

## Critères d'acceptation

- [ ] `npm test` passe (exit 0)
- [ ] Aucun test skipped
- [ ] Couverture des 3 services critiques

## Dépendances

T-08, T-10, T-13

## Temps estimé

45 min
