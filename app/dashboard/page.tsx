// AutoTask Dashboard Page
// Türkçe: Workflow oluşturma ve yönetim sayfası

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAutoTaskStore } from '@/lib/store';
import { getTemplateList, getTemplateById } from '@/lib/templates';
import type { Workflow, WorkflowTemplateId } from '@/types';

export default function DashboardPage() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useAutoTaskStore();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateId | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const templates = getTemplateList();

  // Create workflow from template
  const handleCreateFromTemplate = (templateId: WorkflowTemplateId) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      templateId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        steps: template.defaultSteps,
      },
    };

    addWorkflow(workflow);
    setShowCreateModal(false);
    setSelectedTemplate(null);
    setNewWorkflowName('');
  };

  // Delete workflow
  const handleDelete = (id: string) => {
    if (confirm('Bu workflow\'u silmek istediğine emin misin?')) {
      deleteWorkflow(id);
    }
  };

  // Toggle workflow status
  const handleToggleStatus = (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    updateWorkflow(workflow.id, { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.1)] sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            AutoTask
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white font-semibold rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-lg hover:shadow-[#ff6b35/30]"
            >
              + New Workflow
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-12 p-6 border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.02)]">
          <div>
            <div className="text-3xl font-bold">{workflows.length}</div>
            <div className="text-sm text-[#888]">Total Workflows</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#00ff88]">
              {workflows.filter(w => w.status === 'active').length}
            </div>
            <div className="text-sm text-[#888]">Active</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#ff6b35]">
              {workflows.filter(w => w.status === 'draft').length}
            </div>
            <div className="text-sm text-[#888]">Draft</div>
          </div>
          <div className="text-sm text-[#555] font-mono">
            MVP v0.1.0
          </div>
        </div>

        {/* Workflows Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Workflows</h2>
          {workflows.length === 0 && (
            <span className="text-sm text-[#888]">Create your first workflow to get started</span>
          )}
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[rgba(255,255,255,0.2)] rounded-2xl">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No workflows yet</h3>
            <p className="text-[#888] mb-6">Create your first automation workflow</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white font-semibold rounded-lg"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-6 border border-[rgba(255,255,255,0.1)] rounded-xl hover:border-[#ff6b35] transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{workflow.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold uppercase rounded ${
                        workflow.status === 'active' ? 'bg-[rgba(0,255,136,0.2)] text-[#00ff88]' :
                        workflow.status === 'paused' ? 'bg-[rgba(255,107,53,0.2)] text-[#ff6b35]' :
                        'bg-[rgba(136,136,136,0.2)] text-[#888]'
                      }`}>
                        {workflow.status}
                      </span>
                      {workflow.templateId && (
                        <span className="text-xs text-[#555] font-mono">
                          {workflow.templateId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#888] mb-4">{workflow.description}</p>
                    <div className="flex items-center gap-6 text-xs text-[#555]">
                      <span>{workflow.config.steps.length} steps</span>
                      <span>Created {workflow.createdAt.toLocaleDateString()}</span>
                      {workflow.lastExecutedAt && (
                        <span>Last run {workflow.lastExecutedAt.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleStatus(workflow)}
                      className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                      title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {workflow.status === 'active' ? '⏸' : '▶️'}
                    </button>
                    <Link
                      href={`/dashboard/workflow/${workflow.id}`}
                      className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(workflow.id)}
                      className="p-2 hover:bg-[rgba(255,51,102,0.2)] text-[#ff3366] rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-2xl bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Create Workflow</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-2xl hover:text-[#ff6b35] transition-colors"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-[#888] uppercase tracking-wider">
                Choose Template
              </label>
              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="p-4 border border-[rgba(255,255,255,0.1)] rounded-xl hover:border-[#ff6b35] hover:bg-[rgba(255,107,53,0.05)] transition-all text-left"
                  >
                    <div className="mb-2">
                      <span className="text-2xl">
                        {template.id === 'lead-scraping' ? '🎯' :
                         template.id === 'form-filling' ? '📝' : '📊'}
                      </span>
                    </div>
                    <div className="font-semibold mb-1">{template.name}</div>
                    <div className="text-xs text-[#888]">{template.estimatedTime}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-[#555]">
              Templates provide pre-configured steps. Customize after creation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
