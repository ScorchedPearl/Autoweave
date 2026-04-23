import React from 'react';
import { useDragContext } from '@/provider/dragprovider';
import NodePalettePanel from './_components/nonCollapsiblePannel';
import { Plus } from 'lucide-react';

/* ── Testing-page version: button stays at bottom center (fixed) ── */

const NodePalette: React.FC = () => {
  const { togglePalette, isPaletteOpen, setIsPaletteOpen } = useDragContext();

  const handleToggle = () => {
    if (togglePalette) togglePalette();
    else if (setIsPaletteOpen) setIsPaletteOpen(!isPaletteOpen);
  };

  const handleClose = () => {
    if (setIsPaletteOpen) setIsPaletteOpen(false);
  };

  return (
    <>
      {/* Fixed bottom-center add button for the testing page */}
      <button
        onClick={handleToggle}
        className={`
          fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto
          w-14 h-14 bg-black/80 hover:bg-black/90 border border-white/10
          text-white rounded-2xl shadow-2xl backdrop-blur-xl
          flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-105 active:scale-95 hover:shadow-cyan-500/20 hover:border-cyan-400/50
          ${isPaletteOpen ? 'rotate-45 bg-black/90 border-cyan-400/50 shadow-cyan-500/20' : 'rotate-0'}
        `}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Panel — no overlay, positioned right of sidebar */}
      <NodePalettePanel
        isOpen={isPaletteOpen ?? false}
        onClose={handleClose}
      />
    </>
  );
};

export default NodePalette;