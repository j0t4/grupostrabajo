import { GET, PUT, DELETE } from '@/app/api/meetings/[id]/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Meeting, MeetingType } from '@prisma/client';

// Helper function to create a mock NextRequest
const createMockRequest = (method: string, body?: any, params?: { id: string }): NextRequest => {
    const url = new URL(`http://localhost/api/meetings/${params?.id ?? '1'}`);
    return new NextRequest(url.toString(), {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
};

// NextResponse.json automatically serializes Date objects, so we need the helper.
const serializeMeeting = (meeting: Meeting | null) => {
  if (!meeting) return null;
  return {
    ...meeting,
    date: meeting.date.toISOString(),
    // Add serialization for other date fields if they exist
  };
};

describe('Meetings API - /api/meetings/[id]', () => {
  const meetingId = 1;
  const mockMeeting: Meeting = {
      id: meetingId,
      workgroupId: 1,
      title: 'Test Meeting 1',
      description: 'Description for meeting 1',
      date: new Date('2024-05-15T10:00:00.000Z'),
      type: 'PRESENTIAL',
      observations: null,
      agenda: null,
      minutes: null,
  };
  // NextResponse.json serializes the date, so we use the helper.
  const expectedMockMeeting = serializeMeeting(mockMeeting);

  const params = { params: { id: String(meetingId) } };
  const nonExistentIdParams = { params: { id: '999' } };
  const invalidIdParams = { params: { id: 'abc' } }; // For routes that validate ID format

  describe('GET /api/meetings/[id]', () => {
      beforeEach(() => {
        prismaMock.meeting.findUnique.mockReset();
      });

      it('should return a specific meeting by ID', async () => {
          prismaMock.meeting.findUnique.mockResolvedValue(mockMeeting);

          const response = await GET(createMockRequest('GET', null, { id: String(meetingId) }), params);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual(expectedMockMeeting);
          expect(prismaMock.meeting.findUnique).toHaveBeenCalledWith({ where: { id: meetingId } });
      });

       it('should return 404 if meeting not found', async () => {
           prismaMock.meeting.findUnique.mockResolvedValue(null);

           const response = await GET(createMockRequest('GET', null, { id: String(nonExistentIdParams.params.id) }), nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(404);
           expect(data).toEqual({ error: 'Meeting not found' });
       });

       // Test for invalid ID format if the route handles it (e.g., returns 400)
       // it('should return 400 for invalid ID format', async () => {
       //     const response = await GET(createMockRequest('GET', null, invalidIdParams), invalidIdParams);
       //     const data = await response.json();
       //     expect(response.status).toBe(400);
       //     expect(data.error).toContain('Invalid ID');
       // });

       it('should return 500 on database error', async () => {
           prismaMock.meeting.findUnique.mockRejectedValue(new Error('Database error'));

           const response = await GET(createMockRequest('GET', null, { id: String(meetingId) }), params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to fetch meeting');
       });
  });

  describe('PUT /api/meetings/[id]', () => {
      const updateData = { title: 'Updated Meeting Title', type: 'ONLINE' as MeetingType };
      const updatedMeeting = { ...mockMeeting, ...updateData };
      // NextResponse.json serializes the date, so use the helper for comparison.
      const expectedUpdatedMeeting = serializeMeeting(updatedMeeting);

      beforeEach(() => {
          prismaMock.meeting.update.mockReset();
      });

      it('should update a meeting and return it', async () => {
          prismaMock.meeting.update.mockResolvedValue(updatedMeeting);

          const req = createMockRequest('PUT', updateData, { id: String(meetingId) });
          const response = await PUT(req, params);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual(expectedUpdatedMeeting);
          expect(prismaMock.meeting.update).toHaveBeenCalledWith({
              where: { id: meetingId },
              data: updateData,
          });
      });

      it('should return 500 if update fails (e.g., meeting not found)', async () => {
           // Prisma update throws P2025 if record not found. The current route returns 500.
           const prismaError = new Error('Record to update not found.');
           // (prismaError as any).code = 'P2025';
           prismaMock.meeting.update.mockRejectedValue(prismaError);

           const req = createMockRequest('PUT', updateData, { id: String(nonExistentIdParams.params.id) });
           const response = await PUT(req, nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data).toEqual({ error: 'Failed to update meeting' });
           // If 404 handling were added: expect(response.status).toBe(404);
      });

       // Add tests for invalid ID format (400) and invalid update data (400) if validation is added

       it('should return 500 on other database error', async () => {
           prismaMock.meeting.update.mockRejectedValue(new Error('Some other database error'));

           const req = createMockRequest('PUT', updateData, { id: String(meetingId) });
           const response = await PUT(req, params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to update meeting');
       });
  });

  describe('DELETE /api/meetings/[id]', () => {
      beforeEach(() => {
          prismaMock.meeting.delete.mockReset();
      });

      it('should delete a meeting and return a success message', async () => {
           // Route returns { message: 'Meeting deleted' } with 200 OK.
           prismaMock.meeting.delete.mockResolvedValue(mockMeeting);

           const req = createMockRequest('DELETE', null, { id: String(meetingId) });
           const response = await DELETE(req, params);
           const data = await response.json();

           expect(response.status).toBe(200); // Check if route returns 200 or 204
           expect(data).toEqual({ message: 'Meeting deleted' });
           expect(prismaMock.meeting.delete).toHaveBeenCalledWith({ where: { id: meetingId } });
      });

      it('should return 500 if meeting to delete not found', async () => {
           // Prisma delete throws P2025 if record not found. Current route returns 500.
           const prismaError = new Error('Record to delete does not exist.');
           // (prismaError as any).code = 'P2025';
           prismaMock.meeting.delete.mockRejectedValue(prismaError);

           const req = createMockRequest('DELETE', null, { id: String(nonExistentIdParams.params.id) });
           const response = await DELETE(req, nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data).toEqual({ error: 'Failed to delete meeting' });
           // If 404 handling were added: expect(response.status).toBe(404);
       });

        // Add tests for invalid ID format (400) and conflicts (409) like foreign key constraints if handled

       it('should return 500 on other database error during delete', async () => {
           prismaMock.meeting.delete.mockRejectedValue(new Error('Database error during delete'));

           const req = createMockRequest('DELETE', null, { id: String(meetingId) });
           const response = await DELETE(req, params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to delete meeting');
       });
  });
});
