"use client";
import { DragProvider } from "@/provider/dragprovider";
import { WorkflowProvider } from "@/provider/statecontext";
import { PropertiesPanel } from "../testing/_components/properties";
import Sidebar from "./sidebar";
import CanvasDropZone from "../testing/_components/drop-zone";
import { SidebarProvider } from "@/provider/sidebarContext";
import { UserProvider } from "@/provider/userprovider";
import { FlowStateProvider } from "../../provider/flowstatecontext";
import { useDragContext } from "@/provider/dragprovider";
import { FloatingAddButton } from "../testing/_components/_components/addButton";
import NodePalettePanel from "../testing/_components/_components/nonCollapsiblePannel";
import { useFlowState } from "../../provider/flowstatecontext";
import { PerformancePanelButton } from "@/components/PerformancePanel";
import { Database, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

/* ── Bottom-right overlay: Intelligence + Results buttons ── */
function BottomRightOverlay() {
  const { lastExecution, workflowResult, showResultPanel, setShowResultPanel } =
    useFlowState();
  const [showInline, setShowInline] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

  if (!lastExecution && !workflowResult) return null;

  return (
    <div className="absolute bottom-6 right-[340px] z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Results quick panel */}
      {workflowResult && showInline && (
        <ResultsQuickPanel
          result={workflowResult}
          onClose={() => setShowInline(false)}
        />
      )}

      <div className="flex items-center gap-2">
        {workflowResult && (
          <button
            onClick={() => setShowInline((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:scale-[1.03]"
            style={{
              background:
                "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.08) 100%)",
              border: "1px solid rgba(6,182,212,0.3)",
              color: "#67e8f9",
              boxShadow: "0 0 14px rgba(6,182,212,0.12)",
            }}
          >
            {showInline ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
            {showInline ? "Hide Results" : "View Results"}
          </button>
        )}

        {lastExecution && (
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <PerformancePanelButton
              executionId={lastExecution.executionId}
              workflowId={lastExecution.workflowId}
              apiBase={apiBase}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline results panel ── */
function ResultsQuickPanel({
  result,
  onClose,
}: {
  result: any;
  onClose: () => void;
}) {
  let vars: Record<string, unknown> = {};
  if (result && typeof result === "object") {
    vars =
      result.variables ||
      result.data ||
      result.returns ||
      (result.executionId ? {} : result);
  }
  const entries = Object.entries(vars);

  return (
    <div
      className="w-72 max-h-80 flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "rgba(7,9,14,0.92)",
        border: "1px solid rgba(6,182,212,0.22)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(6,182,212,0.08)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold text-white/80">
            Execution Results
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {entries.length === 0 ? (
          <p className="text-[11px] text-white/30 text-center py-4">
            No return variables captured
          </p>
        ) : (
          entries.map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                className="flex items-center justify-between px-2.5 py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-[10px] font-mono text-cyan-300/80">
                  {key}
                </span>
                <span className="text-[8px] px-1.5 py-px rounded bg-white/8 text-white/40">
                  {typeof value}
                </span>
              </div>
              <pre className="text-[10px] text-white/55 font-mono px-2.5 py-1.5 whitespace-pre-wrap break-all max-h-16 overflow-y-auto">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </pre>
            </div>
          ))
        )}
      </div>

      <div
        className="px-4 py-2 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[9px] text-white/25">
          Execution ID: {result?.executionId?.slice(0, 12)}…
        </span>
      </div>
    </div>
  );
}


function FlowLayout() {
  const { isPaletteOpen, setIsPaletteOpen, togglePalette } = useDragContext();

  const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // ✅ Position BELOW button + SHIFT LEFT (avoid properties panel)
  useEffect(() => {
    if (buttonRef.current && isPaletteOpen) {
      const rect = buttonRef.current.getBoundingClientRect();

      setPalettePosition({
        x: rect.left - 260, // 👈 SHIFT LEFT (important fix)
        y: rect.bottom + 10,
      });
    }
  }, [isPaletteOpen]);

  const handleToggle = () => {
    if (togglePalette) togglePalette();
    else if (setIsPaletteOpen) setIsPaletteOpen(!isPaletteOpen);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Canvas */}
      <div className="absolute inset-0 z-0">
        <CanvasDropZone />
      </div>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex justify-between">
        {/* Sidebar */}
        <div className="pointer-events-auto h-full py-4 pl-4">
          <Sidebar />
        </div>

        {/* Right Side */}
        <div className="pointer-events-auto h-full py-4 pr-4 flex items-start gap-2">
          <div ref={buttonRef} className="mt-1">
            <FloatingAddButton
              onClick={handleToggle}
              isOpen={isPaletteOpen ?? false}
            />
          </div>
          <PropertiesPanel />
        </div>
      </div>

      {/* ✅ Panel */}
      <NodePalettePanel
        isOpen={isPaletteOpen ?? false}
        onClose={() => setIsPaletteOpen && setIsPaletteOpen(false)}
        position={palettePosition}
        setPosition={setPalettePosition}
      />

      {/* Results + Performance buttons (bottom-right) */}
      <BottomRightOverlay />
    </div>
  );
}


export default function FlowPage() {
  return (
    <UserProvider>
      <SidebarProvider>
        <DragProvider>
          <WorkflowProvider>
            <FlowStateProvider>
              <FlowLayout />
            </FlowStateProvider>
          </WorkflowProvider>
        </DragProvider>
      </SidebarProvider>
    </UserProvider>
  );
}