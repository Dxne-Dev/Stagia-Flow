import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProviderConfig {
  apiKey: string
  endpoint: string
  model: string
}

const LEVEL_PROMPTS: Record<string, string> = {
  licence: "Tâches guidées et structurées : recherche documentaire, rédaction de rapports, tests fonctionnels, support opérationnel. Le stagiaire doit être accompagné pas à pas.",
  master: "Missions à forte valeur : conception de solutions, analyse stratégique, développement de modules ou fonctionnalités, études de marché approfondies.",
  doctorat: "Missions de R&D avancées : études prospectives, benchmarks approfondis, recherche appliquée, prototypage innovant, publications internes.",
};

const YEAR_GUIDANCE: Record<string, Record<number, string>> = {
  licence: {
    1: "Débutant (L1) : tout premier contact avec le monde professionnel. Tâches très élémentaires et fortement encadrées pas à pas.",
    2: "Intermédiaire (L2) : premières responsabilités sur des sous-tâches identifiées. Autonomie partielle avec des points de contrôle réguliers.",
    3: "Avancé (L3) : pré-professionnalisation. Capable de gérer un projet complet de bout en bout avec une supervision allégée.",
  },
  master: {
    1: "Senior (M1) : missions à forte valeur ajoutée, conception de solutions, développement de modules ou fonctionnalités.",
    2: "Expert (M2) : autonomie quasi-totale, pilotage de projet, analyse stratégique, préparation à l'insertion professionnelle.",
  },
  doctorat: {
    1: "Début de doctorat : cadrage du sujet, revue de littérature systématique, définition de la méthodologie de recherche.",
    2: "Milieu de doctorat : collecte et analyse des données, expérimentations, rédaction de publications scientifiques.",
    3: "Fin de doctorat : rédaction de la thèse, valorisation des résultats, préparation de la soutenance.",
  },
};

