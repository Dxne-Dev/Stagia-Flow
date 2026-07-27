import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LEVEL_PROMPTS: Record<string, string> = {
  licence: "Tâches guidées et structurées : recherche documentaire, rédaction de rapports, tests fonctionnels, support opérationnel. Le stagiaire doit être accompagné pas à pas.",
  master: "Missions à forte valeur : conception de solutions, analyse stratégique, développement de modules ou fonctionnalités, études de marché approfondies.",
  doctorat: "Missions de R&D avancées : études prospectives, benchmarks approfondis, recherche appliquée, prototypage innovant, publications internes.",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { session_id, org_context, academic_level } = await req.json();

    if (!session_id || !academic_level) {
      return new Response(JSON.stringify({ error: "session_id and academic_level are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const levelGuidance = LEVEL_PROMPTS[academic_level] ?? LEVEL_PROMPTS["master"];
    const sector = org_context?.sector ?? "Technologie";
    const activities = (org_context?.main_activities ?? []).join(", ");
    const stack = (org_context?.tech_stack ?? []).join(", ");
    const projects = (org_context?.recent_projects ?? []).join(", ");
    const summary = org_context?.summary ?? "";

    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    let brief: { title: string; context_objective: string; instructions: string; deliverable_type: string; deadline: string };

    if (openAiKey) {
      const prompt = `Tu es un expert en pédagogie et en gestion de stages. Génère un brief de projet de stage complet et structuré en français.

Contexte entreprise :
- Secteur : ${sector}
- Activités : ${activities}
- Stack / Outils : ${stack}
- Projets récents : ${projects}
- Résumé : ${summary}

Niveau académique du stagiaire : ${academic_level}
Guidance pédagogique : ${levelGuidance}

Génère un brief JSON avec EXACTEMENT ces champs (réponds UNIQUEMENT avec le JSON, sans markdown):
{
  "title": "Titre court et accrocheur du projet",
  "context_objective": "Paragraphe de 3-4 phrases décrivant le contexte stratégique et l'objectif principal",
  "instructions": "Étapes numérotées détaillées sur 5-8 lignes, chaque étape sur une nouvelle ligne préfixée par le numéro",
  "deliverable_type": "pdf|git|spreadsheet|presentation|other",
  "deadline": "YYYY-MM-DD (dans 2-3 mois)"
}`;

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content ?? "{}";
      brief = JSON.parse(content);
    } else {
      // Fallback mock brief
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 3);

      brief = {
        title: `Optimisation des processus ${sector} — Fil Rouge ${academic_level.charAt(0).toUpperCase() + academic_level.slice(1)}`,
        context_objective: `Dans le cadre de son développement, l'organisation cherche à améliorer ses processus internes dans le domaine ${sector}. Ce projet vise à analyser l'existant, identifier les axes d'amélioration et proposer des solutions concrètes adaptées au contexte de l'entreprise. Le stagiaire contribuera directement à un enjeu stratégique de l'organisation.`,
        instructions: `1. Semaine 1-2 : Prise en main et audit de l'existant — rencontres avec les équipes, documentation des processus actuels\n2. Semaine 3-4 : Analyse comparative (benchmark) avec les pratiques du secteur ${sector}\n3. Semaine 5-6 : Identification des 3 axes prioritaires d'amélioration et validation avec le manager\n4. Semaine 7-8 : Conception et prototypage de la solution (utilisant : ${stack || "les outils fournis"})\n5. Semaine 9-10 : Tests, itérations et recueil de feedback utilisateurs\n6. Semaine 11-12 : Finalisation du livrable, rédaction du rapport et présentation des résultats`,
        deliverable_type: academic_level === "doctorat" ? "pdf" : academic_level === "master" ? "git" : "presentation",
        deadline: deadline.toISOString().split("T")[0],
      };
    }

    return new Response(JSON.stringify(brief), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
