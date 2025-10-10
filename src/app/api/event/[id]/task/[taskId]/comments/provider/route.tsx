'use server';
import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  const token = req.headers.get('token');
  const body = await req.json();

  const res = await fetch(`${API_BACKEND}events/${params.id}/tasks/${params.taskId}/comment/provider`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
