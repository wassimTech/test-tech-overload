# T-02 · Content Type — Tenant

## Description

Créer le content type Tenant (collection) avec les fichiers Strapi 5 standard.

## Fichiers

- [NEW] `backend/src/api/tenant/content-types/tenant/schema.json`
- [NEW] `backend/src/api/tenant/controllers/tenant.ts`
- [NEW] `backend/src/api/tenant/services/tenant.ts`
- [NEW] `backend/src/api/tenant/routes/tenant.ts`

## Champs schema.json

| Champ      | Type    | Requis | Unique | Default |
| ---------- | ------- | ------ | ------ | ------- |
| `name`     | string  | ✅     |        |         |
| `slug`     | string  | ✅     | ✅     |         |
| `isActive` | boolean |        |        | `true`  |

## Critères d'acceptation

- [ ] Strapi démarre sans erreur
- [ ] Tenant visible dans l'admin Strapi
- [ ] CRUD fonctionne via `GET/POST /api/tenants`
- [ ] `slug` a une contrainte d'unicité

## Dépendances

Aucune

## Temps estimé

20 min
