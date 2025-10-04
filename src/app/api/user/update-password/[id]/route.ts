'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_BACKEND } from '@/app/lib/definitions';

export async function POST(req: NextRequest, params: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('token');
    const body = await req.json();

    const { password } = body;
    const hiddenPassword = Buffer.from(password).toString('base64');

    const { id } = await params.params;
    const res = await fetch(`${API_BACKEND}user/update-password/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: hiddenPassword,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
  }
}
