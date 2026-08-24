# T-03 · Content Type — Product

## Description

Créer le content type Product (collection) avec relation `manyToOne` vers Tenant.

## Fichiers

- [NEW] `backend/src/api/product/content-types/product/schema.json`
- [NEW] `backend/src/api/product/controllers/product.ts`
- [NEW] `backend/src/api/product/services/product.ts`
- [NEW] `backend/src/api/product/routes/product.ts`

## Champs schema.json

| Champ              | Type                          | Requis | Default |
| ------------------ | ----------------------------- | ------ | ------- |
| `tenant`           | relation `manyToOne` → Tenant | ✅     |         |
| `productType`      | enumeration `['vinyl']`       | ✅     | `vinyl` |
| `title`            | string                        | ✅     |         |
| `artist`           | string                        | ✅     |         |
| `description`      | text                          |        |         |
| `label`            | string                        | ✅     |         |
| `year`             | integer                       | ✅     |         |
| `country`          | string                        | ✅     |         |
| `format`           | string                        | ✅     |         |
| `barcode`          | string                        |        |         |
| `discogsReleaseId` | string                        |        |         |
| `discogsMasterId`  | string                        |        |         |

## Critères d'acceptation

- [ ] Strapi démarre sans erreur
- [ ] Product visible dans l'admin avec la relation Tenant
- [ ] Création d'un Product avec `tenant` assigné fonctionne
- [ ] `productType` est toujours `vinyl`

## Dépendances

T-02

## Temps estimé

20 min
