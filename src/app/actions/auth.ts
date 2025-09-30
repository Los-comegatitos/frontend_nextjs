"use client";

import { deleteJwt } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function logout() {
  deleteJwt()
  redirect('/authentication/login')
}