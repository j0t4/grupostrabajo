import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const attendances = await prisma.attendance.findMany();
    return NextResponse.json(attendances);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch attendances' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const attendance = await prisma.attendance.create({
      data,
    });
    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
}