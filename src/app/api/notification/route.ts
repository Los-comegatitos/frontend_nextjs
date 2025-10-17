import { NextRequest } from "next/server";

export async function GET(req : NextRequest) {
    try {
        const token = req.headers.get('token');
    } catch (error) {
        
    }
}