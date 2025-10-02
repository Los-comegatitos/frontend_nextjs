import { API_BACKEND } from "@/app/lib/definitions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { 
        firstName, 
        lastName, 
        email, 
        password, 
        user_Typeid,
    } = body;
    const hiddenPassword = Buffer.from(password).toString('base64')
    
    if (
        firstName.length <= 0 || 
        email.length <= 0 || 
        lastName.length <= 0 || 
        password.length <= 0 )
        return NextResponse.json({ ok: false }, { status: 401 });
    
    try {
        const data = await fetch(`${API_BACKEND}user`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                firstName: firstName as string, 
                lastName: lastName as string, 
                email: email as string, 
                password: hiddenPassword, 
                user_Typeid: parseInt(user_Typeid as string) 
            })
        })
        console.log(data);
        const final = await data.json()
        console.log(final);
        if (data.status == 201) {
            return NextResponse.json({ ok: true, body: 'Se ha registrado en la aplicación correctamente' });
        } else return NextResponse.json({ ok: false, body: final['message']['description'] }, { status: 401 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ ok: false, body: 'Ha sucedido un error' }, { status: 401 });
    }
}