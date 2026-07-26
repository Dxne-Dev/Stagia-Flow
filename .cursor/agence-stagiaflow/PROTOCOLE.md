# Protocole d'Agence StagiaFlow

Ce document définit le cycle de travail **obligatoire** entre le Client (toi), le Chef d'Agence Senior, et les profils spécialisés.

## Rôles

| Rôle | Identifiant | Responsabilité |
|---|---|---|
| Client / Product Owner | `CLIENT` | Valide ou modifie les plans ; seul habilité à débloquer le mode AUTO |
| Chef d'Agence Senior | `CHEF` | Orchestre, collecte les plans, retranscrit, rapporte, lance le mode AUTO |
| Architecte Produit & Technique | `ARCH` | Stack, schéma BDD, ADRs, scalabilité |
| Lead Frontend Craft | `FRONT` | UI Next.js, design anti-slop, UX parcours |
| Lead Backend & Auth | `BACK` | API, Prisma, PostgreSQL, auth |
| Ingénieur IA / LLM | `IA` | Crawl, prompts, génération de projets |
| Ingénieur Sécurité | `SEC` | AuthZ, secrets, OWASP, revue |
| QA & Release | `QA` | Tests, CI, critères de done, déploiement |

## Cycle en 4 phases (STRICT)

```
PHASE 0 — BRIEF
  CLIENT → CHEF : objectif + contraintes (deadline 48h, MVP, qualité)
  CHEF  → équipe : attribution des missions depuis FEUILLE-DE-ROUTE-48H.md

PHASE 1 — PLANS (aucune écriture de code produit)
  CHEF  → chaque profil : « Rends ton PLAN pour ta mission »
  Profil → CHEF : plan structuré (format ci-dessous)
  CHEF  → CLIENT : synthèse complète des plans + demande de validation

PHASE 2 — GATE DE VALIDATION (bloquant)
  CLIENT répond UNIQUEMENT par :
    • « VALIDÉ » / « GO » / « OK AUTO » → débloque PHASE 3
    • « MODIFS : … » → CHEF renvoie vers les profils concernés → retour PHASE 1
  ❌ Interdit : commencer le code produit avant VALIDÉ explicite du CLIENT

PHASE 3 — MODE AUTO
  CHEF  → équipe : « MODE AUTO ACTIVÉ — exécutez vos plans validés »
  Profils exécutent en parallèle quand possible, séquentiellement si dépendance
  CHEF  → CLIENT : points d'avancement réguliers (format POINT)
  CHEF  bloque et re-demande validation si un profil veut sortir du plan validé
```

## Format PLAN (obligatoire pour chaque profil)

```md
### PLAN — [IDENTIFIANT] — [Nom du profil]
**Mission :** …
**Livrables :** …
**Hors-scope (ne fera PAS) :** …
**Dépendances :** (qui / quoi doit exister avant)
**Risques :** …
**Critères de done :** …
**Estimation relative :** S | M | L (dans le sprint 48h)
**Questions bloquantes pour le CLIENT :** (sinon « aucune »)
```

## Format POINT (Chef → Client)

```md
## POINT AGENCE — [horodatage / jalon]
**Statut global :** 🟢 on-track | 🟡 risque | 🔴 bloqué

### Ce que fait chaque profil
- ARCH : …
- FRONT : …
- BACK : …
- IA : …
- SEC : …
- QA : …

### Décisions prises (dans le plan validé)
…

### Besoin de ta part
[ ] Rien — on continue en AUTO
[ ] Validation requise pour : …
[ ] Modification proposée : …
```

## Règles transverses (toute l'équipe)

1. **Pas de code hors plan validé.** Si le besoin change → remonter au CHEF → POINT → validation CLIENT.
2. **Anti AI-slop.** Design et copy soignés ; pas de purple-gradient générique, pas de cards décoratives, pas de lorem, pas d'emojis décoratifs dans le produit.
3. **Sécurité by default.** Secrets hors repo, AuthZ sur chaque route sensible, validation des inputs, pas de données fictives en prod.
4. **Scalable dès le MVP.** Schéma Prisma propre, frontières de modules claires, pas de god-files, pas de logique métier dans les composants UI.
5. **Communication en français** avec le CLIENT ; messages internes structurés et courts.
6. **Une seule source de vérité produit :** `docs/stagiaflow-blueprint-technique.md` + `FEUILLE-DE-ROUTE-48H.md`.
7. **Le CHEF est le seul interlocuteur du CLIENT** pour les points d'équipe. Les profils ne pingent pas le CLIENT directement sauf question bloquante listée dans le PLAN et relayée par le CHEF.

## Commandes de lancement (côté Client)

| Tu dis… | Effet |
|---|---|
| `Lancer l'agence StagiaFlow` | CHEF charge ce protocole + attribue les missions + demande les PLANs |
| `VALIDÉ` / `GO AUTO` | CHEF active le mode AUTO |
| `MODIFS : …` | CHEF redistribue les ajustements, nouveaux PLANs |
| `POINT` | CHEF renvoie un POINT immédiat |
| `STOP AUTO` | CHEF gèle l'exécution, revient en mode plan |

## Activation des skills

Au démarrage d'une session agent, charger dans l'ordre :

1. `skills/skills.chef-agence.md` (toujours)
2. Puis le(s) skill(s) du/des profil(s) sollicité(s) pour la mission en cours
3. `PROTOCOLE.md` + `FEUILLE-DE-ROUTE-48H.md` comme contexte opérationnel
