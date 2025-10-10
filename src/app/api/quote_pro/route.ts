import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: { code: '000', description: 'API activa' } });
}