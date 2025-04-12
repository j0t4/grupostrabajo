import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const logbookEntry = await prisma.logbookEntry.findUnique({
      where: { id: Number(id) },
    });
    if (!logbookEntry) {
      return NextResponse.json({ error: 'Logbook entry not found' }, { status: 404 });
    }
    return NextResponse.json(logbookEntry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch logbook entry' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const logbookEntry = await prisma.logbookEntry.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(logbookEntry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update logbook entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.logbookEntry.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Logbook entry deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete logbook entry' }, { status: 500 });
  }
}