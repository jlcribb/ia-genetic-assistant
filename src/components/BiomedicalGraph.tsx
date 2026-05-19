import React, { useMemo, useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Edge, 
  Node, 
  Position,
  MarkerType,
  Handle,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Download, 
  Maximize2, 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Layers,
  ChevronRight,
  Info,
  RefreshCw,
  Map
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import dagre from 'dagre';
import { KnowledgeGraphData, CognitiveLevel, GraphNode, GraphEdge } from '../types';
import { cn } from '../lib/utils';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (which is center-based) to top-left
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

// Custom Node Component
const BiomedicalNode = ({ data }: { data: GraphNode & { onSelect: (id: string) => void } }) => {
  const getTypeConfig = (type: GraphNode['type']) => {
    switch (type) {
      case 'gene': return { icon: <Database size={12}/>, color: 'bg-blue-500', border: 'border-blue-600' };
      case 'protein': return { icon: <Layers size={12}/>, color: 'bg-indigo-500', border: 'border-indigo-600' };
      case 'pathway': return { icon: <Share2 size={12}/>, color: 'bg-purple-500', border: 'border-purple-600' };
      case 'disease': return { icon: <ShieldCheck size={12}/>, color: 'bg-red-500', border: 'border-red-600' };
      case 'variant': return { icon: <Info size={12}/>, color: 'bg-amber-500', border: 'border-amber-600' };
      case 'reasoning_step': return { icon: <Cpu size={12}/>, color: 'bg-accent', border: 'border-accent/80' };
      default: return { icon: <Info size={12}/>, color: 'bg-slate-500', border: 'border-slate-600' };
    }
  };

  const config = getTypeConfig(data.type);

  return (
    <div 
      className={cn(
        "px-4 py-2 rounded-xl shadow-lg border-2 bg-white flex items-center gap-2 min-w-[180px] transition-all hover:scale-105 cursor-pointer",
        config.border
      )}
      onClick={() => data.onSelect(data.id)}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-300" />
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0", config.color)}>
        {config.icon}
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="text-[10px] font-black uppercase text-slate-400 leading-none truncate">{data.type}</span>
        <span className="text-sm font-bold text-slate-800 leading-tight truncate">{data.label || 'Unknown'}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-300" />
    </div>
  );
};

const nodeTypes = {
  biomedical: BiomedicalNode,
};

interface Props {
  data: KnowledgeGraphData;
  cognitiveLevel: CognitiveLevel;
  lang: 'es' | 'en';
  title?: string;
  type?: 'knowledge' | 'reasoning';
}

export const BiomedicalGraph: React.FC<Props> = ({ data, cognitiveLevel, lang, title, type = 'knowledge' }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(true);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data.nodes.length) return;

    const initialNodes: Node[] = data.nodes.map((n) => ({
      id: n.id,
      type: 'biomedical',
      position: { x: 0, y: 0 },
      data: { ...n, onSelect: (id: string) => setSelectedNode(data.nodes.find(node => node.id === id) || null) },
    }));

    const initialEdges: Edge[] = data.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.strength > 0.8 || type === 'reasoning',
      style: { strokeWidth: 2, stroke: '#94a3b8' },
      labelStyle: { fontSize: 9, fontWeight: 600, fill: '#0f172a' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      type === 'reasoning' ? 'TB' : 'LR'
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [data, type, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const onExport = useCallback((format: 'png' | 'svg') => {
    const el = document.querySelector('.react-flow__renderer') as HTMLElement;
    if (!el) return;

    const fn = format === 'png' ? toPng : toSvg;
    fn(el, { backgroundColor: '#ffffff', skipFonts: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `graph-${new Date().getTime()}.${format}`;
        link.href = dataUrl;
        link.click();
      });
  }, []);

  return (
    <div className="h-[500px] w-full bg-slate-50 rounded-3xl border border-border shadow-inner relative overflow-hidden group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        {showMiniMap && (
          <MiniMap 
            nodeColor={(n) => {
              switch ((n.data as any).type) {
                case 'gene': return '#3b82f6';
                case 'protein': return '#6366f1';
                case 'disease': return '#ef4444';
                default: return '#94a3b8';
              }
            }}
            maskColor="rgba(248, 250, 252, 0.7)"
            className="!bg-white !rounded-2xl !border !border-border !shadow-lg"
          />
        )}

        <Panel position="top-left" className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-xl">
           <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-primary uppercase tracking-tight flex items-center gap-2">
                {type === 'knowledge' ? <Share2 size={16} className="text-accent" /> : <Cpu size={16} className="text-accent" />}
                {title || (lang === 'es' ? 'Mapa Conceptual' : 'Conceptual Map')}
              </h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                  cognitiveLevel === 'basic' ? "bg-green-100 text-green-700" : 
                  cognitiveLevel === 'intermediate' ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                )}>
                  {cognitiveLevel}
                </span>
                <span className="text-[10px] text-secondary font-medium">
                  {data.nodes.length} {lang === 'es' ? 'Entidades' : 'Entities'}
                </span>
              </div>
           </div>
        </Panel>

        <Panel position="top-right" className="flex gap-2">
          <button 
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-lg",
              showMiniMap ? "bg-accent text-white border-accent" : "bg-white text-primary border-border hover:bg-slate-50"
            )}
            title={lang === 'es' ? 'Alternar MiniMapa' : 'Toggle MiniMap'}
          >
            <Map size={18} />
          </button>
          <button 
            onClick={() => onLayout(type === 'reasoning' ? 'TB' : 'LR')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-border shadow-lg hover:bg-slate-50 transition-colors text-primary"
            title="Recalculate Layout"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => onExport('png')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-border shadow-lg hover:bg-slate-50 transition-colors text-primary"
            title="Download PNG"
          >
            <Download size={18} />
          </button>
          <button 
            className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            title="Full Screen"
          >
            <Maximize2 size={18} />
          </button>
        </Panel>

        <AnimatePresence>
          {selectedNode && (
            <Panel position="bottom-center" className="w-[90%] pointer-events-none">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white p-4 rounded-2xl border border-accent shadow-2xl pointer-events-auto flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{selectedNode.label}</h4>
                    <p className="text-xs text-secondary">{lang === 'es' ? 'Entidad detectada en respuesta IA' : 'Entity detected in AI response'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-secondary hover:bg-slate-50">
                    <ExternalLink size={12} />
                    NCBI / PubMed
                  </button>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
                  >
                    {lang === 'es' ? 'Cerrar' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </Panel>
          )}
        </AnimatePresence>
      </ReactFlow>

      {data.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[2px] z-20">
          <Share2 size={48} className="text-slate-300 mb-4 animate-pulse" />
          <p className="text-sm font-bold text-slate-400">{lang === 'es' ? 'No hay suficientes entidades para generar el mapa' : 'Not enough entities to generate the map'}</p>
        </div>
      )}
    </div>
  );
};
