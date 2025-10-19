'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

// Crear evaluación de un proveedor en un evento
export async function POST(req: NextRequest, params: { params: Promise<{ id: string; providerId: string }> }
) {
  try {
    const token = req.headers.get('token');
    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { organizerUserId, score } = body;
    const { id, providerId } = await params.params;

    if (!organizerUserId || score === undefined) {
      return NextResponse.json(
        { message: { code: '400', description: 'Datos incompletos' } },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${API_BACKEND}events/${id}/providers/${providerId}/evaluation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizerUserId, score }),
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en POST evaluation:', error);
    return NextResponse.json(
      {
        message: {
          code: '999',
          description: 'Error interno al calificar proveedor',
        },
      },
      { status: 500 }
    );
  }
}

//Obtener calificion de un proveedor de un evento
export async function GET(req: NextRequest, params: { params: Promise<{ id: string; providerId: string }> }  
) {
  try {
    const token = req.headers.get('token');
    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const { id, providerId } = await params.params;

    const res = await fetch(
      `${API_BACKEND}events/${id}/providers/${providerId}/evaluation`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en GET evaluation:', error);
    return NextResponse.json(
      {
        message: {
          code: '999',
          description: 'Error interno al obtener la evaluación del proveedor',
        },
      },
      { status: 500 }
    );
  }
}

//Modificar la calificacion un proveedor de un evento
export async function PATCH(req: NextRequest, params: { params: Promise<{ id: string; providerId: string }> }
) {
  try {
    const token = req.headers.get('token');
    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const { id, providerId } = await params.params;
    const body = await req.json();
    const { score } = body;

    if (score === undefined) {
      return NextResponse.json(
        { message: { code: '400', description: 'Score no proporcionado' } },
        { status: 400 }
      );
    }

    const payload = { score };

    const res = await fetch(
      `${API_BACKEND}events/${id}/providers/${providerId}/evaluation`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error en PATCH evaluation:', error);
    return NextResponse.json(
      {
        message: {
          code: '999',
          description: 'Error interno al actualizar la calificación',
        },
      },
      { status: 500 }
    );
  }
}
