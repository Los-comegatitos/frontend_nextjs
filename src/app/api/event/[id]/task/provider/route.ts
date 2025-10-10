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
