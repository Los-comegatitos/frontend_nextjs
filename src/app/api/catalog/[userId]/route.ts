import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

export async function PATCH(req: NextRequest, params: { params: Promise<{ userId: string }> }) {
  try {
    const token = req.headers.get('token');
    const body = await req.json();

    const { userId } = await params.params;

    const res = await fetch(`${API_BACKEND}client-type/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, params: { params: Promise<{ userId: string }> }) {
  try {
    const token = req.headers.get('token');
    const { userId } = await params.params;

    const res = await fetch(`${API_BACKEND}client-type/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}
