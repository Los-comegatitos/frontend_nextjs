'use server';

import { verify } from "jsonwebtoken";
import { secretKey } from "./definitions";

// IF THIS THROWS AN ERROR CHECK THAT THE JWT ENV VARIABLES ARE THE SAME, YOU CAN CHECK THE CHAT :V
if (!secretKey) {
  throw new Error("There seems to be some technical problems in the enviroment");
}

export async function decrypt(session: string) {
//   console.log(session);
//   console.log('///////////////////////////////////////////');
  
  try {
    const payload = verify(session, secretKey)
    return payload
  } catch (error) {
    console.log(error);
    console.log('Failed to verify session')
    throw error
  }
}