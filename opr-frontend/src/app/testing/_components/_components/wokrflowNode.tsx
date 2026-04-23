import { useState, useCallback } from "react";
import { CustomNode } from "../drop-zone";
import { Handle, Position } from "@xyflow/react";
import {
  Settings, Minimize2, ChevronDown,
  Zap, PlayCircle, GitBranch, RefreshCw, Clock, Globe, Upload,
  Wrench, Trash2, Bot, FileText, Cpu, MessageCircle, Tag, Bookmark,
  PenLine, Search, BarChart2, Calendar, Calculator, Mail, Eye,
  FileEdit, Reply, CornerDownRight, Variable, Check, Key, Code2, Database,
} from "lucide-react";
import { NODE_OUTPUT_REGISTRY } from "@/lib/nodeOutputRegistry";
import { useWorkflow } from "@/provider/statecontext";

type IconComp = React.ElementType;

function getNodeIcon(nodeType: string): IconComp {
  const map: Record<string, IconComp> = {
    start: PlayCircle,
    trigger: Zap,
    condition: GitBranch,
    transform: RefreshCw,
    delay: Clock,
    httpGet: Globe,
    httpPost: Upload,
    httpPut: Wrench,
    httpDelete: Trash2,
    "text-generation": Bot,
    summarization: FileText,
    "ai-decision": Cpu,
    "question-answer": MessageCircle,
    "text-classification": Tag,
    "named-entity": Bookmark,
    translation: Globe,
    "content-generation": PenLine,
    "search-agent": Search,
    "data-analyst-agent": BarChart2,
    googleCalendar: Calendar,
    calculator: Calculator,
    currentTime: Clock,
    gmailSend: Mail,
    gmailSearch: Search,
    gmailMarkRead: Eye,
    gmailAddLabel: Tag,
    gmailCreateDraft: FileEdit,
    gmailReply: Reply,
    action: Mail,
    "gemini-auth": Key, "openai-auth": Key, "claude-auth": Key,
    "cp-solver": Code2, "cp-testgen": Code2, "cp-executor": Code2, "cp-agent": Code2,
    "postgres-db": Database, "mysql-db": Database, "mongo-db": Database,
  };
  return map[nodeType] || Zap;
}

interface NS { color: string; bg: string; border: string; badge: string }

function getNodeStyle(nodeType: string): NS {
  if (["start", "trigger"].includes(nodeType))
    return { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.28)", badge: "Trigger" };
  if (["condition"].includes(nodeType))
    return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.28)", badge: "Logic" };
  if (["text-generation", "summarization", "ai-decision", "question-answer", "text-classification", "named-entity", "translation", "content-generation", "search-agent", "data-analyst-agent"].includes(nodeType))
    return { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.28)", badge: "AI" };
  if (nodeType.startsWith("gmail"))
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.28)", badge: "Gmail" };
  if (["delay", "transform", "calculator", "currentTime"].includes(nodeType))
    return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.28)", badge: "Utility" };
  if (["httpGet", "httpPost", "httpPut", "httpDelete"].includes(nodeType))
    return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.28)", badge: "HTTP" };
  if (["googleCalendar"].includes(nodeType))
    return { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.28)", badge: "Google" };
  if (["gemini-auth", "openai-auth", "claude-auth"].includes(nodeType))
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.28)", badge: "Auth" };
  if (["cp-solver", "cp-testgen", "cp-executor", "cp-agent"].includes(nodeType))
    return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.28)", badge: "CP" };
  if (["postgres-db", "mysql-db", "mongo-db"].includes(nodeType))
    return { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.28)", badge: "Database" };
  return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.28)", badge: "Action" };
}

const TYPE_COLORS: Record<string, string> = {
  string: "#06b6d4",
  number: "#f59e0b",
  boolean: "#34d399",
  object: "#a78bfa",
  array: "#fb923c",
};

