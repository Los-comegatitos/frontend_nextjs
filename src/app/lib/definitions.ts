export type Payload = {
  sub : number, 
  email : string, 
  role : string, 
  iat : number, 
  exp : number
}

export const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET as string;
export const API_BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL as string

export type User = { 
  id: number; 
  email: string; 
  role: string };