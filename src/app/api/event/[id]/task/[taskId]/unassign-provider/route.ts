'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Ruta para desasignar un proveedor de una tarea
export async function PATCH(req: NextRequest, params: { params: Promise<{ id: string; taskId: string;}> }
) {
  try {
    const token = req.headers.get('token');
    const { id, taskId} =await params.params;

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${API_BACKEND}events/${id}/tasks/${id}/tasks/${taskId}/unassign-provider`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en PATCH unassign provider:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al desasignar proveedor' } },
      { status: 500 }
    );
  }
}
