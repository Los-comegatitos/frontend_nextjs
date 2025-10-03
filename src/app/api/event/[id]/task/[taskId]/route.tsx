'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

interface Params {
  id: string;
  taskId: string;
}

// Actualizar una tarea
export async function PATCH(req: NextRequest, params: { params: Promise<Params> }) {
  try {
    const { id: eventId, taskId } = await params.params;
    const token = req.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const body = await req.json();

    const res = await fetch(`${API_BACKEND}events/${eventId}/tasks/${taskId}`, {
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
    console.error('Error en PATCH task:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}

// Eliminar una tarea
export async function DELETE(req: NextRequest, params: { params: Promise<Params> }) {
  try {
    const { id: eventId, taskId } = await params.params;
    const token = req.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_BACKEND}events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en DELETE task:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}
