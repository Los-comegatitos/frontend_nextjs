'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Obtener el promedio de calificaciones de un proveedor
export async function GET(req: NextRequest, params: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const { id } = await params.params;

    const res = await fetch(`${API_BACKEND}events/providers/${id}/average`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error al obtener el promedio del proveedor:', error);
    return NextResponse.json(
      {
        message: {
          code: '999',
          description: 'Error interno al obtener el promedio del proveedor',
        },
      },
      { status: 500 }
    );
  }
}
