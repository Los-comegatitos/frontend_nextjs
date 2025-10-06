'use server';

import { NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await context.params;

    const token = req.headers.get('token');
    if (!token) {
      return NextResponse.json(
        { data: {}, message: { code: '401', description: 'No se proporcionó token' } },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const query = status ? `?status=${status}` : '';

    const res = await fetch(`${API_BACKEND}quote/sent/${providerId}${query}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error en route /api/quote/[id]:', err);
    return NextResponse.json(
      { data: {}, message: { code: '999', description: 'Un error ha ocurrido' } },
      { status: 500 }
    );
  }
}
