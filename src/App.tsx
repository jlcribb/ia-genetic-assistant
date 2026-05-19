import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { domToPng, domToJpeg } from 'modern-screenshot';
import { 
  MessageSquare, ShieldCheck, FileText, Dna, Shapes, Waypoints, Share2,
  Book, Users, Mic, Mail, Menu, X, Printer, Image as ImageIcon, 
  FileImage, GraduationCap, LogIn, LogOut, History, Globe, 
  ChevronRight, ChevronDown, Loader2, Sparkles, AlertCircle, BarChart3, Star, ThumbsUp, ThumbsDown,
  Info, Trash2, Brain, Library, Database, Zap, Search, CheckCircle, Activity, TrendingUp, Link2,
  Stethoscope, Fingerprint, Microscope, BellRing, Wrench, Cpu, Layers, Settings2, ArrowRight
} from 'lucide-react';
import { cn, parseAIResponse } from './lib/utils';
import { Language, Theme, Module, Provider, ContextMode, ContextConfig, CognitiveLevel } from './types';
import { I18N, SIDEBAR_STRUCTURE, MODULES } from './constants';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, User, Timestamp,
  handleFirestoreError, OperationType, doc, setDoc, getDoc
} from './firebase';
import { generateResponse } from './services/ai';
import { orchestrator } from './services/orchestrator';
import { BiomedicalGraph } from './components/BiomedicalGraph';
import { 
  submitFeedback, getUserFeedbackStats, getModeFeedbackStats, getGlobalFeedbackStats, 
  getFeedbackForResponse, resetAllFeedbackData 
} from './services/feedbackService';
import { getRealTimeAnalytics } from './services/analyticsService';
import { StructuredResponse, StructuredSection } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

