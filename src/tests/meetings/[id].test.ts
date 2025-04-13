import { GET, PUT, DELETE } from '@/app/api/meetings/[id]/route';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

const prismaMock = mockDeep<PrismaClient>();

// Mock the Prisma client import
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockReturnValue(prismaMock),
}));

describe('Meeting API Endpoints', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    req = mockDeep<NextRequest>();
  });

  describe('GET', () => {
    it('should return a meeting if found', async () => {
      const meeting = { id: 1, name: 'Test Meeting' };
      prismaMock.meeting.findUnique.mockResolvedValue(meeting);

      const res = await GET(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(meeting);
      expect(prismaMock.meeting.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return 404 if meeting not found', async () => {
      prismaMock.meeting.findUnique.mockResolvedValue(null);

      const res = await GET(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'Meeting not found' });
    });

    it('should return 500 if there is an error', async () => {
      prismaMock.meeting.findUnique.mockRejectedValue(new Error('Test error'));

      const res = await GET(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch meeting' });
    });
  });

  describe('PUT', () => {
    it('should update a meeting', async () => {
      const updatedMeeting = { id: 1, name: 'Updated Meeting' };
      prismaMock.meeting.update.mockResolvedValue(updatedMeeting);

      req.json.mockResolvedValue({ name: 'Updated Meeting' });

      const res = await PUT(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(updatedMeeting);
      expect(prismaMock.meeting.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Meeting' },
      });
    });

    it('should return 500 if there is an error', async () => {
      prismaMock.meeting.update.mockRejectedValue(new Error('Test error'));
      req.json.mockResolvedValue({ name: 'Updated Meeting' });

      const res = await PUT(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update meeting' });
    });
  });

  describe('DELETE', () => {
    it('should delete a meeting', async () => {
      prismaMock.meeting.delete.mockResolvedValue({} as any); // Mock successful deletion

      const res = await DELETE(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ message: 'Meeting deleted' });
      expect(prismaMock.meeting.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return 500 if there is an error', async () => {
      prismaMock.meeting.delete.mockRejectedValue(new Error('Test error'));

      const res = await DELETE(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete meeting' });
    });
  });
});