import { Plus } from "lucide-react";

export function FloatingAddButton({ onClick, isOpen }: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={isOpen ? "Close node library" : "Open node library"}
      className={`
        w-11 h-11 bg-black/80 hover:bg-black/90 border border-white/10
        text-white rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto
        flex items-center justify-center flex-shrink-0
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95 hover:shadow-cyan-500/20 hover:border-cyan-400/50
        ${isOpen ? "rotate-45 bg-black/90 border-cyan-400/50 shadow-[0_0_16px_rgba(6,182,212,0.35)]" : "rotate-0"}
      `}
    >
      <Plus className="w-5 h-5" />
    </button>
  );
}