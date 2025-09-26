'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

export async function PATCH(req: NextRequest, params: { params: Promise<{ userId: string; serviceName: string }> }) {
  try {
    const token = req.headers.get('token');
    const body = await req.json();

    const { userId, serviceName } = await params.params;

    const res = await fetch(`${API_BACKEND}catalog/${userId}/services/${serviceName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

export async function DELETE(req: NextRequest, params: { params: Promise<{ userId: string; serviceName: string }> }) {
  try {
    const token = req.headers.get('token');
    const { userId, serviceName } = await params.params;
    const res = await fetch(`${API_BACKEND}catalog/${userId}/services/${serviceName}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}
