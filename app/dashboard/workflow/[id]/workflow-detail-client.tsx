// AutoTask Workflow Detail Client Component
// Türkçe: Workflow detay ve adım düzenleme için client-side logic

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAutoTaskStore } from '@/lib/store';
import type { Workflow, WorkflowStep } from '@/types';

export function WorkflowDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { workflows, updateWorkflow } = useAutoTaskStore();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' }>>([]);

  useEffect(() => {
    const found = workflows.find(w => w.id === params.id);
    if (found) {
      setWorkflow(found);
    } else {
      router.push('/dashboard');
    }
  }, [params.id, workflows, router]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  const handleExecute = async () => {
    if (!workflow) return;

    setIsRunning(true);
    setLogs([]);
    addLog('Starting workflow execution...', 'info');

    try {
      // Try Chrome extension first
      if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.runtime) {
        addLog('Detected Chrome extension - executing locally...', 'info');

        const response = await (window as any).chrome.runtime.sendMessage({
          type: 'START_EXECUTION',
          payload: workflow,
        });

        if (response?.success) {
          addLog(`Execution completed: ${response.data.results.length} steps`, 'success');
          updateWorkflow(workflow.id, {
            lastExecutedAt: new Date(),
          });
        } else {
          addLog(`Execution failed: ${response?.error}`, 'error');
        }
      } else {
        // Fallback to Cloudflare Worker
        addLog('Executing via Cloudflare Worker...', 'info');

        const workerResponse = await fetch('http://localhost:8787/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow }),
        });

        if (workerResponse.ok) {
          const data = await workerResponse.json();
          addLog(`Worker execution completed: ${data.results?.length || 0} steps`, 'success');
          updateWorkflow(workflow.id, {
            lastExecutedAt: new Date(),
          });
        } else {
          addLog('Worker execution failed - ensure worker is running', 'error');
        }
      }
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }

    setIsRunning(false);
  };

  const handleStepUpdate = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!workflow) return;

    const updatedSteps = workflow.config.steps.map(s =>
      s.id === stepId ? { ...s, ...updates } : s
    );

    const updatedWorkflow = {
      ...workflow,
      config: { ...workflow.config, steps: updatedSteps },
      updatedAt: new Date(),
    };

    setWorkflow(updatedWorkflow);
    updateWorkflow(workflow.id, updatedWorkflow);
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'navigate': return '🌐';
      case 'scrape': return '🔍';
      case 'fill': return '✏️';
      case 'click': return '👆';
      case 'wait': return '⏱';
      case 'extract': return '📤';
      case 'ai-action': return '✨';
      default: return '📌';
    }
  };

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#888]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.1)] sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-[#888] hover:text-[#ff6b35] transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="px-6 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white font-semibold rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-lg hover:shadow-[#ff6b35/30] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Workflow'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Workflow Info */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">{workflow.name}</h1>
            <span className={`px-3 py-1 text-sm font-semibold uppercase rounded ${
              workflow.status === 'active' ? 'bg-[rgba(0,255,136,0.2)] text-[#00ff88]' :
              workflow.status === 'paused' ? 'bg-[rgba(255,107,53,0.2)] text-[#ff6b35]' :
              'bg-[rgba(136,136,136,0.2)] text-[#888]'
            }`}>
              {workflow.status}
            </span>
          </div>
          <p className="text-[#888]">{workflow.description}</p>
          {workflow.lastExecutedAt && (
            <div className="mt-2 text-sm text-[#555]">
              Last executed: {workflow.lastExecutedAt.toLocaleString()}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Steps Column */}
          <div>
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span>Steps</span>
              <span className="text-sm font-normal text-[#555]">({workflow.config.steps.length})</span>
            </h2>

            <div className="space-y-3">
              {workflow.config.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-4 border border-[rgba(255,255,255,0.1)] rounded-xl hover:border-[#ff6b35] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{getStepIcon(step.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-[#555]">#{index + 1}</span>
                        <span className="font-semibold capitalize">{step.type}</span>
                      </div>

                      {/* Step-specific config display */}
                      {step.type === 'navigate' && (
                        <div className="text-sm text-[#888] font-mono break-all">
                          URL: {(step.config as any).url}
                        </div>
                      )}

                      {step.type === 'scrape' && (
                        <div className="text-sm text-[#888] font-mono">
                          Selector: {(step.config as any).selector}
                        </div>
                      )}

                      {step.type === 'fill' && (
                        <div className="text-sm text-[#888]">
                          <div>Selector: {(step.config as any).selector}</div>
                          <div>Value: {(step.config as any).value}</div>
                        </div>
                      )}

                      {step.type === 'wait' && (
                        <div className="text-sm text-[#888]">
                          Duration: {(step.config as any).duration}ms
                        </div>
                      )}

                      {step.type === 'extract' && (
                        <div className="text-sm text-[#888]">
                          <div>Format: {(step.config as any).outputFormat}</div>
                          <div className="text-xs text-[#555] mt-1">
                            {Object.keys((step.config as any).selectors || {}).length} fields
                          </div>
                        </div>
                      )}

                      {step.type === 'ai-action' && (
                        <div className="text-sm text-[#888] line-clamp-2">
                          {(step.config as any).prompt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Log Column */}
          <div>
            <h2 className="text-lg font-semibold mb-6">Execution Log</h2>

            <div className="p-4 border border-[rgba(255,255,255,0.1)] rounded-xl bg-[#050505] min-h-[300px] max-h-[500px] overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-[#555] text-center py-12">
                  No logs yet. Run the workflow to see execution details.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        log.type === 'error' ? 'text-[#ff3366]' :
                        log.type === 'success' ? 'text-[#00ff88]' :
                        'text-[#888]'
                      }`}
                    >
                      <span className="text-[#555] shrink-0">[{log.time}]</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Info */}
              <div className="mt-6 p-4 border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.02)]">
                <h3 className="font-semibold mb-3">Execution Options</h3>
                <div className="space-y-2 text-sm text-[#888]">
                  <div className="flex items-center justify-between">
                    <span>Chrome Extension</span>
                    <span className={typeof window !== 'undefined' && 'chrome' in window ? 'text-[#00ff88]' : 'text-[#555]'}>
                      {typeof window !== 'undefined' && 'chrome' in window ? '✓ Detected' : '✗ Not found'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cloudflare Worker</span>
                    <span className="text-[#555]">localhost:8787</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
