# AutoTask - AI Browser Automation

Zero-deployment browser automation powered by AI. No servers to manage, no complex setup.

## MVP Status

**Version:** 0.1.0 (Working MVP)
**Status:** Development complete, testing phase

## What Works

✅ **3 Core Workflow Templates**
- Lead Scraping - Extract leads from LinkedIn, Crunchbase, company sites
- Form Filling - Auto-fill contact forms, registrations, surveys
- Data Extraction - Pull structured data from product pages, articles

✅ **Web Dashboard** - Next.js 15 App Router with distinctive brutalist design
✅ **Chrome Extension** - Manifest V3 with popup UI and background service worker
✅ **Cloudflare Worker** - Browser automation backend (Browserbase integration ready)
✅ **State Management** - Zustand store for workflows and executions

## Quick Start

### 1. Web Dashboard

```bash
cd projects/autotask
npm install
npm run dev
```

Visit http://localhost:3000

### 2. Chrome Extension

```bash
cd projects/autotask/chrome-extension
# Load unpacked in Chrome: chrome://extensions/ -> Developer mode -> Load unpacked
```

### 3. Cloudflare Worker (Optional - for production)

```bash
cd projects/autotask
npm install -D wrangler @cloudflare/workers-types
# Set secrets:
wrangler secret put BROWSERBASE_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler dev cloudflare-worker/src/index.ts
```

## Project Structure

```
autotask/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Dashboard UI
│   ├── api/                 # API routes
│   └── globals.css          # Design system
├── chrome-extension/         # Chrome extension (MV3)
│   ├── manifest.json
│   ├── background.js        # Service worker
│   ├── popup.html/js        # Extension UI
│   └── icons/
├── cloudflare-worker/        # Serverless backend
│   ├── src/index.ts         # Worker entry point
│   └── wrangler.toml
├── lib/                      # Core logic
│   ├── templates.ts         # 3 workflow templates
│   └── store.ts             # Zustand state management
└── types/                    # TypeScript types
    └── index.ts
```

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Landing   │────▶│   Dashboard      │────▶│  Workflow Edit  │
│    Page     │     │   (create/list)  │     │   (run/debug)   │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                              ┌───────────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │ Chrome Extension│◀──────┐
                    │  (background)   │       │
                    └────────┬────────┘       │
                             │                │
                             ▼                │
                    ┌─────────────────┐      │
                    │ Cloudflare Worker│◀─────┘
                    │  (Browserbase)   │
                    └─────────────────┘
```

## Next Steps (Post-MVP)

1. **Supabase Integration** - Persistent workflow storage
2. **OAuth Flows** - Connect to CRM, email tools
3. **AI Enhancement** - More sophisticated action planning
4. **Pricing Page** - Free ($0), Solo ($15/mo), Team ($49/mo)
5. **ProductHunt Launch** - GTM execution

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS v4
- **State:** Zustand
- **Extension:** Chrome Manifest V3
- **Backend:** Cloudflare Workers, Browserbase/Puppeteer
- **AI:** OpenAI GPT-4o-mini, Anthropic Claude Haiku

## License

MIT - Auto Company

---

Built by Auto Company's autonomous AI team.
CEO: Jeff Bezos agent | CTO: Werner Vogels agent | Fullstack: DHH agent
