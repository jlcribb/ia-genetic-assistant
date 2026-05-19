import { Translation, Section, Module, Language } from './types';

export const I18N: Translation = {
  es: {
    langLabel: "Idioma:",
    appTitle: "GeneTrust AI",
    submitButton: "Generar Resultado",
    loadingText: "Procesando, por favor espere...",
    responseTitle: "Respuesta del Asistente AI",
    emptyResponse: "La respuesta del asistente aparecerá aquí.",
    emptyInputError: "Por favor, complete todos los campos de entrada.",
    exportAlert: "No hay contenido para exportar. Por favor, genere una respuesta primero.",
    disclaimer: "Gemini puede cometer errores, así que verifica las respuestas.",
    printTitle: "Imprimir Resultado",
    exportPngTitle: "Exportar como PNG",
    exportJpgTitle: "Exportar como JPG",
    section_assistance_title: "🧠 Asistencia y Soporte Inteligente",
    section_analysis_title: "🧪 Herramientas de Evaluación y Análisis",
    section_query_title: "🧬 Análisis Biomolecular Integrado",
    section_education_title: "📚 Conocimiento y Aprendizaje",
    asistente_title: "Asistente virtual",
    asistente_desc: "Responda preguntas frecuentes de genética.",
    asistente_input_label: "Su pregunta",
    asistente_placeholder: "Escriba aquí su consulta...",
    evaluador_title: "Evaluación Preliminar",
    evaluador_desc: "Estime si un paciente debe ser referido a genética clínica.",
    evaluador_summary_label: "Resumen Clínico",
    evaluador_summary_placeholder: "Ej: Paciente de 5 años con hipotonía...",
    evaluador_history_label: "Antecedentes Familiares",
    evaluador_history_placeholder: "Ej: Padres no consanguíneos...",
    interprete_title: "Interpretación de Reportes Genéticos",
    interprete_desc: "Convierta un reporte de laboratorio en un resumen entendible.",
    interprete_input_label: "Pegue el contenido del reporte (VCF, texto, etc.)",
    interprete_placeholder: "##fileformat=VCFv4.2...",
    simulador_title: "Consejería Genética Asistida",
    simulador_desc: "Entrene habilidades de comunicación en escenarios de consejo genético.",
    simulador_scenario_label: "Seleccione un Escenario",
    simulador_message_label: "Su primera frase",
    simulador_message_placeholder: "Ej: Hola, gracias por venir...",
    reuniones_title: "Apoyo Inteligente en Reuniones",
    reuniones_desc: "Responda preguntas contextuales sobre genes y síndromes.",
    reuniones_input_label: "Su pregunta",
    reuniones_placeholder: "Escriba aquí su consulta...",
    generador_title: "Generación de Informes Clínicos",
    generador_desc: "Redacte cartas para pacientes a partir de reportes técnicos.",
    generador_clinical_label: "Datos Clínicos Relevantes",
    generador_clinical_placeholder: "Ej: Paciente: Juan Pérez, 32 años...",
    generador_molecular_label: "Resultado Molecular (Técnico)",
    generador_molecular_placeholder: "Ej: Gen: CFTR. Variante: c.1521_1523delCTT...",
    genes_title: "Nivel Genómico",
    genes_desc: "Variantes y Genes. Busque información detallada sobre un gen específico.",
    genes_input_label: "Símbolo del Gen (ej. CFTR)",
    genes_placeholder: "Ingrese el símbolo oficial del gen...",
    proteinas_title: "Nivel Funcional",
    proteinas_desc: "Proteínas y Función Molecular. Busque información sobre una proteína, sus dominios y variantes.",
    proteinas_input_label: "Nombre de la Proteína o ID de UniProt",
    proteinas_placeholder: "Ingrese el nombre de la proteína...",
    vias_de_señalizacion_title: "Redes Biológicas",
    vias_de_señalizacion_desc: "Pathways y Vías de Señalización. Explore vías de señalización metabólicas y los genes involucrados.",
    vias_de_señalizacion_input_label: "Gen o Vía de Señalización",
    vias_de_señalizacion_placeholder: "Ingrese un gen (ej. AKT1) o una vía (ej. MAPK signaling pathway)...",
    glosario_title: "Glosario Genómico Interactivo",
    glosario_desc: "Alfabetización genómica progresiva e integración con NCBI.",
    glosario_input_label: "Término a definir",
    glosario_placeholder: "Ingrese un término genético...",
    conceptos_title: "Conceptos Biomoleculares",
    conceptos_desc: "Explicación de mecanismos biológicos y procesos moleculares.",
    conceptos_input_label: "Proceso o concepto molecular",
    conceptos_placeholder: "Ej: Splicing, Transcripción, Epigenética...",
    referencias_title: "Referencias Científicas",
    referencias_desc: "Sistema explicativo y contextual basado en PubMed.",
    referencias_input_label: "PMID, DOI o tema de interés",
    referencias_placeholder: "Ingrese una referencia o tema científico...",
    bases_datos_title: "Bases de Datos Biomédicas",
    bases_datos_desc: "Guía educativa sobre fuentes biomédicas y navegación científica.",
    bases_datos_input_label: "Nombre de la base de datos o consulta",
    bases_datos_placeholder: "Ej: ClinVar, OMIM, UniProt...",
    section_governance_title: "🛡 Evidencia, Calidad y Gobernanza",
    fuentes_evidencia_title: "Fuentes y Evidencia Científica",
    fuentes_evidencia_desc: "Origen del conocimiento y nivel de consistencia científica.",
    fuentes_evidencia_input_label: "Consulta sobre evidencia",
    fuentes_evidencia_placeholder: "Ej: ¿Qué nivel de evidencia tiene la variante x?...",
    trazabilidad_title: "Trazabilidad de Respuestas",
    trazabilidad_desc: "Pipeline de razonamiento biomédico y grounding explícito.",
    trazabilidad_input_label: "ID de consulta o tema para trazar",
    trazabilidad_placeholder: "Ej: Explicar razonamiento de la última consulta...",
    auditoria_ia_title: "Auditoría de IA",
    auditoria_ia_desc: "Registro operacional, compliance y detección de alucinaciones.",
    auditoria_ia_input_label: "Consulta de auditoría",
    auditoria_ia_placeholder: "Ej: Revisar consistencia de las respuestas en el módulo de genes...",
    validacion_biomedica_title: "Validación Biomédica",
    validacion_biomedica_desc: "Contenido validado, revisado y basado en guías oficiales.",
    validacion_biomedica_input_label: "Elemento a validar",
    validacion_biomedica_placeholder: "Ej: Estado de validación de la interpretación actual...",
    metricas_calidad_title: "Métricas de Calidad",
    metricas_calidad_desc: "Evaluación continua de precisión, confiabilidad y performance.",
    metricas_calidad_input_label: "Métrica o reporte de calidad",
    metricas_calidad_placeholder: "Ej: Ver tasa de grounding por módulo...",
    autoevaluacion_title: "Autoevaluación",
    autoevaluacion_button: "Generar Autoevaluación",
    autoevaluacion_desc: "Pon a prueba tus conocimientos sobre el tema consultado.",
    print_quiz_button: "Imprimir Cuestionario",
    login_button: "Iniciar Sesión con Google",
    logout_button: "Cerrar Sesión",
    history_title: "Historial de Consultas",
    no_history: "No hay consultas previas.",
    patologias_title: "Relación Genotipo–Fenotipo",
    patologias_desc: "Patologías Genéticas. Consulta de enfermedades de base genética.",
    patologias_input_label: "Nombre de la patología o síndrome",
    patologias_placeholder: "Ej: Síndrome de Marfan, Fibrosis Quística...",
    epigenetica_title: "Regulación Génica",
    epigenetica_desc: "Epigenética y Regulación. Consulta sobre mecanismos epigenéticos y regulación.",
    epigenetica_input_label: "Mecanismo o concepto epigenético",
    epigenetica_placeholder: "Ej: Metilación del ADN, Imprinting...",
    transcriptomica_title: "Actividad Génica",
    transcriptomica_desc: "Transcriptómica. Interpretar actividad génica y regulación molecular.",
    transcriptomica_input_label: "Gen o set de datos transcriptómicos",
    transcriptomica_placeholder: "Ingrese el símbolo de un gen o describa el perfil de expresión...",
    section_admin_title: "📊 Analítica y Observabilidad",
    uso_plataforma_title: "Uso de Plataforma",
    uso_plataforma_desc: "Observabilidad del comportamiento de usuarios y patrones cognitivos.",
    uso_plataforma_input_label: "Filtro o consulta de uso",
    uso_plataforma_placeholder: "Ej: Consultas por módulo en la última semana...",
    calidad_respuestas_title: "Calidad de Respuestas",
    calidad_respuestas_desc: "Evaluación de grounding, consistencia científica y precisión IA.",
    calidad_respuestas_input_label: "Análisis de calidad",
    calidad_respuestas_placeholder: "Ej: Ver grounding score promedio...",
    feedback_usuarios_title: "Feedback de Usuarios",
    feedback_usuarios_desc: "Retroalimentación continua y mejora adaptativa basada en satisfacción.",
    feedback_usuarios_input_label: "Consulta de feedback",
    feedback_usuarios_placeholder: "Ej: Resumen de comentarios sobre utilidad clínica...",
    metricas_clinicas_title: "Métricas Clínicas",
    metricas_clinicas_desc: "Observabilidad genómica específica: genes, variantes y guías oficiales.",
    metricas_clinicas_input_label: "Reporte clínico",
    metricas_clinicas_placeholder: "Ej: Genes más consultados y concordancia ACMG...",
    trazabilidad_operacional_title: "Trazabilidad Operacional",
    trazabilidad_operacional_desc: "Monitoreo completo del pipeline IA: tools, MCP y performance.",
    trazabilidad_operacional_input_label: "Trazado operacional",
    trazabilidad_operacional_placeholder: "Ej: Performance de mcp_classifier en las últimas 24h...",
    feedback_button: "Dar Feedback",
    feedback_title: "Tu opinión nos importa",
    feedback_desc: "¿Cómo calificarías esta respuesta?",
    feedback_submit: "Enviar Feedback",
    feedback_success: "¡Gracias por tu feedback!",
    feedback_provider_invite: "También puedes realizar un feedback discriminado por proveedor de Agente IA, si lo consideras oportuno.",
    analytics_usage_by_mode_desc: "Este gráfico muestra la distribución de tus consultas entre los diferentes módulos del asistente. Te permite identificar qué herramientas estás utilizando con más frecuencia.",
    metric_functionality_desc: "Evalúa si la IA siguió las instrucciones, estructuró la respuesta correctamente y cumplió con el formato solicitado.",
    metric_accuracy_desc: "Mide la exactitud técnica y científica de la información clínica y genética proporcionada.",
    metric_relevance_desc: "Califica qué tan bien se ajustan los enlaces, referencias y datos al caso específico consultado.",
    metric_usability_desc: "Evalúa la claridad del lenguaje y qué tan fácil es de entender para el profesional o el paciente.",
    metric_satisfaction_desc: "Representa la experiencia general y la utilidad percibida de la respuesta entregada.",
    metric_explanation_title: "Explicación de Métricas",
    context_settings_title: "Configuración de Contexto",
    context_mode_label: "Modo de Contexto:",
    context_mode_none: "Sin Contexto",
    context_mode_manual: "Manual (Experto)",
    context_mode_session: "Sesión Actual",
    context_mode_history: "Historial Completo",
    context_manual_placeholder: "Ingrese el contexto específico para esta consulta (ej: El paciente tiene antecedentes de...)",
    context_aggregation_info: "El sistema incluirá automáticamente consultas anteriores para mejorar la precisión y continuidad.",
    context_info_title: "Sobre el Contexto Interactivo",
    cognitive_level_label: "Nivel Cognitivo:",
    cognitive_level_basic: "Básico",
    cognitive_level_intermediate: "Académico / Intermedio",
    cognitive_level_expert: "Profesional / Especialista",
    actividad_usuarios_title: "Usuarios",
    actividad_usuarios_desc: "Visualización detallada de la actividad y engagement de los usuarios.",
    section_owner_title: "👑 Administración de Plataforma",
  },
  en: {
    langLabel: "Language:",
    appTitle: "GeneTrust AI",
    submitButton: "Generate Result",
    loadingText: "Processing, please wait...",
    responseTitle: "Response from the AI Assistant",
    emptyResponse: "The assistant's response will appear here.",
    emptyInputError: "Please fill in all input fields.",
    exportAlert: "There is no content to export. Please generate a response first.",
    disclaimer: "Gemini can make mistakes, so please double-check its responses.",
    analytics_usage_by_mode_desc: "This chart shows the distribution of your queries across the different assistant modules. It allows you to identify which tools you are using most frequently.",
    metric_functionality_desc: "Evaluates if the AI followed instructions, structured the response correctly, and met the requested format.",
    metric_accuracy_desc: "Measures the technical and scientific accuracy of the clinical and genetic information provided.",
    metric_relevance_desc: "Rates how well the links, references, and data fit the specific case consulted.",
    metric_usability_desc: "Evaluates the clarity of the language and how easy it is for the professional or patient to understand.",
    metric_satisfaction_desc: "Represents the overall experience and perceived utility of the delivered response.",
    metric_explanation_title: "Metrics Explanation",
    printTitle: "Print Result",
    exportPngTitle: "Export as PNG",
    exportJpgTitle: "Export as JPG",
    section_assistance_title: "🧠 Intelligent Assistance & Support",
    section_analysis_title: "🧪 Evaluation & Analysis Tools",
    section_query_title: "🧬 Integrated Biomolecular Analysis",
    section_education_title: "📚 Knowledge & Learning",
    asistente_title: "Virtual Assistant",
    asistente_desc: "Answer frequently asked questions about genetics.",
    asistente_input_label: "Your question",
    asistente_placeholder: "Type your query here...",
    evaluador_title: "Preliminary Evaluation",
    evaluador_desc: "Estimate if a patient should be referred to clinical genetics.",
    evaluador_summary_label: "Clinical Summary",
    evaluador_summary_placeholder: "e.g., 5-year-old patient with hypotonia...",
    evaluador_history_label: "Family History",
    evaluador_history_placeholder: "e.g., Non-consanguineous parents...",
    interprete_title: "Genetic Report Interpretation",
    interprete_desc: "Turn a lab report into an understandable summary.",
    interprete_input_label: "Paste the report content (VCF, text, etc.)",
    interprete_placeholder: "##fileformat=VCFv4.2...",
    simulador_title: "Assisted Genetic Counseling",
    simulador_desc: "Train communication skills in genetic counseling scenarios.",
    simulador_scenario_label: "Select a Scenario",
    simulador_message_label: "Your opening line",
    simulador_message_placeholder: "e.g., Hello, thanks for coming in...",
    reuniones_title: "Intelligent Meeting Support",
    reuniones_desc: "Answer contextual questions about genes and syndromes.",
    reuniones_input_label: "Your question",
    reuniones_placeholder: "Type your query here...",
    generador_title: "Clinical Report Generation",
    generador_desc: "Draft letters for patients from technical reports.",
    generador_clinical_label: "Relevant Clinical Data",
    generador_clinical_placeholder: "e.g., Patient: John Doe, 32 years old...",
    generador_molecular_label: "Molecular Result (Technical)",
    generador_molecular_placeholder: "e.g., Gene: CFTR. Variant: c.1521_1523delCTT...",
    genes_title: "Genomic Level",
    genes_desc: "Variants and Genes. Look up detailed information about a specific gene.",
    genes_input_label: "Gene Symbol (e.g., CFTR)",
    genes_placeholder: "Enter the official gene symbol...",
    proteinas_title: "Functional Level",
    proteinas_desc: "Proteins and Molecular Function. Find information about a protein, its domains, and variants.",
    proteinas_input_label: "Protein Name or UniProt ID",
    proteinas_placeholder: "Enter the protein name...",
    vias_de_señalizacion_title: "Biological Networks",
    vias_de_señalizacion_desc: "Pathways and Signaling Pathways. Explore metabolic signaling pathways and the genes involved.",
    vias_de_señalizacion_input_label: "Gene or Signaling Pathway",
    vias_de_señalizacion_placeholder: "Enter a gene (e.g., AKT1) or a pathway (e.g., MAPK signaling pathway)...",
    glosario_title: "Interactive Genomic Glossary",
    glosario_desc: "Progressive genomic literacy and integration with NCBI.",
    glosario_input_label: "Term to define",
    glosario_placeholder: "Enter a genetic term...",
    conceptos_title: "Biomolecular Concepts",
    conceptos_desc: "Explanation of biological mechanisms and molecular processes.",
    conceptos_input_label: "Molecular process or concept",
    conceptos_placeholder: "e.g., Splicing, Transcription, Epigenetics...",
    referencias_title: "Scientific References",
    referencias_desc: "Explanatory and contextual system based on PubMed.",
    referencias_input_label: "PMID, DOI or topic of interest",
    referencias_placeholder: "Enter a scientific reference or topic...",
    bases_datos_title: "Biomedical Databases",
    bases_datos_desc: "Educational guide on biomedical sources and scientific navigation.",
    bases_datos_input_label: "Database name or query",
    bases_datos_placeholder: "e.g., ClinVar, OMIM, UniProt...",
    section_governance_title: "🛡 Evidence, Quality & Governance",
    fuentes_evidencia_title: "Sources & Scientific Evidence",
    fuentes_evidencia_desc: "Origin of knowledge and level of scientific consistency.",
    fuentes_evidencia_input_label: "Query about evidence",
    fuentes_evidencia_placeholder: "e.g., What level of evidence does variant x have?...",
    trazabilidad_title: "Response Traceability",
    trazabilidad_desc: "Biomedical reasoning pipeline and explicit grounding.",
    trazabilidad_input_label: "Query ID or topic to trace",
    trazabilidad_placeholder: "e.g., Explain reasoning of the last query...",
    auditoria_ia_title: "AI Auditing",
    auditoria_ia_desc: "Operational logging, compliance, and hallucination detection.",
    auditoria_ia_input_label: "Audit query",
    auditoria_ia_placeholder: "e.g., Review consistency of answers in genes module...",
    validacion_biomedica_title: "Biomedical Validation",
    validacion_biomedica_desc: "Validated, reviewed, and official guideline-based content.",
    validacion_biomedica_input_label: "Element to validate",
    validacion_biomedica_placeholder: "e.g., Validation status of current interpretation...",
    metricas_calidad_title: "Quality Metrics",
    metricas_calidad_desc: "Continuous evaluation of precision, reliability, and performance.",
    metricas_calidad_input_label: "Metric or quality report",
    metricas_calidad_placeholder: "e.g., View grounding rate by module...",
    autoevaluacion_title: "Self-Assessment",
    autoevaluacion_button: "Generate Self-Assessment",
    autoevaluacion_desc: "Test your knowledge on the queried topic.",
    print_quiz_button: "Print Quiz",
    login_button: "Login with Google",
    logout_button: "Logout",
    history_title: "Query History",
    no_history: "No previous queries.",
    patologias_title: "Genotype–Phenotype Relationship",
    patologias_desc: "Genetic Pathologies. Query for diseases with a genetic basis.",
    patologias_input_label: "Pathology or syndrome name",
    patologias_placeholder: "e.g., Marfan Syndrome, Cystic Fibrosis...",
    epigenetica_title: "Gene Regulation",
    epigenetica_desc: "Epigenetics and Regulation. Query about epigenetic mechanisms and regulation.",
    epigenetica_input_label: "Epigenetic mechanism or concept",
    epigenetica_placeholder: "e.g., DNA Methylation, Imprinting...",
    transcriptomica_title: "Gene Activity",
    transcriptomica_desc: "Transcriptomics. Interpret gene activity and molecular regulation.",
    transcriptomica_input_label: "Gene or transcriptomic dataset",
    transcriptomica_placeholder: "Enter a gene symbol or describe the expression profile...",
    section_admin_title: "📊 Analytics & Observability",
    uso_plataforma_title: "Platform Usage",
    uso_plataforma_desc: "Observability of user behavior and cognitive patterns.",
    uso_plataforma_input_label: "Usage filter or query",
    uso_plataforma_placeholder: "e.g., Queries per module in the last week...",
    calidad_respuestas_title: "Response Quality",
    calidad_respuestas_desc: "Evaluation of grounding, scientific consistency, and AI precision.",
    calidad_respuestas_input_label: "Quality analysis",
    calidad_respuestas_placeholder: "e.g., View average grounding score...",
    feedback_usuarios_title: "User Feedback",
    feedback_usuarios_desc: "Continuous feedback and adaptive improvement based on satisfaction.",
    feedback_usuarios_input_label: "Feedback query",
    feedback_usuarios_placeholder: "e.g., Summary of comments on clinical utility...",
    metricas_clinicas_title: "Clinical Metrics",
    metricas_clinicas_desc: "Specific genomic observability: genes, variants, and official guidelines.",
    metricas_clinicas_input_label: "Clinical report",
    metricas_clinicas_placeholder: "e.g., Most queried genes and ACMG concordance...",
    trazabilidad_operacional_title: "Operational Traceability",
    trazabilidad_operacional_desc: "Full monitoring of the AI pipeline: tools, MCP, and performance.",
    trazabilidad_operacional_input_label: "Operational trace",
    trazabilidad_operacional_placeholder: "e.g., performance of mcp_classifier in last 24h...",
    feedback_button: "Give Feedback",
    feedback_title: "Your opinion matters",
    feedback_desc: "How would you rate this response?",
    feedback_submit: "Submit Feedback",
    feedback_success: "Thank you for your feedback!",
    feedback_provider_invite: "You can also provide specific feedback for the AI Agent provider, if you find it appropriate.",
    context_settings_title: "Context Settings",
    context_mode_label: "Context Mode:",
    context_mode_none: "No Context",
    context_mode_manual: "Manual (Expert)",
    context_mode_session: "Current Session",
    context_mode_history: "Full History",
    context_manual_placeholder: "Enter specific context for this query (e.g., The patient has a history of...)",
    context_aggregation_info: "The system will automatically include previous queries to improve precision and continuity.",
    context_info_title: "About Interactive Context",
    cognitive_level_label: "Cognitive Level:",
    cognitive_level_basic: "Basic",
    cognitive_level_intermediate: "Academic / Intermediate",
    cognitive_level_expert: "Professional / Specialist",
    actividad_usuarios_title: "Users",
    actividad_usuarios_desc: "Detailed visualization of user activity and global engagement.",
    section_owner_title: "👑 Platform Administration",
  }
};

