# T-04 · Content Type — SellableUnit (schema uniquement)

## Description

Créer le content type SellableUnit (collection). **Sans lifecycle hook** — le SKU sera ajouté dans T-08.

## Fichiers

- [NEW] `backend/src/api/sellable-unit/content-types/sellable-unit/schema.json`
- [NEW] `backend/src/api/sellable-unit/controllers/sellable-unit.ts`
- [NEW] `backend/src/api/sellable-unit/services/sellable-unit.ts`
- [NEW] `backend/src/api/sellable-unit/routes/sellable-unit.ts`

## Champs schema.json

| Champ             | Type                           | Requis | Unique | Default     |
| ----------------- | ------------------------------ | ------ | ------ | ----------- |
| `tenant`          | relation `manyToOne` → Tenant  | ✅     |        |             |
| `product`         | relation `manyToOne` → Product | ✅     |        |             |
| `sku`             | string                         | ✅     | ✅     |             |
| `price`           | decimal                        | ✅     |        |             |
| `currency`        | string                         | ✅     |        | `EUR`       |
| `discCondition`   | enumeration                    | ✅     |        |             |
| `sleeveCondition` | enumeration                    | ✅     |        |             |
| `sellerNotes`     | text                           |        |        |             |
| `status`          | enumeration                    | ✅     |        | `available` |
| `quantity`        | integer                        | ✅     |        | `1`         |
| `location`        | string                         |        |        |             |

### Valeurs enum discCondition / sleeveCondition

`Mint`, `Near Mint`, `Very Good Plus`, `Very Good`, `Good Plus`, `Good`, `Fair`, `Poor`

### Valeurs enum status

`available`, `reserved`, `sold`, `out_of_stock`, `archived`

## Critères d'acceptation

- [ ] Strapi démarre sans erreur
- [ ] SellableUnit visible dans l'admin avec relations Tenant + Product
- [ ] Enums disc/sleeve condition contiennent les bonnes valeurs
- [ ] `sku` a une contrainte d'unicité

## Dépendances

T-02, T-03

## Temps estimé

25 min
