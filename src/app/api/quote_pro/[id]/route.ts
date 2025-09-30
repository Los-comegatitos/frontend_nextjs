'use server';

import { NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('token');
    if (!token) {
      return NextResponse.json(
        { data: {}, message: { code: '401', description: 'No se proporcionó token' } },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const eventId = url.searchParams.get('eventId');
    const query = eventId ? `?eventId=${eventId}` : '';

    const res = await fetch(`${API_BACKEND}quote/received${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error en route /api/quote_pro/[id]:', err);
    return NextResponse.json(
      { data: {}, message: { code: '999', description: 'Un error ha ocurrido' } },
      { status: 500 }
    );
  }
}
