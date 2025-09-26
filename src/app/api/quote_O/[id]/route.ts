'use server';
import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function GET(req: NextRequest, params: { params: Promise<{ id: string }> }) {
  const { id } = await params.params;

  try {
    const token = req.headers.get('token');
    if (!token) {
      return NextResponse.json(
        { data: {}, message: { code: '401', description: 'No se proporcionó token' } },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_BACKEND}quote/received/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error en route /api/quote_O/[id]:', err);
    return NextResponse.json(
      { data: { error: err }, message: { code: '999', description: 'Un error ha ocurrido' } },
      { status: 500 }
    );
  }
}
