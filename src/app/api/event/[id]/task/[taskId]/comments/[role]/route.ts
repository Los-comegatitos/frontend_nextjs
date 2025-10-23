'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Comentar tarea (para organizador y proveedor)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string; role: string }> }
) {
  try {
    const token = req.headers.get('token');
    const { id, taskId, role } = await context.params;
    const body = await req.json();

    // Validar entrada
    if (!['organizer', 'provider'].includes(role)) {
      return NextResponse.json(
        { message: { code: '400', description: 'Rol no válido. Debe ser organizer o provider.' } },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { message: { code: '400', description: 'El campo description es obligatorio.' } },
        { status: 400 }
      );
    }

    // Enviar solicitud al backend
    const backendURL = `${API_BACKEND}events/${id}/tasks/${taskId}/comment/${role}`;
    const res = await fetch(backendURL, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en PATCH comentario:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al agregar comentario.' } },
      { status: 500 }
    );
  }
}