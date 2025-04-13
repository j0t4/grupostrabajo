import { GET, POST } from '@/app/api/meetings/route';
import { PrismaClient, MeetingType } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

// --- Alternative Mock Initialization ---
let prismaMock: DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => {
  const mock = mockDeep<PrismaClient>();
  prismaMock = mock;
  return {
    PrismaClient: jest.fn(() => mock),
    MeetingType: { // Include enums used
        PRESENTIAL: 'PRESENTIAL',
        ONLINE: 'ONLINE'
    }
  };
});
// ------------------------------------

jest.unmock('next/server');

describe('Meeting API - /meetings', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
    // Mock nextUrl for GET requests that might parse query params
    Object.defineProperty(req, 'nextUrl', {
        value: new URL('http://localhost/api/meetings'),
        writable: true,
    });
  });

  const createMockMeeting = (id: number, workgroupId: number) => ({
    id,
    workgroupId,
    title: `Meeting ${id}`,
    description: 'Test Desc',
    date: new Date(),
    type: MeetingType.PRESENTIAL,
    observations: null, agenda: null, minutes: null,
  });

  describe('GET', () => {
    it('should return a list of meetings with serialized dates', async () => {
      const mockMeetings = [createMockMeeting(1, 1), createMockMeeting(2, 1)];
      prismaMock.meeting.findMany.mockResolvedValue(mockMeetings as any);

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      const expectedData = mockMeetings.map(m => ({ ...m, date: m.date.toISOString() }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.meeting.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.meeting.findMany).toHaveBeenCalledWith({ where: {} }); // Check default call
    });

    it('should filter meetings by workgroupId', async () => {
        const workgroupId = 1;
        const mockMeetings = [createMockMeeting(1, workgroupId)];
        prismaMock.meeting.findMany.mockResolvedValue(mockMeetings as any);

        // Mock URL with query params
        Object.defineProperty(req, 'nextUrl', {
            value: new URL(`http://localhost/api/meetings?workgroupId=${workgroupId}`),
            writable: true,
        });

        const response = await GET(req);
        const data = await response.json();
        const expectedData = mockMeetings.map(m => ({ ...m, date: m.date.toISOString() }));

        expect(response.status).toBe(200);
        expect(data).toEqual(expectedData);
        expect(prismaMock.meeting.findMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.meeting.findMany).toHaveBeenCalledWith({ where: { workgroupId: workgroupId } });
    });


    it('should return 500 if fetching meetings fails', async () => {
      prismaMock.meeting.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      expect(response.status).toBe(500);
      // Match the specific error message from the route handler
      expect(data).toEqual({ error: 'Failed to fetch meetings. Please check server logs.' });
      expect(prismaMock.meeting.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new meeting and return serialized date', async () => {
      const newMeetingInput = { workgroupId: 1, title: 'New Meeting', type: MeetingType.ONLINE };
      const createdMeeting = { ...createMockMeeting(3, 1), ...newMeetingInput }; // Mock the DB result

      prismaMock.meeting.create.mockResolvedValue(createdMeeting as any);
      (req.json as jest.Mock).mockResolvedValue(newMeetingInput);

      const response = await POST(req);
      const data = await response.json();

      const expectedData = { ...createdMeeting, date: createdMeeting.date.toISOString() };

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(prismaMock.meeting.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.meeting.create).toHaveBeenCalledWith({ data: newMeetingInput });
    });

    it('should return 500 if creating a meeting fails', async () => {
      const newMeetingInput = { workgroupId: 1, title: 'New Meeting' };
      prismaMock.meeting.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newMeetingInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      // Match the specific error message from the route handler
      expect(data).toEqual({ error: 'Failed to create meeting. Please check server logs.' });
      expect(prismaMock.meeting.create).toHaveBeenCalledTimes(1);
    });

    // Add tests for validation errors (Zod)
  });
});