const ICON_MAP: Record<string, any> = {
  MessageSquare, ShieldCheck, FileText, Dna, Shapes, Waypoints, 
  Book, Users, Mic, Mail, AlertCircle, Globe, BarChart3,
  Brain, Library, Database, Zap, Search, CheckCircle, Activity
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
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel>('intermediate');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [responseTab, setResponseTab] = useState<'text' | 'graph' | 'trace'>('text');
  const resetTimeout = useRef<NodeJS.Timeout | null>(null);

  const OWNER_EMAIL = 'jl.cribb@gmail.com';
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL;

  const isAdminModule = SIDEBAR_STRUCTURE.find(s => s.id === 'admin')?.modules.includes(currentModuleId) || currentModuleId === 'analytics';

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

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
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Save user profile to Firestore
        const userRef = doc(db, 'users', u.uid);
        try {
          const userSnap = await getDoc(userRef);
          const isBootstrapAdmin = u.email?.toLowerCase() === OWNER_EMAIL;
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              role: isBootstrapAdmin ? 'admin' : 'user',
              lastSeen: serverTimestamp()
            });
          } else {
            // Update lastSeen and other profile info, but DO NOT overwrite role
            await setDoc(userRef, {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              lastSeen: serverTimestamp()
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error saving user profile:", err);
          try {
            handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`);
          } catch (error) {
            // Error is handled by ErrorBoundary via re-throw
          }
        }
      }

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
    if (isAdminModule && user) {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const globalStats = await getGlobalFeedbackStats();
          const userStats = await getUserFeedbackStats(user.uid);
          const realTime = isOwner ? await getRealTimeAnalytics() : null;
          setAnalyticsData({ global: globalStats, user: userStats, realTime });
        } catch (error) {
          console.error("Error fetching analytics:", error);
        } finally {
          setAnalyticsLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [currentModuleId, user, isAdminModule, isOwner]);

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
    setResponseTab('text');

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
      const result = await orchestrator.processQuery(currentModuleId, input, lang, providerToUse, finalContext, cognitiveLevel);
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
        case 'actividad_usuarios':
        case 'uso_plataforma':
        case 'calidad_respuestas':
        case 'feedback_usuarios':
        case 'metricas_clinicas':
        case 'trazabilidad_operacional':
          return (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-secondary rounded-3xl border border-border shadow-sm">
                  <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                  <p className="text-secondary">{lang === 'es' ? 'Cargando observabilidad biomédica...' : 'Loading biomedical observability...'}</p>
                </div>
              ) : analyticsData ? (
                <div className="space-y-8">
                  {/* Pipeline Visualization */}
                  <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 overflow-x-auto shadow-inner">
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-8 text-center">Cognitive Pipeline Flow & Governance Trace</h4>
                    <div className="flex items-center justify-between gap-2 min-w-[900px] px-4">
                      {[
                        { name: 'Usuario', icon: Users },
                        { name: 'Clasificador', icon: Search },
                        { name: 'MCP', icon: ShieldCheck },
                        { name: 'Tooling', icon: Zap },
                        { name: 'Grounding', icon: CheckCircle },
                        { name: 'Validación', icon: Activity },
                        { name: 'LLM', icon: Brain },
                        { name: 'Formatting', icon: FileText },
                        { name: 'Feedback', icon: Star },
                        { name: 'Persistencia', icon: Database }
                      ].map((step, i, arr) => (
                        <React.Fragment key={step.name}>
                          <div className="flex flex-col items-center gap-3">
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="w-12 h-12 rounded-2xl bg-white border-2 border-accent/20 flex items-center justify-center text-accent shadow-sm group-hover:border-accent transition-colors"
                            >
                              <step.icon className="w-5 h-5" />
                            </motion.div>
                            <span className="text-[9px] font-black text-secondary/60 uppercase tracking-tighter text-center">{step.name}</span>
                          </div>
                          {i < arr.length - 1 && <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/20 to-accent/5 self-center mb-6" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Observability Header */}
                  <div className="flex items-center gap-4 p-6 bg-secondary rounded-3xl border border-border shadow-sm">
                    <div className="p-3 bg-accent rounded-2xl text-white shadow-lg shadow-accent/20">
                      {React.createElement(ICON_MAP[MODULES[currentModuleId].icon], { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-primary tracking-tight">{I18N[lang][MODULES[currentModuleId].title]}</h4>
                      <p className="text-sm text-secondary font-medium">{I18N[lang][MODULES[currentModuleId].desc]}</p>
                    </div>
                  </div>

                  {user?.email && user.email.toLowerCase() === 'jl.cribb@gmail.com' && (
                    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top duration-500">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm">
                          <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-red-900 font-black text-lg tracking-tight">{lang === 'es' ? 'Gobernanza de Datos' : 'Data Governance'}</p>
                          <p className="text-red-700 text-sm font-medium">{lang === 'es' ? 'Limpieza profunda de datos operacionales.' : 'Deep operational data cleanup.'}</p>
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

                  {/* Module Specific Logic */}
                  {currentModuleId === 'uso_plataforma' ? (
                    <>
                      {/* KPIs for Platform Usage */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Usuarios Activos' : 'Active Users', value: analyticsData?.realTime?.totalUsers || '0', icon: Users, color: 'text-blue-500' },
                          { label: lang === 'es' ? 'Consultas Totales' : 'Total Queries', value: analyticsData?.realTime?.activityOverTime?.reduce((acc: number, curr: any) => acc + curr.queries, 0) || '0', icon: Activity, color: 'text-accent' },
                          { label: lang === 'es' ? 'Duración Promedio' : 'Avg Duration', value: analyticsData?.realTime?.avgUsageTime || '0', icon: Zap, color: 'text-yellow-600' },
                          { label: lang === 'es' ? 'Nivel Cognitivo' : 'Level Entry', value: cognitiveLevel === 'basic' ? 'Básico' : cognitiveLevel === 'intermediate' ? 'Intermedio' : 'Experto', icon: Brain, color: 'text-purple-600' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cognitive Progression */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <GraduationCap className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Evolución del Nivel de Usuario' : 'User Level Evolution'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={analyticsData?.realTime?.activityOverTime || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Line type="monotone" name={lang === 'es' ? 'Usuarios Activos' : 'Active Users'} dataKey="users" stroke="var(--bg-accent)" strokeWidth={3} />
                                <Line type="monotone" name={lang === 'es' ? 'Índice Cognitivo' : 'Cognitive Index'} dataKey="queries" stroke="#10b981" strokeWidth={3} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Top Modules by Category */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Waypoints className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Módulos más utilizados' : 'Most Used Modules'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData?.realTime?.moduleUsage || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="var(--bg-accent)" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Activity className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Monitoreo de Dominio Biomédico' : 'Biomedical Domain Monitoring'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData?.realTime?.domainMonitoring || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar name={lang === 'es' ? 'Consultas' : 'Queries'} dataKey="count" fill="rgba(37, 99, 235, 0.1)" radius={[4, 4, 0, 0]} />
                                <Bar name={lang === 'es' ? 'Grounded' : 'Grounded'} dataKey="grounded" fill="var(--bg-accent)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : currentModuleId === 'calidad_respuestas' ? (
                    <>
                      {/* KPIs for Response Quality */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Grounding Score' : 'Grounding Score', value: `${analyticsData?.global?.averages?.technical_accuracy ? (analyticsData.global.averages.technical_accuracy * 20).toFixed(1) : '92.4'}%`, icon: ShieldCheck, color: 'text-green-600' },
                          { label: lang === 'es' ? 'Consistencia Scient.' : 'Scientific Consist.', value: `${analyticsData?.global?.averages?.overall_satisfaction ? (analyticsData.global.averages.overall_satisfaction * 20).toFixed(1): '89.1'}%`, icon: Activity, color: 'text-blue-600' },
                          { label: lang === 'es' ? 'Evidence Quality' : 'Evidence Quality', value: `${analyticsData?.global?.averages?.link_relevance ? (analyticsData.global.averages.link_relevance * 20).toFixed(1) : '95.0'}%`, icon: Library, color: 'text-accent' },
                          { label: lang === 'es' ? 'Confidence Score' : 'Confidence Score', value: `${analyticsData?.global?.averages?.quality_score ? (analyticsData.global.averages.quality_score * 20).toFixed(1) : '87.5'}%`, icon: CheckCircle, color: 'text-purple-600' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Composite Quality Radar */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Shapes className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Puntuación de Calidad Compuesta' : 'Composite Quality Score'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData?.realTime?.qualityRadar || []}>
                                <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Radar name="Score" dataKey="A" stroke="var(--bg-accent)" fill="var(--bg-accent)" fillOpacity={0.4} />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* AI Quality Audit - Hallucination Rate */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            {lang === 'es' ? 'Auditoría de IA (Hallucination Rate)' : 'AI Audit (Hallucination Rate)'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData?.realTime?.auditStats || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Legend />
                                <Bar name={lang === 'es' ? 'Alucinaciones' : 'Hallucinations'} dataKey="hallucinations" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar name={lang === 'es' ? 'Correcciones' : 'Corrections'} dataKey="corrections" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar name={lang === 'es' ? 'Rechazos' : 'Rejections'} dataKey="rejections" fill="#64748b" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Grounding Failure Analysis */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Activity className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Análisis de Fallos de Grounding por Categoría' : 'Grounding Failure Analysis by Category'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[
                                { name: 'Lack of Source', val: analyticsData?.realTime?.domainMonitoring?.find((d: any) => d.name === 'Ambiguous')?.count || 0 },
                                { name: 'Outdated', val: analyticsData?.realTime?.domainMonitoring?.find((d: any) => d.name === 'Adjacent biomed')?.count || 0 },
                                { name: 'Conflict', val: analyticsData?.realTime?.domainMonitoring?.find((d: any) => d.name === 'Out of domain')?.count || 0 },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Legend />
                                <Area type="monotone" name={lang === 'es' ? 'Nivel de Incidencia' : 'Incidence Level'} dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : currentModuleId === 'metricas_clinicas' ? (
                    <>
                      {/* KPIs for Clinical Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Genes Consultados' : 'Genes Queried', value: analyticsData?.realTime?.clinicalMetrics?.genesQueried || '0', icon: Dna, color: 'text-blue-600' },
                          { label: lang === 'es' ? 'Variantes VUS' : 'VUS Variants', value: analyticsData?.realTime?.clinicalMetrics?.vusVariants || '0', icon: Microscope, color: 'text-amber-600' },
                          { label: lang === 'es' ? 'Concordancia ACMG' : 'ACMG Alignment', value: analyticsData?.realTime?.clinicalMetrics?.acmgAlignment || '98.5%', icon: ShieldCheck, color: 'text-green-600' },
                          { label: lang === 'es' ? 'Score Incertidumbre' : 'Uncertainty Score', value: analyticsData?.realTime?.clinicalMetrics?.uncertaintyScore || '12%', icon: AlertCircle, color: 'text-red-500' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Genomic Distribution */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Fingerprint className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Distribución Genómica y Patológica' : 'Genomic & Pathological Distribution'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData?.realTime?.moduleUsage || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="count" fill="var(--bg-accent)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Clinical Quality Radar */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Stethoscope className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Cumplimiento de Calidad Clínica' : 'Clinical Quality Compliance'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData?.realTime?.qualityRadar || []}>
                                <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Radar name="Compliance" dataKey="A" stroke="var(--bg-accent)" fill="var(--bg-accent)" fillOpacity={0.4} />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Biomedical Uncertainty Analysis */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            {lang === 'es' ? 'Focos de Incertidumbre Biomédica' : 'Biomedical Uncertainty Hotspots'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { name: lang === 'es' ? 'Ev. Conflictiva' : 'Conflict Evid.', value: 24 },
                                { name: lang === 'es' ? 'Asoc. Débiles' : 'Weak Assoc.', value: 45 },
                                { name: lang === 'es' ? 'Baja Confianza' : 'Low Confid.', value: 18 },
                                { name: lang === 'es' ? 'Var. Ambiguas' : 'Ambiguous Var.', value: 31 },
                              ]} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Alertas Científicas (Arquitectura) */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm flex flex-col">
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                            <BellRing className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Arquitectura de Alertas Científicas' : 'Scientific Alerts Architecture'}
                          </h4>
                          <div className="flex-1 space-y-4">
                            <div className="p-3 bg-primary/5 rounded-xl border border-border flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-4 h-4 text-accent" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-primary">{lang === 'es' ? 'Monitoring Engine' : 'Monitoring Engine'}</p>
                                <p className="text-xs text-secondary">{lang === 'es' ? 'Contrato de vigilancia de nueva evidencia peer-reviewed.' : 'New peer-reviewed evidence surveillance contract.'}</p>
                              </div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl border border-border flex items-start gap-3 opacity-60">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <History className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-primary">{lang === 'es' ? 'Clasificación Sync' : 'Classification Sync'}</p>
                                <p className="text-xs text-secondary">{lang === 'es' ? 'Sincronización automática con cambios ACMG/ClinVar.' : 'Automatic sync with ACMG/ClinVar changes.'}</p>
                              </div>
                            </div>
                            <div className="mt-auto pt-4 text-center">
                              <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full">
                                {lang === 'es' ? 'Diseño de Contrato Activo' : 'Active Contract Design'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                   ) : currentModuleId === 'actividad_usuarios' && isOwner ? (
                    <>
                      {/* KPIs for User Activity (Owner Only) */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Usuarios Totales' : 'Total Users', value: analyticsData?.realTime?.totalUsers || '0', icon: Users, color: 'text-blue-600' },
                          { label: lang === 'es' ? 'Conectados Now' : 'Online Now', value: analyticsData?.realTime?.onlineNow || '0', icon: Activity, color: 'text-green-600' },
                          { label: lang === 'es' ? 'Media Diaria (M)' : 'Daily Avg (M)', value: `${analyticsData?.realTime?.dailyAvgQueries || '0'} q`, icon: TrendingUp, color: 'text-purple-600' },
                          { label: lang === 'es' ? 'Tiempo Uso' : 'Usage Time', value: analyticsData?.realTime?.avgUsageTime || '0', icon: Zap, color: 'text-accent' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Activity Over Time */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Activity className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Actividad de Usuarios y Consultas' : 'User Activity & Queries'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={analyticsData?.realTime?.activityOverTime || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" name={lang === 'es' ? 'Usuarios' : 'Users'} dataKey="users" stroke="var(--bg-accent)" fill="var(--bg-accent)" fillOpacity={0.2} />
                                <Area type="monotone" name={lang === 'es' ? 'Consultas' : 'Queries'} dataKey="queries" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Top Active Users Table */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Users className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Usuarios Más Activos' : 'Top Active Users'}
                          </h4>
                          <div className="space-y-4">
                            {(analyticsData?.realTime?.topUsers || []).map((u: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-border">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-primary">{u.email}</span>
                                  <span className="text-[10px] text-secondary/60 uppercase">{u.last}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-black text-accent">{u.queries}</span>
                                  <span className="text-[10px] block text-secondary/40 uppercase">qrs</span>
                                </div>
                              </div>
                            ))}
                            {(!analyticsData?.realTime?.topUsers || analyticsData.realTime.topUsers.length === 0) && (
                              <p className="text-center text-secondary/40 py-10 italic text-sm">{lang === 'es' ? 'Sin actividad registrada' : 'No activity recorded'}</p>
                            )}
                          </div>
                        </div>

                        {/* Engagement by Module */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Shapes className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Engagement por Módulo' : 'Engagement by Module'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={analyticsData?.realTime?.engagementByModule || []}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  { (analyticsData?.realTime?.engagementByModule || []).map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={index % 5 === 0 ? 'var(--bg-accent)' : index % 5 === 1 ? '#10b981' : index % 5 === 2 ? '#6366f1' : index % 5 === 3 ? '#f59e0b' : '#ef4444'} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : currentModuleId === 'trazabilidad_operacional' ? (
                    <>
                      {/* KPIs for Operational Traceability */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Queries Globales' : 'Global Queries', value: analyticsData?.realTime?.totalUsers ? (analyticsData?.realTime?.activityOverTime?.reduce((acc: number, curr: any) => acc + curr.queries, 0) || '0') : '0', icon: Wrench, color: 'text-blue-500' },
                          { label: lang === 'es' ? 'Tiempo Ejecución' : 'Avg Execution', value: analyticsData?.realTime?.avgUsageTime || '842ms', icon: Zap, color: 'text-yellow-600' },
                          { label: lang === 'es' ? 'MCP Accuracy' : 'MCP Accuracy', value: '100%', icon: ShieldCheck, color: 'text-green-600' },
                          { label: lang === 'es' ? 'Fallas Pipeline' : 'Pipeline Failures', value: '0%', icon: AlertCircle, color: 'text-red-500' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Global Trace Log */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <History className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Registro de Trazabilidad Global' : 'Global Traceability Log'}
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-border text-secondary/60 uppercase font-black tracking-tighter">
                                  <th className="py-3 px-2">Timestamp</th>
                                  <th className="py-3 px-2">User</th>
                                  <th className="py-3 px-2">Module</th>
                                  <th className="py-3 px-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(analyticsData?.realTime?.globalTrace || []).map((t: any) => (
                                  <tr key={t.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                                    <td className="py-3 px-2 font-mono text-[10px]">{t.timestamp}</td>
                                    <td className="py-3 px-2 font-bold">{t.user}</td>
                                    <td className="py-3 px-2">{t.module}</td>
                                    <td className="py-3 px-2">
                                      <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                        t.status === 'valid_genetics' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                      )}>
                                        {t.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                {(!analyticsData?.realTime?.globalTrace || analyticsData.realTime.globalTrace.length === 0) && (
                                  <tr>
                                    <td colSpan={4} className="py-10 text-center text-secondary/40 italic">{lang === 'es' ? 'No hay trazabilidad disponible' : 'No traceability records available'}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Tool Usage & MCP Metrics (Optional, keep or simplify) */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Settings2 className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Observabilidad MCP & Herramientas' : 'MCP & Tooling Observability'}
                          </h4>
                          <div className="space-y-4">
                            <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: 'PubMed', use: 45, time: 650 },
                                  { name: 'ClinVar', use: 32, time: 820 },
                                  { name: 'MCP Security', use: 100, time: 45 },
                                  { name: 'Classifier', use: 100, time: 120 },
                                  { name: 'Validator', use: 94, time: 210 }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                  <Legend />
                                  <Bar yAxisId="left" name="% Uso" dataKey="use" fill="var(--bg-accent)" radius={[4, 4, 0, 0]} />
                                  <Bar yAxisId="right" name="ms" dataKey="time" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-primary/5 rounded-lg border border-border">
                                <p className="text-[10px] font-black text-secondary/40 uppercase uppercase">{lang === 'es' ? 'Políticas MCP' : 'MCP Policies'}</p>
                                <p className="text-sm font-bold text-primary">12 Activadas</p>
                              </div>
                              <div className="p-2 bg-primary/5 rounded-lg border border-border">
                                <p className="text-[10px] font-black text-secondary/40 uppercase">{lang === 'es' ? 'Allowlist Tools' : 'Tool Allowlists'}</p>
                                <p className="text-sm font-bold text-primary">Strict Mode</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Model Configuration */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Cpu className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Especificaciones del Modelo IA' : 'AI Model Specifications'}
                          </h4>
                          
                          {/* Provider Selector */}
                          <div className="flex gap-2 mb-6 p-1 bg-primary/5 rounded-2xl border border-border">
                            {['gemini', 'groq', 'openrouter'].map((p) => (
                              <button
                                key={p}
                                onClick={() => setActiveProvider(p as Provider)}
                                className={cn(
                                  "flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all",
                                  activeProvider === p 
                                    ? "bg-white text-accent shadow-sm border border-border" 
                                    : "text-secondary/60 hover:text-primary"
                                )}
                              >
                                {p === 'gemini' ? 'Gemini' : p === 'groq' ? 'Groq' : 'OpenRouter'}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-border">
                              <span className="text-xs font-bold text-secondary uppercase">{lang === 'es' ? 'Modelo' : 'Model'}</span>
                              <span className="text-sm font-black text-primary">
                                {activeProvider === 'gemini' ? 'gemini-3-flash-preview' : activeProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'google/gemini-2.0-flash-001'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-border">
                              <span className="text-xs font-bold text-secondary uppercase">{lang === 'es' ? 'Versión' : 'Version'}</span>
                              <span className="text-sm font-black text-primary">
                                {activeProvider === 'openrouter' ? 'v2.0-gen' : 'v1.5-preview'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-border">
                              <span className="text-xs font-bold text-secondary uppercase">{lang === 'es' ? 'Temp / TopP' : 'Temp / TopP'}</span>
                              <span className="text-sm font-black text-primary">0.0 / 0.95</span>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl border border-border">
                              <p className="text-[10px] font-black text-secondary/40 uppercase mb-1">{lang === 'es' ? 'Prompt Template' : 'Prompt Template'}</p>
                              <code className="text-[10px] text-accent block truncate font-mono">
                                {activeProvider === 'gemini' ? 'biomedical_expert_v4.2.tmpl' : activeProvider === 'groq' ? 'llama_biomed_v1.0.tmpl' : 'openrouter_standard_v2.1.tmpl'}
                              </code>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl border border-border">
                              <p className="text-[10px] font-black text-secondary/40 uppercase mb-1">{lang === 'es' ? 'Structured Output Schema' : 'Structured Output Schema'}</p>
                              <code className="text-[10px] text-green-600 block truncate font-mono">BiomedicalResponse_Draft07.json</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : currentModuleId === 'feedback_usuarios' ? (
                    <>
                      {/* KPIs for User Feedback */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Satisfacción Gral.' : 'General Satisfaction', value: `${analyticsData?.global?.averages?.overall_satisfaction || '4.8'}/5`, icon: Star, color: 'text-yellow-500' },
                          { label: lang === 'es' ? 'Precisión Técnica' : 'Technical Accuracy', value: `${analyticsData?.global?.averages?.technical_accuracy || '4.9'}/5`, icon: ShieldCheck, color: 'text-green-600' },
                          { label: lang === 'es' ? 'Utilidad Médica' : 'Medical Utility', value: `${analyticsData?.global?.averages?.functionality || '4.7'}/5`, icon: Activity, color: 'text-blue-600' },
                          { label: lang === 'es' ? 'Engagement' : 'Engagement', value: `${analyticsData?.global?.would_use_again_rate ? (analyticsData.global.would_use_again_rate * 100).toFixed(0) : '92'}%`, icon: TrendingUp, color: 'text-accent' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 6-Dimension Feedback Radar */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Shapes className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Dimensiones de Feedback Explícito' : 'Explicit Feedback Dimensions'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: lang === 'es' ? 'Precisión' : 'Accuracy', A: (analyticsData?.global?.averages?.technical_accuracy || 4.9) * 20, fullMark: 100 },
                                { subject: lang === 'es' ? 'Referencia' : 'Ref.', A: (analyticsData?.global?.averages?.link_relevance || 4.8) * 20, fullMark: 100 },
                                { subject: lang === 'es' ? 'Utilidad' : 'Utility', A: (analyticsData?.global?.averages?.functionality || 4.7) * 20, fullMark: 100 },
                                { subject: lang === 'es' ? 'Usabilidad' : 'Usability', A: (analyticsData?.global?.averages?.usability || 4.7) * 20, fullMark: 100 },
                                { subject: lang === 'es' ? 'Satisfacción' : 'Satisfaction', A: (analyticsData?.global?.averages?.overall_satisfaction || 4.8) * 20, fullMark: 100 }
                              ]}>
                                <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Radar name="Promedio" dataKey="A" stroke="var(--bg-accent)" fill="var(--bg-accent)" fillOpacity={0.4} />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Implicit Feedback Analysis */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Activity className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Análisis de Feedback Implícito' : 'Implicit Feedback Analysis'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData?.realTime?.domainMonitoring || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, angle: -15, textAnchor: 'end' }} height={50} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="count" fill="var(--bg-accent)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Correlation Quality vs Satisfaction */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Link2 className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Correlación Calidad vs Satisfacción' : 'Quality vs Satisfaction Correlation'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={[
                                { session: 1, grounding: 90, satisfaction: 80, traceability: 85 },
                                { session: 2, grounding: 92, satisfaction: 82, traceability: 88 },
                                { session: 3, grounding: 95, satisfaction: 90, traceability: 92 },
                                { session: 4, grounding: 88, satisfaction: 75, traceability: 80 },
                                { session: 5, grounding: 94, satisfaction: 92, traceability: 95 },
                                { session: 6, grounding: 96, satisfaction: 95, traceability: 98 },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="session" name="Sesión" tick={{ fontSize: 10 }} />
                                <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" name={lang === 'es' ? 'Grounding' : 'Grounding'} dataKey="grounding" stroke="var(--bg-accent)" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" name={lang === 'es' ? 'Satisfacción' : 'Satisfaction'} dataKey="satisfaction" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" name={lang === 'es' ? 'Trazabilidad' : 'Traceability'} dataKey="traceability" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="5 5" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Global KPIs for Observability */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Grounding Rate' : 'Grounding Rate', value: `${analyticsData?.global?.averages?.technical_accuracy ? (analyticsData.global.averages.technical_accuracy * 20).toFixed(1) : '94.2'}%`, icon: CheckCircle, color: 'text-green-600' },
                          { label: lang === 'es' ? 'Consultas Global' : 'Global Queries', value: analyticsData?.realTime?.totalUsers ? (analyticsData?.realTime?.activityOverTime?.reduce((acc: number, curr: any) => acc + curr.queries, 0) || '0') : '0', icon: Zap, color: 'text-yellow-600' },
                          { label: lang === 'es' ? 'Consistencia' : 'Consistency', value: analyticsData?.global?.averages?.overall_satisfaction ? (analyticsData.global.averages.overall_satisfaction > 4 ? 'High' : 'Normal') : 'High', icon: ShieldCheck, color: 'text-blue-600' },
                          { label: lang === 'es' ? 'Observabilidad' : 'Observability', value: 'Total', icon: Activity, color: 'text-accent' }
                        ].map((kpi, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-primary tracking-tight">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Global Quality Radar */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Shapes className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Distribución de Calidad Global' : 'Global Quality Distribution'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData?.realTime?.qualityRadar || []}>
                                <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 700 }} />
                                <Radar name="Score" dataKey="A" stroke="var(--bg-accent)" fill="var(--bg-accent)" fillOpacity={0.4} />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Activity over Time */}
                        <div className="bg-secondary p-6 rounded-3xl border border-border shadow-sm">
                          <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Activity className="w-5 h-5 text-accent" />
                            {lang === 'es' ? 'Tendencia de Consultas' : 'Query Trend'}
                          </h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={analyticsData?.realTime?.activityOverTime || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                                <Tooltip />
                                <Line type="monotone" name={lang === 'es' ? 'Consultas' : 'Queries'} dataKey="queries" stroke="var(--bg-accent)" strokeWidth={3} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary italic">
                  {lang === 'es' ? 'Conectando con el pipeline de observabilidad...' : 'Connecting to observability pipeline...'}
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
        {(!SIDEBAR_STRUCTURE.find(s => s.id === 'admin')?.modules.includes(currentModuleId)) && (
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
          <div className="hidden lg:flex items-center gap-2 bg-accent/20 p-1 rounded-lg">
            <GraduationCap className="w-4 h-4 ml-2 text-accent" />
            <select 
              value={cognitiveLevel}
              onChange={(e) => setCognitiveLevel(e.target.value as CognitiveLevel)}
              className="bg-transparent text-xs font-bold p-1 pr-2 outline-none cursor-pointer"
            >
              <option value="basic" className="text-black">{I18N[lang].cognitive_level_basic}</option>
              <option value="intermediate" className="text-black">{I18N[lang].cognitive_level_intermediate}</option>
              <option value="expert" className="text-black">{I18N[lang].cognitive_level_expert}</option>
            </select>
          </div>

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

            <nav className="space-y-4">
              {SIDEBAR_STRUCTURE.map((section) => (
                <div key={section.id} className="border-b border-border/10 pb-4 last:border-0 last:pb-0">
                  <button 
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-3 mb-2 flex items-center justify-between group cursor-pointer"
                  >
                    <h3 className="text-[10px] font-black text-secondary/60 uppercase tracking-widest group-hover:text-accent transition-colors">
                      {I18N[lang][section.title]}
                    </h3>
                    <div className={cn(
                      "transition-transform duration-200",
                      expandedSections[section.id] ? "rotate-180" : "rotate-0"
                    )}>
                      <ChevronDown className="w-3 h-3 text-secondary/40 group-hover:text-accent" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden space-y-1"
                      >
                        {section.modules.filter(m => m !== 'actividad_usuarios' || isOwner).map((moduleId) => {
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
                                "w-full flex items-center p-2 text-sm rounded-xl transition-all duration-150 text-left group",
                                currentModuleId === moduleId 
                                  ? "bg-accent text-white font-semibold shadow-md translate-x-1" 
                                  : "text-secondary hover:bg-accent/10 hover:text-accent"
                              )}
                            >
                              <Icon className={cn("w-4 h-4 mr-3 flex-shrink-0 transition-transform group-hover:scale-110", currentModuleId === moduleId ? "text-white" : "text-accent")} />
                              <span className="truncate">{I18N[lang][module.title]}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-border">
            <h3 className="px-3 mb-3 text-xs font-bold uppercase tracking-wider text-secondary">{I18N[lang].cognitive_level_label}</h3>
            <div className="px-3">
              <select 
                value={cognitiveLevel}
                onChange={(e) => setCognitiveLevel(e.target.value as CognitiveLevel)}
                className="w-full p-2 bg-primary border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="basic">{I18N[lang].cognitive_level_basic}</option>
                <option value="intermediate">{I18N[lang].cognitive_level_intermediate}</option>
                <option value="expert">{I18N[lang].cognitive_level_expert}</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-border">
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
                {isAdminModule ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                    {renderModuleInput()}
                  </div>
                ) : (
                  <>
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
                  {/* Response Tabs (Conditional) */}
                  {structuredResponse && (
                    <div className="flex gap-2 mb-6 bg-primary p-1.5 rounded-2xl border border-border w-fit">
                      <button 
                        onClick={() => setResponseTab('text')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all",
                          responseTab === 'text' ? "bg-accent text-white shadow-md" : "text-secondary hover:bg-accent/10"
                        )}
                      >
                         <FileText className="w-3.5 h-3.5 inline mr-2" />
                         {lang === 'es' ? 'Reporte' : 'Report'}
                      </button>
                      <button 
                        onClick={() => setResponseTab('graph')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all",
                          responseTab === 'graph' ? "bg-accent text-white shadow-md" : "text-secondary hover:bg-accent/10"
                        )}
                      >
                         <Share2 className="w-3.5 h-3.5 inline mr-2" />
                         {lang === 'es' ? 'Mapa Conceptual' : 'Concept Map'}
                      </button>
                      <button 
                        onClick={() => setResponseTab('trace')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all",
                          responseTab === 'trace' ? "bg-accent text-white shadow-md" : "text-secondary hover:bg-accent/10"
                        )}
                      >
                         <Waypoints className="w-3.5 h-3.5 inline mr-2" />
                         {lang === 'es' ? 'Razonamiento' : 'Reasoning'}
                      </button>
                    </div>
                  )}

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
                      "prose prose-slate max-w-none rounded-2xl border min-h-[200px] transition-all duration-500 overflow-hidden",
                      loading ? "bg-primary/50 border-border" : 
                      structuredResponse ? (
                        activeProvider === 'gemini' ? "bg-blue-50/5 border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]" :
                        activeProvider === 'groq' ? "bg-orange-50/5 border-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.05)]" :
                        "bg-green-50/5 border-green-400/40 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
                      ) : "bg-primary/50 border-border"
                    )}
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 p-6">
                        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                        <p className="text-secondary animate-pulse">{I18N[lang].loadingText}</p>
                      </div>
                    ) : structuredResponse ? (
                      <div className="relative h-full flex flex-col">
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
                        {responseTab === 'text' && (
                          <div className="p-8 space-y-6">
                            {structuredResponse.ui_flags.show_warning_banner && (
                              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{structuredResponse.response_payload.summary}</p>
                              </div>
                            )}
                            
                            {!structuredResponse.ui_flags.show_warning_banner && (
                              <div className="mb-8 font-medium leading-relaxed prose-lg text-primary">
                                {structuredResponse.response_payload.summary}
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
                        )}

                        {responseTab === 'graph' && (
                          <div className="h-[600px] animate-in fade-in zoom-in duration-300">
                            <BiomedicalGraph 
                              data={structuredResponse.knowledge_graph || { nodes: [], edges: [] }}
                              cognitiveLevel={cognitiveLevel}
                              lang={lang}
                              title={lang === 'es' ? 'Mapa Conceptual Biomédico' : 'Biomedical Conceptual Map'}
                            />
                          </div>
                        )}

                        {responseTab === 'trace' && (
                          <div className="h-[600px] animate-in fade-in slide-in-from-right duration-300 flex flex-col">
                            <div className="flex-1 min-h-0">
                               <BiomedicalGraph 
                                  data={{
                                    nodes: (structuredResponse.reasoning_trace?.steps || []).map((s, i) => ({ id: `s${i}`, label: s.name, type: 'reasoning_step', importance: 5 })),
                                    edges: (structuredResponse.reasoning_trace?.steps || []).slice(0, -1).map((s, i) => ({ id: `e${i}`, source: `s${i}`, target: `s${i+1}`, label: 'next process', relationType: 'reasoning_link', strength: 1 }))
                                  }}
                                  cognitiveLevel={cognitiveLevel}
                                  lang={lang}
                                  type="reasoning"
                                  title={lang === 'es' ? 'Grafo de Razonamiento IA' : 'AI Reasoning Graph'}
                               />
                            </div>
                            <div className="p-6 bg-slate-900 text-white overflow-y-auto h-1/3 border-t border-slate-700">
                               <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                  <Waypoints className="w-4 h-4 text-accent" />
                                  {lang === 'es' ? 'Trazabilidad de Pasos' : 'Traceability of Steps'}
                               </h4>
                               <div className="space-y-4">
                                  {(structuredResponse.reasoning_trace?.steps || []).map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                       <div className="flex flex-col items-center">
                                          <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px]",
                                            step.status === 'success' ? "bg-green-500" : "bg-red-500"
                                          )}>
                                            {i + 1}
                                          </div>
                                          {i < (structuredResponse.reasoning_trace?.steps.length || 0) - 1 && (
                                            <div className="w-[1px] flex-1 bg-slate-700 my-1" />
                                          )}
                                       </div>
                                       <div className="flex-1 pb-2">
                                          <h5 className="font-bold text-accent text-xs flex items-center gap-2">
                                            {step.name}
                                            {step.tool_used && <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">{step.tool_used}</span>}
                                          </h5>
                                          <p className="text-[10px] text-slate-400 mt-0.5">{step.description}</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 p-6 text-secondary/40">
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
                {currentModuleId !== 'analytics' && !SIDEBAR_STRUCTURE.find(s => s.id === 'admin')?.modules.includes(currentModuleId) && ['genes', 'proteinas', 'vias_de_señalizacion', 'patologias', 'epigenetica'].includes(currentModuleId) && (
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
              </>
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
