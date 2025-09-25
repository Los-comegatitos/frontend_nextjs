// import "server-only";
// 'use server';
'use client';
// import { jwtVerify, SignJWT } from "jose";
// import { cookies } from "next/headers";

// export async function decrypt(session: string) {
//   try {
//     return verify(session, secretKey);
//   } catch (error) {
//     console.log('Failed to verify session', error);
//     return null;
//   }
// }

// export async function createJwt(token: string) {
//   const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
//   (await cookies()).set('jwt', token, {
//     httpOnly: true,
//     secure: true,
//     expires: expiresAt,
//     sameSite: 'lax',
//     path: '/',
//   });
// }

// export async function deleteJwt() {
//   (await cookies()).delete('jwt');
// }

// export async function getJwt() {
//   const cookie = (await cookies()).get('jwt');
//   if (!cookie?.value) return null;
//   return decrypt(cookie.value);
// }

// export async function checkJwt() {
//   const cookie = (await cookies()).get('jwt');
//   return !!cookie?.value;
// }
 

export function createJwt(payloadString : string) {
  console.log(payloadString);
  
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const expires = "expires="+ expiresAt.toUTCString();
  document.cookie = "jwt=" + payloadString + ";" + expires + ";path=/";
  
}

export function deleteJwt() {
  const data = getJwt()
  if (data) {
    document.cookie = `jwt=${data};expires=${new Date('2014').toUTCString()};path=/`
  }
}

export function getJwt() {
  // if (!document.cookie.includes('jwt=')) return ''
  const name = "jwt=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function checkJwt() {
  const user = getJwt();
  if (user != '') return true
  else return false
}