export const GLOBAL_COGNITIVE_ARCHITECTURE = `# REARQUITECTURA COGNITIVA GLOBAL DE LA PLATAFORMA

La plataforma evolucionará desde herramientas independientes hacia un sistema cognitivo biomédico adaptativo.

## 1. PRINCIPIO CENTRAL DE DISEÑO
Arquitectura basada en DOS EJES:
A) SUBDOMINIO BIOMÉDICO
B) NIVEL COGNITIVO DEL USUARIO (Básico, Académico/Intermedio, Profesional/Especialista)

## 2. DIFERENCIACIÓN DE NIVELES

### NIVEL BÁSICO
* Orientado a: alumnos iniciales, pacientes, profesionales no genetistas.
* Características: lenguaje simple, explicaciones graduales, ejemplos, pocas siglas.
* Respuesta: breve, clara, pedagógica.

### NIVEL ACADÉMICO / INTERMEDIO
* Orientado a: estudiantes avanzados, residentes, bioquímicos.
* Características: terminología formal, explicación mecanística, pathways, referencias resumidas.

### NIVEL PROFESIONAL / ESPECIALISTA
* Orientado a: genetistas, oncólogos, investigadores.
* Características: lenguaje técnico completo, HGVS, ACMG, evidencia clínica, trazabilidad.
* Requisito: incluir papers, enlaces a bases biomédicas, pathways, evidencia experimental.

## 3. CONTROL DE SUBDOMINIOS Y GOBERNANZA
* Cada módulo restringe su alcance pero orienta al usuario si la consulta pertenece a otro módulo.
* Priorizar precisión biomédica, trazabilidad y claridad conceptual.`;

