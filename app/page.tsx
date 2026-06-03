// AutoTask Web Dashboard - Main Page
// Türkçe: Ana dashboard - workflow yönetimi

import Link from 'next/link';
import { getTemplateList } from '@/lib/templates';

export default function HomePage() {
  const templates = getTemplateList();

  return (
    <div className="min-h-screen">
      {/* Header - Bold typography + gradient accent */}
      <header className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              AutoTask
            </h1>
            <p className="text-sm text-[#888] mt-1">
              AI-powered browser automation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener"
              className="text-sm text-[#888] hover:text-[#ff6b35] transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#ff6b35] hover:bg-[#f72585] text-white font-semibold rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-lg hover:shadow-[#ff6b35/30]"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Bold statement */}
      <section className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h2 className="text-6xl font-bold leading-[0.95] tracking-tight mb-6">
              Automate
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#f72585]">
                Without Deployment
              </span>
            </h2>
            <p className="text-xl text-[#888] leading-relaxed mb-8 max-w-xl">
              Browser-native workflows that just work. No servers to manage,
              no复杂的 setup. Install the extension, pick a template, done.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white font-semibold rounded-lg transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-[#ff6b35/40]"
              >
                Get Started Free
              </Link>
              <a
                href="#templates"
                className="px-8 py-4 border border-[rgba(255,255,255,0.2)] rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                View Templates
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Editorial layout */}
      <section className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-3 gap-12">
            <div>
              <div className="text-5xl font-bold text-[#ff6b35] mb-2">0</div>
              <div className="text-sm text-[#888]">Deployment steps</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#ff6b35] mb-2">3</div>
              <div className="text-sm text-[#888]">Core templates</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#ff6b35] mb-2">∞</div>
              <div className="text-sm text-[#888]">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section - Cards showcase */}
      <section id="templates" className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#888] mb-4">
              Workflow Templates
            </h3>
            <h4 className="text-3xl font-bold">Ready-to-use automations</h4>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/dashboard?template=${template.id}`}
                className="group p-6 border border-[rgba(255,255,255,0.1)] rounded-xl hover:border-[#ff6b35] hover:bg-[rgba(255,107,53,0.05)] transition-all"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[rgba(255,107,53,0.2)] text-[#ff6b35] rounded-full">
                    {template.category}
                  </span>
                </div>
                <h5 className="text-xl font-semibold mb-2 group-hover:text-[#ff6b35] transition-colors">
                  {template.name}
                </h5>
                <p className="text-sm text-[#888] mb-4 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs text-[#555]">
                  <span>⏱ {template.estimatedTime}</span>
                  {template.requiresAI && <span>✨ AI-powered</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h4 className="text-4xl font-bold mb-6">
            Ready to automate?
          </h4>
          <p className="text-lg text-[#888] mb-8 max-w-xl mx-auto">
            Join the waitlist for early access. First 100 users get free Pro tier.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white font-semibold rounded-lg transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-[#ff6b35/40]"
          >
            Start Building Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-between text-sm text-[#555]">
          <div>© 2026 AutoTask. Part of Auto Company.</div>
          <div className="flex items-center gap-6">
            <a href="/docs" className="hover:text-[#ff6b35] transition-colors">Docs</a>
            <a href="/privacy" className="hover:text-[#ff6b35] transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-[#ff6b35] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
