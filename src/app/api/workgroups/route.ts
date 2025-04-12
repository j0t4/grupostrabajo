import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const workgroups = await prisma.workgroup.findMany();
    return NextResponse.json(workgroups);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch workgroups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const workgroup = await prisma.workgroup.create({
      data,
    });
    return NextResponse.json(workgroup, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create workgroup' }, { status: 500 });
  }
}