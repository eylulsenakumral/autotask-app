// AutoTask State Management - Zustand store
// Türkçe: Workflow ve execution state yönetimi

import { create } from 'zustand';
import type { Workflow, Execution } from '@/types';

interface AutoTaskStore {
  // State
  workflows: Workflow[];
  executions: Execution[];
  activeWorkflowId: string | null;
  isLoading: boolean;

  // Actions
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveWorkflow: (id: string | null) => void;

  // Execution actions
  addExecution: (execution: Execution) => void;
  updateExecution: (id: string, updates: Partial<Execution>) => void;
  getWorkflowExecutions: (workflowId: string) => Execution[];
}

export const useAutoTaskStore = create<AutoTaskStore>((set, get) => ({
  // Initial state
  workflows: [],
  executions: [],
  activeWorkflowId: null,
  isLoading: false,

  // Workflow actions
  addWorkflow: (workflow) =>
    set((state) => ({
      workflows: [...state.workflows, workflow],
    })),

  updateWorkflow: (id, updates) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      ),
    })),

  deleteWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      executions: state.executions.filter((e) => e.workflowId !== id),
      activeWorkflowId:
        state.activeWorkflowId === id ? null : state.activeWorkflowId,
    })),

  setActiveWorkflow: (id) =>
    set({ activeWorkflowId: id }),

  // Execution actions
  addExecution: (execution) =>
    set((state) => ({
      executions: [...state.executions, execution],
    })),

  updateExecution: (id, updates) =>
    set((state) => ({
      executions: state.executions.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  getWorkflowExecutions: (workflowId) => {
    const state = get();
    return state.executions.filter((e) => e.workflowId === workflowId);
  },
}));

// Selectors
export const selectWorkflowById = (state: AutoTaskStore, id: string) =>
  state.workflows.find((w) => w.id === id);

export const selectActiveWorkflow = (state: AutoTaskStore) =>
  state.activeWorkflowId ? selectWorkflowById(state, state.activeWorkflowId) : null;
