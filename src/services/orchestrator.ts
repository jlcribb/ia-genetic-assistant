import { 
  Language, 
  StructuredResponse, 
  Module, 
  DomainCategory,
  StructuredSection,
  Provider
} from "../types";
import { MODULES } from "../constants";
import { parseAIResponse } from "../lib/utils";
import { generateResponse } from "./ai";

export class AgentOrchestrator {
  async processQuery(
    moduleId: string, 
    input: any, 
    lang: Language,
    provider: Provider = 'gemini'
  ): Promise<StructuredResponse> {
    const module = MODULES[moduleId];
    const inputString = typeof input === 'string' ? input : JSON.stringify(input);

    // 1. Domain & Intent Classification + Policy Check
    const classificationPrompt = `
      Act as a Domain Classifier and Policy Engine for a Genetic Assistant.
      You are part of a multi-step orchestration pipeline. Your goal is to determine if the user query is safe and relevant.

      Active Mode: ${module.id}
      Mode Goal: ${module.policy.purpose}
      Allowed Domain Statuses: ${module.policy.allowed_domain_statuses.join(', ')}
      Allowed Intents: ${module.policy.allowed_intents.join(', ')}
      Forbidden Topics: ${module.policy.prohibited_topics.join(', ')}
      Fallback Behavior: ${JSON.stringify(module.policy.fallback_behavior)}

      User Input: "${inputString}"

      Definitions:
      - valid_genetics: Clear relation to genes, DNA, inheritance, molecular biology, or genetic pathologies.
      - adjacent_biomed: Medicine or biology but not strictly genetic (e.g., general anatomy, bacterial infections).
      - ambiguous: Language is too vague to be sure, OR can refer to both genetics and non-genetics.
      - out_of_domain: Completely unrelated (sports, politics, etc.).

      Heuristics:
      - "gen de cancer" or similar should be 'valid_genetics' (intent: genetic_pathology_query or gene_query), not 'ambiguous', as it clearly targets the genetic basis of cancer.
      - Short terms like "ADN" or "mutacion" are 'valid_genetics'.

      Decide if the query is allowed:
      1. Status MUST be in Allowed Domain Statuses (${module.policy.allowed_domain_statuses.join(', ')}).
      2. If Status is 'ambiguous', you should decide based on the Fallback Behavior instructions: ${module.policy.fallback_behavior.ambiguous}.
      3. Input must NOT touch Forbidden Topics.

      Return ONLY a JSON object matching this MANDATORY structure:
      {
        "domain_classification": { "status": "valid_genetics" | "adjacent_biomed" | "ambiguous" | "out_of_domain", "confidence": 0.95, "reason": "..." },
        "intent_classification": { "intent": "...", "confidence": 0.9 },
        "policy_decision": { "allowed": true | false, "reason": "...", "fallback_action": "answer" | "ask_reformulation" | "reject" | "redirect" | "clarify_then_answer" }
      }
    `;

    let classificationText;
    try {
      classificationText = await generateResponse(classificationPrompt, provider);
    } catch (error: any) {
      console.error("Orchestrator Classification Error:", error);
      return this.buildErrorResponse(module, error.message, lang);
    }

    const rawClassification = parseAIResponse(classificationText, {
      domain_classification: { status: 'ambiguous', confidence: 0, reason: 'Parsing failure' },
      intent_classification: { intent: 'unknown', confidence: 0 },
      policy_decision: { allowed: false, reason: 'Error parsing AI classification', fallback_action: 'reject' }
    } as any);

    // Normalization logic for different model outputs (handles OpenRouter/other variances)
    const classification = {
      domain_classification: rawClassification.domain_classification || rawClassification.domain || { status: 'ambiguous', confidence: 0, reason: 'Key normalization fallback' },
      intent_classification: rawClassification.intent_classification || rawClassification.intent || { intent: 'unknown', confidence: 0 },
      policy_decision: rawClassification.policy_decision || rawClassification.policy || { allowed: false, reason: 'Key normalization fallback', fallback_action: 'reject' }
    };

    // 2. Tool Resolution (Simulated MCP layer)
    const toolPlan = {
      allowed_tools: module.policy.allowed_tools,
      selected_tools: classification.policy_decision?.allowed ? [module.policy.allowed_tools[0]] : []
    };

    // 3. Generate Structured Response
    if (!classification.policy_decision?.allowed) {
      return this.buildRejectionResponse(module, classification, lang);
    }

    const responsePrompt = `
      Act as an Expert Genetic Assistant in mode: ${module.id}.
      Language: ${lang === 'es' ? 'Spanish' : 'English'}.
      Policy Depth: ${module.policy.depth}.
      Allowed Tools: ${toolPlan.selected_tools.join(', ')}.

      User Input: "${inputString}"

      Generate a highly professional, evidence-based response.
      You MUST return a JSON object matching this MANDATORY schema:

      {
        "response_payload": {
          "summary": "...",
          "structured_sections": [
            { "title": "...", "content": "..." }
          ],
          "warnings": ["..."],
          "next_steps": ["..."]
        },
        "evidence": {
          "used": boolean,
          "sources": [
            { 
              "source_type": "PubMed" | "OMIM" | "HPO" | "Teaching" | "Glossary" | "InternalKB" | "Other",
              "id": "...",
              "verified": boolean,
              "title": "...",
              "url": "..."
            }
          ],
          "verification_status": "verified" | "partial" | "none"
        },
        "ui_flags": {
          "show_references": boolean,
          "show_warning_banner": boolean,
          "render_as": "${module.policy.output_format}"
        }
      }
    `;

    let responseText;
    try {
      responseText = await generateResponse(responsePrompt, provider);
    } catch (error: any) {
      console.error("Orchestrator Response Error:", error);
      return this.buildErrorResponse(module, error.message, lang, classification);
    }

    const rawResponse = parseAIResponse(responseText, {
      response_payload: {
        summary: lang === 'es' ? 'Error al generar la respuesta estructurada.' : 'Error generating structured response.',
        structured_sections: [],
        warnings: [lang === 'es' ? 'La IA no devolvió un formato válido.' : 'AI did not return a valid format.'],
        next_steps: []
      },
      evidence: { used: false, sources: [], verification_status: 'none' },
      ui_flags: {
        show_references: false,
        show_warning_banner: true,
        render_as: 'rejection_card'
      }
    } as any);

    // Normalize response data
    const responseData = {
      response_payload: rawResponse.response_payload || rawResponse.payload || rawResponse.response || {
        summary: lang === 'es' ? 'Formato de respuesta inesperado.' : 'Unexpected response format.',
        structured_sections: [],
        warnings: [],
        next_steps: []
      },
      evidence: rawResponse.evidence || { used: false, sources: [], verification_status: 'none' },
      ui_flags: rawResponse.ui_flags || { show_references: false, show_warning_banner: true, render_as: module.policy.output_format }
    };

    return {
      active_mode: module.id,
      domain_classification: classification.domain_classification,
      intent_classification: classification.intent_classification,
      policy_decision: classification.policy_decision,
      tool_plan: toolPlan,
      ...responseData
    };
  }

