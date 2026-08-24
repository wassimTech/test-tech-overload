# T-08 · SKU Generator + Lifecycle Hook

## Description

Créer le service de génération SKU et le lifecycle hook `beforeCreate` sur SellableUnit.

## Fichiers

- [NEW] `backend/src/api/sellable-unit/services/sku-generator.ts`
- [NEW] `backend/src/api/sellable-unit/content-types/sellable-unit/lifecycles.ts`

## Logique generateSku()

```
1. SELECT nextval('sku_seq') → ex: 1
2. Formatter : "VIN-" + padStart(6, '0') → "VIN-000001"
3. Retourner le SKU
```

## Logique lifecycle beforeCreate

```
1. Appeler generateSku()
2. Assigner data.sku = SKU généré
3. Ignorer tout SKU passé dans la requête (sécurité)
```

## Critères d'acceptation

- [x] Créer une SellableUnit via l'admin → SKU auto-généré `VIN-000001`
- [x] Créer une deuxième → `VIN-000002`
- [x] Passer un SKU manuel dans la requête → ignoré, SKU auto-généré
- [x] `tsc --noEmit` passe

## Dépendances

T-04, T-07

## Temps estimé

30 min
