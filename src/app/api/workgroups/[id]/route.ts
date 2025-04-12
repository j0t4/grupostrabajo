import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const workgroup = await prisma.workgroup.findUnique({
      where: { id: Number(id) },
    });
    if (!workgroup) {
      return NextResponse.json({ error: 'Workgroup not found' }, { status: 404 });
    }
    return NextResponse.json(workgroup);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch workgroup' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const workgroup = await prisma.workgroup.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(workgroup);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update workgroup' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.workgroup.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Workgroup deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete workgroup' }, { status: 500 });
  }
}