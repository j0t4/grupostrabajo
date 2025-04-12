import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { memberId: string; meetingId: string } }
) {
  try {
    const { memberId, meetingId } = params;
    const attendance = await prisma.attendance.findUnique({
      where: {
        memberId_meetingId: {
          memberId: Number(memberId),
          meetingId: Number(meetingId),
        },
      },
    });
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }
    return NextResponse.json(attendance);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { memberId: string; meetingId: string } }
) {
  try {
    const { memberId, meetingId } = params;
    const data = await request.json();
    const attendance = await prisma.attendance.update({
      where: {
        memberId_meetingId: {
          memberId: Number(memberId),
          meetingId: Number(meetingId),
        },
      },
      data,
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string; meetingId: string } }
) {
  try {
    const { memberId, meetingId } = params;
    await prisma.attendance.delete({
      where: {
        memberId_meetingId: {
          memberId: Number(memberId),
          meetingId: Number(meetingId),
        },
      },
    });
    return NextResponse.json({ message: 'Attendance deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 });
  }
}