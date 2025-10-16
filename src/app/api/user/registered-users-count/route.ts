'use server';

import { NextResponse } from 'next/server';
import { API_BACKEND } from "@/app/lib/definitions";

export async function GET(req: Request) {
  try {
    const token = req.headers.get('token');
    const res = await fetch(`${API_BACKEND}user/registered-users-count`, {
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

