import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url, org_name } = await req.json();
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    let context: Record<string, unknown>;

    if (openAiKey && url) {
      // Attempt to fetch page content via a simple request
      let pageContent = "";
      try {
        const pageResp = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 StagePilot-Bot/1.0" },
        });
        if (pageResp.ok) {
          const html = await pageResp.text();
          // Strip HTML tags for a rough text extract
          pageContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 3000);
        }
      } catch {
        pageContent = `Organisation: ${org_name}`;
      }

      const prompt = `Tu es un expert en analyse d'entreprise. À partir du contenu suivant d'un site web, génère un profil d'entreprise structuré en JSON.

Contenu extrait : "${pageContent}"
Nom de l'organisation : "${org_name}"

Réponds UNIQUEMENT avec ce JSON (sans markdown) :
{
  "sector": "Secteur d'activité principal",
  "main_activities": ["Activité 1", "Activité 2", "Activité 3"],
  "tech_stack": ["Outil/Tech 1", "Outil/Tech 2"],
  "recent_projects": ["Projet/Réalisation 1", "Projet/Réalisation 2"],
  "summary": "Résumé de 2 phrases décrivant l'organisation et sa mission"
}`;

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content ?? "{}";
        try {
          context = JSON.parse(content);
        } catch {
          context = buildFallback(org_name);
        }
      } else {
        context = buildFallback(org_name);
      }
    } else {
      context = buildFallback(org_name);
    }

    return new Response(JSON.stringify(context), {
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
