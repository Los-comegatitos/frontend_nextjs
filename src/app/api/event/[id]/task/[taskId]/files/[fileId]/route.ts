'use server';

import { API_BACKEND } from '@/app/lib/definitions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string; fileId: string }> }
) {
  try {
    const { id, taskId, fileId } = await context.params;
    const token = req.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}/file/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: { code: '998', description: 'Error al obtener archivo' } },
        { status: res.status }
      );
    }

    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
        'Content-Disposition': res.headers.get('Content-Disposition') ?? '',
      },
    });
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}