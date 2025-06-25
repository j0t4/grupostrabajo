import { PrismaClient } from '@prisma/client'; // Remove Prisma named import if only checking code
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema to validate path parameter format (e.g., 1_10_2023-01-01T00:00:00.000Z)
const KeySchema = z.string().regex(/^\d+_\d+_\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/, {
    message: "Invalid format for membership key. Expected 'memberId_workgroupId_isoStartDate'."
});

// Schema for PUT request body validation
const UpdateMembershipSchema = z.object({
  endDate: z.string().datetime({ message: "Invalid ISO datetime string for endDate" }).nullable(),
}).strict();

// Helper function to parse the composite key
function parseMembershipKey(key: string): { memberId: number; workgroupId: number; startDate: Date } | null {
  const match = key.match(/^(\d+)_(\d+)_(.*)$/);
  if (!match) return null;
  const memberId = parseInt(match[1], 10);
  const workgroupId = parseInt(match[2], 10);
  const startDate = new Date(match[3]);
  if (isNaN(memberId) || isNaN(workgroupId) || isNaN(startDate.getTime())) {
    return null;
  }
  return { memberId, workgroupId, startDate };
}

// GET handler
export async function GET(
  request: Request,
  { params }: { params: { memberId_workgroupId_startDate: string } }
) {
  try {
    const validatedKey = KeySchema.safeParse(params.memberId_workgroupId_startDate);
    if (!validatedKey.success) {
        return NextResponse.json({ error: 'Invalid path parameter format', details: validatedKey.error.errors }, { status: 400 });
    }
    const keyParts = parseMembershipKey(validatedKey.data);
    if (!keyParts) {
        return NextResponse.json({ error: 'Internal server error: Failed to parse validated key.' }, { status: 500 });
    }
    const { memberId, workgroupId, startDate } = keyParts;
    const membership = await prisma.membership.findUnique({
      where: { memberId_workgroupId_startDate: { memberId, workgroupId, startDate } },
       include: { member: true, workgroup: true }
    });
    if (!membership) {
      return NextResponse.json({ message: 'Membership not found' }, { status: 404 });
    }
    return NextResponse.json(membership);
  } catch (error) {
    console.error("Error fetching membership:", error);
    return NextResponse.json({ error: 'Failed to fetch membership. Please check server logs.' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(
  request: Request,
  { params }: { params: { memberId_workgroupId_startDate: string } }
) {
  try {
    const validatedKey = KeySchema.safeParse(params.memberId_workgroupId_startDate);
     if (!validatedKey.success) {
         return NextResponse.json({ error: 'Invalid path parameter format', details: validatedKey.error.errors }, { status: 400 });
     }
    const keyParts = parseMembershipKey(validatedKey.data);
     if (!keyParts) {
         return NextResponse.json({ error: 'Internal server error: Failed to parse validated key.' }, { status: 500 });
     }
     const { memberId, workgroupId, startDate } = keyParts;
    let updateDataParsed;
    try {
        const rawData = await request.json();
        updateDataParsed = UpdateMembershipSchema.parse(rawData);
    } catch (error) {
        if (error instanceof z.ZodError) {
             return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
        }
         if (error instanceof SyntaxError) {
              return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
         }
         console.error("Error parsing request body:", error);
         return NextResponse.json({ error: 'Failed to parse request body' }, { status: 500 });
    }
    const updateDataForPrisma = {
        endDate: updateDataParsed.endDate ? new Date(updateDataParsed.endDate) : null
    };
    const membership = await prisma.membership.update({
      where: { memberId_workgroupId_startDate: { memberId, workgroupId, startDate } },
      data: updateDataForPrisma,
    });
    return NextResponse.json(membership);
  } catch (error: any) {
    console.error("Error updating membership:", error);
    // Check error code directly instead of instanceof
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Membership not found' }, { status: 404 });
      }
      // Potentially handle other Prisma error codes
    }
    return NextResponse.json({ error: 'Failed to update membership. Please check server logs.' }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(
  request: Request,
  { params }: { params: { memberId_workgroupId_startDate: string } }
) {
  try {
     const validatedKey = KeySchema.safeParse(params.memberId_workgroupId_startDate);
     if (!validatedKey.success) {
         return NextResponse.json({ error: 'Invalid path parameter format', details: validatedKey.error.errors }, { status: 400 });
     }
     const keyParts = parseMembershipKey(validatedKey.data);
     if (!keyParts) {
         return NextResponse.json({ error: 'Internal server error: Failed to parse validated key.' }, { status: 500 });
     }
     const { memberId, workgroupId, startDate } = keyParts;
    await prisma.membership.delete({
      where: { memberId_workgroupId_startDate: { memberId, workgroupId, startDate } },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting membership:", error);
    // Check error code directly instead of instanceof
     if (error && typeof error === 'object' && 'code' in error) {
       if (error.code === 'P2025') {
         return NextResponse.json({ message: 'Membership not found' }, { status: 404 });
       }
       if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Cannot delete membership due to existing references.' }, { status: 409 });
       }
       // Potentially handle other Prisma error codes
     }
    return NextResponse.json({ error: 'Failed to delete membership. Please check server logs.' }, { status: 500 });
  }
}
