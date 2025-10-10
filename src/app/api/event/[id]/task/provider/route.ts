'use server';
import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';


//listar tareas de un proveedor
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get('token');
  const res = await fetch(`${API_BACKEND}events/${params.id}/tasks/provider`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
