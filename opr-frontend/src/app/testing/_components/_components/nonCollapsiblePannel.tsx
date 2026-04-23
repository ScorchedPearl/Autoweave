"use client";

import { useDragContext } from "@/provider/dragprovider";
import { Layers, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NodeTemplateCard from "./nodeTemplateCard";

export default function NodePalettePanel({
  isOpen,
  onClose,
  position,
  setPosition,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  setPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
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

  // 🔥 DRAG
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // 🔥 HEIGHT LIMIT
  const [maxHeight, setMaxHeight] = useState(500);

  useEffect(() => {
    const updateHeight = () => {
      const margin = 20;
      const available = window.innerHeight - position.y - margin;
      setMaxHeight(Math.max(300, available));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [position.y]);

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

  const displayedTemplates = (filteredTemplates ?? []).filter(
    (t) =>
      search === "" ||
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        maxHeight,
      }}
      className="w-[380px] flex flex-col z-50"
    >
      {/* HEADER */}
      <div
        onMouseDown={handleMouseDown}
        className="p-4 border-b cursor-move"
        style={{
          background: "rgba(7, 9, 14, 0.9)",
          borderColor: "rgba(255,255,255,0.07)",
          borderTopLeftRadius: "1.25rem",
          borderTopRightRadius: "1.25rem",
        }}
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
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/35 hover:text-white/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white"
          />
        </div>

        {/* 🔥 CATEGORY PILLS BACK */}
        <div className="flex flex-wrap gap-1.5">
          {(categories ?? []).map((category) => {
            const catColor = categoryColors[category] ?? "#94a3b8";
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory?.(category)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: isActive ? catColor : `${catColor}14`,
                  color: isActive ? "#000" : catColor,
                  border: `1px solid ${
                    isActive ? catColor : `${catColor}30`
                  }`,
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{
          background: "rgba(7, 9, 14, 0.88)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "none",
          borderBottomLeftRadius: "1.25rem",
          borderBottomRightRadius: "1.25rem",
        }}
      >
        {/* 🔥 SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-3 bg-[#080a0f]">
          <div className="mb-2 text-[10px] text-white/30">
            {displayedTemplates.length} nodes
          </div>

          <div className="space-y-2">
            {displayedTemplates.length === 0 ? (
              <div className="py-10 text-center text-white/30 text-sm">
                No nodes found
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

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
          {draggedItem
            ? `Dragging: ${draggedItem.label}`
            : clickedItem
            ? `Selected: ${clickedItem.label}`
            : "Ready to add nodes"}
        </div>
      </div>
    </div>
  );
}