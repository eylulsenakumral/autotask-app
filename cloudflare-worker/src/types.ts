// Cloudflare Worker Types

export interface ProxyRequest {
  workflow: {
    id: string;
    steps: WorkflowStep[];
  };
  context?: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  type: 'navigate' | 'scrape' | 'fill' | 'click' | 'wait' | 'extract' | 'ai-action';
  order: number;
  config: StepConfig;
}

export type StepConfig =
  | { url: string }
  | { selector: string; attribute?: string; multiple?: boolean }
  | { selector: string; value: string; fieldType?: string }
  | { selector: string; waitFor?: number }
  | { duration: number }
  | { selectors: Record<string, string>; outputFormat: string }
  | { prompt: string; contextFrom?: string[]; model?: string; maxTokens?: number };

export interface ExecutionResult {
  stepId: string;
  type: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface WorkerResponse {
  success: boolean;
  results?: ExecutionResult[];
  executionId?: string;
  error?: string;
  mock?: boolean;
}
