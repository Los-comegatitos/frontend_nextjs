'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

// listar proveedores con cotizaciones aceptadas
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.headers.get('token');
    const { id } = await params;

    const res = await fetch(`${API_BACKEND}events/accepted/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 },
    );
}
}



