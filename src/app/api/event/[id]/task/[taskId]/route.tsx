'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

//actualizar una tarea
export async function PATCH(req: NextRequest, { params }: { params: { id: string, taskId: string } }) {
  try {
    const { id, taskId } = params;
    const token = req.headers.get('token');
    const body = await req.json();

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}`, {
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
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}

//eliminar una tarea
export async function DELETE(req: NextRequest, { params }: { params: { id: string, taskId: string } }) {
  try {
    const { id, taskId } = params;
    const token = req.headers.get('token');

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}
