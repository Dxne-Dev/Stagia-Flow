# StagiaFlow — Feuille de route technique & produit

*Document destiné à passer du prototype interactif au vrai SaaS.*

## 1. Parcours utilisateur (résumé du prototype validé)

1. **Entreprise** → colle son site / LinkedIn → l'IA analyse et pré-remplit le profil (secteur, activités, projets passés, vision).
2. **Sessions** → création par niveau (Licence, Master, Doctorat, autres).
3. **Stagiaires** → soit créés par l'entreprise (identifiants), soit auto-inscription.
4. **Projets** → l'IA génère des projets (brief, livrables, deadline) **uniquement pour les sessions qui ont ≥ 1 stagiaire présent**. L'entreprise modifie tout à sa guise.
5. **Stagiaire** → se connecte, voit son/ses projet(s), les objectifs, les livrables, les échéances.

## 2. Stack technique recommandée pour le vrai SaaS

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | Next.js 14+ (React, App Router) / ou SvelteKit | SSR, SEO (pages publiques), DX, large écosystème |
| Backend / API | Next.js API routes ou FastAPI (Python) | Si l'IA est en Python, FastAPI + Celery pour la génération asynchrone |
| Base de données | PostgreSQL (supabase.com ou Render) | Relationnel fiable ; UUID, JSONB pour les projets, sessions |
| Auth | NextAuth.js / Clerk (magic links) | SSO, OAuth, passwordless |
| ORM | Prisma (si Next.js) / SQLAlchemy (si FastAPI) |
| LLM / IA générative | OpenAI GPT-4o-mini, Claude Haiku, ou Gemini Flash | 4o-mini donne un bon rapport qualité/coût pour la génération de briefs |
| Hébergement | Vercel (frontend) + Render/Railway (backend) | ou tout-en-un avec Supabase + Vercel |
| Stockage fichiers | Supabase Storage / AWS S3 | Pour les livrables, rapports, CV des stagiaires |
| File d'attente | Bull (Redis) / Celery (Redis/RabbitMQ) | Pour la génération IA sans bloquer le navigateur |
| Monitoring | Sentry + Logtail ou PostHog |
| CI/CD | GitHub Actions |

## 3. Architecture IA (flux de génération de projets)

```
URL entreprise → Crawl + extraction (Firecrawl / Jina Reader) → 
  → LLM : synthèse (secteur, activités, vision, projets passés) →
  → Profil entreprise structuré (JSON) →

Session créée + stagiaire rattaché →
  → LLM prompt avec :
      • Profil entreprise
      • Niveau de la session (Licence/Master/Doctorat)
      • Nombre de stagiaires
  → LLM génère 2-3 projets : titre, contexte, objectifs, livrables, deadline suggérée,
      compétences, critères d'évaluation
  → Entreprise modifie / valide / archive
```

### Prompt système (exemple pour une session Master en entreprise Tech)

> Tu es un chef de projet spécialisé dans la création de missions de stage. Basé sur le profil suivant de l'entreprise : [nom, secteur, description, activités, projets passés, vision] et pour un stagiaire de niveau **Master** (mission d'analyse / conception / optimisation, ~2-3 mois), génère 3 propositions de projets distinctes. Chaque projet doit inclure : un titre, un contexte de 2-3 phrases, 3-5 objectifs concrets, 3-4 livrables, les compétences mobilisées, une durée estimée en jours. Les projets doivent être réalistes, utiles à l'entreprise et formateurs pour le stagiaire.

## 4. Schéma BDD (conceptuel)

```sql
-- Entreprises
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT, website TEXT, description TEXT, vision TEXT,
  activities TEXT[], past_projects TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions / niveaux
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('Licence','Master','Doctorat','Autre')),
  title TEXT NOT NULL, description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stagiaires
CREATE TABLE interns (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  school TEXT, level TEXT,
  start_date DATE, end_date DATE,
  status TEXT DEFAULT 'actif',
  is_self_registered BOOLEAN DEFAULT false,
  password_hash TEXT, -- géré par Auth
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projets générés par l'IA
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL, context TEXT NOT NULL,
  objectives TEXT[], deliverables TEXT[], skills TEXT[],
  start_date DATE, deadline DATE, duration_days INT,
  status TEXT DEFAULT 'brouillon',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_sessions_company ON sessions(company_id);
CREATE INDEX idx_interns_session ON interns(session_id);
CREATE INDEX idx_projects_session ON projects(session_id);
```

## 5. Priorités de développement (MVP → V2)

### MVP (fonctionnel : ce que fait le prototype + vrai LLM)
- [x] Onboarding entreprise (colle un lien → profil pré-rempli) → intégrer un vrai LLM + Firecrawl
- [x] CRUD sessions par niveau
- [x] CRUD stagiaires (auto-inscription ou création entreprise)
- [x] **Génération IA de projets** → appeler API OpenAI / Claude avec prompt structuré
- [x] Édition des projets par l'entreprise
- [x] Espace stagiaire (consulter ses projets)
- [ ] Authentification réelle (NextAuth / Clerk)
- [ ] Persistance PostgreSQL

### V1 (robustesse)
- [ ] Drag & drop des stagiaires entre sessions
- [ ] Notifications par email (nouveau projet, échéance approche)
- [ ] Validation/approbation par le tuteur
- [ ] Export PDF du brief de projet
- [ ] Historique des modifications
- [ ] Multi-langue (français + anglais)

### V2 (IA avancée)
- [ ] Analyse IA du CV du stagiaire pour ajuster la difficulté
- [ ] Matching stagiaire ↔ projet par compétences
- [ ] Suivi IA de l'avancement (relecture automatique des livrables)
- [ ] Génération de fiche d'évaluation de fin de stage
- [ ] Dashboard pour l'école/université
- [ ] Modèle de tarification (Freemium : X stagiaires gratuits, au-delà abonnement)

## 6. Modèle économique (piste)

| Formule | Prix indicatif | Fonctionnalités |
|---|---|---|
| Starter | Gratuit | 1 entreprise, 1 session, 3 stagiaires, 5 projets/mois |
| Pro | 29 €/mois | Sessions illimitées, 30 stagiaires, 50 projets/mois, export PDF |
| Business | 79 €/mois | Tout illimité, IA avancée (matching CV, suivi), API, domaine personnalisé |

## 7. Prochaines actions techniques

1. **Créer un compte OpenAI / Claude API** et obtenir une clé.
2. **Configurer un projet Next.js + Prisma + PostgreSQL** (Supabase gratuit pour commencer).
3. **Intégrer l'appel LLM** pour remplacer la génération simulée par du vrai.
4. **Déployer sur Vercel** (gratuit pour un MVP).
5. **Remplacer localStorage par PostgreSQL + NextAuth pour l'authentification.**

---
*Ce blueprint est un document vivant — adaptez-le à votre marché (Bénin, Afrique de l'Ouest, puis global).*
