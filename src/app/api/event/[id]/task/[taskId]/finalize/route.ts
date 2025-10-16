'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

//ruta para finalizar la tarea
export async function PATCH(req: NextRequest,  params: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const token = req.headers.get('token');
    const { id, taskId } = await params.params;

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const body = await req.json();

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en PATCH finalize task:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al finalizar tarea' } },
      { status: 500 }
    );
  }
}
