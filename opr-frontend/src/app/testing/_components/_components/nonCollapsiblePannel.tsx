import { useDragContext } from "@/provider/dragprovider";
import { Layers, Search, X } from "lucide-react";
import { useState } from "react";
import NodeTemplateCard from "./nodeTemplateCard";

export default function NodePalettePanel({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    selectedCategory,
    setSelectedCategory,
    draggedItem,
    clickedItem,
    categories,
    filteredTemplates,
    handleDragStart,
    handleClick,
  } = useDragContext();

  const [search, setSearch] = useState("");

  const categoryColors: Record<string, string> = {
    All: "#94a3b8",
    Triggers: "#06b6d4",
    Logic: "#f59e0b",
    AI: "#a78bfa",
    Gmail: "#f87171",
    Utilities: "#94a3b8",
    Actions: "#22c55e",
    Processing: "#60a5fa",
    HTTP: "#22c55e",
    Authentication: "#fbbf24",
    "AI Agents": "#34d399",
    Database: "#818cf8",
  };

  const displayedTemplates = (filteredTemplates ?? []).filter((t) =>
    search === "" ||
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    /* NO dark overlay - panel only, visible canvas behind */
    <div
      className="fixed top-16 left-[340px] w-[440px] max-h-[calc(100vh-5rem)] flex flex-col pointer-events-auto z-50"
      style={{
        background: "rgba(7, 9, 14, 0.88)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "1.25rem",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold text-[13px] text-white leading-none">
                Node Library
              </h2>
              <p className="text-[10px] text-white/35 mt-0.5">
                Drag or click to add
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/35 hover:text-white/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {(categories ?? []).map((category) => {
            const catColor = categoryColors[category] ?? "#94a3b8";
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory?.(category)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-150"
                style={{
                  backgroundColor: isActive ? catColor : `${catColor}14`,
                  color: isActive ? "#000" : catColor,
                  border: `1px solid ${isActive ? catColor : `${catColor}30`}`,
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#080a0f]" style={{ borderRadius: "0 0 1.25rem 1.25rem" }}>
        <div className="mb-2.5 flex items-center justify-between px-1">
          <span className="text-[10px] text-white/30 font-medium">
            {displayedTemplates.length} node
            {displayedTemplates.length !== 1 ? "s" : ""}
            {search
              ? ` matching "${search}"`
              : selectedCategory !== "All"
              ? ` in ${selectedCategory}`
              : ""}
          </span>
        </div>

        <div className="space-y-2">
          {displayedTemplates.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-6 h-6 mx-auto mb-2 text-white/20" />
              <p className="text-[12px] text-white/30">No nodes found</p>
            </div>
          ) : (
            displayedTemplates.map((template) => (
              <NodeTemplateCard
                key={template.type}
                template={template}
                onDragStart={handleDragStart ?? (() => {})}
                onClick={handleClick ?? (() => {})}
              />
            ))
          )}
        </div>
      </div>

      {/* Status footer */}
      <div
        className="px-4 py-3 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "0 0 1.25rem 1.25rem",
        }}
      >
        <div className="flex items-center gap-2">
          {draggedItem ? (
            <>
              <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
              <span className="text-[11px] text-cyan-300/70">
                Dragging: <span className="text-cyan-300">{draggedItem.label}</span>
              </span>
            </>
          ) : clickedItem ? (
            <>
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <span className="text-[11px] text-white/50">
                Added: {clickedItem.label}
              </span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              <span className="text-[11px] text-white/30">
                Ready — drag nodes onto the canvas
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}