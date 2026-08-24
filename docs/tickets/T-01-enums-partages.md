# T-01 · Enums partagés TypeScript

## Description

Créer le fichier d'enums TypeScript miroir pour toutes les valeurs utilisées dans les `schema.json`.

## Fichiers

- [NEW] `backend/src/common/enums.ts`

## Contenu

- `ProductType` : `vinyl`
- `DiscCondition` / `SleeveCondition` : `Mint`, `Near Mint`, `Very Good Plus`, `Very Good`, `Good Plus`, `Good`, `Fair`, `Poor`
- `SellableUnitStatus` : `available`, `reserved`, `sold`, `out_of_stock`, `archived`
- `ChannelType` : `discogs`
- `ChannelListingStatus` : `not_published`, `pending`, `published`, `failed`, `removed`, `sync_error`
- `SyncAction` : `search_release`, `check_completeness`, `publish_listing`, `mark_out_of_stock`
- `SyncStatus` : `success`, `failed`, `pending`

## Critères d'acceptation

- [ ] Le fichier compile sans erreur (`tsc --noEmit`)
- [ ] Aucun `any` type
- [ ] Chaque enum correspond exactement aux valeurs qui seront dans les `schema.json`

## Dépendances

Aucune

## Temps estimé

15 min
