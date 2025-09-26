'use server';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({data: 'saludos'}, { status: 200 });
}
