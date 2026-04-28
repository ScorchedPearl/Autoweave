"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Settings, Save, Plus, Trash2, RotateCcw, AlertCircle,
  ChevronLeft, ChevronDown, ChevronRight, Info, Braces, Lock,
  Zap, PlayCircle, GitBranch, RefreshCw, Clock, Globe, Upload,
  Wrench, Bot, FileText, Cpu, MessageCircle, Tag, Bookmark,
  PenLine, Search, BarChart2, Calendar, Mail, Eye, EyeOff, FileEdit,
  Reply, Calculator, ArrowRight, Database, Key, Code2,
  Network, Share2, TrendingUp, AlertTriangle, Sigma, Terminal, Activity,
  ShieldCheck, Hash, Unlock, Wifi, ShieldAlert,
} from "lucide-react";
import { useWorkflow } from "@/provider/statecontext";
import { useDragContext } from "@/provider/dragprovider";
import {
  NODE_INPUT_REGISTRY,
  FieldSchema,
  FieldType,
} from "@/lib/nodeInputRegistry";
import { NODE_OUTPUT_REGISTRY, NodeOutputVar } from "@/lib/nodeOutputRegistry";

interface UpstreamVarGroup {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  nodeColor: string;
  vars: NodeOutputVar[];
}

function expandDotKeys(flat: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    if (parts.length === 1) {
      result[key] = value;
    } else {
      let cursor = result as any;
      for (let i = 0; i < parts.length - 1; i++) {
        if (typeof cursor[parts[i]] !== "object" || cursor[parts[i]] === null) cursor[parts[i]] = {};
        cursor = cursor[parts[i]];
      }
      cursor[parts[parts.length - 1]] = value;
    }
  }
  return result;
}

function flattenDotKeys(
  obj: Record<string, unknown>,
  registryKeys: Set<string>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      !registryKeys.has(full) &&
      [...registryKeys].some((rk) => rk.startsWith(full + "."))
    ) {
      Object.assign(result, flattenDotKeys(v as Record<string, unknown>, registryKeys, full));
    } else {
      result[full] = v;
    }
  }
  return result;
}


type IconComp = React.ElementType;
function getNodeIcon(nodeType: string): IconComp {
  const map: Record<string, IconComp> = {
    start: PlayCircle, trigger: Zap, condition: GitBranch,
    transform: RefreshCw, delay: Clock, httpGet: Globe,
    httpPost: Upload, httpPut: Wrench, httpDelete: Trash2,
    "text-generation": Bot, summarization: FileText,
    "ai-decision": Cpu, "question-answer": MessageCircle,
    "text-classification": Tag, "named-entity": Bookmark,
    translation: Globe, "content-generation": PenLine,
    "search-agent": Search, "data-analyst-agent": BarChart2,
    googleCalendar: Calendar, calculator: Calculator,
    currentTime: Clock, gmailSend: Mail, gmailSearch: Search,
    gmailMarkRead: Eye, gmailAddLabel: Tag,
    gmailCreateDraft: FileEdit, gmailReply: Reply, action: Mail,
    "gemini-auth": Key, "openai-auth": Key, "claude-auth": Key,
    "cp-solver": Code2, "cp-testgen": Code2, "cp-executor": Code2, "cp-agent": Code2,
    "postgres-db": Database, "mysql-db": Database, "mongo-db": Database, "postgres": Database,
    "k-means": Network, clusterization: Share2, "linear-regression": TrendingUp,
    "anomaly-detection": AlertTriangle, "text-embedding": Sigma,
    "python-task": Terminal, "db-health-check": Activity,
    "file-integrity-check": ShieldCheck, "get-my-ip": Globe, "hash-generator": Hash,
    "password-brute-force": Unlock, "port-scanner": Wifi, "sql-injection-scanner": ShieldAlert, "ssl-cert-checker": Lock,
  };
  return map[nodeType] || Zap;
}

