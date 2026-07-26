# Agence StagiaFlow — Profils & Skills

Équipe d'agents expérimentés pour livrer le MVP StagiaFlow sous deadline, **sans coder avant ta validation**.

## Composition

| ID | Profil | Skill |
|---|---|---|
| CHEF | Chef d'Agence Senior | [`skills/skills.chef-agence.md`](skills/skills.chef-agence.md) |
| ARCH | Architecte Produit & Technique | [`skills/skills.architecte.md`](skills/skills.architecte.md) |
| FRONT | Lead Frontend Craft | [`skills/skills.frontend-craft.md`](skills/skills.frontend-craft.md) |
| BACK | Lead Backend & Auth | [`skills/skills.backend-auth.md`](skills/skills.backend-auth.md) |
| IA | Ingénieur IA / LLM | [`skills/skills.ingenieur-ia.md`](skills/skills.ingenieur-ia.md) |
| SEC | Ingénieur Sécurité | [`skills/skills.securite.md`](skills/skills.securite.md) |
| QA | QA & Release | [`skills/skills.qa-release.md`](skills/skills.qa-release.md) |

## Documents de pilotage

- [`PROTOCOLE.md`](PROTOCOLE.md) — Plan → Validation → Mode AUTO
- [`FEUILLE-DE-ROUTE-48H.md`](FEUILLE-DE-ROUTE-48H.md) — Waves A/B/C + DoD
- [`../../docs/stagiaflow-blueprint-technique.md`](../../docs/stagiaflow-blueprint-technique.md) — Spec produit/technique

## Comment lancer (copier-coller)

Envoie ce message à l'agent Cursor (idéalement en chargeant le skill CHEF) :

```text
Lancer l'agence StagiaFlow.

Charge et suis :
1. .cursor/agence-stagiaflow/skills/skills.chef-agence.md
2. .cursor/agence-stagiaflow/PROTOCOLE.md
3. .cursor/agence-stagiaflow/FEUILLE-DE-ROUTE-48H.md
4. docs/stagiaflow-blueprint-technique.md

Phase PLAN uniquement : attribue les missions Wave A (et aperçu B/C),
demande un PLAN à chaque profil (en chargeant son skill),
retranscris-moi la synthèse, puis demande ma validation.
N'écris aucun code produit tant que je n'ai pas répondu VALIDÉ.
```

### Ensuite

| Ta réponse | Effet |
|---|---|
| `VALIDÉ` ou `GO AUTO` | Exécution des plans validés |
| `MODIFS : …` | Nouveau cycle PLAN sur les ajustements |
| `POINT` | Point d'avancement immédiat |
| `STOP AUTO` | Gel de l'exécution |

## Principe non négociable

```
Plans → Toi (validation) → Mode AUTO → Points Chef
```

Rien ne passe en exécution produit sans ton GO explicite.
