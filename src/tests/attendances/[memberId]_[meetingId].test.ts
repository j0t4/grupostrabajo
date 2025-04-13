import { GET, PUT, DELETE } from '@/app/api/attendances/[memberId]_[meetingId]/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    attendance: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Attendance API Endpoints', () => {
  const mockRequest = {} as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return an attendance if found', async () => {
      const mockAttendance = { memberId: 1, meetingId: 1, attended: true };
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue(mockAttendance);

      const response = await GET(mockRequest, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendance);
      expect(prisma.attendance.findUnique).toHaveBeenCalledWith({
        where: {
          memberId_meetingId: {
            memberId: 1,
            meetingId: 1,
          },
        },
      });
    });

    it('should return a 404 error if attendance is not found', async () => {
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET(mockRequest, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Attendance not found' });
    });

    it('should return a 500 error if there is a database error', async () => {
      (prisma.attendance.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await GET(mockRequest, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch attendance' });
    });
  });

  describe('PUT', () => {
    it('should update an attendance successfully', async () => {
      const mockAttendance = { memberId: 1, meetingId: 1, attended: true };
      (prisma.attendance.update as jest.Mock).mockResolvedValue(mockAttendance);
      const mockJson = jest.fn().mockResolvedValue({ attended: true });
      const mockRequestWithJson = { json: mockJson } as unknown as Request;

      const response = await PUT(mockRequestWithJson, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendance);
      expect(prisma.attendance.update).toHaveBeenCalledWith({
        where: {
          memberId_meetingId: {
            memberId: 1,
            meetingId: 1,
          },
        },
        data: { attended: true },
      });
    });

    it('should return a 500 error if there is a database error', async () => {
      (prisma.attendance.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      const mockJson = jest.fn().mockResolvedValue({ attended: true });
      const mockRequestWithJson = { json: mockJson } as unknown as Request;

      const response = await PUT(mockRequestWithJson, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update attendance' });
    });
  });

  describe('DELETE', () => {
    it('should delete an attendance successfully', async () => {
      (prisma.attendance.delete as jest.Mock).mockResolvedValue({});

      const response = await DELETE(mockRequest, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Attendance deleted' });
      expect(prisma.attendance.delete).toHaveBeenCalledWith({
        where: {
          memberId_meetingId: {
            memberId: 1,
            meetingId: 1,
          },
        },
      });
    });

    it('should return a 500 error if there is a database error', async () => {
      (prisma.attendance.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await DELETE(mockRequest, { params: { memberId: '1', meetingId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete attendance' });
    });
  });
});