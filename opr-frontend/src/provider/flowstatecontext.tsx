"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type NodeExecState = "pending" | "running" | "completed" | "failed";

interface LastExecution {
  executionId: string;
  workflowId: string;
}

interface FlowStateContextType {
  lastExecution: LastExecution | null;
  setLastExecution: (exec: LastExecution | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflowResult: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWorkflowResult: (result: any) => void;
  showResultPanel: boolean;
  setShowResultPanel: (show: boolean) => void;
  currentWorkflowTitle: string;
  setCurrentWorkflowTitle: (title: string) => void;
  // Live execution tracking
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  nodeExecutionStates: Record<string, NodeExecState>;
  setNodeExecutionStates: (states: Record<string, NodeExecState>) => void;
}

const FlowStateContext = createContext<FlowStateContextType>({
  lastExecution: null,
  setLastExecution: () => {},
  workflowResult: null,
  setWorkflowResult: () => {},
  showResultPanel: false,
  setShowResultPanel: () => {},
  currentWorkflowTitle: "Untitled Workflow",
  setCurrentWorkflowTitle: () => {},
  isRunning: false,
  setIsRunning: () => {},
  activeNodeId: null,
  setActiveNodeId: () => {},
  nodeExecutionStates: {},
  setNodeExecutionStates: () => {},
});

export function FlowStateProvider({ children }: { children: ReactNode }) {
  const [lastExecution, setLastExecution] = useState<LastExecution | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [currentWorkflowTitle, setCurrentWorkflowTitle] = useState("Untitled Workflow");
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodeExecutionStates, setNodeExecutionStates] = useState<Record<string, NodeExecState>>({});

  return (
    <FlowStateContext.Provider
      value={{
        lastExecution, setLastExecution,
        workflowResult, setWorkflowResult,
        showResultPanel, setShowResultPanel,
        currentWorkflowTitle, setCurrentWorkflowTitle,
        isRunning, setIsRunning,
        activeNodeId, setActiveNodeId,
        nodeExecutionStates, setNodeExecutionStates,
      }}
    >
      {children}
    </FlowStateContext.Provider>
  );
}

export const useFlowState = () => useContext(FlowStateContext);
