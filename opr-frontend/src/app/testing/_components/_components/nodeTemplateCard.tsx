import { NodeTemplate } from "@/lib/mockdata";
import { useDragContext } from "@/provider/dragprovider";
import {
  Zap, PlayCircle, GitBranch, RefreshCw, Clock, Globe, Upload,
  Wrench, Trash2, Bot, FileText, Cpu, MessageCircle, Tag, Bookmark,
  PenLine, Search, BarChart2, Calendar, Calculator, Mail, Eye,
  FileEdit, Reply, Key, Code2, Database,
  Network, Share2, TrendingUp, AlertTriangle, Sigma, Terminal, Activity,
  ShieldCheck, Hash, Unlock, Wifi, ShieldAlert, Lock,
} from "lucide-react";

type IconComp = React.ElementType;

function getNodeIcon(nodeType: string): IconComp {
  const map: Record<string, IconComp> = {
    start: PlayCircle, trigger: Zap, condition: GitBranch,
    transform: RefreshCw, delay: Clock, httpGet: Globe,
    httpPost: Upload, httpPut: Wrench, httpDelete: Trash2,
    "text-generation": Bot, summarization: FileText, "ai-decision": Cpu,
    "question-answer": MessageCircle, "text-classification": Tag,
    "named-entity": Bookmark, translation: Globe, "content-generation": PenLine,
    "search-agent": Search, "data-analyst-agent": BarChart2,
    googleCalendar: Calendar, calculator: Calculator, currentTime: Clock,
    gmailSend: Mail, gmailSearch: Search, gmailMarkRead: Eye,
    gmailAddLabel: Tag, gmailCreateDraft: FileEdit, gmailReply: Reply, action: Mail,
    "gemini-auth": Key, "openai-auth": Key, "claude-auth": Key,
    "cp-solver": Code2, "cp-testgen": Code2, "cp-executor": Code2, "cp-agent": Code2,
    "postgres-db": Database, "mysql-db": Database, "mongo-db": Database,
    "k-means": Network, clusterization: Share2, "linear-regression": TrendingUp,
    "anomaly-detection": AlertTriangle, "text-embedding": Sigma,
    "python-task": Terminal, "db-health-check": Activity,
    "file-integrity-check": ShieldCheck, "get-my-ip": Globe, "hash-generator": Hash,
    "password-brute-force": Unlock, "port-scanner": Wifi,
    "postgres": Database, "sql-injection-scanner": ShieldAlert, "ssl-cert-checker": Lock,
  };
  return map[nodeType] || Zap;
}

function getNodeStyle(nodeType: string) {
  if (["start", "trigger"].includes(nodeType))
    return { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.28)", badge: "Trigger" };
  if (["condition"].includes(nodeType))
    return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.28)", badge: "Logic" };
  if (["text-generation","summarization","ai-decision","question-answer","text-classification","named-entity","translation","content-generation","search-agent","data-analyst-agent"].includes(nodeType))
    return { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.28)", badge: "AI" };
  if (nodeType.startsWith("gmail"))
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.28)", badge: "Gmail" };
  if (["delay","transform","calculator","currentTime"].includes(nodeType))
    return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.28)", badge: "Utility" };
  if (["httpGet","httpPost","httpPut","httpDelete"].includes(nodeType))
    return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.28)", badge: "HTTP" };
  if (["googleCalendar"].includes(nodeType))
    return { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.28)", badge: "Google" };
  if (["gemini-auth", "openai-auth", "claude-auth"].includes(nodeType))
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.28)", badge: "Auth" };
  if (["cp-solver", "cp-testgen", "cp-executor", "cp-agent"].includes(nodeType))
    return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.28)", badge: "CP" };
  if (["postgres-db", "mysql-db", "mongo-db", "postgres"].includes(nodeType))
    return { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.28)", badge: "Database" };
  if (["k-means", "clusterization", "linear-regression", "anomaly-detection", "text-embedding", "python-task"].includes(nodeType))
    return { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.28)", badge: "ML" };
  if (["file-integrity-check", "get-my-ip", "hash-generator", "password-brute-force", "port-scanner", "sql-injection-scanner", "ssl-cert-checker"].includes(nodeType))
    return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.28)", badge: "Security" };
  if (nodeType === "db-health-check")
    return { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.28)", badge: "Database" };
  return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.28)", badge: "Action" };
}

export default function NodeTemplateCard({ template, onDragStart, onClick }: {
  template: NodeTemplate;
  onDragStart: (event: React.DragEvent, template: NodeTemplate) => void;
  onClick: (template: NodeTemplate) => void;
}) {
  const { isDragging, setIsDragging } = useDragContext();
  const style = getNodeStyle(template.type);
  const NodeIcon = getNodeIcon(template.type);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, template);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onClick(template)}
      className={`
        relative flex items-start gap-3 p-3 rounded-xl
        bg-[#0b0d12] border border-white/[0.07] cursor-pointer select-none
        transition-all duration-200 group
        hover:border-white/[0.15] hover:scale-[1.02]
        active:scale-[0.98]
        ${isDragging ? "opacity-50 scale-95" : ""}
      `}
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${style.border}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
      }}
    >
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: style.color }}
      />

      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
      >
        <NodeIcon className="w-[14px] h-[14px]" style={{ color: style.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[12px] font-semibold text-white/88 leading-none truncate">
            {template.label}
          </span>
          <span
            className="text-[9px] font-semibold px-1.5 py-px rounded-full flex-shrink-0"
            style={{ backgroundColor: `${style.color}18`, color: style.color }}
          >
            {style.badge}
          </span>
        </div>
        <p className="text-[11px] text-white/40 leading-snug line-clamp-2">
          {template.description}
        </p>
      </div>
    </div>
  );
}
