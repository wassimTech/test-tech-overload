# T-15 · README + .env.example

## Description

Documenter le parcours de test complet avec commandes curl reproductibles.

## Fichiers

- [MODIFY] `README.md` (racine du projet)
- [MODIFY] `backend/.env.example` — ajouter `DISCOGS_API_TOKEN`

## Contenu README — Section parcours de test

```
## Parcours de test complet

1. Démarrer Docker + Strapi
2. Vérifier le tenant auto-créé
3. Créer un Product (curl)
4. Rechercher une release Discogs (curl)
5. Associer la release au Product (curl)
6. Créer une SellableUnit (curl)
7. Vérifier la complétude Discogs (curl)
8. Publier sur Discogs (curl)
9. Vérifier le ChannelListing créé (curl)
10. Simuler une vente (curl)
11. Vérifier les statuts finaux (curl)
12. Consulter les logs MarketplaceSyncEvent (curl)
```

Chaque étape avec la commande curl exacte et la réponse attendue.

## Critères d'acceptation

- [ ] Un développeur qui suit le README de A à Z peut reproduire tout le parcours
- [ ] Chaque commande curl est copiable-collable
- [ ] `.env.example` contient `DISCOGS_API_TOKEN` commenté avec explication

## Dépendances

T-13

## Temps estimé

30 min
