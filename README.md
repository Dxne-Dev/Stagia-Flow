# StagiaFlow

SaaS de gestion de stages : l'entreprise colle son site → l'IA pré-remplit le profil → sessions & stagiaires → génération de projets réalistes → espace stagiaire.

## Statut

Mise en place de l'**agence de delivery IA** (profils + protocole Plan → Validation → AUTO) avant le build MVP 48h.

## Lancer l'équipe

Lis et suis :

- [Agence StagiaFlow](.cursor/agence-stagiaflow/README.md) — composition, skills, prompt de lancement
- [Protocole](.cursor/agence-stagiaflow/PROTOCOLE.md) — gate de validation Client
- [Feuille de route 48h](.cursor/agence-stagiaflow/FEUILLE-DE-ROUTE-48H.md)
- [Blueprint technique](docs/stagiaflow-blueprint-technique.md)
- [AGENTS.md](AGENTS.md)

### Prompt court

```text
Lancer l'agence StagiaFlow. Suis AGENTS.md et .cursor/agence-stagiaflow/README.md.
Phase PLAN uniquement — attends mon VALIDÉ avant tout code produit.
```

## Stack cible (MVP)

Next.js (App Router) · Prisma · PostgreSQL · NextAuth · OpenAI/Claude · Vercel + Supabase
