"use client";

import { useState } from "react";
import {
  BookOpen, Zap, Link2, Lightbulb, Plug, Play, Bot, HelpCircle, ChevronRight,
} from "lucide-react";
import GettingStarted from "./_components/GettingStarted";
import DragDropGuide from "./_components/DragDropGuide";
import NodeConnections from "./_components/NodeConnections";
import UseCases from "./_components/UseCases";
import IntegrationGuide from "./_components/IntegrationGuide";
import WorkflowExecution from "./_components/WorkflowExecution";
import AINodes from "./_components/AINodes";
import TroubleshootingFAQ from "./_components/TroubleshootingFAQ";

import Header from "../_landingPage/header";
import Footer from "../_landingPage/footer";

type TabType = "getting-started" | "drag-drop" | "connections" | "use-cases" | "integrations" | "execution" | "ai-nodes" | "faq";

interface Tab {
  id: TabType;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  badge?: string;
}

const tabs: Tab[] = [
  { id: "getting-started", label: "Getting Started", shortLabel: "Start", icon: <BookOpen className="w-4 h-4" />, component: <GettingStarted />, badge: "Start here" },
  { id: "drag-drop", label: "Drag & Drop", shortLabel: "Editor", icon: <Zap className="w-4 h-4" />, component: <DragDropGuide /> },
  { id: "connections", label: "Connections", shortLabel: "Wiring", icon: <Link2 className="w-4 h-4" />, component: <NodeConnections /> },
  { id: "use-cases", label: "Use Cases", shortLabel: "Examples", icon: <Lightbulb className="w-4 h-4" />, component: <UseCases />, badge: "5 examples" },
  { id: "integrations", label: "Integrations", shortLabel: "Integrations", icon: <Plug className="w-4 h-4" />, component: <IntegrationGuide /> },
  { id: "execution", label: "Execution", shortLabel: "Run", icon: <Play className="w-4 h-4" />, component: <WorkflowExecution /> },
  { id: "ai-nodes", label: "AI Nodes", shortLabel: "AI", icon: <Bot className="w-4 h-4" />, component: <AINodes />, badge: "LangChain" },
  { id: "faq", label: "FAQ", shortLabel: "FAQ", icon: <HelpCircle className="w-4 h-4" />, component: <TroubleshootingFAQ /> },
];

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("getting-started");

  const active = tabs.find((t) => t.id === activeTab)!;
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-4">
            <BookOpen className="h-3 w-3" />
            Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            AutoWeave <span className="text-cyan-400">Docs</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Everything you need to build, connect, and automate AI-powered workflows — from your first node to production-grade pipelines.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar navigation */}
          <aside className="hidden lg:flex flex-col gap-1 w-52 flex-shrink-0 sticky top-24">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">Sections</p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-card border border-border text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                }`}
              >
                <span className={activeTab === tab.id ? "text-cyan-400" : ""}>{tab.icon}</span>
                <span className="flex-1">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile tab bar */}
            <div className="lg:hidden mb-6 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                      activeTab === tab.id
                        ? "bg-card border border-border text-foreground"
                        : "bg-background/40 border border-border text-muted-foreground"
                    }`}
                  >
                    {tab.icon}
                    {tab.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Breadcrumb + badge row */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Docs</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{active.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {active.badge && (
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400">{active.badge}</span>
                )}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>{activeIndex + 1}</span>
                  <span>/</span>
                  <span>{tabs.length}</span>
                </div>
              </div>
            </div>

            {/* Content card */}
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8 shadow-xl">
              {active.component}
            </div>

            {/* Prev / Next navigation */}
            <div className="flex justify-between mt-6 gap-4">
              {activeIndex > 0 ? (
                <button
                  onClick={() => setActiveTab(tabs[activeIndex - 1].id)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  {tabs[activeIndex - 1].label}
                </button>
              ) : <div />}
              {activeIndex < tabs.length - 1 && (
                <button
                  onClick={() => setActiveTab(tabs[activeIndex + 1].id)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-all ml-auto"
                >
                  {tabs[activeIndex + 1].label}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
