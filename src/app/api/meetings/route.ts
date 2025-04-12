import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany();
    return NextResponse.json(meetings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const meeting = await prisma.meeting.create({
      data,
    });
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}