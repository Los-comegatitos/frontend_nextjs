'use server';

import { API_BACKEND } from '@/app/lib/definitions';
import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { createJwt, decrypt } from '@/lib/session';
// import { JwtPayload } from 'jsonwebtoken';
// import { obtainJwt } from '@/app/actions/auth';
// import { createJwt } from '@/app/lib/session';

export async function POST(req: Request) {
  const body = await req.json();

    const { email, password } = body;
    const hiddenPassword = Buffer.from(password).toString('base64')
    try {
        // console.log(fields);
        
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
        console.log(data);
        const final = await data.json()
        console.log(final);
        if (data.status == 201) {
            // console.log(final['data']['access_token']);
            // let payload = decrypt(final['data']['access_token'] as string) as JwtPayload
            // console.log(payload);
            // const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
            // const cookieStore = await cookies()

            // createJwt(final['data']['access_token'])
            
            // cookieStore.set('jwt', final['data']['access_token'], {
            //     httpOnly: true,
            //     secure: true,
            //     expires: expiresAt,
            //     sameSite: 'strict',
            //     path: '/',
            // })
            // await createJwt(final['data']['access_token'] as string)
            // console.log('obtenidooooooooooooooooooooooooooo');
            
            // console.log(await obtainJwt());
            
            return NextResponse.json({ ok: true, body: final['data']['access_token'] });
        } else return NextResponse.json({ ok: false }, { status: 401 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ ok: false }, { status: 401 });
    }
}
