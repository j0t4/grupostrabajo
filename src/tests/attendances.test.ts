import { GET, POST } from '@/app/api/attendances/route'; // Use alias
import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

// --- Correct Initialization Order ---
// 1. Declare the mock variable
const mockPrisma = mockDeep<DeepMockProxy<PrismaClient>>();

// 2. Mock the module *using* the declared variable
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Attendances API - /attendances', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(mockPrisma);
    req = mockDeep<NextRequest>();
     // Provide a default URL, can be overridden in specific tests
     Object.defineProperty(req, 'url', {
        value: 'http://localhost/api/attendances',
        writable: true,
    });
  });

  describe('GET', () => {
    it('should return all attendances', async () => {
      const mockAttendances = [
        { memberId: 1, meetingId: 1 },
        { memberId: 2, meetingId: 1 }
      ];
      mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances as any);

      const response = await GET(req); // Pass mock request
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendances);
      expect(mockPrisma.attendance.findMany).toHaveBeenCalledTimes(1);
      // Check default call args including include
      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith({ where: {}, include: { member: true, meeting: true } });
    });

     it('should filter attendances by query parameters', async () => {
       const mockAttendances = [
         { memberId: 1, meetingId: 1 },
       ];
       mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances as any);

       // Mock URL with query params
       Object.defineProperty(req, 'url', {
           value: 'http://localhost/api/attendances?memberId=1&meetingId=1',
           writable: true,
       });

       const response = await GET(req);
       const data = await response.json();

       expect(response.status).toBe(200);
       expect(data).toEqual(mockAttendances);
       expect(mockPrisma.attendance.findMany).toHaveBeenCalledTimes(1);
       expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith({
         where: { memberId: 1, meetingId: 1 },
         include: { member: true, meeting: true }
       });
     });

    it('should return 500 if fetching attendances fails', async () => {
      mockPrisma.attendance.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(req); // Pass mock request
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch attendances. Please check server logs.' });
      expect(mockPrisma.attendance.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new attendance', async () => {
      const newAttendanceInput = { memberId: 2, meetingId: 2 };
      const createdAttendance = { memberId: 2, meetingId: 2 }; // POST returns the created object

      mockPrisma.attendance.create.mockResolvedValue(createdAttendance as any);
      (req.json as jest.Mock).mockResolvedValue(newAttendanceInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdAttendance);
      expect(mockPrisma.attendance.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.attendance.create).toHaveBeenCalledWith({ data: newAttendanceInput });
    });

    it('should return 500 if creating an attendance fails', async () => {
      const newAttendanceInput = { memberId: 2, meetingId: 2 };
      mockPrisma.attendance.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newAttendanceInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create attendance. Please check server logs.' });
      expect(mockPrisma.attendance.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.attendance.create).toHaveBeenCalledWith({ data: newAttendanceInput });
    });

     // Add tests for validation errors (Zod)
     // Add tests for 404 if member/meeting not found
     // Add tests for 409 conflict
  });
});
