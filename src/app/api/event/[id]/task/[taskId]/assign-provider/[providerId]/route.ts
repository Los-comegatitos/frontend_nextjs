'use server';
import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string; taskId: string; providerId: string } }
) {
  try {
    const { id, taskId, providerId } = context.params;
    const eventId = id; // mapear id → eventId
    const token = req.headers.get('token');

    if (!eventId || !taskId || !providerId) {
      return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });
    }

    const res = await fetch(
      `${API_BACKEND}events/${eventId}/tasks/${eventId}/tasks/${taskId}/assign-provider/${providerId}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error asignando proveedor:', error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}
