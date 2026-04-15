"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Layers, Search } from "lucide-react";
import { useDragContext } from "@/provider/dragprovider";
import NodeTemplateCard from "./_components/nodeTemplateCard";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  setPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
};

const NodePalettePanel: React.FC<Props> = ({
  isOpen,
  onClose,
  position,
  setPosition,
}) => {
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

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

  if (!isOpen) return null;

  const displayedTemplates = (filteredTemplates ?? []).filter(
    (t) =>
      search === "" ||
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
      className="w-[440px] max-h-[calc(100vh-5rem)] flex flex-col z-50"
    >
      <div
        onMouseDown={handleMouseDown}
        className="p-4 border-b cursor-move flex items-center justify-between"
        style={{
          background: "rgba(7, 9, 14, 0.9)",
          borderColor: "rgba(255,255,255,0.07)",
          borderTopLeftRadius: "1.25rem",
          borderTopRightRadius: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-sm font-medium">
            Node Library
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-white/10 text-white/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex flex-col"
        style={{
          background: "rgba(7, 9, 14, 0.88)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "none",
          borderBottomLeftRadius: "1.25rem",
          borderBottomRightRadius: "1.25rem",
          backdropFilter: "blur(24px)",
        }}
      >
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {displayedTemplates.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">
              No nodes found
            </p>
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
    </div>
  );
};

export default NodePalettePanel;