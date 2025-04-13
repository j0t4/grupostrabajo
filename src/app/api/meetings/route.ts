import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for POST request
const MeetingInputSchema = z.object({
    workgroupId: z.number().int().positive(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    date: z.string().datetime({ message: "Invalid datetime string" }), // Expect ISO string from client
    type: z.enum(['PRESENTIAL', 'ONLINE']).default('PRESENTIAL'),
    observations: z.string().optional().nullable(),
    agenda: z.string().optional().nullable(),
    minutes: z.string().optional().nullable(),
});

// Helper to serialize dates
const serializeMeetings = (meetings: any[]) => {
  return meetings.map(meeting => ({
    ...meeting,
    date: meeting.date.toISOString(), // Convert Date object to ISO string
  }));
};

const serializeMeeting = (meeting: any) => {
    if (!meeting) return null;
    return {
        ...meeting,
        date: meeting.date.toISOString(),
    };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workgroupId = searchParams.get('workgroupId');

    const whereClause = workgroupId ? { workgroupId: parseInt(workgroupId, 10) } : {};

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: { workgroup: true } // Optional: include related data
    });

    // Serialize the result before sending
    return NextResponse.json(serializeMeetings(meetings));

  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: 'Failed to fetch meetings. Please check server logs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = MeetingInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validationResult.error.errors }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Check if related workgroup exists (optional but good practice)
    const workgroupExists = await prisma.workgroup.findUnique({
        where: { id: validatedData.workgroupId }
    });
    if (!workgroupExists) {
        return NextResponse.json({ error: `Workgroup with ID ${validatedData.workgroupId} not found.` }, { status: 404 });
    }

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: {
          ...validatedData,
          date: new Date(validatedData.date) // Convert ISO string back to Date object for Prisma
      },
       include: { workgroup: true } // Optional: include related data in response
    });

    // Serialize the created meeting before sending response
    return NextResponse.json(serializeMeeting(meeting), { status: 201 });

  } catch (error: any) {
    console.error("Error creating meeting:", error);
    // Handle specific Prisma errors like unique constraints if necessary
    if (error.code === 'P2002') { // Example: Unique constraint failed
        return NextResponse.json({ error: 'Meeting creation failed due to constraint violation.' }, { status: 409 });
    }
     if (error.code === 'P2003') { // Foreign key constraint failed
         return NextResponse.json({ error: 'Invalid workgroupId provided.' }, { status: 400 });
     }
    return NextResponse.json({ error: 'Failed to create meeting. Please check server logs.' }, { status: 500 });
  }
}