  private buildRejectionResponse(
    module: Module, 
    classification: any, 
    lang: Language
  ): StructuredResponse {
    const isEs = lang === 'es';
    const summary = isEs 
      ? `Consulta no procesada en el modo "${module.id}".`
      : `Query not processed in "${module.id}" mode.`;
    
    const reason = classification.policy_decision?.reason || (isEs ? "Violación de política o ambigüedad detectada." : "Policy violation or ambiguity detected.");
    const fallbackAction = classification.policy_decision?.fallback_action || "ask_reformulation";

    let suggestion = isEs 
      ? "Por favor, intente reformular su consulta para ser más específico."
      : "Please try reformulating your query to be more specific.";

    if (fallbackAction === 'redirect') {
      suggestion = isEs ? "Considere usar otro modo en el menú lateral." : "Consider using another mode in the sidebar.";
    } else if (fallbackAction === 'reject') {
      suggestion = isEs ? "Esta consulta está fuera del alcance de este asistente." : "This query is out of the scope of this assistant.";
    }

    const sections: StructuredSection[] = [
      {
        title: isEs ? "Análisis de Política" : "Policy Analysis",
        content: reason
      },
      {
        title: isEs ? "Acción Recomendada" : "Recommended Action",
        content: suggestion
      }
    ];

    return {
      active_mode: module.id,
      domain_classification: classification.domain_classification,
      intent_classification: classification.intent_classification,
      policy_decision: classification.policy_decision,
      tool_plan: { allowed_tools: module.policy.allowed_tools, selected_tools: [] },
      response_payload: {
        summary,
        structured_sections: sections,
        warnings: [isEs ? "Consulta fuera de dominio o modo activo." : "Query out of domain or active mode."],
        next_steps: [isEs ? "Reformula tu pregunta o selecciona un modo más adecuado." : "Reformulate your question or select a more appropriate mode."]
      },
      evidence: { used: false, sources: [], verification_status: 'none' },
      ui_flags: {
        show_references: false,
        show_warning_banner: true,
        render_as: "rejection_card"
      }
    };
  }

  private buildErrorResponse(
    module: Module,
    errorMessage: string,
    lang: Language,
    classification?: any
  ): StructuredResponse {
    const isEs = lang === 'es';
    const summary = isEs
      ? "Error de conexión con el Asistente AI."
      : "AI Assistant connection error.";
    
    return {
      active_mode: module.id,
      domain_classification: classification?.domain_classification || { status: 'ambiguous', confidence: 0, reason: 'AI Error' },
      intent_classification: classification?.intent_classification || { intent: 'unknown', confidence: 0 },
      policy_decision: classification?.policy_decision || { allowed: false, reason: 'AI Service Error', fallback_action: 'reject' },
      tool_plan: { allowed_tools: module.policy.allowed_tools, selected_tools: [] },
      response_payload: {
        summary,
        structured_sections: [
          {
            title: isEs ? "Detalle del Error" : "Error Detail",
            content: errorMessage
          },
          {
            title: isEs ? "Recomendación" : "Recommendation",
            content: isEs 
              ? "Por favor, intente de nuevo en unos momentos o cambie de proveedor de IA (ej. cambiar de OpenRouter a Gemini) en la parte inferior."
              : "Please try again in a moment or switch AI providers (e.g., from OpenRouter to Gemini) at the bottom."
          }
        ],
        warnings: [isEs ? "El servicio de IA superó el límite de peticiones o no está disponible." : "AI service rate limit exceeded or unavailable."],
        next_steps: [isEs ? "Pruebe con otro proveedor de IA." : "Try another AI provider."]
      },
      evidence: { used: false, sources: [], verification_status: 'none' },
      ui_flags: {
        show_references: false,
        show_warning_banner: true,
        render_as: "rejection_card"
      }
    };
  }
}

export const orchestrator = new AgentOrchestrator();
