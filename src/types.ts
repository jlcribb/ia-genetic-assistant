export type Language = 'es' | 'en';

export type Provider = 'gemini' | 'groq' | 'openrouter';

export type ContextMode = 'none' | 'manual' | 'session' | 'history';

export interface ContextConfig {
  mode: ContextMode;
  manualText?: string;
  maxHistoryMessages?: number;
}

export type Theme = 'light' | 'pastel' | 'muted' | 'corporate' | 'dark' | 'academic' | 'serene' | 'fresh';

export type DomainCategory = 'valid_genetics' | 'adjacent_biomed' | 'ambiguous' | 'out_of_domain';

export interface DomainClassification {
  status: DomainCategory;
  confidence: number;
  reason: string;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  fallback_action: 'answer' | 'ask_reformulation' | 'reject' | 'redirect' | 'clarify_then_answer';
}

export interface ToolPlan {
  allowed_tools: string[];
  selected_tools: string[];
}

export interface StructuredSection {
  title: string;
  content: string;
}

export interface ResponsePayload {
  summary: string;
  structured_sections: StructuredSection[];
  warnings: string[];
  next_steps: string[];
}

export interface Evidence {
  used: boolean;
  sources: {
    source_type: 'PubMed' | 'OMIM' | 'HPO' | 'Teaching' | 'Glossary' | 'InternalKB' | 'Other';
    id: string;
    verified: boolean;
    title?: string;
    url?: string;
  }[];
  verification_status: 'verified' | 'partial' | 'none';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'gene' | 'protein' | 'pathway' | 'disease' | 'variant' | 'drug' | 'phenotype' | 'process' | 'mcp_tool' | 'evidence_source' | 'reasoning_step';
  importance: number; // 1 to 5
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationType: 'regulates' | 'associates' | 'causes' | 'interacts' | 'part_of' | 'indicated_for' | 'evidence_back' | 'reasoning_link';
  strength: number; // 0 to 1
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ReasoningStep {
  name: string;
  status: 'success' | 'failure' | 'skipped';
  description: string;
  tool_used?: string;
}

export interface ReasoningTrace {
  steps: ReasoningStep[];
}

export interface StructuredResponse {
  active_mode: string;
  domain_classification: DomainClassification;
  intent_classification: IntentClassification;
  policy_decision: PolicyDecision;
  tool_plan: ToolPlan;
  response_payload: ResponsePayload;
  evidence: Evidence;
  knowledge_graph?: KnowledgeGraphData;
  reasoning_trace?: ReasoningTrace;
  ui_flags: {
    show_references: boolean;
    show_warning_banner: boolean;
    render_as: 
      | 'structured_answer_card'
      | 'structured_case_dialogue'
      | 'meeting_brief'
      | 'preliminary_evaluation_card'
      | 'report_interpretation_card'
      | 'structured_report'
      | 'gene_card'
      | 'protein_card'
      | 'pathway_card'
      | 'pathology_card'
      | 'epigenetics_card'
      | 'glossary_entry'
      | 'educational_card'
      | 'reference_context_card'
      | 'database_guide_card'
      | 'rejection_card'
      | 'clarification_card';
  };
}

export type CognitiveLevel = 'basic' | 'intermediate' | 'expert';

export interface ModulePolicy {
  purpose: string;
  scope: string;
  allowed_domain_statuses: DomainCategory[];
  allowed_intents: string[];
  allowed_topics: string[];
  prohibited_topics: string[];
  allowed_tools: string[];
  output_format: string;
  fallback_behavior: {
    out_of_domain: string;
    adjacent_biomed: string;
    ambiguous: string;
  };
  rejection_type: 'strict' | 'educational' | 'redirection';
  depth: CognitiveLevel;
  systemPrompt?: string;
}

export interface Module {
  id: string;
  title: string;
  desc: string;
  icon: string;
  inputLabel?: string;
  placeholder?: string;
  policy: ModulePolicy;
}

export interface Section {
  id: string;
  title: string;
  modules: string[];
}

export interface Translation {
  [key: string]: {
    [key: string]: string;
  };
}
