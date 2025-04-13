import { GET, POST } from '../src/app/api/attendances/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const mockPrisma = mockDeep<PrismaClient>();

describe('Attendances API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    it('should return all attendances', async () => {
      const mockAttendances = [{ id: 1, memberId: 1, meetingId: 1, attended: true }];
      (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendances);
      expect(mockPrisma.attendance.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if fetching attendances fails', async () => {
      (mockPrisma.attendance.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch attendances' });
      expect(mockPrisma.attendance.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new attendance', async () => {
      const newAttendance = { memberId: 2, meetingId: 2, attended: false };
      const createdAttendance = { id: 2, ...newAttendance };

      (mockPrisma.attendance.create as jest.Mock).mockResolvedValue(createdAttendance);

      const request = {
        json: async () => newAttendance,
      } as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdAttendance);
      expect(mockPrisma.attendance.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.attendance.create).toHaveBeenCalledWith({ data: newAttendance });
    });

    it('should return 500 if creating an attendance fails', async () => {
      const newAttendance = { memberId: 2, meetingId: 2, attended: false };

      (mockPrisma.attendance.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => newAttendance,
      } as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create attendance' });
      expect(mockPrisma.attendance.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.attendance.create).toHaveBeenCalledWith({ data: newAttendance });
    });
  });
});