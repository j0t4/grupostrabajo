import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const logbookEntries = await prisma.logbookEntry.findMany();
    return NextResponse.json(logbookEntries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch logbook entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const logbookEntry = await prisma.logbookEntry.create({
      data,
    });
    return NextResponse.json(logbookEntry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create logbook entry' }, { status: 500 });
  }
}