function ReturnVarPill({ varKey, label, type, nodeStyle }: {
  varKey: string;
  label: string;
  type: string;
  nodeStyle: NS;
}) {
  const { addReturnVariable, returnVariableTags } = useWorkflow();
  const [flashing, setFlashing] = useState(false);
  const isAdded = returnVariableTags.some(t => t.id === varKey);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addReturnVariable(varKey);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 1200);
  }, [addReturnVariable, varKey]);

  const typeColor = TYPE_COLORS[type] || "#94a3b8";

  return (
    <button
      onClick={handleClick}
      title={`Click to add {{${varKey}}} as return variable`}
      className="group relative flex items-center gap-1.5 rounded-md px-2 py-1 text-left transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]"
      style={{
        background: flashing
          ? `${nodeStyle.color}28`
          : isAdded
            ? `${nodeStyle.color}15`
            : "rgba(255,255,255,0.04)",
        border: `1px solid ${isAdded ? nodeStyle.color + "60" : "rgba(255,255,255,0.08)"}`,
        boxShadow: flashing ? `0 0 8px ${nodeStyle.color}55` : "none",
      }}
    >
     
      <span
        className="text-[8px] font-bold px-1 py-px rounded-sm flex-shrink-0"
        style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
      >
        {type}
      </span>

     
      <span
        className="text-[10px] font-mono leading-none"
        style={{ color: isAdded ? nodeStyle.color : "rgba(255,255,255,0.55)" }}
      >
        {`{{${varKey}}}`}
      </span>

      
      {isAdded && (
        <Check className="w-2.5 h-2.5 flex-shrink-0" style={{ color: nodeStyle.color }} />
      )}

      
      <span
        className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{ background: "rgba(0,0,0,0.85)", color: "rgba(255,255,255,0.8)" }}
      >
        {flashing ? "✓ Added!" : label}
      </span>
    </button>
  );
}

