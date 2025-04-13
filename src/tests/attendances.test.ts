import { GET, POST } from '@/app/api/attendances/route'; // Use alias
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { NextRequest } from 'next/server';

// --- Original Mock Initialization Pattern ---
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock)
    // No enums needed here unless used directly in the test file
  };
});
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Attendances API - /attendances', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
    // Provide a default URL for GET tests
    Object.defineProperty(req, 'nextUrl', { // Use nextUrl which has searchParams
        value: new URL('http://localhost/api/attendances'),
        writable: true,
    });
  });

  const createMockAttendance = (memberId: number, meetingId: number) => ({
    memberId,
    meetingId,
    attended: true,
    justification: null,
    // Include related data if expected from route
    member: { id: memberId, name: 'Test Member' },
    meeting: { id: meetingId, title: 'Test Meeting' },
  });

  describe('GET', () => {
    it('should return all attendances', async () => {
      const mockAttendances = [
        createMockAttendance(1, 1),
        createMockAttendance(2, 1),
      ];
      prismaMock.attendance.findMany.mockResolvedValue(mockAttendances as any);

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendances);
      expect(prismaMock.attendance.findMany).toHaveBeenCalledTimes(1);
      // Check default call args based on route handler
      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith({ where: {}, include: { member: true, meeting: true } });
    });

    it('should filter attendances by query parameters', async () => {
      const mockAttendances = [createMockAttendance(1, 1)];
      prismaMock.attendance.findMany.mockResolvedValue(mockAttendances as any);

      // Mock URL with query params
      Object.defineProperty(req, 'nextUrl', {
           value: new URL('http://localhost/api/attendances?memberId=1&meetingId=1'),
           writable: true,
       });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendances);
      expect(prismaMock.attendance.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith({
        where: { memberId: 1, meetingId: 1 }, // Ensure params are parsed as numbers
        include: { member: true, meeting: true } // Match include from route
      });
    });

    it('should handle errors during GET', async () => {
      prismaMock.attendance.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch attendances. Please check server logs.' });
      expect(prismaMock.attendance.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new attendance', async () => {
      const newAttendanceInput = { memberId: 2, meetingId: 2, attended: false, justification: 'Sick' };
      const createdAttendance = { ...newAttendanceInput }; // POST might return the input data
      prismaMock.attendance.create.mockResolvedValue(createdAttendance as any);
      (req.json as jest.Mock).mockResolvedValue(newAttendanceInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdAttendance);
      expect(prismaMock.attendance.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.attendance.create).toHaveBeenCalledWith({ data: newAttendanceInput });
    });

    it('should handle errors during POST', async () => {
      const newAttendanceInput = { memberId: 2, meetingId: 2, attended: true };
      prismaMock.attendance.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newAttendanceInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create attendance. Please check server logs.' });
      expect(prismaMock.attendance.create).toHaveBeenCalledTimes(1);
    });

     // Add tests for validation errors (Zod)
     // Add tests for 404 if member/meeting not found
     // Add tests for 409 conflict if attendance already exists
  });
});
