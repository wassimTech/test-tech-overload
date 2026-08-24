# T-11 · Connector Factory

## Description

Créer la factory function `getConnector()` qui retourne Mock ou Real selon l'environnement.

## Fichiers

- [NEW] `backend/src/api/discogs/services/connector-factory.ts`

## Logique

```
getConnector():
  si env('DISCOGS_API_TOKEN') est défini et non vide → RealDiscogsConnector (stub: throw 'Not implemented')
  sinon → MockDiscogsConnector
```

## Critères d'acceptation

- [x] Sans `DISCOGS_API_TOKEN` → retourne `MockDiscogsConnector`
- [x] Avec `DISCOGS_API_TOKEN` → retourne une instance qui throw (placeholder)
- [x] Retourne un objet conforme à `IDiscogsConnector`

## Dépendances

T-10

## Temps estimé

10 min
