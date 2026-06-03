// AutoTask Cloudflare Worker - Browser Automation Backend
// Türkçe: Browserbase entegrasyonu ile serverless browser execution

import { ProxyRequest } from './types';

// Browserbase API configuration
const BROWSERBASE_API = 'https://api.browserbase.com';
const BROWSERBASE_SESSION_URL = `${BROWSERBASE_API}/sessions`;
const BROWSERBASE_CODE_URL = `${BROWSERBASE_API}/code`;

export interface Env {
  BROWSERBASE_API_KEY?: string;
  BROWSERBASE_PROJECT_ID?: string;
  OPENAI_API_KEY?: string;
  ENVIRONMENT: string;
}

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Route handling
      if (path === '/api/execute') {
        return await handleExecute(request, env);
      }

      if (path === '/api/health') {
        return Response.json({ status: 'healthy', timestamp: Date.now() }, {
          headers: corsHeaders,
        });
      }

      // 404
      return new Response('Not found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Worker error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

// Execute workflow in browser
async function handleExecute(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as ProxyRequest;

  // Validate required fields
  if (!body.workflow || !body.workflow.steps) {
    return Response.json({ error: 'Invalid workflow' }, {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check for Browserbase credentials
  if (!env.BROWSERBASE_API_KEY) {
    console.warn('BROWSERBASE_API_KEY not set, using mock mode');
    return await mockExecute(body);
  }

  try {
    // Create browser session
    const sessionResponse = await fetch(BROWSERBASE_SESSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.BROWSERBASE_API_KEY}`,
      },
      body: JSON.stringify({
        projectId: env.BROWSERBASE_PROJECT_ID,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error('Failed to create browser session');
    }

    const session = await sessionResponse.json();
    const sessionId = session.id;

    // Execute workflow steps
    const results: any[] = [];

    for (const step of body.workflow.steps) {
      const stepResult = await executeStep(step, sessionId, env);
      results.push(stepResult);

      // Stop on error
      if (!stepResult.success) {
        break;
      }
    }

    // Cleanup session
    await fetch(`${BROWSERBASE_SESSION_URL}/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${env.BROWSERBASE_API_KEY}`,
      },
    });

    return Response.json({
      success: true,
      results,
      executionId: crypto.randomUUID(),
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Execution error:', error);
    return Response.json({
      error: 'Execution failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// Execute single step
async function executeStep(step: any, sessionId: string, env: Env): Promise<any> {
  switch (step.type) {
    case 'navigate':
      return await executeNavigate(step, sessionId, env);

    case 'scrape':
      return await executeScrape(step, sessionId, env);

    case 'fill':
      return await executeFill(step, sessionId, env);

    case 'click':
      return await executeClick(step, sessionId, env);

    case 'wait':
      return await executeWait(step);

    case 'extract':
      return await executeExtract(step, sessionId, env);

    case 'ai-action':
      return await executeAIAction(step, env);

    default:
      return { success: false, error: `Unknown step type: ${step.type}` };
  }
}

// Navigate to URL
async function executeNavigate(step: any, sessionId: string, env: Env): Promise<any> {
  const code = `
    await page.goto('${step.config.url}', { waitUntil: 'networkidle0' });
    return { success: true, url: page.url() };
  `;

  return await runCode(sessionId, env.BROWSERBASE_API_KEY!, code);
}

// Scrape element
async function executeScrape(step: any, sessionId: string, env: Env): Promise<any> {
  const attr = step.config.attribute || 'textContent';
  const code = `
    const element = document.querySelector('${step.config.selector}');
    if (!element) return { success: false, error: 'Element not found' };
    return { success: true, data: element.${attr} };
  `;

  return await runCode(sessionId, env.BROWSERBASE_API_KEY!, code);
}

// Fill input
async function executeFill(step: any, sessionId: string, env: Env): Promise<any> {
  const code = `
    const element = document.querySelector('${step.config.selector}');
    if (!element) return { success: false, error: 'Element not found' };
    element.value = '${step.config.value}';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return { success: true };
  `;

  return await runCode(sessionId, env.BROWSERBASE_API_KEY!, code);
}

// Click element
async function executeClick(step: any, sessionId: string, env: Env): Promise<any> {
  const waitMs = step.config.waitFor || 0;
  const code = `
    const element = document.querySelector('${step.config.selector}');
    if (!element) return { success: false, error: 'Element not found' };
    element.click();
    await new Promise(r => setTimeout(r, ${waitMs}));
    return { success: true };
  `;

  return await runCode(sessionId, env.BROWSERBASE_API_KEY!, code);
}

// Wait
async function executeWait(step: any): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, step.config.duration));
  return { success: true, waited: step.config.duration };
}

// Extract structured data
async function executeExtract(step: any, sessionId: string, env: Env): Promise<any> {
  const selectors = step.config.selectors;
  const extractCode = `
    const result = {};
    ${Object.entries(selectors).map(([key, selector]) => `
      const ${key}El = document.querySelector('${selector}');
      result.${key} = ${key}El ? ${key}El.textContent.trim() : null;
    `).join('\n')}
    return { success: true, data: result };
  `;

  return await runCode(sessionId, env.BROWSERBASE_API_KEY!, extractCode);
}

// AI action
async function executeAIAction(step: any, env: Env): Promise<any> {
  if (!env.OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: step.config.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: step.config.prompt }],
      max_tokens: step.config.maxTokens || 500,
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'AI request failed' };
  }

  const data = await response.json();
  return {
    success: true,
    data: data.choices[0].message.content,
  };
}

// Run code in browser session
async function runCode(sessionId: string, apiKey: string, code: string): Promise<any> {
  const response = await fetch(`${BROWSERBASE_CODE_URL}?sessionId=${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    return { success: false, error: 'Code execution failed' };
  }

  return await response.json();
}

// Mock execution for testing without Browserbase
async function mockExecute(body: ProxyRequest): Promise<Response> {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockResults = body.workflow.steps.map((step: any) => ({
    stepId: step.id,
    type: step.type,
    success: true,
    data: step.type === 'navigate' ? { url: step.config.url }
      : step.type === 'extract' ? { name: 'Mock Company', email: 'test@example.com' }
      : step.type === 'ai-action' ? { result: 'AI processed mock data' }
      : { executed: true },
  }));

  return Response.json({
    success: true,
    results: mockResults,
    executionId: crypto.randomUUID(),
    mock: true,
  }, { headers: corsHeaders });
}
