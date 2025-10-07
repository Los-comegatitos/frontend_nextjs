'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';


//Obtener proveedores con cotizaciones aceptadas en un evento
export async function GET(req: NextRequest, params: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('token');
    const { id } = await params.params;

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_BACKEND}quotes/accepted/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en GET proveedores aceptados:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
