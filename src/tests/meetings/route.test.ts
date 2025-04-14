import { GET, POST } from '@/app/api/meetings/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Meeting, Workgroup, MeetingType } from '@prisma/client';

// Helper to serialize dates in meetings
const serializeMeetingDates = (meeting: any) => {
  if (!meeting) return null;
  return {
    ...meeting,
    date: meeting.date.toISOString(),
    // Ensure related objects with dates are also serialized if included and needed for comparison
    workgroup: meeting.workgroup ? {
        ...meeting.workgroup,
        creationDate: meeting.workgroup.creationDate.toISOString(),
        deactivationDate: meeting.workgroup.deactivationDate ? meeting.workgroup.deactivationDate.toISOString() : null,
    } : undefined,
  };
};

const serializeMeetingsArray = (meetings: any[]) => meetings.map(serializeMeetingDates);

describe('Meetings API - /api/meetings', () => {
  const mockWorkgroup: Workgroup = {
      id: 1,
      name: 'Related Workgroup',
      description: 'Workgroup for meetings',
      creationDate: new Date('2023-01-01T10:00:00.000Z'),
      status: 'ACTIVE',
      deactivationDate: null,
      parentId: null
  };

  const mockMeetings: Meeting[] = [
    { id: 1, workgroupId: 1, title: 'Meeting 1', description: 'Desc 1', date: new Date('2024-05-15T10:00:00.000Z'), type: 'PRESENTIAL', observations: null, agenda: null, minutes: null },
    { id: 2, workgroupId: 1, title: 'Meeting 2', description: 'Desc 2', date: new Date('2024-05-16T14:00:00.000Z'), type: 'ONLINE', observations: null, agenda: null, minutes: null },
    { id: 3, workgroupId: 2, title: 'Meeting 3', description: 'Desc 3', date: new Date('2024-05-17T09:00:00.000Z'), type: 'PRESENTIAL', observations: null, agenda: null, minutes: null },
  ];

  // Mock meetings including the workgroup data as the route does
  const mockMeetingsWithWorkgroup = mockMeetings
      .filter(m => m.workgroupId === mockWorkgroup.id)
      .map(m => ({ ...m, workgroup: mockWorkgroup }));

  describe('GET /api/meetings', () => {
    it('should return all meetings when no workgroupId is provided', async () => {
      // Mock including workgroup data as the route handler does
      const meetingsWithGroups = mockMeetings.map(m => ({...m, workgroup: m.workgroupId === mockWorkgroup.id ? mockWorkgroup : {...mockWorkgroup, id: m.workgroupId} }));
      prismaMock.meeting.findMany.mockResolvedValue(meetingsWithGroups);

      const req = new NextRequest('http://localhost/api/meetings');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(serializeMeetingsArray(meetingsWithGroups));
      expect(prismaMock.meeting.findMany).toHaveBeenCalledWith({ where: {}, include: { workgroup: true } });
    });

    it('should return meetings filtered by workgroupId', async () => {
      prismaMock.meeting.findMany.mockResolvedValue(mockMeetingsWithWorkgroup);
      const workgroupId = 1;
      const req = new NextRequest(`http://localhost/api/meetings?workgroupId=${workgroupId}`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(serializeMeetingsArray(mockMeetingsWithWorkgroup));
      expect(prismaMock.meeting.findMany).toHaveBeenCalledWith({ where: { workgroupId: workgroupId }, include: { workgroup: true } });
    });

    it('should return 500 on database error', async () => {
      prismaMock.meeting.findMany.mockRejectedValue(new Error('Database error'));
      const req = new NextRequest('http://localhost/api/meetings');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch meetings. Please check server logs.' });
    });
  });

  describe('POST /api/meetings', () => {
    const validMeetingData = {
        workgroupId: 1,
        title: 'New Important Meeting',
        description: 'Discuss project milestones',
        date: new Date().toISOString(), // Use ISO string as expected by Zod schema
        type: 'ONLINE' as MeetingType,
        observations: 'None'
    };

    const createdMeeting: Meeting & { workgroup: Workgroup } = {
        id: 4,
        workgroupId: 1,
        title: 'New Important Meeting',
        description: 'Discuss project milestones',
        date: new Date(validMeetingData.date),
        type: 'ONLINE',
        observations: 'None',
        agenda: null,
        minutes: null,
        workgroup: mockWorkgroup
    };

    beforeEach(() => {
        // Reset mocks before each test
        prismaMock.workgroup.findUnique.mockReset();
        prismaMock.meeting.create.mockReset();
    });

    it('should create a new meeting and return it', async () => {
      prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup); // Mock workgroup check
      prismaMock.meeting.create.mockResolvedValue(createdMeeting);

      const req = new NextRequest('http://localhost/api/meetings', {
        method: 'POST',
        body: JSON.stringify(validMeetingData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(serializeMeetingDates(createdMeeting));
      expect(prismaMock.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: validMeetingData.workgroupId } });
      expect(prismaMock.meeting.create).toHaveBeenCalledWith({
        data: {
          ...validMeetingData,
          date: new Date(validMeetingData.date) // Prisma expects Date object
        },
        include: { workgroup: true }
      });
    });

    it('should return 400 for invalid input data (Zod validation)', async () => {
      const invalidData = { ...validMeetingData, title: '' }; // Empty title

      const req = new NextRequest('http://localhost/api/meetings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toEqual('Invalid input data');
      expect(data.details).toBeDefined();
      expect(prismaMock.meeting.create).not.toHaveBeenCalled();
    });

    it('should return 404 if related workgroup does not exist', async () => {
        prismaMock.workgroup.findUnique.mockResolvedValue(null); // Simulate workgroup not found

        const req = new NextRequest('http://localhost/api/meetings', {
            method: 'POST',
            body: JSON.stringify(validMeetingData),
            headers: { 'Content-Type': 'application/json' },
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toEqual(`Workgroup with ID ${validMeetingData.workgroupId} not found.`);
        expect(prismaMock.meeting.create).not.toHaveBeenCalled();
    });

    it('should return 500 if creation fails', async () => {
      prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup);
      prismaMock.meeting.create.mockRejectedValue(new Error('Creation failed'));

      const req = new NextRequest('http://localhost/api/meetings', {
        method: 'POST',
        body: JSON.stringify(validMeetingData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create meeting. Please check server logs.' });
    });

     it('should return 409 on unique constraint violation', async () => {
         prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup);
         const prismaError = { code: 'P2002' };
         prismaMock.meeting.create.mockRejectedValue(prismaError);

         const req = new NextRequest('http://localhost/api/meetings', {
             method: 'POST',
             body: JSON.stringify(validMeetingData),
             headers: { 'Content-Type': 'application/json' },
         });

         const response = await POST(req);
         const data = await response.json();

         expect(response.status).toBe(409);
         expect(data).toEqual({ error: 'Meeting creation failed due to constraint violation.' });
     });
  });
});
