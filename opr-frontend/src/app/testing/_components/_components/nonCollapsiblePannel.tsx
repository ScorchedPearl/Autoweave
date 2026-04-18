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
    handleClick
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
  };

  const displayedTemplates = (filteredTemplates ?? []).filter(t =>
    search === "" ||
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${draggedItem ? 'pointer-events-none' : 'pointer-events-auto'}`}
        onClick={onClose}
      />

      <div className={`
        fixed left-1/2 bottom-28 -translate-x-1/2 w-[480px] max-h-[60vh] flex flex-col bg-black/70 backdrop-blur-2xl shadow-2xl z-50 pointer-events-auto
        border border-white/10 rounded-2xl overflow-hidden
        transform transition-all duration-300 ease-out origin-bottom
        ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}
      `}>
        <div className="p-4 border-b border-white/[0.07] bg-[#0b0d12] rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-semibold text-[13px] text-white leading-none">Node Library</h2>
                <p className="text-[10px] text-white/35 mt-0.5">Drag or click to add</p>
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
            {(categories ?? []).map(category => {
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

        <div className="flex-1 overflow-y-auto p-3 bg-[#080a0f]">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <span className="text-[10px] text-white/30 font-medium">
              {displayedTemplates.length} node{displayedTemplates.length !== 1 ? "s" : ""}
              {search ? ` matching "${search}"` : selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            </span>
          </div>

          <div className="space-y-2">
            {displayedTemplates.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="w-6 h-6 mx-auto mb-2 text-white/20" />
                <p className="text-[12px] text-white/30">No nodes found</p>
              </div>
            ) : (
              displayedTemplates.map(template => (
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

        <div className="p-6 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent rounded-b-2xl">
          <div className="space-y-3">
            <div className="font-medium text-white text-sm">Activity Status</div>
            {draggedItem && (
              <div className="text-cyan-300 flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
                <span>Dragging: {draggedItem.label}</span>
              </div>
            )}
            {clickedItem && (
              <div className="text-white flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Selected: {clickedItem.label}</span>
              </div>
            )}
            {!draggedItem && !clickedItem && (
              <div className="text-white/50 flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-white/40 rounded-full" />
                <span>Ready to add nodes to workflow</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