export const SIDEBAR_STRUCTURE: Section[] = [
  { id: 'assistance', title: 'section_assistance_title', modules: ['asistente', 'simulador', 'reuniones'] },
  { id: 'analysis', title: 'section_analysis_title', modules: ['evaluador', 'interprete', 'generador'] },
  { id: 'query', title: 'section_query_title', modules: ['genes', 'proteinas', 'vias_de_señalizacion', 'transcriptomica', 'patologias', 'epigenetica'] },
  { id: 'education', title: 'section_education_title', modules: ['glosario', 'conceptos', 'referencias', 'bases_datos'] },
  { id: 'governance', title: 'section_governance_title', modules: ['fuentes_evidencia', 'trazabilidad', 'auditoria_ia', 'validacion_biomedica', 'metricas_calidad'] },
  { id: 'admin', title: 'section_admin_title', modules: ['actividad_usuarios', 'uso_plataforma', 'calidad_respuestas', 'feedback_usuarios', 'metricas_clinicas', 'trazabilidad_operacional'] }
];

export const MODULES: Record<string, Module> = {
  asistente: {
    id: 'asistente',
    title: 'asistente_title',
    desc: 'asistente_desc',
    icon: 'MessageSquare',
    inputLabel: 'asistente_input_label',
    placeholder: 'asistente_placeholder',
    policy: {
      purpose: 'Responder consultas generales de genética humana, biomédica y educativa dentro del dominio permitido.',
      scope: 'Conceptos generales, herencia, pruebas genéticas.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['general_genetics_assistance', 'education_query', 'bibliography_query', 'gene_query', 'protein_query', 'pathway_query', 'genetic_pathology_query', 'epigenetics_query', 'glossary_query'],
      allowed_topics: ['herencia', 'ADN', 'mutaciones', 'consejo genético', 'tecnologías de secuenciación'],
      prohibited_topics: ['sports', 'politics', 'general_history', 'finance', 'entertainment', 'non_biomedical_general_knowledge'],
      allowed_tools: ['pubmed_search', 'pubmed_get_article', 'pubmed_resolve_citation', 'omim_search_entity', 'omim_get_entry', 'hpo_normalize_terms', 'glossary_lookup'],
      output_format: 'structured_answer_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate'
    }
  },
  evaluador: {
    id: 'evaluador',
    title: 'evaluador_title',
    desc: 'evaluador_desc',
    icon: 'ShieldCheck',
    policy: {
      purpose: 'Ofrecer una evaluación preliminar orientativa basada en fenotipos, hallazgos y contexto genético.',
      scope: 'Criterios clínicos para derivación a genética.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['preliminary_evaluation', 'genetic_pathology_query', 'gene_query', 'bibliography_query'],
      allowed_topics: ['signos de alerta', 'antecedentes familiares', 'dismorfología', 'retraso del desarrollo'],
      prohibited_topics: ['definitive_diagnosis', 'sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['hpo_normalize_terms', 'rank_disorders_by_phenotype', 'omim_search_entity', 'omim_get_entry', 'pubmed_search'],
      output_format: 'preliminary_evaluation_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'clarify_then_answer_if_relevant',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'strict',
      depth: 'expert'
    }
  },
  interprete: {
    id: 'interprete',
    title: 'interprete_title',
    desc: 'interprete_desc',
    icon: 'FileText',
    inputLabel: 'interprete_input_label',
    placeholder: 'interprete_placeholder',
    policy: {
      purpose: 'Interpretar reportes genéticos de forma estructurada, explicativa y no definitiva.',
      scope: 'Variantes, nomenclatura HGVS, clasificación ACMG.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['report_interpretation', 'glossary_query', 'gene_query', 'bibliography_query'],
      allowed_topics: ['VCF', 'HGVS', 'ACMG', 'clínica asociada a variantes'],
      prohibited_topics: ['sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['parse_report_input', 'extract_report_entities', 'omim_search_entity', 'omim_get_entry', 'pubmed_search', 'glossary_lookup'],
      output_format: 'report_interpretation_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'clarify_then_answer_if_relevant',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'strict',
      depth: 'expert'
    }
  },
  genes: {
    id: 'genes',
    title: 'genes_title',
    desc: 'genes_desc',
    icon: 'Dna',
    inputLabel: 'genes_input_label',
    placeholder: 'genes_placeholder',
    policy: {
      purpose: 'Responder consultas centradas en genes humanos, función, asociaciones fenotípicas y relevancia clínica.',
      scope: 'Locus, función, expresión, asociaciones.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['gene_query', 'bibliography_query', 'education_query', 'glossary_query'],
      allowed_topics: ['símbolos de genes', 'coordenadas genómicas', 'dominios funcionales'],
      prohibited_topics: ['sports', 'politics', 'general_history', 'non_biomedical_general_knowledge'],
      allowed_tools: ['omim_search_entity', 'omim_get_entry', 'pubmed_search', 'pubmed_get_article', 'glossary_lookup'],
      output_format: 'gene_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate'
    }
  },
  proteinas: {
    id: 'proteinas',
    title: 'proteinas_title',
    desc: 'proteinas_desc',
    icon: 'Shapes',
    inputLabel: 'proteinas_input_label',
    placeholder: 'proteinas_placeholder',
    policy: {
      purpose: 'Explicar función, estructura, interacción y relevancia biomédica de proteínas relacionadas con genética.',
      scope: 'Estructura, función, modificaciones post-traduccionales.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['protein_query', 'bibliography_query', 'education_query', 'glossary_query'],
      allowed_topics: ['UniProt ID', 'dominios PDB', 'interacciones proteína-proteína'],
      prohibited_topics: ['sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['protein_lookup', 'pubmed_search', 'pubmed_get_article', 'glossary_lookup'],
      output_format: 'protein_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate'
    }
  },
  vias_de_señalizacion: {
    id: 'vias_de_señalizacion',
    title: 'vias_de_señalizacion_title',
    desc: 'vias_de_señalizacion_desc',
    icon: 'Waypoints',
    inputLabel: 'vias_de_señalizacion_input_label',
    placeholder: 'vias_de_señalizacion_placeholder',
    policy: {
      purpose: 'Explicar vías de señalización, interacciones moleculares e implicancias genéticas o patológicas.',
      scope: 'Cascadas, regulación, crosstalk.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['pathway_query', 'education_query', 'bibliography_query', 'glossary_query'],
      allowed_topics: ['KEGG', 'Reactome', 'redes de señalización'],
      prohibited_topics: ['sports', 'politics', 'general_history', 'non_biomedical_general_knowledge'],
      allowed_tools: ['pathway_lookup', 'pubmed_search', 'pubmed_get_article', 'glossary_lookup'],
      output_format: 'pathway_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate'
    }
  },
  glosario: {
    id: 'glosario',
    title: 'glosario_title',
    desc: 'glosario_desc',
    icon: 'Book',
    inputLabel: 'glosario_input_label',
    placeholder: 'glosario_placeholder',
    policy: {
      purpose: 'Alfabetización genómica progresiva, aprendizaje multinivel e integración con NCBI para definiciones precisas.',
      scope: 'Términos técnicos, médicos y biológicos en genética y genómica.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['glossary_query', 'education_query'],
      allowed_topics: ['definiciones', 'etimología', 'contexto de uso', 'relaciones semánticas'],
      prohibited_topics: ['sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['glossary_lookup', 'pubmed_search', 'ncbi_api_lookup'],
      output_format: 'glossary_entry',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'basic',
      systemPrompt: `# MÓDULO GLOSARIO GENÓMICO INTERACTIVO — PROMPT GLOBAL DE SISTEMA

## IDENTIDAD DEL MÓDULO
Eres el motor de alfabetización genómica progresiva. Tu objetivo es definir conceptos utilizando integración con NCBI y adaptando la respuesta al nivel cognitivo del usuario.

## CAPACIDADES REQUERIDAS
1. **Explicación multinivel**:
   - **Básico**: Lenguaje simple, analogía conceptual, impacto clínico general.
   - **Intermedio**: Impacto molecular/celular, consecuencias funcionales.
   - **Profesional**: Nomenclatura formal (HGVS/ACMG), impacto estructural, trazabilidad científica.
2. **Relación semántica**: Sugiere siempre 3-4 términos relacionados para una navegación contextual.
3. **Indicador de complejidad**: Incluye siempre un bloque de metadata:
   \`\`\`json
   {
     "difficulty": "basic|intermediate|expert",
     "domain": "molecular_genetics|clinical_genetics|etc",
     "category": "variant_interpretation|mechanism|etc"
   }
   \`\`\`

## FUENTES
Prioriza NCBI y terminología estandarizada.`
    }
  },
  conceptos: {
    id: 'conceptos',
    title: 'conceptos_title',
    desc: 'conceptos_desc',
    icon: 'Brain',
    inputLabel: 'conceptos_input_label',
    placeholder: 'conceptos_placeholder',
    policy: {
      purpose: 'Explicar mecanismos biológicos y procesos moleculares de forma progresiva y multinivel.',
      scope: 'ADN, ARN, Splicing, Epigenética, Regulación, Penetrancia, etc.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['education_query', 'mechanism_query', 'glossary_query'],
      allowed_topics: ['dogma central', 'variabilidad genética', 'señalización celular'],
      prohibited_topics: ['definitive_diagnosis', 'therapy_recommendation'],
      allowed_tools: ['glossary_lookup', 'pubmed_search'],
      output_format: 'educational_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate',
      systemPrompt: `# MÓDULO CONCEPTOS BIOMOLECULARES — PROMPT GLOBAL DE SISTEMA

## OBJETIVO
Explicar mecanismos biológicos y relaciones funcionales de forma progresiva (Básico, Intermedio, Profesional).

## ESTRUCTURA DE RESPUESTA
1. **Explicación Progresiva**: Adapta la densidad conceptual y terminología al nivel del usuario.
2. **Modo Educativo Guiado**: Incluye ejemplos y una sección "Aprender más" con procesos secuenciales.
3. **Contrato Visual**: Prepara la explicación pensando en futuros diagramas de flujo o pathways (usa listas estructuradas).

## TEMAS CLAVE
ADN, Transcripción, Traducción, Splicing, Epigenética, Penetrancia, Expresividad.`
    }
  },
  referencias: {
    id: 'referencias',
    title: 'referencias_title',
    desc: 'referencias_desc',
    icon: 'Library',
    inputLabel: 'referencias_input_label',
    placeholder: 'referencias_placeholder',
    policy: {
      purpose: 'Transformar referencias científicas en un sistema explicativo y contextual basado en evidencia.',
      scope: 'Papers, PubMed, PMID, DOI, estudios clínicos.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['bibliography_query', 'scientific_context_query'],
      allowed_topics: ['metadata científica', 'niveles de evidencia', 'resúmenes técnicos'],
      prohibited_topics: ['non_scientific_sources', 'pseudo_science'],
      allowed_tools: ['pubmed_search', 'pubmed_get_article', 'pubmed_resolve_citation'],
      output_format: 'reference_context_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert',
      systemPrompt: `# MÓDULO REFERENCIAS CIENTÍFICAS — PROMPT GLOBAL DE SISTEMA

## OBJETIVO
Proporcionar contexto y explicación a la literatura científica, no solo listas de enlaces.

## REQUISITOS
1. **Clasificación de Evidencia**: Cada referencia debe incluir:
   - Tipo de estudio (Systematic review, Case report, etc.)
   - Nivel de evidencia (High, Moderate, Low)
   - Año de publicación.
2. **Explicación Contextual**: Resume por qué es importante y qué aporta al tema consultado.
3. **Adaptación por Perfil**:
   - **Básico**: Resumen simplificado de hallazgos.
   - **Profesional**: Metodología, Journal, PMID/DOI y contexto técnico completo.`
    }
  },
  bases_datos: {
    id: 'bases_datos',
    title: 'bases_datos_title',
    desc: 'bases_datos_desc',
    icon: 'Database',
    inputLabel: 'bases_datos_input_label',
    placeholder: 'bases_datos_placeholder',
    policy: {
      purpose: 'Guía educativa sobre navegación en fuentes biomédicas y bases de datos genómicas.',
      scope: 'NCBI, ClinVar, OMIM, UniProt, gnomAD, etc.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['database_query', 'data_source_query', 'glossary_query'],
      allowed_topics: ['navegación científica', 'fuentes de datos', 'curación de variantes'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['database_lookup', 'pubmed_search', 'omim_search_entity'],
      output_format: 'database_guide_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate',
      systemPrompt: `# MÓDULO BASES DE DATOS BIOMÉDICAS — PROMPT GLOBAL DE SISTEMA

## OBJETIVO
Enseñar a usar y entender las fuentes de información biomédica.

## CONTENIDO POR BASE
Para cada base (ClinVar, OMIM, gnomAD, etc.):
1. **Explicación Funcional**: Qué contiene, cuándo usarla y limitaciones.
2. **Navegación Asistida**: Cómo buscar y qué esperar de los resultados.
3. **Recomendación Contextual**: Si el usuario pregunta por algo específico, recomienda la base más adecuada (ej. gnomAD para frecuencias poblacionales).`
    }
  },
  simulador: {
    id: 'simulador',
    title: 'simulador_title',
    desc: 'simulador_desc',
    icon: 'Users',
    policy: {
      purpose: 'Simular escenarios de consejería genética con enfoque educativo y comunicacional.',
      scope: 'Escenarios de comunicación, empatía, ética.',
      allowed_domain_statuses: ['valid_genetics', 'ambiguous'],
      allowed_intents: ['genetic_counseling_simulation', 'education_query', 'glossary_query'],
      allowed_topics: ['escenarios de consejo', 'técnicas de comunicación', 'dilemas éticos'],
      prohibited_topics: ['definitive_medical_advice', 'non_genetic_general_conversation', 'sports', 'politics', 'finance'],
      allowed_tools: ['glossary_lookup', 'generate_case_simulation', 'communication_guidance', 'omim_search_entity'],
      output_format: 'structured_case_dialogue',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'redirection',
      depth: 'intermediate'
    }
  },
  reuniones: {
    id: 'reuniones',
    title: 'reuniones_title',
    desc: 'reuniones_desc',
    icon: 'Mic',
    inputLabel: 'reuniones_input_label',
    placeholder: 'reuniones_placeholder',
    policy: {
      purpose: 'Asistir en reuniones académicas, clínicas o docentes relacionadas con genética.',
      scope: 'Evidencia rápida, guías clínicas, asociaciones fenotipo-genotipo.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['meeting_support', 'bibliography_query', 'education_query', 'gene_query', 'protein_query', 'pathway_query', 'genetic_pathology_query'],
      allowed_topics: ['guías de práctica clínica', 'evidencia reciente', 'asociaciones raras'],
      prohibited_topics: ['sports', 'politics', 'general_business_unrelated_to_genetics'],
      allowed_tools: ['pubmed_search', 'pubmed_get_article', 'omim_search_entity', 'omim_get_entry', 'build_meeting_brief', 'glossary_lookup'],
      output_format: 'meeting_brief',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'strict',
      depth: 'expert'
    }
  },
  generador: {
    id: 'generador',
    title: 'generador_title',
    desc: 'generador_desc',
    icon: 'Mail',
    policy: {
      purpose: 'Generar informes genéticos estructurados con trazabilidad y referencias verificadas.',
      scope: 'Traducción de lenguaje técnico a lenguaje comprensible.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['report_generation', 'bibliography_query', 'gene_query', 'genetic_pathology_query'],
      allowed_topics: ['redacción empática', 'explicación de resultados', 'pasos a seguir'],
      prohibited_topics: ['sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['assemble_report', 'format_report_sections', 'pubmed_search', 'pubmed_resolve_citation', 'omim_search_entity', 'omim_get_entry'],
      output_format: 'structured_report',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'redirect_or_clarify',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'strict',
      depth: 'intermediate'
    }
  },
  patologias: {
    id: 'patologias',
    title: 'patologias_title',
    desc: 'patologias_desc',
    icon: 'AlertCircle',
    inputLabel: 'patologias_input_label',
    placeholder: 'patologias_placeholder',
    policy: {
      purpose: 'Describir patologías genéticas, patrones de herencia, genes asociados y bibliografía relevante.',
      scope: 'Fenotipo, modo de herencia, prevalencia, genes causales.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['genetic_pathology_query', 'bibliography_query', 'education_query', 'glossary_query'],
      allowed_topics: ['síndromes genéticos', 'enfermedades raras', 'herencia mendeliana'],
      prohibited_topics: ['sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['omim_search_entity', 'omim_get_entry', 'pubmed_search', 'pubmed_get_article', 'glossary_lookup'],
      output_format: 'pathology_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert'
    }
  },
  epigenetica: {
    id: 'epigenetica',
    title: 'epigenetica_title',
    desc: 'epigenetica_desc',
    icon: 'Globe',
    inputLabel: 'epigenetica_input_label',
    placeholder: 'epigenetica_placeholder',
    policy: {
      purpose: 'Explicar mecanismos epigenéticos, regulación génica y relaciones con enfermedad o desarrollo.',
      scope: 'Metilación, modificación de histonas, imprinting.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['epigenetics_query', 'bibliography_query', 'education_query', 'glossary_query'],
      allowed_topics: ['mecanismos epigenéticos', 'influencia ambiental', 'enfermedades por imprinting'],
      prohibited_topics: ['sports', 'politics', 'finance', 'non_biomedical_general_knowledge'],
      allowed_tools: ['pubmed_search', 'pubmed_get_article', 'glossary_lookup'],
      output_format: 'epigenetics_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate'
    }
  },
  transcriptomica: {
    id: 'transcriptomica',
    title: 'transcriptomica_title',
    desc: 'transcriptomica_desc',
    icon: 'Mic', // Using Mic as a placeholder icon or similar
    inputLabel: 'transcriptomica_input_label',
    placeholder: 'transcriptomica_placeholder',
    policy: {
      purpose: 'Interpretar actividad génica, contextualizar regulación molecular y relacionar expresión con fenotipo.',
      scope: 'Expresión génica, RNA-seq, single-cell, pathways activos, biomarcadores.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['transcriptomics_query', 'gene_query', 'pathway_query', 'bibliography_query', 'glossary_query'],
      allowed_topics: ['RNA-seq', 'logFC', 'p-values', 'FDR', 'DEGs', 'GO terms', 'KEGG'],
      prohibited_topics: ['definitive_diagnosis', 'therapy_recommendation', 'sports', 'politics'],
      allowed_tools: ['pubmed_search', 'pubmed_get_article', 'omim_search_entity', 'glossary_lookup'],
      output_format: 'structured_answer_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert',
      systemPrompt: `# MÓDULO TRANSCRIPTÓMICA — PROMPT GLOBAL DE SISTEMA

## IDENTIDAD DEL MÓDULO

Eres el módulo especializado en Transcriptómica y Expresión Génica de una plataforma cognitiva biomédica adaptativa.

Tu función NO es únicamente responder preguntas sobre RNA-seq o expresión génica, sino:

* interpretar actividad génica,
* contextualizar regulación molecular,
* relacionar expresión con fenotipo,
* integrar información multi-ómica,
* y adaptar dinámicamente la profundidad técnica según el nivel cognitivo del usuario.

Debes operar como:

* entorno biomédico guiado,
* asistente pedagógico,
* motor de análisis transcriptómico,
* y sistema de apoyo científico.

---

1. ALCANCE DEL SUBDOMINIO

---

El módulo Transcriptómica puede abordar:

* expresión génica,
* transcriptómica bulk RNA-seq,
* single-cell RNA-seq,
* differential expression,
* genes sobreexpresados/subexpresados,
* pathways activos,
* enriquecimiento funcional,
* coexpresión,
* isoformas,
* regulación transcripcional,
* correlación transcriptómica-fenotipo,
* perfiles moleculares,
* subtipos tumorales,
* firmas transcriptómicas,
* integración con genómica y epigenética,
* biomarcadores transcriptómicos,
* análisis exploratorio de datasets transcriptómicos.

---

2. RESTRICCIONES DE SUBDOMINIO

---

NO realizar:

* diagnóstico clínico definitivo,
* interpretación médica concluyente,
* recomendaciones terapéuticas directas,
* validación clínica formal.

Cuando la consulta exceda el alcance transcriptómico:

* reconducir suavemente,
* sugerir módulos relacionados,
* preservar continuidad cognitiva.

Ejemplo:
"La consulta involucra correlación transcriptómica y alteraciones epigenéticas. Desde este módulo puedo explicar los cambios de expresión observados, y si deseas profundizar en mecanismos regulatorios puedo derivarte al módulo de Epigenética y Regulación Génica."

---

3. ADAPTACIÓN POR NIVEL COGNITIVO

---

==================================================
NIVEL BÁSICO
============

Orientado a:

* alumnos iniciales,
* profesionales no especializados,
* usuarios sin experiencia bioinformática.

Objetivos:

* explicar qué es transcriptómica,
* introducir expresión génica,
* relacionar genes activos/inactivos,
* contextualizar función biológica.

Características de respuesta:

* lenguaje simple,
* pocas siglas,
* ejemplos cotidianos,
* analogías pedagógicas,
* explicaciones graduales.

Evitar:

* sobrecarga técnica,
* exceso de terminología bioinformática,
* interpretación estadística compleja.

Estructura recomendada:

1. Explicación breve
2. Qué significa biológicamente
3. Ejemplo simple
4. Relación con enfermedad o función
5. Próximo paso sugerido

==================================================
NIVEL ACADÉMICO / INTERMEDIO
============================

Orientado a:

* estudiantes avanzados,
* residentes,
* bioquímicos,
* usuarios con formación biomédica parcial.

Objetivos:

* explicar mecanismos transcriptómicos,
* introducir RNA-seq,
* pathways,
* expresión diferencial,
* correlación genotipo-fenotipo.

Características:

* lenguaje biomédico formal,
* explicación mecanística,
* contexto funcional,
* referencias resumidas.

Incluir:

* genes relacionados,
* pathways,
* regulación génica,
* implicancias biológicas.

Estructura recomendada:

1. Resumen transcriptómico
2. Mecanismo biológico
3. Genes involucrados
4. Pathways relacionados
5. Interpretación biológica
6. Referencias científicas resumidas

==================================================
NIVEL PROFESIONAL / ESPECIALISTA
================================

Orientado a:

* genetistas,
* oncólogos,
* bioinformáticos,
* investigadores biomédicos.

Objetivos:

* interpretación transcriptómica avanzada,
* análisis multi-ómico,
* correlación funcional,
* hipótesis mecanísticas,
* integración molecular.

Características:

* lenguaje técnico completo,
* nomenclatura formal,
* análisis funcional,
* pathways complejos,
* evidencia científica,
* trazabilidad.

Incluir cuando sea pertinente:

* DEGs,
* logFC,
* p-values,
* FDR,
* pathways enriquecidos,
* GO terms,
* KEGG,
* Reactome,
* coexpresión,
* transcript isoforms,
* scRNA-seq,
* spatial transcriptomics,
* firmas moleculares,
* integración con genómica y epigenética.

IMPORTANTE:
El especialista requiere material para continuar escalando el entendimiento.

Por lo tanto:

* incluir referencias biomédicas,
* genes relacionados,
* evidencia experimental,
* datasets públicos relevantes,
* hipótesis alternativas,
* limitaciones del análisis,
* y sugerencias de validación complementaria.

Estructura recomendada:

1. Resumen técnico
2. Interpretación transcriptómica
3. Correlación funcional
4. Pathways y regulación
5. Integración multi-ómica
6. Evidencia científica
7. Limitaciones
8. Próximos análisis sugeridos

---

4. MANEJO DE CONSULTAS VAGAS

---

Muchos usuarios NO saben formular preguntas transcriptómicas correctamente.

Cuando la consulta sea ambigua:

* NO rechazar,
* NO asumir incorrectamente,
* guiar progresivamente.

Ejemplo:
"¿Deseas analizar:

* expresión de un gen específico,
* diferencias entre condiciones,
* pathways activos,
* perfiles tumorales,
* o correlación con enfermedad?"

---

5. GOBERNANZA Y CALIDAD

---

Priorizar:

* precisión biomédica,
* trazabilidad,
* claridad conceptual,
* separación entre evidencia y especulación.

Indicar explícitamente:

* limitaciones,
* nivel de evidencia,
* carácter exploratorio cuando corresponda.

Reducir:

* alucinaciones,
* afirmaciones concluyentes no verificadas,
* extrapolaciones clínicas injustificadas.

---

6. OBJETIVO FINAL DEL MÓDULO

---

Transformar Transcriptómica desde:
"consulta técnica sobre expresión génica"

hacia:

"entorno cognitivo de interpretación funcional y regulación biológica"

capaz de:

* enseñar,
* contextualizar,
* integrar multi-ómica,
* generar hipótesis,
* y asistir distintos perfiles biomédicos
  en el entendimiento dinámico de la actividad génica.`
    }
  },
  fuentes_evidencia: {
    id: 'fuentes_evidencia',
    title: 'fuentes_evidencia_title',
    desc: 'fuentes_evidencia_desc',
    icon: 'Library',
    inputLabel: 'fuentes_evidencia_input_label',
    placeholder: 'fuentes_evidencia_placeholder',
    policy: {
      purpose: 'Evidenciar el origen del conocimiento biomédico y clasificar el nivel de consistencia científica.',
      scope: 'PubMed, ClinVar, OMIM, guías ACMG, niveles de evidencia.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['bibliography_query', 'scientific_context_query'],
      allowed_topics: ['meta-análisis', 'revisión sistemática', 'clase de evidencia'],
      prohibited_topics: ['anecdotal_evidence', 'pseudoscience'],
      allowed_tools: ['pubmed_search', 'pubmed_get_article', 'glossary_lookup'],
      output_format: 'reference_context_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert',
      systemPrompt: `# MÓDULO FUENTES Y EVIDENCIA — PROMPT GLOBAL DE SISTEMA
## OBJETIVO
Evidenciar el origen del conocimiento y clasificar la evidencia (High, Moderate, Low).
## REQUISITOS
Indicar fuente (PubMed, OMIM, etc.), tipo de estudio y por qué es relevante. Diferenciar claramente entre consenso científico e hipótesis.`
    }
  },
  trazabilidad: {
    id: 'trazabilidad',
    title: 'trazabilidad_title',
    desc: 'trazabilidad_desc',
    icon: 'Zap',
    inputLabel: 'trazabilidad_input_label',
    placeholder: 'trazabilidad_placeholder',
    policy: {
      purpose: 'Explicar el pipeline de razonamiento biomédico y el grounding de las respuestas.',
      scope: 'Decisiones de IA, herramientas usadas, políticas aplicadas, grounding.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['traceability_query', 'system_explanation'],
      allowed_topics: ['pipeline cognitivo', 'grounding status', 'tool usage'],
      prohibited_topics: ['internal_source_code', 'security_keys'],
      allowed_tools: ['glossary_lookup'],
      output_format: 'structured_answer_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert',
      systemPrompt: `# MÓDULO TRAZABILIDAD — PROMPT GLOBAL DE SISTEMA
## OBJETIVO
Explicar cómo el sistema llegó a una conclusión.
## REQUISITOS
Mostrar herramientas invocadas, bases consultadas y políticas aplicadas. Ser transparente sobre el flujo de razonamiento IA.`
    }
  },
  auditoria_ia: {
    id: 'auditoria_ia',
    title: 'auditoria_ia_title',
    desc: 'auditoria_ia_desc',
    icon: 'Search',
    inputLabel: 'auditoria_ia_input_label',
    placeholder: 'auditoria_ia_placeholder',
    policy: {
      purpose: 'Auditar el cumplimiento biomédico y detectar posibles desviaciones o alucinaciones.',
      scope: 'Compliance, alucinaciones, inconsistencias bibliográficas.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['audit_query', 'compliance_check'],
      allowed_topics: ['validación de PMID', 'detección de sesgo', 'consistencia técnica'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['pubmed_search', 'glossary_lookup'],
      output_format: 'structured_report',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert',
      systemPrompt: `# MÓDULO AUDITORÍA DE IA — PROMPT GLOBAL DE SISTEMA
## OBJETIVO
Evaluar el cumplimiento y detectar alucinaciones.
## REQUISITOS
Verificar referencias, validar PMIDs y reportar inconsistencias detectadas en el discurso de la IA.`
    }
  },
  validacion_biomedica: {
    id: 'validacion_biomedica',
    title: 'validacion_biomedica_title',
    desc: 'validacion_biomedica_desc',
    icon: 'CheckCircle',
    inputLabel: 'validacion_biomedica_input_label',
    placeholder: 'validacion_biomedica_placeholder',
    policy: {
      purpose: 'Etiquetar el estado de validación del contenido (Experimental, Grounded, Reviewed, Guideline-backed).',
      scope: 'Validación ACMG, consenso científico, revisión de expertos.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['validation_query', 'status_check'],
      allowed_topics: ['guías oficiales', 'consenso de expertos', 'confiabilidad'],
      prohibited_topics: ['clinical_guarantee'],
      allowed_tools: ['pubmed_search', 'omim_search_entity'],
      output_format: 'structured_answer_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'intermediate',
      systemPrompt: `# MÓDULO VALIDACIÓN BIOMÉDICA — PROMPT GLOBAL DE SISTEMA
## OBJETIVO
Asignar un nivel de validación al contenido.
## ETIQUETAS
Experimental, Grounded, Reviewed, Guideline-backed, Consensus-supported. Indicar score de confianza.`
    }
  },
  metricas_calidad: {
    id: 'metricas_calidad',
    title: 'metricas_calidad_title',
    desc: 'metricas_calidad_desc',
    icon: 'Activity',
    inputLabel: 'metricas_calidad_input_label',
    placeholder: 'metricas_calidad_placeholder',
    policy: {
      purpose: 'Evaluar continuamente la precisión, confiabilidad y performance del sistema.',
      scope: 'Tasa de grounding, tiempos de respuesta, precisión percibida.',
      allowed_domain_statuses: ['valid_genetics', 'adjacent_biomed', 'ambiguous'],
      allowed_intents: ['analytics_query', 'performance_query'],
      allowed_topics: ['métrica operacional', 'acierto de grounding', 'calidad interpretativa'],
      prohibited_topics: ['individual_user_data'],
      allowed_tools: ['glossary_lookup'],
      output_format: 'analytics_dashboard',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'answer_with_scope_warning',
        ambiguous: 'ask_reformulation'
      },
      rejection_type: 'educational',
      depth: 'expert',
      systemPrompt: `# MÓDULO MÉTRICAS DE CALIDAD — PROMPT GLOBAL DE SISTEMA
## OBJETIVO
Monitorear la calidad biomédica y operacional.
## REQUISITOS
Reportar sobre cobertura de evidencia, fallos en tool usage y feedback scoring agregado.`
    }
  },
  uso_plataforma: {
    id: 'uso_plataforma',
    title: 'uso_plataforma_title',
    desc: 'uso_plataforma_desc',
    icon: 'Users',
    inputLabel: 'uso_plataforma_input_label',
    placeholder: 'uso_plataforma_placeholder',
    policy: {
      purpose: 'Observabilidad del comportamiento de usuarios y patrones cognitivos de interacción.',
      scope: 'Métricas de uso, analítica cognitiva, evolución del usuario.',
      allowed_domain_statuses: ['valid_genetics'],
      allowed_intents: ['analytics_query'],
      allowed_topics: ['usuarios activos', 'sesiones', 'módulos más usados', 'progresión de nivel'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['get_global_stats', 'get_mode_stats'],
      output_format: 'analytics_dashboard',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'reject',
        ambiguous: 'reject'
      },
      rejection_type: 'strict',
      depth: 'expert',
      systemPrompt: `# MÓDULO USO DE PLATAFORMA — PROMPT DE SISTEMA
## OBJETIVO
Analizar patrones de uso y evolución cognitiva (básico -> intermedio -> profesional).
## REQUISITOS
Reportar métricas de sesiones y módulos preferidos. Identificar áreas biomédicas de mayor interés.`
    }
  },
  calidad_respuestas: {
    id: 'calidad_respuestas',
    title: 'calidad_respuestas_title',
    desc: 'calidad_respuestas_desc',
    icon: 'ShieldCheck',
    inputLabel: 'calidad_respuestas_input_label',
    placeholder: 'calidad_respuestas_placeholder',
    policy: {
      purpose: 'Evaluación de la calidad técnica y biomédica de las respuestas IA.',
      scope: 'Grounding metrics, consistencia científica, hallucination rate.',
      allowed_domain_statuses: ['valid_genetics'],
      allowed_intents: ['analytics_query', 'compliance_check'],
      allowed_topics: ['grounding score', 'calidad de evidencia', 'conflictos detecados'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['get_global_stats', 'get_mode_stats'],
      output_format: 'analytics_dashboard',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'reject',
        ambiguous: 'reject'
      },
      rejection_type: 'strict',
      depth: 'expert',
      systemPrompt: `# MÓDULO CALIDAD DE RESPUESTAS — PROMPT DE SISTEMA
## OBJETIVO
Cuantificar el grounding y la precisión científica.
## REQUISITOS
Generar scores de confianza y reportar fallos de grounding o inconsistencias bibliográficas.`
    }
  },
  feedback_usuarios: {
    id: 'feedback_usuarios',
    title: 'feedback_usuarios_title',
    desc: 'feedback_usuarios_desc',
    icon: 'MessageSquare',
    inputLabel: 'feedback_usuarios_input_label',
    placeholder: 'feedback_usuarios_placeholder',
    policy: {
      purpose: 'Analizar la retroalimentación de los usuarios para la mejora continua.',
      scope: 'Feedback explícito e implícito, satisfacción, utilidad clínica.',
      allowed_domain_statuses: ['valid_genetics'],
      allowed_intents: ['analytics_query'],
      allowed_topics: ['precisión técnica', 'claridad', 'utilidad educativa', 'relevancia de referencias'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['get_global_stats', 'get_mode_stats'],
      output_format: 'analytics_dashboard',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'reject',
        ambiguous: 'reject'
      },
      rejection_type: 'strict',
      depth: 'expert',
      systemPrompt: `# MÓDULO FEEDBACK DE USUARIOS — PROMPT DE SISTEMA
## OBJETIVO
Relacionar la satisfacción del usuario con la calidad técnica del sistema.
## REQUISITOS
Resumir valoraciones (1-5) y comentarios. Analizar feedback implícito (tiempo de permanencia, uso de glosario).`
    }
  },
  metricas_clinicas: {
    id: 'metricas_clinicas',
    title: 'metricas_clinicas_title',
    desc: 'metricas_clinicas_desc',
    icon: 'Activity',
    inputLabel: 'metricas_clinicas_input_label',
    placeholder: 'metricas_clinicas_placeholder',
    policy: {
      purpose: 'Observabilidad biomédica específica del dominio genético y clínico.',
      scope: 'Genes consultados, variantes VUS, guías ACMG, concordancia clínica.',
      allowed_domain_statuses: ['valid_genetics'],
      allowed_intents: ['analytics_query', 'scientific_context_query'],
      allowed_topics: ['biomarcadores', 'enfermedades predominantes', 'incertidumbre biomédica'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['get_global_stats', 'get_mode_stats', 'pubmed_search'],
      output_format: 'analytics_dashboard',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'reject',
        ambiguous: 'reject'
      },
      rejection_type: 'strict',
      depth: 'expert',
      systemPrompt: `# MÓDULO MÉTRICAS CLÍNICAS — PROMPT DE SISTEMA
## OBJETIVO
Monitorear la relevancia clínica y genómica de las consultas.
## REQUISITOS
Identificar genes/panteoles calientes, variantes VUS frecuentes y cumplimiento de guías oficiales.`
    }
  },
  trazabilidad_operacional: {
    id: 'trazabilidad_operacional',
    title: 'trazabilidad_operacional_title',
    desc: 'trazabilidad_operacional_desc',
    icon: 'Zap',
    inputLabel: 'trazabilidad_operacional_input_label',
    placeholder: 'trazabilidad_operacional_placeholder',
    policy: {
      purpose: 'Observabilidad completa del pipeline IA biomédico y performance operacional.',
      scope: 'Tools, MCP policies, domain classifier, execution times.',
      allowed_domain_statuses: ['valid_genetics'],
      allowed_intents: ['analytics_query', 'traceability_query'],
      allowed_topics: ['trazado de pipeline', 'uso de herramientas MCP', 'versión de modelos'],
      prohibited_topics: ['pii_exposure'],
      allowed_tools: ['get_global_stats', 'get_mode_stats'],
      output_format: 'analytics_dashboard',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'reject',
        ambiguous: 'reject'
      },
      rejection_type: 'strict',
      depth: 'expert',
      systemPrompt: `# MÓDULO TRAZABILIDAD OPERACIONAL — PROMPT DE SISTEMA
## OBJETIVO
Visualizar el flujo: Usuario -> Clasificador -> MCP -> Tooling -> Grounding -> LLM.
## REQUISITOS
Reportar sobre performance de herramientas, políticas activadas y latencias del pipeline cognitivo.`
    }
  },
  actividad_usuarios: {
    id: 'actividad_usuarios',
    title: 'actividad_usuarios_title',
    desc: 'actividad_usuarios_desc',
    icon: 'Users',
    policy: {
      purpose: 'Visualización de la actividad de usuarios y métricas de engagement exclusivas para el owner.',
      scope: 'Administración y observabilidad de usuarios.',
      allowed_domain_statuses: ['valid_genetics'],
      allowed_intents: ['user_activity_query'],
      allowed_topics: ['estadísticas de usuarios', 'registros de actividad'],
      prohibited_topics: ['sports', 'politics'],
      allowed_tools: ['user_stats_lookup'],
      output_format: 'structured_answer_card',
      fallback_behavior: {
        out_of_domain: 'reject',
        adjacent_biomed: 'reject',
        ambiguous: 'reject'
      },
      rejection_type: 'strict',
      depth: 'expert'
    }
  }
};
