'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Node = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.g 
    initial={{ y: y + 10, opacity: 0 }}
    animate={{ y: y, opacity: 1 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    <motion.rect 
      x={x} y={y} width="40" height="32" rx="8"
      fill="#080a0f"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="1.5"
      animate={{ 
        stroke: ["rgba(255,255,255,0.1)", "rgba(6,182,212,0.8)", "rgba(255,255,255,0.1)"]
      }}
      transition={{ duration: 2, repeat: Infinity, delay: delay + 0.5 }}
    />
    <rect x={x + 8} y={y + 10} width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x={x + 8} y={y + 19} width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
  </motion.g>
);

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black overflow-hidden relative">
    
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative w-72 h-48 flex items-center justify-center z-10">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 192">
          
          <path d="M 64 56 C 86 56, 92 96, 124 96" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 64 136 C 86 136, 92 96, 124 96" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 164 96 L 224 96" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" strokeLinecap="round" />

          <motion.path 
            d="M 64 56 C 86 56, 92 96, 124 96" 
            stroke="#06b6d4" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 0.8] }}
          />
          <motion.path 
            d="M 64 136 C 86 136, 92 96, 124 96" 
            stroke="#06b6d4" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 0.8], delay: 0.3 }}
          />
          <motion.path 
            d="M 164 96 L 224 96" 
            stroke="#06b6d4" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 0.8], delay: 1 }}
          />

          <Node x={24} y={40} delay={0} />
          <motion.circle cx="64" cy="56" r="3" fill="#06b6d4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />

          <Node x={24} y={120} delay={0.2} />
          <motion.circle cx="64" cy="136" r="3" fill="#06b6d4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} />

          <Node x={124} y={80} delay={0.4} />
          <motion.circle cx="124" cy="96" r="3" fill="#1d4ed8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
          <motion.circle cx="164" cy="96" r="3" fill="#06b6d4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
          
          <motion.g transform="translate(124, 80)">
             <motion.circle 
               cx="20" cy="16" r="6" 
               fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="10 20"
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             />
          </motion.g>

          <Node x={224} y={80} delay={0.6} />
          <motion.circle cx="224" cy="96" r="3" fill="#1d4ed8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} />
        </svg>
      </div>

      <motion.div 
        className="mt-8 flex items-center gap-3 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex gap-1.5">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
          <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
          <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
        </div>
        <p className="text-[13px] font-medium text-cyan-50/80 tracking-widest uppercase">
          Initializing Workspace...
        </p>
      </motion.div>
    </div>
  );
};

export default Loader;
