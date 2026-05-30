/**
 * PRIME · Nutrición — Edge Function: calculate-nutrition
 *
 * Recibe: { description: string, type?: "food" | "exercise" }
 * Retorna (food):     { name, kcal, protein_g, carbs_g, fat_g }
 * Retorna (exercise): { name, duration_min, kcal }
 *
 * Requiere secret: ANTHROPIC_API_KEY
 * Deploy: supabase functions deploy calculate-nutrition
 */

import Anthropic from "npm:@anthropic-ai/sdk@0.35.0";

// ── CORS headers ──────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── Prompts ───────────────────────────────────────────────────────────────────

function foodPrompt(description: string): string {
  return `Analizá este alimento y dame los valores nutricionales exactos.

Alimento: ${description}

Reglas:
- Calculá basándote en las cantidades EXACTAS mencionadas (gramos, unidades, etc.)
- Sumá todos los ingredientes por separado y dá el total
- Referencias: 1 galleta de arroz estándar (10g) ≈ 35 kcal; 10g queso crema ≈ 33 kcal
- Sé preciso. No uses valores genéricos ni redondeos bruscos.
- Respondé SOLO con JSON válido. Sin texto extra. Sin markdown. Sin backticks.

Formato exacto (todos los campos son requeridos):
{"name":"nombre descriptivo corto en español","kcal":número entero,"protein_g":número,"carbs_g":número,"fat_g":número}`;
}

function exercisePrompt(description: string): string {
  return `Estimá las calorías quemadas por una persona de 70 kg haciendo la siguiente actividad.

Actividad: ${description}

Reglas:
- Usá MET values estándar para calcular kcal = MET × 70 × horas
- Sé preciso con la duración mencionada
- Respondé SOLO con JSON válido. Sin texto extra. Sin markdown. Sin backticks.

Formato exacto (todos los campos son requeridos):
{"name":"nombre descriptivo corto en español","duration_min":número entero,"kcal":número entero}`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }

  try {
    const body = await req.json();
    const description: string = (body.description ?? "").trim();
    const type: "food" | "exercise" = body.type === "exercise"
      ? "exercise"
      : "food";

    if (!description) {
      return json({ error: "El campo 'description' es requerido" }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY no está configurada");

    const client = new Anthropic({ apiKey });

    const prompt = type === "exercise"
      ? exercisePrompt(description)
      : foodPrompt(description);

    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text"
      ? message.content[0].text
      : "";

    console.log(`[calculate-nutrition] type=${type} | raw:`, rawText);

    // Extraer el primer objeto JSON de la respuesta
    const match = rawText.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("La IA no devolvió JSON válido");

    const result = JSON.parse(match[0]);
    console.log(`[calculate-nutrition] parsed:`, result);

    return json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    console.error("[calculate-nutrition] error:", msg);
    return json({ error: msg }, 500);
  }
});
