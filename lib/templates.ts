// AutoTask Workflow Templates
// 3 core templates: lead scraping, form filling, data extraction

import type { WorkflowStep, WorkflowTemplate } from '@/types';

// Template 1: Lead Scraping - LinkedIn/CRM lead extraction
export const leadScrapingTemplate: WorkflowTemplate = {
  id: 'lead-scraping',
  name: 'Lead Scraper',
  description: 'LinkedIn, Crunchbase veya company sitelerinden otomatik lead toplama',
  category: 'lead-gen',
  estimatedTime: '2-3 dakika',
  requiresAI: true,
  defaultSteps: [
    {
      id: 'navigate-to-source',
      type: 'navigate',
      order: 0,
      config: {
        url: '', // User fills this
      },
    },
    {
      id: 'wait-for-page-load',
      type: 'wait',
      order: 1,
      config: {
        duration: 2000,
      },
    },
    {
      id: 'extract-lead-data',
      type: 'extract',
      order: 2,
      config: {
        selectors: {
          name: 'h1',
          company: '.company-name',
          email: 'a[href^="mailto:"]',
          phone: 'a[href^="tel:"]',
          website: 'a[href^="http"]',
        },
        outputFormat: 'json',
      },
    },
    {
      id: 'ai-enrich-lead',
      type: 'ai-action',
      order: 3,
      config: {
        prompt: 'Bu lead verisini analiz et ve şirket büyüklüğü, sektör, ve contact priority score (1-10) ekle. JSON formatında dön.',
        contextFrom: ['extract-lead-data'],
        model: 'gpt-4o-mini',
      },
    },
  ],
};

// Template 2: Form Filling - Otomatik form doldurma
export const formFillingTemplate: WorkflowTemplate = {
  id: 'form-filling',
  name: 'Form Auto-Fill',
  description: 'Contact formları, kayıt formları, survey formlarını otomatik doldur',
  category: 'productivity',
  estimatedTime: '1-2 dakika',
  requiresAI: false,
  defaultSteps: [
    {
      id: 'navigate-to-form',
      type: 'navigate',
      order: 0,
      config: {
        url: '', // User fills this
      },
    },
    {
      id: 'wait-for-form',
      type: 'wait',
      order: 1,
      config: {
        duration: 1500,
      },
    },
    {
      id: 'fill-name',
      type: 'fill',
      order: 2,
      config: {
        selector: 'input[name="name"], input[name="firstName"], input[placeholder*="name"]',
        value: '', // User fills this
        fieldType: 'input',
      },
    },
    {
      id: 'fill-email',
      type: 'fill',
      order: 3,
      config: {
        selector: 'input[type="email"], input[name="email"]',
        value: '', // User fills this
        fieldType: 'input',
      },
    },
    {
      id: 'fill-message',
      type: 'fill',
      order: 4,
      config: {
        selector: 'textarea[name="message"], textarea[name="comments"]',
        value: '', // User fills this
        fieldType: 'textarea',
      },
    },
    {
      id: 'submit-form',
      type: 'click',
      order: 5,
      config: {
        selector: 'button[type="submit"], input[type="submit"], button:has-text("Submit")',
        waitFor: 1000,
      },
    },
  ],
};

// Template 3: Data Extraction - Structured data from web pages
export const dataExtractionTemplate: WorkflowTemplate = {
  id: 'data-extraction',
  name: 'Web Data Extractor',
  description: 'Product pages, article meta, pricing pages gibi yapılı veriyi çek',
  category: 'data',
  estimatedTime: '1 dakika',
  requiresAI: true,
  defaultSteps: [
    {
      id: 'navigate-to-target',
      type: 'navigate',
      order: 0,
      config: {
        url: '', // User fills this
      },
    },
    {
      id: 'wait-for-content',
      type: 'wait',
      order: 1,
      config: {
        duration: 2000,
      },
    },
    {
      id: 'extract-structured-data',
      type: 'extract',
      order: 2,
      config: {
        selectors: {
          // Generic selectors - user customizes
          title: 'h1, .title, [data-title]',
          price: '.price, [data-price], .product-price',
          description: '.description, meta[name="description"]',
          image: 'img.main-image, .product-image img',
        },
        outputFormat: 'json',
      },
    },
    {
      id: 'ai-summarize',
      type: 'ai-action',
      order: 3,
      config: {
        prompt: 'Çekilen veriyi analiz et ve ana özellikleri (features, specs, highlights) olarak listele.',
        contextFrom: ['extract-structured-data'],
        model: 'gpt-4o-mini',
      },
    },
  ],
};

// Tüm template'leri export et
export const workflowTemplates: Record<string, WorkflowTemplate> = {
  'lead-scraping': leadScrapingTemplate,
  'form-filling': formFillingTemplate,
  'data-extraction': dataExtractionTemplate,
};

// Template listesi için helper
export function getTemplateList(): WorkflowTemplate[] {
  return Object.values(workflowTemplates);
}

// ID ile template get
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates[id];
}
