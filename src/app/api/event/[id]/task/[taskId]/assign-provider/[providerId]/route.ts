'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Ruta para asignar un proveedor a una tarea
export async function PATCH(req: NextRequest, params: { params: Promise<{ id: string; taskId: string; providerId: string }> }
) {
  try {
    const token = req.headers.get('token');
    const { id, taskId, providerId } =await params.params;

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${API_BACKEND}events/${id}/tasks/${id}/tasks/${taskId}/assign-provider/${providerId}`,
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
    console.error('Error en PATCH assign provider:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al asignar proveedor' } },
      { status: 500 }
    );
  }
}
