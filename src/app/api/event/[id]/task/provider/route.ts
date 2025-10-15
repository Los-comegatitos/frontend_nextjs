'use server';
import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Listar tareas de un proveedor
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get('token');
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'Missing id' }, { status: 400 });
    }

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/provider`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: NextRequest,
  context: { params: { eventId: string; taskId: string; providerId?: string } }
) {
  try {
    const token = req.headers.get('token');
    const { eventId, taskId, providerId } = context.params;
    const body = await req.json();

    if (!eventId || !taskId) {
      return NextResponse.json(
        { message: 'Faltan parámetros: eventId o taskId' },
        { status: 400 }
      );
    }

    let endpoint = '';
    if (body?.unassign) {
      endpoint = `${API_BACKEND}events/${eventId}/tasks/${eventId}/tasks/${taskId}/unassign-provider`;
    } else {
      if (!providerId && !body.providerId) {
        return NextResponse.json(
          { message: 'Falta providerId para asignar' },
          { status: 400 }
        );
      }
      endpoint = `${API_BACKEND}events/${eventId}/tasks/${eventId}/tasks/${taskId}/assign-provider/${body.providerId}`;
    }

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en asignar/desasignar proveedor:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}
