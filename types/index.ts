// AutoTask Core Types
// Turkish comments for documentation, English for code

// Workflow template tipleri
export type WorkflowTemplateId = 'lead-scraping' | 'form-filling' | 'data-extraction';

// Temel workflow yapısı
export interface Workflow {
  id: string;
  name: string;
  description: string;
  templateId: WorkflowTemplateId | null;
  status: 'draft' | 'active' | 'paused' | 'error';
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  config: WorkflowConfig;
}

// Workflow configuration - her template farklı config kullanır
export interface WorkflowConfig {
  steps: WorkflowStep[];
  triggers?: TriggerConfig;
  aiConfig?: AIConfig;
}

// Adım tipleri
export interface WorkflowStep {
  id: string;
  type: 'navigate' | 'scrape' | 'fill' | 'click' | 'wait' | 'extract' | 'ai-action';
  order: number;
  config: StepConfig;
}

// Adım-specific config'ler
export type StepConfig =
  | NavigateStepConfig
  | ScrapeStepConfig
  | FillStepConfig
  | ClickStepConfig
  | WaitStepConfig
  | ExtractStepConfig
  | AIActionStepConfig;

export interface NavigateStepConfig {
  url: string;
}

export interface ScrapeStepConfig {
  selector: string;
  attribute?: string; // text, href, src, etc.
  multiple?: boolean;
}

export interface FillStepConfig {
  selector: string;
  value: string;
  fieldType?: 'input' | 'textarea' | 'select';
}

export interface ClickStepConfig {
  selector: string;
  waitFor?: number; // ms
}

export interface WaitStepConfig {
  duration: number; // ms
}

export interface ExtractStepConfig {
  selectors: Record<string, string>; // { fieldName: 'selector' }
  outputFormat: 'json' | 'csv';
}

export interface AIActionStepConfig {
  prompt: string;
  contextFrom?: string[]; // step IDs to use as context
  model?: 'gpt-4o-mini' | 'claude-haiku';
}

// Trigger configuration
export interface TriggerConfig {
  type: 'manual' | 'schedule' | 'webhook' | 'chrome-extension';
  schedule?: string; // cron expression
  webhookUrl?: string;
}

// AI configuration
export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'anthropic';
  model: string;
  maxTokens?: number;
}

// Execution result
export interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  result?: ExecutionResult;
  error?: string;
  logs: ExecutionLog[];
}

export interface ExecutionResult {
  data: unknown;
  extracted?: Record<string, unknown>;
  aiResponse?: string;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  stepId?: string;
  message: string;
}

// Template definitions for the 3 core workflows
export interface WorkflowTemplate {
  id: WorkflowTemplateId;
  name: string;
  description: string;
  category: 'lead-gen' | 'productivity' | 'data';
  estimatedTime: string; // "2-3 min"
  defaultSteps: WorkflowStep[];
  requiresAI: boolean;
}

// Chrome extension messages
export interface ChromeMessage {
  type: 'GET_WORKFLOW' | 'START_EXECUTION' | 'STOP_EXECUTION' | 'GET_STATUS';
  payload?: unknown;
}

export interface ChromeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
