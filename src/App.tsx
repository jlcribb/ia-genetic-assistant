import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { domToPng, domToJpeg } from 'modern-screenshot';
import { 
  MessageSquare, ShieldCheck, FileText, Dna, Shapes, Waypoints, 
  Book, Users, Mic, Mail, Menu, X, Printer, Image as ImageIcon, 
  FileImage, GraduationCap, LogIn, LogOut, History, Globe, 
  ChevronRight, ChevronDown, Loader2, Sparkles, AlertCircle, BarChart3, Star, ThumbsUp, ThumbsDown,
  Info, Trash2
} from 'lucide-react';
import { cn, parseAIResponse } from './lib/utils';
import { Language, Theme, Module, Provider, ContextMode, ContextConfig } from './types';
import { I18N, SIDEBAR_STRUCTURE, MODULES } from './constants';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, User, Timestamp,
  handleFirestoreError, OperationType
} from './firebase';
import { generateResponse } from './services/ai';
import { orchestrator } from './services/orchestrator';
import { 
  submitFeedback, getUserFeedbackStats, getModeFeedbackStats, getGlobalFeedbackStats, 
  getFeedbackForResponse, resetAllFeedbackData 
} from './services/feedbackService';
import { StructuredResponse, StructuredSection } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const ICON_MAP: Record<string, any> = {
  MessageSquare, ShieldCheck, FileText, Dna, Shapes, Waypoints, 
  Book, Users, Mic, Mail, AlertCircle, Globe, BarChart3
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Algo salió mal. Por favor, intenta recargar la página.";
      let details = "";

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Error de base de datos (${parsed.operationType}): ${parsed.error}`;
            details = JSON.stringify(parsed.authInfo, null, 2);
          }
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-4">
          <div className="bg-secondary p-8 rounded-3xl shadow-xl border border-border max-w-lg w-full">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Error del Sistema</h2>
            </div>
            <p className="text-secondary mb-6">{errorMessage}</p>
            {details && (
              <pre className="bg-primary/50 p-4 rounded-xl text-xs overflow-auto max-h-40 mb-6 font-mono">
                {details}
              </pre>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-active transition-colors"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<User | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState('asistente');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [structuredResponse, setStructuredResponse] = useState<StructuredResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [assessment, setAssessment] = useState('');
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Provider>('gemini');
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showMetricExplanation, setShowMetricExplanation] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [contextConfig, setContextConfig] = useState<ContextConfig>({
    mode: 'none',
    manualText: '',
    maxHistoryMessages: 5
  });
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const resetTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [inputValues, setInputValues] = useState<Record<string, any>>({});

  const outputRef = useRef<HTMLDivElement>(null);

  const handleResetClick = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      console.log('Reset: First stage confirmed. Waiting for final click.');
      // Autocancelar tras 5 segundos si no hay segundo clic
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
      resetTimeout.current = setTimeout(() => {
        setConfirmReset(false);
        console.log('Reset: Confirmation timed out.');
      }, 5000);
      return;
    }

    // Ejecutar reset real
    console.log('Reset: Final stage confirmed. Starting reset...');
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    setConfirmReset(false);
    setLoading(true);
    try {
      await resetAllFeedbackData();
      console.log('Reset: Complete SUCCESS');
      window.location.reload();
    } catch (e) {
      console.error('Reset: FAILED', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // Reset current state if user changes
      if (u?.uid !== user?.uid) {
        setStructuredResponse(null);
        setAssessment('');
        setLastResponseId(null);
        setFeedbackSubmitted(false);
        setAnalyticsData(null);
      }
      setUser(u);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'queries'),
        where('uid', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const path = 'queries';
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(docs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      return () => unsubscribe();
    } else {
      setHistory([]);
    }
  }, [user]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (currentModuleId === 'analytics' && user) {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const globalStats = await getGlobalFeedbackStats();
          const userStats = await getUserFeedbackStats(user.uid);
          setAnalyticsData({ global: globalStats, user: userStats });
        } catch (error) {
          console.error("Error fetching analytics:", error);
        } finally {
          setAnalyticsLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [currentModuleId, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleInputChange = (moduleId: string, field: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [`${moduleId}_${field}`]: value
    }));
  };

  const getInputValue = (moduleId: string, field: string) => {
    return inputValues[`${moduleId}_${field}`] || '';
  };

  const handleSubmit = async (providerOverride?: Provider) => {
    const providerToUse = providerOverride || activeProvider;
    setActiveProvider(providerToUse);
    const module = MODULES[currentModuleId];
    let input: any;

    if (currentModuleId === 'evaluador') {
      input = {
        clinicalSummary: getInputValue(currentModuleId, 'clinicalSummary'),
        familyHistory: getInputValue(currentModuleId, 'familyHistory')
      };
    } else if (currentModuleId === 'generador') {
      input = {
        clinicalData: getInputValue(currentModuleId, 'clinicalData'),
        molecularResult: getInputValue(currentModuleId, 'molecularResult')
      };
    } else if (currentModuleId === 'simulador') {
      input = {
        scenario: getInputValue(currentModuleId, 'scenario'),
        userMessage: getInputValue(currentModuleId, 'userMessage')
      };
    } else {
      input = getInputValue(currentModuleId, 'input');
    }

    if (!input || (typeof input === 'string' && !input.trim()) || (typeof input === 'object' && Object.values(input).some(v => !v))) {
      alert(I18N[lang].emptyInputError);
      return;
    }

    setLoading(true);
    setStructuredResponse(null);
    setAssessment('');
    setFeedbackSubmitted(false);
    setLastResponseId(null);

    // Context aggregation logic
    let finalContext = "";
    if (contextConfig.mode === 'manual') {
      finalContext = contextConfig.manualText || "";
    } else if (contextConfig.mode === 'session') {
      const relevantHistory = sessionHistory.slice(-contextConfig.maxHistoryMessages!);
      finalContext = relevantHistory.map(h => 
        `User in mode ${h.moduleId}: ${typeof h.input === 'string' ? h.input : JSON.stringify(h.input)}\nAssistant: ${h.summary}`
      ).join('\n---\n');
    } else if (contextConfig.mode === 'history') {
      const relevantHistory = history.slice(0, contextConfig.maxHistoryMessages!);
      finalContext = relevantHistory.map(h => 
        `User in mode ${h.moduleId}: ${typeof h.input === 'string' ? h.input : JSON.stringify(h.input)}\nAssistant: ${typeof h.response === 'string' ? JSON.parse(h.response).response_payload?.summary : ''}`
      ).join('\n---\n');
    }

    try {
      const result = await orchestrator.processQuery(currentModuleId, input, lang, providerToUse, finalContext);
      setStructuredResponse(result);
      
      const newEntry = {
        uid: user?.uid,
        moduleId: currentModuleId,
        input,
        response: JSON.stringify(result),
        summary: result.response_payload?.summary || "",
        provider: providerToUse,
        timestamp: new Date().toISOString()
      };

      setSessionHistory(prev => [...prev, newEntry]);

      if (user) {
        const path = 'queries';
        try {
          const docRef = await addDoc(collection(db, path), {
            uid: user.uid,
            moduleId: currentModuleId,
            input,
            response: JSON.stringify(result),
            provider: providerToUse,
            timestamp: serverTimestamp()
          });
          setLastResponseId(docRef.id);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } catch (error: any) {
      console.error("Orchestrator Error:", error);
      const message = error?.message || "Error processing query. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessment = async () => {
    const input = getInputValue(currentModuleId, 'input');
    if (!input.trim()) {
      alert(I18N[lang].emptyInputError);
      return;
    }

    setAssessmentLoading(true);
    const prompt = `Genera una autoevaluación en ${lang === 'es' ? 'español' : 'inglés'} sobre "${input}". Debe incluir:\n1. **10 preguntas multiple choice** con 4 opciones. Indica la respuesta correcta con un asterisco (*).\n2. **2 temas para investigar y desarrollar** con recomendaciones.\nFormatea las opciones de cada pregunta en una nueva línea y sin viñetas.`;
    const aiResponse = await generateResponse(prompt, activeProvider);
    setAssessment(aiResponse);
    setAssessmentLoading(false);
  };

  const exportImage = async (format: 'png' | 'jpeg') => {
    if (!outputRef.current || !structuredResponse) {
      alert(I18N[lang].exportAlert);
      return;
    }

    try {
      const bgColor = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
      const dataUrl = format === 'png' 
        ? await domToPng(outputRef.current, { scale: 2, backgroundColor: bgColor })
        : await domToJpeg(outputRef.current, { scale: 2, backgroundColor: bgColor });

      const link = document.createElement('a');
      link.download = `reporte_${currentModuleId}_${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Error exporting image. Please try again.");
    }
  };

  const handleFeedbackClick = async () => {
    if (!lastResponseId) return;
    
    const existing = await getFeedbackForResponse(lastResponseId);
    if (existing) {
      const confirmReplace = window.confirm(lang === 'es' ? 'Ya has enviado feedback para esta respuesta. ¿Deseas reemplazarlo con uno nuevo?' : 'You have already submitted feedback for this response. Do you want to replace it with a new one?');
      if (!confirmReplace) return;
      setExistingFeedback(existing);
    } else {
      setExistingFeedback(null);
    }
    setShowFeedback(true);
  };

  const printOutput = () => {
    if (!structuredResponse) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${I18N[lang].printTitle}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; }
            h1 { color: #2563eb; }
            .content { line-height: 1.6; }
            .disclaimer { color: #b91c1c; font-style: italic; margin-top: 2rem; }
            .section { margin-bottom: 2rem; }
            .section-title { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <h1>${I18N[lang][`${currentModuleId}_title`]}</h1>
          <div class="content">${outputRef.current?.innerHTML}</div>
          <p class="disclaimer">${I18N[lang].disclaimer}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderSection = (section: StructuredSection) => {
    return (
      <div key={section.title} className="mb-6">
        <h4 className="font-bold mb-2 flex items-center gap-2 text-primary border-b border-border pb-1">
          {section.title}
        </h4>
        <div className="prose prose-sm max-w-none text-secondary">
          <ReactMarkdown>{section.content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  const renderModuleInput = () => {
    const module = MODULES[currentModuleId];

    const content = (() => {
      switch (currentModuleId) {
        case 'evaluador':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang].evaluador_summary_label}</label>
                <textarea 
                  value={getInputValue(currentModuleId, 'clinicalSummary')}
                  onChange={(e) => handleInputChange(currentModuleId, 'clinicalSummary', e.target.value)}
                  rows={6} 
                  className="w-full p-3 border rounded-md focus:ring-2 themed-input" 
                  placeholder={I18N[lang].evaluador_summary_placeholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang].evaluador_history_label}</label>
                <textarea 
                  value={getInputValue(currentModuleId, 'familyHistory')}
                  onChange={(e) => handleInputChange(currentModuleId, 'familyHistory', e.target.value)}
                  rows={4} 
                  className="w-full p-3 border rounded-md focus:ring-2 themed-input" 
                  placeholder={I18N[lang].evaluador_history_placeholder}
                />
              </div>
            </div>
          );
        case 'generador':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang].generador_clinical_label}</label>
                <textarea 
                  value={getInputValue(currentModuleId, 'clinicalData')}
                  onChange={(e) => handleInputChange(currentModuleId, 'clinicalData', e.target.value)}
                  rows={4} 
                  className="w-full p-3 border rounded-md focus:ring-2 themed-input" 
                  placeholder={I18N[lang].generador_clinical_placeholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang].generador_molecular_label}</label>
                <textarea 
                  value={getInputValue(currentModuleId, 'molecularResult')}
                  onChange={(e) => handleInputChange(currentModuleId, 'molecularResult', e.target.value)}
                  rows={6} 
                  className="w-full p-3 border rounded-md focus:ring-2 themed-input" 
                  placeholder={I18N[lang].generador_molecular_placeholder}
                />
              </div>
            </div>
          );
        case 'simulador':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang].simulador_scenario_label}</label>
                <select 
                  value={getInputValue(currentModuleId, 'scenario')}
                  onChange={(e) => handleInputChange(currentModuleId, 'scenario', e.target.value)}
                  className="w-full p-3 border rounded-md themed-input"
                >
                  <option value="">{lang === 'es' ? 'Seleccione un escenario' : 'Select a scenario'}</option>
                  <option value="explicar_resultado_recesivo">{lang === 'es' ? 'Explicar resultado recesivo a padres' : 'Explain recessive result to parents'}</option>
                  <option value="comunicar_resultado_incierto">{lang === 'es' ? 'Comunicar resultado incierto (VUS)' : 'Communicate uncertain result (VUS)'}</option>
                  <option value="comunicar_estado_portador">{lang === 'es' ? 'Informar estado de portador' : 'Inform carrier status'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang].simulador_message_label}</label>
                <textarea 
                  value={getInputValue(currentModuleId, 'userMessage')}
                  onChange={(e) => handleInputChange(currentModuleId, 'userMessage', e.target.value)}
                  rows={3} 
                  className="w-full p-3 border rounded-md focus:ring-2 themed-input" 
                  placeholder={I18N[lang].simulador_message_placeholder}
                />
              </div>
            </div>
          );
        case 'analytics':
          return (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                  <p className="text-secondary">{lang === 'es' ? 'Cargando analítica...' : 'Loading analytics...'}</p>
                </div>
              ) : analyticsData ? (
                <div className="space-y-8">
                  {user?.email && user.email.toLowerCase() === 'jl.cribb@gmail.com' && (
                    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-2 animate-in fade-in slide-in-from-top duration-500">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm">
                          <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-red-900 font-black text-lg tracking-tight">{lang === 'es' ? 'Zona Administrativa' : 'Admin Zone'}</p>
                          <p className="text-red-700 text-sm font-medium">{lang === 'es' ? 'Limpieza profunda de datos para el despliegue final.' : 'Deep database cleanup for final deployment.'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleResetClick}
                        className={cn(
                          "w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-widest shadow-xl active:scale-95 hover:scale-105",
                          confirmReset 
                            ? "bg-orange-500 text-white animate-pulse shadow-orange-500/40" 
                            : "bg-red-600 text-white shadow-red-500/30 hover:bg-red-700"
                        )}
                      >
                        {confirmReset 
                          ? (lang === 'es' ? '¡CLIC OTRA VEZ PARA BORRAR TODO!' : 'CLICK AGAIN TO DELETE ALL!') 
                          : (lang === 'es' ? 'Hard Reset Total' : 'Total Hard Reset')}
                      </button>
                    </div>
                  )}
                  {showMetricExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-accent/5 border border-accent/20 p-6 rounded-3xl"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-accent flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {I18N[lang].metric_explanation_title}
                        </h4>
                        <button onClick={() => setShowMetricExplanation(false)} className="text-secondary hover:text-accent">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="font-bold text-primary mb-1">{lang === 'es' ? 'Funcionalidad' : 'Functionality'}</p>
                          <p className="text-secondary leading-relaxed">{I18N[lang].metric_functionality_desc}</p>
                        </div>
                        <div>
                          <p className="font-bold text-primary mb-1">{lang === 'es' ? 'Precisión' : 'Accuracy'}</p>
                          <p className="text-secondary leading-relaxed">{I18N[lang].metric_accuracy_desc}</p>
                        </div>
                        <div>
                          <p className="font-bold text-primary mb-1">{lang === 'es' ? 'Relevancia' : 'Relevance'}</p>
                          <p className="text-secondary leading-relaxed">{I18N[lang].metric_relevance_desc}</p>
                        </div>
                        <div>
                          <p className="font-bold text-primary mb-1">{lang === 'es' ? 'Usabilidad' : 'Usability'}</p>
                          <p className="text-secondary leading-relaxed">{I18N[lang].metric_usability_desc}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-bold text-primary mb-1">{lang === 'es' ? 'Satisfacción' : 'Satisfaction'}</p>
                          <p className="text-secondary leading-relaxed">{I18N[lang].metric_satisfaction_desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
  
                  {/* Global KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: lang === 'es' ? 'Total Feedback' : 'Total Feedback', value: analyticsData.global?.feedback_count || 0, icon: MessageSquare },
                      { label: lang === 'es' ? 'Calidad Media' : 'Avg Quality', value: `${(analyticsData.global?.averages?.quality_score || 0).toFixed(1)}/5.0`, icon: Star },
                      { label: lang === 'es' ? 'Tasa de Reuso' : 'Reuse Rate', value: `${((analyticsData.global?.would_use_again_rate || 0) * 100).toFixed(0)}%`, icon: ThumbsUp },
                      { label: lang === 'es' ? 'Tasa Comentarios' : 'Comment Rate', value: `${((analyticsData.global?.comment_rate || 0) * 100).toFixed(0)}%`, icon: FileText }
                    ].map((kpi, i) => (
                      <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-xl">
                          <kpi.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">{kpi.label}</p>
                          <p className="text-xl font-bold text-primary">{kpi.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart for Dimensions */}
                    <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <Shapes className="w-5 h-5 text-accent" />
                          {lang === 'es' ? 'Desempeño por Dimensión' : 'Performance by Dimension'}
                        </h4>
                        <button 
                          onClick={() => setShowMetricExplanation(!showMetricExplanation)}
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            showMetricExplanation ? "bg-accent text-white" : "text-secondary hover:bg-accent/10"
                          )}
                          title={I18N[lang].metric_explanation_title}
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: lang === 'es' ? 'Funcionalidad' : 'Functionality', A: analyticsData.global?.averages?.functionality || 0, B: analyticsData.user?.averages?.functionality || 0, fullMark: 5 },
                            { subject: lang === 'es' ? 'Precisión' : 'Accuracy', A: analyticsData.global?.averages?.technical_accuracy || 0, B: analyticsData.user?.averages?.technical_accuracy || 0, fullMark: 5 },
                            { subject: lang === 'es' ? 'Relevancia' : 'Relevance', A: analyticsData.global?.averages?.link_relevance || 0, B: analyticsData.user?.averages?.link_relevance || 0, fullMark: 5 },
                            { subject: lang === 'es' ? 'Usabilidad' : 'Usability', A: analyticsData.global?.averages?.usability || 0, B: analyticsData.user?.averages?.usability || 0, fullMark: 5 },
                            { subject: lang === 'es' ? 'Satisfacción' : 'Satisfaction', A: analyticsData.global?.averages?.overall_satisfaction || 0, B: analyticsData.user?.averages?.overall_satisfaction || 0, fullMark: 5 }
                          ]}>
                            <PolarGrid stroke="var(--border-color)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                            <Radar name="Global" dataKey="A" stroke="var(--bg-accent)" fill="var(--bg-accent)" fillOpacity={0.3} />
                            <Radar name="Personal" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                            <Tooltip />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
  
                    {/* Mode Breakdown */}
                    <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                      <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <Waypoints className="w-5 h-5 text-accent" />
                        {lang === 'es' ? 'Uso por Modo' : 'Usage by Mode'}
                      </h4>
                      <p className="text-xs text-secondary mb-6 leading-relaxed">
                        {I18N[lang].analytics_usage_by_mode_desc}
                      </p>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={Object.keys(MODULES)
                              .filter(key => key !== 'analytics')
                              .map(key => ({
                                name: I18N[lang][MODULES[key].title] || key,
                                count: analyticsData.user?.mode_breakdown?.[key]?.feedback_count || 0
                              }))
                              .sort((a, b) => b.count - a.count)
                            }
                            margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis 
                              dataKey="name" 
                              interval={0} 
                              tick={(props) => {
                                const { x, y, payload } = props;
                                return (
                                  <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={16} textAnchor="end" fill="var(--text-secondary)" fontSize={9} transform="rotate(-45)">
                                      {payload.value}
                                    </text>
                                  </g>
                                );
                              }}
                            />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            />
                            <Bar dataKey="count" fill="var(--bg-accent)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-secondary italic">
                  {lang === 'es' ? 'No hay datos de analítica disponibles aún.' : 'No analytics data available yet.'}
                </div>
              )}
            </div>
          );
        default:
          return (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">{I18N[lang][module.inputLabel!]}</label>
              <textarea 
                value={getInputValue(currentModuleId, 'input')}
                onChange={(e) => handleInputChange(currentModuleId, 'input', e.target.value)}
                rows={4} 
                className="w-full p-3 border rounded-md focus:ring-2 themed-input" 
                placeholder={I18N[lang][module.placeholder!]}
              />
            </div>
          );
      }
    })();

    return (
      <div className="space-y-4">
        {currentModuleId !== 'analytics' && (
          <div className="mb-6 bg-secondary/30 border border-border p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <History className="w-4 h-4 text-accent" />
                </div>
                <h4 className="text-sm font-bold text-primary">{I18N[lang].context_settings_title}</h4>
              </div>
              <select 
                value={contextConfig.mode}
                onChange={(e) => setContextConfig({...contextConfig, mode: e.target.value as ContextMode})}
                className="text-xs bg-primary border-border rounded-lg p-1 px-2 focus:ring-1 focus:ring-accent outline-none"
              >
                <option value="none">{I18N[lang].context_mode_none}</option>
                <option value="manual">{I18N[lang].context_mode_manual}</option>
                <option value="session">{I18N[lang].context_mode_session}</option>
                <option value="history">{I18N[lang].context_mode_history}</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              {contextConfig.mode === 'manual' && (
                <motion.div 
                  key="manual"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea 
                    value={contextConfig.manualText}
                    onChange={(e) => setContextConfig({...contextConfig, manualText: e.target.value})}
                    className="w-full p-3 text-xs border rounded-xl themed-input mb-2"
                    placeholder={I18N[lang].context_manual_placeholder}
                    rows={3}
                  />
                </motion.div>
              )}

              {(contextConfig.mode === 'session' || contextConfig.mode === 'history') && (
                <motion.div 
                  key="auto"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-[10px] text-secondary bg-accent/5 p-2 rounded-lg">
                    <Info className="w-3 h-3 text-accent" />
                    <p>{I18N[lang].context_aggregation_info}</p>
                    <div className="ml-auto flex items-center gap-2">
                      <span>Max:</span>
                      <input 
                        type="number" 
                        value={contextConfig.maxHistoryMessages}
                        onChange={(e) => setContextConfig({...contextConfig, maxHistoryMessages: parseInt(e.target.value)})}
                        className="w-10 bg-primary border rounded px-1"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {content}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-header-bg text-header-text p-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md md:hidden hover:bg-accent-hover"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg hidden sm:block">{I18N[lang].appTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-accent/20 p-1 rounded-lg">
            <button 
              onClick={() => setLang('es')}
              className={cn("px-3 py-1 text-xs font-bold rounded-md transition-colors", lang === 'es' ? "bg-accent text-white" : "hover:bg-accent-hover")}
            >
              ES
            </button>
            <button 
              onClick={() => setLang('en')}
              className={cn("px-3 py-1 text-xs font-bold rounded-md transition-colors", lang === 'en' ? "bg-accent text-white" : "hover:bg-accent-hover")}
            >
              EN
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={cn("p-2 rounded-full hover:bg-accent-hover transition-colors", showHistory && "bg-accent text-white")}
                title={I18N[lang].history_title}
              >
                <History className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-accent" />
                <button onClick={handleLogout} className="p-2 hover:text-accent transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-active transition-colors text-sm font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{I18N[lang].login_button}</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed top-0 left-0 h-full w-72 bg-secondary shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-8 md:hidden">
              <span className="font-bold text-xl">{I18N[lang].appTitle}</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-accent-hover rounded-md">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-6">
              {SIDEBAR_STRUCTURE.map((section) => (
                <div key={section.id}>
                  <h3 className="px-3 mb-2 text-xs font-bold text-secondary uppercase tracking-wider">
                    {I18N[lang][section.title]}
                  </h3>
                  <div className="space-y-1">
                    {section.modules.map((moduleId) => {
                      const module = MODULES[moduleId];
                      const Icon = ICON_MAP[module.icon];
                      return (
                        <button
                          key={moduleId}
                          onClick={() => {
                            setCurrentModuleId(moduleId);
                            setSidebarOpen(false);
                            setStructuredResponse(null);
                            setAssessment('');
                            setShowHistory(false);
                          }}
                          className={cn(
                            "w-full flex items-center p-2 text-sm rounded-lg transition-all duration-150 text-left group",
                            currentModuleId === moduleId 
                              ? "bg-accent text-white font-semibold shadow-md" 
                              : "text-secondary hover:bg-accent-hover hover:text-accent"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 mr-3 flex-shrink-0 transition-transform group-hover:scale-110", currentModuleId === moduleId ? "text-white" : "text-accent")} />
                          <span>{I18N[lang][module.title]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-border">
            <h3 className="px-3 mb-3 text-xs font-bold uppercase tracking-wider text-secondary">Theme</h3>
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-accent/10">
              {(['light', 'pastel', 'muted', 'corporate', 'dark', 'academic', 'serene', 'fresh'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all duration-200 hover:scale-125",
                    theme === t && "ring-2 ring-offset-2 ring-accent scale-110 shadow-lg",
                    t === 'light' && "bg-slate-200",
                    t === 'pastel' && "bg-pink-200",
                    t === 'muted' && "bg-stone-400",
                    t === 'corporate' && "bg-[#970747]",
                    t === 'dark' && "bg-black border border-white/20",
                    t === 'academic' && "bg-[#fdf6e3]",
                    t === 'serene' && "bg-[#F1445B]",
                    t === 'fresh' && "bg-[#79B4B0]"
                  )}
                  title={t}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {showHistory ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <History className="w-6 h-6 text-accent" />
                    {I18N[lang].history_title}
                  </h2>
                  <button onClick={() => setShowHistory(false)} className="text-accent hover:underline text-sm font-medium">
                    {lang === 'es' ? 'Volver' : 'Back'}
                  </button>
                </div>

                {history.length === 0 ? (
                  <div className="bg-secondary p-12 rounded-2xl text-center shadow-sm border border-border">
                    <History className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                    <p className="text-secondary">{I18N[lang].no_history}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {history.map((item) => (
                      <div key={item.id} className="bg-secondary p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                              {I18N[lang][MODULES[item.moduleId].title]}
                            </span>
                            <p className="text-xs text-secondary mt-2">
                              {item.timestamp?.toDate().toLocaleString() || '...'}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              setCurrentModuleId(item.moduleId);
                              setStructuredResponse(parseAIResponse(item.response, {} as any));
                              setLastResponseId(item.id);
                              setFeedbackSubmitted(false);
                              if (item.provider) setActiveProvider(item.provider);
                              setShowHistory(false);
                            }}
                            className="text-accent hover:bg-accent/10 p-2 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-sm line-clamp-2 text-secondary italic">
                          {typeof item.input === 'string' ? item.input : JSON.stringify(item.input)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={currentModuleId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Module Header */}
                <div className="bg-secondary p-8 rounded-3xl shadow-sm border border-border">
                  <h2 className="text-3xl font-bold text-accent mb-3">{I18N[lang][MODULES[currentModuleId].title]}</h2>
                  <p className="text-secondary text-lg">{I18N[lang][MODULES[currentModuleId].desc]}</p>
                </div>

                {/* Input Section */}
                <div className="bg-secondary p-8 rounded-3xl shadow-sm border border-border">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    {currentModuleId === 'analytics' 
                      ? (lang === 'es' ? 'Métricas y Visualización' : 'Metrics & Visualization')
                      : (lang === 'es' ? 'Entrada de Datos' : 'Data Input')}
                  </h3>
                  {renderModuleInput()}
                  {currentModuleId !== 'analytics' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                      <button 
                        onClick={() => currentModuleId === 'analytics' ? setShowMetricExplanation(true) : handleSubmit('gemini')}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 font-bold text-base disabled:opacity-50"
                      >
                        {loading && activeProvider === 'gemini' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Gemini
                      </button>
                      <button 
                        onClick={() => currentModuleId === 'analytics' ? setShowMetricExplanation(true) : handleSubmit('groq')}
                        disabled={loading}
                        className="bg-orange-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 font-bold text-base disabled:opacity-50"
                      >
                        {loading && activeProvider === 'groq' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Groq
                      </button>
                      <button 
                        onClick={() => currentModuleId === 'analytics' ? setShowMetricExplanation(true) : handleSubmit('openrouter')}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all flex items-center justify-center gap-3 font-bold text-base disabled:opacity-50"
                      >
                        {loading && activeProvider === 'openrouter' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        OpenRouter
                      </button>
                    </div>
                  )}
                </div>

                {/* Response Section */}
                {currentModuleId !== 'analytics' && (
                  <div className="bg-secondary p-8 rounded-3xl shadow-sm border border-border">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" />
                      {I18N[lang].responseTitle}
                    </h3>
                    <div className="flex items-center gap-2 self-end">
                      <button 
                        onClick={() => setShowAudit(!showAudit)}
                        className={cn("p-2 rounded-xl transition-colors", showAudit ? "bg-accent text-white" : "text-secondary hover:bg-accent/10")}
                        title="Audit Log"
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </button>
                      <button onClick={printOutput} title={I18N[lang].printTitle} className="p-2 text-secondary hover:text-accent rounded-xl hover:bg-accent/10 transition-colors">
                        <Printer className="w-5 h-5" />
                      </button>
                      <button onClick={() => exportImage('png')} title={I18N[lang].exportPngTitle} className="p-2 text-secondary hover:text-accent rounded-xl hover:bg-accent/10 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => exportImage('jpeg')} title={I18N[lang].exportJpgTitle} className="p-2 text-secondary hover:text-accent rounded-xl hover:bg-accent/10 transition-colors">
                        <FileImage className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {showAudit && structuredResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto"
                    >
                      <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1">
                        <span className="text-slate-400 uppercase">Audit Log / Policy Engine</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          structuredResponse.policy_decision?.allowed ? "bg-green-900 text-green-100" : "bg-red-900 text-red-100"
                        )}>
                          {structuredResponse.policy_decision?.allowed ? "ALLOWED" : "DENIED"}
                        </span>
                      </div>
                      <pre>{JSON.stringify({
                        domain: structuredResponse.domain_classification,
                        intent: structuredResponse.intent_classification,
                        policy: structuredResponse.policy_decision,
                        tools: structuredResponse.tool_plan
                      }, null, 2)}</pre>
                    </motion.div>
                  )}

                  <div 
                    ref={outputRef}
                    className={cn(
                      "prose prose-slate max-w-none p-6 rounded-2xl border min-h-[200px] transition-all duration-500",
                      loading ? "bg-primary/50 border-border" : 
                      structuredResponse ? (
                        activeProvider === 'gemini' ? "bg-blue-50/5 border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]" :
                        activeProvider === 'groq' ? "bg-orange-50/5 border-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.05)]" :
                        "bg-green-50/5 border-green-400/40 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
                      ) : "bg-primary/50 border-border"
                    )}
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                        <p className="text-secondary animate-pulse">{I18N[lang].loadingText}</p>
                      </div>
                    ) : structuredResponse ? (
                      <div className="space-y-6 relative">
                        <div className="absolute -top-3 -right-3">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm",
                            activeProvider === 'gemini' ? "bg-blue-100 text-blue-700 border-blue-200" :
                            activeProvider === 'groq' ? "bg-orange-100 text-orange-700 border-orange-200" :
                            "bg-green-100 text-green-700 border-green-200"
                          )}>
                            {activeProvider.toUpperCase()}
                          </span>
                        </div>
                        {structuredResponse.ui_flags.show_warning_banner && (
                          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{structuredResponse.response_payload.summary}</p>
                          </div>
                        )}
                        
                        {!structuredResponse.ui_flags.show_warning_banner && (
                          <div className="mb-8">
                            <p className="text-lg font-medium leading-relaxed">{structuredResponse.response_payload.summary}</p>
                          </div>
                        )}

                        {structuredResponse.response_payload.structured_sections.map(renderSection)}

                        {structuredResponse.response_payload.next_steps.length > 0 && (
                          <div className="mt-8 border-t border-border pt-6">
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-accent">
                              <ChevronRight className="w-4 h-4" />
                              {lang === 'es' ? 'Próximos Pasos' : 'Next Steps'}
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-secondary">
                              {structuredResponse.response_payload.next_steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {structuredResponse.evidence.used && structuredResponse.evidence.sources.length > 0 && (
                          <div className="mt-8 border-t border-border pt-6">
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-500">
                              <Book className="w-4 h-4" />
                              {lang === 'es' ? 'Evidencia y Referencias' : 'Evidence & References'}
                            </h4>
                            <div className="grid gap-3">
                              {structuredResponse.evidence.sources.map((source, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 bg-primary/30 rounded-xl border border-border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-accent bg-accent/10 px-2 py-0.5 rounded">
                                      {source.source_type}
                                    </span>
                                    {source.verified && (
                                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                                        <ShieldCheck className="w-3 h-3" />
                                        VERIFIED
                                      </span>
                                    )}
                                  </div>
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-primary hover:text-accent hover:underline transition-colors"
                                  >
                                    {source.title || source.id}
                                  </a>
                                  <span className="text-[10px] text-secondary font-mono">ID: {source.id}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                structuredResponse.evidence.verification_status === 'verified' ? "bg-green-500" :
                                structuredResponse.evidence.verification_status === 'partial' ? "bg-amber-500" : "bg-slate-300"
                              )} />
                              Verification: {structuredResponse.evidence.verification_status}
                            </div>
                          </div>
                        )}

                        {/* Feedback Trigger */}
                        {lastResponseId && (
                          <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
                            <button 
                              onClick={handleFeedbackClick}
                              className="flex items-center gap-2 text-sm font-bold text-accent hover:bg-accent/10 px-4 py-2 rounded-xl transition-all"
                            >
                              <Star className={cn("w-4 h-4", feedbackSubmitted && "fill-accent")} />
                              {feedbackSubmitted ? I18N[lang].feedback_success : I18N[lang].feedback_button}
                            </button>
                            <p className="text-[10px] text-secondary/70 italic text-center max-w-md">
                              {I18N[lang].feedback_provider_invite}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-secondary/40">
                        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                        <p>{I18N[lang].emptyResponse}</p>
                      </div>
                    )}
                  </div>
                  
                  {structuredResponse && (
                    <p className="mt-6 text-xs text-center text-secondary/60 italic flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {I18N[lang].disclaimer.replace('Gemini', activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1))}
                    </p>
                  )}
                </div>
                )}

                {/* Assessment Section */}
                {currentModuleId !== 'analytics' && ['genes', 'proteinas', 'vias_de_señalizacion', 'patologias', 'epigenetica'].includes(currentModuleId) && (
                  <div className="bg-secondary p-8 rounded-3xl shadow-sm border border-border">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-accent" />
                      {I18N[lang].autoevaluacion_title}
                    </h3>
                    <p className="text-secondary mb-6">{I18N[lang].autoevaluacion_desc}</p>
                    
                    <button 
                      onClick={handleAssessment}
                      disabled={assessmentLoading}
                      className="inline-flex items-center px-6 py-3 bg-accent/10 text-accent font-bold rounded-xl hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                      {assessmentLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <GraduationCap className="w-5 h-5 mr-2" />}
                      {I18N[lang].autoevaluacion_button}
                    </button>

                    {assessment && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 p-6 bg-primary/30 rounded-2xl border border-border"
                      >
                        <div className="prose prose-slate max-w-none">
                          <ReactMarkdown>{assessment}</ReactMarkdown>
                        </div>
                        <button 
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`<html><head><title>Quiz</title></head><body>${assessment}</body></html>`);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                          className="mt-6 flex items-center gap-2 text-sm font-bold text-accent hover:underline"
                        >
                          <Printer className="w-4 h-4" />
                          {I18N[lang].print_quiz_button}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-header-bg text-header-text p-4 text-center text-xs font-medium border-t border-border">
        @ 2025 jlCribbLibardi - jl.cribb@gmail.com
      </footer>

      <style>{`
        :root {
          --bg-primary: #f1f5f9;
          --bg-secondary: #ffffff;
          --bg-accent: #2563eb;
          --bg-accent-hover: #eff6ff;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --border-color: #e2e8f0;
          --header-bg: #ffffff;
          --header-text: #334155;
        }

        [data-theme="pastel"] {
          --bg-primary: #f0f9ff;
          --bg-secondary: #ffffff;
          --bg-accent: #84b6f4;
          --bg-accent-hover: #fce7f3;
          --text-primary: #3a506b;
          --text-secondary: #6b7a8f;
          --border-color: #e0f2fe;
        }

        [data-theme="muted"] {
          --bg-primary: #e5e5e5;
          --bg-secondary: #f5f5f5;
          --bg-accent: #0891b2;
          --bg-accent-hover: #d4d4d4;
          --text-primary: #262626;
          --text-secondary: #525252;
          --border-color: #cccccc;
        }

        [data-theme="corporate"] {
          --bg-primary: #FEF4E8;
          --bg-secondary: #ffffff;
          --bg-accent: #970747;
          --bg-accent-hover: #fdedf4;
          --text-primary: #13445A;
          --text-secondary: #446878;
          --border-color: #fcefe2;
          --header-bg: #13445A;
          --header-text: #FEF4E8;
        }

        [data-theme="dark"] {
          --bg-primary: #121212;
          --bg-secondary: #1e1e1e;
          --bg-accent: #bb86fc;
          --bg-accent-hover: #2a2a2a;
          --text-primary: #f5f5f5;
          --text-secondary: #a0a0a0;
          --border-color: #333333;
          --header-bg: #1e1e1e;
          --header-text: #e0e0e0;
        }

        [data-theme="academic"] {
          --bg-primary: #fdf6e3;
          --bg-secondary: #fffbf0;
          --bg-accent: #b58900;
          --bg-accent-hover: #eee8d5;
          --text-primary: #586e75;
          --text-secondary: #839496;
          --border-color: #eee8d5;
        }
        
        [data-theme="serene"] {
          --bg-primary: #fcf9f7;
          --bg-secondary: #ffffff;
          --bg-accent: #F03625;
          --bg-accent-hover: #fdebeb;
          --text-primary: #65734B;
          --text-secondary: #94A453;
          --border-color: #D9C3B1;
          --header-bg: #65734B;
          --header-text: #fcf9f7;
        }

        [data-theme="fresh"] {
          --bg-primary: #f5f8f5;
          --bg-secondary: #ffffff;
          --bg-accent: #FB7E00;
          --bg-accent-hover: #fff5e6;
          --text-primary: #3a3a3a;
          --text-secondary: #79B4B0;
          --border-color: #D1DFD2;
        }

        .bg-primary { background-color: var(--bg-primary); }
        .bg-secondary { background-color: var(--bg-secondary); }
        .bg-accent { background-color: var(--bg-accent); }
        .bg-accent-hover { background-color: var(--bg-accent-hover); }
        .text-primary { color: var(--text-primary); }
        .text-secondary { color: var(--text-secondary); }
        .text-accent { color: var(--bg-accent); }
        .bg-header-bg { background-color: var(--header-bg); }
        .text-header-text { color: var(--header-text); }
        .border-border { border-color: var(--border-color); }
        .bg-accent-active { background-color: var(--bg-accent); filter: brightness(0.9); }

        .themed-input {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }
        
        [data-theme="dark"] .themed-input {
          background-color: #2a2a2a;
        }

        .prose {
          color: var(--text-primary) !important;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: var(--bg-accent) !important;
        }
        .prose strong {
          color: var(--text-primary) !important;
        }
        .prose a {
          color: var(--bg-accent) !important;
          text-decoration: underline;
        }
      `}</style>
      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <FeedbackModal 
            lang={lang}
            responseId={lastResponseId!}
            moduleId={currentModuleId}
            existingData={existingFeedback}
            onClose={() => setShowFeedback(false)}
            onSuccess={() => {
              setShowFeedback(false);
              setFeedbackSubmitted(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedbackModal({ lang, responseId, moduleId, existingData, onClose, onSuccess }: { lang: Language, responseId: string, moduleId: string, existingData?: any, onClose: () => void, onSuccess: () => void }) {
  const [ratings, setRatings] = useState(existingData?.ratings || {
    functionality: 5,
    technical_accuracy: 5,
    link_relevance: 5,
    usability: 5,
    overall_satisfaction: 5
  });
  const [comment, setComment] = useState(existingData?.written_comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [wouldUseAgain, setWouldUseAgain] = useState(existingData ? existingData.would_use_again : true);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitFeedback({
        session_id: crypto.randomUUID(),
        response_id: responseId,
        active_mode: moduleId,
        ratings,
        would_use_again: wouldUseAgain,
        written_comment: comment,
        response_meta: {
          domain_status: 'valid_genetics',
          intent: 'general_query',
          verification_status: 'none',
          render_as: 'card'
        }
      });
      onSuccess();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error al enviar feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const dimensions = [
    { id: 'functionality', label: lang === 'es' ? 'Funcionalidad' : 'Functionality' },
    { id: 'technical_accuracy', label: lang === 'es' ? 'Precisión Técnica' : 'Technical Accuracy' },
    { id: 'link_relevance', label: lang === 'es' ? 'Relevancia de Enlaces' : 'Link Relevance' },
    { id: 'usability', label: lang === 'es' ? 'Usabilidad' : 'Usability' },
    { id: 'overall_satisfaction', label: lang === 'es' ? 'Satisfacción General' : 'Overall Satisfaction' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-secondary p-6 sm:p-8 rounded-3xl shadow-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{I18N[lang].feedback_title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-accent/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-secondary mb-6 text-sm">{I18N[lang].feedback_desc}</p>

        <div className="space-y-6 mb-8">
          {dimensions.map((dim) => (
            <div key={dim.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">{dim.label}</span>
                <span className="text-xs font-bold text-accent">{(ratings as any)[dim.id]}/5</span>
              </div>
              <div className="flex justify-between gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setRatings(prev => ({ ...prev, [dim.id]: star }))}
                    className="flex-1 py-2 rounded-lg transition-all hover:scale-105 bg-primary/30 flex justify-center"
                  >
                    <Star className={cn("w-5 h-5", star <= (ratings as any)[dim.id] ? "text-yellow-400 fill-yellow-400" : "text-secondary/20")} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-primary/30 rounded-2xl border border-border">
            <span className="text-sm font-medium">{lang === 'es' ? '¿Lo usarías de nuevo?' : 'Would you use it again?'}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setWouldUseAgain(true)}
                className={cn("p-2 rounded-xl transition-colors", wouldUseAgain ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-primary/50 text-secondary")}
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setWouldUseAgain(false)}
                className={cn("p-2 rounded-xl transition-colors", !wouldUseAgain ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-primary/50 text-secondary")}
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={lang === 'es' ? 'Comentarios adicionales (opcional)...' : 'Additional comments (optional)...'}
            className="w-full p-4 border rounded-2xl themed-input h-24 text-sm resize-none"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:bg-accent-active transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {I18N[lang].feedback_submit}
        </button>
      </motion.div>
    </motion.div>
  );
}
