# Feuille de route 48h — StagiaFlow MVP

Objectif : SaaS **fonctionnel, pro, scalable, sécurisé** — parcours prototype validé + vrai LLM + auth + PostgreSQL.

Source produit : `docs/stagiaflow-blueprint-technique.md`

## Stack verrouillée (MVP)

| Couche | Choix |
|---|---|
| Frontend | Next.js 14+ App Router, TypeScript, Tailwind |
| Backend | Next.js Route Handlers |
| BDD | PostgreSQL + Prisma |
| Auth | NextAuth.js (credentials + magic link si temps) |
| IA | OpenAI GPT-4o-mini (ou Claude Haiku) + extraction URL (Jina/Firecrawl) |
| Jobs | Queue légère (in-process + retry) puis Bull si temps |
| Host | Vercel + Supabase (Postgres/Storage) |
| Qualité | ESLint, Vitest/Playwright smoke, Sentry si clé dispo |

## Waves (séquençage)

### Wave A — Fondations (bloquant)

| ID | Mission | Owner | Support |
|---|---|---|---|
| A1 | Scaffold Next.js + tooling + structure monorepo-like `apps/web` ou racine propre | ARCH | BACK, FRONT |
| A2 | Schéma Prisma (companies, sessions, interns, projects, users/roles) + migrations | ARCH | BACK, SEC |
| A3 | Auth réelle (roles: `company_admin`, `intern`) + middleware protection | BACK | SEC |
| A4 | Design tokens + layout shell + direction visuelle (anti-slop) | FRONT | — |

### Wave B — Parcours entreprise

| ID | Mission | Owner | Support |
|---|---|---|---|
| B1 | Onboarding entreprise : URL → crawl/extract → LLM → profil structuré JSON | IA | BACK, FRONT |
| B2 | CRUD Sessions par niveau (Licence/Master/Doctorat/Autre) | BACK | FRONT |
| B3 | CRUD Stagiaires (création entreprise + auto-inscription) | BACK | FRONT, SEC |
| B4 | Génération IA projets (session ≥ 1 stagiaire) + édition entreprise | IA | BACK, FRONT |
| B5 | UI parcours entreprise bout-en-bout (onboarding → sessions → stagiaires → projets) | FRONT | BACK, IA |

### Wave C — Parcours stagiaire + durcissement

| ID | Mission | Owner | Support |
|---|---|---|---|
| C1 | Espace stagiaire : login, projets assignés, objectifs, livrables, échéances | FRONT | BACK |
| C2 | Revue sécurité (AuthZ, IDOR, rate-limit IA, secrets) + correctifs | SEC | BACK |
| C3 | Tests smoke critiques + checklist release + README runbook | QA | tous |
| C4 | Déploiement preview + variables d'env documentées | QA | ARCH |

## Definition of Done MVP

- [ ] Entreprise peut coller une URL et obtenir un profil pré-rempli (vrai LLM)
- [ ] CRUD sessions + stagiaires opérationnel
- [ ] Génération de 2–3 projets IA uniquement si session a ≥ 1 stagiaire
- [ ] Entreprise peut éditer / valider / archiver un projet
- [ ] Stagiaire se connecte et voit ses projets
- [ ] Auth réelle + données en PostgreSQL (plus de localStorage comme source de vérité)
- [ ] Aucun secret commité ; AuthZ vérifiée sur routes sensibles
- [ ] UI cohérente, mobile OK, pas d'AI-slop
- [ ] README : setup local, env, déploiement

## Hors-scope 48h (explicitement)

- Matching CV ↔ projet, suivi IA des livrables, dashboard école
- Multi-langue complète, billing Stripe, drag & drop avancé
- Notifications email (sauf stub si trivial)
- App mobile native

## Matrice de responsabilités (RACI simplifié)

| Domaine | R | A | C | I |
|---|---|---|---|---|
| Orchestration & reporting | CHEF | CLIENT | — | équipe |
| Architecture / schéma | ARCH | CHEF | BACK, SEC | FRONT, IA |
| UI / UX craft | FRONT | CHEF | ARCH | QA |
| API / Auth / Prisma | BACK | CHEF | ARCH, SEC | FRONT, IA |
| Pipeline LLM | IA | CHEF | BACK, SEC | FRONT |
| Sécurité | SEC | CHEF | BACK | QA |
| Qualité / release | QA | CHEF | tous | CLIENT |
