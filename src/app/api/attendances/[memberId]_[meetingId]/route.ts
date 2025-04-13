import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema to validate path parameters
const ParamsSchema = z.object({
  memberId_meetingId: z.string().regex(/^\d+_\d+$/, "Invalid format for memberId_meetingId. Expected 'number_number'."),
});

// Helper function to parse the composite key
function parseCompositeKey(key: string): { memberId: number; meetingId: number } | null {
  const match = key.match(/^(\d+)_(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    memberId: parseInt(match[1], 10),
    meetingId: parseInt(match[2], 10),
  };
}

export async function GET(
  request: Request,
  { params }: { params: { memberId_meetingId: string } }
) {
  try {
    // Validate path parameters
    const validatedParams = ParamsSchema.safeParse(params);
    if (!validatedParams.success) {
      return NextResponse.json({ error: 'Invalid path parameter format', details: validatedParams.error.errors }, { status: 400 });
    }

    const keyParts = parseCompositeKey(validatedParams.data.memberId_meetingId);
    if (!keyParts) {
       // This case should ideally be caught by the Zod schema, but double-checking doesn't hurt.
       return NextResponse.json({ error: 'Invalid format for memberId_meetingId parameter.' }, { status: 400 });
    }
    const { memberId, meetingId } = keyParts;

    const attendance = await prisma.attendance.findUnique({
      where: { memberId_meetingId: { memberId, meetingId } },
      include: { // Optional: Include related data if needed
         member: true,
         meeting: true,
      }
    });

    if (!attendance) {
      return NextResponse.json({ message: 'Attendance not found' }, { status: 404 });
    }
    return NextResponse.json(attendance);

  } catch (error) {
    console.error("Error fetching attendance:", error);
    // Consider more specific error handling for Prisma errors if needed
    return NextResponse.json({ error: 'Failed to fetch attendance. Please check server logs.' }, { status: 500 });
  }
}


// PUT is likely not needed for Attendance (it's just a link table).
// Usually you just DELETE and POST. If updates were needed, add validation.


export async function DELETE(
  request: Request,
  { params }: { params: { memberId_meetingId: string } }
) {
  try {
    // Validate path parameters
    const validatedParams = ParamsSchema.safeParse(params);
     if (!validatedParams.success) {
       return NextResponse.json({ error: 'Invalid path parameter format', details: validatedParams.error.errors }, { status: 400 });
     }

    const keyParts = parseCompositeKey(validatedParams.data.memberId_meetingId);
     if (!keyParts) {
        return NextResponse.json({ error: 'Invalid format for memberId_meetingId parameter.' }, { status: 400 });
     }
     const { memberId, meetingId } = keyParts;


    // Use transaction to ensure the record exists before attempting deletion
    const result = await prisma.$transaction(async (tx) => {
        const existingAttendance = await tx.attendance.findUnique({
             where: { memberId_meetingId: { memberId, meetingId } },
             select: { memberId: true } // Select minimal field to check existence
        });

        if (!existingAttendance) {
            return { status: 404, body: { message: 'Attendance not found' } };
        }

        await tx.attendance.delete({
            where: { memberId_meetingId: { memberId, meetingId } },
        });

        return { status: 204, body: null }; // Success, No Content
    });


    if (result.status === 404) {
         return NextResponse.json(result.body, { status: 404 });
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });


  } catch (error: any) {
     console.error("Error deleting attendance:", error);
     // Handle potential Prisma errors (like Foreign Key issues if deletion cascade isn't set up)
     if (error.code === 'P2003') { // Example Prisma error code for FK constraint fail
          return NextResponse.json({ error: 'Cannot delete attendance due to existing references.' }, { status: 409 }); // Conflict
     }
     if (error.code === 'P2025') { // Prisma error code for record to delete not found (though handled above)
          return NextResponse.json({ message: 'Attendance not found' }, { status: 404 });
     }
     return NextResponse.json({ error: 'Failed to delete attendance. Please check server logs.' }, { status: 500 });
  }
}

