'use server';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json({ message: { code: '000', description: 'API activa' } });
}
