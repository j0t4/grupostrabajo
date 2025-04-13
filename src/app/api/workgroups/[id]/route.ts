import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for path parameter
const ParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer").transform(Number),
});

// Validation schema for PUT request body
const WorkgroupUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  deactivationDate: z.string().datetime().nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
}).strict(); // Ensure no extra fields are passed

// Helper to serialize dates
const serializeWorkgroup = (workgroup: any) => {
  if (!workgroup) return null;
  return {
    ...workgroup,
    // Serialize Date objects to ISO strings
    deactivationDate: workgroup.deactivationDate ? workgroup.deactivationDate.toISOString() : null,
    // Recursively serialize children if included
    // children: workgroup.children ? workgroup.children.map(serializeWorkgroup) : undefined,
    // parent: workgroup.parent ? serializeWorkgroup(workgroup.parent) : undefined,
  };
};


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate path parameter
    const validatedParams = ParamsSchema.safeParse(params);
    if (!validatedParams.success) {
        return NextResponse.json({ error: 'Invalid ID parameter', details: validatedParams.error.errors }, { status: 400 });
    }
    const id = validatedParams.data.id;

    const workgroup = await prisma.workgroup.findUnique({
      where: { id },
      // include: { children: true, parent: true } // Example of including relations
    });

    if (!workgroup) {
      return NextResponse.json({ message: 'Workgroup not found' }, { status: 404 });
    }

    // Serialize before sending
    return NextResponse.json(serializeWorkgroup(workgroup));

  } catch (error) {
    console.error("Error fetching workgroup:", error);
    return NextResponse.json({ error: 'Failed to fetch workgroup. Please check server logs.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate path parameter
    const validatedParams = ParamsSchema.safeParse(params);
    if (!validatedParams.success) {
        return NextResponse.json({ error: 'Invalid ID parameter', details: validatedParams.error.errors }, { status: 400 });
    }
    const id = validatedParams.data.id;

    // Validate request body
    const body = await request.json();
    const validationResult = WorkgroupUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validationResult.error.errors }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Convert date string back to Date object if present
    if (updateData.deactivationDate) {
        updateData.deactivationDate = new Date(updateData.deactivationDate);
    }

    // Check parentId validity if provided (optional)
    if (updateData.parentId !== undefined && updateData.parentId !== null) {
        if (updateData.parentId === id) {
             return NextResponse.json({ error: 'Workgroup cannot be its own parent.' }, { status: 400 });
        }
        const parentExists = await prisma.workgroup.findUnique({ where: { id: updateData.parentId } });
        if (!parentExists) {
            return NextResponse.json({ error: `Parent workgroup with ID ${updateData.parentId} not found.` }, { status: 404 });
        }
    }

    // Perform the update
    const workgroup = await prisma.workgroup.update({
      where: { id },
      data: updateData,
    });

    // Serialize before sending
    return NextResponse.json(serializeWorkgroup(workgroup));

  } catch (error: any) {
    console.error("Error updating workgroup:", error);
    if (error.code === 'P2025') { // Record to update not found
      return NextResponse.json({ message: 'Workgroup not found' }, { status: 404 });
    }
    if (error.code === 'P2003') { // Foreign key constraint (e.g., invalid parentId)
        return NextResponse.json({ error: 'Invalid parentId provided.' }, { status: 400 });
    }
    // Add handling for cyclical dependency if parent/child relationships are complex
    return NextResponse.json({ error: 'Failed to update workgroup. Please check server logs.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate path parameter
    const validatedParams = ParamsSchema.safeParse(params);
    if (!validatedParams.success) {
        return NextResponse.json({ error: 'Invalid ID parameter', details: validatedParams.error.errors }, { status: 400 });
    }
    const id = validatedParams.data.id;

    // Check if workgroup exists before deleting
    const existingWorkgroup = await prisma.workgroup.findUnique({ where: { id } });
    if (!existingWorkgroup) {
        return NextResponse.json({ message: 'Workgroup not found' }, { status: 404 });
    }

    // Perform deletion
    await prisma.workgroup.delete({
      where: { id },
    });

    // Return 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error("Error deleting workgroup:", error);
    if (error.code === 'P2025') { // Record to delete not found (already handled above, but good failsafe)
        return NextResponse.json({ message: 'Workgroup not found' }, { status: 404 });
    }
    // Handle foreign key constraints if deletion fails due to related records
    // e.g., P2003 if child workgroups or members exist and onDelete is not Cascade
     if (error.code === 'P2003') {
          return NextResponse.json({ error: 'Cannot delete workgroup with associated memberships, meetings, or child workgroups.' }, { status: 409 }); // Conflict
     }
    return NextResponse.json({ error: 'Failed to delete workgroup. Please check server logs.' }, { status: 500 });
  }
}
