"use client";

import { checkJwt, createJwt, deleteJwt, getJwt } from "@/app/lib/session";
import { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import { decrypt } from "../lib/encypting";
import { API_BACKEND } from "../lib/definitions";

// import { hash } from "bcrypt"

export async function signin(formData: FormData) {
    const fields = {
        firstName: formData.get('firstName') as string, 
        lastName: formData.get('lastName') as string, 
        email: formData.get('email') as string,
        telephone: formData.get('telephone') as string, 
        birthDate: formData.get('birthDate'),
        password: formData.get('password') as string,
        user_Typeid: formData.get('user_Typeid') 
    } 
    console.log(fields);
    
    if (
        fields.email.length <= 0 || 
        fields.lastName.length <= 0 || 
        fields.password.length <= 0 || 
        fields.telephone.length <= 0 || 
        fields.password.length <= 0 
    ) return false

    // const hashedPassword = await hash(fields.password, 10)
    const hiddenPassword = Buffer.from(fields.password).toString('base64')

    try {
        console.log(fields);
        
        const data = await fetch(`${API_BACKEND}user`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                firstName: fields.firstName, 
                lastName: fields.lastName, 
                email: fields.email, 
                telephone: fields.telephone, 
                birthDate: fields.birthDate, 
                password: hiddenPassword, 
                user_Typeid: parseInt(fields.user_Typeid as string) 
            })
        })
        console.log(data);
        const final = await data.json()
        console.log(final);
        if (data.status == 201) {
            return true
        } else return false
    } catch (error) {
        console.log(error);
        return false
    }
}

export async function login(formData: FormData) {
    const fields = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    } 
    console.log(fields);
    
    if (fields.email.length <= 0 || fields.password.length <= 0) return false
    // const hashedPassword = await hash(fields.password, 10)
    const hiddenPassword = Buffer.from(fields.password).toString('base64')
    try {
        console.log(fields);
        
        const data = await fetch(`${API_BACKEND}auth/login`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                email: fields.email, 
                password: hiddenPassword, 
            })
        })
        console.log(data);
        const final = await data.json()
        console.log(final);
        if (data.status == 201) {
            console.log(final['data']['access_token']);
            const payload = decrypt(final['data']['access_token'] as string) as JwtPayload
            console.log(payload);
            createJwt(final['data']['access_token'] as string)
            console.log('obtenidooooooooooooooooooooooooooo');
            
            console.log(await obtainJwt());
            
            return true
        } else return false
    } catch (error) {
        console.log(error);
        return false
    }
//     const email = formData.get('email') as string;
//   const password = formData.get('password') as string;

//   if (!email || !password) return;

//   const hiddenPassword = Buffer.from(password).toString('base64');

//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password: hiddenPassword }),
//   });

//   const data = await res.json();

//   if (res.status === 201) {
//     const token = data?.data?.access_token;
//     if (token) {
//       const payload = decrypt(token);
//       console.log(payload);
      
//       await createJwt(token);
//       redirect('/'); // noseeeeeeeeeeeeee
//     }
//   } else {
//     console.log('Credenciales inválidas');
//   }

}

export async function obtainJwt() {
    const info = await decrypt(getJwt()) as JwtPayload
    console.log('infooooooooooooooooooooooooooooooooooo');
    console.log(info);
    if (info) {
        // let token = JSON.parse(info as string)
        return {
            sub: info['sub'] , 
            email: info['email'], 
            role: info['role']
        }
    } else null
}

export async function verifyJwt() {
    const truth = checkJwt()
    return truth
}

export async function logout() {
  deleteJwt()
  redirect('authentication/login')
}