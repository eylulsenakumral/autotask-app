// AutoTask Workflow Detail Page
// Türkçe: Workflow detay sayfası - Server Component

import { WorkflowDetailClient } from './workflow-detail-client';

// GitHub Pages static export için
export function generateStaticParams() {
  return [];
}

export default function WorkflowDetailPage() {
  return <WorkflowDetailClient />;
}
