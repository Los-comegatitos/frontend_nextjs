'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const token = req.headers.get('token');
    const { id, taskId } = await context.params;

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en GET comentarios:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}
