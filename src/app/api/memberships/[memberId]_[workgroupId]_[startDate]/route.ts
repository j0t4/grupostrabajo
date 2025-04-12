import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { memberId: string; workgroupId: string; startDate: string } }
) {
  try {
    const { memberId, workgroupId, startDate } = params;
    const membership = await prisma.membership.findUnique({
      where: {
        memberId_workgroupId_startDate: {
          memberId: Number(memberId),
          workgroupId: Number(workgroupId),
          startDate: new Date(startDate),
        },
      },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }
    return NextResponse.json(membership);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { memberId: string; workgroupId: string; startDate: string } }
) {
  try {
    const { memberId, workgroupId, startDate } = params;
    const data = await request.json();
    const membership = await prisma.membership.update({
      where: {
        memberId_workgroupId_startDate: {
          memberId: Number(memberId),
          workgroupId: Number(workgroupId),
          startDate: new Date(startDate),
        },
      },
      data,
    });
    return NextResponse.json(membership);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string; workgroupId: string; startDate: string } }
) {
  try {
    const { memberId, workgroupId, startDate } = params;
    await prisma.membership.delete({
      where: {
        memberId_workgroupId_startDate: {
          memberId: Number(memberId),
          workgroupId: Number(workgroupId),
          startDate: new Date(startDate),
        },
      },
    });
    return NextResponse.json({ message: 'Membership deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete membership' }, { status: 500 });
  }
}