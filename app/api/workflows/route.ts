// AutoTask API - Workflows Endpoint
// Türkçe: Workflow CRUD işlemleri için API route

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (MVP - replace with Supabase in production)
let workflows: any[] = [];

// GET - List all workflows
export async function GET() {
  return NextResponse.json(workflows);
}

// POST - Create workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const workflow = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflows.push(workflow);

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
