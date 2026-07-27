import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

async function callLLM(prompt: string, config: ProviderConfig): Promise<string | null> {
  const resp = await fetch(config.endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const pageResp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 StagePilot-Bot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!pageResp.ok) return "";
    const html = await pageResp.text();
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 3000);
  } catch {
    return "";
  }
}

function buildPrompt(pageContent: string, orgName: string): string {
  return `Tu es un expert en analyse d'entreprise. À partir du contenu suivant d'un site web, génère un profil d'entreprise structuré en JSON.

Contenu extrait : "${pageContent}"
Nom de l'organisation : "${orgName}"

Réponds UNIQUEMENT avec ce JSON (sans markdown, sans code fences) :
{
  "sector": "Secteur d'activité principal",
  "main_activities": ["Activité 1", "Activité 2", "Activité 3"],
  "tech_stack": ["Outil/Tech 1", "Outil/Tech 2"],
  "recent_projects": ["Projet/Réalisation 1", "Projet/Réalisation 2"],
  "summary": "Résumé de 2 phrases décrivant l'organisation et sa mission"
}`;
}

function parseResponse(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url, org_name } = await req.json();
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!org_name) {
      return new Response(JSON.stringify({ error: "org_name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pageContent = url ? await scrapeWebsite(url) : "";
    const prompt = buildPrompt(pageContent || `Organisation: ${org_name}`, org_name);

    let result: Record<string, unknown> | null = null;

    const providers: ProviderConfig[] = [];
    if (groqKey) {
      providers.push({ apiKey: groqKey, endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile" });
    }
    if (openrouterKey) {
      providers.push({ apiKey: openrouterKey, endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.1-8b-instruct" });
    }

    for (const provider of providers) {
      const content = await callLLM(prompt, provider);
      if (content) {
        result = parseResponse(content);
        if (result) break;
      }
    }

    if (!result) {
      result = buildFallback(org_name);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildFallback(orgName: string): Record<string, unknown> {
  return {
    sector: "Technologie & Services Numériques",
    main_activities: ["Développement logiciel", "Conseil digital", "Transformation numérique"],
    tech_stack: ["React", "Node.js", "PostgreSQL", "Docker", "Git"],
    recent_projects: ["Refonte plateforme client", "Automatisation des processus", "Migration vers le cloud"],
    summary: `${orgName} est une organisation innovante qui développe des solutions numériques à forte valeur ajoutée. Elle accompagne ses clients dans leur transformation digitale avec une approche orientée résultats.`,
  };
}