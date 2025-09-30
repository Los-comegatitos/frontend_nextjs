'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

export async function GET(req: NextRequest, params: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params.params;
    const token = req.headers.get('token');

    const res = await fetch(`${API_BACKEND}events/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}