export default function WorkflowNode({
  data,
  selected,
  dragging,
}: {
  data: CustomNode["data"];
  selected?: boolean;
  dragging?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showReturnVars, setShowReturnVars] = useState(false);

  const style = getNodeStyle(data.nodeType);
  const NodeIcon = getNodeIcon(data.nodeType);
  const returnVars = NODE_OUTPUT_REGISTRY[data.nodeType] ?? [];

  if (!isExpanded) {
    return (
      <div
        className={`
          group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl
          bg-[#0b0d12] border cursor-pointer select-none
          transition-all duration-200
          ${dragging ? "scale-105 rotate-1 opacity-80" : ""}
        `}
        style={{
          width: 190,
          borderColor: selected ? style.color : style.border,
          boxShadow: selected
            ? `0 0 0 1.5px ${style.color}, 0 4px 20px rgba(0,0,0,0.5)`
            : "0 2px 12px rgba(0,0,0,0.45)",
        }}
        onClick={() => setIsExpanded(true)}
      >
        {(data.inputs ?? []).map((input, index) => (
          <Handle
            key={`in-${index}`}
            type="target"
            position={Position.Left}
            id={input.id}
            className="transition-all duration-150 !border-2 !border-[#0b0d12]"
            style={{
              top: `${16 + index * 18}px`,
              left: "-5px",
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: input.required ? style.color : "rgba(255,255,255,0.35)",
            }}
          />
        ))}

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
        >
          <NodeIcon className="w-[15px] h-[15px]" style={{ color: style.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white/88 leading-none mb-1 truncate">
            {data.label}
          </div>
          <span
            className="text-[9px] font-semibold px-1.5 py-px rounded-full"
            style={{ backgroundColor: `${style.color}18`, color: style.color }}
          >
            {style.badge}
          </span>
        </div>

        <ChevronDown
          className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0"
        />

        {(data.outputs ?? []).map((output, index) => (
          <Handle
            key={`out-${index}`}
            type="source"
            position={Position.Right}
            id={output.id}
            className="transition-all duration-150 !border-2 !border-[#0b0d12]"
            style={{
              top: `${16 + index * 18}px`,
              right: "-5px",
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: style.color,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden bg-[#0b0d12] border select-none
        transition-all duration-200
        ${dragging ? "scale-105 rotate-1 opacity-80" : ""}
      `}
      style={{
        width: 290,
        borderColor: selected ? style.color : style.border,
        boxShadow: selected
          ? `0 0 0 1.5px ${style.color}, 0 8px 32px rgba(0,0,0,0.6)`
          : "0 4px 24px rgba(0,0,0,0.55)",
      }}
    >
      {(data.inputs ?? []).map((input, index) => (
        <Handle
          key={`in-${index}`}
          type="target"
          position={Position.Left}
          id={input.id}
          className="!border-2 !border-[#0b0d12] transition-all duration-150"
          style={{
            top: `${46 + index * 24}px`,
            left: "-5px",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: input.required ? style.color : "rgba(255,255,255,0.35)",
          }}
        />
      ))}

      <div
        className="px-3 py-2.5 flex items-center gap-2.5"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
        >
          <NodeIcon className="w-[15px] h-[15px]" style={{ color: style.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white/88 leading-none mb-0.5 truncate">
            {data.label}
          </div>
          <span
            className="text-[9px] font-semibold px-1.5 py-px rounded-full"
            style={{ backgroundColor: `${style.color}18`, color: style.color }}
          >
            {style.badge}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {returnVars.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowReturnVars(!showReturnVars); }}
              className={`p-1.5 rounded-lg transition-colors ${showReturnVars
                  ? "text-white/80 bg-white/10"
                  : "text-white/25 hover:text-white/55 hover:bg-white/5"
                }`}
              title="Toggle return variables"
            >
              <Variable className="w-3 h-3" style={{ color: showReturnVars ? style.color : undefined }} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfig(!showConfig); }}
            className={`p-1.5 rounded-lg transition-colors ${showConfig
                ? "text-white/70 bg-white/8"
                : "text-white/25 hover:text-white/55 hover:bg-white/5"
              }`}
            title="Toggle config"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            className="p-1.5 rounded-lg text-white/25 hover:text-white/55 hover:bg-white/5 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        <p className="text-[11px] text-white/40 leading-relaxed">{data.description}</p>

        {data.inputs && data.inputs.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-white/22 uppercase tracking-widest mb-1">Inputs</p>
            <div className="flex flex-wrap gap-1">
              {data.inputs.map((inp, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: inp.required ? "rgba(255,255,255,0.15)" : `${style.color}35`,
                    color: inp.required ? "rgba(255,255,255,0.45)" : style.color,
                    backgroundColor: inp.required ? "transparent" : `${style.color}0a`,
                  }}
                >
                  {inp.label}
                  {inp.required && <span className="ml-0.5 text-[8px] opacity-60">*</span>}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.outputs && data.outputs.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-white/22 uppercase tracking-widest mb-1">Outputs</p>
            <div className="flex flex-wrap gap-1">
              {data.outputs.map((out, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40"
                >
                  {out.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {returnVars.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowReturnVars(!showReturnVars); }}
              className="flex items-center gap-1.5 w-full group mb-1.5"
            >
              <Variable
                className="w-3 h-3 flex-shrink-0"
                style={{ color: showReturnVars ? style.color : "rgba(255,255,255,0.25)" }}
              />
              <p
                className="text-[9px] font-semibold uppercase tracking-widest transition-colors"
                style={{ color: showReturnVars ? style.color : "rgba(255,255,255,0.25)" }}
              >
                Return Variables
              </p>
              <span
                className="text-[8px] px-1 py-px rounded-full ml-auto flex-shrink-0"
                style={{ backgroundColor: `${style.color}18`, color: style.color }}
              >
                {returnVars.length}
              </span>
              <ChevronDown
                className="w-2.5 h-2.5 flex-shrink-0 transition-transform duration-150"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  transform: showReturnVars ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {showReturnVars && (
              <>
                <p className="text-[9px] text-white/25 mb-1.5 leading-relaxed">
                  Click a variable to add it to workflow return variables
                </p>
                <div className="flex flex-col gap-1">
                  {returnVars.map((v) => (
                    <ReturnVarPill
                      key={v.key}
                      varKey={v.key}
                      label={v.label}
                      type={v.type}
                      nodeStyle={style}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {showConfig && data.config && (
          <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-1 mb-1.5">
              <CornerDownRight className="w-3 h-3 text-white/20" />
              <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">Config</p>
            </div>
            <pre className="text-[10px] text-white/38 whitespace-pre-wrap max-h-28 overflow-y-auto font-mono leading-relaxed">
              {JSON.stringify(data.config, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {(data.outputs ?? []).map((output, index) => (
        <Handle
          key={`out-${index}`}
          type="source"
          position={Position.Right}
          id={output.id}
          className="!border-2 !border-[#0b0d12] transition-all duration-150"
          style={{
            top: `${46 + index * 24}px`,
            right: "-5px",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: style.color,
          }}
        />
      ))}
    </div>
  );
}
