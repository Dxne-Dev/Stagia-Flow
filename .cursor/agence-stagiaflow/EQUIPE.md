# Organigramme — Agence StagiaFlow

```text
                    ┌──────────────┐
                    │   CLIENT     │
                    │ (validation) │
                    └──────┬───────┘
                           │ points + GO / MODIFS
                    ┌──────▼───────┐
                    │    CHEF      │
                    │ Agence Sr    │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │    ARCH     │ │    FRONT    │ │    BACK     │
    │ Produit/Tech│ │ Craft UI    │ │ API + Auth  │
    └─────────────┘ └─────────────┘ └──────┬──────┘
                                           │
                    ┌──────────────┬───────┴────────┐
                    │              │                │
             ┌──────▼──────┐ ┌─────▼─────┐  ┌──────▼──────┐
             │     IA      │ │    SEC    │  │     QA      │
             │ LLM / crawl │ │ AppSec    │  │ Release     │
             └─────────────┘ └───────────┘  └─────────────┘
```

## Qui parle à qui

| De → Vers | Autorisé | Canal |
|---|---|---|
| CLIENT ↔ CHEF | Oui | Points, validation, MODIFS |
| CHEF ↔ tous profils | Oui | Ordres PLAN / AUTO |
| Profil ↔ Profil | Oui | Contrats, handoffs techniques |
| Profil → CLIENT | Non | Toujours via CHEF |

## Complémentarité (pourquoi ces profils)

- **ARCH** évite le spaghetti et pose le schéma scalable
- **FRONT** tue l'AI-slop et porte l'expérience
- **BACK** rend le métier réel (auth, tenant, CRUD)
- **IA** remplace les mocks par un pipeline LLM robuste
- **SEC** empêche les trous (IDOR, SSRF crawl, secrets)
- **QA** certifie que le parcours marche vraiment sous deadline
