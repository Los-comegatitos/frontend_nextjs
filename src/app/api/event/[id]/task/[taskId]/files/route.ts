'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

export async function POST(req: NextRequest, params : { params: Promise<{ taskId: string; id: string }> }) {
  try {
    const { taskId, id } = await params.params;
    const token = req.headers.get('token'); 

    if (!token) {
      return NextResponse.json(
        { message: { code: '401', description: 'Token no proporcionado' } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    const backendForm = new FormData();
    backendForm.append('file', file);

    

    const res = await fetch(`${API_BACKEND}events/${id}/tasks/${taskId}/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 'Content-Type': body.type,
      },
      body: backendForm,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Hubo un terrible error en el obtener archivo:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}