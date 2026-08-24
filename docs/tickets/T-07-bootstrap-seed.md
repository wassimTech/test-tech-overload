# T-07 · Bootstrap — Séquence PG + Seed Tenant

## Description

Modifier `src/index.ts` pour créer idempotentement la séquence PostgreSQL `sku_seq` et le tenant de test "Vinyl Store".

## Fichiers

- [MODIFY] `backend/src/index.ts`

## Logique bootstrap

```
1. CREATE SEQUENCE IF NOT EXISTS sku_seq START 1
2. Chercher tenant avec slug 'vinyl-store'
3. S'il n'existe pas → créer { name: "Vinyl Store", slug: "vinyl-store", isActive: true }
```

## Critères d'acceptation

- [x] Au premier démarrage : séquence créée, tenant "Vinyl Store" créé
- [x] Au deuxième démarrage : aucune erreur, aucun doublon
- [x] `SELECT nextval('sku_seq')` fonctionne dans pgAdmin/psql
- [x] Le tenant est consultable via `GET /api/tenants`

## Dépendances

T-02

## Temps estimé

30 min
