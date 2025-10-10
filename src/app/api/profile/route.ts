import { API_BACKEND } from "@/app/lib/definitions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('token');
        const res = await fetch(`${API_BACKEND}user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();
        return NextResponse.json(data?.['data'], { status: res.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: { code: '999', description: 'Error interno' } }, { status: 500 });
    }
}