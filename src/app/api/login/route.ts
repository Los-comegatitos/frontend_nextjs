'use server';

import { API_BACKEND } from '@/app/lib/definitions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { email, password } = body;
    const hiddenPassword = Buffer.from(password).toString('base64')
    try {
        
        const data = await fetch(`${API_BACKEND}auth/login`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                email: email, 
                password: hiddenPassword, 
            })
        })
        // console.log(data);
        if (data.status == 201) {
            const final = await data.json()
            // console.log(final);
            return NextResponse.json({ ok: true, body: final['data']['access_token'] });
        } else {
            const final = await data.json()
            // console.log(final);
            return NextResponse.json({ ok: false, body: final }, { status: 401 });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ ok: false, body: '¡Oh no! Ha sucedido un error, inténtalo más tarde' }, { status: 401 });
    }
}
