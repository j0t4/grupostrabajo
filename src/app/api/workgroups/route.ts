import { PrismaClient, WorkgroupStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

const workgroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(WorkgroupStatus),
  deactivationDate: z.string().nullable().optional(),
  parentId: z.number().nullable().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const workgroups = await prisma.workgroup.findMany({
      where: status ? { status } : {},
      include: {
        memberships: {
          include: {
            member: true
          }
        },
        meetings: true,
        logbookEntries: true
      }
    });
    return NextResponse.json(workgroups);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch workgroups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = workgroupSchema.parse(data);

    // Convert deactivationDate string to Date object if present
    if (validatedData.deactivationDate !== undefined) {
      validatedData.deactivationDate = validatedData.deactivationDate ? new Date(validatedData.deactivationDate) : null;
    }

    const workgroup = await prisma.workgroup.create({
      data: validatedData,
    });
    return NextResponse.json(workgroup, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create workgroup' }, { status: 500 });
  }
}