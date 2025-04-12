import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const meeting = await prisma.meeting.findUnique({
      where: { id: Number(id) },
    });
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    return NextResponse.json(meeting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const meeting = await prisma.meeting.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(meeting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.meeting.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Meeting deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}