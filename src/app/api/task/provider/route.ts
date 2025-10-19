'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Listar tareas de un proveedor
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_BACKEND}tasks/provider`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en GET tareas del proveedor:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno al listar tareas del proveedor' } },
      { status: 500 }
    );
  }
}
