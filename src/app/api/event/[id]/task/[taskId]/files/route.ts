'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await context.params;
    const token = req.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: { code: '400', description: 'Archivo no proporcionado' } },
        { status: 400 }
      );
    }

    const backendForm = new FormData();
    backendForm.append('file', file);

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}/file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendForm,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al subir archivo' } },
      { status: 500 }
    );
  }
}
