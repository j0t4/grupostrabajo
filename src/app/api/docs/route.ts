// src/app/api/docs/route.ts
import { NextResponse } from 'next/server';
import swaggerDocument from '@/swagger'; // Use alias for cleaner import

export async function GET(request: Request) {
  return NextResponse.json(swaggerDocument);
}
