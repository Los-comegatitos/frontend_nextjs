import { API_BACKEND } from "@/app/lib/definitions";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const token = req.headers.get('token')
        const res = await fetch(`${API_BACKEND}notification/${id}`, {
            method: 'PATCH', 
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: { code: '999', description: 'Error interno' } },
            { status: 500 }
        );
    }
}