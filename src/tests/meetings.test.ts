import { GET, POST } from '@/app/api/meetings/route';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    meeting: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

describe('Meeting API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a list of meetings', async () => {
      const mockMeetings = [{ id: 1, name: 'Meeting 1' }, { id: 2, name: 'Meeting 2' }];
      (prisma.meeting.findMany as jest.Mock).mockResolvedValue(mockMeetings);

      const response = await GET();
      const data = await response.json();

      expect(prisma.meeting.findMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockMeetings);
    });

    it('should return an error if fetching meetings fails', async () => {
      (prisma.meeting.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(prisma.meeting.findMany).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch meetings' });
    });
  });

  describe('POST', () => {
    it('should create a new meeting', async () => {
      const mockMeeting = { id: 3, name: 'New Meeting' };
      (prisma.meeting.create as jest.Mock).mockResolvedValue(mockMeeting);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: 'New Meeting' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(prisma.meeting.create).toHaveBeenCalledWith({
        data: { name: 'New Meeting' },
      });
      expect(response.status).toBe(201);
      expect(data).toEqual(mockMeeting);
    });

    it('should return an error if creating a meeting fails', async () => {
      (prisma.meeting.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: 'New Meeting' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(prisma.meeting.create).toHaveBeenCalledWith({
        data: { name: 'New Meeting' },
      });
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create meeting' });
    });
  });
});