function getNodeStyle(nodeType: string) {
  if (["start", "trigger"].includes(nodeType))
    return { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)", badge: "Trigger" };
  if (nodeType === "condition")
    return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", badge: "Logic" };
  if (["text-generation","summarization","ai-decision","question-answer","text-classification","named-entity","translation","content-generation","search-agent","data-analyst-agent"].includes(nodeType))
    return { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", badge: "AI" };
  if (nodeType.startsWith("gmail"))
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", badge: "Gmail" };
  if (["delay","transform","calculator","currentTime"].includes(nodeType))
    return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", badge: "Utility" };
  if (["httpGet","httpPost","httpPut","httpDelete"].includes(nodeType))
    return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", badge: "HTTP" };
  if (nodeType === "googleCalendar")
    return { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", badge: "Google" };
  if (["gemini-auth", "openai-auth", "claude-auth"].includes(nodeType))
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)", badge: "Auth" };
  if (["cp-solver", "cp-testgen", "cp-executor", "cp-agent"].includes(nodeType))
    return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", badge: "CP" };
  if (["postgres-db", "mysql-db", "mongo-db", "postgres"].includes(nodeType))
    return { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)", badge: "Database" };
  if (["k-means", "clusterization", "linear-regression", "anomaly-detection", "text-embedding", "python-task"].includes(nodeType))
    return { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", badge: "ML" };
  if (["file-integrity-check", "get-my-ip", "hash-generator", "password-brute-force", "port-scanner", "sql-injection-scanner", "ssl-cert-checker"].includes(nodeType))
    return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", badge: "Security" };
  if (nodeType === "db-health-check")
    return { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)", badge: "Database" };
  return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", badge: "Action" };
}


const baseInput = "w-full bg-[#0b0d12] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/25 focus:outline-none transition-all duration-150";
const focusColor = (color: string) => `focus:border-[${color}] focus:ring-1 focus:ring-[${color}]/30`;

function FieldHint({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 mt-1.5 text-[11px] text-white/35 leading-snug">
      <Info className="w-3 h-3 mt-px flex-shrink-0 text-white/25" />
      {text}
    </p>
  );
}

function TemplateBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-px rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 ml-1.5">
      <Braces className="w-2.5 h-2.5" />
      {"{{var}}"}
    </span>
  );
}

function FieldLabel({ schema, nodeColor }: { schema: FieldSchema; nodeColor: string }) {
  return (
    <div className="flex items-center gap-1 mb-1.5">
      <label className="text-[12px] font-semibold text-white/75">
        {schema.label}
        {schema.required && (
          <span style={{ color: nodeColor }} className="ml-0.5">*</span>
        )}
      </label>
      {schema.supportsTemplate && <TemplateBadge />}
      {!schema.required && (
        <span className="text-[9px] text-white/25 ml-auto font-normal">optional</span>
      )}
    </div>
  );
}

