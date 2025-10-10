"use server";

import { API_BACKEND } from "@/app/lib/definitions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, params : { params: Promise<{ taskId: string; id: string, fileId: string }> }) {

  try {
    const { taskId, id, fileId } = await params.params;
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
        'Authorization': `Bearer ${token}`,
      },
    });

    return new Response(res.body, {
        status: res.status,
        headers: {
            "Content-Type": res.headers.get("Content-Type")!,
            "Content-Disposition": res.headers.get("Content-Disposition")!,
        },
    });
  } catch (error) {
    console.error('Error terrible en el obtener un archivo:', error);
    return NextResponse.json(
      { message: { code: '999', description: 'Error interno' } },
      { status: 500 }
    );
  }
}
