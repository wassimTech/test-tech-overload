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

- [x] Formate `1` → `VIN-000001`
- [x] Formate `999999` → `VIN-999999`
- [x] Padding correct sur différentes valeurs

### check-completeness.test.ts

- [x] Unit complète → `{ complete: true, missingFields: [] }`
- [x] Prix manquant → `{ complete: false, missingFields: ['price'] }`
- [x] `discogsReleaseId` manquant sur Product → incomplet
- [x] Plusieurs champs manquants → tous listés

### mock-discogs-connector.test.ts

- [x] `searchReleases` retourne un tableau non vide
- [x] `getRelease` retourne un objet avec les champs attendus
- [x] `publishListing` retourne `externalListingId` + `externalUrl`
- [x] Implémente `IDiscogsConnector` (type check)

## Critères d'acceptation

- [x] `npm test` passe (exit 0)
- [x] Aucun test skipped
- [x] Couverture des 3 services critiques

## Dépendances

T-08, T-10, T-13

## Temps estimé

45 min
