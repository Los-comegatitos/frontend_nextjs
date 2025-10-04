import { API_BACKEND } from "@/app/lib/definitions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const token = req.headers.get('token');

    const { 
        firstName, 
        lastName, 
        email, 
        password,
    } = body;
    const hiddenPassword = Buffer.from(password).toString('base64')
    
    if (
        firstName.length <= 0 || 
        email.length <= 0 || 
        lastName.length <= 0 || 
        password.length <= 0 )
        return NextResponse.json({ ok: false }, { status: 401 });

    try {
        const data = await fetch(`${API_BACKEND}user/create-admin`, {
            method: 'POST', 
               headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
            body: JSON.stringify({
                firstName: firstName as string, 
                lastName: lastName as string, 
                email: email as string, 
                password: hiddenPassword, 
                user_Typeid: 1
            })
        })

        const final = await data.json()

        if (data.status == 201) {
            return NextResponse.json({ ok: true, body: 'Se ha registrado en la aplicación correctamente' });
        } else return NextResponse.json({ ok: false, body: final['message']['description'] }, { status: 401 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ ok: false, body: 'Ha sucedido un error' }, { status: 401 });
    }
}

