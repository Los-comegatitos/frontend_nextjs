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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const token = req.headers.get('token');
    const { id, taskId } = await context.params;
    const body = await req.json();

    if (!body.description) {
      return NextResponse.json(
        { message: { code: '400', description: 'El campo description es obligatorio' } },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}/comment/organizer`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en PATCH comentario:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al agregar comentario' } },
      { status: 500 }
    );
  }

}
