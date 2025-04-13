import { GET, PUT, DELETE } from '@/app/api/meetings/[id]/route';
import { PrismaClient, MeetingType } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

// --- Original Mock Initialization Pattern ---
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
    MeetingType: {
      PRESENTIAL: 'PRESENTIAL',
      ONLINE: 'ONLINE'
    }
  };
});
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Meeting API Endpoints - /meetings/[id]', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
  });

  const createMockMeeting = (id: number, workgroupId: number) => ({
      id,
      workgroupId,
      title: `Meeting ${id}`,
      description: 'Test Description',
      date: new Date(),
      type: MeetingType.PRESENTIAL,
      observations: null,
      agenda: null,
      minutes: null,
  });

  describe('GET', () => {
    it('should return a meeting if found', async () => {
      const meetingId = 1;
      const workgroupId = 1;
      const mockMeeting = createMockMeeting(meetingId, workgroupId);
      prismaMock.meeting.findUnique.mockResolvedValue(mockMeeting as any);

      const response = await GET(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...mockMeeting, date: mockMeeting.date.toISOString() });
      expect(prismaMock.meeting.findUnique).toHaveBeenCalledWith({ where: { id: meetingId } });
      expect(prismaMock.meeting.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if meeting not found', async () => {
      const meetingId = 99;
      prismaMock.meeting.findUnique.mockResolvedValue(null);

      const response = await GET(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Meeting not found' });
      expect(prismaMock.meeting.findUnique).toHaveBeenCalledWith({ where: { id: meetingId } });
      expect(prismaMock.meeting.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
      const meetingId = 1;
      prismaMock.meeting.findUnique.mockRejectedValue(new Error('DB Error'));

      const response = await GET(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch meeting. Please check server logs.' });
      expect(prismaMock.meeting.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT', () => {
    it('should update a meeting', async () => {
      const meetingId = 1;
      const workgroupId = 1;
      const existingMeeting = createMockMeeting(meetingId, workgroupId);
      const updateData = { title: 'Updated Meeting Title', type: MeetingType.ONLINE };
      const updatedMeeting = { ...existingMeeting, ...updateData };

      // prismaMock.meeting.findUnique.mockResolvedValue(existingMeeting as any); // No need if not checked in PUT handler
      prismaMock.meeting.update.mockResolvedValue(updatedMeeting as any);
      (req.json as jest.Mock).mockResolvedValue(updateData);

      const response = await PUT(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...updatedMeeting, date: updatedMeeting.date.toISOString() });
      expect(prismaMock.meeting.update).toHaveBeenCalledWith({ where: { id: meetingId }, data: updateData });
      expect(prismaMock.meeting.update).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if meeting to update not found', async () => {
      const meetingId = 99;
      const updateData = { title: 'Updated Meeting Title' };
      prismaMock.meeting.update.mockRejectedValue({ code: 'P2025' }); // Simulate Prisma not found
      (req.json as jest.Mock).mockResolvedValue(updateData);

      const response = await PUT(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Meeting not found' });
      expect(prismaMock.meeting.update).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
      const meetingId = 1;
      const updateData = { title: 'Updated Meeting Title' };
      prismaMock.meeting.update.mockRejectedValue(new Error('DB Error'));
      (req.json as jest.Mock).mockResolvedValue(updateData);

      const response = await PUT(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update meeting. Please check server logs.' });
      expect(prismaMock.meeting.update).toHaveBeenCalledTimes(1);
    });
    // Add tests for validation errors (Zod)
  });

  describe('DELETE', () => {
    it('should delete a meeting and return 204', async () => {
      const meetingId = 1;
      prismaMock.meeting.delete.mockResolvedValue({} as any);

      const response = await DELETE(req, { params: { id: String(meetingId) } });

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
      expect(prismaMock.meeting.delete).toHaveBeenCalledWith({ where: { id: meetingId } });
      expect(prismaMock.meeting.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if meeting to delete not found', async () => {
      const meetingId = 99;
      prismaMock.meeting.delete.mockRejectedValue({ code: 'P2025' }); // Simulate Prisma not found

      const response = await DELETE(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Meeting not found' });
      expect(prismaMock.meeting.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
      const meetingId = 1;
      prismaMock.meeting.delete.mockRejectedValue(new Error('DB Error'));

      const response = await DELETE(req, { params: { id: String(meetingId) } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete meeting. Please check server logs.' });
      expect(prismaMock.meeting.delete).toHaveBeenCalledTimes(1);
    });
    // Add tests for constraint errors (e.g., linked attendances if onDelete isn't CASCADE)
  });
});
