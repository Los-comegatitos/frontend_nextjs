import { API_BACKEND } from "@/app/lib/definitions";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, params: { params: Promise<{ id: string }> }) {
    try {
        const token = req.headers.get('token');
        const body = await req.json();
        const { id } = await params.params;
        const res = await fetch(`${API_BACKEND}user/profile/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data?.['data'], { status: res.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
    }
}