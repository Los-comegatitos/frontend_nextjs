'use server';

import { API_BACKEND } from '@/app/lib/definitions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: { code: '000', description: 'API activa' } });
}


export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('token');
    const body = await req.json();
  
    const res = await fetch(`${API_BACKEND}quote/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
    } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
    }
}