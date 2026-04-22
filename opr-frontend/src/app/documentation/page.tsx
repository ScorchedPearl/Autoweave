"use client";

import { useState } from "react";
import { BookOpen, Zap, Link2, Lightbulb, Plug, Play, Bot, HelpCircle } from "lucide-react";
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

type TabType = 'getting-started' | 'drag-drop' | 'connections' | 'use-cases' | 'integrations' | 'execution' | 'ai-nodes' | 'faq';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('getting-started');

  const tabs: Tab[] = [
    {
      id: 'getting-started',
      label: 'Getting Started',
      icon: <BookOpen className="w-4 h-4" />,
      component: <GettingStarted />,
    },
    {
      id: 'drag-drop',
      label: 'Drag & Drop',
      icon: <Zap className="w-4 h-4" />,
      component: <DragDropGuide />,
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: <Link2 className="w-4 h-4" />,
      component: <NodeConnections />,
    },
    {
      id: 'use-cases',
      label: 'Use Cases',
      icon: <Lightbulb className="w-4 h-4" />,
      component: <UseCases />,
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Plug className="w-4 h-4" />,
      component: <IntegrationGuide />,
    },
    {
      id: 'execution',
      label: 'Execution',
      icon: <Play className="w-4 h-4" />,
      component: <WorkflowExecution />,
    },
    {
      id: 'ai-nodes',
      label: 'AI Nodes',
      icon: <Bot className="w-4 h-4" />,
      component: <AINodes />,
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle className="w-4 h-4" />,
      component: <TroubleshootingFAQ />,
    },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
        <Header/>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 mb-4 ">
            Autoweave Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Learn how to build, connect, and automate your workflows with Autoweave. Complete guides for every feature.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-4 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'bg-card text-foreground border border-border hover:border-primary hover:bg-card/80'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
      <Footer/>
    </div>
  );
}