function TagsInput({
  value,
  onChange,
  placeholder,
  nodeColor,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  nodeColor: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#0b0d12] border border-white/[0.1] rounded-lg">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${nodeColor}18`, color: nodeColor, border: `1px solid ${nodeColor}30` }}
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="opacity-60 hover:opacity-100 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          className={`${baseInput} flex-1`}
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-30"
          style={{ backgroundColor: `${nodeColor}20`, color: nodeColor, border: `1px solid ${nodeColor}35` }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function MappingInput({
  value,
  onChange,
  nodeColor,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  nodeColor: string;
}) {
  const entries = Object.entries(value);
  const update = (oldKey: string, newKey: string, newVal: string) => {
    const next: Record<string, string> = {};
    for (const [k, v] of entries) {
      if (k === oldKey) next[newKey] = newVal;
      else next[k] = v;
    }
    onChange(next);
  };
  const remove = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };
  const add = () => onChange({ ...value, "": "" });

  return (
    <div className="space-y-2">
      {entries.length === 0 && (
        <p className="text-[11px] text-white/30 italic py-1">No mappings yet — click Add Row.</p>
      )}
      {entries.map(([k, v], i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={k}
            onChange={(e) => update(k, e.target.value, v)}
            placeholder="source key"
            className={`${baseInput} flex-1`}
          />
          <span className="text-white/25 text-sm flex-shrink-0">→</span>
          <input
            value={v}
            onChange={(e) => update(k, k, e.target.value)}
            placeholder="target key"
            className={`${baseInput} flex-1`}
          />
          <button
            onClick={() => remove(k)}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors"
        style={{ color: nodeColor, backgroundColor: `${nodeColor}15`, border: `1px solid ${nodeColor}30` }}
      >
        <Plus className="w-3 h-3" /> Add Row
      </button>
    </div>
  );
}

function SliderInput({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  nodeColor,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  nodeColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-white/40">
        <span>{min}</span>
        <span className="font-semibold text-white/70" style={{ color: nodeColor }}>{value}</span>
        <span>{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${nodeColor} 0%, ${nodeColor} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
          accentColor: nodeColor,
        }}
      />
    </div>
  );
}

function ToggleInput({
  value,
  onChange,
  nodeColor,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  nodeColor: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 group"
    >
      <div
        className="relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0"
        style={{
          backgroundColor: value ? nodeColor : "rgba(255,255,255,0.12)",
          boxShadow: value ? `0 0 8px ${nodeColor}40` : "none",
        }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: value ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
      <span className="text-[12px]" style={{ color: value ? nodeColor : "rgba(255,255,255,0.4)" }}>
        {value ? "Enabled" : "Disabled"}
      </span>
    </button>
  );
}

function VariablePicker({
  upstreamVars,
  onInsert,
}: {
  upstreamVars: UpstreamVarGroup[];
  onInsert: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!upstreamVars.length) return null;

  const totalVars = upstreamVars.reduce((sum, g) => sum + g.vars.length, 0);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Insert upstream variable"
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
        style={{
          backgroundColor: open ? "rgba(167,139,250,0.15)" : "rgba(167,139,250,0.08)",
          color: "#a78bfa",
          border: "1px solid rgba(167,139,250,0.25)",
        }}
      >
        <Braces className="w-3 h-3" />
        <span>{totalVars}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] max-w-[240px] bg-[#0d0f16] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.07]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Available Variables
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {upstreamVars.map((group) => (
              <div key={group.nodeId}>
                <div
                  className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                  style={{ color: group.nodeColor, backgroundColor: `${group.nodeColor}0a` }}
                >
                  <span className="truncate">{group.nodeLabel}</span>
                </div>
                {group.vars.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => { onInsert(v.key); setOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-white/[0.05] text-left transition-colors group"
                  >
                    <code className="text-[11px] font-mono text-violet-300 group-hover:text-violet-200 truncate">
                      {`{{${v.key}}}`}
                    </code>
                    <span
                      className="text-[9px] px-1.5 py-px rounded-full ml-2 flex-shrink-0 font-semibold"
                      style={{
                        backgroundColor:
                          v.type === "string"  ? "rgba(74,222,128,0.12)" :
                          v.type === "number"  ? "rgba(96,165,250,0.12)" :
                          v.type === "boolean" ? "rgba(251,191,36,0.12)" :
                          v.type === "array"   ? "rgba(167,139,250,0.12)" :
                          "rgba(248,113,113,0.12)",
                        color:
                          v.type === "string"  ? "#4ade80" :
                          v.type === "number"  ? "#60a5fa" :
                          v.type === "boolean" ? "#fbbf24" :
                          v.type === "array"   ? "#a78bfa" : "#f87171",
                      }}
                    >
                      {v.type}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const FASTAPI_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FASTAPI_URL) ||
  "http://localhost:8000";

function PdfUploadButton({
  onExtracted,
  nodeColor,
}: {
  onExtracted: (text: string) => void;
  nodeColor: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${FASTAPI_URL}/upload-pdf`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      onExtracted(data.text ?? "");
    } catch (err) {
      console.error("PDF upload failed", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title="Upload a PDF — extracted text will fill this field"
        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors disabled:opacity-50"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${nodeColor}55`,
          color: nodeColor,
        }}
      >
        {uploading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <FileText className="w-3 h-3" />
        )}
        {uploading ? "Reading…" : "Upload PDF"}
      </button>
    </>
  );
}

function FieldRenderer({
  schema,
  value,
  onChange,
  nodeColor,
  upstreamVars = [],
}: {
  schema: FieldSchema;
  value: any;
  onChange: (v: any) => void;
  nodeColor: string;
  upstreamVars?: UpstreamVarGroup[];
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inlineStyle = {
    "--focus-color": nodeColor,
  } as React.CSSProperties;

  const sharedInputClass = `${baseInput} focus:border-[${nodeColor}] focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]`;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = (key: string, isTextarea: boolean) => {
    const el = isTextarea ? textareaRef.current : inputRef.current;
    const cur = String(value ?? "");
    const pos = el?.selectionStart ?? cur.length;
    const snippet = `{{${key}}}`;
    onChange(cur.slice(0, pos) + snippet + cur.slice(pos));
    setTimeout(() => {
      if (el) {
        el.focus();
        const newPos = pos + snippet.length;
        el.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  switch (schema.type as FieldType) {
    case "textarea": {
      const showPicker = schema.supportsTemplate && upstreamVars.length > 0;
      const showPdf = schema.supportsPdf;
      const hasToolbar = showPicker || showPdf;
      return (
        <div className={hasToolbar ? "space-y-1" : ""}>
          {hasToolbar && (
            <div className="flex justify-end items-center gap-1.5">
              {showPdf && (
                <PdfUploadButton
                  onExtracted={(text) => onChange(text)}
                  nodeColor={nodeColor}
                />
              )}
              {showPicker && (
                <VariablePicker upstreamVars={upstreamVars} onInsert={(k) => insertAtCursor(k, true)} />
              )}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.placeholder}
            rows={schema.rows ?? 3}
            className={`${baseInput} resize-none leading-relaxed`}
            style={{ ...inlineStyle, minHeight: `${(schema.rows ?? 3) * 24}px` }}
            onFocus={(e) => { e.target.style.borderColor = nodeColor; e.target.style.boxShadow = `0 0 0 1px ${nodeColor}40`; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      );
    }

    case "select":
      return (
        <div className="relative">
          <select
            value={String(value ?? schema.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInput} appearance-none pr-8 cursor-pointer`}
            style={inlineStyle}
            onFocus={(e) => { e.target.style.borderColor = nodeColor; e.target.style.boxShadow = `0 0 0 1px ${nodeColor}40`; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          >
            {schema.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0b0d12] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        </div>
      );

    case "number":
      return (
        <input
          type="number"
          value={value ?? schema.defaultValue ?? ""}
          min={schema.min}
          max={schema.max}
          step={schema.step ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={schema.placeholder}
          className={baseInput}
          style={inlineStyle}
          onFocus={(e) => { e.target.style.borderColor = nodeColor; e.target.style.boxShadow = `0 0 0 1px ${nodeColor}40`; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
      );

    case "slider":
      return (
        <SliderInput
          value={typeof value === "number" ? value : (schema.defaultValue as number ?? schema.min ?? 0)}
          onChange={onChange}
          min={schema.min}
          max={schema.max}
          step={schema.step}
          nodeColor={nodeColor}
        />
      );

    case "boolean":
      return (
        <ToggleInput
          value={Boolean(value ?? schema.defaultValue)}
          onChange={onChange}
          nodeColor={nodeColor}
        />
      );

    case "tags":
      return (
        <TagsInput
          value={Array.isArray(value) ? value : (Array.isArray(schema.defaultValue) ? schema.defaultValue as string[] : [])}
          onChange={onChange}
          placeholder={schema.placeholder}
          nodeColor={nodeColor}
        />
      );

    case "mapping":
      return (
        <MappingInput
          value={value && typeof value === "object" && !Array.isArray(value) ? value : {}}
          onChange={onChange}
          nodeColor={nodeColor}
        />
      );

    case "url":
    case "email":
    case "text":
    default: {
      const showPicker = schema.supportsTemplate && upstreamVars.length > 0;
      const isPassword = schema.key.toLowerCase().includes("password") || schema.label.toLowerCase().includes("password") || schema.type === ("password" as any);
      const inputType = schema.type === "email" ? "email" : isPassword && !showPassword ? "password" : "text";

      return (
        <div className="flex gap-1.5 items-center relative">
          <input
            ref={inputRef}
            type={inputType}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.placeholder}
            className={`${baseInput} flex-1 ${isPassword ? "pr-8" : ""}`}
            style={inlineStyle}
            onFocus={(e) => { e.target.style.borderColor = nodeColor; e.target.style.boxShadow = `0 0 0 1px ${nodeColor}40`; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 text-white/40 hover:text-white/70 transition-colors"
              style={{ right: showPicker ? "36px" : "8px" }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {showPicker && <VariablePicker upstreamVars={upstreamVars} onInsert={(k) => insertAtCursor(k, false)} />}
        </div>
      );
    }
  }
}

function Section({
  title,
  count,
  color,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2 px-1 group"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color }}
          >
            {title}
          </span>
          <span
            className="text-[9px] px-1.5 py-px rounded-full font-semibold"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {count}
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/25" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-white/25" />
        )}
      </button>
      {open && <div className="space-y-4 pb-2">{children}</div>}
    </div>
  );
}

export const PropertiesPanel: React.FC = () => {
  const {
    selectedNode,
    selectedNodeId,
    enhancedNodes,
    updateNodeConfiguration,
    updateNodeData,
    isPropertiesCollapsed,
    setIsPropertiesCollapsed,
  } = useWorkflow();
  const { edges } = useDragContext();

  const upstreamVars = useMemo<UpstreamVarGroup[]>(() => {
    if (!selectedNode) return [];
    const upstreamIds = (edges ?? [])
      .filter((e) => e.target === selectedNode.id)
      .map((e) => e.source);
    return upstreamIds.flatMap((nodeId) => {
      const node = enhancedNodes.find((n) => n.id === nodeId);
      if (!node) return [];
      const vars = NODE_OUTPUT_REGISTRY[node.data.nodeType];
      if (!vars?.length) return [];
      return [{
        nodeId,
        nodeLabel: node.data.label || node.data.nodeType,
        nodeType: node.data.nodeType,
        nodeColor: getNodeStyle(node.data.nodeType).color,
        vars,
      }];
    });
  }, [selectedNode, edges, enhancedNodes]);

  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [outputsOpen, setOutputsOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    if (selectedNode) {
      const schema = NODE_INPUT_REGISTRY[selectedNode.data.nodeType];
      const savedConfig = selectedNode.data.configuration || {};
      const registryKeys = new Set(schema?.fields.map((f) => f.key) ?? []);
      const flattened = flattenDotKeys(savedConfig as Record<string, unknown>, registryKeys);
      if (schema) {
        for (const field of schema.fields) {
          if (!(field.key in flattened) && field.defaultValue !== undefined) {
            flattened[field.key] = field.defaultValue;
          }
        }
      }
      setLocalConfig(flattened);
      setHasUnsaved(false);
    } else {
      setLocalConfig({});
      setHasUnsaved(false);
    }
  }, [selectedNode, selectedNodeId]);

  const handleChange = useCallback((key: string, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
    setHasUnsaved(true);
  }, []);

  const handleSave = () => {
    if (!selectedNode) return;
    updateNodeConfiguration(selectedNode.id, expandDotKeys(localConfig));
    setHasUnsaved(false);
    setLastSyncTime(new Date());
  };

  const handleReset = () => {
    if (selectedNode) {
      setLocalConfig({ ...(selectedNode.data.configuration || {}) });
      setHasUnsaved(false);
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-[#080a0f]/40 backdrop-blur-2xl border border-white/[0.1] rounded-2xl h-full flex flex-col shadow-2xl">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Settings className="w-6 h-6 text-white/20" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white/50 mb-1">No node selected</h3>
            <p className="text-[12px] text-white/28 leading-relaxed max-w-[180px]">
              Click any node on the canvas to configure it here.
            </p>
          </div>
          <div className="w-full mt-2 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] text-left">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] text-white/30 font-semibold uppercase tracking-wider">
              <Settings className="w-3 h-3" /> Canvas Status
            </div>
            <div className="space-y-1 text-[11px] text-white/35">
              <div>Nodes on canvas: <span className="text-white/55">{enhancedNodes.length}</span></div>
              <div>Selected ID: <span className="text-white/55">{selectedNodeId || "—"}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPropertiesCollapsed) {
    const style = getNodeStyle(selectedNode.data.nodeType);
    return (
      <div
        className="w-10 bg-[#080a0f]/40 backdrop-blur-2xl border border-white/[0.1] rounded-2xl h-full flex flex-col items-center pt-4 gap-3 shadow-2xl"
      >
        <button
          onClick={() => setIsPropertiesCollapsed(false)}
          className="p-2 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          title="Expand"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {hasUnsaved && (
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: style.color }}
          />
        )}
      </div>
    );
  }

  const nodeType = selectedNode.data.nodeType;
  const style = getNodeStyle(nodeType);
  const NodeIcon = getNodeIcon(nodeType);
  const schema = NODE_INPUT_REGISTRY[nodeType];

  const requiredFields = schema?.fields.filter((f) => f.required) ?? [];
  const optionalFields = schema?.fields.filter((f) => !f.required) ?? [];

  return (
    <div className="w-80 bg-[#080a0f]/40 backdrop-blur-2xl border border-white/[0.1] rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">

      <div
        className="px-4 py-3.5 border-b border-white/[0.07]"
        style={{ background: `linear-gradient(180deg, ${style.bg} 0%, transparent 100%)` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
            >
              <NodeIcon className="w-[16px] h-[16px]" style={{ color: style.color }} />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white/88 leading-none mb-0.5">
                {selectedNode.data.label}
              </div>
              <span
                className="text-[9px] font-semibold px-1.5 py-px rounded-full"
                style={{ backgroundColor: `${style.color}18`, color: style.color }}
              >
                {style.badge}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {hasUnsaved && (
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: style.color }}
                title="Unsaved changes"
              />
            )}
            <button
              onClick={() => setIsPropertiesCollapsed(true)}
              className="p-1.5 rounded-lg text-white/25 hover:text-white/55 hover:bg-white/[0.05] transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {schema?.description && (
          <p className="mt-2.5 text-[11px] text-white/38 leading-relaxed">
            {schema.description}
          </p>
        )}

        {schema?.requiresGoogle && (
          <div
            className="mt-2.5 flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: `${style.color}12`, color: style.color, border: `1px solid ${style.color}25` }}
          >
            <Lock className="w-3 h-3 flex-shrink-0" />
            Requires Google authentication
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-b border-white/[0.07] space-y-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">
            Node Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className={baseInput}
            onFocus={(e) => { e.target.style.borderColor = style.color; e.target.style.boxShadow = `0 0 0 1px ${style.color}40`; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">
            Description
          </label>
          <textarea
            value={selectedNode.data.description || ""}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            rows={2}
            placeholder="Describe what this node does…"
            className={`${baseInput} resize-none`}
            onFocus={(e) => { e.target.style.borderColor = style.color; e.target.style.boxShadow = `0 0 0 1px ${style.color}40`; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {!schema ? (
          <GenericConfigEditor
            config={localConfig}
            onChange={(key, val) => handleChange(key, val)}
            onDelete={(key) => {
              const next = { ...localConfig };
              delete next[key];
              setLocalConfig(next);
              setHasUnsaved(true);
            }}
            onAdd={() => {
              const name = prompt("Field name:");
              if (name && !(name in localConfig)) handleChange(name, "");
            }}
            nodeColor={style.color}
          />
        ) : (
          <>
            {requiredFields.length > 0 && (
              <Section title="Required" count={requiredFields.length} color={style.color}>
                {requiredFields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel schema={field} nodeColor={style.color} />
                    <FieldRenderer
                      schema={field}
                      value={localConfig[field.key]}
                      onChange={(v) => handleChange(field.key, v)}
                      nodeColor={style.color}
                      upstreamVars={upstreamVars}
                    />
                    {field.hint && <FieldHint text={field.hint} />}
                  </div>
                ))}
              </Section>
            )}

            {optionalFields.length > 0 && (
              <div>
                <button
                  onClick={() => setOptionalOpen((v) => !v)}
                  className="w-full flex items-center justify-between py-2 px-1 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                      Optional Settings
                    </span>
                    <span className="text-[9px] px-1.5 py-px rounded-full font-semibold bg-white/[0.07] text-white/35">
                      {optionalFields.length}
                    </span>
                  </div>
                  {optionalOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-white/25" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                  )}
                </button>
                {optionalOpen && (
                  <div className="space-y-4 pb-2">
                    {optionalFields.map((field) => (
                      <div key={field.key}>
                        <FieldLabel schema={field} nodeColor={style.color} />
                        <FieldRenderer
                          schema={field}
                          value={localConfig[field.key]}
                          onChange={(v) => handleChange(field.key, v)}
                          nodeColor={style.color}
                          upstreamVars={upstreamVars}
                        />
                        {field.hint && <FieldHint text={field.hint} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {schema.fields.some((f) => f.supportsTemplate) && (
              <div className="mt-3 p-3 rounded-xl bg-violet-500/[0.07] border border-violet-500/[0.15]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Braces className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[11px] font-semibold text-violet-400">Template Variables</span>
                </div>
                <p className="text-[11px] text-violet-300/60 leading-relaxed">
                  Use <code className="text-violet-300 font-mono">{"{{variableName}}"}</code> in any{" "}
                  <span className="inline-flex items-center gap-0.5 text-violet-300">
                    <Braces className="w-2.5 h-2.5" />
                    <span className="text-[9px]">{"{{var}}"}</span>
                  </span>{" "}
                  field to inject a value from a previous node's output.
                </p>
              </div>
            )}
          </>
        )}

        {NODE_OUTPUT_REGISTRY[nodeType] && (
          <div className="mt-3">
            <button
              onClick={() => setOutputsOpen((v) => !v)}
              className="w-full flex items-center justify-between py-2 px-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Return Variables
                </span>
                <span className="text-[9px] px-1.5 py-px rounded-full font-semibold bg-white/[0.07] text-white/35">
                  {NODE_OUTPUT_REGISTRY[nodeType].length}
                </span>
              </div>
              {outputsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-white/25" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-white/25" />
              )}
            </button>
            {outputsOpen && (
              <div className="space-y-1.5 pb-2">
                <p className="text-[11px] text-white/30 px-1 mb-2 leading-snug">
                  Reference these in downstream nodes using{" "}
                  <code className="text-violet-400 font-mono text-[10px]">{"{{key}}"}</code>
                </p>
                {NODE_OUTPUT_REGISTRY[nodeType].map((v) => (
                  <div
                    key={v.key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowRight className="w-3 h-3 flex-shrink-0 text-white/20" />
                      <code className="text-[11px] font-mono text-white/65 truncate">{v.key}</code>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-white/35 truncate max-w-[70px]">{v.label}</span>
                      <span
                        className="text-[9px] px-1.5 py-px rounded-full font-semibold flex-shrink-0"
                        style={{
                          backgroundColor:
                            v.type === "string" ? "rgba(34,197,94,0.12)" :
                            v.type === "number" ? "rgba(96,165,250,0.12)" :
                            v.type === "boolean" ? "rgba(251,191,36,0.12)" :
                            v.type === "array" ? "rgba(167,139,250,0.12)" :
                            "rgba(248,113,113,0.12)",
                          color:
                            v.type === "string" ? "#4ade80" :
                            v.type === "number" ? "#60a5fa" :
                            v.type === "boolean" ? "#fbbf24" :
                            v.type === "array" ? "#a78bfa" :
                            "#f87171",
                        }}
                      >
                        {v.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.07] space-y-2.5">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasUnsaved}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
            style={
              hasUnsaved
                ? { backgroundColor: style.color, color: "#000", boxShadow: `0 0 16px ${style.color}30` }
                : { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }
            }
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleReset}
            disabled={!hasUnsaved}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium border transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed text-white/55 border-white/[0.12] hover:bg-white/[0.06] hover:text-white/80"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px]">
          {hasUnsaved ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: style.color }} />
              <span style={{ color: style.color }}>Unsaved changes</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
              <span className="text-white/30">
                {lastSyncTime ? `Saved at ${lastSyncTime.toLocaleTimeString()}` : "Saved"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function GenericConfigEditor({
  config,
  onChange,
  onDelete,
  onAdd,
  nodeColor,
}: {
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onDelete: (key: string) => void;
  onAdd: () => void;
  nodeColor: string;
}) {
  const entries = Object.entries(config);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Configuration</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors"
          style={{ color: nodeColor, backgroundColor: `${nodeColor}15`, border: `1px solid ${nodeColor}30` }}
        >
          <Plus className="w-3 h-3" /> Add Field
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <Settings className="w-7 h-7 mx-auto mb-2 text-white/15" />
          <p className="text-[12px] text-white/30">No fields yet.</p>
          <button onClick={onAdd} className="mt-1 text-[11px]" style={{ color: nodeColor }}>
            Add your first field
          </button>
        </div>
      ) : (
        entries.map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-semibold text-white/65 capitalize">
                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
              </label>
              <button
                onClick={() => onDelete(key)}
                className="p-1 rounded text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {typeof value === "boolean" ? (
              <ToggleInput value={value} onChange={(v) => onChange(key, v)} nodeColor={nodeColor} />
            ) : typeof value === "number" ? (
              <input
                type="number"
                value={value}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className={baseInput}
                onFocus={(e) => { e.target.style.borderColor = nodeColor; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            ) : (
              <input
                type="text"
                value={String(value ?? "")}
                onChange={(e) => onChange(key, e.target.value)}
                className={baseInput}
                onFocus={(e) => { e.target.style.borderColor = nodeColor; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            )}
            {typeof value === "string" && (value as string).includes("{{") && (
              <p className="mt-1 text-[10px] text-violet-400/60">Contains template variables</p>
            )}
            {key === "__error" && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-[11px]">
                <AlertCircle className="w-3 h-3" />
                <span>{String(value)}</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
