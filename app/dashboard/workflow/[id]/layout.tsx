// AutoTask Workflow Detail Layout
// Türkçe: Workflow detay sayfası için statik parametre üretimi

import { ReactNode } from 'react';

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// GitHub Pages static export için boş parametre listesi
// Gerçek deployment'da burası Supabase'den workflow ID'leri çekecek
export function generateStaticParams() {
  return [];
}