async function callLLM(prompt: string, config: ProviderConfig): Promise<string | null> {
  const start = Date.now()
  console.log(`[generate-brief] Calling ${config.model} via ${config.endpoint}`)
  const resp = await fetch(config.endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 1024,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text()
    console.error(`[generate-brief] ${config.model} returned ${resp.status}: ${text}`)
    return null
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? null
  console.log(`[generate-brief] ${config.model} responded in ${Date.now() - start}ms, content length: ${content?.length ?? 0}`)
  return content;
}

function parseResponse(content: string): Record<string, unknown> | null {
  // Strip markdown code fences if present
  let cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

function buildPrompt(sector: string, activities: string, stack: string, projects: string, summary: string, academicLevel: string, levelGuidance: string, yearGuidance: string, seed: number): string {
  return `Tu es un expert en pédagogie et en gestion de stages. Génère un brief de projet de stage complet et structuré en français.

Contexte entreprise :
- Secteur : ${sector}
- Activités : ${activities}
- Stack / Outils : ${stack}
- Projets récents : ${projects}
- Résumé : ${summary}

Niveau académique du stagiaire : ${academicLevel}
Guidance pédagogique : ${levelGuidance}
${yearGuidance}
Seed d'unicité : ${seed}

IMPORTANT : Ce brief DOIT être différent des précédents. Propose un projet original, créatif et adapté à ce contexte.

Génère un brief JSON avec EXACTEMENT ces 5 champs. 
Réponds UNIQUEMENT avec le JSON brut, SANS markdown, SANS code fences, SANS texte avant ou après :
{
  "title": "Titre court et accrocheur du projet (max 10 mots)",
  "context_objective": "Paragraphe de 3-4 phrases décrivant le contexte stratégique et l'objectif principal",
  "instructions": "5 étapes numérotées détaillées, chaque étape préfixée par le numéro suivie d'un point, séparées par des retours à la ligne",
  "deliverable_type": "pdf|git|spreadsheet|presentation|other",
  "deadline": "YYYY-MM-DD"
}`;
}

function buildFallback(sector: string, academicLevel: string, stack: string, academicYear: number | null): {
  title: string; context_objective: string; instructions: string; deliverable_type: string; deadline: string
} {
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + (academicYear ? academicYear * 2 : 3));
  const hash = (Date.now() % 7) + Math.floor(Math.random() * 5)

  const templates: Array<{
    t: string; o: string; i: string[]; dt: string
  }> = [
    {
      t: `Optimisation des processus ${sector} — Fil Rouge`,
      o: `Dans le cadre de son développement, l'organisation cherche à améliorer ses processus internes dans le domaine ${sector}. Ce projet vise à analyser l'existant, identifier les axes d'amélioration et proposer des solutions concrètes adaptées au contexte de l'entreprise.`,
      i: [
        "Audit de l'existant — rencontres avec les équipes, documentation des processus actuels",
        "Analyse comparative (benchmark) avec les pratiques du secteur",
        "Identification des 3 axes prioritaires d'amélioration",
        "Conception et prototypage de la solution",
        "Tests, itérations et finalisation du livrable",
      ],
      dt: academicLevel === "doctorat" ? "pdf" : academicLevel === "master" ? "git" : "presentation",
    },
    {
      t: `Étude et déploiement d'une solution ${sector}`,
      o: `L'organisation souhaite renforcer son positionnement dans le secteur ${sector} en déployant une solution innovante. Ce projet a pour objectif d'étudier les options disponibles, de recommander la plus adaptée et d'en piloter le déploiement.`,
      i: [
        "Recherche et veille technologique sur les solutions existantes",
        "Analyse des besoins fonctionnels et techniques",
        "Rédaction d'un cahier des charges et sélection de la solution",
        "Plan de déploiement et accompagnement au changement",
        "Bilan et recommandations pour les prochaines itérations",
      ],
      dt: "pdf",
    },
    {
      t: `Développement d'un outil interne — ${sector}`,
      o: `Pour améliorer son efficacité opérationnelle, l'organisation a identifié le besoin de développer un outil interne sur-mesure. Ce projet consiste à concevoir, développer et déployer cet outil en utilisant les technologies maîtrisées par l'équipe.`,
      i: [
        "Spécifications fonctionnelles et techniques détaillées",
        "Maquettage et validation du design",
        "Développement itératif (sprints) avec les technos cibles",
        "Tests utilisateurs et recette fonctionnelle",
        "Mise en production et documentation utilisateur",
      ],
      dt: "git",
    },
    {
      t: `Analyse de données et reporting — ${sector}`,
      o: `L'organisation dispose de nombreuses données dont elle souhaite extraire de la valeur. Ce projet vise à construire un tableau de bord analytique et des reporting automatisés pour éclairer la prise de décision stratégique.`,
      i: [
        "Inventaire des sources de données et audit de qualité",
        "Nettoyage et structuration des données",
        "Conception du modèle analytique et des KPI",
        "Développement des visualisations et rapports",
        "Automatisation des mises à jour et formation des utilisateurs",
      ],
      dt: "spreadsheet",
    },
    {
      t: `Accompagnement à la transformation digitale — ${sector}`,
      o: `Dans un contexte de transformation numérique, l'organisation souhaite accélérer sa digitalisation. Ce projet consiste à auditer les pratiques actuelles et à proposer une feuille de route concrète de transformation.`,
      i: [
        "Audit des processus digitaux existants",
        "Benchmark des outils et pratiques du secteur",
        "Définition de la feuille de route digitale",
        "Accompagnement des équipes dans le changement",
        "Mesure des impacts et ajustements",
      ],
      dt: "presentation",
    },
  ]

  const idx = hash % templates.length
  const tpl = templates[idx]
  const yearLabel = academicYear ? ` — ${academicLevel.charAt(0).toUpperCase() + academicLevel.slice(1)} ${academicYear}e année` : ` — ${academicLevel.charAt(0).toUpperCase() + academicLevel.slice(1)}`
  return {
    title: `${tpl.t}${yearLabel}`,
    context_objective: tpl.o,
    instructions: tpl.i.map((step, i) => `${i + 1}. ${step}`).join("\n"),
    deliverable_type: tpl.dt,
    deadline: deadline.toISOString().split("T")[0],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { session_id, org_context, academic_level, academic_year, organization_id } = await req.json();

    if (!session_id || !academic_level) {
      return new Response(JSON.stringify({ error: "session_id and academic_level are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let remainingCredits = Infinity;

    if (organization_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && serviceKey) {
        const sb = createClient(supabaseUrl, serviceKey);
        const { data: org } = await sb.from("organizations").select("plan").eq("id", organization_id).maybeSingle();
        const plan = org?.plan ?? "essentiel";

        if (plan !== "entreprise") {
          const maxCalls = plan === "pro" ? 100 : 5;
          const { data: result } = await sb.rpc("increment_ai_calls", { org_id: organization_id, max_calls: maxCalls });
          const row = result?.[0];
          if (!row?.allowed) {
            return new Response(JSON.stringify({
              error: `CREDIT_LIMIT_REACHED:Vous avez atteint la limite de ${maxCalls} générations IA par jour sur le plan actuel. Passez à une formule supérieure pour un plus grand nombre de générations.`,
            }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          remainingCredits = row.remaining;
        }
      }
    }

    const levelGuidance = LEVEL_PROMPTS[academic_level] ?? LEVEL_PROMPTS["master"];
    const yearGuidance = (academic_year && YEAR_GUIDANCE[academic_level]?.[academic_year])
      ? `Année dans le cycle : ${academic_year}. Guidance spécifique à l'année : ${YEAR_GUIDANCE[academic_level][academic_year]}`
      : "";
    const sector = org_context?.sector ?? "Technologie";
    const activities = (org_context?.main_activities ?? []).join(", ");
    const stack = (org_context?.tech_stack ?? []).join(", ");
    const projects = (org_context?.recent_projects ?? []).join(", ");
    const summary = org_context?.summary ?? "";

    const groqKey = Deno.env.get("GROQ_API_KEY");
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

    console.log(`[generate-brief] Keys found: groq=${!!groqKey}, openrouter=${!!openrouterKey}`)

    let brief: { title: string; context_objective: string; instructions: string; deliverable_type: string; deadline: string } | null = null;

    const providers: ProviderConfig[] = [];
    if (groqKey) {
      providers.push({ apiKey: groqKey, endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile" });
    }
    if (openrouterKey) {
      providers.push({ apiKey: openrouterKey, endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.1-8b-instruct" });
    }

    if (providers.length > 0) {
      const seed = Date.now() + Math.floor(Math.random() * 100000)
      const prompt = buildPrompt(sector, activities, stack, projects, summary, academic_level, levelGuidance, yearGuidance, seed);
      console.log(`[generate-brief] Prompt built, seed=${seed}, length=${prompt.length}`)

      for (const provider of providers) {
        console.log(`[generate-brief] Trying ${provider.model}...`)
        const content = await callLLM(prompt, provider);
        if (content) {
          const parsed = parseResponse(content);
          if (parsed?.title && parsed?.context_objective && parsed?.instructions) {
            const rawType = String(parsed.deliverable_type ?? "pdf").toLowerCase()
            const validTypes = ["pdf", "git", "spreadsheet", "presentation", "other"]
            const deliverableType = validTypes.includes(rawType) ? rawType : "pdf"
            let deadline = String(parsed.deadline ?? "")
            // Ensure deadline is a future date; default to +3 months if missing/past
            if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || new Date(deadline) <= new Date()) {
              const d = new Date()
              d.setMonth(d.getMonth() + 3)
              deadline = d.toISOString().split("T")[0]
            }
            brief = {
              title: String(parsed.title),
              context_objective: String(parsed.context_objective),
              instructions: String(parsed.instructions),
              deliverable_type: deliverableType,
              deadline,
            };
            console.log(`[generate-brief] Success with ${provider.model}, title="${brief.title}"`)
            break;
          } else {
            console.warn(`[generate-brief] ${provider.model} returned unparseable content: "${content?.slice(0, 200)}"`)
          }
        } else {
          console.warn(`[generate-brief] ${provider.model} returned null`)
        }
      }
    } else {
      console.warn(`[generate-brief] No API keys configured, using fallback`)
    }

    if (!brief) {
      console.warn(`[generate-brief] All providers failed, using fallback`)
      brief = buildFallback(sector, academic_level, stack, academic_year);
    }

    return new Response(JSON.stringify({ ...brief, remaining_credits: remainingCredits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
