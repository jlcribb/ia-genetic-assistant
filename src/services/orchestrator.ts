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
      Active Mode: ${module.id}
      Mode Goal: ${module.policy.purpose}
      Allowed Domain Statuses: ${module.policy.allowed_domain_statuses.join(', ')}
      Allowed Intents: ${module.policy.allowed_intents.join(', ')}
      Forbidden Topics: ${module.policy.prohibited_topics.join(', ')}
      Fallback Behavior: ${JSON.stringify(module.policy.fallback_behavior)}

      User Input: "${inputString}"

      Classify the input status into one of these: valid_genetics, adjacent_biomed, ambiguous, out_of_domain.
      Infer the intention from this list: ${module.policy.allowed_intents.join(', ')}, or unknown.

      Decide if the query is allowed based on the active mode's policy:
      1. Status must be in Allowed Domain Statuses.
      2. Intent should ideally be in Allowed Intents.
      3. Input must NOT touch Forbidden Topics.
      
      If not allowed, follow Fallback Behavior:
      - out_of_domain: ${module.policy.fallback_behavior.out_of_domain}
      - adjacent_biomed: ${module.policy.fallback_behavior.adjacent_biomed}
      - ambiguous: ${module.policy.fallback_behavior.ambiguous}

      Return ONLY a JSON object matching this structure:
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

    const classification = parseAIResponse(classificationText, {
      domain_classification: { status: 'ambiguous', confidence: 0, reason: 'Parsing failure' },
      intent_classification: { intent: 'unknown', confidence: 0 },
      policy_decision: { allowed: false, reason: 'Error parsing AI classification', fallback_action: 'reject' }
    } as any);

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

    const responseData = parseAIResponse(responseText, {
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
      ? `Lo siento, no puedo procesar esta consulta en el modo "${module.id}".`
      : `I'm sorry, I cannot process this query in "${module.id}" mode.`;
    
    const reason = classification.policy_decision?.reason || "Policy violation.";
    const fallback = classification.policy_decision?.fallback_action || "Try another query.";

    const sections: StructuredSection[] = [
      {
        title: isEs ? "Restricción de Política" : "Policy Restriction",
        content: reason
      },
      {
        title: isEs ? "Sugerencia" : "Suggestion",
        content: fallback
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
        next_steps: [isEs ? "Intente reformular su pregunta o cambie de modo en el menú lateral." : "Try reformulating your question or switch modes in the sidebar."]
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
